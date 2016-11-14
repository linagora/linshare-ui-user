/**
 * workingDatePicker directive
 * @namespace LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .directive('workingDatePicker', workingDatePicker);

  workingDatePicker.$inject = ['componentsConfig', '$translate', 'lsAppConfig'];

  /**
   *  @namespace workingDatePicker
   *  @desc Complementary date picker directive
   *  @example <div my-example></div>
        <input working-date-picker type="text" name="expirationDate" id="expirationDate"
               x-ng-model="newGuestObject.expirationDate.value"
               class="form-control date-picker-input" datepicker-popup="{{format}}"
               is-open="opened" x-ng-click="open($event, 'opened')"
               min-date="newGuestObject.datepicker.minDate"
               max-date="newGuestObject.datepicker.maxDate"
               min="{{newGuestObject.datepicker.minDate | date:'yyyy-MM-dd'}}"
               max="{{newGuestObject.datepicker.maxDate | date:'yyyy-MM-dd'}}"/>
   *  @memberOf LinShare.components
   */
  function workingDatePicker(componentsConfig, $translate, lsAppConfig) {
    var FR_DATE_FORMAT = lsAppConfig.date_fr_format;
    var EN_DATE_FORMAT = lsAppConfig.date_en_format;
    var directive = {
      restrict: 'A',
      scope: false,
      transclude: true,
      require: 'ngModel',
      link: linkFn
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc DOM manipulation function, relared to the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} elm - jqLite-wrapped element that this directive matches
     *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     *  @param {Object} ctrl - Directive's required controller instance(s)
     *  @memberOf LinShare.components.workingDatePicker
     */
    function linkFn(scope, elment, attrs, ctrl) {
      ctrl.$validators.invalidDate = invalidDate;
      scope.format = $translate.use() === 'fr' ? FR_DATE_FORMAT : EN_DATE_FORMAT;
      scope.open = openDefault;

      /**
       *  @name invalidDate
       *  @desc Evaluate the date value to be inside the range defined by min & max
       *  @param {Date/String/Integer} value - Date value, should be compliant with Date() object as an argument of instatiation
       *  @returns {Boolean} return if the date is valid or not
       *  @memberOf LinShare.components.workingDatePicker.linkFn
       */
      function invalidDate(value) {
        var currentDate = new Date(value).setHours(0, 0, 0, 0);
        if (currentDate < new Date(attrs.min).setHours(0, 0, 0, 0) || currentDate > new Date(attrs.max).setHours(0, 0, 0, 0)) {
          return false;
        }
        return true;
      }

      /**
       *  @name openDefault
       *  @desc defautl option at open for the date picker
       *  @param {Object} $event - Event happening
       *  @param {String} dateStartOpenend - key name of the date picker opened
       *  @memberOf LinShare.components.workingDatePicker.linkFn
       */
      function openDefault($event, dateStartOpened) {
        $event.preventDefault();
        $event.stopPropagation();
        scope[dateStartOpened] = true;
      }
    }
  }
})();
