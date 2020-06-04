module.exports = {
  apps: [
    {
      name: 'api',
      script: 'index.js',
      cwd: 'api/dist',
    },
    {
      name: 'site',
      script: 'yarn --cwd site next start',
    },
    {
      name: 'bot',
      script: 'index.js',
      cwd: 'bot/dist',
    },
  ],
};
