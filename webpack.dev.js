const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    open: false,
    contentBase: path.resolve(__dirname, 'dist'),
    port: 3504,
    host: '0.0.0.0',
    clientLogLevel: 'info',
    // Adds headers to all responses:
    // headers: {
    //   'X-Custom-Foo': 'bar'
    // },
    // https: true,
  },
});
