import { Plugin } from "@custom-elements-manifest/analyzer";

export interface Options {
  /** Path to output directory */
  outdir?: string;
  /** Name of the file with you component's custom HTML data */
  htmlFileName?: string | null;
  /** Name of the file with you component's custom CSS data */
  cssFileName?: string | null;
  /** Class names of any components you would like to exclude from the custom data */
  exclude?: string[];
  /** The property name from the component object constructed by the CEM Analyzer */
  descriptionSrc?: "description" | "summary";
  /** Displays the slot section of the element description */
  slotDocs?: boolean;
  /** Displays the event section of the element description */
  eventDocs?: boolean;
  /** Displays the CSS custom properties section of the element description */
  cssPropertiesDocs?: boolean;
  /** Displays the CSS parts section of the element description */
  cssPartsDocs?: boolean;
  /** Controls the Slots heading label */
  slotsLabel?: string;
  /** Controls the Slots heading label */
  eventsLabel?: string;
  /** Controls the Slots heading label */
  cssPropertiesLabel?: string;
  /** Controls the Slots heading label */
  cssPartsLabel?: string;
  /** Overrides the default section labels in the component description */
  labels?: DescriptionLabels;
}

export declare function generateCustomData(options: Options): Plugin;
