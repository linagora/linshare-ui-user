/**
 * documentModelRestService Factory
 * @namespace linshare.utils
 */
(function() {
  'use strict';

  angular
    .module('linshare.utils')
    .service('documentModelRestService', documentModelRestService);

  documentModelRestService.$inject = [
    '$q',
    'itemUtilsService',
    'Restangular'
  ];

  /**
   * @namespace documentModelRestService
   * @desc Utils service for manipulating Rest functions of document model
   * @memberOf linshare.utils
   */
  function documentModelRestService(
    $q,
    itemUtilsService,
    Restangular
  ) {
    var service = {
      launchExtendModel: launchExtendModel
    };

    return service;

    /**
     * @name launchExtendModel
     * @desc Extends document model
     * @param {string} modelRoute - Restangular route for current model
     * @memberOf LinShare.utils.documentModelRestService
     */
    function launchExtendModel(modelRoute) {
      Restangular.extendModel(modelRoute, function (model) {
        model.getPreview = getPreview;

        /**
         * @name downloadAsArrayBuffer
         * @desc Download the document as an arrayBuffer
         * @returns {Promise||null} Document arrayBuffer
         * @memberOf LinShare.utils.documentModelRestService
         */
        function downloadAsArrayBuffer() {
          return Restangular
            .one(
              getFullRoute(model),
              'download'
            )
            .withHttpConfig({
              responseType: 'arraybuffer'
            })
            .get();
        }
        /**
         * @name getFullRoute
         * @desc Get the full API source of the given resource
         * @param {Object} item - Document type object which shall contains: parentResource and route
         * @param {string} action - The Action request
         * @return {string} The full route
         * @memberOf LinShare.utils.documentModelRestService
         */
        function getFullRoute(item) {
          var isItemContainBothUuidAndRoute = item && item.uuid && item.route;

          if(!isItemContainBothUuidAndRoute){
            return '';
          } else {
            var itemFullRoute = item.route + '/' + item.uuid + '/';

            return item.parentResource ? getFullRoute(item.parentResource) + '/' + itemFullRoute : itemFullRoute;
          }
        }

        /**
         * @name getThumbnailPdf
         * @desc Get the large thumbnail of the document
         * @returns {Promise||null} Document large thumbnail
         * @memberOf LinShare.utils.documentModelRestService
         */
        function getThumbnailLarge() {
          return Restangular
            .one(
              getFullRoute(model),
              'thumbnail'
            )
            .one('large')
            .get({
              base64: true
            });
        }

        /**
         * @name getThumbnailPdf
         * @desc Get the PDF thumbnail of the document
         * @returns {Promise||null} Document PDF thumbnail
         * @memberOf LinShare.utils.documentModelRestService
         */
        function getThumbnailPdf() {
          return Restangular
            .one(
             getFullRoute(model),
             'thumbnail'
            )
            .one('pdf')
            .withHttpConfig({
              responseType: 'arraybuffer'
            })
            .get();
        }

        /**
         * @name getPreview
         * @desc Get the preview image of the document
         * @param {PreviewMode} mode - preview mode activation
         * @returns {Promise||null} Document preview
         * @memberOf LinShare.utils.documentModelRestService
         */
        function getPreview(mode) {
          if (mode.noPreview) {
            return $q.resolve(null);
          }

          if (mode.pdf) {
            return downloadAsArrayBuffer()
              .then(function (buffer) {
                return itemUtilsService.generateFileUrlForPdf(buffer);
              });
          }

          if (mode.image) {
            return getThumbnailLarge();
          }

          //TODO - PREVIEW: Should handle error if other document has no PDF preview
          //TODO - PREVIEW: Should handle folder icon in case of workgroup
          if (mode.other) {
            return getThumbnailPdf()
              .then(function (buffer) {
                return itemUtilsService.generateFileUrlForPdf(buffer);
              });
          }
        }

        return model;
      });
    }
  }
})();
