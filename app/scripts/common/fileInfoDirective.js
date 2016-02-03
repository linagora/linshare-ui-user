'use strict';

angular.module('linshareUiUserApp')
  .directive('lsLoginFormDisplay', function(){
    return {
      link: function(scope, elm) {
        elm.parent().addClass('login-content');
        elm.css('margin-top','100px');
        elm.css('margin-left','30%');
      }
    };
  });
