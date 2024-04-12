// animationControl.js
import { pluginsConfig } from './pluginsConfig.js';
const modules = [];
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
            if(!modules[plugin.id]) {
                modules[plugin.id] = await loadModule(plugin);
                document.dispatchEvent(new CustomEvent('pluginLoaded'));
            }
        } else {
            modules[plugin.id].unloadUI();
            delete modules[plugin.id];
        }
    });
});

async function loadModule(plugin) {
    const module = await import(plugin.scriptPath);
    module[plugin.id].loadUI(document.getElementById('controls'), plugin.defaultSettings);
    return module[plugin.id];
}

export function startAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    let analyser = null;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;

    function animate() {
        if (!analyser) {
            console.error('Analyser is not available');
            return;  // Stop animation if the analyser is disconnected
        }
        // Ensure there are active modules before animating
        if (Object.keys(modules).length === 0) {
            console.log('No active modules to animate');
            cancelAnimationFrame(animationFrameId);
            return;  // Stop the animation loop if there are no modules
        }
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Object.keys(modules).forEach(id => {
            modules[id].draw(ctx, frequencyData);
        });
        animationFrameId = requestAnimationFrame(animate);
    }
    function setAnalyser(audioAnalyser) {
        analyser = audioAnalyser;
        start();
    }
    function start() {
        //if (animationFrameId === null) {  // Prevent multiple invocations
        animationFrameId = requestAnimationFrame(animate);
        //}
    }
    return { start, setAnalyser };
}