import fs from "fs";
import path from "path";
import prettier from "prettier";
import type {
  Attribute,
  CssPart,
  CssProperty,
  CssValue,
  CustomElementsManifest,
  Declaration,
  Options,
  Reference,
  Tag,
  TagAttribute,
  Value,
  VsCssProperty,
} from "../../types";

const EXCLUDED_TYPES = ["string", "boolean", "undefined", "number", "null"];
let componentReferences: { [key: string]: Reference[] } = {};
const defaultLabels = {
  slots: "Slots",
  events: "Events",
  cssProperties: "CSS Properties",
  cssParts: "CSS Parts",
};

export let config: Options = {
  outdir: "./",
  htmlFileName: "vscode.html-custom-data.json",
  cssFileName: "vscode.css-custom-data.json",
  exclude: [],
  descriptionSrc: undefined,
  slotDocs: true,
  eventDocs: true,
  cssPropertiesDocs: true,
  cssPartsDocs: true,
  labels: {},
  cssSets: [],
};

export function updateConfig(params: Options) {
  config = { ...config, ...params };
  config.labels = { ...defaultLabels, ...params?.labels };
}

export function getCssPropertyList(
  customElementsManifest: CustomElementsManifest
): VsCssProperty[] {
  const components = getComponents(customElementsManifest);
  return (
    components?.map((component) => {
      return (
        component.cssProperties?.map((prop) => {
          return {
            name: prop.name,
            description: prop.description,
            values: getCssPropertyValues(prop?.type?.text),
          };
        }) || []
      );
    }) || []
  ).flat();
}

export function getCssPartList(
  customElementsManifest: CustomElementsManifest
) {
  const components = getComponents(customElementsManifest);
  return (
    components?.map((component) => {
      return (
        component.cssParts?.map((prop) => {
          return {
            name: `::part(${prop.name})`,
            description: prop.description,
          };
        }) || []
      );
    }) || []
  ).flat();
}

export function getCssPropertyValues(value?: string): CssValue[] {
  if (!value) {
    return [];
  }

  if (value.trim().startsWith("set")) {
    return getValueSet(value);
  }

  return getCssValues(value);
}

export function getValueSet(value: string): CssValue[] {
  const setName = value.split(":")[1];
  const valueSet =
    config.cssSets?.find((x) => x.name.trim() === setName)?.values || [];

  return valueSet.map((x) => {
    if (typeof x === "string") {
      return {
        name: getCssNameValue(x),
      };
    } else {
      x.name = getCssNameValue(x.name);
      return x;
    }
  });
}

export function getCssValues(value: string): CssValue[] {
  return value
    ? (value.includes("|") ? value.split("|") : value.split(",")).map((x) => {
        const propName = x.trim();
        return {
          name: getCssNameValue(propName),
        };
      })
    : [];
}

function getCssNameValue(value: string) {
  return !value ? "" : value.startsWith("--") ? `var(${value})` : value;
}

export function getTagList(customElementsManifest: CustomElementsManifest) {
  const components = getComponents(customElementsManifest);
  return components.map((component) => {
    const slots =
      has(component.slots) && config.slotDocs
        ? `\n\n**${config.labels?.slots}:**\n ${getSlotDocs(component)}`
        : "";
    const events =
      has(component.events) && config.eventDocs
        ? `\n\n**${config.labels?.events}:**\n ${getEventDocs(component)}`
        : "";
    const cssProps =
      has(component.cssProperties) && config.cssPropertiesDocs
        ? `\n\n**${config.labels?.cssProperties}:**\n ${getCssPropertyDocs(
            component.cssProperties!
          )}`
        : "";
    const parts =
      has(component.cssParts) && config.cssPartsDocs
        ? `\n\n**${config.labels?.cssParts}:**\n ${getCssPartsDocs(
            component.cssParts!
          )}`
        : "";

    return {
      name: component.tagName,
      description:
        getDescription(component) + slots + events + cssProps + parts,
      attributes: getComponentAttributes(component),
      references: componentReferences
        ? componentReferences[`${component.tagName}`]
        : [],
    };
  });
}

function getDescription(component: Declaration) {
  return (
    (config.descriptionSrc
      ? component[config.descriptionSrc]
      : component.summary || component.description
    )?.replaceAll("\\n", "\n") || ""
  );
}

export function generateCustomDataFile(
  customElementsManifest: CustomElementsManifest
) {
  const htmlTags = config.htmlFileName
    ? getTagList(customElementsManifest)
    : [];
  const cssProperties = config.cssFileName
    ? getCssPropertyList(customElementsManifest)
    : [];
  const cssParts = config.cssFileName
    ? getCssPartList(customElementsManifest)
    : [];

  saveCustomDataFiles(config, htmlTags, cssProperties, cssParts);
}

function getComponents(customElementsManifest: CustomElementsManifest) {
  return customElementsManifest.modules
    ?.map((mod) =>
      mod?.declarations?.filter(
        (dec: Declaration) =>
          config.exclude &&
          !config.exclude.includes(dec.name) &&
          (dec.customElement || dec.tagName)
      )
    )
    .flat();
}

function getComponentAttributes(component: Declaration) {
  const attributes: TagAttribute[] = [];
  component?.attributes?.forEach((attr) => {
    const existingAttr = attributes.find(
      (x) => x.name === attr.name || x.name === attr.fieldName
    );
    if (existingAttr) {
      return;
    }

    attributes.push({
      name: attr.name || attr.fieldName,
      description: attr.description,
      values: getAttributeValues(attr),
    } as TagAttribute);
  });

  return attributes;
}

function getAttributeValues(attr: Attribute): Value[] {
  const value = attr.type?.text;
  return !value
    ? []
    : (value.includes("|") ? value.split("|") : value.split(","))
        .filter((type) => !EXCLUDED_TYPES.includes(type.trim()))
        .map((type) => {
          return {
            name: removeQuoteWrappers(type),
          } as Value;
        });
}

function getEventDocs(component: Declaration) {
  return component.events
    ?.map((event) => `- **${event.name}** - ${event.description}`)
    .join("\n");
}

function getCssPropertyDocs(properties: CssProperty[]) {
  return properties
    ?.map(
      (prop) =>
        `- **${prop.name}** - ${prop.description} _(default: ${prop.default})_`
    )
    .join("\n");
}

function getCssPartsDocs(parts: CssPart[]) {
  return parts
    ?.map((part) => `- **${part.name}** - ${part.description}`)
    .join("\n");
}

function getSlotDocs(component: Declaration) {
  return component.slots
    ?.map(
      (slot) =>
        `- ${slot.name ? `**${slot.name}**` : "_default_"} - ${
          slot.description
        }`
    )
    .join("\n");
}

function has(arr?: any[]) {
  return Array.isArray(arr) && arr.length > 0;
}

export function removeQuoteWrappers(value: string) {
  return value.trim().replace(/^["'](.+(?=["']$))["']$/, '$1');
}

//
// CEM Analysis
//

export function setComponentReferences(ts: any, node: any, moduleDoc: any) {
  if (node.kind !== ts.SyntaxKind.ClassDeclaration) {
    return;
  }

  const references = getReferences(node);
  updateReferences(references, node, moduleDoc);
}

function getReferences(node: any) {
  const docs = getDocsByTagName(node, "reference");
  return docs
    ?.map((tags: any) =>
      tags?.map((doc: any) => {
        const values = doc?.comment.split(/ - (.*)/s);

        if (values && values.length > 1) {
          return {
            name: values[0].trim(),
            url: values[1].trim(),
          };
        }
      })
    )
    .flat();
}

function updateReferences(references: Reference[], node: any, moduleDoc: any) {
  if (!references?.length) {
    return;
  }

  const className: string = node.name.getText();
  const component: Declaration = moduleDoc?.declarations?.find(
    (dec: Declaration) => dec.name === className
  );

  componentReferences[`${component.tagName}`] = references as Reference[];
}

function getDocsByTagName(node: any, tagName: string) {
  return node?.jsDoc?.map((doc: any) =>
    doc?.tags?.filter((tag: any) => tag?.tagName?.getText() === tagName)
  );
}

//
// OUTPUTS
//

export function logPluginInit() {
  console.log(
    "\u001b[" +
      32 +
      "m" +
      "[vs-code-custom-data-generator] - Generating config files..." +
      "\u001b[0m"
  );
}

export function saveCustomDataFiles(
  config: Options,
  tags: Tag[],
  cssProperties: VsCssProperty[],
  cssParts: VsCssProperty[],
) {
  createOutdir(config.outdir!);

  if (config.htmlFileName) {
    saveFile(
      config.outdir!,
      config.htmlFileName!,
      getCustomHtmlDataFileContents(tags)
    );
  }

  if (config.cssFileName) {
    saveFile(
      config.outdir!,
      config.cssFileName!,
      getCustomCssDataFileContents(cssProperties, cssParts)
    );
  }
}

export function createOutdir(outdir: string) {
  if (outdir !== "./" && !fs.existsSync(outdir)) {
    fs.mkdirSync(outdir);
  }
}

function saveFile(outdir: string, fileName: string, contents: string) {
  fs.writeFileSync(
    path.join(outdir, fileName),
    prettier.format(contents, { parser: "json" })
  );
}

function getCustomHtmlDataFileContents(tags: Tag[]) {
  return `{
      "version": 1.1,
      "tags": ${JSON.stringify(tags)}
    }`;
}

function getCustomCssDataFileContents(properties: VsCssProperty[], parts: VsCssProperty[]) {
  return `{
      "version": 1.1,
      "properties": ${JSON.stringify(properties)},
      "pseudoElements": ${JSON.stringify(parts)}
    }`;
}
