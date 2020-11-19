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
                zg.zegoWebRTC.mixingBuffer(publishStreamId, '1', buffer, (err) => {
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
        zg.zegoWebRTC.stopMixingBuffer(publishStreamId, '1');
    });

    $('#leaveMixRoom').click(function() {
        isMixingAudio && zg.stopMixingAudio(publishStreamId);
        isMixingBuffer && zg.zegoWebRTC.stopMixingBuffer(publishStreamId, '1');
        isMixingAudio = false;
        isMixingBuffer = false;
        logout();
    });

    $('#preloadEffect').click(() => {
        audioEffectList.forEach(effect => {
            zg.zegoWebRTC.preloadEffect(effect.effectId, effect.path, () => {
                console.warn('preload success');
                
                $('#playEffect')[0].disabled = false;
                
                $('#unloadEffect')[0].disabled = false;
            });
        });
    });

    $('#playEffect').click(() => {
        zg.zegoWebRTC.playEffect(
            {
                streamID: publishStreamId,
                effectID: '1',
            },
            () => {
                isMixingAudio = true;
                
                $('#pauseEffect')[0].disabled = false;
                
                $('#resumeEffect')[0].disabled = false;
                
                $('#stopEffect')[0].disabled = false;
                console.warn('start play');
            },
            () => {
                isMixingAudio = false;
                
                $('#pauseEffect')[0].disabled = true;
                
                $('#resumeEffect')[0].disabled = true;
                
                $('#stopEffect')[0].disabled = true;
                console.warn('play end');
            },
        );
    });

    $('#pauseEffect').click(() => {
        zg.zegoWebRTC.pauseEffect(publishStreamId);
    });

    $('#resumeEffect').click(() => {
        zg.zegoWebRTC.resumeEffect(publishStreamId);
    });

    $('#stopEffect').click(() => {
        zg.zegoWebRTC.stopEffect(publishStreamId);
        
        $('#pauseEffect')[0].disabled = true;
        
        $('#resumeEffect')[0].disabled = true;
        
        $('#stopEffect')[0].disabled = true;
    });

    $('#unloadEffect').click(() => {
        let num = 0;
        audioEffectList.forEach(effect => {
            zg.zegoWebRTC.unloadEffect(effect.effectId) && num++;
        });

        if (num === audioEffectList.length) {
            console.warn('all unload success');
            
            $('#playEffect')[0].disabled = true;
            
            $('#unloadEffect')[0].disabled = true;
        }
    });
});
