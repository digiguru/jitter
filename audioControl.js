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
        this.lastPlayTime = 0;  // Time when last played after seeking
        this.startOffset = 0;  // The offset to start playback from
        this.setupEventListeners();
        this.playPauseButton = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.setupPlayPauseButton();
        this.forcePosition = false;
    }
    setupPlayPauseButton() {
        this.playPauseButton.addEventListener('click', () => {
            console.log("CLICKED PLAY PAUSE", this.playPauseIcon.className, this.isPlaying)
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
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.updatePlayPauseButton();
        });

        this.trackPosition.addEventListener('mousedown', () => {
            this.isUserInteracting = true;
            if (this.audioSource) {
                this.stop();
                console.log("MOUSE DOWN",  parseInt(this.trackPosition.value))
                this.lastPlayTime = this.trackPosition.value;
            }
        });

        this.trackPosition.addEventListener('mouseup', () => {
            console.log("MOUSE UP",  parseInt(this.trackPosition.value))
            this.isUserInteracting = false;  // User stops interacting
            this.startOffset = parseFloat(this.trackPosition.value);
            //this.forcePosition = true;
            this.play();
            //this.createSourceAndPlay(this.startOffset);
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
        if (this.audioContext.state === "running") {
            this.audioContext.suspend();
        }
        this.dispatchEvent(new CustomEvent('audioStopped'));
    }

    

    createSourceAndPlay(offset) {
        console.log("createSourceAndPlay", parseInt(offset), parseInt(this.audioContext.currentTime), parseInt(this.audioContext.currentTime - offset))
        
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
        //this.lastSeekTime = this.audioContext.currentTime;  // Record the time we started playback from the new offset

        this.audioSource.addEventListener('ended', () => {
            console.log("audioSource.onended")
            //this.isPlaying = false;
            //this.updatePlayPauseButton();
        });
        this.isPlaying = true;
        this.dispatchEvent(new CustomEvent('audioStarted', { detail: { context: this.audioContext, analyser: this.analyser } }));
        this.lastPlayTime = this.audioContext.currentTime - offset;
        //this.lastPlayTime = offset;
        this.trackPosition.max = this.audioBuffer.duration;
        this.totalTimeLabel.textContent = this.formatTime(this.audioBuffer.duration);
        //this.play();
        this.updatePlayPauseButton();
        this.lastPlayTime = this.audioContext.currentTime - offset;
        requestAnimationFrame(this.updateUI.bind(this));
        
        
    }
    dispatchEvent(event) {
        document.dispatchEvent(event);
    }
    
    play() {
        console.log("PLAY", this.startOffset);
        if (!this.audioBuffer) return;
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume().then(x => {
                this.createSourceAndPlay(this.startOffset);
            });
        } else {
            this.createSourceAndPlay(this.startOffset);
        }
       
        
    }

    pause() {
        console.log("PAUSE")
        if (this.audioSource) {
            this.audioSource.stop();
        }
        if (this.audioContext.state === "running") {
            this.audioContext.suspend();
        }
        this.startOffset = this.audioContext.currentTime - this.lastPlayTime;
        this.isPlaying = false;
        this.updatePlayPauseButton();
        console.log("PAUSE finished", this.startOffset);
        
    }

    updateUI() {
        //console.log(this.audioSource, this.isPlaying, !this.isUserInteracting)
        if (this.audioSource && this.isPlaying && !this.isUserInteracting) {
            const currentTime = this.audioContext.currentTime - this.lastPlayTime + this.startOffset;
            //const currentTime = this.audioContext.currentTime + this.startOffset;
            //const currentTime = this.startOffset;
            let rangePosition = currentTime// this.audioContext.currentTime + this.startOffset;
            if(this.forcePosition) {
                rangePosition = this.audioContext.currentTime + this.startOffset;
                this.forcePosition = false;
            }
            this.trackPosition.value = rangePosition;
            this.currentTimeLabel.textContent = this.formatTime(rangePosition);
            this.startOffset = this.trackPosition.value;
            console.log("UPDATE UI", parseInt(currentTime), parseInt(this.audioContext.currentTime), parseInt(this.trackPosition.value), parseInt(this.startOffset));
            
        }
        requestAnimationFrame(this.updateUI.bind(this));
    }

    updatePlayPauseButton() {
        if (this.isPlaying) {
            this.playPauseIcon.className = "fas fa-pause";
        } else {
            this.playPauseIcon.className = "fas fa-play";
        }
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