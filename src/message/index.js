"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var webrtc_zego_express_1 = require("webrtc-zego-express");
require("../common");
var zg;
var appId = 1739272706;
var server = 'wss://wsliveroom' + appId + '-api.zego.im:8282/ws';
var userId = 'sample' + new Date().getTime();
var previewVideo;
var useLocalStreamList = [];
// 检测浏览器是否支持
$(function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('sdk version is', webrtc_zego_express_1.ZegoClient.getCurrentVersion());
                return [4 /*yield*/, webrtc_zego_express_1.ZegoClient.detectRTC()];
            case 1:
                result = _a.sent();
                if (!result.webRtc) {
                    alert('browser is not support webrtc!!');
                    return [2 /*return*/, false];
                }
                else if ((!result.videoDecodeType.H264 && !result.videoDecodeType.VP8)) {
                    alert('browser is not support H264 and VP8');
                    return [2 /*return*/, false];
                }
                else {
                    previewVideo = $('#previewVideo')[0];
                    initSDK();
                }
                return [2 /*return*/];
        }
    });
}); });
function initSDK() {
    var _this = this;
    zg = new webrtc_zego_express_1.ZegoClient(appId, server, userId);
    zg.on('roomStateUpdate', function (state, reason, roomid) {
        console.log(state, reason, roomid);
    });
    zg.on('publishStateChange', function () {
        var stateInfo = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stateInfo[_i] = arguments[_i];
        }
        console.log(stateInfo);
    });
    zg.on('pullStateChange', function () {
        var stateInfo = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stateInfo[_i] = arguments[_i];
        }
        console.log(stateInfo);
    });
    zg.on('remoteStreamUpdated', function (type, streamList) { return __awaiter(_this, void 0, void 0, function () {
        var i, remoteStream, k, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(type == 0)) return [3 /*break*/, 5];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < streamList.length)) return [3 /*break*/, 4];
                    console.info(streamList[i].streamId + ' was added');
                    useLocalStreamList.push(streamList[i]);
                    $('#memberList').append('<option value="' + streamList[i].anchorIdName + '">' + streamList[i].anchorNickName + '</option>');
                    $('.remoteVideo').append($('<video  autoplay muted playsinline></video>'));
                    return [4 /*yield*/, zg.getRemoteStream(streamList[i].streamId)];
                case 2:
                    remoteStream = _a.sent();
                    $('.remoteVideo video:last-child')[0].srcObject = remoteStream;
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 6];
                case 5:
                    if (type == 1) {
                        for (k = 0; k < useLocalStreamList.length; k++) {
                            for (j = 0; j < streamList.length; j++) {
                                if (useLocalStreamList[k].streamId === streamList[j].streamId) {
                                    zg.stopRemoteStream(useLocalStreamList[k].streamId);
                                    console.info(useLocalStreamList[k].streamId + 'was devared');
                                    useLocalStreamList.splice(k, 1);
                                    $('.remoteVideo video:eq(' + k + ')').remove();
                                    $('#memberList option:eq(' + k + ')').remove();
                                    break;
                                }
                            }
                        }
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); });
}
function login(roomId, isPublish) {
    return __awaiter(this, void 0, void 0, function () {
        var token, streamInfos, index, remoteStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.get('https://wsliveroom-alpha.zego.im:8282/token', { 'app_id': appId, 'id_name': userId })];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, zg.login(roomId, token)];
                case 2:
                    streamInfos = _a.sent();
                    if (!(streamInfos && streamInfos.length > 0)) return [3 /*break*/, 7];
                    index = 0;
                    _a.label = 3;
                case 3:
                    if (!(index < streamInfos.length)) return [3 /*break*/, 6];
                    $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));
                    $('#memberList').append('<option value="' + streamInfos[index].anchorIdName + '">' + streamInfos[index].anchorNickName + '</option>');
                    return [4 /*yield*/, zg.getRemoteStream(streamInfos[index].streamId)];
                case 4:
                    remoteStream = _a.sent();
                    $('.remoteVideo video:eq(' + index + ')')[0].srcObject = remoteStream;
                    _a.label = 5;
                case 5:
                    index++;
                    return [3 /*break*/, 3];
                case 6:
                    useLocalStreamList = streamInfos;
                    _a.label = 7;
                case 7:
                    if (!isPublish) return [3 /*break*/, 9];
                    return [4 /*yield*/, push()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function push() {
    return __awaiter(this, void 0, void 0, function () {
        var localStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zg.createLocalStream()];
                case 1:
                    localStream = _a.sent();
                    previewVideo.srcObject = localStream;
                    return [2 /*return*/];
            }
        });
    });
}
