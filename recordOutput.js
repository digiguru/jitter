 class CanvasAudioRecorder {
    constructor(canvas, audioStream = null) {
      this.canvas = canvas;
      this.audioStream = audioStream;  // Optional at start
      this.recorder = null;
      this.recordedChunks = [];
    }
  
    // Initialize the recorder with the current streams
    init() {
      let canvasStream = this.canvas.captureStream(60); // Capture at 60 FPS
      let tracks = canvasStream.getVideoTracks();
      if (this.audioStream) {
        tracks = tracks.concat(this.audioStream.getAudioTracks());
      }
      let combinedStream = new MediaStream(tracks);
  
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
      // Reinitialize the recorder with the new audio stream if not recording
      if (!this.recorder || this.recorder.state === "inactive") {
        this.init();
      } else {
        console.warn("Cannot update the audio stream during an active recording.");
      }
    }
  
    // Start recording
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
  
    // Stop recording
    stop() {
      if (this.recorder && this.recorder.state === "recording") {
        this.recorder.stop();
      }
    }
  }
  
  // Usage
  const recorder = new CanvasAudioRecorder(canvas);  // No audio stream initially
  
  // Optional: Update the audio stream later if needed
  const newAudioStream = anotherAudioSource.stream;
  recorder.updateAudioStream(newAudioStream);
  
  // Start recording
  recorder.record().then(blob => {
    // Handle the finished recording
  }).catch(error => {
    // Handle recording error
  });
  
  // Stop recording
  // recorder.stop();

