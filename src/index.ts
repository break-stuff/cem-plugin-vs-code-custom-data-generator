import fs from "fs";
import path from "path";
import prettier from "prettier";
import {
  Attribute,
  CustomElementsManifest,
  Declaration,
  Options,
  Params,
  Reference,
  Tag,
  TagAttribute,
  Value,
} from "./types";

const EXCLUDED_TYPES = ["string", "boolean", "undefined", "number", "null"];
let componentReferences: { [key: string]: Reference[] } = {};
let config: Options = {};

export function generateCustomData({
  outdir = "./",
  filename = "vscode.html-custom-data.json",
  exclude = [],
  descriptionSrc,
  slotDocs = true,
  eventDocs = true,
}: Options = {}) {
  return {
    name: "cem-plugin-vs-code-custom-data-generator",
    // @ts-ignore
    analyzePhase({ ts, node, moduleDoc }) {
      setComponentReferences(ts, node, moduleDoc);
    },
    packageLinkPhase({ customElementsManifest }: Params) {
      console.log(
        "\u001b[" +
          32 +
          "m" +
          "[vs-code-custom-data-generator] - Generating Config" +
          "\u001b[0m"
      );

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

function setComponentReferences(ts: any, node: any, moduleDoc: any) {
  if (node.kind === ts.SyntaxKind.ClassDeclaration) {
    const references = getReferences(node);
    updateReferences(references, node, moduleDoc);
  }
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
  if (references?.length) {
    const className: string = node.name.getText();
    const component: Declaration = moduleDoc?.declarations?.find(
      (dec: Declaration) => dec.name === className
    );

    componentReferences[`${component.tagName}`] = references as Reference[];
  }
}

function getDocsByTagName(node: any, tagName: string) {
  return node?.jsDoc?.map((doc: any) =>
    doc?.tags?.filter((tag: any) => tag?.tagName?.getText() === tagName)
  );
}

function getTagList(customElementsManifest: CustomElementsManifest) {
  const components = getComponents(customElementsManifest);
  return components.map((component) => {
    const slots =
      has(component.slots) && config.slotDocs
        ? `\n\n**Slots:**\n ${getSlotDocs(component)}`
        : "";
    const events =
      has(component.events) && config.eventDocs
        ? `\n\n**Events:**\n ${getEventDocs(component)}`
        : "";

    return {
      name: component.tagName,
      description: getDescription(component) + slots + events,
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

function generateCustomDataFile(
  customElementsManifest: CustomElementsManifest
) {
  createOutdir();

  const tags: Tag[] = getTagList(customElementsManifest);

  saveFile(config.outdir!, config.filename!, getCustomDataFileContents(tags));
}

function createOutdir() {
  if (config.outdir !== "./" && !fs.existsSync(config.outdir!)) {
    fs.mkdirSync(config.outdir!);
  }
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
      name: attr.fieldName || attr.name,
      description: attr.description,
      values: getAttributeValues(attr),
    } as TagAttribute);
  });

  return attributes;
}

function getAttributeValues(attr: Attribute): Value[] {
  return attr.type?.text
    .split("|")
    .filter((type) => !EXCLUDED_TYPES.includes(type.trim()))
    .map((type) => {
      return {
        name: type.trim(),
      } as Value;
    });
}

function getEventDocs(component: Declaration) {
  return component.events
    ?.map((event) => `- **${event.name}** - ${event.description}`)
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

function saveFile(outdir: string, fileName: string, contents: string) {
  fs.writeFileSync(
    path.join(outdir, fileName),
    prettier.format(contents, { parser: "json" })
  );
}

function getCustomDataFileContents(tags: Tag[]) {
  return `{
    "tags": ${JSON.stringify(tags)}
  }`;
}

const has = (arr: any[]) => Array.isArray(arr) && arr.length > 0;
