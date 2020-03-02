import { createTheme, lightThemePrimitives } from 'baseui';

export const PRIMARY_FONT_FAMILY = 'Fira Sans, Helvetica, sans-serif, serif';

const primitives = {
  ...lightThemePrimitives,
  primaryFontFamily: PRIMARY_FONT_FAMILY
};

const overrides = {
  Card: {
    Root: {
      style: {
        border: '10px solid black'
      }
    }
  }
};

export default createTheme(primitives, overrides);
