import '../common';
import md5 from 'md5';
import { checkAnRun, logout, publishStreamId, zg, appID, useLocalStreamList } from '../common';
import { getBrowser } from '../assets/utils';
import flvjs from 'flv.js';

let flvPlayer: flvjs.Player | null = null;
const ua = navigator.userAgent.toLowerCase();
let isAndWechat = false;
const videoElement: any = document.getElementById('test');

console.error('ua', ua);
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

    console.log(zg.stateCenter.streamList);

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
            md5(appID + Math.ceil(new Date().getTime() / 1000).toString() + '1ec3f85cb2f21370264eb371c8c65ca3'),
            'rtmp://wsdemo.zego.im/livestream/test123',
        );
        if (result.errorCode == 0) {
            console.warn('add push target success');
        } else {
            console.warn('add push target fail ' + result.errorCode);
        }
    });

    $('#cdnDelPush').click(async () => {
        const result = await zg.removePublishCdnUrl(
            publishStreamId,
            md5(appID + Math.ceil(new Date().getTime() / 1000).toString() + '1ec3f85cb2f21370264eb371c8c65ca3'),
            'rtmp://wsdemo.zego.im/livestream/test123',
        );
        if (result.errorCode == 0) {
            console.warn('del push target success');
        } else {
            console.warn('del push target fail ' + result.errorCode);
        }
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
});
