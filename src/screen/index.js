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
    let shareVideoStream = null;
    let globalCanvas = null;
    let canvasMedia = null;
    let timer = null;
    let positionXInvideo = 0;
    let positionYInvideo = 0;
    let viodeWidth = 400;
    let videoHeight = 400;
    let isFirstRange = true;
    let globalPreviewStream = null;
    let rangePreviewStream = null;
    let clientWidth = $('#screenWidth').val() * 1 || screen.width
    let clientHeight = $('#screenHeight').val() * 1 || screen.height
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
    };

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

    const rangeShare = async () => {
        // const screenStream = await zg.createStream({ screen: true });
        const video = $('.previewScreenVideo video:last')[0];
        // video['srcObject'] = shareVideoStream;

        const canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'rangeShareCanvas')
  
        const stream = video.captureStream();
        globalCanvas = canvas
        video.oncanplay = function() {
          canvas.width = viodeWidth;
          canvas.height = videoHeight;
        };
  
        // canvs 绘制
        const media = canvas.captureStream(25); // 实时视频捕获的画布
        const track = media.getVideoTracks()[0];
        // pullV.srcObject = media
        // videoStream = stream
        canvasMedia = media
        // canvasTrack = track

        const rangeShareVideo = $('#rangeShareVideo')[0]
        console.log(rangeShareVideo);
        rangeShareVideo.srcObject = canvasMedia
  
        const ctx = canvas.getContext('2d');
        
        videoDrawInCanvas(ctx, video, canvas, positionXInvideo, positionYInvideo, viodeWidth, videoHeight);
        let q = track.stop;
        track.stop = () => {
          q.call(track);
          videoDrawInCanvas(ctx, video, canvas, positionXInvideo, positionYInvideo, viodeWidth, videoHeight);
          video.remove();
          canvas.width = 0;
          canvas.remove();
          video = canvas = null;
        };
        if (stream instanceof MediaStream && stream.getAudioTracks().length) {
          let micro = stream.getAudioTracks()[0];
          media.addTrack(micro);
        }
    }

    const videoDrawInCanvas = (
        ctx,
        video,
        canvas,
        videoX,
        videoY,
        videoWidth,
        videoHeight,
        videoWidthInCanvas = videoWidth,
        videoHeightInCanvas = videoHeight,
        canvasX = 0,
        canvasY = 0
      ) => {
        ctx.drawImage(video, videoX, videoY, videoWidth, videoHeight , canvasX, canvasY, videoWidthInCanvas, videoHeightInCanvas);
        timer = setTimeout(() => {
            videoDrawInCanvas(ctx, video, canvas, videoX, videoY, videoWidth, videoHeight);
        }, 60);
    };

    const changeRange = () => {
        const video = $('.previewScreenVideo video:last')[0];
        const canvas = globalCanvas
        const ctx = canvas.getContext('2d');
  
        clearTimeout(timer)
        canvas.width = viodeWidth
        canvas.height = videoHeight
        videoDrawInCanvas(ctx, video, canvas, positionXInvideo, positionYInvideo, viodeWidth, videoHeight)
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

    $('#enterRoom').click(async () => {
        let loginSuc = false;
        try {
            loginSuc = await enterRoom();
            if (loginSuc) {
                previewStream = await zg.createStream({
                    camera: {
                        audioInput: $('#audioList').val(),
                        videoInput: $('#videoList').val(),
                        video: $('#videoList').val() === '0' ? false : true,
                        audio: $('#audioList').val() === '0' ? false : true,
                    },
                });
                previewVideo.srcObject = previewStream;
                previewVideo.controls = true;
                previewed = true;
                videoType = 'camera';
            }
        } catch (error) {
            console.error(error);
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
                $(`<video id="${screenStreamId}" autoplay muted playsinline controls></video>`),
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
        if(isFirstRange) {
            $("#videoWidthInput").val(0.2 * clientWidth)
            $("#videoHeightInput").val(0.2 * clientHeight)
        }
        $('#staticBackdrop').modal()
    });
    $("#modalSubmit").click(async () => {
        if(isFirstRange) {
            rangeShare()
            changeRange()
            isFirstRange = false
        } else {
            changeRange()
        }
        $('#staticBackdrop').modal('hide')
        if(!rangePreviewStream) {
            try {
                rangePreviewStream = await zg.createStream({custom: {source: canvasMedia}})
            } catch(err) {
                console.log(err);
            }
        }
        globalPreviewStream = previewStream
        previewStream = rangePreviewStream
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
        logout();
    });
});
