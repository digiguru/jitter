export default [
  {
    ignores: ["node_modules/**", "coverage/**", "playwright-report/**", "test-results/**"],
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        AudioContext: "readonly",
        Blob: "readonly",
        Buffer: "readonly",
        CustomEvent: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        MediaRecorder: "readonly",
        MediaStream: "readonly",
        Promise: "readonly",
        URL: "readonly",
        Uint8Array: "readonly",
        cancelAnimationFrame: "readonly",
        console: "readonly",
        document: "readonly",
        process: "readonly",
        requestAnimationFrame: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "eqeqeq": "error"
    }
  }
];
