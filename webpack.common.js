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
    'theme.red': './app/styles/theme.red.scss',
    'theme.darkgreen': './app/styles/theme.darkgreen.scss'
  },
  output: {
    filename: (pathData) => {
      if (pathData.chunk.name === 'config') {
        return 'config/config.js';
      }

      else if (pathData.chunk.name.indexOf('theme') >= 0) {
        return 'styles/[name].[hash].js';
      }

      else {
        return '[name].[hash].js';
      }
    },
    chunkFilename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist')
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
        loader: 'ng-annotate-loader',
        options: {
          ngAnnotate: 'ng-annotate-patched',
          es6: true,
          explicitOnly: false
        }
      }, {
        loader: 'babel-loader'
      }, {
        loader: 'eslint-loader'
      }]
    }, {
      test: /\.(sa|sc|c)ss$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1
        }
      }, {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: [
            require('autoprefixer')({
              browsers: [
                'last 5 version',
                'ie >= 11',
                'Firefox ESR',
                'Firefox >= 38',
                'Edge >= 38'
              ]
            })
          ]
        }
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      }]
    }, {
      test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        }
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      excludeChunks: ['theme.red', 'theme.darkgreen']
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
    new webpack.HashedModuleIdsPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'app/i18n/original', to: 'i18n/original' },
        { from: 'app/favicon.ico', to: 'favicon.ico' },
        { from: 'package.json', to: 'about.json' },
        { from: 'error-pages', to: 'error-pages' }
      ]
    })
  ]
};
