import { Plugin } from "@custom-elements-manifest/analyzer";

export interface Options {
  /** path to output directory */
  outdir?: string;
  /** name of the file with you component's custom data */
  filename?: string;
  /** class names of any components you would like to exclude from the custom data */
  exclude?: string[];
  /** The property name from the component object constructed by the CEM Analyzer */
  descriptionSrc?: "description" | "summary";
  /** Displays the slot section of the element description */
  slotDocs?: boolean;
  /** Displays the event section of the element description */
  eventDocs?: boolean;
}

export declare function generateCustomData(options: Options): Plugin;
