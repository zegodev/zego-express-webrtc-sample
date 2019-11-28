import { checkAnRun, logout, publishStreamId, zg } from '../common';

$(async () => {
    await checkAnRun(true);

    const screenStreamId = publishStreamId + 'screen';
    const previewScreenVideo = $('#previewScreenVideo')[0] as HTMLVideoElement;
    let screenPublished = false;
    let screeStream: MediaStream;

    // 点击系统停止共享
    zg.on('screenSharingEnded', () => {
        $('#stopScreenShot').click();
    });

    $('#screenShot').click(async () => {
        try {
            screeStream = await zg.createLocalStream({ screen: {} });
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
        zg.destroyLocalStream(screeStream);
        previewScreenVideo.srcObject = null;
    });

    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        $('#stopScreenShot').click();
        logout();
    });
});
