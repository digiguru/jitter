# Jitter

Simple browser-based audio visualisations using the Web Audio API and canvas.

## Development

Requires Node.js 24.

Install the development tooling:

```bash
npm install
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
- **Playwright** runs a Chromium smoke test that loads the real page, watches for uncaught errors and exercises audio-file selection/playback with a mocked Web Audio implementation.

## CI/CD

Pull requests and pushes to `main` run linting, HTML validation, unit tests and the browser smoke test in GitHub Actions. GitHub Pages continues to deploy the static site from `main`.

Dependabot checks npm and GitHub Actions weekly. Minor and patch npm updates are grouped; major npm upgrades remain separate so breaking migrations can be tested independently.

### Lockfile follow-up

This repository did not previously have Node tooling or a package lock. CI currently uses `npm install`. After generating and committing `package-lock.json` from Node 24/npm, switch CI to `npm ci` and enable the npm cache in `actions/setup-node` for deterministic installs.
