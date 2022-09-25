# cem-plugin-vs-code-custom-data-generator

This is a plugin automatically generates a custom data config file for [VS Code](https://code.visualstudio.com/) using the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/).

This config enables VS Code to display autocomplete and contextual information about your custom elements.

![demo of autocomplete features for custom elements in vs code](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/demo.gif?raw=true)

## Usage

### Pre-installation

Ensure the following steps have been taken in your component library prior to using this plugin:

- Install and set up the [Custom Elements Manifest Analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/)
- Create a [config file](https://custom-elements-manifest.open-wc.org/analyzer/config/#config-file)

### Install

```bash
npm i -D cem-plugin-vs-code-custom-data-generator
```

### Import

```js
// custom-elements-manifest.config.js

import { generateCustomData } from "cem-plugin-vs-code-custom-data-generator";

export default {
  plugins: [
    generateCustomData()
  ],
};
```

### Implementation

If you don't have it already, add a VS Code settings folder and file at the root of your project - `.vscode/settings.json`. Then add or append the following code:

```json
{
  "html.customData": [
    "./vscode.html-custom-data.json"
  ],
  "css.customData": [
    "./vscode.css-custom-data.json"
  ],
}
```

If this is included in your `npm` package, the VS Code configuration will look something like this:

```json
{
  "html.customData": [
    "./node_modules/my-component-library/vscode.html-custom-data.json"
  ],
  "css.customData": [
    "./node_modules/my-component-library/vscode.css-custom-data.json"
  ]
}
```

**_Note:_** The path is relative to the root of the project, not the settings file.

Once it has been added, you will need to restart VS Code in order for it to register the new components. After it has been restarted, you should see autocomplete information for your custom elements!

## Configuration

The configuration has the following optional parameters:

```ts
{
  /** path to output directory */
  outdir?: string;
  /** name of the file with you component's custom data */
  filename?: string;
  /** class names of any components you would like to exclude from the custom data */
  exclude?: string[];
  /** The property name from the component object constructed by the CEM Analyzer */
  descriptionSrc?: "description" | "summary" | string;
  /** Displays the slot section of the element description */
  slotDocs?: boolean;
  /** Displays the event section of the element description */
  eventDocs?: boolean;
}
```

```js
// custom-elements-manifest.config.js

import { generateCustomData } from "cem-plugin-vs-code-custom-data-generator";

export default {
  plugins: [
    generateCustomData({
      /** Output directory to write the React wrappers to - default is the root of the project */
      outdir: 'dist',

      /** name of the file with you component's custom data - default is "vscode.html-custom-data.json" */
      filename: 'my-library-custom-data.json',

      /** class names of any components you would like to exclude from the custom data */
      exclude: ['MyInternalElement'],

      /** The property name from the component object constructed by the CEM Analyzer */
      descriptionSrc: "description";

      /** Displays the slot section of the element description */
      slotDocs: true;

      /** Displays the event section of the element description */
      eventDocs: true;
    }),
  ],
};
```

## Tag Mapping

![an example of the jsDoc tags used to create the custom data file](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/tags.png?raw=true)

| Tag                      | Description                                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@summary` / description | This provides the description for the custom element when autocomplete is used or the element is hovered. If no summary is provided, it will fall back to the `description` if it is available. |
| `@attr` / `@attribute`   | This will provide descriptions for each attribute. If you use union types in TypeScript or in the description, these will display as autocomplete options.                                      |
| `@reference`             | This is a custom tag for this plugin. It creates reference links at the bottom of the information bubble. Multiple references are supported.                                                    |

The `@summary` and `@attr` / `@attribute` descriptions have limited markdown support and enable you to style text, create links, and add code snippets.

### Descriptions

Using the `descriptionSrc` configuration, you can determine the source of the text that gets displayed in the editor autocomplete bubble. This is useful if you want to provide alternate descriptions for your React users.

If no value is provided, the plugin will use the `summary` property and then fall back to the `description` property if a summary is not available.

![description section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/description.png?raw=true)

**Note:** _Descriptions support multiple lines by breaking the comment up into multiple lines whereas summaries do not and will need to be manually added using `\n`._

````js
// description example

/**
 *
 * Radio groups are used to group multiple radios or radio buttons so they function as a single form control. Here is its [documentation](https://my-docsite.com).
 *
 * Use it like this:
 * ```html
 * <radio-group value="2" size="3">
 *   <span slot="label">My Label</span>
 *   <radio-button value="1">Option 1</radio-button>
 *   <radio-button value="2">Option 2</radio-button>
 *   <radio-button value="3">Option 3</radio-button>
 * </radio-group>
 * ```
 *
 */
````

````js
// summary example

/**
 *
 * @summary Radios buttons allow users to select a single option from a group. Here is its [documentation](https://my-site.com/documentation).\n\nUse it like this:\n```html\n<radio-button value="1" disabled>Your label</radio-button>\n```
 *
 * /
````

## Slots

Slot information will display with the element description during autocompletion or when hovered over. This section can be hidden by setting `slotDocs` to `false` in the config.

![slot section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/slots.png?raw=true)

## Events

Event information will display with the element description during autocompletion or when hovered over. This section can be hidden by setting `slotEvents` to `false` in the config.

![events section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/events.png?raw=true)

## CSS Custom Data

Adding the CSS Custom Data file to your config provides you with autocomplete for your component's CSS custom properties.

These values can be added in your component's jsDoc. The `var()` wrapper will be added automatically.

```ts
/**
 *
 * @cssprop {--radius-sm,--radius-md,--radius-lg} --border-radius - Controls the border radius of the component
 * 
 */
```

![events section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/css_autocomplete.gif?raw=true)
