import { Plugin } from "@custom-elements-manifest/analyzer";

export interface Options {
  /** path to output directory */
  outdir?: string;
  /** name of the file with you component's custom data */
  filename?: string;
  /** class names of any components you would like to exclude from the custom data */
  exclude?: string[];
}

export declare function generateCustomData(options: Options): Plugin;
