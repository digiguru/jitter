class CanvasAudioRecorder {
  constructor(canvas, audioStream) {
    this.canvas = canvas;
    this.audioStream = audioStream;
    this.recorder = null;
    this.recordedChunks = [];
  }

  // Initialize the recorder with the current streams
  init() {
    let canvasStream = this.canvas.captureStream(60); // 60 FPS is typical
    let combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...this.audioStream.getAudioTracks()]);

    this.recorder = new MediaRecorder(combinedStream);
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
  }

  // Update the audio stream
  updateAudioStream(newAudioStream) {
    this.audioStream = newAudioStream;
    // If the recorder is not currently recording, reinitialize it
    if (!this.recorder || this.recorder.state === "inactive") {
      this.init();
    } else {
      // If the recorder is recording, handle this case as needed
      // For example, you could stop the current recording and restart with the new stream
      console.warn("Cannot update the audio stream during an active recording.");
    }
  }

  // Starts recording and returns a promise that resolves with the Blob when recording is stopped
  record() {
    return new Promise((resolve, reject) => {
      if (!this.recorder) {
        this.init();
      }

      this.recorder.onstop = () => {
        let blob = new Blob(this.recordedChunks, { type: "video/webm" });
        resolve(blob);
      };

      this.recorder.onerror = (event) => reject(event.error);

      this.recordedChunks = [];
      this.recorder.start();
    });
  }

  // Stops recording
  stop() {
    if (this.recorder && this.recorder.state === "recording") {
      this.recorder.stop();
    }
  }
}