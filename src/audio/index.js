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
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("../common");
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                common_1.zg.off('roomStreamUpdate');
                common_1.zg.on('roomStreamUpdate', function (roomID, updateType, streamList) { return __awaiter(void 0, void 0, void 0, function () {
                    var i, remoteStream, error_1, audio, k, j;
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
                                common_1.useLocalStreamList.push(streamList[i]);
                                remoteStream = void 0;
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, common_1.zg.startPlayingStream(streamList[i].streamID, {
                                        video: false,
                                    })];
                            case 3:
                                remoteStream = _a.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                error_1 = _a.sent();
                                console.error(error_1);
                                return [3 /*break*/, 7];
                            case 5:
                                $('.remoteVideo').append($('<audio autoplay muted playsinline controls></audio>'));
                                audio = $('.remoteVideo audio:last')[0];
                                console.warn('audio', audio, remoteStream);
                                audio.srcObject = remoteStream;
                                audio.muted = false;
                                _a.label = 6;
                            case 6:
                                i++;
                                return [3 /*break*/, 1];
                            case 7: return [3 /*break*/, 9];
                            case 8:
                                if (updateType == 'DELETE') {
                                    for (k = 0; k < common_1.useLocalStreamList.length; k++) {
                                        for (j = 0; j < streamList.length; j++) {
                                            if (common_1.useLocalStreamList[k].streamID === streamList[j].streamID) {
                                                try {
                                                    common_1.zg.stopPlayingStream(common_1.useLocalStreamList[k].streamID);
                                                }
                                                catch (error) {
                                                    console.error(error);
                                                }
                                                console.info(common_1.useLocalStreamList[k].streamID + 'was devared');
                                                common_1.useLocalStreamList.splice(k, 1);
                                                $('.remoteVideo audio:eq(' + k + ')').remove();
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
                return [4 /*yield*/, common_1.checkAnRun()];
            case 1:
                _a.sent();
                $('#createRoom').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var loginSuc, _a, error_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                loginSuc = false;
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 5, , 6]);
                                return [4 /*yield*/, common_1.enterRoom()];
                            case 2:
                                loginSuc = _b.sent();
                                _a = loginSuc;
                                if (!_a) return [3 /*break*/, 4];
                                return [4 /*yield*/, common_1.publish({ camera: { video: false } })];
                            case 3:
                                _a = (_b.sent());
                                _b.label = 4;
                            case 4:
                                _a;
                                return [3 /*break*/, 6];
                            case 5:
                                error_2 = _b.sent();
                                console.error(error_2);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
