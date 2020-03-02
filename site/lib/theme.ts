import { createTheme, lightThemePrimitives } from 'baseui';

export const PRIMARY_FONT_FAMILY = 'Fira Sans, Helvetica, sans-serif, serif';

const primitives = {
  ...lightThemePrimitives,
  primaryFontFamily: PRIMARY_FONT_FAMILY
};

const overrides = {};

export default createTheme(primitives, overrides);
