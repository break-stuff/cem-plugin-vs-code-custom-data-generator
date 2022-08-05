import { generateCustomData } from "./index.js";

export default {
  /** Globs to analyze */
  globs: ["demo/*.js"],
  /** Directory to output CEM to */
  outdir: "./",
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
  /** Include third party custom elements manifests */
  dependencies: true,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,
  /** Provide custom plugins */
  plugins: [generateCustomData({ outdir: "./demo" })],
};
