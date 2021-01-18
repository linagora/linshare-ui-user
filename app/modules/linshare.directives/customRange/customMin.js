angular
  .module('linshare.directives')
  .directive('lsCustomMin', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attr, ngModel) {
        let min = Number(attr.lsCustomMin);

        ngModel.$validators.validMin = (modelValue, viewValue) => min >= 0 ? Number(modelValue || viewValue) > min : true;
      }
    };
  });