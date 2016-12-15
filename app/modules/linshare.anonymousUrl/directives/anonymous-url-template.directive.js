/**
 * lsAnonymousUrlTemplate Directive
 * @namespace LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .directive('lsAnonymousUrlTemplate', lsAnonymousUrlTemplate);

  lsAnonymousUrlTemplate.$inject = ['$log', 'anonymousUrlService'];

  /**
   *  @namespace lsAnonymousUrlTemplate
   *  @desc Set the template for anynous url
   *  @example <ls-anonymous-url-template></ls-anonymous-url-template>
   *  @memberOf LinShare.anonymousUrl
   */
  function lsAnonymousUrlTemplate($log, anonymousUrlService) {
    var directive = {
      restrict: 'EA',
      templateUrl: function() {
        $log.debug('status anourl', anonymousUrlService.status);
        if (anonymousUrlService.status === 404) {
          return 'modules/linshare.anonymousUrl/views/404.html';
        } else {
          return 'modules/linshare.anonymousUrl/views/anonymousUrl.html';
        }
      }
    };
    return directive;
  }
})();
