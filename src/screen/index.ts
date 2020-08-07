import { checkAnRun, supportScreenSharing, logout, publishStreamId, zg, loginRoom, previewVideo } from '../common';

$(async () => {
    await checkAnRun(true);
    console.log('supportScreenSharing', supportScreenSharing);
    if (!supportScreenSharing) {
        $('#screenShot').attr('disabled', 'disabled');
        $('#stopScreenShot').attr('disabled', 'disabled');
    }
    let screenStreamList: { streamId: string; stream: MediaStream }[] = [];
    let screenCount = 0;
    let screenStream: MediaStream;
    let screenStreamVideoTrack: MediaStreamTrack;
    let cameraStreamVideoTrack: MediaStreamTrack;

    const stopScreenShot = (screenStream: { streamId: string; stream: MediaStream }): void => {
        zg.stopPublishingStream(screenStream.streamId);
        $(`#screenList option[value='${screenStream.streamId}']`).remove();

        zg.destroyStream(screenStream.stream);
        console.log($(`#${screenStream.streamId}`));
        ($(`#${screenStream.streamId}`)[0] as HTMLVideoElement).srcObject = null;
        $(`#${screenStream.streamId}`).remove();
        screenStreamList = screenStreamList.filter(item => item !== screenStream);
        console.log(`screenStreamList `, screenStreamList);
    };

    // 点击系统停止共享
    zg.on('screenSharingEnded', (stream: MediaStream): void => {
        console.warn('screen sharing end');
        const _stopScreenStream = screenStreamList.find(screenStream => screenStream.stream == stream);
        _stopScreenStream && stopScreenShot(_stopScreenStream);
    });

    $('#replaceTrack').click(async function() {
        if (!screenStream) {
            screenStream = await zg.createStream({
                screen: true,
            });
            screenStreamVideoTrack = screenStream.getVideoTracks()[0].clone();
            cameraStreamVideoTrack = (previewVideo.srcObject as MediaStream).getVideoTracks()[0].clone();
        }

        zg.replaceTrack(previewVideo.srcObject as MediaStream, screenStreamVideoTrack.clone())
            .then(res => console.warn('replaceTrack success'))
            .catch(err => console.error(err));
    });
    $('#replaceTrack2').click(async function() {
        zg.replaceTrack(previewVideo.srcObject as MediaStream, cameraStreamVideoTrack.clone())
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
            const video = $('.previewScreenVideo video:last')[0] as HTMLVideoElement;
            console.warn('video', video, screenStream);
            video.srcObject = screenStream!;

            const publisRes: boolean = zg.startPublishingStream(screenStreamId, screenStream);
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
        const _stopScreenStreamId = $('#screenList').val() as string;
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
