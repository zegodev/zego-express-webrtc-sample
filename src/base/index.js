import { checkAnRun, zg, useLocalStreamList, enterRoom, previewVideo, logout, publish, publishStreamId, l3 } from '../common';
import { getBrowser } from '../assets/utils';

let playOption = {};
// --test begin
let previewStream;
let previewed = false;
let published = false;
const publishStreamID = 'web-' + new Date().getTime();
// ---test end

$(async () => {
    await checkAnRun();

    // --- test begin
    $('#enterRoom').click(async () => {
        let loginSuc = false;
        try {
            loginSuc = await enterRoom();
            if (loginSuc) {
                previewStream = await zg.createStream({
                    camera: {
                        audioInput: $('#audioList').val() ,
                        videoInput: $('#videoList').val() ,
                        video: $('#videoList').val() === '0' ? false : true,
                        audio: $('#audioList').val() === '0' ? false : true,
                    },
                });
                previewVideo.srcObject = previewStream;
                previewed = true;
                $('#videoList').val() === '0' && (previewVideo.controls = true);
            }
        } catch (error) {
            console.error(error);
        }
    });
    $('#publish').click(() => {
        const result = zg.startPublishingStream(publishStreamID, previewStream? previewStream: previewVideo.srcObject);
        published = true;
        console.log('publish stream' + publishStreamID, result);
    });

    $('#useVideo').click(() => {
        zg.useVideoDevice(previewVideo.srcObject, $('#videoList').val());
    });

    $('#useAudio').click(() => {
        zg.useAudioDevice(previewVideo.srcObject, $('#audioList').val());
    });
    // --- test end

    $('#createRoom').unbind('click');
    $('#createRoom').click(async () => {
        let loginSuc = false;
        const constraints = {};
        const channelCount = parseInt($('#channelCount').val() );
        constraints.channelCount = channelCount;
        const videoQuality = $('#videoQuality').val();
        if (videoQuality == 4) {
            $('#width').val() && (constraints.width = parseInt($('#width').val())),
            $('#height').val() && (constraints.height = parseInt($('#height').val())),
            $('#frameRate').val() && (constraints.frameRate = parseInt($('#frameRate').val())),
            $('#bitrate').val() && (constraints.bitrate = parseInt($('#bitrate').val()))
        }
        $('#noiseSuppression').val() === '1' ? (constraints.ANS = true) : (constraints.ANS = false);
        $('#autoGainControl').val() === '1' ? (constraints.AGC = true) : (constraints.AGC = false);
        $('#echoCancellation').val() === '1' ? (constraints.AEC = true) : (constraints.AEC = false);
        $('#audioBitrate').val() && (constraints.audioBitrate = parseInt($('#audioBitrate').val()));

        constraints.videoQuality = parseInt(videoQuality);
        console.warn('constraints', constraints);
        try {
            loginSuc = await enterRoom();
            loginSuc && (await publish({ camera: constraints }));
        } catch (error) {
            console.error(error);
        }
    });
    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(() => {
        if (previewed) {
            zg.destroyStream(previewStream);
            previewed = false;
            previewVideo.srcObject = null;
        }
        if (published) {
            zg.stopPublishingStream(publishStreamID);
            published = false;
        }

        logout();
    });
    $('#openRoom').unbind('click');
    $('#openRoom').click(async () => {
        await enterRoom();
    });
    $('#extraInfo').click(() => {
        zg.setStreamExtraInfo(publishStreamId, $('#extraInfoInput').val());
    });
    $('#switchConstraints').click(() => {
        const constraints = {};
        const w = $('#width').val() ? parseInt($('#width').val()) : 0;
        const h = $('#height').val() ? parseInt($('#height').val()) : 0;
        const f = $('#frameRate').val() ? parseInt($('#frameRate').val()) : 0;
        const b = $('#bitrate').val() ? parseInt($('#bitrate').val()) : 0;

        w && Object.assign(constraints, { width: w });
        h && Object.assign(constraints, { height: h });
        f && Object.assign(constraints, { frameRate: f });
        b && Object.assign(constraints, { maxBitrate: b});

        zg.setVideoConfig(previewVideo.srcObject, constraints).then(
            () => {
                console.warn('change constraints success');
            },
            err => {
                console.error(err);
            },
        );
    });

    $('#setAudioConfig').click(() => {
        const constraints = {};
        let ANS, AGC, AEC;
        $('#noiseSuppression').val() === '1' ? (ANS = true) : (ANS = false);
        $('#autoGainControl').val() === '1' ? (AGC = true) : (AGC = false);
        $('#echoCancellation').val() === '1' ? (AEC = true) : (AEC = false);
        Object.assign(constraints, { ANS, AGC, AEC})
        zg.setAudioConfig(previewVideo.srcObject, constraints).then((res) => {
            console.warn('change constraints success', res);
        }, err => {
            console.error(JSON.stringify(err));
        })
    })

    $('#startCheckSystem').click(async () => {
        const select = document.querySelector("#checkType");
        const value = select.options[select.selectedIndex].value;
        const res = await zg.checkSystemRequirements(value);
        console.log(JSON.stringify(res));
        const resultDiv = document.querySelector("#checkResult");
        resultDiv.innerHTML = value + ": " + JSON.stringify(res);
    })

    // $('#mutePlayStreamVideo').click(() => {
    //     useLocalStreamList.forEach(item => {
    //         zg.zegoWebRTC.mutePlayStreamVideo(item.streamID, !$(this).hasClass('disabled'));
    //     })
    //     $(this).toggleClass('disabled');
    // })
    // $('#mutePlayStreamAudio').click(() => {
    //     useLocalStreamList.forEach(item => {
    //         zg.zegoWebRTC.mutePlayStreamAudio(item.streamID, !$(this).hasClass('disabled'));
    //     })
    //     $(this).toggleClass('disabled');
    // })
    $('#tcpOnly').change((e) => {
        // console.error(e.target.value);
        const tcpOnly = e.target.value;
        console.warn('tcporudp: ', e.target.value === '0' ? 'auto' : e.target.value === '1' ? 'tcp' : 'udp');
        if (tcpOnly === '1') {
            zg.zegoWebRTC.setTurnOverTcpOnly(true);
        } else if(tcpOnly === '2') {
            zg.zegoWebRTC.setTurnOverTcpOnly(false);
        }
    })
    $('#playVideo').click(() => {
        const videos = $('.remoteVideo video');
        // console.error('videos', videos);
        for(let i = 0; i < videos.length; i++) {
            if (videos[i].paused) {
                videos[i].play().then(res => {
                    console.warn('id ', videos[i].id, res)
                }).catch(err => {
                    console.error('id ', videos[i].id, err)
                });
            }
        }
    })
    zg.off('roomStreamUpdate');
    zg.on('roomStreamUpdate', async (roomID, updateType, streamList, extendedData) => {
        console.log('roomStreamUpdate 2 roomID ', roomID, streamList, extendedData);
        if (updateType == 'ADD') {
            for (let i = 0; i < streamList.length; i++) {
                console.info(streamList[i].streamID + ' was added');
                let remoteStream;

                const handlePlaySuccess = (streamItem) => {
                    let video;
                    const bro = getBrowser();
                    if (bro == 'Safari' && playOption.video === false) {
                        $('.remoteVideo').append($(`<audio id=${streamItem.streamID} autoplay muted playsinline controls></audio>`));
                        video = $('.remoteVideo audio:last')[0] ;
                        console.warn('audio', video, remoteStream);
                    } else {
                        $('.remoteVideo').append($(`<video id=${streamItem.streamID} autoplay muted playsinline controls></video>`));
                        video = $('.remoteVideo video:last')[0];
                        console.warn('video', video, remoteStream);
                    }

                    video.srcObject = remoteStream;
                    video.muted = false;
                };

                    playOption = {};
                    const _selectMode = $('#playMode option:selected').val();
                    console.warn('playMode', _selectMode, playOption);
                    if (_selectMode) {
                        if (_selectMode == 'all') {
                            playOption.video = true;
                            playOption.audio = true;
                        } else if (_selectMode == 'video') {
                            playOption.audio = false;
                        } else if (_selectMode == 'audio') {
                            playOption.video = false;
                        }
                    }

                    if($("#videoCodec").val()) playOption.videoCodec = $("#videoCodec").val();
                    if(l3 == true) playOption.resourceMode = 2;

                    zg.startPlayingStream(streamList[i].streamID, playOption).then(stream => {
                        remoteStream = stream;
                        useLocalStreamList.push(streamList[i]);
                        handlePlaySuccess(streamList[i]);
                    }).catch (error => {
                        console.error(error);

                    })
            }
        } else if (updateType == 'DELETE') {
            for (let k = 0; k < useLocalStreamList.length; k++) {
                for (let j = 0; j < streamList.length; j++) {
                    if (useLocalStreamList[k].streamID === streamList[j].streamID) {
                        try {
                            zg.stopPlayingStream(useLocalStreamList[k].streamID);
                        } catch (error) {
                            console.error(error);
                        }

                        console.info(useLocalStreamList[k].streamID + 'was devared');


                        $('.remoteVideo video:eq(' + k + ')').remove();
                        useLocalStreamList.splice(k--, 1);
                        break;
                    }
                }
            }
        }
    });
});