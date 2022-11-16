import { generateCustomDataFile, logPluginInit, setComponentReferences, updateConfig, } from "./custom-data-generator/generator.js";
export function generateCustomData(params = {}) {
    updateConfig(params);
    return {
        name: "cem-plugin-vs-code-custom-data-generator",
        // @ts-ignore
        analyzePhase({ ts, node, moduleDoc }) {
            setComponentReferences(ts, node, moduleDoc);
        },
        packageLinkPhase({ customElementsManifest }) {
            logPluginInit();
            generateCustomDataFile(customElementsManifest);
        },
    };
}
