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
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });
    config.plugins.push(
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /(en|es|fr)$/)
    );
    config.externals = config.externals || {};
    config.externals['styletron-server'] = 'styletron-server';
    return config;
  },
});
