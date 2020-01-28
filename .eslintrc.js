module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  globals: {
    module: 'readonly'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended-module',
    'prettier/@typescript-eslint'
  ],
  plugins: ['baseui'],
  rules: {
    'node/no-missing-import': [
      'error',
      {
        resolvePaths: ['./src'],
        tryExtensions: ['.js', '.ts', '.json', '.node']
      }
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    'baseui/deprecated-theme-api': 'warn',
    'baseui/deprecated-component-api': 'warn',
    'baseui/no-deep-imports': 'warn'
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ]
};
