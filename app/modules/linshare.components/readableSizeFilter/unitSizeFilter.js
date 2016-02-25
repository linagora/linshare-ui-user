'use strict';

angular.module('linshare.components')
  .filter('readableSize', function() {
    return function(bytes, si) {
      var thresh = si ? 1000 : 1024;
      if (bytes < thresh) {
        return bytes + ' B';
      }
      var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
      var u = -1;
      do {
        bytes /= thresh;
        ++u;
      } while (bytes >= thresh);
      return bytes.toFixed(1) + ' ' + units[u];
    };
  })

.filter('remainingTime', function() {

    var NB_SECONDS_IN_MIN = 60;
    var NB_SECONDS_IN_HOUR = 3600;
    var NB_SECONDS_IN_DAY = 3600 * 24;

    var secToMin = function(seconds) {
      return parseInt(seconds/NB_SECONDS_IN_MIN) + ' min' +
        (parseFloat(seconds/NB_SECONDS_IN_MIN) - parseInt(seconds/NB_SECONDS_IN_MIN)) * 60 + ' s';
    };

    var secToHour = function(seconds) {
      return parseInt(seconds/NB_SECONDS_IN_HOUR)  + ' h' +
        parseInt((parseFloat(seconds/NB_SECONDS_IN_HOUR) - parseInt(seconds/NB_SECONDS_IN_HOUR)) * 60) + ' min';
    };

    return function(seconds) {
      if(!Number.isFinite(seconds)) {
        return '-';
      }
      if(seconds < NB_SECONDS_IN_MIN) {
        return seconds + ' s';
      } else if(NB_SECONDS_IN_MIN <= seconds < NB_SECONDS_IN_HOUR) {
        return secToMin(seconds)
      } else if(NB_SECONDS_IN_HOUR <= seconds < NB_SECONDS_IN_DAY) {
        return secToHour(seconds);
      }
    }
  })
  .filter('relativeTime', function($translate) {
    moment.locale($translate.use());
    return function(time) {
      return moment(time).fromNow();
    }
  });
