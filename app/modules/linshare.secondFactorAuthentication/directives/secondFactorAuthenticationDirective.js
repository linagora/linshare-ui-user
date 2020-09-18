/**
 * secondFactorAuthenticationDirective Directive
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .directive('otpInputKeypress', otpInputKeypress)
    .directive('otpInputAutofocus', otpInputAutofocus);

  function otpInputKeypress() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.on('keypress', function(e){
          if (e.key === 'Enter') {
            return;
          }

          if (!e.key.match(/[0-9]/)) {
            e.preventDefault();
          }
        });
      }
    };
  };

  otpInputAutofocus.$inject = ['$timeout'];

  function otpInputAutofocus($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        angular.element(document).ready(function () {
          $timeout(function() {
            element[0].focus();
          });
        });
      }
    };
  };
})();