import fs from "fs";
import path from "path";
import prettier from "prettier";
const EXCLUDED_TYPES = ["string", "boolean", "undefined", "number", "null"];
let componentReferences = {};
let config = {};
export function generateCustomData({ outdir = "./", filename = "vscode.html-custom-data.json", exclude = [], descriptionSrc, slotDocs = true, eventDocs = true, } = {}) {
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
            config = {
                exclude,
                filename,
                outdir,
                descriptionSrc,
                slotDocs,
                eventDocs,
            };
            generateCustomDataFile(customElementsManifest);
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
function getTagList(customElementsManifest) {
    const components = getComponents(customElementsManifest);
    return components.map((component) => {
        const slots = has(component.slots) && config.slotDocs
            ? `\n\n**Slots:**\n ${getSlotDocs(component)}`
            : "";
        const events = has(component.events) && config.eventDocs
            ? `\n\n**Events:**\n ${getEventDocs(component)}`
            : "";
        return {
            name: component.tagName,
            description: (component.summary || component.description).replaceAll("\\n", "\n") +
                slots +
                events,
            attributes: getComponentAttributes(component),
            references: componentReferences
                ? componentReferences[`${component.tagName}`]
                : [],
        };
    });
}
function generateCustomDataFile(customElementsManifest) {
    createOutdir();
    const tags = getTagList(customElementsManifest);
    saveFile(config.outdir, config.filename, getCustomDataFileContents(tags));
}
function createOutdir() {
    if (config.outdir !== "./" && !fs.existsSync(config.outdir)) {
        fs.mkdirSync(config.outdir);
    }
}
function getComponents(customElementsManifest) {
    return customElementsManifest.modules
        ?.map((mod) => mod?.declarations?.filter((dec) => config.exclude &&
        !config.exclude.includes(dec.name) &&
        (dec.customElement || dec.tagName)))
        .flat();
}
function getComponentAttributes(component) {
    const attributes = [];
    component?.attributes?.forEach((attr) => {
        const existingAttr = attributes.find((x) => x.name === attr.name || x.name === attr.fieldName);
        if (existingAttr) {
            return;
        }
        attributes.push({
            name: attr.fieldName || attr.name,
            description: attr.description,
            values: getAttributeValues(attr),
        });
    });
    return attributes;
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
function getEventDocs(component) {
    return component.events
        ?.map((event) => `- **${event.name}** - ${event.description}`)
        .join("\n");
}
function getSlotDocs(component) {
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
const has = (arr) => Array.isArray(arr) && arr.length > 0;
