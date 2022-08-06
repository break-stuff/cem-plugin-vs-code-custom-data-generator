import fs from "fs";
import path from "path";
import prettier from "prettier";
const EXCLUDED_TYPES = ["string", "boolean", "undefined", "number", "null"];
let componentReferences = {};
export function generateCustomData({ outdir = "./", filename = "vscode.html-custom-data.json", exclude = [], } = {}) {
    return {
        name: "cem-plugin-vs-code-custom-data-generator",
        // @ts-ignore
        analyzePhase({ ts, node, moduleDoc }) {
            setComponentReferences(ts, node, moduleDoc);
        },
        packageLinkPhase({ customElementsManifest }) {
            console.log("\u001b[" +
                32 +
                "m" +
                "[vs-code-custom-data-generator] - Generating Config" +
                "\u001b[0m");
            generateCustomDataFile(outdir, filename, customElementsManifest, exclude);
        },
    };
}
function setComponentReferences(ts, node, moduleDoc) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
        const references = getReferences(node);
        updateReferences(references, node, moduleDoc);
    }
}
function getReferences(node) {
    const docs = getDocsByTagName(node, "reference");
    return docs
        ?.map((tags) => tags?.map((doc) => {
        const values = doc?.comment.split(/ - (.*)/s);
        if (values && values.length > 1) {
            return {
                name: values[0].trim(),
                url: values[1].trim(),
            };
        }
    }))
        .flat();
}
function updateReferences(references, node, moduleDoc) {
    if (references?.length) {
        const className = node.name.getText();
        const component = moduleDoc?.declarations?.find((dec) => dec.name === className);
        componentReferences[`${component.tagName}`] = references;
    }
}
function getDocsByTagName(node, tagName) {
    return node?.jsDoc?.map((doc) => doc?.tags?.filter((tag) => tag?.tagName?.getText() === tagName));
}
function getTagList(customElementsManifest, exclude) {
    const components = getComponents(customElementsManifest, exclude);
    return components.map((component) => {
        const slots = component.slots ? `\n\n**Slots:**\n ${getSlots(component)}` : '';
        const events = component.events ? `\n\n**Events:**\n ${getEvents(component)}` : '';
        return {
            name: component.tagName,
            description: (component.summary || component.description).replaceAll('\\n', '\n') + slots + events,
            attributes: getComponentAttributes(component),
            references: componentReferences
                ? componentReferences[`${component.tagName}`]
                : [],
        };
    });
}
function generateCustomDataFile(outdir, filename, customElementsManifest, exclude) {
    createOutdir(outdir);
    const tags = getTagList(customElementsManifest, exclude);
    saveFile(outdir, filename, getCustomDataFileContents(tags));
}
function createOutdir(outdir) {
    if (outdir !== "./" && !fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
    }
}
function getComponents(customElementsManifest, exclude) {
    return customElementsManifest.modules
        ?.map((mod) => mod?.declarations?.filter((dec) => exclude &&
        !exclude.includes(dec.name) &&
        (dec.customElement || dec.tagName)))
        .flat();
}
function getComponentAttributes(component) {
    return component?.attributes?.map((attr) => {
        return {
            name: attr.name,
            description: attr.description,
            values: getAttributeValues(attr),
        };
    });
}
function getAttributeValues(attr) {
    return attr.type?.text
        .split("|")
        .filter((type) => !EXCLUDED_TYPES.includes(type.trim()))
        .map((type) => {
        return {
            name: type.trim(),
        };
    });
}
function getEvents(component) {
    return component.events
        ?.map((event) => `- **${event.name}** - ${event.description}`)
        .join("\n");
}
function getSlots(component) {
    return component.slots
        ?.map((slot) => `- ${slot.name ? `**${slot.name}**` : "_default_"} - ${slot.description}`)
        .join("\n");
}
function saveFile(outdir, fileName, contents) {
    fs.writeFileSync(path.join(outdir, fileName), prettier.format(contents, { parser: "json" }));
}
function getCustomDataFileContents(tags) {
    return `{
    "tags": ${JSON.stringify(tags)}
  }`;
}
