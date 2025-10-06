const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const LINSHARE_BACKEND_URL = process.env.LINSHARE_BACKEND_URL || 'http://localhost:28080';
const DISABLE_HOST_CHECK = process.env.DISABLE_HOST_CHECK === 'true' ? true : false;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: {
      index: 'index.html'
    },
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 3000,
    host: 'localhost',
    allowedHosts: DISABLE_HOST_CHECK ? 'all' : 'auto',
    proxy: [
      {
        context: [
          '/linshare/webservice/'
        ],
        target: LINSHARE_BACKEND_URL,
        secure: true,
        changeOrigin: true,
        withCredentials: true
      }
    ]
  }
});
