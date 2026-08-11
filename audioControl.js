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
        this.isUserInteracting = false;
        this.lastPlayTime = 0;
        this.startOffset = 0;
        this.forcePosition = false;
        this.playPauseButton = document.getElementById('playPauseBtn');
        this.setupEventListeners();
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

    setupEventListeners() {
        this.audioInput.addEventListener('change', async (event) => {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }
            const file = event.target.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.updatePlayPauseButton();
        });

        this.trackPosition.addEventListener('mousedown', () => {
            this.isUserInteracting = true;
            if (this.audioSource) {
                this.stop();
                this.lastPlayTime = this.trackPosition.value;
            }
        });

        this.trackPosition.addEventListener('mouseup', () => {
            this.isUserInteracting = false;
            this.startOffset = parseFloat(this.trackPosition.value);
            this.play();
        });

        this.trackPosition.addEventListener('input', () => {
            this.currentTimeLabel.textContent = this.formatTime(parseFloat(this.trackPosition.value));
        });
    }

    stop() {
        this.isPlaying = false;
        if (this.audioSource) {
            this.audioSource.stop(0);
        }
        if (this.audioContext?.state === 'running') {
            this.audioContext.suspend();
        }
        this.dispatchEvent(new CustomEvent('audioStopped'));
        this.updatePlayPauseButton();
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
        this.isPlaying = true;
        this.dispatchEvent(new CustomEvent('audioStarted', {
            detail: { context: this.audioContext, analyser: this.analyser }
        }));
        this.lastPlayTime = this.audioContext.currentTime - offset;
        this.trackPosition.max = this.audioBuffer.duration;
        this.totalTimeLabel.textContent = this.formatTime(this.audioBuffer.duration);
        this.updatePlayPauseButton();
        requestAnimationFrame(this.updateUI.bind(this));
    }

    dispatchEvent(event) {
        document.dispatchEvent(event);
    }

    play() {
        if (!this.audioBuffer) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this.createSourceAndPlay(this.startOffset);
            });
        } else {
            this.createSourceAndPlay(this.startOffset);
        }
    }

    pause() {
        if (this.audioSource) {
            this.audioSource.stop();
        }
        if (this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
        this.startOffset = this.audioContext.currentTime - this.lastPlayTime;
        this.isPlaying = false;
        this.updatePlayPauseButton();
    }

    updateUI() {
        if (this.audioSource && this.isPlaying && !this.isUserInteracting) {
            const currentTime = this.audioContext.currentTime - this.lastPlayTime + this.startOffset;
            let rangePosition = currentTime;

            if (this.forcePosition) {
                rangePosition = this.audioContext.currentTime + this.startOffset;
                this.forcePosition = false;
            }

            this.trackPosition.value = rangePosition;
            this.currentTimeLabel.textContent = this.formatTime(rangePosition);
            this.startOffset = Number(this.trackPosition.value);

            if (rangePosition < this.audioBuffer.duration) {
                requestAnimationFrame(this.updateUI.bind(this));
            } else {
                this.isPlaying = false;
                this.updatePlayPauseButton();
            }
        }
    }

    updatePlayPauseButton() {
        this.playPauseButton.textContent = this.isPlaying ? 'Pause' : 'Play';
        this.playPauseButton.setAttribute('aria-label', this.isPlaying ? 'Pause audio' : 'Play audio');
        this.playPauseButton.disabled = !this.audioBuffer;
        this.trackPosition.disabled = !this.audioBuffer;
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
