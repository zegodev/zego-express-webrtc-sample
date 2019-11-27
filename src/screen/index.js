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
    var screenStreamId, previewScreenVideo, screenPublished, screeStream;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, common_1.checkAnRun(true)];
            case 1:
                _a.sent();
                screenStreamId = common_1.publishStreamId + 'screen';
                previewScreenVideo = $('#previewScreenVideo')[0];
                screenPublished = false;
                // 点击系统停止共享
                common_1.zg.on('screenSharingEnded', function () {
                    $('#stopScreenShot').click();
                });
                $('#screenShot').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var publisRes, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, common_1.zg.createLocalStream({ screen: {} })];
                            case 1:
                                screeStream = _a.sent();
                                previewScreenVideo.srcObject = screeStream;
                                publisRes = common_1.zg.publishLocalStream(screenStreamId, screeStream);
                                screenPublished = publisRes;
                                console.log('publish screeStream', publisRes);
                                return [3 /*break*/, 3];
                            case 2:
                                e_1 = _a.sent();
                                console.error('screenShot', e_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                $('#stopScreenShot').click(function () {
                    if (screenPublished) {
                        common_1.zg.stopPublishLocalStream(screenStreamId);
                        common_1.zg.destroyLocalStream(screeStream);
                    }
                });
                $("#leaveRoom").unbind("click");
                $('#leaveRoom').click(function () {
                    $('#stopScreenShot').click();
                    common_1.logout();
                });
                return [2 /*return*/];
        }
    });
}); });
