import { checkAnRun, supportScreenSharing, logout, publishStreamId, zg } from '../common';

$(async () => {
    await checkAnRun(true);
    console.log('supportScreenSharing', supportScreenSharing);
    if (!supportScreenSharing) {
        $('#screenShot').attr('disabled', 'disabled');
        $('#stopScreenShot').attr('disabled', 'disabled');
    }
    const screenStreamId = publishStreamId + 'screen';
    const previewScreenVideo = $('#previewScreenVideo')[0] as HTMLVideoElement;
    let screenPublished = false;
    let screeStream: MediaStream;

    // 点击系统停止共享
    zg.on('screenSharingEnded', () => {
        console.warn('screen sharing end');
        $('#stopScreenShot').click();
    });

    $('#screenShot').click(async () => {
        try {
            screeStream = await zg.createStream({
                screen: {
                    audio: true,
                    videoQuality: 1,
                },
            });
            previewScreenVideo.srcObject = screeStream;
            const publisRes: boolean = zg.startPublishingStream(screenStreamId, screeStream);
            screenPublished = publisRes;
            console.log('publish screeStream', publisRes);
        } catch (e) {
            console.error('screenShot', e);
        }
    });

    $('#stopScreenShot').click(() => {
        if (screenPublished) {
            zg.stopPublishingStream(screenStreamId);
        }
        zg.destroyStream(screeStream);
        previewScreenVideo.srcObject = null;
    });

    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        $('#stopScreenShot').click();
        logout();
    });
});
