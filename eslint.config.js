import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["assets/js/mediumish.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        location: "readonly",
        setTimeout: "readonly",
        requestAnimationFrame: "readonly",
        navigator: "readonly",
      },
    },
  },
  {
    ignores: ["assets/js/lunr.js", "assets/js/lunrsearchengine.js", "node_modules/"],
  },
];
