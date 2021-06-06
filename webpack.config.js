const path = require('path');
const webpack = require('webpack');
const PrettierPlugin = require("prettier-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const getPackageJson = require('./scripts/getPackageJson');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const {
  version,
  name,
  license,
  repository,
  author,
} = getPackageJson('version', 'name', 'license', 'repository', 'author');

const banner = `
  ${name} v${version}
  ${repository.url}

  Copyright (c) ${author.replace(/ *<[^)]*> */g, " ")} and project contributors.

  This source code is licensed under the ${license} license found in the
  LICENSE file in the root directory of this source tree.
`;

module.exports = {
  mode: "production",
  devtool: 'source-map',
  entry: './src/lib/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    library: {
      name: 'SimpleExpress',
      type: 'umd',
    },
    globalObject: 'this',
    clean: true
  },
  externals: {
    lodash: {
      root: '_',
      commonjs2: 'lodash',
      commonjs: 'lodash',
      amd: 'lodash'
    },
    "body-parser": {
      root: 'BodyParser',
      commonjs2: 'body-parser',
      commonjs: 'body-parser',
      amd: 'body-parser'
    },
    "cookie-parser": {
      root: 'CookieParser',
      commonjs2: 'cookie-parser',
      commonjs: 'cookie-parser',
      amd: 'cookie-parser'
    },
    "cors": {
      root: 'Cors',
      commonjs2: 'cors',
      commonjs: 'cors',
      amd: 'cors'
    },
    "debug": {
      root: 'Debug',
      commonjs2: 'debug',
      commonjs: 'debug',
      amd: 'debug'
    },
    "express": {
      root: 'Express',
      commonjs2: 'express',
      commonjs: 'express',
      amd: 'express'
    },
    "prop-types": {
      root: 'PropTypes',
      commonjs2: 'prop-types',
      commonjs: 'prop-types',
      amd: 'prop-types'
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({ extractComments: false }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false
          }
        }
      })
    ],
  },
  devServer: {
    open: true,
    hot: true,
    host: "localhost",
    static: path.join(__dirname, 'demo'),
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.(m|j|t)s$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: true } },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
        use: ['url-loader'],
      }
    ]
  },
  plugins: [
    new PrettierPlugin(),
    new MiniCssExtractPlugin({
        filename: 'css/index.css'
    }),
    new webpack.BannerPlugin(banner),
    new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    fallback: {
      "fs": false,
      "net": false,
      "path": false,
      "zlib": false,
      "crypto": false,
      "http": false,
      "https": false,
      "stream": false,
      "buffer": false,
      "util": false,
    }
  },
};
