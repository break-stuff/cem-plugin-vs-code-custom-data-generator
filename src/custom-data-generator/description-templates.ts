/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { has } from "./utilities.js";
import {
  CssPart,
  CssProperty,
  Options,
  Event,
  Slot,
} from "../../types";

export function getSlotsTemplate(config: Options, slots?: Slot[]): string {
  return has(slots) && config.slotDocs
    ? `\n\n**${config.labels?.slots}:**\n ${getSlotDocs(slots!)}`
    : "";
}

export function getEventsTemplate(config: Options, events?: Event[]): string {
  return has(events) && config.eventDocs
    ? `\n\n**${config.labels?.events}:**\n ${getEventDocs(events!)}`
    : "";
}

export function getCssPropsTemplate(
  config: Options,
  cssProperties?: CssProperty[]
): string {
  return has(cssProperties) && config.cssPropertiesDocs
    ? `\n\n**${config.labels?.cssProperties}:**\n ${getCssPropertyDocs(
        cssProperties!
      )}`
    : "";
}

export function getPartsTemplate(
  config: Options,
  cssParts?: CssPart[]
): string {
  return has(cssParts) && config.cssPartsDocs
    ? `\n\n**${config.labels?.cssParts}:**\n ${getCssPartsDocs(cssParts!)}`
    : "";
}

function getEventDocs(events: Event[]) {
  return events
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

function getSlotDocs(slots: Slot[]) {
  return slots
    ?.map(
      (slot) =>
        `- ${slot.name ? `**${slot.name}**` : "_default_"} - ${
          slot.description
        }`
    )
    .join("\n");
}
