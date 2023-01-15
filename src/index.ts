import {
  generateCustomDataFile,
  logPluginInit,
  updateConfig,
} from "./custom-data-generator/generator.js";
import type { Options, Params } from "../types";
import { setComponentReferences } from "./custom-data-generator/cem-utilities.js";

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
      console.log("[vs-code-custom-data-generator] - File generation complete.");
    },
  };
}
