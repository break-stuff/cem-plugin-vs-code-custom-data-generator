import { Options } from "../types";
import { config, getCssValues, getValueSet, updateConfig } from "./generator";

describe("Configuration", () => {
  test("given a custom `outdir` config value, the config value should be updated, but others should use default", () => {
    // Arrange
    const options = {
      outdir: "./demo",
    };

    // Act
    updateConfig(options);

    // Assert
    expect(config.outdir).toBe("./demo");
    expect(config.htmlFileName).toBe("vscode.html-custom-data.json");
  });

  test("given a custom `slot` label, the config value should be updated, but other should use default", () => {
    // Arrange
    const options: Options = {
      labels: {
        slots: "Slug",
      },
    };

    // Act
    updateConfig(options);

    // Assert
    expect(config.labels?.slots).toBe("Slug");
    expect(config.htmlFileName).toBe("vscode.html-custom-data.json");
  });
});

describe("CSS Values", () => {
  test("given a string with comma separated values, it should return and array of CSS Value objects", () => {
    // Arrange
    const input = '--color-primary,4px,#ccc';

    // Act
    const values = getCssValues(input);

    // Assert
    expect(values[0].name).toBe("var(--color-primary)");
    expect(values[1].name).toBe("4px");
  });
});

describe("CSS Value Sets", () => {
  test("given a string array of values, it should be converted to an array of CSS Value objects", () => {
    // Arrange
    const options = {
      cssSets: [
        {
          name: "radiuses",
          values: ["--radius-sm", "--radius-md", "--radius-lg"],
        },
      ],
    };

    // Act
    updateConfig(options);
    const valueSet = getValueSet("set:radiuses");

    // Assert
    expect(valueSet[0].name).toBe("var(--radius-sm)");
    expect(valueSet[0].description).toBe(undefined);
  });

  test("given an object array of values, it should be converted to an array of CSS Value objects with a description", () => {
    // Arrange
    const options = {
      cssSets: [
        {
          name: "radiuses",
          values: [
            { name: "--radius-sm", description: "2px" },
            { name: "--radius-md", description: "4px" },
            { name: "--radius-lg", description: "8px" },
          ],
        },
      ],
    };

    // Act
    updateConfig(options);
    const valueSet = getValueSet("set:radiuses");

    // Assert
    expect(valueSet[1].name).toBe("var(--radius-md)");
    expect(valueSet[1].description).toBe("4px");
  });

  test("given a set name that doesn't exist, it should return and empty array", () => {
    // Arrange
    const options = {
      cssSets: [
        {
          name: "radiuses",
          values: ["--radius-sm", "--radius-md", "--radius-lg"],
        },
      ],
    };

    // Act
    updateConfig(options);
    const valueSet = getValueSet("set:random");

    // Assert
    expect(valueSet.length).toBe(0);
  });
});
