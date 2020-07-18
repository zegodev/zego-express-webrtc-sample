import { checkAnRun, enterRoom, publish, zg, useLocalStreamList } from '../common';

$(async () => {
    await checkAnRun();
    zg.off('roomStreamUpdate');
    zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
        console.log('roomStreamUpdate roomID ', roomID, streamList);
        if (updateType == 'ADD') {
            for (let i = 0; i < streamList.length; i++) {
                console.info(streamList[i].streamID + ' was added');
                useLocalStreamList.push(streamList[i]);
                let remoteStream;

                try {
                    remoteStream = await zg.startPlayingStream(streamList[i].streamID, {
                        video: false,
                    });
                } catch (error) {
                    console.error(error);
                    break;
                }

                $('.remoteVideo').append($('<audio autoplay muted playsinline controls></audio>'));
                const audio = $('.remoteVideo audio:last')[0];
                console.warn('audio', audio, remoteStream);
                audio.srcObject = remoteStream;
                audio.muted = false;
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

                        $('.remoteVideo audio:eq(' + k + ')').remove();
                        $('#memberList option:eq(' + k + ')').remove();

                        break;
                    }
                }
            }
        }
    });

    $('#createRoom').unbind('click');
    $('#createRoom').click(async () => {
        let loginSuc = false;
        try {
            loginSuc = await enterRoom();
            loginSuc && (await publish({ camera: { video: false } }));
        } catch (error) {
            console.error(error);
        }
    });
});
