/**
 * secondFactorAuthenticationDirective Directive
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .directive('onKeypress', function() {
      return {
          restrict: 'A',
          link: function(scope, element) {
            element.on('keypress', function(e){
              var keyNumberConverted = Number(e.key);

              if (e.key === 'Enter') {
                return;
              }

              if(isNaN(keyNumberConverted)){
                e.preventDefault();
              }
            });
          }
      };
    });

})();