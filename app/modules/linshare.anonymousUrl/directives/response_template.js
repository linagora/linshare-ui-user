/**
 * @author Alpha O. Sall <asall@linagora.com>
 */

'use strict';

angular.module('linshare.anonymousUrl')
.directive('lsAnonymousUrlTemplate', function(AnonymousUrlService, $log) {
  return {
    restrict: 'EA',
    templateUrl: function() {
      var template = '';
      $log.debug('status anourl', AnonymousUrlService.status);
      switch(AnonymousUrlService.status) {
        case 404:
          template = 'modules/linshare.anonymousUrl/views/404.html';
          break;
        case 200:
          template = 'modules/linshare.anonymousUrl/views/anonymousUrl.html';
          break;
        default:
          template = 'modules/linshare.anonymousUrl/views/anonymousUrl.html';
      }
      return template;
    }
  };
});
