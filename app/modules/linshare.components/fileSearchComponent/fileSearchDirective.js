'use strict';

angular.module('linshare.components')
  .directive('filteringComponent', function(componentsConfig, $translate, lsAppConfig) {
    var FR_DATE_FORMAT = lsAppConfig.date_fr_format;
    var EN_DATE_FORMAT = lsAppConfig.date_en_format;
    return {
      restrict: 'E',
      scope: false,
      transclude: true,
      link: function(scope, elm, attrs) {

        scope.activatedField = {
          name: attrs.lsName,
          size: attrs.lsSize,
          date: attrs.lsDate,
          email: attrs.lsEmail
        };

        var filters = {
          sizeStart: null,
          sizeEnd: null,
          unity: '1000',
          dateType: '1',
          dateStart: '',
          dateEnd: '',
          selectedContact: {
            firstName: '',
            mail: '',
            lastName: ''
          }
        };
        scope.filters = filters;

        scope.clearParams = function() {
          scope.filters = filters;
          scope.tableParams.reload();
        };

        scope.showUnit = true;
        scope.showDateRange = true;
        scope.popoverValue = '';
        scope.selectedRecipient = '';

        scope.dt = new Date();

        scope.minRange = '';

        scope.minDate = scope.minDate ? null : new Date();
        scope.maxDate = scope.maxDate ? null : new Date();


        scope.open = function($event, dateStartOpened) {
          $event.preventDefault();
          $event.stopPropagation();
          scope[dateStartOpened] = true;
        };

        scope.dateOptions = {
          formatYear: 'yy',
          startingDay: 1
        };

        scope.format = $translate.use() == 'fr' ? FR_DATE_FORMAT : EN_DATE_FORMAT;

        scope.updateFilters = function() {
          if (scope.showUnit || scope.showDateRange) {
            if ((scope.showUnit === false) && (scope.filters.sizeStart === null)) {
              scope.filters.sizeStart = null;
              scope.filters.sizeEnd = null;
            }
            scope.documentsList = _.filter(scope.documentsList2, function(file) {
              var sizeIsValide = true;
              var dateIsValide = true;
              if (scope.showUnit === true) {
                if (scope.filters.sizeStart || scope.filters.sizeEnd) {
                  // convert the size to select byte
                  var start = (scope.filters.sizeStart) ? parseInt(scope.filters.sizeStart, 10) * parseInt(scope.filters.unity, 10) : 0;
                  var end = (scope.filters.sizeEnd) ? parseInt(scope.filters.sizeEnd, 10) * parseInt(scope.filters.unity, 10) : file.size + 10;
                  var size = file.size.toFixed(1);
                  sizeIsValide = (size >= start && size <= end);
                }
              }
              if (scope.showDateRange) {
                var dateFile = (scope.filters.dateType === '1') ? moment(file.modificationDate) : moment(file.creationDate);
                // moment set the date at 00:00, we need to add 1 day so that the entire day will be considered
                var dateEnd;
                if (scope.filters.dateEnd) {
                  dateEnd = moment(scope.filters.dateEnd).add('day', +1);
                } else {
                  dateEnd = moment().add('day', +1);
                }

                dateIsValide = (dateFile >= scope.filters.dateStart && dateFile <= dateEnd);
              }
              return (sizeIsValide && dateIsValide);
            });
          }
          scope.tableParams.reload();
        };
      },
      templateUrl: componentsConfig.path + 'fileSearchComponent/fileSearchDirectiveTemplate.html'
    };
  })
  .directive('workingDatePicker', function(componentsConfig, $translate, lsAppConfig) {
    var FR_DATE_FORMAT = lsAppConfig.date_fr_format;
    var EN_DATE_FORMAT = lsAppConfig.date_en_format;
    return {
      restrict: 'E',
      scope: false,
      transclude: true,
      link: function(scope, elm, attrs) {
        scope.dt = new Date();
        scope.minRange = '';
        scope.minDate = scope.minDate ? null : new Date();
        scope.maxDate = scope.maxDate ? null : new Date();
        scope.open = function($event, dateStartOpened) {
          $event.preventDefault();
          $event.stopPropagation();
          scope[dateStartOpened] = true;
        };
        scope.dateOptions = {
          formatYear: 'yy',
          startingDay: 1
        };
        scope.format = $translate.use() == 'fr' ? FR_DATE_FORMAT : EN_DATE_FORMAT;
      }
    };
  });
