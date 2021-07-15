import { zg, enterRoom, publishStreamId, logout } from '../common';

new Vue({
  el: '#app',
  data: {
    state: {
      webrtcState: '',
      audioinputState: '',
      audiooutputState: '',
      videoinputState: '',
      resolutionState: '',
      H264State: '',
      connectivityState: ''
    },
    webRTC: false,
    capture: false,
    H264State: false,
    VP8State: false,
    isAudioInput: false,
    isVideoInput: false,
    isH264: false,
    isSound: false,
    isConnectivity: false,
    audioinputInfos: '',
    videoinputInfos: '',
    audiooutputInfos: '',
    sounder: '',
    localStream: null,
    resolutionList: [
      {
        width: 180,
        height: 320,
        resolutionState: ''
      },
      {
        width: 240,
        height: 320,
        resolutionState: ''
      },
      {
        width: 264,
        height: 480,
        resolutionState: ''
      },
      {
        width: 360,
        height: 640,
        resolutionState: ''
      },
      {
        width: 480,
        height: 640,
        resolutionState: ''
      },
      {
        width: 540,
        height: 960,
        resolutionState: ''
      },
      {
        width: 720,
        height: 1280,
        resolutionState: ''
      },
      {
        width: 1080,
        height: 1920,
        resolutionState: ''
      }
    ]
  },
  methods: {
    startTest() {
      this.state.webrtcState = '正在检测...';
      zg.checkSystemRequirements()
        .then((result) => {
          this.webRTC = result.webRTC;
          this.capture = result.camera && result.microphone;
          this.H264State = result.videoCodec.H264;
          this.VP8State = result.videoCodec.VP8;
        })
        .catch((err) => console.log(err));
      setTimeout(() => {
        this.state.webrtcState = '检测完成';
        this.state.audioinputState = '正在检测...';
        this.state.videoinputState = '正在检测...';
        setTimeout(() => {
          this.checkDeviceSupport();
          this.checkMicrophoneSound();
          this.state.audioinputState = '检测完成';
          this.state.videoinputState = '检测完成';
          this.state.resolutionState = '正在检测...';
          setTimeout(() => {
            this.checkResolution();
            this.state.resolutionState = '检测完成';
            this.state.H264State = '正在检测...';
            setTimeout(() => {
              this.checkConnectivity();
            }, 2500);
          }, 2500);
        }, 2500);
      }, 2500);
    },

    checkDeviceSupport() {
      let that = this;
      let cameras = [];
      let microphones = [];
      let speakers = [];

      zg.enumDevices().then((devicesinfo) => {
        if (devicesinfo.cameras.length != 0) {
          devicesinfo.cameras.forEach((item) => {
            cameras.push(item.deviceName);
          });
          that.isVideoInput = true;
          that.videoinputInfos = cameras.join(' ');
        }

        if (devicesinfo.microphones.length != 0) {
          devicesinfo.microphones.forEach((item) => {
            microphones.push(item.deviceName);
          });
          that.isAudioInput = true;
          that.audioinputInfos = microphones.join(' ');
        }

        if (devicesinfo.speakers.length != 0) {
          devicesinfo.speakers.forEach((item) => {
            speakers.push(item.deviceName);
          });
          that.audiooutputInfos = speakers.join(' ');
        }
      });
    },

    checkMicrophoneSound() {
      window.AudioContext =
        window.AudioContext || window.webkitAudioContext || mozAudioContext;
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      if (!window.AudioContext || !navigator.getUserMedia) return;
      let context = new AudioContext();
      let script = context.createScriptProcessor(2048, 1, 1);

      navigator.getUserMedia(
        {
          audio: true
        },
        (stream) => {
          let audioinput = context.createMediaStreamSource(stream);
          audioinput.connect(script);
          script.connect(context.destination);
          this.isSound = true;
        }
      );

      script.onaudioprocess = (event) => {
        let input = event.inputBuffer.getChannelData(0);
        let instant = 0.0;
        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
          sum += input[i] * input[i];
        }
        instant = Math.sqrt(sum / input.length);
        this.sounder = instant * 100;
      };
    },

    async resolutionDetection(camera) {
      try {
        this.localStream = await zg.createStream({ camera })
        if(!this.localStream) return false
        const settings = this.localStream.getVideoTracks()[0].getSettings()
        
        return camera.width === settings.width && camera.height === settings.height
      } catch(err) {
        return false
      }
    },

    async checkResolution() {

      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      if (!navigator.getUserMedia) return;

      const resolutionList = [...this.resolutionList]
      const excessConfig = {
        videoQuality: 4,
        frameRate: 15,
        bitRate: 800
      }
      let i = 0
      while(i < resolutionList.length) {
        this.localStream && zg.destroyStream(this.localStream)
        const flag = await this.resolutionDetection({...resolutionList[i], ...excessConfig})
        if(!flag) {
          this.resolutionList[i++]['resolutionState'] = '不支持'
        } else {
          this.resolutionList[i++]['resolutionState'] = '支持'
        }
      }
    },

    async checkConnectivity() {
      this.localStream && zg.destroyStream(this.localStream)
      const result = await enterRoom()
      if(!result)
        return console.log('loginRoom fail');
      
      console.log('loginRoom success');

      try {
        this.localStream = await zg.createStream()
        console.log('createStream success');
      } catch(err) {
        console.log('createStream fail reason', err);
        return
      }

      try {
        this.isConnectivity = await zg.startPublishingStream(publishStreamId, this.localStream)
        this.state.connectivityState = '检测完成'
      } catch(err) {
        console.log('PublishingStream fail reason', err);
      }

      zg.on('publisherStateUpdate', result => {
        zg.destroyStream(this.localStream)
        logout()
      })
    },

    isAndroidWexin() {
      let ua = navigator.userAgent.toLowerCase();
      return (
        ua.match(/MicroMessenger/i) == 'micromessenger' && ua.match(/android/i)
      );
    }
  }
});
