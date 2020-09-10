
import { checkAnRun, enterRoom, push } from '../common';

$(async () => {
    await checkAnRun();

    $('#externalCaptureV').click(async () => {
        let loginSuc = false;
        const channelCount = parseInt($('#channelCount').val());
        try {
            loginSuc = await enterRoom();
            if (loginSuc) {
                push({
                    custom: {
                        source: $('#externerVideo')[0],
                        channelCount: channelCount,
                    },
                });
            }
        } catch (error) {
            console.error(error);
        }
    });
    $('#externalCaptureA').click(async () => {
        let loginSuc = false;
        const channelCount = parseInt($('#channelCount').val());
        try {
            loginSuc = await enterRoom();
            if (loginSuc) {
                push({
                    custom: {
                        source: $('#externerAudio')[0],
                        channelCount: channelCount,
                    },
                });
            }
        } catch (error) {
            console.error(error);
        }
    });
});
