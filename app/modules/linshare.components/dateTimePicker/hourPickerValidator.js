angular
  .module('linshare.components')
  .directive('hourPickerValidator', hourPickerValidator);

function hourPickerValidator() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      minHour: '=',
      maxHour: '='
    },
    link: function(scope, elm, attrs, ngModelCtrl) {
      ngModelCtrl.$validators.validHour = function(modelValue) {
        return (!scope.minHour || modelValue >= scope.minHour) && (!scope.maxHour || modelValue <= scope.maxHour);
      };
    }
  };
}
