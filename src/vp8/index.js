/* eslint-disable @typescript-eslint/no-use-before-define */
import VConsole from 'vconsole';
import '../assets/bootstrap.min';
import '../assets/bootstrap.min.css';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import { getCgi } from '../content';

new VConsole();
const userID = 'sample' + new Date().getTime();
const tokenUrl = 'https://wsliveroom-alpha.zego.im:8282/token';
const publishStreamId = 'webrtc' + new Date().getTime();
const taskID = 'task-' + new Date().getTime();
const mixStreamId = 'mix-' + publishStreamId;
let appID = 96527232;
let server = 'wss://wssliveroom-test.zego.im/ws'; //'wss://wsliveroom' + appID + '-api.zego.im:8282/ws';
let cgiToken = '';
let previewVideo;
let useLocalStreamList = [];
let isPreviewed = false;
let localStream;
let videoCodec = 'H264';
let supportVideoCodec;

({ appID, server, cgiToken } = getCgi(appID, server, cgiToken));
if (cgiToken && tokenUrl == 'https://wsliveroom-alpha.zego.im:8282/token') {
    $.get(cgiToken, rsp => {
        cgiToken = rsp.data;
        console.log(cgiToken);
    });
}

const zg = new ZegoExpressEngine(appID, server);

async function checkAnRun() {
    console.log('sdk version is', zg.getVersion());
    const result = await zg.checkSystemRequirements();

    console.warn('checkSystemRequirements ', result);
    videoCodec = result.videoCodec.VP8 ? 'VP8' : result.videoCodec.H264 ? 'H264' : undefined;
    supportVideoCodec = result.videoCodec.VP8 ? 'VP8' : result.videoCodec.H264 ? 'H264' : undefined;
    $('#videoCodeType option:eq(0)').val(videoCodec ? videoCodec : '');
    !result.videoCodec.H264 && $('#videoCodeType option:eq(1)').attr('disabled', 'disabled');
    !result.videoCodec.VP8 && $('#videoCodeType option:eq(2)').attr('disabled', 'disabled');

    if (!result.webRTC) {
        alert('browser is not support webrtc!!');
        return false;
    } else if (!result.videoCodec.H264 && !result.videoCodec.VP8) {
        alert('browser is not support H264 and VP8');
        return false;
    } else {
        previewVideo = $('#previewVideo')[0];
        start();
    }

    return true;
}

async function start() {
    initSDK();

    $('#createRoom').click(async () => {
        console.warn('videoCodec', $('#videoCodec').val())
        if ($('#videoCodec').val()) {
            videoCodec = $('#videoCodec').val();
        } else {
            videoCodec = supportVideoCodec;
        }
        const extraInfo = JSON.stringify({
            currentVideoCode: videoCodec,
            mixStreamId,
        });
        const loginSuc = await enterRoom();
        loginSuc && (await push({ extraInfo, videoCodec: videoCodec }));
    });

    $('#openRoom').click(async () => {
        if ($('#videoCodec').val()) {
            videoCodec = $('#videoCodec').val();
        } else {
            videoCodec = supportVideoCodec;
        }
        await enterRoom();
    });

    $('#leaveRoom').click(function() {
        logout();
    });
}

function initSDK() {
    enumDevices();
    zg.on('roomStateUpdate', (roomID, state, errorCode) => {
        console.log('roomStateUpdate', roomID, state, errorCode);
    });
    zg.on('publisherStateUpdate', result => {
        console.log(`publisherStateUpdate roomID:${result.streamID}`);
        if (result.state == 'PUBLISHING') {
            console.info(' publish  success');
            mixStream();
        } else if (result.state == 'PUBLISH_REQUESTING') {
            console.info(' publish  retry');
        } else {
            console.error('publish error code ' + result.errorCode);
            // const _msg = stateInfo.error.msg;
            // if (stateInfo.error.msg.indexOf ('server session closed, reason: ') > -1) {
            //         const code = stateInfo.error.msg.replace ('server session closed, reason: ', '');
            //         if (code === '21') {
            //                 _msg = '音频编解码不支持(opus)';
            //         } else if (code === '22') {
            //                 _msg = '视频编解码不支持(H264)'
            //         } else if (code === '20') {
            //                 _msg = 'sdp 解释错误';
            //         }
            // }
            // alert('推流失败,reason = ' + _msg);
        }
    });
    zg.on('playerStateUpdate', result => {
        if (result.state == 'PLAYING') {
            console.info(' play  success');
        } else if (result.state == 'PLAY_REQUESTING') {
            console.info(' play  retry');
        } else {
            console.error('publish error code ' + result.errorCode);
            // const _msg = stateInfo.error.msg;
            // if (stateInfo.error.msg.indexOf ('server session closed, reason: ') > -1) {
            //         const code = stateInfo.error.msg.replace ('server session closed, reason: ', '');
            //         if (code === '21') {
            //                 _msg = '音频编解码不支持(opus)';
            //         } else if (code === '22') {
            //                 _msg = '视频编解码不支持(H264)'
            //         } else if (code === '20') {
            //                 _msg = 'sdp 解释错误';
            //         }
            // }
            // alert('拉流失败,reason = ' + _msg);
        }
    });
    zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
        console.log(`roomStreamUpdate roomID: ${roomID} `);
        if (updateType == 'ADD') {
            for (let i = 0; i < streamList.length; i++) {
                console.info(streamList[i].streamID + ' was added');
                useLocalStreamList.push(streamList[i]);
                $('#memberList').append(
                    '<option value="' + streamList[i].user.userID + '">' + streamList[i].user.userName + '</option>',
                );
                $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));

                const remoteStream = await getRemoteByCodeType(useLocalStreamList[i]);
                const video = $('.remoteVideo video:eq(' + i + ')')[0];
                video.srcObject = remoteStream;
                video.muted = false;
                setTimeout(() => {
                    video.play();
                }, 2000);
            }
        } else if (updateType == 'DELETE') {
            for (let k = 0; k < useLocalStreamList.length; k++) {
                for (let j = 0; j < streamList.length; j++) {
                    if (useLocalStreamList[k].streamID === streamList[j].streamID) {
                        const extraInfoObject = JSON.parse(useLocalStreamList[k].extraInfo);
                        zg.stopPlayingStream(useLocalStreamList[k].streamID);
                        extraInfoObject.mixStreamId && zg.stopPlayingStream(extraInfoObject.mixStreamId);
                        console.info(useLocalStreamList[k].streamID + 'was devared');

                        useLocalStreamList.splice(k, 1);

                        $('.remoteVideo video:eq(' + k + ')').remove();
                        $('#memberList option:eq(' + k + ')').remove();

                        break;
                    }
                }
            }
        }
    });
    zg.on('playQualityUpdate', async (streamID, streamQuality) => {
        console.log(
            `play#${streamID} videoFPS: ${streamQuality.video.videoFPS} videoBitrate: ${streamQuality.video.videoBitrate} audioBitrate: ${streamQuality.audio.audioBitrate}`,
        );
    });

    zg.on('publishQualityUpdate', async (streamID, streamQuality) => {
        console.log(
            `publish#${streamID} videoFPS: ${streamQuality.video.videoFPS} videoBitrate: ${streamQuality.video.videoBitrate} audioBitrate: ${streamQuality.audio.audioBitrate}`,
        );
    });
}

async function enumDevices() {
    const audioInputList = [],
        videoInputList = [];
    const deviceInfo = await zg.enumDevices();

    deviceInfo &&
        deviceInfo.microphones.map((item, index) => {
            if (!item.deviceName) {
                item.deviceName = 'microphone' + index;
            }
            audioInputList.push(' <option value="' + item.deviceID + '">' + item.deviceName + '</option>');
            console.log('microphone: ' + item.deviceName);
            return item;
        });

    deviceInfo &&
        deviceInfo.cameras.map((item, index) => {
            if (!item.deviceName) {
                item.deviceName = 'camera' + index;
            }
            videoInputList.push(' <option value="' + item.deviceID + '">' + item.deviceName + '</option>');
            console.log('camera: ' + item.deviceName);
            return item;
        });

    audioInputList.push('<option value="0">禁止</option>');
    videoInputList.push('<option value="0">禁止</option>');

    $('#audioList').html(audioInputList.join(''));
    $('#videoList').html(videoInputList.join(''));
}

async function mixStream() {
    const streamList = [
        {
            streamID: publishStreamId,
            layout: {
                top: 0,
                left: 0,
                bottom: 480,
                right: 640,
            },
        },
    ];
    console.error('videoCodec', videoCodec);
    const res = await zg.setMixerTaskConfig({
        videoCodec: videoCodec === 'VP8' ? 'h264' : 'vp8',
    });
    console.log('setMixerTaskConfig ', res);
    const result = await zg.startMixerTask({
        taskID,
        inputList: streamList,
        outputList: [
            {
                target: mixStreamId,
            },
        ],
        outputConfig: {
            outputBitrate: 300,
            outputFPS: 15,
            outputWidth: 640,
            outputHeight: 480,
        },
    });
    console.log('startMixerTask ', result.errorCode);
}

async function login(roomId) {
    // 获取token需要客户自己实现，token是对登录房间的唯一验证
    // Obtaining a token needs to be implemented by the customer. The token is the only verification for the login room.
    let token = '';
    //测试用，开发者请忽略
    //Test code, developers please ignore
    if (cgiToken) {
        token = await $.get(tokenUrl, { app_id: appID, id_name: userID, cgi_token: cgiToken });
        //测试用结束
        //Test code end
    } else {
        token = await $.get('https://wsliveroom-alpha.zego.im:8282/token', { app_id: appID, id_name: userID });
    }
    return await zg.loginRoom(roomId, token, { userID, userName: userID });
}

async function enterRoom() {
    const roomId = $('#roomId').val();
    if (!roomId) {
        alert('roomId is empty');
        return false;
    }
    return await login(roomId);
}

async function logout() {
    console.info('leave room  and close stream');

    // 停止推流
    // stop publishing
    if (isPreviewed) {
        await zg.stopMixerTask(taskID);
        zg.stopPublishingStream(publishStreamId);
        zg.destroyStream(localStream);
        isPreviewed = false;
        previewVideo.srcObject = null;
    }

    // 停止拉流
    // stop playing stream
    for (let i = 0; i < useLocalStreamList.length; i++) {
        zg.stopPlayingStream(useLocalStreamList[i].streamID);
    }

    // 清空页面
    // clear page
    useLocalStreamList = [];
    $('.remoteVideo').html('');

    //退出登录
    //logout
    const roomId = $('#roomId').val();
    zg.logoutRoom(roomId);
}

async function getRemoteByCodeType(stream) {
    const extraInfo = stream.extraInfo;
    let streamId = stream.streamID;
    let _stream   = null;
    if (extraInfo) {
        const extraInfoObject = JSON.parse(extraInfo);
        console.error('v ', extraInfoObject, videoCodec);
        if (extraInfoObject.currentVideoCode !== videoCodec) {
            streamId = extraInfoObject.mixStreamId;
            extraInfoObject.currentVideoCode = videoCodec;
            _stream = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const $stream = await zg.startPlayingStream(streamId, { videoCodec: videoCodec });
                    resolve($stream);
                }, 2000);
            });
        } else {
            _stream = await zg.startPlayingStream(streamId, { videoCodec: videoCodec });
        }
    }
    return _stream;
}

async function push(publishOption) {
    console.warn('createStream', $('#audioList').val(), $('#videoList').val());
    localStream = await zg.createStream({
        camera: {
            video: $('#videoList').val() === '0' ? false : true,
            audio: $('#audioList').val() === '0' ? false : true,
            audioInput: $('#audioList').val(),
            videoInput: $('#videoList').val(),
        },
    });
    previewVideo.srcObject = localStream;
    isPreviewed = true;
    const result = zg.startPublishingStream(publishStreamId, localStream, publishOption);
    console.log('publish stream' + publishStreamId, result, publishOption);
}

function setConfig(param) {
    param.appID && (appID = param.appID);
}

$(async () => {
    await checkAnRun();
});

// $(window).on('unload', function() {
//     logout();
// });
