import { LightTheme, createTheme, lightThemePrimitives } from 'baseui';

export const PRIMARY_FONT_FAMILY = 'Fira Sans, Helvetica, sans-serif, serif';

const breakpoints: { [key: string]: number } = {
  medium: 750,
  large: 1450
};

const responsiveThemeOverrides = Object.keys(breakpoints).reduce(
  (acc, key) => {
    acc.mediaQuery[
      key
    ] = `@media screen and (min-width: ${breakpoints[key]}px)`;
    return acc;
  },
  {
    breakpoints,
    mediaQuery: {} as { [key: string]: string }
  }
);

const primitives = {
  ...lightThemePrimitives,
  primaryFontFamily: PRIMARY_FONT_FAMILY
};

const overrides = {
  ...responsiveThemeOverrides,
  colors: {
    linkVisited: LightTheme.colors.linkText
  }
};

export default createTheme(primitives, overrides);
