module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 5 versions',
        'ie >= 11',
        'Firefox ESR',
        'Firefox >= 38',
        'Edge >= 38'
      ]
    })
  ]
};