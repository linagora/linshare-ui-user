'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module('linshare.share', ['restangular', 'ui.bootstrap', 'linshare.components'])
  
  .controller('DemoCtrl', function() {

    this.isOpen = false;
    this.selectedMode = 'md-scale';
    this.selectedDirection = 'left';
  })
  .directive('uploadBoxSelection', function() {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, elm) {
        function checkifMultiMenuVisible() {
          if(scope.numSelectedItems.length === 0) {
            angular.element('#selection-actions').addClass('showMultiMenu');
          }
        }

        elm.bind('click', function() {
          var numItems = angular.element('.media-body').length;
          var isCurrentlySelected = elm.hasClass('highlightListElem');
          elm.toggleClass('highlightListElem', 'removeListElem');
          checkifMultiMenuVisible();

          if(scope.isAllSelected.status === true) {
            scope.$apply(function() {
              scope.isAllSelected.status = false;
              scope.isAllSelected.origin = 'directive';
            });
          }
          if(isCurrentlySelected) {
            scope.$apply(function() {
              scope.numSelectedItems.pop(1);
            });
          } else {
            scope.$apply(function() {
              scope.numSelectedItems.push(1);
              var numSelectedItems = scope.numSelectedItems.length;
              if(numSelectedItems === numItems) {
                elm.addClass('highlightListElem');
                scope.isAllSelected.status = true;
              }
            });
          }

          if(numItems === 0) {
            angular.element('.dragNDropCtn').removeClass('outOfFocus');
          }
        });

        angular.element('.exitSelection').bind('click', function() {
          scope.closeContextualToolBar();
        });

        scope.closeContextualToolBar = function() {

          scope.$apply(function() {
            scope.numSelectedItems.pop(scope.numSelectedItems.length);
          });
          angular.element('#selection-actions').removeClass('showMultiMenu');
          angular.element('.media-body').removeClass('highlightListElem');
        };
      }
    };
  });
