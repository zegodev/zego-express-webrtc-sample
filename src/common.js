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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-use-before-define */
var vconsole_1 = __importDefault(require("vconsole"));
require("./assets/bootstrap.min");
require("./assets/bootstrap.min.css");
var webrtc_zego_express_1 = require("webrtc-zego-express");
var content_1 = require("./content");
new vconsole_1.default();
var userID = 'sample' + new Date().getTime();
exports.userID = userID;
var userName = 'sampleUser' + new Date().getTime();
var tokenUrl = 'https://wsliveroom-demo.zego.im:8282/token';
var publishStreamId = 'webrtc' + new Date().getTime();
exports.publishStreamId = publishStreamId;
var zg;
exports.zg = zg;
var appID = 1739272706;
// let server = 'wss://webliveroom-test.zego.im/ws'; //'wss://wsliveroom' + appID + '-api.zego.im:8282/ws'
var server = 'wss://wssliveroom-test.zego.im/ws'; //'wss://wsliveroom' + appID + '-api.zego.im:8282/ws'
var cgiToken = '';
//const appSign = '';
var previewVideo;
var useLocalStreamList = [];
exports.useLocalStreamList = useLocalStreamList;
var isPreviewed = false;
var localStream;
// 测试用代码，开发者请忽略
// Test code, developers please ignore
(_a = content_1.getCgi(appID, server, cgiToken), appID = _a.appID, server = _a.server, cgiToken = _a.cgiToken);
if (cgiToken && tokenUrl == 'https://wsliveroom-demo.zego.im:8282/token') {
    $.get(cgiToken, function (rsp) {
        cgiToken = rsp.data;
        console.log(cgiToken);
    });
}
// 测试用代码 end
// Test code end
// eslint-disable-next-line prefer-const
exports.zg = zg = new webrtc_zego_express_1.ZegoExpressEngine(appID, server);
function checkAnRun(checkScreen) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('sdk version is', zg.getVersion());
                    return [4 /*yield*/, zg.checkSystemRequirements()];
                case 1:
                    result = _a.sent();
                    !result.videoCodec.H264 && $('#videoCodeType option:eq(1)').attr('disabled', 'disabled');
                    !result.videoCodec.VP8 && $('#videoCodeType option:eq(2)').attr('disabled', 'disabled');
                    if (!result.webRTC) {
                        alert('browser is not support webrtc!!');
                        return [2 /*return*/, false];
                    }
                    else if (!result.videoCodec.H264 && !result.videoCodec.VP8) {
                        alert('browser is not support H264 and VP8');
                        return [2 /*return*/, false];
                    }
                    else if (checkScreen && !result.screenSharing) {
                        alert('browser is not support screenSharing');
                    }
                    else {
                        previewVideo = $('#previewVideo')[0];
                        start();
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkAnRun = checkAnRun;
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            initSDK();
            zg.setLogConfig({
                logLevel: 'debug',
                remoteLogLevel: 'info',
                logURL: '',
            });
            // zg.config({ userUpdate: true });
            // zg.setDebugVerbose(true);
            $('#createRoom').click(function () { return __awaiter(_this, void 0, void 0, function () {
                var loginSuc, _a, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            loginSuc = false;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, enterRoom()];
                        case 2:
                            loginSuc = _b.sent();
                            _a = loginSuc;
                            if (!_a) return [3 /*break*/, 4];
                            return [4 /*yield*/, push()];
                        case 3:
                            _a = (_b.sent());
                            _b.label = 4;
                        case 4:
                            _a;
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _b.sent();
                            console.error(error_1);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            $('#openRoom').click(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, enterRoom()];
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
                    deviceInfo &&
                        deviceInfo.microphones.map(function (item, index) {
                            if (!item.deviceName) {
                                item.deviceName = 'microphone' + index;
                            }
                            audioInputList.push(' <option value="' + item.deviceID + '">' + item.deviceName + '</option>');
                            console.log('microphone: ' + item.deviceName);
                            return item;
                        });
                    deviceInfo &&
                        deviceInfo.cameras.map(function (item, index) {
                            if (!item.deviceName) {
                                item.deviceName = 'camera' + index;
                            }
                            videoInputList.push(' <option value="' + item.deviceID + '">' + item.deviceName + '</option>');
                            console.log('camera: ' + item.deviceName);
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
function initSDK() {
    var _this = this;
    enumDevices();
    zg.on('roomStateUpdate', function (roomID, state, errorCode, extendedData) {
        console.log('roomStateUpdate: ', roomID, state, errorCode, extendedData);
    });
    zg.on('roomUserUpdate', function (roomID, updateType, userList) {
        console.warn("roomUserUpdate: room " + roomID + ", user " + (updateType === 'ADD' ? 'added' : 'left') + " ", JSON.stringify(userList));
    });
    zg.on('publisherStateUpdate', function (result) {
        console.log('publisherStateUpdate: ', result.streamID);
        if (result.state == 'PUBLISHING') {
            console.info(' publish  success');
        }
        else if (result.state == 'PUBLISH_REQUESTING') {
            console.info(' publish  retry');
        }
        else {
            console.error('publish error ' + result.errorCode);
            // const _msg = stateInfo.error.msg;
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
            // alert('推流失败,reason = ' + _msg);
        }
    });
    zg.on('playerStateUpdate', function (result) {
        console.log('playerStateUpdate', result.streamID);
        if (result.state == 'PLAYING') {
            console.info(' play  success');
        }
        else if (result.state == 'PLAY_REQUESTING') {
            console.info(' play  retry');
        }
        else {
            console.error('publish error ' + result.errorCode);
            // const _msg = stateInfo.error.msg;
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
            // alert('拉流失败,reason = ' + _msg);
        }
    });
    zg.on('roomStreamUpdate', function (roomID, updateType, streamList) { return __awaiter(_this, void 0, void 0, function () {
        var i, remoteStream, error_2, video, k, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('roomStreamUpdate roomID ', roomID, streamList);
                    if (!(updateType == 'ADD')) return [3 /*break*/, 8];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < streamList.length)) return [3 /*break*/, 7];
                    console.info(streamList[i].streamID + ' was added');
                    useLocalStreamList.push(streamList[i]);
                    remoteStream = void 0;
                    $('.remoteVideo').append($('<video  autoplay muted playsinline controls></video>'));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, zg.startPlayingStream(streamList[i].streamID)];
                case 3:
                    remoteStream = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 7];
                case 5:
                    video = $('.remoteVideo video:last')[0];
                    video.srcObject = remoteStream;
                    video.muted = false;
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 1];
                case 7: return [3 /*break*/, 9];
                case 8:
                    if (updateType == 'DELETE') {
                        for (k = 0; k < useLocalStreamList.length; k++) {
                            for (j = 0; j < streamList.length; j++) {
                                if (useLocalStreamList[k].streamID === streamList[j].streamID) {
                                    try {
                                        zg.stopPlayingStream(useLocalStreamList[k].streamID);
                                    }
                                    catch (error) {
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
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    }); });
    zg.on('playQualityUpdate', function (streamID, streamQuality) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("play#" + streamID + " videoFPS: " + streamQuality.video.videoFPS + " videoBitrate: " + streamQuality.video.videoBitrate + " audioBitrate: " + streamQuality.audio.audioBitrate);
            return [2 /*return*/];
        });
    }); });
    zg.on('publishQualityUpdate', function (streamID, streamQuality) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("publish#" + streamID + " videoFPS: " + streamQuality.video.videoFPS + " videoBitrate: " + streamQuality.video.videoBitrate + " audioBitrate: " + streamQuality.audio.audioBitrate);
            return [2 /*return*/];
        });
    }); });
    zg.on('remoteCameraStatusUpdate', function (streamID, status) {
        console.warn(streamID + " camera status " + (status == 'OPEN' ? 'open' : 'close'));
    });
    zg.on('remoteMicStatusUpdate', function (streamID, status) {
        console.warn(streamID + " micro status " + (status == 'OPEN' ? 'open' : 'close'));
    });
}
function login(roomId) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = '';
                    if (!cgiToken) return [3 /*break*/, 2];
                    return [4 /*yield*/, $.get(tokenUrl, {
                            app_id: appID,
                            id_name: userID,
                            cgi_token: cgiToken,
                        })];
                case 1:
                    token = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, $.get('https://wsliveroom-alpha.zego.im:8282/token', {
                        app_id: appID,
                        id_name: userID,
                    })];
                case 3:
                    token = _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, zg.loginRoom(roomId, token, { userID: userID, userName: userName }, { userUpdate: true })];
                case 5: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function enterRoom() {
    return __awaiter(this, void 0, void 0, function () {
        var roomId;
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
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.enterRoom = enterRoom;
function logout() {
    return __awaiter(this, void 0, void 0, function () {
        var i, roomId;
        return __generator(this, function (_a) {
            console.info('leave room  and close stream');
            // 停止推流
            // stop publishing
            if (isPreviewed) {
                zg.stopPublishingStream(publishStreamId);
                zg.destroyStream(localStream);
                isPreviewed = false;
            }
            // 停止拉流
            // stop playing
            for (i = 0; i < useLocalStreamList.length; i++) {
                zg.stopPlayingStream(useLocalStreamList[i].streamID);
            }
            // 清空页面
            // Clear page
            exports.useLocalStreamList = useLocalStreamList = [];
            $('.remoteVideo').html('');
            roomId = $('#roomId').val();
            zg.logoutRoom(roomId);
            return [2 /*return*/];
        });
    });
}
exports.logout = logout;
function push(publishOption) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zg.createStream()];
                case 1:
                    localStream = _a.sent();
                    previewVideo.srcObject = localStream;
                    isPreviewed = true;
                    result = zg.startPublishingStream(publishStreamId, localStream, publishOption);
                    console.log('publish stream' + publishStreamId, result);
                    return [2 /*return*/];
            }
        });
    });
}
exports.push = push;
$('#toggleCamera').click(function () {
    zg.mutePublishStreamVideo(previewVideo.srcObject, $(this).hasClass('disabled'));
    $(this).toggleClass('disabled');
});
$('#toggleSpeaker').click(function () {
    zg.mutePublishStreamAudio(previewVideo.srcObject, $(this).hasClass('disabled'));
    $(this).toggleClass('disabled');
});
$(window).on('unload', function () {
    logout();
});
