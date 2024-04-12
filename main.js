import { AudioControl } from './audioControl.js';
import { startAnimation } from './animationControl.js';

document.addEventListener('DOMContentLoaded', () => {
    const audioControl = new AudioControl('audio-file', 'trackPosition', 'currentTime', 'totalTime');
    const animationManager = startAnimation('canvas');

    document.addEventListener('audioStarted', (e) => {
        console.log('Audio started', e.detail);
        animationManager.setAnalyser(e.detail.analyser);
        
        // You can now start animation or do other tasks
    });
    document.addEventListener('pluginLoaded', (e) => {
        console.log('plugin loaded', e);
        animationManager.start();
        // You can now start animation or do other tasks
    });

    document.addEventListener('audioStopped', () => {
        console.log('Audio stopped');
        // Handle audio stopped scenario
    });

    // Example condition to start animation
    document.getElementById('start-animation').addEventListener('click', () => {
        if (audioControl.isAudioPlaying()) {
            animationManager.setAnalyser(audioControl.getAnalyser());
        }
    });
});