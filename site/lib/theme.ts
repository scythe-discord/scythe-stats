import { createDarkTheme, darkThemePrimitives } from 'baseui';

export const PRIMARY_FONT_FAMILY = 'Fira Sans, Helvetica, sans-serif, serif';

const breakpoints: { [key: string]: number } = {
  medium: 780,
  large: 1450,
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
    mediaQuery: {} as { [key: string]: string },
  }
);

const primitives = {
  ...darkThemePrimitives,
  primaryFontFamily: PRIMARY_FONT_FAMILY,
};

const overrides = {
  ...responsiveThemeOverrides,
  colors: {
    linkVisited: primitives.primary,
  },
  typography: {
    HeadingSmall: {
      fontWeight: 500,
    },
    HeadingLarge: {
      fontWeight: 500,
    },
    HeadingXLarge: {
      fontWeight: 500,
    },
    HeadingXXLarge: {
      fontWeight: 500,
    },
  },
};

export default createDarkTheme(primitives, overrides);
