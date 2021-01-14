import '../common';
//@ts-ignore
import md5 from 'md5';
import {
    checkAnRun,
    logout,
    publishStreamId,
    zg,
    appID,
    useLocalStreamList,
    enterRoom,
    publish,
    publishType,
    loginRoom
} from '../common';
import { getBrowser } from '../assets/utils';
import flvjs from 'flv.js';

let flvPlayer = null;
let cdnFlvPlayer = null;
const ua = navigator.userAgent.toLowerCase();
let isAndWechat = false;
let videoElement;
let cdnVideoElement;
let isLogin = false;
let playType = 'all';

console.warn('ua', ua);
// @ts-ignore
if ((ua.indexOf('android') > -1 || ua.indexOf('linux') > -1) && ua.match(/MicroMessenger/i) == 'micromessenger') {
    console.warn('当前浏览器为微信浏览器');
    isAndWechat = true;
}

function filterStreamList(streamInfo) {
    const flv = {};
    const hls = {};
    const rtmp = {};

    const streamListUrl = [];

    // console.log(zg.stateCenter.streamList);

    for (const key in streamInfo) {
        if (key == 'urlsFLV' || key == 'urlsHttpsFLV') {
            flv[key] = streamInfo[key];
        }
        if (key == 'urlsHLS' || key == 'urlsHttpsHLS') {
            hls[key] = streamInfo[key];
        }
        if (key == 'urlsRTMP') {
            rtmp[key] = streamInfo[key];
        }
    }

    console.warn('flv', flv, hls, rtmp);
    const pro = window.location.protocol;
    const browser = getBrowser();

    if (browser == 'Safari' && !isAndWechat) {
        for (const key in hls) {
            if (hls[key]) {
                if (hls[key].indexOf(pro) !== -1) streamListUrl.push(hls[key]);
                else if (pro == 'https:' && hls[key].indexOf('https') === -1) {
                    streamListUrl.push(hls[key].replace('http', 'https'));
                }
            }
        }
    } else if (pro == 'http:') {
        for (const key in flv) {
            if (flv[key]) {
                if (flv[key].indexOf('http') !== -1 || flv[key].indexOf('https') !== -1) streamListUrl.push(flv[key]);
            }
        }
    } else if (pro == 'https:') {
        for (const key in flv) {
            if (flv[key]) {
                if (flv[key].indexOf('https') === -1) streamListUrl.push(flv[key].replace('http', 'https'));
                else if (flv[key].indexOf(pro) !== -1) {
                    streamListUrl.push(flv[key]);
                }
            }
        }
    } else if (pro == 'rtmp:') {
        for (const key in rtmp) {
            if (rtmp[key]) {
                if (rtmp[key].indexOf(pro) !== -1) streamListUrl.push(rtmp[key]);
            }
        }
    }

    return streamListUrl.filter(function (ele, index, self) {
        return self.indexOf(ele) == index;
    });
}

function playStream(streamID, cdnUrl) {
    const browser = getBrowser();
    let hasAudio = true;
    let hasVideo = true;
    let playType;

    const index = useLocalStreamList.findIndex(streamInfo => streamInfo.streamID == streamID);
    const streamInfo = useLocalStreamList[index];

    if (streamInfo && streamInfo.extraInfo && streamInfo.extraInfo.length !== 0) {
          try {
              playType = JSON.parse(streamInfo.extraInfo).playType;
          } catch (err) {
              alert(err);
          }
    }

    playType === 'Video' ? (hasAudio = false) : (hasAudio = true);
    playType === 'Audio' ? (hasVideo = false) : (hasVideo = true);

    if (browser == 'Safari' && !isAndWechat && cdnUrl.length !== 0) {
        videoElement.src = cdnUrl[0];
        //videoElement.load();
        //videoElement.muted = false;
    } else if (cdnUrl.length !== 0) {
        const flvUrl = cdnUrl[0];
        // const flvUrl = 'https://hdl-wsdemo.zego.im/livestream/test259.flv';
          if (flvjs.isSupported()) {
              //若支持flv.js
              flvPlayer = flvjs.createPlayer({
                  type: 'flv',
                  isLive: true,
                  url: flvUrl,
                  hasAudio: hasAudio,
                  hasVideo: hasVideo,
              });
              flvPlayer.on(flvjs.Events.LOADING_COMPLETE, function () {
                  console.error('LOADING_COMPLETE');
                  flvPlayer.play();
              });
              flvPlayer.attachMediaElement(videoElement);
              flvPlayer.load();
              videoElement.muted = false;
              videoElement.controls = true;

              useLocalStreamList[index].player = flvPlayer;
          }
    }
}

// async function updateCdnStatus(state) {
//     const extra = { state, publishType };
//     playType = publishType;
//     const result = await zg.setRoomExtraInfo($('#roomId').val(), 'cdn', JSON.stringify(extra));
//     console.warn('result', result);
//     if (result.errorCode === 0) {
//         console.warn('updateCdnStatus suc');
//     } else {
//         console.error('updateCdnStatus err', result.errorCode);
//     }
// }
$(async () => {
    await checkAnRun();
    zg.off('roomStreamUpdate');
    zg.on('roomStreamUpdate', (roomID, updateType, streamList, extendedData) => {
        console.log('roomStreamUpdate roomID ', roomID, streamList, extendedData);
        // console.log('l', zg.stateCenter.streamList);
        if (updateType == 'ADD') {
            $('#video-container').append(`
                <video id="test" autoplay muted
                x-webkit-airplay="true"
                x5-video-player-type="h5-page"
                webkit-playsinline="true"
                playsinline></video>`
            )
            videoElement = document.getElementById('test');
            streamList.forEach(streamInfo => {
              const streamID = streamInfo.streamID;
              const cdnUrl = filterStreamList(streamInfo);

              useLocalStreamList.push(streamInfo);
              playStream(streamID, cdnUrl);
            })
        } else if (updateType == 'DELETE') {
            for (let k = 0; k < useLocalStreamList.length; k++) {
                for (let j = 0; j < streamList.length; j++) {
                    if (useLocalStreamList[k].streamID === streamList[j].streamID) {
                        console.info(useLocalStreamList[k].streamID + 'was devared');
                        const player = useLocalStreamList[k].player
                        if (player) {
                                player.pause();
                                player.unload();
                                player.detachMediaElement();
                                player.destroy();
                                useLocalStreamList[k].player = null;
                                if (flvPlayer == player) flvPlayer = null;
                        }
                        $('#video-container').html('');
                        useLocalStreamList.splice(k--, 1);

                        break;
                    }
                }
            }
        }
    });

    // zg.on('roomExtraInfoUpdate', (roomID, roomExtraInfoList) => {
    //     console.warn(`roomExtraInfoUpdate: room ${roomID} `, roomExtraInfoList);
    //     const extraInfo = roomExtraInfoList[0];
    //     if (extraInfo.key === 'cdn') {
    //         const extraData = JSON.parse(extraInfo.value);
    //         console.log(extraData);
    //         if (extraData.state === 'add') {
    //             playType = extraData.publishType;
    //             // ($('#cdnPlay')[0]).disabled = false;
    //         } else if (extraData.state === 'delete') {
    //             if (typeof cdnFlvPlayer !== 'undefined') {
    //                 if (cdnFlvPlayer != null) {
    //                     cdnFlvPlayer.pause();
    //                     cdnFlvPlayer.unload();
    //                     cdnFlvPlayer.detachMediaElement();
    //                     cdnFlvPlayer.destroy();
    //                     cdnFlvPlayer = null;
    //                 }
    //             }
    //             ($('#cdnPlay')[0]).disabled = true;
    //             $('#cdn-container').html('');
    //         }
    //     }
    // });
    $('#cdnAddPush').click(async () => {
        const result = await zg.addPublishCdnUrl(
            publishStreamId,
            //md5(appID + Math.ceil(new Date().getTime() / 1000).toString() + $('#secret').val()),
            'rtmp://wsdemo.zego.im/livestream/' + publishStreamId,
        );
        if (result.errorCode == 0) {
            console.warn('add push target success');
            // updateCdnStatus('add');
            ($('#cdnDelPush')[0]).disabled = false;
            ($('#cdnPlay')[0]).disabled = false;
        } else {
            console.warn('add push target fail ' + result.errorCode);
        }
    });

    $('#cdnDelPush').click(async () => {
        const result = await zg.removePublishCdnUrl(
            publishStreamId,
            //md5(appID + Math.ceil(new Date().getTime() / 1000).toString() + $('#secret').val()),
            'rtmp://wsdemo.zego.im/livestream/' + publishStreamId,
        );
        if (result.errorCode == 0) {
            console.warn('del push target success');
            // updateCdnStatus('delete');
            ($('#cdnDelPush')[0]).disabled = true;
            ($('#cdnPlay')[0]).disabled = true;
        } else {
            console.warn('del push target fail ' + result.errorCode);
        }
    });

    $('#cdnPlay').click(() => {
        if (!isLogin && !loginRoom) {
            alert('please enter the room');
            return;
        }
        const browser = getBrowser();
        // if (browser == 'Safari' && !isAndWechat) {
        //     cdnVideoElement.src = 'https://hls-wsdemo.zego.im/livestream/test259/playlist.m3u8';
        //     cdnVideoElement.load();
        //     cdnVideoElement.muted = false;
        // } else
        $('#cdn-container').append(`
            <video id="cdn" autoplay muted preload="auto"
            x-webkit-airplay="true"
            x5-video-player-type="h5-page"
            webkit-playsinline="true"
            playsinline></video>`
        )
        cdnVideoElement = document.getElementById('cdn')
        let hasVideo = true;
        let hasAudio = true;
        publishType === 'Video' ? (hasAudio = false) : (hasAudio = true);
        publishType === 'Audio' ? (hasVideo = false) : (hasVideo = true);
        if (flvjs.isSupported()) {
            //若支持flv.js
            if (cdnFlvPlayer != null) {
              cdnFlvPlayer.pause();
              cdnFlvPlayer.unload();
              cdnFlvPlayer.detachMediaElement();
              cdnFlvPlayer.destroy();
              cdnFlvPlayer = null;
            }
            cdnFlvPlayer = flvjs.createPlayer({
                type: 'flv',
                isLive: true,
                url: 'https://hdl-wsdemo.zego.im/livestream/' + publishStreamId + '.flv',
                hasAudio: hasAudio,
                hasVideo: hasVideo,
            });
            cdnFlvPlayer.on(flvjs.Events.LOADING_COMPLETE, function () {
                console.error('LOADING_COMPLETE');
                cdnFlvPlayer.play();
            });
            cdnFlvPlayer.attachMediaElement(cdnVideoElement);
            cdnFlvPlayer.load();
            cdnVideoElement.muted = false;
            cdnVideoElement.controls = true;
        }
    });
    $('#playCDN').click(() => {
        flvPlayer && flvPlayer.play();
    });
    $('#createRoom').unbind('click');
    $('#createRoom').click(async () => {
        // let loginSuc = false;
        const channelCount = parseInt($('#channelCount').val());
        console.error('channelCount', channelCount);
        try {
            isLogin = await enterRoom();
            isLogin && (await publish({ camera: { channelCount: channelCount } }, true));
        } catch (error) {
            console.error(error);
        }
    });
    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function () {
        if (typeof flvPlayer !== 'undefined') {
            if (flvPlayer != null) {
                flvPlayer.pause();
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
                flvPlayer = null;
            }
        }
        $('#video-container').html('');
        if (typeof cdnFlvPlayer !== 'undefined') {
            if (cdnFlvPlayer != null) {
                cdnFlvPlayer.pause();
                cdnFlvPlayer.unload();
                cdnFlvPlayer.detachMediaElement();
                cdnFlvPlayer.destroy();
                cdnFlvPlayer = null;
            }
        }
        $('#cdn-container').html('');

        ($('#cdnDelPush')[0]).disabled = true;
        ($('#cdnPlay')[0]).disabled = true;

        logout();
        isLogin = false;
    });

    // $('#secret').change(() => {
    //     if ($('#secret').val() == '') {
    //         ($('#cdnAddPush')[0]).disabled = true;
    //         ($('#cdnDelPush')[0]).disabled = true;
    //     } else {
    //         ($('#cdnAddPush')[0]).disabled = false;
    //         ($('#cdnDelPush')[0]).disabled = true;
    //     }
    // });
});
