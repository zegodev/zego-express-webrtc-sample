import VConsole from 'vconsole';
import '../assets/bootstrap.min';
import '../assets/bootstrap.min.css';
import { ZegoClient } from 'webrtc-zego-express';
import { StreamInfo, WebQualityStats, webPublishOption, ERRO } from 'webrtc-zego-express/sdk/common/zego.entity';
import { ZegoVideoDecodeType } from 'webrtc-zego-express/types';
import { addListener } from 'cluster';

new VConsole();
let appId = 96527232;
const server ='wss://wssliveroom-test.zego.im/ws'; //'wss://wsliveroom' + appId + '-api.zego.im:8282/ws';
const userId: string = 'sample' + new Date().getTime();
let previewVideo: HTMLVideoElement;
let useLocalStreamList: StreamInfo[] = [];
let isPreviewed = false;
const publishStreamId = 'webrtc' + new Date().getTime();
let localStream: MediaStream;
const taskID = 'task-' + new Date().getTime();
const mixStreamId = 'mix-' + publishStreamId;
let videoDecodeType: ZegoVideoDecodeType | undefined = 'H264';

const zg = new ZegoClient(appId, server, userId);

async function checkAnRun(): Promise<boolean> {
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
    videoDecodeType = result.videoDecodeType.VP8 ? 'VP8' : result.videoDecodeType.H264 ? 'H264' : undefined;
    $('#videoCodeType option:eq(0)').val(videoDecodeType ? videoDecodeType : '');
    !result.videoDecodeType.H264 && $('#videoCodeType option:eq(1)').attr('disabled', 'disabled');
    !result.videoDecodeType.VP8 && $('#videoCodeType option:eq(2)').attr('disabled', 'disabled');

    if (!result.webRTC) {
        alert('browser is not support webrtc!!');
        return false;
    } else if (!result.videoDecodeType.H264 && !result.videoDecodeType.VP8) {
        alert('browser is not support H264 and VP8');
        return false;
    } else {
        previewVideo = $('#previewVideo')[0] as HTMLVideoElement;
        start();
    }

    return true;
}

async function start() {
    initSDK();

    $('#createRoom').click(async () => {
        if ($('#videoDecodeType').val()) {
            videoDecodeType = $('#videoDecodeType').val() as ZegoVideoDecodeType;
        }
        const extraInfo = JSON.stringify({
            currentVideoCode: videoDecodeType,
            mixStreamId,
        });
        const loginSuc = await enterRoom();
        loginSuc && (await push({ extraInfo, videoDecodeType }));
    });

    $('#openRoom').click(async () => {
        if ($('#videoDecodeType').val()) {
            videoDecodeType = $('#videoDecodeType').val() as ZegoVideoDecodeType;
        }
        await enterRoom();
    });

    $('#leaveRoom').click(function() {
        logout();
    });
}

function initSDK() {
    enumDevices();
    zg.on('roomStateUpdate', (state: string, error: ERRO) => {
        console.log('roomStateUpdate', state, error.code, error.msg);
    });
    zg.on('publishStateUpdate', stateInfo => {
        if (stateInfo.type == 0) {
            console.info(' publish  success');
            mixStream();
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
                useLocalStreamList.push(streamList[i] as StreamInfo);
                $('#memberList').append(
                    '<option value="' + streamList[i].userID + '">' + streamList[i].userName + '</option>',
                );
                $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));

                const remoteStream = await getRemoteByCodeType(useLocalStreamList[i]);
                const video = $('.remoteVideo video:eq(' + i + ')')[0] as HTMLVideoElement;
                video.srcObject = remoteStream;
                video.muted = false;
            }
        } else if (type == 0) {
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
    const [result] = await zg.startMixStream({
        taskID,
        inputList: streamList,
        outputList: [
            {
                streamID: mixStreamId,
                outputUrl: '',
                outputBitrate: 300 * 1000,
                outputFps: 15,
                outputWidth: 640,
                outputHeight: 480,
            },
        ],
        advance: {
            videoCodec: videoDecodeType === 'VP8' ? 'h264' : 'vp8',
        },
    });
}

async function login(roomId: string): Promise<boolean> {
    // 获取token需要客户自己实现，token是对登录房间的唯一验证
    const token = await $.get('https://wsliveroom-alpha.zego.im:8282/token', { app_id: appId, id_name: userId });
    return await zg.login(roomId, token);
}

async function enterRoom(): Promise<boolean> {
    const roomId: string = $('#roomId').val() as string;
    if (!roomId) {
        alert('roomId is empty');
        return false;
    }
    return await login(roomId);
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

async function getRemoteByCodeType(stream: StreamInfo): Promise<MediaStream | null> {
    const extraInfo = stream.extraInfo;
    let streamId = stream.streamID;
    let _stream: MediaStream | null = null;
    if (extraInfo) {
        const extraInfoObject: any = JSON.parse(extraInfo);
        if (extraInfoObject.currentVideoCode !== videoDecodeType) {
            streamId = extraInfoObject.mixStreamId;
            extraInfoObject.currentVideoCode = videoDecodeType;
            _stream = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const $stream = await zg.startPlayingStream(streamId, { videoDecodeType });
                    resolve($stream);
                }, 2000);
            });
        } else {
            _stream = await zg.startPlayingStream(streamId, { videoDecodeType });
        }
    }
    return _stream;
}

async function push(publishOption?: webPublishOption) {
    localStream = await zg.createLocalStream();
    previewVideo.srcObject = localStream;
    isPreviewed = true;
    const result = zg.startPublishingStream(publishStreamId, localStream, publishOption);
    console.log('publish stream' + publishStreamId, result);
}

function setConfig(param: { appId?: number }) {
    param.appId && (appId = param.appId);
}

$(async () => {
    await checkAnRun();
});

$(window).on('unload',function () {
  logout();
});
