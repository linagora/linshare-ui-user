'use strict';

angular.module('linshareUiUserApp')
  .filter('readableSize', function() {
    return function(bytes, si) {
      var thresh = si ? 1000 : 1024;
      if (bytes < thresh) return bytes + ' B';
      var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
      var u = -1;
      do {
        bytes /= thresh;
        ++u;
      } while (bytes >= thresh);
      return bytes.toFixed(1) + ' ' + units[u];
    };
    //return function(size, precision) {
    //  if (isNaN(parseFloat(size)) || !isFinite(size)) {
    //    return '-';
    //  }
    //  if (typeof precision === 'undefined') {
    //    precision = 1;
    //  }
    //  var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
    //    number = Math.floor(Math.log(size) / Math.log(1024));
    //  return (size / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    //};
  });
