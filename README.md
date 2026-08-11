# Jitter

Simple browser-based audio visualisations using the Web Audio API and canvas.

## Development

Requires Node.js 24.

Install the development tooling:

```bash
npm ci
```

Run the quality checks:

```bash
npm run lint
npm test
npm run test:e2e:install
npm run test:e2e
```

The application itself remains plain HTML, CSS and JavaScript and does not require a production build step.

## Testing

- **ESLint** checks the JavaScript modules for common runtime mistakes.
- **html-validate** validates the static HTML structure.
- **Vitest + jsdom** cover `AudioControl` formatting, control state and playback UI updates.
- **Playwright** runs Chromium smoke tests that load the real page, watch for uncaught errors and exercise audio-file selection/playback with a mocked Web Audio implementation.

## CI/CD

Pull requests and pushes to `main` run deterministic `npm ci` installs with npm caching, followed by linting, HTML validation, unit tests and browser smoke tests in GitHub Actions. GitHub Pages continues to deploy the static site from `main`.

Dependabot checks npm and GitHub Actions weekly. Minor and patch npm updates are grouped; major npm upgrades remain separate so breaking migrations can be tested independently.
