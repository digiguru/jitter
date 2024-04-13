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
        this.isUserInteracting = false;  // Flag to check user interaction
        this.lastSeekTime = 0;
        this.startOffset = 0;
        this.setupEventListeners();

        this.playPauseButton = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.setupPlayPauseButton();
    }
    setupPlayPauseButton() {
        this.playPauseButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        });
    }
    play() {
        console.log("PLAY")
        if (!this.audioSource) {
            return; // Check if source is available
        }
        this.audioSource.start();
        this.isPlaying = true;
        this.updatePlayPauseButton();
    }

    pause() {
        console.log("PAUSE")
        if (this.audioSource) {
            this.audioSource.stop();
        }
        this.isPlaying = false;
        this.updatePlayPauseButton();
    }

    updatePlayPauseButton() {
        if (this.isPlaying) {
            this.playPauseIcon.className = "fas fa-pause";
        } else {
            this.playPauseIcon.className = "fas fa-play";
        }
        this.playPauseButton.disabled = !this.audioBuffer; // Disable if no audio is loaded
    }

    loadAudio(file) {
        // Audio loading logic
        this.audioBuffer = true; // Simulate loaded buffer
        this.updatePlayPauseButton();
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
            console.log("MOUSE DOWN",  parseInt(this.trackPosition.value))
            this.isUserInteracting = true;  // User starts interacting
            if (this.audioSource) {
                this.stop();
            }
        });

        this.trackPosition.addEventListener('mouseup', () => {
            console.log("MOUSE UP",  parseInt(this.trackPosition.value))
            this.isUserInteracting = false;  // User stops interacting
            const seekTime = parseFloat(this.trackPosition.value);
            this.createSourceAndPlay(seekTime);
        });

        this.trackPosition.addEventListener('input', () => {
            this.currentTimeLabel.textContent = this.formatTime(parseFloat(this.trackPosition.value));
        });
    }

    stop() {
        this.isPlaying = false;
        if (this.audioSource) {
            this.audioSource.stop(0);
            this.dispatchEvent(new CustomEvent('audioStopped'));
        }
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
    this.audioSource.start(0, offset);
    this.startOffset = offset;
    this.lastSeekTime = this.audioContext.currentTime;  // Record the time we started playback from the new offset
    this.isPlaying = true;
    this.dispatchEvent(new CustomEvent('audioStarted', { detail: { context: this.audioContext, analyser: this.analyser } }));
    this.trackPosition.max = this.audioBuffer.duration;
    this.totalTimeLabel.textContent = this.formatTime(this.audioBuffer.duration);
    requestAnimationFrame(this.updateUI.bind(this));
    this.updatePlayPauseButton();
}


    dispatchEvent(event) {
        document.dispatchEvent(event);
    }
    updateUI() {
        if (this.audioSource && !this.isUserInteracting) {
            // Calculate the current playback time based on the last seek
            const currentTime = this.audioContext.currentTime - this.lastSeekTime + this.startOffset;
            this.trackPosition.value = currentTime;
            this.currentTimeLabel.textContent = this.formatTime(currentTime);
            console.log("UPDATE UI", parseInt(currentTime), parseInt(this.trackPosition.value));
            requestAnimationFrame(this.updateUI.bind(this));
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsPart = Math.floor(seconds % 60);
        return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    }

    getAnalyser() {
        return this.analyser;
    }

    isAudioPlaying() {
        return this.isPlaying;
    }
}