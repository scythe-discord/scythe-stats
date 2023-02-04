module.exports = {
  plugins: ['baseui', 'react', 'import'],
  rules: {
    'baseui/deprecated-theme-api': 'warn',
    'baseui/deprecated-component-api': 'warn',
    'baseui/no-deep-imports': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    // Prefer eslint-plugin-import for baseUrl compatibility
    'import/no-unresolved': 'error',
    'node/no-missing-import': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'site',
      },
    },
  },
  extends: ['plugin:@next/next/recommended'],
};
