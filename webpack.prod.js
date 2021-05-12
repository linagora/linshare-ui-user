const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        exclude: /config.js/,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default']
        },
        canPrint: true
      })
    ]
  },
  plugins: [
    new ImageminPlugin({
      maxFileSize: 10000, // Only apply this one to files equal to or under 10kb
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
    new CleanWebpackPlugin()
  ]
});
