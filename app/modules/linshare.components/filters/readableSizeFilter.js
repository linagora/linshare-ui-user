'use strict';

angular.module('linshare.components')
  .filter('readableSize', function() {
    return function(bytes, si) {
      var thresh = si ? 1000 : 1024;
      if(bytes < 0) {
        return 0+ ' B';
      } else if (bytes < thresh) {
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
  .filter('getextension', function() {
    return function(filename) {
      if (filename) {
        return filename.split('.').pop().toUpperCase();
      }
    };
  })
  .filter('mimetypeIcone', function() {
    return function(fileType) {
      var icone = 'ls-file-type-other';
      var type = [
        {regex: /pdf/, icone: 'ls-file-type-pdf iconcolor-pdf', info: 'PDF'},
        {regex: /image|png|jpeg|jpg/, icone: 'ls-file-type-img iconcolor-text', info: 'IMAGE'},
        {regex: /audio/, icone: 'ls-file-type-audio iconcolor-text', info: 'AUDIO'},
        {regex: /video/, icone: 'ls-file-type-video iconcolor-text', info: 'VIDEO'},
        {regex: /powerpoint/, icone: 'ls-file-type-presentation iconcolor-powerpoint', info: 'POWERPOINT'},
        {regex: /application\/vnd.oasis.opendocument.presentation/, icone: 'ls-file-type-presentation iconcolor-powerpoint', info: 'ODP'},
        {regex: /word/, icone: 'ls-file-type-text iconcolor-text', info: 'WORD'},
        {regex: /application\/vnd.oasis.opendocument.text/, icone: 'ls-file-type-text iconcolor-text', info: 'ODT'},
        {regex: /zip|tar|compressed|tar.bz2|tgz/, icone: 'ls-file-type-archive iconcolor-text', info: 'ARCHIVE'},
        {regex: /excel/, icone: 'ls-excel-alt iconcolor-excel', info: 'EXCEL'},
        {regex: /application\/vnd.oasis.opendocument.spreadsheet/, icone: 'ls-excel-alt iconcolor-excel', info: 'ODS'},
        {regex: /text\/plain/, icone: 'ls-file-type-text iconcolor-text', info: 'TEXT'},
        {regex: /text/, icone: 'ls-file-type-code iconcolor-text', info: 'CODE'}
      ];

      _.forEach(type, function(elm) {
        if (fileType.match(elm.regex)) {
          icone = elm.icone;
          return false;
        }
      });
      return icone;
    };
  });
