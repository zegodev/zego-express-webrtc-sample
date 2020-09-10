import { checkAnRun, zg, publishStreamId, logout } from '../common';

$(async () => {
    let isMixingAudio = false;
    let isMixingBuffer = false;
    const audioEffectList = [
        {
            effectId: '1',
            path: 'https://zego-public.oss-cn-shanghai.aliyuncs.com/sdk-doc/assets/station.mp3',
        },
    ];
    await checkAnRun();
    $('#MixAudio').click(() => {
        const result = zg.startMixingAudio(publishStreamId, [
            $('#extenerVideo1')[0] ,
            $('#extenerVideo2')[0] ,
        ]);
        console.warn('混音', result);
    });

    $('#stopMixAudio').click(() => {
        zg.stopMixingAudio(publishStreamId);
    });

    $('#volume1').on('input', () => {
        // @ts-ignore
        zg.setMixingAudioVolume(publishStreamId, parseInt($('#volume1').val()), $(
            '#extenerVideo1',
        )[0] );
    });

    $('#volume2').on('input', () => {
        // @ts-ignore
        zg.setMixingAudioVolume(publishStreamId, parseInt($('#volume2').val()), $(
            '#extenerVideo2',
        )[0] );
    });

    $('#mixingBuffer').click(function() {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://storage.zego.im/demo/tonight.m4a', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if (xhr.status == 200 || xhr.status == 304) {
                const buffer = xhr.response;
                zg.mixingBuffer(publishStreamId, '1', buffer, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        isMixingBuffer = true;
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
        isMixingBuffer && zg.stopMixingBuffer(publishStreamId, '1');
        isMixingAudio = false;
        isMixingBuffer = false;
        logout();
    });

    $('#preloadEffect').click(() => {
        audioEffectList.forEach(effect => {
            zg.preloadEffect(effect.effectId, effect.path, () => {
                console.warn('preload success');
                //@ts-ignore
                $('#playEffect')[0].disabled = false;
                //@ts-ignore
                $('#unloadEffect')[0].disabled = false;
            });
        });
    });

    $('#playEffect').click(() => {
        zg.playEffect(
            {
                streamID: publishStreamId,
                effectID: '1',
            },
            () => {
                isMixingAudio = true;
                //@ts-ignore
                $('#pauseEffect')[0].disabled = false;
                //@ts-ignore
                $('#resumeEffect')[0].disabled = false;
                //@ts-ignore
                $('#stopEffect')[0].disabled = false;
                console.warn('start play');
            },
            () => {
                isMixingAudio = false;
                //@ts-ignore
                $('#pauseEffect')[0].disabled = true;
                //@ts-ignore
                $('#resumeEffect')[0].disabled = true;
                //@ts-ignore
                $('#stopEffect')[0].disabled = true;
                console.warn('play end');
            },
        );
    });

    $('#pauseEffect').click(() => {
        zg.pauseEffect(publishStreamId);
    });

    $('#resumeEffect').click(() => {
        zg.resumeEffect(publishStreamId);
    });

    $('#stopEffect').click(() => {
        zg.stopEffect(publishStreamId);
        //@ts-ignore
        $('#pauseEffect')[0].disabled = true;
        //@ts-ignore
        $('#resumeEffect')[0].disabled = true;
        //@ts-ignore
        $('#stopEffect')[0].disabled = true;
    });

    $('#unloadEffect').click(() => {
        let num = 0;
        audioEffectList.forEach(effect => {
            zg.unloadEffect(effect.effectId) && num++;
        });

        if (num === audioEffectList.length) {
            console.warn('all unload success');
            //@ts-ignore
            $('#playEffect')[0].disabled = true;
            //@ts-ignore
            $('#unloadEffect')[0].disabled = true;
        }
    });
});
