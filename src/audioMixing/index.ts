import { checkAnRun, zg, publishStreamId, logout } from '../common';

$(async () => {
    let isMixingAudio = false;
    await checkAnRun();
    $('#MixAudio').click(() => {
        const result = zg.startMixingAudio(publishStreamId, [
            $('#extenerVideo1')[0] as HTMLMediaElement,
            $('#extenerVideo2')[0] as HTMLMediaElement,
        ]);
        console.warn('混音', result);
    });

    $('#stopMixAudio').click(() => {
        zg.stopMixingAudio(publishStreamId, [
            $('#extenerVideo1')[0] as HTMLMediaElement,
            $('#extenerVideo2')[0] as HTMLMediaElement,
        ]);
    });

    $('#mixingBuffer').click(function() {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://storage.zego.im/demo/tonight.m4a', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if (xhr.status == 200 || xhr.status == 304) {
                const buffer = xhr.response;
                zg.mixingBuffer(publishStreamId, '1', buffer, (err: any) => {
                    if (err) {
                        console.error(err);
                    } else {
                        isMixingAudio = true;
                        console.warn('real time effect success');
                    }
                });
            }
        };

        xhr.send();
    });

    $('#stopMixingBuffer').click(function() {
        zg.stopMixingBuffer(publishStreamId, '1');
    });

    $('#leaveMixRoom').click(function() {
        isMixingAudio && zg.stopMixingAudio(publishStreamId);
        isMixingAudio && zg.stopMixingBuffer(publishStreamId, '1');
        isMixingAudio = false;
        logout();
    });
});
