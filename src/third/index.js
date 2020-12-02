
import { checkAnRun, enterRoom, push } from '../common';

$(async () => {
    await checkAnRun();

    $('#externalCaptureV').click(async () => {
        let loginSuc = false;
        const channelCount = parseInt($('#channelCount').val());
        $('#externerVideo')[0].play();
        const realStream = $('#externerVideo')[0].captureStream();
        realStream.removeTrack(realStream.getAudioTracks()[0]);
        const constraints = {
            source: realStream,
            // channelCount: channelCount,
        }
        $('#audioBitrate').val() && (constraints.audioBitrate = parseInt($('#audioBitrate').val()));

        try {
            // $('#externerVideo')[0].play();
            loginSuc = await enterRoom();
            if (loginSuc) {
                push({
                    custom: constraints,
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

    $('#inputFile').change(function() {
        const video = this.files[0];
        const url = URL.createObjectURL(video);
        $('#externerVideo')[0].src = url;
    })
    
});
