/**
 * uploadPopupFiles Directive
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('uploadPopupFiles', uploadPopupFilesDirective);

  /**
   *  @namespace uploadPopupFilesDirective
   *  @desc Manage the display of informations in the upload/share files's popup
   *  @memberOf linshareUiUserApp
   */
  function uploadPopupFilesDirective() {
    return {
      restrict: 'A',
      templateUrl: 'directives/uploadPopupFiles/uploadPopupFiles.html',
      scope: true,
      link: linkFunc
    };
  }

  /**
   *  @namespace linkFunc
   *  @desc Link function of uploadPopupFiles Directive
   *  @param {Object} scope - Angular scope object of the directive
   *  @param {Object} elem - jqLite-wrapped element that this directive matches
   *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
   *  @memberOf linshareUiUserApp
   */
  function linkFunc(scope, elem, attrs) {
    var totalFilesFrom;
    scope.fromWhere = attrs.uploadPopupFiles;
    elem.hide();
    scope.$watch('filesFilterred', function() {
      if (scope.filesFilterred.length > 0) {
        elem.show();
      } else {
        elem.hide();
      }
      totalFilesFrom = _.filter(scope.$flow.files, {'_from': scope.fromWhere});
      scope.currentFilesLength = totalFilesFrom ? totalFilesFrom.length : 0;
    });
  }
})();
