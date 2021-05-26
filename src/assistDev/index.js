import { checkAnRun, previewVideo } from '../common';
import { getBrowser } from '../assets/utils';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
let zg
let appID
const userID = 'sample' + new Date().getTime();
const userName = 'sampleUser' + new Date().getTime();
let serverUrl = 'wss://webliveroom-test.zego.im/ws'; // 请从官网控制台获取对应的server地址，否则可能登录失败
let useLocalStreamList = [];
let cgiToken = '';
let isPreviewed = false;

let playOption = {};
// --test begin
let previewStream;
let published = false;
$('#streamId').val('web-' + new Date().getTime())
let isLogin = false;
// ---test end



$(async () => {
    await checkAnRun();

    $('#publish').click(async () => {
        if (!isLogin) {
            alert('Please log in room first')
            return
        }
        previewStream = await zg.createStream({
            camera: {
                video: true,
                audio: true,
            },
        });
        previewVideo.srcObject = previewStream;
        isPreviewed = true;
        previewVideo.controls = true;
        const result = zg.startPublishingStream($('#streamId').val(), previewStream ? previewStream : previewVideo.srcObject);
        published = true;
        console.log('publish stream' + $('#streamId').val(), result);
    });



    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(async () => {
        if (isPreviewed) {
            zg.destroyStream(previewStream);
            isPreviewed = false;
            previewVideo.srcObject = null;
        }
        if (published) {
            zg.stopPublishingStream($('#streamId').val());
            published = false;
        }

        await logout();
        isLogin = false
    });

    $('#stopPublish').unbind('click');
    $('#stopPublish').click(async () => {
        if (isPreviewed) {
            zg.destroyStream(previewStream);
            isPreviewed = false;
            previewVideo.srcObject = null;
        }
        if (published) {
            zg.stopPublishingStream($('#streamId').val());
            published = false;
        }
    });

    $('#openRoom').unbind('click');
    $('#openRoom').click(async () => {
        console.log('$(#appId)', $('#appId'));
        const currentId = $('#appId').val()
        if (!currentId) {
            alert('AppID is empty')
            return
        } else if (isNaN(Number(currentId))) {
            alert('AppID must be number')
            return
        }
        if (isLogin) {
            alert('Already login. please login after logout current room.')
            return
        }
        appID = Number(currentId);
        resetInstance(appID,serverUrl)
        isLogin = await enterRoom();
    });


});

function resetInstance(appId, server) {
    zg && zg.off('roomStreamUpdate');
    zg = new ZegoExpressEngine(Number(appId), server)
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
                        video = $('.remoteVideo audio:last')[0];
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

                zg.startPlayingStream(streamList[i].streamID, playOption).then(stream => {
                    remoteStream = stream;
                    useLocalStreamList.push(streamList[i]);
                    handlePlaySuccess(streamList[i]);
                }).catch(error => {
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
}

async function enterRoom() {
    const roomId = $('#roomId').val();
    if (!roomId) {
        alert('roomId is empty');
        return false;
    }

    for (let i = 0; i < useLocalStreamList.length; i++) {
        useLocalStreamList[i].streamID && zg.stopPlayingStream(useLocalStreamList[i].streamID);
    }

    await login(roomId);
    isLogin = true;
    alert('Login Success!')

    console.warn('remoteVideo')
    $('.remoteVideo').html('');

    return true;
}

async function login(roomId) {
    // 获取token需要客户自己实现，token是对登录房间的唯一验证
    // Obtaining a token needs to be implemented by the customer. The token is the only verification for the login room.
    let token = '';
    //测试用，开发者请忽略
    //Test code, developers please ignore
    if (cgiToken) {
        token = await $.get(tokenUrl, {
            app_id: appID,
            id_name: userID,
            cgi_token: cgiToken,
        });
        //测试用结束
        //Test code end
    } else {
        token = await $.get('https://wsliveroom-alpha.zego.im:8282/token', {
            app_id: appID,
            id_name: userID,
        });
    }
    return await zg.loginRoom(roomId, token, { userID, userName }, { userUpdate: true });
}


async function logout() {
    console.info('leave room  and close stream');
    if (previewVideo.srcObject) {
        previewVideo.srcObject = null;
    }

    // 停止推流
    // stop publishing
    if (isPreviewed) {
        zg.stopPublishingStream(publishStreamId);
        zg.destroyStream(localStream);
        isPreviewed = false;
        previewVideo.srcObject = null;
        !$('.sound').hasClass('d-none') && $('.sound').addClass('d-none');
    }

    // 停止拉流
    // stop playing
    for (let i = 0; i < useLocalStreamList.length; i++) {
        useLocalStreamList[i].streamID && zg.stopPlayingStream(useLocalStreamList[i].streamID);
    }

    // 清空页面
    // Clear page
    useLocalStreamList = [];
    // window.useLocalStreamList = [];
    $('.remoteVideo').html('');
    $('#memberList').html('');

    //退出登录
    //logout
    const roomId = $('#roomId').val();
    zg.logoutRoom(roomId);
    isLogin = false;
}