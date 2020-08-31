import { checkAnRun, zg, useLocalStreamList, enterRoom, previewVideo, logout, publish, publishStreamId } from '../common';
import { getBrowser } from '../assets/utils';

let playOption = {};
// --test begin
let previewStream;
let previewed = false;
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
            }
        } catch (error) {
            console.error(error);
        }
    });
    $('#publish').click(() => {
        const result = zg.startPublishingStream(publishStreamID, previewStream);
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
            constraints.width = parseInt($('#width').val()),
            constraints.height = parseInt($('#height').val()),
            constraints.frameRate = parseInt($('#frameRate').val()),
            constraints.bitrate = parseInt($('#bitrate').val())
        }
        constraints.videoQuality = parseInt(videoQuality);
        // console.error('channelCount', channelCount);
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
            zg.stopPublishingStream(publishStreamID);
            zg.destroyStream(previewStream);
            previewed = false;
            previewVideo.srcObject = null;
        }
        logout();
    });
    $('#openRoom').unbind('click');
    $('#openRoom').click(async () => {
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

        w && Object.assign(constraints, { width: w });
        h && Object.assign(constraints, { height: h });
        f && Object.assign(constraints, { frameRate: f });

        zg.setPublishStreamConstraints(previewVideo.srcObject, constraints).then(
            () => {
                console.warn('change constraints success');
            },
            err => {
                console.error(err);
            },
        );
    });
    zg.off('roomStreamUpdate');
    zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
        console.log('roomStreamUpdate roomID ', roomID, streamList);
        if (updateType == 'ADD') {
            for (let i = 0; i < streamList.length; i++) {
                console.info(streamList[i].streamID + ' was added');
                useLocalStreamList.push(streamList[i]);
                let remoteStream;

                const handlePlaySuccess = () => {
                    let video;
                    if (getBrowser() == 'Safari' && playOption.video === false) {
                        $('.remoteVideo').append($('<audio autoplay muted playsinline controls></audio>'));
                        video = $('.remoteVideo audio:last')[0] ;
                        console.warn('audio', video, remoteStream);
                    } else {
                        $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));
                        video = $('.remoteVideo video:last')[0];
                        console.warn('video', video, remoteStream);
                    }

                    video.srcObject = remoteStream;
                    video.muted = false;
                };

                try {
                    zg.startPlayingStream(streamList[i].streamID, playOption).then(stream => {
                        remoteStream = stream;
                        handlePlaySuccess();
                    });
                } catch (error) {
                    console.error(error);
                    break;
                }
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

                        useLocalStreamList.splice(k, 1);

                        $('.remoteVideo video:eq(' + k + ')').remove();
                        $('#memberList option:eq(' + k + ')').remove();
                        break;
                    }
                }
            }
        }
    });
});
