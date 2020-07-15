/**
 * lsUploadQueue Directive
 * @namespace UploadQueue
 * @memberOf LinShare.upload
 */
(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .directive('lsUploadQueue', lsUploadQueueDirective);

  /**
   * @namespace lsUploadQueueDirective
   * @desc Manage the display of informations in the upload queue
   * @memberOf LinShare.upload
   */
  function lsUploadQueueDirective() {
    return {
      restrict: 'E',
      template: require('./lsUploadQueue.html'),
      scope: true,
      link: linkFunc
    };
  }

  /**
   * @namespace linkFunc
   * @desc Link function of uploadPopupFiles Directive
   * @param {Object} scope - Angular scope object of the directive
   * @param {Object} elem - jqLite-wrapped element that this directive matches
   * @param {Object} attrs - Normalized attribute names and their corresponding attribute values
   * @memberOf  LinShare.upload.lsUploadQueueDirective
   */
  function linkFunc(scope, elem, attrs) {
    scope.fromWhere = attrs.fromWhere;
  }
})();
