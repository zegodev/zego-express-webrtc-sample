import VConsole from 'vconsole';
import './assets/bootstrap.min';
import './assets/bootstrap.min.css';
import { ZegoClient } from 'webrtc-zego-express';
import { StreamInfo, WebQualityStats, webPublishOption, ERRO } from 'webrtc-zego-express/sdk/common/zego.entity';
import { userInfo } from 'os';

new VConsole();
let zg: ZegoClient;
let appId = 1739272706;
let server = 'wss://webliveroom-test.zego.im/ws'; //'wss://wsliveroom' + appId + '-api.zego.im:8282/ws';
const userId: string = 'sample' + new Date().getTime();
let cgiToken = '';
const tokenUrl = 'https://wsliveroom-demo.zego.im:8282/token';
let previewVideo: HTMLVideoElement;
let useLocalStreamList: StreamInfo[] = [];
let isPreviewed = false;
const publishStreamId = 'webrtc' + new Date().getTime();

let localStream: MediaStream;

// eslint-disable-next-line prefer-const
zg = new ZegoClient(appId, server, userId);

// 测试用代码，开发者请忽略
if (location.search) {
    const arrConfig = location.search.substr(1).split('&');
    arrConfig.forEach(function(item) {
        const key = item.split('=')[0],
            value = item.split('=')[1];

        if (key == 'appid') {
            appId = Number(value);
        }

        if (key == 'server') {
            server = decodeURIComponent(value);
        }

        if (key == 'cgi_token') {
            cgiToken = decodeURIComponent(value);
        }
    });

    if (cgiToken && tokenUrl == 'https://wsliveroom-demo.zego.im:8282/token') {
        $.get(cgiToken, rsp => {
            cgiToken = rsp.data;
            console.log(cgiToken);
        });
    }
}
// 测试用代码 end

async function checkAnRun(checkScreen?: boolean) {
    console.log('sdk version is', zg.getCurrentVersion());
    const result: {
        webRTC: boolean;
        capture: boolean;
        videoDecodeType: {
            H264: boolean;
            H265: boolean;
            VP8: boolean;
            VP9: boolean;
        };
        screenSharing: boolean;
    } = (await zg.detectRTC()) as any;

    !result.videoDecodeType.H264 && $('#videoCodeType option:eq(1)').attr('disabled', 'disabled');
    !result.videoDecodeType.VP8 && $('#videoCodeType option:eq(2)').attr('disabled', 'disabled');

    if (!result.webRTC) {
        alert('browser is not support webrtc!!');
        return false;
    } else if (!result.videoDecodeType.H264 && !result.videoDecodeType.VP8) {
        alert('browser is not support H264 and VP8');
        return false;
    } else if (checkScreen && !result.screenSharing) {
        alert('browser is not support screenSharing');
    } else {
        previewVideo = $('#previewVideo')[0] as HTMLVideoElement;
        start();
    }
}

async function start() {
    initSDK();

    zg.config({ userUpdate: true });

    $('#createRoom').click(async () => {
        const loginSuc = await enterRoom();
        loginSuc && (await push());
    });

    $('#openRoom').click(async () => {
        await enterRoom();
    });

    $('#leaveRoom').click(function() {
        logout();
    });
}

function initSDK() {
    enumDevices();
    zg.on('roomStateUpdate', (state, error: ERRO) => {
        console.log('roomStateUpdate', state, error.code, error.msg);
    });
    zg.on('roomUserUpdate', (roomID, updateType, userInfo) => {
        console.warn(`room ${roomID} user ${updateType ? 'added' : 'left'} `, JSON.stringify(userInfo));
    });
    zg.on('publishStateUpdate', stateInfo => {
        if (stateInfo.type == 0) {
            console.info(' publish  success');
        } else if (stateInfo.type == 2) {
            console.info(' publish  retry');
        } else {
            console.error('publish error ' + stateInfo.error.msg);
            const _msg = stateInfo.error.msg;
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
            alert('推流失败,reason = ' + _msg);
        }
    });
    zg.on('playStateUpdate', stateInfo => {
        if (stateInfo.type == 0) {
            console.info(' play  success');
        } else if (stateInfo.type == 2) {
            console.info(' play  retry');
        } else {
            console.error('publish error ' + stateInfo.error.msg);
            const _msg = stateInfo.error.msg;
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
            alert('拉流失败,reason = ' + _msg);
        }
    });
    zg.on('roomStreamUpdate', async (type, streamList) => {
        if (type == 1) {
            for (let i = 0; i < streamList.length; i++) {
                console.info(streamList[i].streamID + ' was added');
                useLocalStreamList.push(streamList[i]);

                $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));

                const remoteStream = await zg.startPlayingStream(streamList[i].streamID);
                const video = $('.remoteVideo video:last')[0] as HTMLVideoElement;
                video.srcObject = remoteStream;
                video.muted = false;
            }
        } else if (type == 0) {
            for (let k = 0; k < useLocalStreamList.length; k++) {
                for (let j = 0; j < streamList.length; j++) {
                    if (useLocalStreamList[k].streamID === streamList[j].streamID) {
                        zg.stopPlayingStream(useLocalStreamList[k].streamID);

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

    zg.on('playQualityUpdate', async streamQuality => {
        console.log(
            `play#${streamQuality.streamID} videoFPS: ${streamQuality.video.videoFPS} videoBitrate: ${streamQuality.video.videoBitrate} audioBitrate: ${streamQuality.audio.audioBitrate}`,
        );
    });

    zg.on('publishQualityUpdate', async streamQuality => {
        console.log(
            `publish#${streamQuality.streamID} videoFPS: ${streamQuality.video.videoFPS} videoBitrate: ${streamQuality.video.videoBitrate} audioBitrate: ${streamQuality.audio.audioBitrate}`,
        );
    });
}

async function enumDevices() {
    const audioInputList: string[] = [],
        videoInputList: string[] = [];
    const deviceInfo = await zg.enumDevices();

    deviceInfo &&
        deviceInfo.microphones.map((item, index) => {
            if (!item.label) {
                item.label = 'microphone' + index;
            }
            audioInputList.push(' <option value="' + item.deviceID + '">' + item.label + '</option>');
            console.log('microphone: ' + item.label);
            return item;
        });

    deviceInfo &&
        deviceInfo.cameras.map((item, index) => {
            if (!item.label) {
                item.label = 'camera' + index;
            }
            videoInputList.push(' <option value="' + item.deviceID + '">' + item.label + '</option>');
            console.log('camera: ' + item.label);
            return item;
        });

    audioInputList.push('<option value="0">禁止</option>');
    videoInputList.push('<option value="0">禁止</option>');

    $('#audioList').html(audioInputList.join(''));
    $('#videoList').html(videoInputList.join(''));
}

async function login(roomId: string): Promise<boolean> {
    // 获取token需要客户自己实现，token是对登录房间的唯一验证
    let token = '';
    //测试用，开发者请忽略
    if (cgiToken) {
        const res = await $.get(tokenUrl, { app_id: appId, id_name: userId, cgi_token: cgiToken });
        token = res.data;
        //测试用结束
    } else {
        token = await $.get('https://wsliveroom-alpha.zego.im:8282/token', { app_id: appId, id_name: userId });
    }
    return await zg.login(roomId, token);
}

async function enterRoom(): Promise<boolean> {
    const roomId: string = $('#roomId').val() as string;
    if (!roomId) {
        alert('roomId is empty');
        return false;
    }
    await login(roomId);

    return true;
}

async function logout() {
    console.info('leave room  and close stream');

    // 停止推流
    if (isPreviewed) {
        zg.stopPublishingStream(publishStreamId);
        zg.destroyLocalStream(localStream);
        isPreviewed = false;
    }

    // 停止拉流
    for (let i = 0; i < useLocalStreamList.length; i++) {
        zg.stopPlayingStream(useLocalStreamList[i].streamID);
    }

    // 清空页面
    useLocalStreamList = [];
    $('.remoteVideo').html('');

    //退出登录
    zg.logout();
}

async function push(publishOption?: webPublishOption) {
    localStream = await zg.createLocalStream();
    previewVideo.srcObject = localStream;
    isPreviewed = true;
    const result = zg.startPublishingStream(publishStreamId, localStream, publishOption);
    console.log('publish stream' + publishStreamId, result);
}

export { zg, publishStreamId, checkAnRun, useLocalStreamList, logout, enterRoom, push };
