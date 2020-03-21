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
require("../common");
require("popper.js");
require("./css/chat.css");
require("./font_Icon/iconfont.css");
var common_1 = require("../common");
var msgCount = 0;
var localUserList = [];
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, common_1.checkAnRun()];
            case 1:
                _a.sent();
                common_1.zg.on('IMRecvBroadcastMessage', function (_roomID, chatData) {
                    console.log('IMRecvBroadcastMessage roomID ', _roomID);
                    var chatBox = "\n                  <div class=\"clearfloat\">\n                    <div class=\"author-name\"><small class=\"chat-date\">" + new Date().toLocaleString() + "</small></div>\n                    <div class=\"left\">\n                        <div class=\"chat-avatars\"><img src=\"" + require('./img/icon01.png') + "\" alt=\"\u5934\u50CF\"></div>\n                        <div class=\"chat-message\">" + chatData[0].message + "</div>\n                    </div>\n                </div>\n                ";
                    $('.chatBox-content-demo').append(chatBox);
                    //发送后清空输入框
                    $('.div-textarea').html('');
                    //聊天框默认最底部
                    $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);
                    msgCount++;
                    $('.chat-message-num').text(msgCount);
                    $('.chatBox').show();
                    $('.chatBox-kuang').show();
                });
                common_1.zg.on('IMRecvBarrageMessage', function (_roomID, chatData) {
                    console.log('IMRecvBarrageMessage roomID ', _roomID, chatData);
                    $('#exampleModalLabel').text('IMRecvBarrageMessage | ' + JSON.stringify(chatData) + ' | ' + _roomID);
                    $('#showAlert').click();
                });
                common_1.zg.on('IMRecvCustomCommand', function (_roomID, fromUser, command) {
                    console.log('IMRecvCustomCommand roomID ', _roomID, ' ', fromUser.userID, ' send ', command);
                    $('#exampleModalLabel').text('IMRecvCustomCommand roomID ' + _roomID + ' ' + fromUser.userID + ' send ' + command);
                    $('#showAlert').click();
                });
                common_1.zg.on('roomUserUpdate', function (roomID, updateType, userList) {
                    console.warn("roomUserUpdate: room " + roomID + ", user " + (updateType === 'ADD' ? 'added' : 'left') + " ", JSON.stringify(userList));
                    if (updateType === 'ADD') {
                        localUserList.push.apply(localUserList, userList);
                    }
                    else if (updateType === 'DELETE') {
                        userList.forEach(function (user) {
                            localUserList = localUserList.filter(function (item) { return item.userID !== user.userID; });
                        });
                    }
                    var userListHtml = '';
                    localUserList.forEach(function (user) {
                        user.userID !== common_1.userID && (userListHtml += "<option value= " + user.userID + ">" + user.userName + "</option>");
                    });
                    $('#memberList').html(userListHtml);
                });
                $('.chatBox').hide();
                //打开/关闭聊天框
                $('.chatBtn').click(function () {
                    $('.chatBox').toggle();
                    $('.chatBox-kuang').toggle();
                    //聊天框默认最底部
                    $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);
                });
                // 发送信息
                $('#chat-fasong').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var textContent, roomId, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                textContent = $('.div-textarea')
                                    .html()
                                    .replace(/[\n\r]/g, '<br>');
                                if (!textContent) return [3 /*break*/, 2];
                                roomId = $('#roomId').val();
                                if (!roomId) {
                                    alert('roomId is empty');
                                    return [2 /*return*/, false];
                                }
                                return [4 /*yield*/, common_1.zg.sendBroadcastMessage(roomId, textContent)];
                            case 1:
                                result = _a.sent();
                                console.log('', result);
                                if (result.errorCode === 0) {
                                    console.warn('send Message success');
                                }
                                else {
                                    console.error('send Message fail ', result.errorCode);
                                }
                                $('.chatBox-content-demo').append("\n                                    <div class=\"clearfloat\">\n                                       <div class=\"author-name\">\n                                          <small class=\"chat-date\"> " + new Date().toLocaleString() + "</small>\n                                       </div>\n                                       <div class=\"right\">\n                                          <div class=\"chat-message\"> " + textContent + " </div>\n                                          <div class=\"chat-avatars\">\n                                              <img src=\"" + require('./img/icon02.png') + "\" alt=\"\u5934\u50CF\" />\n                                          </div>\n                                       </div>\n                                  </div>\n                        ");
                                //发送后清空输入框
                                $('.div-textarea').html('');
                                //聊天框默认最底部
                                $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                $('#sendCustomrMsg').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var roomId, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                roomId = $('#roomId').val();
                                return [4 /*yield*/, common_1.zg.sendCustomCommand(roomId, 'test', [$('#memberList').val()])];
                            case 1:
                                result = _a.sent();
                                if (result.errorCode === 0) {
                                    console.warn('sendCustomCommand suc');
                                }
                                else {
                                    console.error('sendCustomCommand err', result.errorCode);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                $('#BarrageMessage').click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var roomId, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                roomId = $('#roomId').val();
                                if (!roomId) {
                                    alert('roomId is empty');
                                    return [2 /*return*/, false];
                                }
                                return [4 /*yield*/, common_1.zg.sendBarrageMessage(roomId, 'BarrageMessage test')];
                            case 1:
                                result = _a.sent();
                                console.log('', result);
                                if (result.errorCode === 0) {
                                    console.warn('send BarrageMessage success');
                                }
                                else {
                                    console.error('send BarrageMessage fail ', result.errorCode);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
