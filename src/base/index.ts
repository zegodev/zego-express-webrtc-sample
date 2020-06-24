import { checkAnRun, zg, useLocalStreamList, enterRoom } from '../common';
import { webPlayOption } from 'zego-express-engine-webrtc/sdk/common/zego.entity';

let playOption: webPlayOption = {};
$(async () => {
    await checkAnRun();

    $('#openRoom').unbind('click');
    $('#openRoom').click(async () => {
        playOption = {};
        const _selectMode = $('#playMode option:selected').val();
        console.warn('playMode', _selectMode, playOption);
        if (_selectMode) {
            if (_selectMode == 'video') {
                playOption.audio = false;
            } else if (_selectMode == 'audio') {
                playOption.video = false;
            }
        }
        await enterRoom();
    });
    zg.off('roomStreamUpdate');
    zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
        console.log('roomStreamUpdate roomID ', roomID, streamList);
        if (updateType == 'ADD') {
            for (let i = 0; i < streamList.length; i++) {
                console.info(streamList[i].streamID + ' was added');
                useLocalStreamList.push(streamList[i]);
                let remoteStream: MediaStream;

                try {
                    remoteStream = await zg.startPlayingStream(streamList[i].streamID, playOption);
                } catch (error) {
                    console.error(error);
                    break;
                }

                $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));
                const video = $('.remoteVideo video:last')[0] as HTMLVideoElement;
                console.warn('video', video, remoteStream);
                video.srcObject = remoteStream!;
                video.muted = false;
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
