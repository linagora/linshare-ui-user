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
  .filter('relativeTime', function($translate) {
    moment.locale($translate.use());
    return function(time) {
      return moment(time).fromNow();
    };
  })
  .filter('getextension', function() {
    return function(filename) {
      if (filename) {
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
