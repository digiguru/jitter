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
        CustomEvent: "readonly",
        URL: "readonly",
        Uint8Array: "readonly",
        cancelAnimationFrame: "readonly",
        console: "readonly",
        document: "readonly",
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
