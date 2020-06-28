import { checkAnRun, supportScreenSharing, logout, publishStreamId, zg } from '../common';

$(async () => {
    await checkAnRun(true);
    console.log('supportScreenSharing', supportScreenSharing);
    if (!supportScreenSharing) {
        $('#screenShot').attr('disabled', 'disabled');
        $('#stopScreenShot').attr('disabled', 'disabled');
    }
    const screenStreamList: { streamId: string; stream: MediaStream }[] = [];
    // const screenStreamId = publishStreamId + 'screen';
    // const previewScreenVideo = $('#previewScreenVideo')[0] as HTMLVideoElement;
    // const screenPublished = false;
    // let screeStream: MediaStream;

    // 点击系统停止共享
    zg.on('screenSharingEnded', () => {
        console.warn('screen sharing end');
        $('#stopScreenShot').click();
    });

    $('#screenShot').click(async () => {
        try {
            const screenStream = await zg.createStream({
                screen: {
                    audio: true,
                    videoQuality: 1,
                },
            });
            // previewScreenVideo.srcObject = screeStream;
            const screenStreamId = publishStreamId + 'screen' + screenStreamList.length;
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
        // if (screenPublished) {
        zg.stopPublishingStream(_stopScreenStreamId);
        $(`#screenList option[value='${_stopScreenStreamId}']`).remove();
        // }

        zg.destroyStream(_stopScreenStream.stream);
        console.log($(`#${_stopScreenStreamId}`));
        ($(`#${_stopScreenStreamId}`)[0] as HTMLVideoElement).srcObject = null;
        $(`#${_stopScreenStreamId}`).remove();
        // previewScreenVideo.srcObject = null;
    });

    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        // $('#stopScreenShot').click();
        screenStreamList.forEach(item => {
            zg.stopPublishingStream(item.streamId);
            zg.destroyStream(item.stream);
            $(`#screenList option[value='${item.streamId}']`).remove();
            $(`#${item.streamId}`).remove();
        });
        logout();
    });
});
