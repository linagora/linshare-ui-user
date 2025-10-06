const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js',
    config: './app/config/config.js',
    'theme.default': './app/styles/theme.default.scss',
    'theme.original': './app/styles/theme.original.scss',
    'theme.red': './app/styles/theme.red.scss',
    'theme.darkgreen': './app/styles/theme.darkgreen.scss'
  },
  output: {
    filename: (pathData) => {
      if (pathData.chunk.name === 'config') {
        return 'config/config.js';
      }

      else if (pathData.chunk.name.indexOf('theme') >= 0) {
        return 'styles/[name].[contenthash].js';
      }

      else {
        return '[name].[contenthash].js';
      }
    },
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [{
      test: /\.html$/,
      use: {
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
            plugins: ['angularjs-annotate']
          }
      }, {
        loader: 'eslint-loader'
      }]
    }, {
      test: /\.(sa|sc|c)ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
            importLoaders: 1
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true
          }
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ]
    }, {
      test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      excludeChunks: ['theme.red', 'theme.darkgreen', 'theme.original']
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Base64: 'js-base64',
      moment: 'moment/moment',
      Waves: 'node-waves',
      Flow: '@flowjs/flow.js/dist/flow',
      uuid: 'uuid'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css',
      chunkFilename: '[id].[fullhash].css'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'app/i18n/original', to: 'i18n/original' },
        { from: 'app/favicon.ico', to: 'favicon.ico' },
        { from: 'app/images/common', to: 'images' },
        { from: 'package.json', to: 'about.json' },
        { from: 'error-pages', to: 'error-pages' }
      ]
    })
  ],
  resolve: {
    fallback: {
      assert: require.resolve("assert/")
    }
  }
};
