export default function (canvas, mediaStream, video) {  // 不传 video 就是使用 ImageCapture模式
  const canvasMedidaStream = canvas.captureStream(25);
  console.log('get canvas capture end');
  let timer = null, imageCapture = null;
  const ctx = canvas.getContext('2d');
  if (!video) {
    imageCapture = new ImageCapture(mediaStream.getVideoTracks()[0]);
    console.log('new ImageCapture success');
  } 

  if (mediaStream.getAudioTracks().length) {
    let micro = mediaStream.getVideoTracks()[0];
    media.addTrack(micro);
    console.log('addTrack audio');
  }

    /**
     * 把video的画在cavans上
     * @param {*} ctx canvas的绘图上下文 context
     * @param {*} video 要绘制的到 canvas 上的 video Dom 对象
     * @param {*} canvas canvas 对象
     * @param {*} videoX 原视频的矩形（裁剪）选择框的左上角 X 轴坐标。
     * @param {*} videoY 原视频的矩形（裁剪）选择框的左上角 Y 轴坐标。
     * @param {*} videoWidth 要裁剪的视频的区域的宽度
     * @param {*} videoHeight 要裁剪的视频的区域的高度
     * @param {*} videoWidthInCanvas 视频在canvas上的渲染宽度
     * @param {*} videoHeightInCanvas 视频在canvas上的渲染高度
     * @param {*} canvasX 视频的左上角在目标canvas上 X 轴坐标。
     * @param {*} canvasY 视频的左上角在目标canvas上 Y 轴坐标
    */
  function videoDrawInCanvas(
    ctx,
    source,
    canvas,
    videoX,
    videoY,
    videoWidth,
    videoHeight,
    videoWidthInCanvas = videoWidth,
    videoHeightInCanvas = videoHeight,
    canvasX = 0,
    canvasY = 0
  ) {
    ctx.drawImage(
      source,
      videoX,
      videoY,
      videoWidth,
      videoHeight,
      canvasX,
      canvasY,
      videoWidthInCanvas,
      videoHeightInCanvas
    );
    timer = setTimeout(async () => {
      if (video) {
          videoDrawInCanvas( ctx, source, canvas, videoX, videoY, videoWidth, videoHeight);
      } else {
        imageCapture.grabFrame().then((ImageBitmap) => {
          videoDrawInCanvas( ctx, ImageBitmap, canvas, videoX, videoY, videoWidth, videoHeight);
        }).catch(function(error) {
          console.log('grabFrame() error: ', error);
        });
      }
    }, 60);
  };

  return {
    canvasMedidaStream,
    changeRange(sx, sy, sWidth, sHeight) {
      clearTimeout(timer);
      canvas.width = sWidth;
      canvas.height = sHeight;
      console.log('change range start');
      if (video) {
        videoDrawInCanvas(ctx, video, canvas, sx, sy, sWidth, sHeight);
        console.log('change range end');
      } else {
        imageCapture.grabFrame().then((ImageBitmap) => {
          videoDrawInCanvas(ctx, ImageBitmap, canvas, sx, sy, sWidth, sHeight);
          console.log('change range end');
        }).catch(function(error) {
          console.log('grabFrame() error: ', error);
        });
      }
    }
  };
}
