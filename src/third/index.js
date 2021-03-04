
import { checkAnRun, enterRoom, push,previewVideo,isPreviewed} from '../common';

$(async () => {
    await checkAnRun();
    $('#changeUrl').click(async () => {
        if ($('#videoUrl').val()) {
            $('#externerVideo')[0].src = $('#videoUrl').val();
            $('#externerVideo')[0].play();
        }

    })
    $('#externalCaptureV').click(async () => {
        let loginSuc = false;
        const channelCount = parseInt($('#channelCount').val());

        let media = await changeStream($('#externerVideo')[0]);

        const constraints = {
            custom: {
                source: media,
                channelCount: channelCount,

            }
        }
        $('#audioBitrate').val() && (constraints.audioBitrate = parseInt($('#audioBitrate').val()));

        try {
            // $('#externerVideo')[0].play();
            loginSuc = await enterRoom();

            if (loginSuc) {
                doPreviewPublish({
                    custom: {
                        source: media,
                        channelCount: channelCount,
                    },
                    ...constraints
                }, new Date().getTime()+"");

            }
        } catch (error) {
            console.error(error);
        }
    });
    $('#externalCaptureA').click(async () => {
        let loginSuc = false;
        const channelCount = parseInt($('#channelCount').val());

        const constraints = {
          source: $('#externerAudio')[0],
          channelCount: channelCount,
        }

        $('#audioBitrate').val() && (constraints.audioBitrate = parseInt($('#audioBitrate').val()));

        try {
            loginSuc = await enterRoom();
            if (loginSuc) {
                push({
                    custom: constraints
                });
            }
        } catch (error) {
            console.error(error);
        }
    });

    $('#inputFile').change(function () {
        const video = this.files[0];
        const url = URL.createObjectURL(video);
        $('#externerVideo')[0].src = url;
    })
    function doPreviewPublish(config, streamID) {
        zg.createStream(config).then(stream => {
            zg.startPublishingStream(streamID ? streamID : idName, stream, { videoCodec: $('#videoCodeType').val(), extraInfo: JSON.stringify({ role: 2 }) })
   
            previewVideo.srcObject = stream;
        }).catch(err => {
            console.error(err)
        })
    }
    //判断浏览器版本  必须是谷歌88 版本
    function getChromeVersion() {
        var arr = navigator.userAgent.split(' ');
        var chromeVersion = '';
        for (var i = 0; i < arr.length; i++) {
            if (/chrome/i.test(arr[i]))
                chromeVersion = arr[i]
        }
        if (chromeVersion) {
            return Number(chromeVersion.split('/')[1].split('.')[0]);
        } else {
            return false;
        }
    }

    function changeStream(source) {

        var version = getChromeVersion();
        if (version != 88) {
            return source
        }
        return zg.createStream({
            custom: {
                source: source
            }
        }).then(stream => {
            let video = document.createElement("video");
            let canvas = document.createElement("canvas");
            video.setAttribute("style", "display:none");
            canvas.setAttribute("style", "display:none");
            video.setAttribute("muted", "");
            video.muted = !0;
            video.setAttribute("autoplay", "");
            video.autoplay = !0;
            video.setAttribute("playsinline", "");
            document.body.append(video);
            document.body.append(canvas);
            video.srcObject = stream;
            video.oncanplay = function () {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.play();
                draw();
            }

            let media = canvas.captureStream(25);
            let track = media.getVideoTracks()[0];
            let ctx = canvas.getContext("2d");
            let draw = function () {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // window.requestAnimationFrame(draw)
                track.requestFrame && track.requestFrame();
                video.srcObject = stream;

            }
            let q = track.stop
            track.stop = () => {
                q.call(track);
                draw();
                video.remove();
                canvas.width = 0;
                canvas.remove();
                video = canvas = null;
            }
            if (stream instanceof MediaStream && stream.getAudioTracks().length) {
                let micro = stream.getAudioTracks()[0];
                media.addTrack(micro)
            }
            return media
        }).catch(err => {
            console.error(err)
        })
    }

});
