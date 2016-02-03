'use strict';

angular.module('linshareUiUserApp')
  .directive('lsFlowStyleInOut', function($log) {
    return {
      link : function(scope, element) {
        $log.debug('parent element', element.parent().attr('style'));
        if(element.parent().attr('style')) {
          element.css('display', 'none');
        }
      }
    };
  });
