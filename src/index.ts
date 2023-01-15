import { updateConfig } from "./custom-data-generator/cem-utilities.js";
import { setComponentReferences } from "./custom-data-generator/references.js";
import { greenConsoleLog } from "./custom-data-generator/integrations.js";
import { generateCustomDataFile } from "./custom-data-generator/data-file-generator.js";
import type { Options, Params } from "../types";

export function generateCustomData(params: Options = {}) {
  updateConfig(params);

  return {
    name: "cem-plugin-vs-code-custom-data-generator",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    analyzePhase({ ts, node, moduleDoc }) {
      setComponentReferences(ts, node, moduleDoc);
    },
    packageLinkPhase({ customElementsManifest }: Params) {
      console.log(
        "[vs-code-custom-data-generator] - Generating config files..."
      );
      generateCustomDataFile(customElementsManifest);
      greenConsoleLog(
        "[vs-code-custom-data-generator] - File generation complete."
      );
    },
  };
}
