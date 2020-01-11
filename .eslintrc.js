module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended-module',
    'prettier/@typescript-eslint'
  ],
  rules: {
    'node/no-missing-import': [
      'error',
      {
        resolvePaths: ['./src'],
        tryExtensions: ['.js', '.ts', '.json', '.node']
      }
    ]
  }
};
