// audioControl.js
export class AudioControl {
    constructor(audioInputId, trackPositionId, currentTimeId, totalTimeId) {
        this.audioContext = null;
        this.audioInput = document.getElementById(audioInputId);
        this.trackPosition = document.getElementById(trackPositionId);
        this.currentTimeLabel = document.getElementById(currentTimeId);
        this.totalTimeLabel = document.getElementById(totalTimeId);
        this.audioSource = null;
        this.analyser = null;
        this.audioBuffer = null;
        this.isPlaying = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.audioInput.addEventListener('change', async (event) => {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }
            const file = event.target.files[0];
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.createSourceAndPlay(0);
        });

        this.trackPosition.addEventListener('mousedown', () => {
            if (this.audioSource) {
                this.stop();
            }
        });

        this.trackPosition.addEventListener('mouseup', () => {
            const seekTime = parseFloat(this.trackPosition.value);
            this.createSourceAndPlay(seekTime);
        });

        this.trackPosition.addEventListener('input', () => {
            this.currentTimeLabel.textContent = this.formatTime(parseFloat(this.trackPosition.value));
        });
    }
    stop() {
        this.isPlaying = false;  // Update playing status when audio ends
        this.audioSource.stop();
        this.dispatchEvent(new CustomEvent('audioStopped'));
    }
    createSourceAndPlay(offset) {
        if (this.audioSource) {
            this.audioSource.disconnect();
        }
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;
        this.analyser = this.audioContext.createAnalyser();
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.audioSource.onended = () => {
            this.dispatchEvent(new CustomEvent('audioStopped (inner)'));
            
            //
        };
        this.audioSource.start(0, offset);
        this.dispatchEvent(new CustomEvent('audioStarted', { detail: { context: this.audioContext, analyser: this.analyser } }));
        this.isPlaying = true;
        this.trackPosition.max = this.audioBuffer.duration;
        this.totalTimeLabel.textContent = this.formatTime(this.audioBuffer.duration);
        requestAnimationFrame(this.updateUI.bind(this));
    }
    dispatchEvent(event) {
        document.dispatchEvent(event);
    }
    updateUI() {
        if (this.audioSource) {
            const currentTime = this.audioContext.currentTime;
            this.trackPosition.value = currentTime;
            this.currentTimeLabel.textContent = this.formatTime(currentTime);
            requestAnimationFrame(this.updateUI.bind(this));
        }
    }
    getAnalyser() {
        return this.analyser;
    }
    isAudioPlaying() {
        return this.isPlaying;
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsPart = Math.floor(seconds % 60);
        return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    }
}
