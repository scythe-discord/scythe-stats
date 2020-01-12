module.exports = {
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
