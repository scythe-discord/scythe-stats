module.exports = {
  plugins: ['baseui', 'react'],
  rules: {
    'baseui/deprecated-theme-api': 'warn',
    'baseui/deprecated-component-api': 'warn',
    'baseui/no-deep-imports': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error'
  }
};
