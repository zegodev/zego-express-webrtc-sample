import {
    checkAnRun,
    supportScreenSharing,
    logout,
    publishStreamId,
    zg,
    loginRoom,
    previewVideo,
    enterRoom,
} from '../common';

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
    let screenStreamVideoTrack;
    let cameraStreamVideoTrack;
    let previewStream;
    let previewed = false;
    const publishStreamID = 'web-' + new Date().getTime();

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

    // 点击系统停止共享
    zg.on('screenSharingEnded', (stream)=> {
        console.warn('screen sharing end');
        const _stopScreenStream = screenStreamList.find(screenStream => screenStream.stream == stream);
        _stopScreenStream && stopScreenShot(_stopScreenStream);
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
                previewed = true;
            }
        } catch (error) {
            console.error(error);
        }
    });
    $('#publish').click(() => {
        const result = zg.startPublishingStream(publishStreamID, previewStream);
        console.log('publish stream' + publishStreamID, result);
    });
    $('#replaceTrack').click(async function() {
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        if (!screenStream) {
            screenStream = await zg.createStream({
                screen: true,
            });
            screenStreamVideoTrack = screenStream.getVideoTracks()[0].clone();
            cameraStreamVideoTrack = (previewVideo.srcObject).getVideoTracks()[0].clone();
        }

        zg.replaceTrack(previewVideo.srcObject, screenStreamVideoTrack.clone())
            .then(res => console.warn('replaceTrack success'))
            .catch(err => console.error(err));
    });
    $('#replaceTrack2').click(async function() {
        if (!previewVideo.srcObject || !screenStreamVideoTrack) {
            alert('先创建流及屏幕共享');
            return;
        }
        zg.replaceTrack(previewVideo.srcObject, cameraStreamVideoTrack.clone())
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
        logout();
    });
});
