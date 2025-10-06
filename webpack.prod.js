const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        exclude: /config.js/,
        parallel: true
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 30 * 1024,
      maxAsyncRequests: 20,
      maxInitialRequests: 30,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    runtimeChunk: "single",
  },
  plugins: [
    new ImageMinimizerPlugin({
      test: /\.(png|jpe?g|gif|svg)$/i,
      minimizer: [
        {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: { quality: 80 },
              png: { quality: 80 },
              webp: { quality: 80 },
              avif: { quality: 50 },
            },
          },
        },
        {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            plugins: [
              {
                name: "preset-default",
                params: {
                  overrides: { removeViewBox: false },
                },
              },
              "removeDimensions",
            ],
          },
        },
      ],
      severityError: "warning",
      loader: false,
    }),
    new CleanWebpackPlugin(),
    new CompressionPlugin({
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      threshold: 10 * 1024, // > 10kb
      minRatio: 0.8,
    }),
  ]
});
