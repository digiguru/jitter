import { pluginsConfig } from './pluginsConfig.js';

window.addEventListener('DOMContentLoaded', () => {
    const audioInput = document.getElementById('audio-file');
    const trackPosition = document.getElementById('trackPosition');
    const currentTimeLabel = document.getElementById('currentTime');
    const totalTimeLabel = document.getElementById('totalTime');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const audioContext = new AudioContext();
    let audioSource = null;
    let analyser = null;
    let audioBuffer = null;
    let isUserInteracting = false; // Flag to monitor user interaction

    pluginsConfig.forEach(plugin => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = plugin.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` Load ${plugin.name}`));
        document.getElementById('controls').appendChild(label);

        checkbox.addEventListener('change', async function() {
            if (this.checked) {
                modules[plugin.id] = await loadModule(plugin);
                if (audioBuffer && !audioSource) {
                    startPlayback();
                }
            } else {
                modules[plugin.id].unloadUI();
                delete modules[plugin.id];
            }
        });
    });

    audioInput.addEventListener('change', async function() {
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        startPlayback();
    });

    function startPlayback() {
        if (audioSource) {
            audioSource.disconnect();
        }
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        audioSource.start();
        trackPosition.max = audioBuffer.duration;
        totalTimeLabel.textContent = formatTime(audioBuffer.duration);
        requestAnimationFrame(updateUI);
    }

    function updateUI() {
        console.log("updateUI - interacting? ", isUserInteracting, parseInt(audioContext.currentTime), audioSource)
        if (audioSource && !isUserInteracting) {
            const currentTime = audioContext.currentTime;
            trackPosition.value = currentTime;
            currentTimeLabel.textContent = formatTime(currentTime);
        }
        requestAnimationFrame(updateUI);
    }

    trackPosition.addEventListener('mousedown', function () {
        isUserInteracting = true;
        if (audioSource) {
            audioSource.stop();
        }
        console.log("DOWN - pos", parseFloat(trackPosition.value));
    });

    trackPosition.addEventListener('mouseup', function () {
        const seekTime = parseFloat(trackPosition.value);
        console.log("UP - pos", parseFloat(trackPosition.value));
        isUserInteracting = false;
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        audioSource.start(0, seekTime);
        currentTimeLabel.textContent = formatTime(seekTime);
    });

    trackPosition.addEventListener('input', function () {
        currentTimeLabel.textContent = formatTime(parseFloat(trackPosition.value));
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsPart = Math.floor(seconds % 60);
        return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    }

    async function loadModule(plugin) {
        const module = await import(plugin.scriptPath);
        module[plugin.id].loadUI(document.getElementById('controls'), plugin.defaultSettings);
        return module[plugin.id];
    }
});
