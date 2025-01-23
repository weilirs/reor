import {createThemeBuilder} from "@tamagui/theme-builder";

import {masks} from "./masks";
import {palettes} from "./palettes";
import {shadows} from "./shadows";
import {templates} from "./templates";
import {darkColors, lightColors} from "./token-colors";

const customColorPalette = {
  dark: {
    editorbg11: '#191919',
  },
  light: {
    editorbg11: '#FFFFFF',
  }
}

const colorThemeDefinition = (colorName: string) => [
  {
    parent: "light",
    palette: colorName,
    template: "colorLight",
  },
  {
    parent: "dark",
    palette: colorName,
    template: "base",
  },
];

const themesBuilder = createThemeBuilder()
  .addPalettes({
    ...palettes,
    dark: { 
      ...palettes.dark, 
      ...customColorPalette.dark 
    },
    light: { 
      ...palettes.light, 
      ...customColorPalette.light 
    },
  })
  .addTemplates(templates)
  .addMasks(masks)
  .addThemes({
    light: {
      template: "base",
      palette: "light",
      nonInheritedValues: {
        ...lightColors,
        ...shadows.light,
        ...customColorPalette.light,
      },
    },
    dark: {
      template: "base",
      palette: "dark",
      nonInheritedValues: {
        ...darkColors,
        ...shadows.dark,
        ...customColorPalette.dark,
      },
    },
  })
  .addChildThemes({
    yellow: colorThemeDefinition("yellow"),
    green: colorThemeDefinition("green"),
    blue: colorThemeDefinition("blue"),
    purple: colorThemeDefinition("purple"),
    red: colorThemeDefinition("red"),
    brand: colorThemeDefinition("brand"),
  });


export const themes = themesBuilder.build();
