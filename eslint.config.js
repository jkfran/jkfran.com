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
    files: ["assets/js/tools-utils.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    ignores: [
      "assets/js/lunrsearchengine.js",
      "assets/js/*.min.js",
      "node_modules/",
    ],
  },
];
