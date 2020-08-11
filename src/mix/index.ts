import '../common';
import { checkAnRun, logout, publishStreamId, useLocalStreamList, zg } from '../common';
import { getBrowser } from '../assets/utils';
import flvjs from 'flv.js';

$(async () => {
    await checkAnRun();
    $('');
    const taskID = 'task-' + new Date().getTime();
    let taskID2: string;
    const mixStreamID = 'mixwebrtc-' + new Date().getTime();
    const mixVideo = $('#mixVideo')[0] as HTMLVideoElement;
    const mixVideo2 = $('#mixVideo2')[0] as HTMLVideoElement;
    let hlsUrl: string;
    let flvPlayer: flvjs.Player | null = null;
    $('#mixStream').click(async () => {
        try {
            const streamList = [
                {
                    streamID: publishStreamId,
                    layout: {
                        top: 0,
                        left: 0,
                        bottom: 240,
                        right: 320,
                    },
                },
            ];
            if (useLocalStreamList.length !== 0) {
                streamList.push({
                    streamID: useLocalStreamList[0].streamID,
                    layout: {
                        top: 240,
                        left: 0,
                        bottom: 480,
                        right: 320,
                    },
                });
            }

            const res = await zg.startMixerTask({
                taskID,
                inputList: streamList,
                outputList: [
                    mixStreamID,
                    // {
                    //     target: mixStreamID,
                    //     // target: 'rtmp://test.aliyun.zego.im/livestream/zegodemo',
                    // },
                ],
                outputConfig: {
                    outputBitrate: 300,
                    outputFPS: 15,
                    outputWidth: 320,
                    outputHeight: 480,
                },
            });
            if (res.errorCode == 0) {
                $('#stopMixStream').removeAttr('disabled');
                const result = JSON.parse(res.extendedData).mixerOutputList;
                if (
                    navigator.userAgent.indexOf('iPhone') !== -1 &&
                    getBrowser() == 'Safari' &&
                    result &&
                    result[0].hlsURL
                ) {
                    hlsUrl = result[0].hlsURL.replace('http', 'https');
                    mixVideo.src = hlsUrl;
                } else if (result && result[0].flvURL) {
                    const flvUrl = result[0].flvURL.replace('http', 'https');
                    console.log('mixStreamId: ' + mixStreamID);
                    console.log('mixStreamUrl:' + flvUrl);
                    alert('混流开始。。。');
                    if (flvjs.isSupported()) {
                        flvPlayer = flvjs.createPlayer({
                            type: 'flv',
                            url: flvUrl,
                        });
                        flvPlayer.attachMediaElement(mixVideo);
                        flvPlayer.load();
                    }
                }
                mixVideo.muted = false;
            }

            $('#mixVideo').css('display', '');
        } catch (err) {
            alert('混流失败。。。');
            console.error('err: ', err);
        }
    });

    $('#mixStreamOnlyAudio').click(async () => {
        try {
            const streamList = [
                {
                    streamID: publishStreamId,
                    contentType: 'AUDIO',
                    layout: {
                        top: 0,
                        left: 0,
                        bottom: 1,
                        right: 1,
                    },
                },
            ];
            if (useLocalStreamList.length !== 0) {
                streamList.push({
                    streamID: useLocalStreamList[0].streamID,
                    contentType: 'AUDIO',
                    layout: {
                        top: 0,
                        left: 0,
                        bottom: 1,
                        right: 1,
                    },
                });
            }
            taskID2 = 'task-' + new Date().getTime();
            const res = await zg.startMixerTask({
                taskID: taskID2,
                inputList: streamList,
                outputList: [
                    mixStreamID,
                    // {
                    //     target: mixStreamID,
                    //     // target: 'rtmp://test.aliyun.zego.im/livestream/zegodemo',
                    // },
                ],
                outputConfig: {
                    outputBitrate: 1,
                    outputFPS: 1,
                    outputWidth: 10,
                    outputHeight: 10,
                },
            });
            if (res.errorCode == 0) {
                $('#stopMixStream').removeAttr('disabled');
                const result = JSON.parse(res.extendedData).mixerOutputList;
                if (
                    navigator.userAgent.indexOf('iPhone') !== -1 &&
                    getBrowser() == 'Safari' &&
                    result &&
                    result[0].hlsURL
                ) {
                    hlsUrl = result[0].hlsURL.replace('http', 'https');
                    mixVideo2.src = hlsUrl;
                } else if (result && result[0].flvURL) {
                    const flvUrl = result[0].flvURL.replace('http', 'https');
                    console.log('mixStreamId: ' + mixStreamID);
                    console.log('mixStreamUrl:' + flvUrl);
                    alert('混流开始。。。');
                    if (flvjs.isSupported()) {
                        flvPlayer = flvjs.createPlayer({
                            type: 'flv',
                            url: flvUrl,
                        });
                        flvPlayer.attachMediaElement(mixVideo2);
                        flvPlayer.load();
                    }
                }
                mixVideo2.muted = false;
            }

            $('#mixVideo2').css('display', '');
        } catch (err) {
            alert('混流失败。。。');
            console.error('err: ', err);
        }
    });
    $('#stopMixStream').click(async () => {
        try {
            await zg.stopMixerTask(taskID);
            alert('停止混流成功。。。');
            if (flvPlayer) {
                flvPlayer.destroy();
                flvPlayer = null;
            }
            console.log('stopMixStream success: ');
            $('#stopMixStream').attr('disabled', 'disabled');
            $('#mixVideo').css('display', 'none');
            $('#mixVideo2').css('display', 'none');
        } catch (err) {
            alert('停止混流失败。。。');
            console.log('stopMixStream err: ', err);
        }
    });

    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        if (flvPlayer) {
            flvPlayer.destroy();
            flvPlayer = null;
        }
        mixVideo.src = '';
        $('#mixVideo').css('display', 'none');
        mixVideo2.src = '';
        $('#mixVideo2').css('display', 'none');

        logout();
    });
});
