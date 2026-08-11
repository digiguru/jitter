export class CanvasAudioRecorder {
    constructor(canvas, audioStream = null) {
        this.canvas = canvas;
        this.audioStream = audioStream;
        this.recorder = null;
        this.recordedChunks = [];
    }

    init() {
        const canvasStream = this.canvas.captureStream(60);
        let tracks = canvasStream.getVideoTracks();
        if (this.audioStream) {
            tracks = tracks.concat(this.audioStream.getAudioTracks());
        }

        const combinedStream = new MediaStream(tracks);
        this.recorder = new MediaRecorder(combinedStream);
        this.recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
    }

    updateAudioStream(newAudioStream) {
        this.audioStream = newAudioStream;
        if (!this.recorder || this.recorder.state === 'inactive') {
            this.init();
        } else {
            console.warn('Cannot update the audio stream during an active recording.');
        }
    }

    record() {
        return new Promise((resolve, reject) => {
            if (!this.recorder) {
                this.init();
            }

            this.recorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                resolve(blob);
            };
            this.recorder.onerror = (event) => reject(event.error);
            this.recordedChunks = [];
            this.recorder.start();
        });
    }

    stop() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
        }
    }
}
