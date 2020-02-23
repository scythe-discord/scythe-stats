import { createTheme, lightThemePrimitives } from 'baseui';
const primitives = {
  ...lightThemePrimitives,
  primaryFontFamily: 'Fira Sans, Helvetica, sans-serif, serif'
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
