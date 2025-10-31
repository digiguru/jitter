import { AudioControl } from './audioControl.js';
import { startAnimation } from './animationControl.js';
//import { CanvasAudioRecorder } from './recordOutput.js'
document.addEventListener('DOMContentLoaded', () => {
    const audioControl = new AudioControl('audio-file', 'trackPosition', 'currentTime', 'totalTime');
    const animationManager = startAnimation('canvas');
    const recorder = null; //= new CanvasAudioRecorder(document.getElementById('canvas'), audioStream);

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
        if (recorder) {
            recorder.record().then(blob => {
            console.log('Recording finished. Blob:', blob);
          
            // Create a download link
            let url = URL.createObjectURL(blob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "recording.webm";
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }).catch(error => {
            console.error('Recording failed:', error);
          });
        }
    });
});




  // To start recording and handle the finished recording
 
  
  // Call `recorder.stop()` when you want to stop recording
  