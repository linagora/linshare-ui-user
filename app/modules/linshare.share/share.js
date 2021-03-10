'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module(
  'linshare.share',
  [
    'restangular',
    'ui.bootstrap',
    'linshare.components',
    'linshare.utils',
    'pascalprecht.translate',
  ])

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
          if (scope.numSelectedItems.length === 0) {
            angular.element('#selection-actions').addClass('show-multi-menu');
          }
        }

        elm.bind('click', function() {
          var numItems = angular.element('.media-body').length;
          var isCurrentlySelected = elm.hasClass('highlight-list-elem');

          elm.toggleClass('highlight-list-elem', 'removeListElem');
          checkifMultiMenuVisible();

          if (scope.isAllSelected.status === true) {
            scope.$apply(function() {
              scope.isAllSelected.status = false;
              scope.isAllSelected.origin = 'directive';
            });
          }
          if (isCurrentlySelected) {
            scope.$apply(function() {
              scope.numSelectedItems.pop(1);
            });
          } else {
            scope.$apply(function() {
              scope.numSelectedItems.push(1);
              var numSelectedItems = scope.numSelectedItems.length;

              if (numSelectedItems === numItems) {
                elm.addClass('highlight-list-elem');
                scope.isAllSelected.status = true;
              }
            });
          }

          if (numItems === 0) {
            angular.element('.drag-and-drop-ctn').removeClass('out-of-focus');
          }
        });

        angular.element('.exit-selection').bind('click', function() {
          scope.closeContextualToolBar();
        });

        scope.closeContextualToolBar = function() {

          scope.$apply(function() {
            scope.numSelectedItems.pop(scope.numSelectedItems.length);
          });
          angular.element('#selection-actions').removeClass('show-multi-menu');
          angular.element('.media-body').removeClass('highlight-list-elem');
        };
      }
    };
  });

require('./constants');
require('./controllers/shareController');
require('./controllers/shareListController');
require('./services/sharableDocumentService');
require('./services/shareObjectService');
require('./services/shareRestService');
require('./components/quickShareComponent');
require('./components/quickShareController');
