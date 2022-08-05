# cem-plugin-vs-code-custom-data-generator

This is a plugin automatically generates a custom data config file for [VS Code](https://code.visualstudio.com/) using the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/).

This config enables VS Code to display autocomplete and contextual information about your custom elements.

![demo of autocomplete features for custom elements in vs code](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/demo.gif?raw=true)

## Usage

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
  ]
}
```

If this is included in your `npm` package, the VS Code configuration will look something like this:

```json
{
  "html.customData": [
    "./node_modules/my-component-library/vscode.html-custom-data.json"
  ]
}
```

***Note:*** The path is relative to the root of the project, not the settings file.

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
  exclude?: string[],
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
    }),
  ],
};
```
## Tag Mapping

![an example of the jsDoc tags used to create the custom data file](https://github.com/break-stuff/cem-plugin-vs-code-custom-data-generator/blob/main/demo/images/tags.png?raw=true)

| Tag | Description |
| --- | ----------- |
| `@summary` | This provides the description for the custom element when autocomplete is used or the element is hovered |
| `@attr` / `@attribute` | This will provide descriptions for each attribute. If you use union types in TypeScript or in the description, these will display as autocomplete options. |
| `@reference` | This is a custom tag for this plugin. It creates reference links at the bottom of the information bubble. Multiple references are supported. |

The `@summary` and `@attr` / `@attribute` descriptions have limited markdown support and enable you to style text, create links, and add code snippets.

***Note:*** _The descriptions do support line breaks using `\n`, but in order to successfully write the contents to a file, they are escaped (`\\n`). To make them work properly in the editor, you will need to replace `\\n` with `\n`._