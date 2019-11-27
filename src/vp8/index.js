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
var vconsole_1 = __importDefault(require("vconsole"));
require("../assets/bootstrap.min");
require("../assets/bootstrap.min.css");
var webrtc_zego_express_1 = require("webrtc-zego-express");
new vconsole_1.default();
var zg;
var appId = 96527232;
var server = 'wss://wssliveroom-test.zego.im/ws'; //'wss://wsliveroom' + appId + '-api.zego.im:8282/ws';
var userId = 'sample' + new Date().getTime();
var previewVideo;
var useLocalStreamList = [];
var isPreviewed = false;
var publishStreamId = 'webrtc' + new Date().getTime();
var localStream;
var taskId = 'task-' + new Date().getTime();
var mixStreamId = 'mix-' + publishStreamId;
var videoDecodeType = 'H264';
function checkAnRun() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('sdk version is', webrtc_zego_express_1.ZegoClient.getCurrentVersion());
                    return [4 /*yield*/, webrtc_zego_express_1.ZegoClient.detectRTC()];
                case 1:
                    result = _a.sent();
                    videoDecodeType = result.videoDecodeType.VP8 ? 'VP8' : (result.videoDecodeType.H264 ? 'H264' : undefined);
                    $("#videoCodeType option:eq(0)").val(videoDecodeType ? videoDecodeType : '');
                    !result.videoDecodeType.H264 && $('#videoCodeType option:eq(1)').attr('disabled', 'disabled');
                    !result.videoDecodeType.VP8 && $('#videoCodeType option:eq(2)').attr('disabled', 'disabled');
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
                        start();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            initSDK();
            $('#createRoom').click(function () { return __awaiter(_this, void 0, void 0, function () {
                var extraInfo, loginSuc, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if ($('#videoDecodeType').val()) {
                                videoDecodeType = $('#videoDecodeType').val();
                            }
                            extraInfo = JSON.stringify({
                                currentVideoCode: videoDecodeType,
                                mixStreamId: mixStreamId
                            });
                            return [4 /*yield*/, enterRoom()];
                        case 1:
                            loginSuc = _b.sent();
                            _a = loginSuc;
                            if (!_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, push({ extraInfo: extraInfo, videoDecodeType: videoDecodeType })];
                        case 2:
                            _a = (_b.sent());
                            _b.label = 3;
                        case 3:
                            _a;
                            return [2 /*return*/];
                    }
                });
            }); });
            $('#openRoom').click(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if ($('#videoDecodeType').val()) {
                                videoDecodeType = $('#videoDecodeType').val();
                            }
                            return [4 /*yield*/, enterRoom()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            $('#leaveRoom').click(function () {
                logout();
            });
            return [2 /*return*/];
        });
    });
}
function initSDK() {
    var _this = this;
    zg = new webrtc_zego_express_1.ZegoClient(appId, server, userId);
    enumDevices();
    zg.on('roomStateUpdate', function (state, error) {
        console.log('roomStateUpdate', state, error.code, error.msg);
    });
    zg.on('publishStateChange', function (stateInfo) {
        if (stateInfo.type == 0) {
            console.info(' publish  success');
            mixStream();
        }
        else if (stateInfo.type == 2) {
            console.info(' publish  retry');
        }
        else {
            console.error('publish error ' + stateInfo.error.msg);
            var _msg = stateInfo.error.msg;
            // if (stateInfo.error.msg.indexOf ('server session closed, reason: ') > -1) {
            //         const code = stateInfo.error.msg.replace ('server session closed, reason: ', '');
            //         if (code === '21') {
            //                 _msg = '音频编解码不支持(opus)';
            //         } else if (code === '22') {
            //                 _msg = '视频编解码不支持(H264)'
            //         } else if (code === '20') {
            //                 _msg = 'sdp 解释错误';
            //         }
            // }
            alert('推流失败,reason = ' + _msg);
        }
    });
    zg.on('pullStateChange', function (stateInfo) {
        if (stateInfo.type == 0) {
            console.info(' play  success');
        }
        else if (stateInfo.type == 2) {
            console.info(' play  retry');
        }
        else {
            console.error('publish error ' + stateInfo.error.msg);
            var _msg = stateInfo.error.msg;
            // if (stateInfo.error.msg.indexOf ('server session closed, reason: ') > -1) {
            //         const code = stateInfo.error.msg.replace ('server session closed, reason: ', '');
            //         if (code === '21') {
            //                 _msg = '音频编解码不支持(opus)';
            //         } else if (code === '22') {
            //                 _msg = '视频编解码不支持(H264)'
            //         } else if (code === '20') {
            //                 _msg = 'sdp 解释错误';
            //         }
            // }
            alert('拉流失败,reason = ' + _msg);
        }
    });
    zg.on('remoteStreamUpdated', function (type, streamList) { return __awaiter(_this, void 0, void 0, function () {
        var i, remoteStream, video, k, j, extraInfoObject;
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
                    $('#memberList').append('<option value="' + streamList[i].userId + '">' + streamList[i].userName + '</option>');
                    $('.remoteVideo').append($('<video  autoplay muted playsinline></video>'));
                    return [4 /*yield*/, getRemoteByCodeType(useLocalStreamList[i])];
                case 2:
                    remoteStream = _a.sent();
                    video = $('.remoteVideo video:eq(' + i + ')')[0];
                    video.srcObject = remoteStream;
                    video.muted = false;
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
                                    extraInfoObject = JSON.parse(useLocalStreamList[k].extraInfo);
                                    zg.stopRemoteStream(useLocalStreamList[k].streamId);
                                    extraInfoObject.mixStreamId && zg.stopRemoteStream(extraInfoObject.mixStreamId);
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
    zg.getStats(5000, function (stats) {
        console.log('stream quality', stats);
    });
}
function enumDevices() {
    return __awaiter(this, void 0, void 0, function () {
        var audioInputList, videoInputList, deviceInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    audioInputList = [], videoInputList = [];
                    return [4 /*yield*/, zg.enumDevices()];
                case 1:
                    deviceInfo = _a.sent();
                    deviceInfo && deviceInfo.microphones.map(function (item, index) {
                        if (!item.label) {
                            item.label = 'microphone' + index;
                        }
                        audioInputList.push(' <option value="' + item.deviceId + '">' + item.label + '</option>');
                        console.log('microphone: ' + item.label);
                        return item;
                    });
                    deviceInfo && deviceInfo.cameras.map(function (item, index) {
                        if (!item.label) {
                            item.label = 'camera' + index;
                        }
                        videoInputList.push(' <option value="' + item.deviceId + '">' + item.label + '</option>');
                        console.log('camera: ' + item.label);
                        return item;
                    });
                    audioInputList.push('<option value="0">禁止</option>');
                    videoInputList.push('<option value="0">禁止</option>');
                    $('#audioList').html(audioInputList.join(''));
                    $('#videoList').html(videoInputList.join(''));
                    return [2 /*return*/];
            }
        });
    });
}
function mixStream() {
    return __awaiter(this, void 0, void 0, function () {
        var streamList, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    streamList = [{
                            streamId: publishStreamId,
                            layout: {
                                top: 0,
                                left: 0,
                                bottom: 480,
                                right: 640,
                            }
                        }];
                    return [4 /*yield*/, zg.startMixStream({
                            taskId: taskId,
                            inputList: streamList,
                            outputList: [{
                                    streamId: mixStreamId,
                                    outputUrl: '',
                                    outputBitrate: 300 * 1000,
                                    outputFps: 15,
                                    outputWidth: 640,
                                    outputHeight: 480
                                }],
                            advance: {
                                videoCodec: videoDecodeType === 'VP8' ? 'h264' : 'vp8'
                            }
                        })];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/];
            }
        });
    });
}
function login(roomId) {
    return __awaiter(this, void 0, void 0, function () {
        var token, streamInfos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.get('https://wsliveroom-alpha.zego.im:8282/token', { 'app_id': appId, 'id_name': userId })];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, zg.login(roomId, token)];
                case 2:
                    streamInfos = _a.sent();
                    return [2 /*return*/, streamInfos];
            }
        });
    });
}
function enterRoom() {
    return __awaiter(this, void 0, void 0, function () {
        var roomId, index, remoteStream, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    roomId = $('#roomId').val();
                    if (!roomId) {
                        alert('roomId is empty');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, login(roomId)];
                case 1:
                    useLocalStreamList = _a.sent();
                    if (!(useLocalStreamList && useLocalStreamList.length > 0)) return [3 /*break*/, 5];
                    index = 0;
                    _a.label = 2;
                case 2:
                    if (!(index < useLocalStreamList.length)) return [3 /*break*/, 5];
                    $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));
                    $('#memberList').append('<option value="' + useLocalStreamList[index].userId + '">' + useLocalStreamList[index].userName + '</option>');
                    return [4 /*yield*/, getRemoteByCodeType(useLocalStreamList[index])];
                case 3:
                    remoteStream = _a.sent();
                    video = $('.remoteVideo video:eq(' + index + ')')[0];
                    video.srcObject = remoteStream;
                    video.muted = false;
                    _a.label = 4;
                case 4:
                    index++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
function logout() {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            console.info('leave room  and close stream');
            // 停止推流
            if (isPreviewed) {
                zg.stopPublishLocalStream(publishStreamId);
                zg.destroyLocalStream(localStream);
                isPreviewed = false;
            }
            // 停止拉流
            for (i = 0; i < useLocalStreamList.length; i++) {
                zg.stopRemoteStream(useLocalStreamList[i].streamId);
            }
            // 清空页面
            useLocalStreamList = [];
            $('.remoteVideo').html('');
            //退出登录
            zg.logout();
            return [2 /*return*/];
        });
    });
}
function getRemoteByCodeType(stream) {
    return __awaiter(this, void 0, void 0, function () {
        var extraInfo, streamId, _stream, extraInfoObject;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    extraInfo = stream.extraInfo, streamId = stream.streamId;
                    _stream = null;
                    if (!extraInfo) return [3 /*break*/, 4];
                    extraInfoObject = JSON.parse(extraInfo);
                    if (!(extraInfoObject.currentVideoCode !== videoDecodeType)) return [3 /*break*/, 2];
                    streamId = extraInfoObject.mixStreamId;
                    extraInfoObject.currentVideoCode = videoDecodeType;
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var $stream;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, zg.getRemoteStream(streamId, { videoDecodeType: videoDecodeType })];
                                        case 1:
                                            $stream = _a.sent();
                                            resolve($stream);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 2000);
                        })];
                case 1:
                    _stream = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, zg.getRemoteStream(streamId, { videoDecodeType: videoDecodeType })];
                case 3:
                    _stream = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, _stream];
            }
        });
    });
}
function push(publishOption) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zg.createLocalStream()];
                case 1:
                    localStream = _a.sent();
                    previewVideo.srcObject = localStream;
                    isPreviewed = true;
                    result = zg.publishLocalStream(publishStreamId, localStream, publishOption);
                    console.log('publish stream' + publishStreamId, result);
                    return [2 /*return*/];
            }
        });
    });
}
function setConfig(param) {
    param.appId && (appId = param.appId);
}
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkAnRun()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
