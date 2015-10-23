'use strict';

angular.module('linshareUiUserApp')
  .directive('lsFlowStyleInOut', function() {
    return {
      link : function(scope, element, attr) {
        console.log('my parenteee', element.parent().attr('style'));
        if(element.parent().attr('style')) {
          element.css('display', 'none');
        }
      }
    }
  });
