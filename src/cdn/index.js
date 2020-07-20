"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../common");
var md5_1 = __importDefault(require("md5"));
var common_1 = require("../common");
var utils_1 = require("../assets/utils");
var flv_js_1 = __importDefault(require("flv.js"));
var flvPlayer = null;
var ua = navigator.userAgent.toLowerCase();
var isAndWechat = false;
var videoElement = document.getElementById('test');
console.error('ua', ua);
// @ts-ignore
if ((ua.indexOf('android') > -1 || ua.indexOf('linux') > -1) && ua.match(/MicroMessenger/i) == 'micromessenger') {
    console.warn('当前浏览器为微信浏览器');
    isAndWechat = true;
}
function filterStreamList(streamList, streamId) {
    var flv = {};
    var hls = {};
    var rtmp = {};
    var streamListUrl = [];
    var index = 0;
    console.log(common_1.zg.stateCenter.streamList);
    streamList.forEach(function (item, ind) {
        if (item.stream_id == streamId)
            index = ind;
    });
    for (var key in streamList[index]) {
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
    var pro = window.location.protocol;
    var browser = utils_1.getBrowser();
    if (browser == 'Safari' && !isAndWechat) {
        for (var key in hls) {
            if (hls[key]) {
                if (hls[key].indexOf(pro) !== -1)
                    streamListUrl.push(hls[key]);
                else if (pro == 'https:' && hls[key].indexOf('https') === -1) {
                    streamListUrl.push(hls[key].replace('http', 'https'));
                }
            }
        }
    }
    else if (pro == 'http:') {
        for (var key in flv) {
            if (flv[key]) {
                if (flv[key].indexOf('http') !== -1 || flv[key].indexOf('https') !== -1)
                    streamListUrl.push(flv[key]);
            }
        }
    }
    else if (pro == 'https:') {
        for (var key in flv) {
            if (flv[key]) {
                if (flv[key].indexOf('https') === -1)
                    streamListUrl.push(flv[key].replace('http', 'https'));
                else if (flv[key].indexOf(pro) !== -1) {
                    streamListUrl.push(flv[key]);
                }
            }
        }
    }
    else if (pro == 'rtmp:') {
        for (var key in rtmp) {
            if (rtmp[key]) {
                if (rtmp[key].indexOf(pro) !== -1)
                    streamListUrl.push(rtmp[key]);
            }
        }
    }
    return streamListUrl.filter(function (ele, index, self) {
        return self.indexOf(ele) == index;
    });
}
function playStream(streamList) {
    var browser = utils_1.getBrowser();
    var hasAudio = true;
    var playType;
    if (streamList) {
        if (streamList[0] && streamList[0].extra_info && streamList[0].extra_info.length !== 0) {
            try {
                playType = JSON.parse(streamList[0].extra_info).playType;
            }
            catch (err) {
                alert(err);
            }
        }
    }
    playType === 'Video' ? (hasAudio = false) : (hasAudio = true);
    if (browser == 'Safari' && !isAndWechat && common_1.useLocalStreamList.length !== 0) {
        videoElement.src = common_1.useLocalStreamList[0];
        //videoElement.load();
        //videoElement.muted = false;
    }
    else if (common_1.useLocalStreamList.length !== 0) {
        var flvUrl = common_1.useLocalStreamList[0];
        if (streamList)
            if (flv_js_1.default.isSupported()) {
                //若支持flv.js
                flvPlayer = flv_js_1.default.createPlayer({
                    type: 'flv',
                    isLive: true,
                    url: flvUrl,
                    hasAudio: hasAudio,
                });
                flvPlayer.on(flv_js_1.default.Events.LOADING_COMPLETE, function () {
                    console.error('LOADING_COMPLETE');
                    flvPlayer.play();
                });
                flvPlayer.attachMediaElement(videoElement);
                flvPlayer.load();
                videoElement.muted = false;
            }
    }
}
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, common_1.checkAnRun()];
            case 1:
                _a.sent();
                common_1.zg.off('roomStreamUpdate');
                common_1.zg.on('roomStreamUpdate', function (roomID, updateType, streamList) {
                    console.log('roomStreamUpdate roomID ', roomID, streamList);
                    if (updateType == 'ADD') {
                        common_1.useLocalStreamList.push(filterStreamList(streamList));
                        playStream(streamList);
                    }
                    else if (updateType == 'DELETE') {
                        for (var k = 0; k < common_1.useLocalStreamList.length; k++) {
                            for (var j = 0; j < streamList.length; j++) {
                                if (common_1.useLocalStreamList[k].streamID === streamList[j].streamID) {
                                    console.info(common_1.useLocalStreamList[k].streamID + 'was devared');
                                    common_1.useLocalStreamList.splice(k--, 1);
                                    break;
                                }
                            }
                        }
                    }
                });
                $('#cdnAddPush').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, common_1.zg.addPublishCdnUrl(common_1.publishStreamId, md5_1.default(common_1.appID + Math.ceil(new Date().getTime() / 1000).toString() + '1ec3f85cb2f21370264eb371c8c65ca3'), 'rtmp://wsdemo.zego.im/livestream/test123')];
                            case 1:
                                result = _a.sent();
                                if (result.errorCode == 0) {
                                    console.warn('add push target success');
                                }
                                else {
                                    console.warn('add push target fail ' + result.errorCode);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                $('#cdnDelPush').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, common_1.zg.removePublishCdnUrl(common_1.publishStreamId, md5_1.default(common_1.appID + Math.ceil(new Date().getTime() / 1000).toString() + '1ec3f85cb2f21370264eb371c8c65ca3'), 'rtmp://wsdemo.zego.im/livestream/test123')];
                            case 1:
                                result = _a.sent();
                                if (result.errorCode == 0) {
                                    console.warn('del push target success');
                                }
                                else {
                                    console.warn('del push target fail ' + result.errorCode);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
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
                    common_1.logout();
                });
                return [2 /*return*/];
        }
    });
}); });
