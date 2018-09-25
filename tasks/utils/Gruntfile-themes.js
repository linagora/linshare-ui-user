'use strict';

var fs = require('fs');

function GruntfileThemes(appConfig) {
  this.appConfig = appConfig;
}

/**
 * List all the theme available in the application. Only scss files prefixed by "theme." will be returned.
 */
GruntfileThemes.prototype.list = function list() {
  return fs.readdirSync(this.appConfig.app + '/styles')
  .filter(function(file) {
    return /^theme\..*scss/.test(file);
  }).map(function(file) {
    return file.match(/(.*)\.scss$/)[1];
  });
}

module.exports = GruntfileThemes;
