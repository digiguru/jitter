import { pluginsConfig } from './pluginsConfig.js';

window.addEventListener('DOMContentLoaded', () => {
    const audioInput = document.getElementById('audio-file');
    const trackPosition = document.getElementById('trackPosition');
    const currentTimeLabel = document.getElementById('currentTime');
    const totalTimeLabel = document.getElementById('totalTime');

    const canvas = document.getElementById('canvas');
    const controls = document.getElementById('controls');
    const ctx = canvas.getContext('2d');
    const audioContext = new AudioContext();
    const modules = [];
    let userIsInteracting = false;  // Track user interaction with the slider
    let audioSource = null;
    let analyser = null;
    let animationFrameId = null;
    let audioLoaded = false;
    let audioBuffer = null;
    let duration = 0;
    // Function to load module dynamically
    async function loadModule(plugin, container) {
        if (plugin.scriptPath) {
            const module = await import(plugin.scriptPath);
            module[plugin.id].loadUI(container, plugin.defaultSettings);
            return module[plugin.id];
        }
    }

    // Generate checkboxes for each plugin
    pluginsConfig.forEach(plugin => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = plugin.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` Load ${plugin.name}`));
        controls.appendChild(label);

        checkbox.addEventListener('change', async function () {
            if (this.checked) {
                modules[plugin.id] = await loadModule(plugin, controls);
                if (audioLoaded && !animationFrameId) {
                    startAnimation();
                }
            } else {
                modules[plugin.id].unloadUI();
                if (modules.length === 0) {
                    stopAnimation();
                }
            }
        });
    });

    // Handle audio file upload
    audioInput.addEventListener('change', async function () {
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setupAudio();
    });

    function setupAudio() {
        if (audioSource) {
            audioSource.disconnect();
            audioSource = null;
        }
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        audioSource.start(0);
        duration = audioBuffer.duration;
        trackPosition.max = duration;
        totalTimeLabel.textContent = formatTime(duration);
        updatePosition();
    }

    function updatePosition() {
        if (!audioSource || userIsInteracting) return;  // Skip updates while user is interacting
        const currentTime = audioContext.currentTime;
        trackPosition.value = currentTime;
        currentTimeLabel.textContent = formatTime(currentTime);
        requestAnimationFrame(updatePosition);
    }

    trackPosition.addEventListener('input', function () {
        if (!audioSource) return;
        const seekTime = parseFloat(trackPosition.value);
        seekAudio(seekTime);
        //setupAudio(); // Restart audio to seek
        //audioSource.start(0, seekTime);
        //currentTimeLabel.textContent = formatTime(seekTime);
    });
    trackPosition.addEventListener('mousedown', function () {
        userIsInteracting = true;
    });
    
    trackPosition.addEventListener('mouseup', function () {
        userIsInteracting = false;
        const seekTime = parseFloat(trackPosition.value);
        seekAudio(seekTime);  // Ensure audio seeks after user interaction
    });
    
    
    function seekAudio(seekTime) {
        if (!audioBuffer) return;  // Check if audio buffer is loaded
    
        // Stop the current playback if it's playing
        if (audioSource) {
            audioSource.stop();
            audioSource.disconnect();
        }
    
        // Create a new source to start playback at the new position
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        audioSource.start(0, seekTime);  // Start at the specified offset in seconds
    
        updatePosition();  // Update the UI to reflect the new position
    }
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsPart = Math.floor(seconds % 60);
        return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    }

    // Animation frame updater
    function startAnimation() {
        animationFrameId = requestAnimationFrame(animate);
    }


    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Object.keys(modules).forEach(id => {
            modules[id].draw(ctx, frequencyData)
        });
    }
    function stopAnimation() {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});
