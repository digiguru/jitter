import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        class FakeBufferSource extends EventTarget {
            connect() {}
            disconnect() {}
            start() {}
            stop() {
                this.dispatchEvent(new Event('ended'));
            }
        }

        class FakeAnalyser {
            constructor() {
                this.frequencyBinCount = 32;
            }
            connect() {}
            getByteFrequencyData(array) {
                array.fill(0);
            }
        }

        class FakeAudioContext {
            constructor() {
                this.currentTime = 0;
                this.destination = {};
                this.state = 'running';
            }
            createAnalyser() {
                return new FakeAnalyser();
            }
            createBufferSource() {
                return new FakeBufferSource();
            }
            decodeAudioData() {
                return Promise.resolve({ duration: 10 });
            }
            resume() {
                this.state = 'running';
                return Promise.resolve();
            }
            suspend() {
                this.state = 'suspended';
                return Promise.resolve();
            }
        }

        window.AudioContext = FakeAudioContext;
    });
});

test('loads the visualizer without uncaught errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('/');

    await expect(page).toHaveTitle('Dynamic Audio Visualizer');
    await expect(page.getByRole('heading', { name: 'Options' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Output' })).toBeVisible();
    await expect(page.locator('#canvas')).toHaveCount(1);
    await expect(page.locator('#controls')).toHaveCount(1);
    expect(pageErrors).toEqual([]);
});

test('enables playback after an audio file is selected', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('/');
    const playButton = page.getByRole('button', { name: 'Play audio' });
    await expect(playButton).toBeDisabled();

    await page.locator('#audio-file').setInputFiles({
        name: 'sample.mp3',
        mimeType: 'audio/mpeg',
        buffer: Buffer.from([0, 1, 2, 3])
    });

    await expect(playButton).toBeEnabled();
    await playButton.click();
    await expect(page.getByRole('button', { name: 'Pause audio' })).toBeVisible();
    expect(pageErrors).toEqual([]);
});
