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

.filter('remainingTime', ['$filter', function($filter) {

    var NB_SECONDS_IN_MIN = 60;
    var NB_SECONDS_IN_HOUR = 3600;
    var NB_SECONDS_IN_DAY = 3600 * 24;

    var secToMin = function(seconds) {
      return parseInt(seconds/NB_SECONDS_IN_MIN) + ' min' +
        Math.round((parseFloat(seconds/NB_SECONDS_IN_MIN) - parseInt(seconds/NB_SECONDS_IN_MIN)) * 60) + ' s';
    };

    var secToHour = function(seconds) {
      return parseInt(seconds/NB_SECONDS_IN_HOUR)  + ' h' +
        parseInt((parseFloat(seconds/NB_SECONDS_IN_HOUR) - parseInt(seconds/NB_SECONDS_IN_HOUR)) * 60) + ' min';
    };

    return function(seconds) {
      if(!Number.isFinite(seconds)) {
        return '-';
      }
      if (seconds == 0){
        var $translate = $filter('translate');
        return $translate("HEADER.UPLOAD_PROGRESS.UPLOAD_SERVER");
      } else if(seconds < NB_SECONDS_IN_MIN) {
        return Math.round(seconds) + ' s';
      } else if(NB_SECONDS_IN_MIN <= seconds < NB_SECONDS_IN_HOUR) {
        return secToMin(seconds);
      } else if(NB_SECONDS_IN_HOUR <= seconds < NB_SECONDS_IN_DAY) {
        return secToHour(seconds);
      }
    };
  }])
  .filter('relativeTime', function($translate) {
    moment.locale($translate.use());
    return function(time) {
      return moment(time).fromNow();
    };
  })
  .filter('getextension', function() {
    return function(filename) {
      if(filename) {
        return filename.split('.').pop().toUpperCase();
      }
    };
  })
  .filter('mimetypeIcone', function() {
    return function(fileType) {
      var icone = 'fa-file-text-o';
      var type = [
        {regex: /pdf/, icone: 'fa-file-pdf-o iconcolor-pdf', info: 'PDF'},
        {regex: /image|png|jpeg|jpg/, icone: 'fa-file-image-o iconcolor-text', info: 'IMAGE'},
        {regex: /audio/, icone: 'fa-file-audio-o iconcolor-text', info: 'AUDIO'},
        {regex: /video/, icone: 'fa-file-video-o iconcolor-text', info: 'VIDEO'},
        {regex: /powerpoint/, icone: 'fa-file-powerpoint-o iconcolor-powerpoint', info: 'POWERPOINT'},
        {regex: /word/, icone: 'fa-file-word-o iconcolor-word', info: 'WORD'},
        {regex: /zip|tar|compressed|tar.bz2|tgz/, icone: 'fa-file-archive-o iconcolor-text', info: 'ARCHIVE'},
        {regex: /excel/, icone: 'fa-file-excel-o iconcolor-excel', info: 'EXCEL'},
        {regex: /text\/plain/, icone: 'fa-file-text-o iconcolor-text', info: 'TEXT'},
        {regex: /text/, icone: 'fa-file-code-o iconcolor-text', info: 'CODE'}
      ];

      angular.forEach(type, function(elm) {
        if (fileType.match(elm.regex)) {
          icone = elm.icone;
          return icone;
        }
      });
      return icone;
    };
  });
