import '../common';
import 'popper.js';
import './css/chat.css';
import './font_Icon/iconfont.css';
import { checkAnRun, zg, userID, logout, loginRoom } from '../common';


let msgCount = 0;
let localUserList= [];
$(async () => {
    await checkAnRun();

    zg.on(
        'IMRecvBroadcastMessage',
        (_roomID, chatData) => {
            console.log('IMRecvBroadcastMessage roomID ', _roomID);
            const chatBox = `
                  <div class="clearfloat">
                    <div class="author-name"><small class="chat-date">${new Date().toLocaleString()}</small></div>
                    <div class="left">
                        <div class="chat-avatars"><img src="${require('./img/icon01.png')}" alt="头像"></div>
                        <div class="chat-message">${chatData[0].message}</div>
                    </div>
                </div>
                `;

            $('.chatBox-content-demo').append(chatBox);
            //发送后清空输入框
            $('.div-textarea').html('');
            //聊天框默认最底部
            $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);

            msgCount++;
            $('.chat-message-num').text(msgCount);
            $('.chatBox').show();
            $('.chatBox-kuang').show();
        },
    );

    zg.on(
        'IMRecvBarrageMessage',
        (_roomID, chatData) => {
            console.log('IMRecvBarrageMessage roomID ', _roomID, chatData);
            $('#toastBody').text(`IMRecvBarrageMessage from ${chatData[0].fromUser.userID} message: ${chatData[0].message}`);
            $('#toast')[0].className = "toast fade show"
        },
    );
    zg.on('IMRecvCustomCommand', (_roomID, fromUser, command) => {
        console.log('IMRecvCustomCommand roomID ', _roomID, ' ', fromUser.userID, ' send ', command);
        $('#toastBody').text( 'IMRecvCustomCommand from' + ' ' + fromUser.userID + ' send ' + command);
        $('#toast')[0].className = "toast fade show"
    });
    zg.off('roomUserUpdate');
    zg.on('roomUserUpdate', (roomID, updateType, userList) => {
        console.warn(
            `roomUserUpdate: room ${roomID}, user ${updateType === 'ADD' ? 'added' : 'left'} `,
            JSON.stringify(userList),
        );
        if (updateType === 'ADD') {
            localUserList.push(...userList);
        } else if (updateType === 'DELETE') {
            userList.forEach(user => {
                localUserList = localUserList.filter(item => item.userID !== user.userID);
            });
        }
        let userListHtml = '';
        localUserList.forEach(user => {
            user.userID !== userID && (userListHtml += `<option value= ${user.userID}>${user.userName}</option>`);
        });
        $('#memberList').html(userListHtml);
    });
    zg.on('roomExtraInfoUpdate', (roomID, extraInfoList) => {
        console.warn(`roomExtraInfo: room ${roomID} `, extraInfoList);
        $('#toastBody').text(`${extraInfoList[0].key} ${extraInfoList[0].value}`)
        $('#toast')[0].className = "toast fade show"
    });
    $('.chatBox').hide();

    //打开/关闭聊天框
    $('.chatBtn').click(function() {
        $('.chatBox').toggle();
        $('.chatBox-kuang').toggle();

        //聊天框默认最底部
        $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);
    });

    // 发送信息
    $('.div-textarea').bind('keydown', e => {
        e.keyCode == 13 && $('#chat-fasong').click() && e.preventDefault();
    });

    $('#chat-fasong').click(async () => {
        if (!loginRoom) {
            alert('no login rooom');
            return;
        }
        const textContent = $('.div-textarea')
            .html()
            .replace(/[\n\r]/g, '<br>');
        if (textContent) {
            const roomId= $('#roomId').val() ;
            if (!roomId) {
                alert('roomId is empty');
                return false;
            }
            const result = await zg.sendBroadcastMessage(roomId, textContent);
            console.log('', result);
            if (result.errorCode === 0) {
                console.warn('send Message success');
            } else {
                console.error('send Message fail ', result.errorCode);
            }

            $('.chatBox-content-demo').append(`
                                    <div class="clearfloat">
                                       <div class="author-name">
                                          <small class="chat-date"> ${new Date().toLocaleString()}</small>
                                       </div>
                                       <div class="right">
                                          <div class="chat-message"> ${textContent} </div>
                                          <div class="chat-avatars">
                                              <img src="${require('./img/icon02.png')}" alt="头像" />
                                          </div>
                                       </div>
                                  </div>
                        `);
            //发送后清空输入框
            $('.div-textarea').html('');
            //聊天框默认最底部
            $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);
        }
    });

    $('#sendCustomrMsg').click(async () => {
        if (!loginRoom) {
            alert('no login rooom');
            return;
        }
        const roomId= $('#roomId').val() ;
        const result = await zg.sendCustomCommand(roomId, 'test', [$('#memberList').val() ]);
        if (result.errorCode === 0) {
            console.warn('sendCustomCommand suc');
        } else {
            console.error('sendCustomCommand err', result.errorCode);
        }
    });

    $('#BarrageMessage').click(async () => {
        if (!loginRoom) {
            alert('no login rooom');
            return;
        }
        const roomId= $('#roomId').val() ;
        if (!roomId) {
            alert('roomId is empty');
            return false;
        }
        const result = await zg.sendBarrageMessage(roomId, 'BarrageMessage test');
        console.log('', result);
        if (result.errorCode === 0) {
            console.warn('send BarrageMessage success');
        } else {
            console.error('send BarrageMessage fail ', result.errorCode);
        }
    });

    $('#ReliableMessage').click(async () => {
        const roomId= $('#roomId').val() ;
        const result = await zg.setRoomExtraInfo(roomId, '2', 'ReliableMessage test');
        if (result.errorCode === 0) {
            console.warn('setRoomExtraInfo suc');
        } else {
            console.error('setRoomExtraInfo err', result.errorCode);
        }
    });
    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        localUserList = [];
        $('#toast')[0].className = "toast fade hide"
        logout();
    });
});
