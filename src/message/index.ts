import '../common';
import 'popper.js';
import './css/chat.css';
import './font_Icon/iconfont.css';
import { checkAnRun, zg } from '../common';

let msgCount = 0;
$(async () => {
    await checkAnRun();

    zg.on(
        'recvRoomMsg',
        (
            chatData: Array<{
                userID: string;
                userName: string;
                msgID: number;
                msgContent: string;
                sendTime: number;
            }>,
        ) => {
            const chatBox = `
                  <div class="clearfloat">
                    <div class="author-name"><small class="chat-date">${new Date().toLocaleString()}</small></div>
                    <div class="left">
                        <div class="chat-avatars"><img src="${require('./img/icon01.png')}" alt="头像"></div>
                        <div class="chat-message">${chatData[0].msgContent}</div>
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

    $('.chatBox').hide();

    //打开/关闭聊天框
    $('.chatBtn').click(function() {
        $('.chatBox').toggle();
        $('.chatBox-kuang').toggle();

        //聊天框默认最底部
        $('#chatBox-content-demo').scrollTop($('#chatBox-content-demo')[0].scrollHeight);
    });

    // 发送信息
    $('#chat-fasong').click(async () => {
        const textContent = $('.div-textarea')
            .html()
            .replace(/[\n\r]/g, '<br>');
        if (textContent) {
            await zg.sendRoomMsg(1, textContent);
            console.warn('send Message success');

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
});
