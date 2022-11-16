import { Plugin } from "@custom-elements-manifest/analyzer";

export interface Options {
  /** The filename to write HTML data to (without path). Set to `undefined` to skip writing this file. Default: `"vscode.html-custom-data.json"` */
  htmlFilename?: string;
  /** The filename to write CSS data to (without path). Set to `undefined` to skip writing this file. Default: `"vscode.css-custom-data.json"` */
  cssFilename?: string;
  /** Path to output directory */
  outdir?: string;
  /** Name of the file with you component's custom data */
  filename?: string;
  /** Class names of any components you would like to exclude from the custom data */
  exclude?: string[];
  /** The property name from the component object constructed by the CEM Analyzer */
  descriptionSrc?: "description" | "summary";
  /** Displays the slot section of the element description */
  slotDocs?: boolean;
  /** Displays the event section of the element description */
  eventDocs?: boolean;
}

export declare function generateCustomData(options: Options): Plugin;
