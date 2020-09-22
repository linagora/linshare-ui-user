const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const LINSHARE_BACKEND_URL = process.env.LINSHARE_BACKEND_URL || 'http://localhost:28080';

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 20081,
    host: '0.0.0.0',
    proxy: [
      {
        context: [
          '/linshare/webservice/'
        ],
        target: LINSHARE_BACKEND_URL,
        disableHostCheck: true,
        secure: true,
        changeOrigin: true,
        withCredentials: true
      }
    ]
  }
});
