// @vitest-environment jsdom

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AudioControl } from '../audioControl.js';

function createControl() {
    document.body.innerHTML = `
        <input id="audio-file" type="file">
        <input id="trackPosition" type="range" value="0">
        <span id="currentTime"></span>
        <span id="totalTime"></span>
        <button id="playPauseBtn" type="button">Play</button>
    `;

    return new AudioControl('audio-file', 'trackPosition', 'currentTime', 'totalTime');
}

describe('AudioControl', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('formats timestamps consistently', () => {
        const control = createControl();

        expect(control.formatTime(0)).toBe('0:00');
        expect(control.formatTime(9)).toBe('0:09');
        expect(control.formatTime(65)).toBe('1:05');
        expect(control.formatTime(3599)).toBe('59:59');
    });

    test('keeps playback controls disabled until audio is available', () => {
        const control = createControl();

        control.updatePlayPauseButton();

        expect(control.playPauseButton.disabled).toBe(true);
        expect(control.trackPosition.disabled).toBe(true);
        expect(control.playPauseButton.textContent).toBe('Play');
        expect(control.playPauseButton.getAttribute('aria-label')).toBe('Play audio');
    });

    test('updates the button when playback state changes', () => {
        const control = createControl();
        control.audioBuffer = { duration: 30 };
        control.isPlaying = true;

        control.updatePlayPauseButton();

        expect(control.playPauseButton.disabled).toBe(false);
        expect(control.trackPosition.disabled).toBe(false);
        expect(control.playPauseButton.textContent).toBe('Pause');
        expect(control.playPauseButton.getAttribute('aria-label')).toBe('Pause audio');
    });

    test('updateUI advances the range without throwing', () => {
        const control = createControl();
        const animationFrame = vi.fn();
        vi.stubGlobal('requestAnimationFrame', animationFrame);

        control.audioSource = {};
        control.audioBuffer = { duration: 30 };
        control.audioContext = { currentTime: 5 };
        control.isPlaying = true;
        control.isUserInteracting = false;
        control.lastPlayTime = 1;
        control.startOffset = 0;

        expect(() => control.updateUI()).not.toThrow();
        expect(Number(control.trackPosition.value)).toBe(4);
        expect(control.currentTimeLabel.textContent).toBe('0:04');
        expect(animationFrame).toHaveBeenCalledOnce();
    });

    test('updateUI stops scheduling frames when the track ends', () => {
        const control = createControl();
        const animationFrame = vi.fn();
        vi.stubGlobal('requestAnimationFrame', animationFrame);

        control.audioSource = {};
        control.audioBuffer = { duration: 3 };
        control.audioContext = { currentTime: 5 };
        control.isPlaying = true;
        control.isUserInteracting = false;
        control.lastPlayTime = 1;
        control.startOffset = 0;

        control.updateUI();

        expect(control.isPlaying).toBe(false);
        expect(control.playPauseButton.textContent).toBe('Play');
        expect(animationFrame).not.toHaveBeenCalled();
    });
});
