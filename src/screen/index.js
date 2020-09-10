import {
    checkAnRun,
    supportScreenSharing,
    logout,
    publishStreamId,
    zg,
    loginRoom,
    previewVideo,
    enterRoom,
    publishType
} from '../common';
import { getBrowser } from '../assets/utils';

$(async () => {
    await checkAnRun(true);
    console.log('supportScreenSharing', supportScreenSharing);
    if (!supportScreenSharing) {
        $('#screenShot').attr('disabled', 'disabled');
        $('#stopScreenShot').attr('disabled', 'disabled');
    }
    let screenStreamList= [];
    let screenCount = 0;
    let screenStream;
    let videoType = 'camera';
    let screenStreamVideoTrack;
    let cameraStreamVideoTrack;
    let cameraStreamAudioTrack;
    let previewStream;
    let screendStream;
    let externalStream;
    let externalStreamVideoTrack;
    let externalStreamAudioTrack;
    let previewed = false;
    const publishStreamID = 'web-' + new Date().getTime();

    const browser = getBrowser();

    const stopScreenShot = (screenStream)=> {
        zg.stopPublishingStream(screenStream.streamId);
        $(`#screenList option[value='${screenStream.streamId}']`).remove();

        zg.destroyStream(screenStream.stream);
        console.log($(`#${screenStream.streamId}`));
        ($(`#${screenStream.streamId}`)[0]).srcObject = null;
        $(`#${screenStream.streamId}`).remove();
        screenStreamList = screenStreamList.filter(item => item !== screenStream);
        console.log(`screenStreamList `, screenStreamList);
    };

    const stopScreen = () => {
        if (screendStream) {
            zg.destroyStream(screendStream);
            screendStream = null;
            screenStreamVideoTrack && screenStreamVideoTrack.stop();
            screenStreamVideoTrack = null;
        }
    }
    const stopExternal = () => {
        if (externalStream) {
            zg.destroyStream(externalStream);
            externalStream = null;
            externalStreamVideoTrack && externalStreamVideoTrack.stop();
            externalStreamVideoTrack = null;
            externalStreamAudioTrack && externalStreamAudioTrack.stop();
            externalStreamAudioTrack = null;
        }
    }
    // 点击系统停止共享
    zg.on('screenSharingEnded', (stream)=> {
        console.warn('screen sharing end',videoType );
        const _stopScreenStream = screenStreamList.find(screenStream => screenStream.stream == stream);
        _stopScreenStream && stopScreenShot(_stopScreenStream);
        if (stream === screendStream) {
            console.warn('stop');
            videoType === 'screen' && zg.mutePublishStreamVideo(previewVideo.srcObject, true)
            stopScreen();
        }
    });

    $('#enterRoom').click(async () => {
        let loginSuc = false;
        try {
            loginSuc = await enterRoom();
            if (loginSuc) {
                previewStream = await zg.createStream({
                    camera: {
                        audioInput: $('#audioList').val(),
                        videoInput: $('#videoList').val(),
                        video: $('#videoList').val() === '0' ? false : true,
                        audio: $('#audioList').val() === '0' ? false : true,
                    },
                });
                previewVideo.srcObject = previewStream;
                previewVideo.controls = true;
                previewed = true;
                videoType = 'camera';
            }
        } catch (error) {
            console.error(error);
        }
    });
    $('#publish').click(() => {
        const result = zg.startPublishingStream(publishStreamID, previewStream);
        console.log('publish stream' + publishStreamID, result);
    });
    $('#replaceScreenShot').click(async function() {
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        console.log(publishType);
        if (publishType == 'Audio' || $('#videoList').val() === '0') {
            alert('stream is only contain audio');
            return;
        }
        if (!screendStream) {
            screendStream = await zg.createStream({
                screen: true,
            });
            screenStreamVideoTrack = screendStream.getVideoTracks()[0];
            console.log('cameraStreamVideoTrack', cameraStreamVideoTrack);
            !cameraStreamVideoTrack && (cameraStreamVideoTrack = previewVideo.srcObject.getVideoTracks()[0] && previewVideo.srcObject.getVideoTracks()[0].clone());
        }

        zg.replaceTrack(previewVideo.srcObject, screenStreamVideoTrack)
            .then(res => {
                console.warn('replaceTrack success');
                videoType = 'screen';
            })
            .catch(err => console.error(err));
    });
    $('#replaceCamera').click(async function() {
        if (!previewVideo.srcObject || !cameraStreamVideoTrack) {
            alert('先创建流及屏幕共享');
            return;
        }
        cameraStreamVideoTrack && zg.replaceTrack(previewVideo.srcObject, cameraStreamVideoTrack)
            .then(res => {
                console.warn('replaceTrack success');
                videoType = 'camera';
            })
            .catch(err => console.error(err));
    });
    $('#replaceExternalVideo').click(async function() {
        if (browser == 'Safari') {
            alert('Safari do not support');
            return;
        }
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        console.log(publishType);
        if (publishType == 'Audio' || $('#videoList').val() === '0') {
            alert('stream is only contain audio');
            return;
        }
        if (!externalStream) {
            externalStream = await zg.createStream({
                custom: {
                    source: $('#customVideo')[0],
                }
            });
        }
        if (!externalStreamVideoTrack) {
            externalStreamVideoTrack = externalStream.getVideoTracks()[0];
            console.log('externalStreamVideoTrack', cameraStreamVideoTrack);
            !cameraStreamVideoTrack && (cameraStreamVideoTrack = previewVideo.srcObject.getVideoTracks()[0] && previewVideo.srcObject.getVideoTracks()[0].clone());
        }

        zg.replaceTrack(previewVideo.srcObject, externalStreamVideoTrack)
            .then(res => {
                console.warn('replaceTrack success');
                videoType = 'external';
            })
            .catch(err => console.error(err));
    });
    $('#replaceMicro').click(async function() {
        if (!previewVideo.srcObject) {
            alert('先创建流');
            return;
        }
        if (!cameraStreamAudioTrack) {
            alert('当前是麦克风');
            return;
        }
        cameraStreamAudioTrack && zg.replaceTrack(previewVideo.srcObject, cameraStreamAudioTrack)
            .then(res => console.warn('replaceTrack success'))
            .catch(err => console.error(err));
    });
    $('#replaceExternalAudio').click(async function() {
        if (browser == 'Safari') {
            alert('Safari do not support');
            return;
        }
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        console.log(publishType);
        if (publishType == 'Video' || $('#audioList').val() === '0') {
            alert('stream is only contain video');
            return;
        }
        if (!externalStream) {
            externalStream = await zg.createStream({
                custom: {
                    source: $('#customVideo')[0],
                }
            });
        }
        if (!externalStreamAudioTrack) {
            externalStreamAudioTrack = externalStream.getAudioTracks()[0];
            console.log('externalStreamAudioTrack', externalStreamAudioTrack);
            !cameraStreamAudioTrack && (cameraStreamAudioTrack = previewVideo.srcObject.getAudioTracks()[0]);
        }

        zg.replaceTrack(previewVideo.srcObject, externalStreamAudioTrack)
            .then(res => console.warn('replaceTrack success'))
            .catch(err => console.error(err));
    });
    $('#screenShot').click(async () => {
        if (!loginRoom) {
            alert('请先登录房间');
            return;
        }
        try {
            const screenStream = await zg.createStream({
                screen: {
                    //@ts-ignore
                    audio: $('#isScreenAudio').val() == 'yes' ? true : false,
                    videoQuality: 1,
                },
            });
            const screenStreamId = publishStreamId + 'screen' + screenCount++;
            $('.previewScreenVideo').append(
                $(`<video id="${screenStreamId}" autoplay muted playsinline controls></video>`),
            );
            const video = $('.previewScreenVideo video:last')[0];
            console.warn('video', video, screenStream);
            video.srcObject = screenStream;

            const publisRes= zg.startPublishingStream(screenStreamId, screenStream);
            publisRes &&
                screenStreamList.push({
                    streamId: screenStreamId,
                    stream: screenStream,
                });
            $('#screenList').append('<option value="' + screenStreamId + '">' + screenStreamId + '</option>');
            // screenPublished = publisRes;
            console.log('publish screeStream', publisRes);
        } catch (e) {
            console.error('screenShot', e);
        }
    });

    $('#stopScreenShot').click(() => {
        const _stopScreenStreamId = $('#screenList').val();
        console.log('stopScreenShot', _stopScreenStreamId);
        const _stopScreenStream = screenStreamList.find(stream => stream.streamId == _stopScreenStreamId);
        if (!_stopScreenStream) return;
        stopScreenShot(_stopScreenStream);
    });

    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        // $('#stopScreenShot').click();
        screenStreamList.forEach(item => {
            stopScreenShot(item);
        });
        stopScreen();
        stopExternal();
        if (previewVideo.srcObject) {
            zg.destroyStream(previewVideo.srcObject);
            previewVideo.srcObject = null;
        }
        if(cameraStreamVideoTrack) {
            cameraStreamVideoTrack.stop();
            cameraStreamVideoTrack = null;
        }
        if (cameraStreamAudioTrack) {
            cameraStreamAudioTrack.stop();
            cameraStreamAudioTrack = null;
        }
        logout();
    });
});
