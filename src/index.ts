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

// function updateConfig(params: Options) {
//   config = {...config, ...params};
//   config.labels = {...defaultLabels, ...params?.labels}
// }

// function logPluginInit() {
//   console.log(
//     "\u001b[" +
//       32 +
//       "m" +
//       "[vs-code-custom-data-generator] - Generating config files..." +
//       "\u001b[0m"
//   );
// }

// function setComponentReferences(ts: any, node: any, moduleDoc: any) {
//   if (node.kind !== ts.SyntaxKind.ClassDeclaration) {
//     return;
//   }

//   const references = getReferences(node);
//   updateReferences(references, node, moduleDoc);
// }

// function getReferences(node: any) {
//   const docs = getDocsByTagName(node, "reference");
//   return docs
//     ?.map((tags: any) =>
//       tags?.map((doc: any) => {
//         const values = doc?.comment.split(/ - (.*)/s);

//         if (values && values.length > 1) {
//           return {
//             name: values[0].trim(),
//             url: values[1].trim(),
//           };
//         }
//       })
//     )
//     .flat();
// }

// function updateReferences(references: Reference[], node: any, moduleDoc: any) {
//   if (!references?.length) {
//     return;
//   }

//   const className: string = node.name.getText();
//   const component: Declaration = moduleDoc?.declarations?.find(
//     (dec: Declaration) => dec.name === className
//   );

//   componentReferences[`${component.tagName}`] = references as Reference[];
// }

// function getDocsByTagName(node: any, tagName: string) {
//   return node?.jsDoc?.map((doc: any) =>
//     doc?.tags?.filter((tag: any) => tag?.tagName?.getText() === tagName)
//   );
// }

// function getPropertyList(
//   customElementsManifest: CustomElementsManifest
// ): VsCssProperty[] {
//   const components = getComponents(customElementsManifest);
//   return (
//     components?.map((component) => {
//       return (
//         component.cssProperties?.map((prop) => {
//           return {
//             name: prop.name,
//             description: prop.description,
//             values: getCssPropertyValues(prop?.type?.text),
//           };
//         }) || []
//       );
//     }) || []
//   ).flat();
// }

// function getCssPropertyValues(value: string): CssValue[] {
//   if (!value) {
//     return [];
//   }

//   if (value.trim().startsWith("set")) {
//     return getValueSet(value);
//   }

//   return getCssValues(value);
// }

// export function getValueSet(value: string): CssValue[] {
//   console.log("VALUE SET", value);
//   const setName = value.split(":")[1];
//   const valueSet =
//     config.cssSets?.find((x) => x.name.trim() === setName)?.values || [];

//   return valueSet.map((x) => {
//     if (typeof x === "string") {
//       return {
//         name: getCssNameValue(x),
//       };
//     } else {
//       x.name = getCssNameValue(x.name);
//       return x;
//     }
//   });
// }

// function getCssValues(value: string): CssValue[] {
//   return (
//     value
//       ? value.split(",").map((x) => {
//           const propName = x.trim();
//           return {
//             name: getCssNameValue(propName),
//           };
//         })
//       : []
//   ).reverse();
// }

// function getCssNameValue(value: string) {
//   return !value ? "" : value.startsWith("--") ? `var(${value})` : value;
// }

// function getTagList(customElementsManifest: CustomElementsManifest) {
//   const components = getComponents(customElementsManifest);
//   return components.map((component) => {
//     const slots =
//       has(component.slots) && config.slotDocs
//         ? `\n\n**${config.labels?.slots}:**\n ${getSlotDocs(component)}`
//         : "";
//     const events =
//       has(component.events) && config.eventDocs
//         ? `\n\n**${config.labels?.events}:**\n ${getEventDocs(component)}`
//         : "";
//     const cssProps =
//       has(component.cssProperties) && config.cssPropertiesDocs
//         ? `\n\n**${config.labels?.cssProperties}:**\n ${getCssPropertyDocs(
//             component.cssProperties
//           )}`
//         : "";
//     const parts =
//       has(component.cssProperties) && config.cssPropertiesDocs
//         ? `\n\n**${config.labels?.cssProperties}:**\n ${getCssPartsDocs(
//             component.cssParts
//           )}`
//         : "";

//     return {
//       name: component.tagName,
//       description:
//         getDescription(component) + slots + events + cssProps + parts,
//       attributes: getComponentAttributes(component),
//       references: componentReferences
//         ? componentReferences[`${component.tagName}`]
//         : [],
//     };
//   });
// }

// function getDescription(component: Declaration) {
//   return (
//     (config.descriptionSrc
//       ? component[config.descriptionSrc]
//       : component.summary || component.description
//     )?.replaceAll("\\n", "\n") || ""
//   );
// }

// function generateCustomDataFile(
//   customElementsManifest: CustomElementsManifest
// ) {
//   createOutdir();

//   const tags: Tag[] = getTagList(customElementsManifest);
//   const cssPropertied = getPropertyList(customElementsManifest);

//   saveFile(
//     config.outdir!,
//     config.htmlFileName!,
//     getCustomHtmlDataFileContents(tags)
//   );

//   saveFile(
//     config.outdir!,
//     config.cssFileName!,
//     getCustomCssDataFileContents(cssPropertied)
//   );
// }

// function createOutdir() {
//   if (config.outdir !== "./" && !fs.existsSync(config.outdir!)) {
//     fs.mkdirSync(config.outdir!);
//   }
// }

// function getComponents(customElementsManifest: CustomElementsManifest) {
//   return customElementsManifest.modules
//     ?.map((mod) =>
//       mod?.declarations?.filter(
//         (dec: Declaration) =>
//           config.exclude &&
//           !config.exclude.includes(dec.name) &&
//           (dec.customElement || dec.tagName)
//       )
//     )
//     .flat();
// }

// function getComponentAttributes(component: Declaration) {
//   const attributes: TagAttribute[] = [];
//   component?.attributes?.forEach((attr) => {
//     const existingAttr = attributes.find(
//       (x) => x.name === attr.name || x.name === attr.fieldName
//     );
//     if (existingAttr) {
//       return;
//     }

//     attributes.push({
//       name: attr.fieldName || attr.name,
//       description: attr.description,
//       values: getAttributeValues(attr),
//     } as TagAttribute);
//   });

//   return attributes;
// }

// function getAttributeValues(attr: Attribute): Value[] {
//   const value = attr.type?.text;
//   return (value.includes("|") ? value.split("|") : value.split(","))
//     .filter((type) => !EXCLUDED_TYPES.includes(type.trim()))
//     .map((type) => {
//       return {
//         name: type.trim(),
//       } as Value;
//     });
// }

// function getEventDocs(component: Declaration) {
//   return component.events
//     ?.map((event) => `- **${event.name}** - ${event.description}`)
//     .join("\n");
// }

// function getCssPropertyDocs(properties: CssProperty[]) {
//   return properties
//     ?.map(
//       (prop) =>
//         `- **${prop.name}** - ${prop.description} _(default: ${prop.default})_`
//     )
//     .join("\n");
// }

// function getCssPartsDocs(parts: CssPart[]) {
//   return parts
//     ?.map((part) => `- **${part.name}** - ${part.description}`)
//     .join("\n");
// }

// function getSlotDocs(component: Declaration) {
//   return component.slots
//     ?.map(
//       (slot) =>
//         `- ${slot.name ? `**${slot.name}**` : "_default_"} - ${
//           slot.description
//         }`
//     )
//     .join("\n");
// }

// function saveFile(outdir: string, fileName: string, contents: string) {
//   fs.writeFileSync(
//     path.join(outdir, fileName),
//     prettier.format(contents, { parser: "json" })
//   );
// }

// function getCustomHtmlDataFileContents(tags: Tag[]) {
//   return `{
//     "version": 1.1,
//     "tags": ${JSON.stringify(tags)}
//   }`;
// }

// function getCustomCssDataFileContents(properties: VsCssProperty[]) {
//   return `{
//     "version": 1.1,
//     "properties": ${JSON.stringify(properties)}
//   }`;
// }

// const has = (arr: any[]) => Array.isArray(arr) && arr.length > 0;
