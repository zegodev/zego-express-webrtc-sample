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
var common_1 = require("../common");
var utils_1 = require("../assets/utils");
var flv_js_1 = __importDefault(require("flv.js"));
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    var taskID, mixStreamID, mixVideo, hlsUrl, flvPlayer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, common_1.checkAnRun()];
            case 1:
                _a.sent();
                $('');
                taskID = 'task-' + new Date().getTime();
                mixStreamID = 'mixwebrtc-' + new Date().getTime();
                mixVideo = $('#mixVideo')[0];
                flvPlayer = null;
                $('#mixStream').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var streamList, res, result, flvUrl, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                streamList = [
                                    {
                                        streamID: common_1.publishStreamId,
                                        contentType: '',
                                        layout: {
                                            top: 0,
                                            left: 0,
                                            bottom: 240,
                                            right: 320,
                                        },
                                    },
                                ];
                                if (common_1.useLocalStreamList.length !== 0) {
                                    streamList.push({
                                        streamID: common_1.useLocalStreamList[0].streamID,
                                        contentType: '',
                                        layout: {
                                            top: 240,
                                            left: 0,
                                            bottom: 480,
                                            right: 320,
                                        },
                                    });
                                }
                                return [4 /*yield*/, common_1.zg.startMixerTask({
                                        taskID: taskID,
                                        inputList: streamList,
                                        outputList: [
                                            mixStreamID,
                                        ],
                                        outputConfig: {
                                            outputBitrate: 300,
                                            outputFPS: 15,
                                            outputWidth: 320,
                                            outputHeight: 480,
                                        },
                                    })];
                            case 1:
                                res = _a.sent();
                                if (res.errorCode == 0) {
                                    $('#stopMixStream').removeAttr('disabled');
                                    result = JSON.parse(res.extendedData).mixerOutputList;
                                    if (navigator.userAgent.indexOf('iPhone') !== -1 &&
                                        utils_1.getBrowser() == 'Safari' &&
                                        result &&
                                        result[0].hlsURL) {
                                        hlsUrl = result[0].hlsURL.replace('http', 'https');
                                        mixVideo.src = hlsUrl;
                                    }
                                    else if (result && result[0].flvURL) {
                                        flvUrl = result[0].flvURL.replace('http', 'https');
                                        console.log('mixStreamId: ' + mixStreamID);
                                        console.log('mixStreamUrl:' + flvUrl);
                                        alert('混流开始。。。');
                                        if (flv_js_1.default.isSupported()) {
                                            flvPlayer = flv_js_1.default.createPlayer({
                                                type: 'flv',
                                                url: flvUrl,
                                            });
                                            flvPlayer.attachMediaElement(mixVideo);
                                            flvPlayer.load();
                                        }
                                    }
                                    mixVideo.muted = false;
                                }
                                $('#mixVideo').css('display', '');
                                return [3 /*break*/, 3];
                            case 2:
                                err_1 = _a.sent();
                                alert('混流失败。。。');
                                console.error('err: ', err_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                $('#stopMixStream').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, common_1.zg.stopMixerTask(taskID)];
                            case 1:
                                _a.sent();
                                alert('停止混流成功。。。');
                                if (flvPlayer) {
                                    flvPlayer.destroy();
                                    flvPlayer = null;
                                }
                                console.log('stopMixStream success: ');
                                $('#stopMixStream').attr('disabled', 'disabled');
                                $('#mixVideo').css('display', 'none');
                                return [3 /*break*/, 3];
                            case 2:
                                err_2 = _a.sent();
                                alert('停止混流失败。。。');
                                console.log('stopMixStream err: ', err_2);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                $('#leaveRoom').unbind('click');
                $('#leaveRoom').click(function () {
                    mixVideo.src = '';
                    $('#mixVideo').css('display', 'none');
                    common_1.logout();
                });
                return [2 /*return*/];
        }
    });
}); });
