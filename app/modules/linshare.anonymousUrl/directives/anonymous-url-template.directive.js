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
      template: function() {
        $log.debug('status anourl', anonymousUrlService.status);

        return anonymousUrlService.status === 404 ?
          require('../views/404.html') :
          require('../views/anonymousUrl.html')
      }
    };
    return directive;
  }
})();
