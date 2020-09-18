/**
 * PasswordValidator Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .constant('PASSWORD_REGEX_RULE_MAPPINGS', {
      numberUpperCaseCharacters: /[A-Z]/g,
      numberLowerCaseCharacters: /[a-z]/g,
      numberDigitsCharacters: /\d/g,
      numberSpecialCharacters: /[^\s\w]/g
    })
    .directive('passwordValidator', passwordValidator);

  passwordValidator.$inject = ['_', 'PASSWORD_REGEX_RULE_MAPPINGS'];

  function passwordValidator(_, PASSWORD_REGEX_RULE_MAPPINGS) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elm, attrs, ngModelCtrl) {
        var rules = scope.$eval(attrs.passwordValidator);

        _.keys(rules).forEach(function(name) {
          if (PASSWORD_REGEX_RULE_MAPPINGS[name]) {
            ngModelCtrl.$validators[name] = function(model, value) {
              var matches = value && value.match(PASSWORD_REGEX_RULE_MAPPINGS[name]);

              return matches && matches.length >= rules[name];
            };
          }
        });
      }
    };
  }
})();
