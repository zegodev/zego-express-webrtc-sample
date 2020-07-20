import '../common';
//@ts-ignore
import md5 from 'md5';
import { checkAnRun, logout, publishStreamId, zg, appID, useLocalStreamList } from '../common';
import { getBrowser } from '../assets/utils';
import flvjs from 'flv.js';

let flvPlayer: flvjs.Player | null = null;
let cdnFlvPlayer: flvjs.Player | null = null;
const ua = navigator.userAgent.toLowerCase();
let isAndWechat = false;
const videoElement: any = document.getElementById('test');
const cdnVideoElement: any = document.getElementById('cdn');

console.warn('ua', ua);
// @ts-ignore
if ((ua.indexOf('android') > -1 || ua.indexOf('linux') > -1) && ua.match(/MicroMessenger/i) == 'micromessenger') {
    console.warn('当前浏览器为微信浏览器');
    isAndWechat = true;
}

function filterStreamList(streamList: any, streamId?: string) {
    const flv: { [index: string]: string } = {};
    const hls: { [index: string]: string } = {};
    const rtmp: { [index: string]: string } = {};

    const streamListUrl: any = [];
    let index = 0;

    // console.log(zg.stateCenter.streamList);

    streamList.forEach((item: { stream_id: string }, ind: number) => {
        if (item.stream_id == streamId) index = ind;
    });

    for (const key in streamList[index]) {
        if (key == 'urlsFLV' || key == 'urlsHttpsFLV') {
            flv[key] = streamList[index][key];
        }
        if (key == 'urlsHLS' || key == 'urlsHttpsHLS') {
            hls[key] = streamList[index][key];
        }
        if (key == 'urlsRTMP') {
            rtmp[key] = streamList[index][key];
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

    return streamListUrl.filter(function(ele: any, index: number, self: any) {
        return self.indexOf(ele) == index;
    });
}

function playStream(streamList: any) {
    const browser = getBrowser();
    let hasAudio = true;
    let playType;

    if (streamList) {
        if (streamList[0] && streamList[0].extra_info && streamList[0].extra_info.length !== 0) {
            try {
                playType = JSON.parse(streamList[0].extra_info).playType;
            } catch (err) {
                alert(err);
            }
        }
    }

    playType === 'Video' ? (hasAudio = false) : (hasAudio = true);

    if (browser == 'Safari' && !isAndWechat && useLocalStreamList.length !== 0) {
        videoElement.src = useLocalStreamList[0];
        //videoElement.load();
        //videoElement.muted = false;
    } else if (useLocalStreamList.length !== 0) {
        const flvUrl = useLocalStreamList[0];
        // const flvUrl = 'https://hdl-wsdemo.zego.im/livestream/test259.flv';
        if (streamList)
            if (flvjs.isSupported()) {
                //若支持flv.js
                flvPlayer = flvjs.createPlayer({
                    type: 'flv',
                    isLive: true,
                    url: flvUrl,
                    hasAudio: hasAudio,
                });
                flvPlayer.on(flvjs.Events.LOADING_COMPLETE, function() {
                    console.error('LOADING_COMPLETE');
                    flvPlayer!.play();
                });
                flvPlayer.attachMediaElement(videoElement);
                flvPlayer.load();
                videoElement.muted = false;
            }
    }
}
$(async () => {
    await checkAnRun();
    zg.off('roomStreamUpdate');
    zg.on('roomStreamUpdate', (roomID: string, updateType: 'ADD' | 'DELETE', streamList: any): void => {
        console.log('roomStreamUpdate roomID ', roomID, streamList);
        // console.log('l', zg.stateCenter.streamList);
        if (updateType == 'ADD') {
            useLocalStreamList.push(filterStreamList(streamList));
            playStream(streamList);
        } else if (updateType == 'DELETE') {
            for (let k = 0; k < useLocalStreamList.length; k++) {
                for (let j = 0; j < streamList.length; j++) {
                    if (useLocalStreamList[k].streamID === streamList[j].streamID) {
                        console.info(useLocalStreamList[k].streamID + 'was devared');
                        useLocalStreamList.splice(k--, 1);

                        break;
                    }
                }
            }
        }
    });

    $('#cdnAddPush').click(async () => {
        const result = await zg.addPublishCdnUrl(
            publishStreamId,
            //The calculation of the signature is recommended to be placed in the background server
            md5(appID + Math.ceil(new Date().getTime() / 1000).toString() + $('#secret').val()),
            'rtmp://wsdemo.zego.im/livestream/test259',
        );
        if (result.errorCode == 0) {
            console.warn('add push target success');
            ($('#cdnDelPush')[0] as any).disabled = false;
        } else {
            console.warn('add push target fail ' + result.errorCode);
        }
    });

    $('#cdnDelPush').click(async () => {
        const result = await zg.removePublishCdnUrl(
            publishStreamId,
            //The calculation of the signature is recommended to be placed in the background server
            md5(appID + Math.ceil(new Date().getTime() / 1000).toString() + $('#secret').val()),
            'rtmp://wsdemo.zego.im/livestream/test259',
        );
        if (result.errorCode == 0) {
            console.warn('del push target success');
            ($('#cdnDelPush')[0] as any).disabled = true;
        } else {
            console.warn('del push target fail ' + result.errorCode);
        }
    });

    $('#cdnPlay').click(() => {
        const browser = getBrowser();
        // if (browser == 'Safari' && !isAndWechat) {
        //     cdnVideoElement.src = 'https://hls-wsdemo.zego.im/livestream/test259/playlist.m3u8';
        //     cdnVideoElement.load();
        //     cdnVideoElement.muted = false;
        // } else
        if (flvjs.isSupported()) {
            //若支持flv.js
            cdnFlvPlayer = flvjs.createPlayer({
                type: 'flv',
                isLive: true,
                url: 'https://hdl-wsdemo.zego.im/livestream/test259.flv',
                hasAudio: true,
            });
            cdnFlvPlayer.on(flvjs.Events.LOADING_COMPLETE, function() {
                console.error('LOADING_COMPLETE');
                cdnFlvPlayer!.play();
            });
            cdnFlvPlayer.attachMediaElement(cdnVideoElement);
            cdnFlvPlayer.load();
            cdnVideoElement.muted = false;
        }
    });
    $('#playCDN').click(() => {
        flvPlayer && flvPlayer.play();
    });
    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        if (typeof flvPlayer !== 'undefined') {
            if (flvPlayer != null) {
                flvPlayer.pause();
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
                flvPlayer = null;
            }
        }

        logout();
    });

    $('#secret').change(() => {
        if ($('#secret').val() == '') {
            ($('#cdnAddPush')[0] as any).disabled = true;
            ($('#cdnDelPush')[0] as any).disabled = true;
        } else {
            ($('#cdnAddPush')[0] as any).disabled = false;
            ($('#cdnDelPush')[0] as any).disabled = true;
        }
    });
});
