import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jestPlugin from "eslint-plugin-jest";

export default [
  {
    // Configuración general
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["index.d.ts", "webpack.config.cjs", "transpiled/**/*"],

    plugins: {
      "@typescript-eslint": tseslint,
    },

    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      globals: {
        // Para node (lo especifico porque usando el general (node: true) da fallo),
        console: true,
        process: true,
        __dirname: true,
        fetch: true,
        window: true,
        setTimeout: true,
        document: true,
        URLSearchParams: true,
        CustomEvent: true,
        navigator: true,
        HTMLInputElement: true,
        Element: true,
        MouseEvent: true,
        HTMLVideoElement: true,
        MediaStream: true,
        RTCPeerConnection: true,
        RTCIceCandidateInit: true,
        RTCSessionDescriptionInit
      },
    },

    rules: {
      eqeqeq: "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },

  // Configuración específica para los archivos de test (Jest)
  {
    files: ["test/**/*.js"],
    plugins: {
      jest: jestPlugin,
    },

    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      globals: {
        // Para jest (lo especifico porque usando el general (jest: true) da fallo),
        test: true,
        describe: true,
        expect: true,
        console: true,
      },
    },
  },

  // Configuración específica para los tipos
  {
    files: ["src/types/**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint,
    },

    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },

    rules: {
      eqeqeq: "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "off",
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
];
