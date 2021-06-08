import {
    checkAnRun,
    supportScreenSharing,
    logout,
    publishStreamId,
    zg,
    loginRoom,
    previewVideo,
    enterRoom,
    publishType
} from '../common';
import { getBrowser } from '../assets/utils';
import rangeShareFunction from './rangeShare'

$(async () => {
    await checkAnRun(true);
    console.log('supportScreenSharing', supportScreenSharing);
    if (!supportScreenSharing) {
        $('#screenShot').attr('disabled', 'disabled');
        $('#stopScreenShot').attr('disabled', 'disabled');
        $('#replaceScreenShot').attr('disabled', 'disabled');
    }
    let screenStreamList= [];
    let screenCount = 0;
    let screenStream;
    let videoType = 'camera';
    let screenStreamVideoTrack;
    let cameraStreamVideoTrack;
    let cameraStreamAudioTrack;
    let previewStream;
    let screendStream;
    let externalStream;
    let externalStreamVideoTrack;
    let externalStreamAudioTrack;
    let previewed = false;
    let useImageCapture = false; // 是否使用 mageCapture 作为渲染源
    let shareVideoStream = null;  // 屏幕共享的媒体流
    let globalCanvas = null; // 创建出来的Canvas对象, 由于没有插入到dom上，所以需要保存
    let canvasMedia = null; // 裁剪后的视频流
    let positionXInvideo = 0;  // 原视频的矩形（裁剪）选择框的左上角 X 轴坐标。
    let positionYInvideo = 0; // 原视频的矩形（裁剪）选择框的左上角 Y 轴坐标。
    let viodeWidth = 400; // 要裁剪的视频的区域的宽度
    let videoHeight = 400; // 要裁剪的视频的区域的高度
    let globalPreviewStream = null;
    let rangePreviewStream = null;
    let clientWidth = 0;
    let clientHeight = 0;
    let changeRangeGlobal = null
    // startX, startY 为鼠标点击时初始坐标
     // diffX, diffY 为鼠标初始坐标与 box 左上角坐标之差，用于拖动
    let startX, startY, diffX, diffY;
    // 是否拖动，初始为 false
    let dragging = false;
    let mouseDrag = false;
    let timeStamp = 0;

    const publishStreamID = 'web-' + new Date().getTime();

    const browser = getBrowser();

    console.warn('bro', browser)
    const stopScreenShot = (screenStream)=> {
        zg.stopPublishingStream(screenStream.streamId);
        $(`#screenList option[value='${screenStream.streamId}']`).remove();

        zg.destroyStream(screenStream.stream);
        console.log($(`#${screenStream.streamId}`));
        ($(`#${screenStream.streamId}`)[0]).srcObject = null;
        $(`#${screenStream.streamId}`).remove();
        screenStreamList = screenStreamList.filter(item => item !== screenStream);
        console.log(`screenStreamList `, screenStreamList);

        if(rangePreviewStream) {
            zg.stopPublishingStream(publishStreamID);
            stopRangeScreen();
            zg.destroyStream(rangePreviewStream);
            rangePreviewStream = null
        }
    };

    const stopRangeScreen = () => {
        shareVideoStream = null
        let video = $('#rangeShareVideo')[0]
        video && video.remove()
        globalCanvas && globalCanvas.remove();
        video = null
        globalCanvas = null
        canvasMedia = null
        changeRangeGlobal = null
    }

    const stopScreen = () => {
        if (screendStream) {
            zg.destroyStream(screendStream);
            screendStream = null;
            screenStreamVideoTrack && screenStreamVideoTrack.stop();
            screenStreamVideoTrack = null;
        }
    }
    const stopExternal = () => {
        if (externalStream) {
            zg.destroyStream(externalStream);
            externalStream = null;
            externalStreamVideoTrack && externalStreamVideoTrack.stop();
            externalStreamVideoTrack = null;
            externalStreamAudioTrack && externalStreamAudioTrack.stop();
            externalStreamAudioTrack = null;
        }
    }

    const getRealInputValue = (k, type, range, input) => {
        const len = type === 'width' ? clientWidth : clientHeight
        const res = k * len / 100
        input && input.val(res)
        if(range && res < 50 && (range.value = 50 * 100 / len)) {
            input.val(50)
            viodeWidth = 50
            return 50
        }

        return  res
    }

    const getRefletRangeValue = (k, type, input, position = false) => {
        const len = type === 'width' ? clientWidth : clientHeight
        if(!position) {
            input.value < 50 && (input.value = 50)
            input.value > len && (input.value = len)
        } else {
            input.value < 0 && (input.value = 0)
        }
        return k >= 50 ? k > len ? len : k: 50
    }

    const setSelectedValue = () => {
        const videoDom = $('.previewScreenVideo video:last')[0];
        if(!videoDom) return alert('需要开启屏幕共享才有效')
        if(!globalCanvas) {
            let video = $('.previewScreenVideo video:last')[0];
            const settings = video.srcObject.getVideoTracks()[0].getSettings()
            !$('#screenWidth').val() && (clientWidth =  settings.width)
            !$('#screenHeight').val() && (clientHeight = settings.height)
            console.log(settings.width, settings.height);
        }
        const boxDom = $('#before_box')[0]
        const video = videoDom.getBoundingClientRect()
        const box = boxDom.getBoundingClientRect()

        let left = 0, top = 0, height = 0, width = 0

        if(video.left > box.left) {
            left = 0;
            if(box.left + box.width > video.left + video.width) {
                width = video.width
            } else {
                width = box.left + box.width - video.left
            }
        } else {
            left = box.left - video.left;
            if(box.left + box.width > video.left + video.width) {
                width = video.left + video.width - box.left
            } else {
                width = box.width
            }
        }

        if(video.top > box.top) {
            top = 0;
            if(box.top + box.height > video.top + video.height) {
                height = box.height
            } else {
                height = box.top + box.height - video.top
            }
        } else {
            top = box.top - video.top;
            if(box.top + box.height > video.top + video.height) {
                height = video.top + video.height - box.top
            } else {
                height = box.height
            }
        }

        positionXInvideo = parseInt(left * clientWidth / video.width)
        positionYInvideo = parseInt(top * clientHeight / video.height)
        viodeWidth = parseInt(width * clientWidth / video.width)
        videoHeight = parseInt(height * clientHeight / video.height)

        console.log('ngchikin', positionXInvideo, positionYInvideo, viodeWidth, videoHeight);

        if(viodeWidth < 0 || videoHeight < 0) return

        if(globalCanvas) {
            changeRangeGlobal(positionXInvideo, positionYInvideo, viodeWidth, videoHeight)
        } else {
            getRangeShare(positionXInvideo, positionYInvideo, viodeWidth, videoHeight)
        }
        changePreview()
    }

    const changePreview = async () => {
        if(!rangePreviewStream) {
            try {
                rangePreviewStream = await zg.createStream({custom: {source: canvasMedia}})
            } catch(err) {
                console.log(err);
            }
        }
        globalPreviewStream = previewStream
        previewStream = rangePreviewStream
    }

    const getRangeShare = (sx, sy, sWidth, sHeight) => {
        let video = $('.previewScreenVideo video:last')[0];
        const canvas = document.createElement('canvas');
        globalCanvas = canvas
        const { canvasMedidaStream, changeRange } = rangeShareFunction(canvas, shareVideoStream, useImageCapture ? null : video)
        canvasMedia = canvasMedidaStream
        changeRangeGlobal = changeRange
        let shareVideo = $('#rangeShareVideo')[0]

        if(!shareVideo) {
            shareVideo = $(`<video id="rangeShareVideo" autoplay muted playsinline></video>`)

            $("#customVideo").before(shareVideo)
            shareVideo = shareVideo[0]
        }
        shareVideo.srcObject = canvasMedia
        changeRangeGlobal(sx, sy, sWidth, sHeight)
    }

    // 点击系统停止共享
    zg.on('screenSharingEnded', (stream)=> {
        console.warn('screen sharing end',videoType );
        const _stopScreenStream = screenStreamList.find(screenStream => screenStream.stream == stream);
        _stopScreenStream && stopScreenShot(_stopScreenStream);
        if (stream === screendStream) {
            console.warn('stop');
            videoType === 'screen' && zg.mutePublishStreamVideo(previewVideo.srcObject, true)
            stopScreen();
        }
    });

    $('#publish').click(() => {
        const result = zg.startPublishingStream(publishStreamID, previewStream);
        console.log('publish stream' + publishStreamID, result);
    });
    $('#replaceScreenShot').click(async function() {
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        console.log(publishType);
        if (publishType == 'Audio' || $('#videoList').val() === '0') {
            alert('stream is only contain audio');
            return;
        }
        if (!screendStream) {
            screendStream = await zg.createStream({
                screen: true,
                videoQuality: 4,
                width: $('#screenWidth').val() * 1,
                height:  $('#screenHeight').val() * 1,
                bitrate: $('#screenBitRate').val() * 1,
                frameRate: $('#screenFrameRate').val() * 1
            });
            screenStreamVideoTrack = screendStream.getVideoTracks()[0];
            console.log('cameraStreamVideoTrack', cameraStreamVideoTrack);
            !cameraStreamVideoTrack && (cameraStreamVideoTrack = previewVideo.srcObject.getVideoTracks()[0] && previewVideo.srcObject.getVideoTracks()[0].clone());
        }

        zg.replaceTrack(previewVideo.srcObject, screenStreamVideoTrack)
            .then(res => {
                console.warn('replaceTrack success');
                videoType = 'screen';
            })
            .catch(err => console.error(err));
    });
    $('#replaceCamera').click(async function() {
        if (!previewVideo.srcObject || !cameraStreamVideoTrack) {
            alert('先创建流及屏幕共享');
            return;
        }
        cameraStreamVideoTrack && zg.replaceTrack(previewVideo.srcObject, cameraStreamVideoTrack)
            .then(res => {
                console.warn('replaceTrack success');
                videoType = 'camera';
            })
            .catch(err => console.error(err));
    });
    $('#replaceExternalVideo').click(async function() {
        if (browser == 'Safari' || browser == 'Wechat') {
            alert('browser do not support');
            return;
        }
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        console.log(publishType);
        if (publishType == 'Audio' || $('#videoList').val() === '0') {
            alert('stream is only contain audio');
            return;
        }
        if (!externalStream) {
            externalStream = await zg.createStream({
                custom: {
                    source: $('#customVideo')[0],
                }
            });
        }
        if (!externalStreamVideoTrack) {
            externalStreamVideoTrack = externalStream.getVideoTracks()[0];
            console.log('externalStreamVideoTrack', cameraStreamVideoTrack);
            !cameraStreamVideoTrack && (cameraStreamVideoTrack = previewVideo.srcObject.getVideoTracks()[0] && previewVideo.srcObject.getVideoTracks()[0].clone());
        }

        zg.replaceTrack(previewVideo.srcObject, externalStreamVideoTrack)
            .then(res => {
                console.warn('replaceTrack success');
                videoType = 'external';
            })
            .catch(err => console.error(err));
    });
    $('#replaceMicro').click(async function() {
        if (!previewVideo.srcObject) {
            alert('先创建流');
            return;
        }
        if (!cameraStreamAudioTrack) {
            alert('当前是麦克风');
            return;
        }
        cameraStreamAudioTrack && zg.replaceTrack(previewVideo.srcObject, cameraStreamAudioTrack)
            .then(res => console.warn('replaceTrack success'))
            .catch(err => console.error(err));
    });
    $('#replaceExternalAudio').click(async function() {
        if (browser == 'Safari' || browser == 'Wechat') {
            alert('browser do not support');
            return;
        }
        if (!previewVideo.srcObject) {
            alert('流不存在');
            return;
        }
        console.log(publishType);
        if (publishType == 'Video' || $('#audioList').val() === '0') {
            alert('stream is only contain video');
            return;
        }
        if (!externalStream) {
            externalStream = await zg.createStream({
                custom: {
                    source: $('#customVideo')[0],
                }
            });
        }
        if (!externalStreamAudioTrack) {
            externalStreamAudioTrack = externalStream.getAudioTracks()[0];
            console.log('externalStreamAudioTrack', externalStreamAudioTrack);
            !cameraStreamAudioTrack && (cameraStreamAudioTrack = previewVideo.srcObject.getAudioTracks()[0]);
        }

        zg.replaceTrack(previewVideo.srcObject, externalStreamAudioTrack)
            .then(res => console.warn('replaceTrack success'))
            .catch(err => console.error(err));
    });
    $('#screenShot').click(async () => {
        if (!loginRoom) {
            alert('请先登录房间');
            return;
        }
        try {
            const screenStream = await zg.createStream({
                screen: {
                    //@ts-ignore
                    audio: $('#isScreenAudio').val() == 'yes' ? true : false,
                    videoQuality: 4,
                    bitrate: $('#screenBitRate').val() * 1,
                    frameRate: $('#screenFrameRate').val() * 1,
                    width: $('#screenWidth').val() * 1 || screen.width,
                    height:  $('#screenHeight').val() * 1 || screen.height
                },
            });
            const screenStreamId = publishStreamId + 'screen' + screenCount++;
            $('.previewScreenVideo').append(
                $(`<video id="${screenStreamId}" autoplay muted playsinline></video>`),
            );

            const video = $('.previewScreenVideo video:last')[0];
            console.warn('video', video, screenStream);
            shareVideoStream = screenStream;
            video.srcObject = screenStream;

            const publisRes= zg.startPublishingStream(screenStreamId, screenStream);
            publisRes &&
                screenStreamList.push({
                    streamId: screenStreamId,
                    stream: screenStream,
                });
            $('#screenList').append('<option value="' + screenStreamId + '">' + screenStreamId + '</option>');
            // screenPublished = publisRes;
            console.log('publish screeStream', publisRes);
        } catch (e) {
            console.error('screenShot', e);
        }
    });
    $("#rangeScreenShare").click(async () => {
        if(!shareVideoStream) return alert('请先开启屏幕共享')
        if(!globalCanvas) {
            let video = $('.previewScreenVideo video:last')[0];
            const settings = video.srcObject.getVideoTracks()[0].getSettings()
            !$('#screenWidth').val() && (clientWidth =  settings.width)
            !$('#screenHeight').val() && (clientHeight = settings.height)
            console.log(settings.width, settings.height);
            $("#videoWidthInput").val(0.2 * clientWidth)
            $("#videoHeightInput").val(0.2 * clientHeight)
        }
        $('#staticBackdrop').modal()
    });
    $("#modalSubmit").click(async () => {
        if(positionXInvideo + viodeWidth > clientWidth) {
            viodeWidth = clientWidth - positionXInvideo
        }
        if(positionYInvideo + videoHeight > clientHeight) {
            videoHeight = clientHeight - positionYInvideo
        }
        if(!globalCanvas) {
            getRangeShare(positionXInvideo, positionYInvideo, viodeWidth, videoHeight)
        } else {
            changeRangeGlobal(positionXInvideo, positionYInvideo, viodeWidth, videoHeight)
        }
        $('#staticBackdrop').modal('hide')
        changePreview()
    })
    $("#exampleCheck1").change((e) => {
        useImageCapture = e.target.checked
    })

    $('#stopScreenShot').click(() => {
        const _stopScreenStreamId = $('#screenList').val();
        console.log('stopScreenShot', _stopScreenStreamId);
        const _stopScreenStream = screenStreamList.find(stream => stream.streamId == _stopScreenStreamId);
        if (!_stopScreenStream) return;
        stopScreenShot(_stopScreenStream);
    });

    $("#videoXRange").on('input', (e) => {
        const val = getRealInputValue(e.target.value, 'width')
        $("#videoXInput").val(val)
        positionXInvideo = val
    })
    $("#videoYRange").on('input', (e) => {
        const val = getRealInputValue(e.target.value, 'height')
        $("#videoYInput").val(val)
        positionYInvideo = val
    })
    $("#videoWidthRange").on('input', (e) => {
        viodeWidth = getRealInputValue(e.target.value, 'width', e.target, $("#videoWidthInput"))
    })
    $("#videoHeightRange").on('input', (e) => {
        videoHeight = getRealInputValue(e.target.value, 'height', e.target, $("#videoHeightInput"))
    })

    $("#videoXInput").on('input', (e) => {
        $("#videoXRange").val(e.target.value * 100 / clientWidth)
        positionXInvideo = getRefletRangeValue(e.target.value, 'width', e.target, true)

    })
    $("#videoYInput").on('input', (e) => {
        $("#videoYRange").val(e.target.value * 100 / clientHeight)
        positionXInvideo = getRefletRangeValue(e.target.value, 'height', e.target, true)

    })
    $("#videoWidthInput").on('input', (e) => {
        $("#videoWidthRange").val(e.target.value * 100 / clientWidth)
        viodeWidth = getRefletRangeValue(e.target.value, 'width', e.target)

    })
    $("#videoHeightInput").on('input', (e) => {
        $("#videoHeightRange").val(e.target.value * 100 / clientHeight)
        videoHeight = getRefletRangeValue(e.target.value, 'height', e.target)
    })


    $('#leaveRoom').unbind('click');
    $('#leaveRoom').click(function() {
        // $('#stopScreenShot').click();
        screenStreamList.forEach(item => {
            stopScreenShot(item);
        });
        stopScreen();
        stopExternal();
        if (previewVideo.srcObject) {
            zg.destroyStream(previewVideo.srcObject);
            previewVideo.srcObject = null;
        }
        if(cameraStreamVideoTrack) {
            cameraStreamVideoTrack.stop();
            cameraStreamVideoTrack = null;
        }
        if (cameraStreamAudioTrack) {
            cameraStreamAudioTrack.stop();
            cameraStreamAudioTrack = null;
        }
        stopRangeScreen()
        logout();
    });

    document.onkeydown = function(e) {
        if (e.key === 'Shift') {
          mouseDrag = true;
        }
      };

    document.onkeyup = function(e) {
        if (e.key === 'Shift') {
          mouseDrag = false;
        }
      };

      // 鼠标按下
    document.onmousedown = function(e) {
        startX = e.pageX;
        startY = e.pageY;

        // 如果鼠标在 box 上被按下
        if (e.target.className.match(/box/)) {
          // 允许拖动
          dragging = true;

          // 设置当前 box 的 id 为 moving_box
          if (document.getElementById('moving_box') !== null) {
            document.getElementById('moving_box').removeAttribute('id');
          }
          e.target.id = 'moving_box';

          // 计算坐标差值
          diffX = startX - e.target.offsetLeft;
          diffY = startY - e.target.offsetTop;
        } else if (mouseDrag) {
          const before_box = document.querySelector('#before_box');
          before_box && document.body.removeChild(before_box);
          // 在页面创建 box
          let active_box = document.createElement('div');
          active_box.id = 'active_box';
          active_box.className = 'box';
          active_box.style.top = startY + 'px';
          active_box.style.left = startX + 'px';
          active_box.onclick = function(e) {
            let now = e.timeStamp;
            if (now - timeStamp <= 500) {
              timeStamp = 0;
              setSelectedValue();
              document.body.removeChild(e.target);
            } else {
              timeStamp = now;
            }
          };
          document.body.appendChild(active_box);
          mouseDrag = false;
          active_box = null;
        }
      };

      // 鼠标移动
    document.onmousemove = function(e) {
        // 更新 box 尺寸
        if (document.getElementById('active_box') !== null) {
          let ab = document.getElementById('active_box');
          ab.style.width = e.pageX - startX + 'px';
          ab.style.height = e.pageY - startY + 'px';
        }

        // 移动，更新 box 坐标
        if (document.getElementById('moving_box') !== null && dragging) {
          let mb = document.getElementById('moving_box');
          mb.style.top = e.pageY - diffY + 'px';
          mb.style.left = e.pageX - diffX + 'px';
        }
      };

      // 鼠标抬起
    document.onmouseup = function(e) {
        // 禁止拖动
        dragging = false;
        if (document.getElementById('active_box') !== null) {
          let ab = document.getElementById('active_box');
          ab.setAttribute('id', 'before_box');
          // 如果长宽均小于 3px，移除 box
          if (ab.offsetWidth < 50 || ab.offsetHeight < 50) {
            document.body.removeChild(ab);
          }
        }

        let mv = document.getElementById('moving_box');
        mv && mv.setAttribute('id', 'before_box') && (mouseDrag = false);
      };
});