import '../common';
import { checkAnRun, logout, publishStreamId, useLocalStreamList, zg } from '../common';
import { getBrowser } from '../assets/utils';
import flvjs from 'flv.js';

$(async () => {
    await checkAnRun();
    $('');
    const taskID = 'task-' + new Date().getTime();
    const mixStreamID = 'mixwebrtc-' + new Date().getTime();
    const mixVideo = $('#mixVideo')[0];
    let hlsUrl;
    let flvPlayer = null;

    let taskID2;
    let mixStreamID2;
    const mixVideo2 = $('#mixVideo2')[0];
    let hlsUrl2;
    let flvPlayer2 = null;
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
                },
            ];
            if (useLocalStreamList.length !== 0) {
                streamList.push({
                    streamID: useLocalStreamList[0].streamID,
                    contentType: 'AUDIO',
                });
            }
            taskID2 = 'task-' + new Date().getTime();
            mixStreamID2 = 'mixwebrtc-' + new Date().getTime();
            const res = await zg.startMixerTask({
                taskID: taskID2,
                inputList: streamList,
                outputList: [
                    mixStreamID2,
                    // {
                    //     target: mixStreamID,
                    //     // target: 'rtmp://test.aliyun.zego.im/livestream/zegodemo',
                    // },
                ],
                // outputConfig: {
                //     outputBitrate: 1,
                //     outputFPS: 1,
                //     outputWidth: 10,
                //     outputHeight: 10,
                // },
            });
            if (res.errorCode == 0) {
                $('#stopMixStream2').removeAttr('disabled');
                const result = JSON.parse(res.extendedData).mixerOutputList;
                if (
                    navigator.userAgent.indexOf('iPhone') !== -1 &&
                    getBrowser() == 'Safari' &&
                    result &&
                    result[0].hlsURL
                ) {
                    hlsUrl2 = result[0].hlsURL.replace('http', 'https');
                    mixVideo2.src = hlsUrl2;
                } else if (result && result[0].flvURL) {
                    const flvUrl = result[0].flvURL.replace('http', 'https');
                    console.log('mixStreamId: ' + mixStreamID);
                    console.log('mixStreamUrl:' + flvUrl);
                    alert('混流开始。。。');
                    if (flvjs.isSupported()) {
                        flvPlayer2 = flvjs.createPlayer({
                            type: 'flv',
                            url: flvUrl,
                            hasVideo: false
                        });
                        flvPlayer2.attachMediaElement(mixVideo2);
                        flvPlayer2.load();
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
        } catch (err) {
            alert('停止混流失败。。。');
            console.log('stopMixStream err: ', err);
        }
    });
    $('#stopMixStream2').click(async () => {
        try {
            await zg.stopMixerTask(taskID2);
            alert('停止混流成功。。。');
            if (flvPlayer2) {
                flvPlayer2.destroy();
                flvPlayer2 = null;
            }
            console.log('stopMixStream success: ');
            $('#stopMixStream2').attr('disabled', 'disabled');
            $('#mixVideo2').css('display', 'none');
        } catch (err) {
            alert('停止混流失败。。。');
            console.log('stopMixStream err: ', err);
        }
    });

    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function () {
        if (flvPlayer) {
            flvPlayer.destroy();
            flvPlayer = null;
        }
        mixVideo.src = '';
        $('#mixVideo').css('display', 'none');
        if (flvPlayer2) {
            flvPlayer2.destroy();
            flvPlayer2 = null;
        }
        mixVideo2.src = '';
        $('#mixVideo2').css('display', 'none');

        logout();
    });
});
