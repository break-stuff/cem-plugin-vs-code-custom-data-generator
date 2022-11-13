import fs from "fs";
import path from "path";
import prettier from "prettier";
const EXCLUDED_TYPES = ["string", "boolean", "undefined", "number", "null"];
let componentReferences = {};
let config = {};
const defaultLabels = {
    slots: "Slots",
    events: "Events",
    cssProperties: "CSS Properties",
    cssParts: "CSS Parts",
};
export function generateCustomData({ outdir = "./", htmlFileName = "vscode.html-custom-data.json", cssFileName = "vscode.css-custom-data.json", exclude = [], descriptionSrc, slotDocs = true, eventDocs = true, cssPropertiesDocs = true, cssPartsDocs = true, labels = {}, cssSets = [], } = {}) {
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
                htmlFileName,
                cssFileName,
                outdir,
                descriptionSrc,
                slotDocs,
                eventDocs,
                cssPartsDocs,
                cssPropertiesDocs,
                labels: { ...defaultLabels, ...labels },
                cssSets,
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
function getPropertyList(customElementsManifest) {
    const components = getComponents(customElementsManifest);
    return (components?.map((component) => {
        return (component.cssProperties?.map((prop) => {
            return {
                name: prop.name,
                description: prop.description,
                values: getCssPropertyValues(prop?.type?.text),
            };
        }) || []);
    }) || []).flat();
}
function getCssPropertyValues(value) {
    if (!value) {
        return [];
    }
    if (value.trim().startsWith("set")) {
        return getValueSet(value);
    }
    return getCssValues(value);
}
function getValueSet(value) {
    const setName = value.split(":")[1];
    const valueSet = config.cssSets?.find((x) => x.name.trim() === setName)?.values || [];
    return valueSet.map((x) => {
        if (typeof x === "string") {
            return {
                name: getCssNameValue(x),
            };
        }
        else {
            x.name = getCssNameValue(x.name);
            return x;
        }
    });
}
function getCssValues(value) {
    return (value
        ? value.split(",").map((x) => {
            const propName = x.trim();
            return {
                name: getCssNameValue(propName),
            };
        })
        : []).reverse();
}
function getCssNameValue(value) {
    return !value ? "" : value.startsWith("--") ? `var(${value})` : value;
}
function getTagList(customElementsManifest) {
    const components = getComponents(customElementsManifest);
    return components.map((component) => {
        const slots = has(component.slots) && config.slotDocs
            ? `\n\n**${config.labels?.slots}:**\n ${getSlotDocs(component)}`
            : "";
        const events = has(component.events) && config.eventDocs
            ? `\n\n**${config.labels?.events}:**\n ${getEventDocs(component)}`
            : "";
        const cssProps = has(component.cssProperties) && config.cssPropertiesDocs
            ? `\n\n**${config.labels?.cssProperties}:**\n ${getCssPropertyDocs(component.cssProperties)}`
            : "";
        const parts = has(component.cssProperties) && config.cssPropertiesDocs
            ? `\n\n**${config.labels?.cssProperties}:**\n ${getCssPartsDocs(component.cssParts)}`
            : "";
        return {
            name: component.tagName,
            description: getDescription(component) + slots + events + cssProps + parts,
            attributes: getComponentAttributes(component),
            references: componentReferences
                ? componentReferences[`${component.tagName}`]
                : [],
        };
    });
}
function getDescription(component) {
    return ((config.descriptionSrc
        ? component[config.descriptionSrc]
        : component.summary || component.description)?.replaceAll("\\n", "\n") || "");
}
function generateCustomDataFile(customElementsManifest) {
    createOutdir();
    const tags = getTagList(customElementsManifest);
    const cssPropertied = getPropertyList(customElementsManifest);
    saveFile(config.outdir, config.htmlFileName, getCustomHtmlDataFileContents(tags));
    saveFile(config.outdir, config.cssFileName, getCustomCssDataFileContents(cssPropertied));
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
    const value = attr.type?.text;
    return (value.includes("|") ? value.split("|") : value.split(","))
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
function getCssPropertyDocs(properties) {
    return properties
        ?.map((prop) => `- **${prop.name}** - ${prop.description} _(default: ${prop.default})_`)
        .join("\n");
}
function getCssPartsDocs(parts) {
    return parts
        ?.map((part) => `- **${part.name}** - ${part.description}`)
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
function getCustomHtmlDataFileContents(tags) {
    return `{
    "version": 1.1,
    "tags": ${JSON.stringify(tags)}
  }`;
}
function getCustomCssDataFileContents(properties) {
    return `{
    "version": 1.1,
    "properties": ${JSON.stringify(properties)}
  }`;
}
const has = (arr) => Array.isArray(arr) && arr.length > 0;
