import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 15_000,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        trace: 'on-first-retry'
    },
    webServer: {
        command: 'node scripts/serve.mjs',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' }
        }
    ]
});
