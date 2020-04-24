// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = withBundleAnalyzer({
  enabled: false
})({
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en|es|fr)$/)
    );
    return config;
  }
});
