'use strict';

angular.module('linshareUiUserApp')
  .filter('readableSize', function(){
    return function(size, precision) {
      if (isNaN(parseFloat(size)) || !isFinite(size)) {
        return '-';
      }
      if (typeof precision === 'undefined') {
        precision = 1;
      }
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
  });
