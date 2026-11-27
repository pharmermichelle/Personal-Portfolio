const { defineConfig, devices } = require('@playwright/test');

const baseURL = 'http://127.0.0.1:4173';

module.exports = defineConfig({
  testDir: './tests/browser',
  use: {
    baseURL,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.RETRO_TEST_CHROMIUM },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: `${baseURL}/retro-game-hub.html`,
  },
});
