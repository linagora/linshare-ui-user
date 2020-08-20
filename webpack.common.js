const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');

const isProductionBuild = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    app: './src/index.js',
    config: './app/config/config.js',
    theme: './app/styles/theme.default.scss',
    themeRed: './app/styles/theme.red.scss',
    themeDarkGreen: './app/styles/theme.darkgreen.scss'
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'config' ?
        'config.js' :
        '[name].[hash].js';
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
        loader: 'style-loader',
        loader: isProductionBuild
          ? MiniCssExtractPlugin.loader
          : 'style-loader'
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
      excludeChunks: ['themeDarkGreen', 'themeRed']
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
    new ImageminPlugin({
      maxFileSize: 10000, // Only apply this one to files equal to or under 10kb
      disable: !isProductionBuild,
      test: /\.(png|jpg|jpeg|gif|svg)$/,
      pngquant: {
        quality: '95-100'
      },
      jpegtran: {
        progressive: false
      },
      gifsicle: {
        interlaced: false,
        optimizationLevel: 1
      }
    }),
    new CopyPlugin({
      patterns: [
        { from: 'app/i18n/original', to: 'i18n/original' },
        { from: 'app/favicon.ico', to: 'favicon.ico' },
        { from: 'error-pages', to: 'error-pages' }
      ]
    })
  ]
};
