import {
  generateCustomDataFile,
  logPluginInit,
  setComponentReferences,
  updateConfig,
} from "./custom-data-generator/generator.js";
import type { Options, Params } from "./types";

export function generateCustomData(params: Options = {}) {
  updateConfig(params);

  return {
    name: "cem-plugin-vs-code-custom-data-generator",
    // @ts-ignore
    analyzePhase({ ts, node, moduleDoc }) {
      setComponentReferences(ts, node, moduleDoc);
    },
    packageLinkPhase({ customElementsManifest }: Params) {
      logPluginInit();
      generateCustomDataFile(customElementsManifest);
    },
  };
}