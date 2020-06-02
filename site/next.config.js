// eslint-disable-next-line
const path = require('path');
// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer');
// eslint-disable-next-line
require('dotenv').config({ path: path.resolve(process.cwd(), '..', '.env') });

module.exports = withBundleAnalyzer({
  enabled: false,
})({
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /(en|es|fr)$/)
    );
    return config;
  },
});
