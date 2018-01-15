/**
 * receivedShareRestServiceRun
 * @namespace LinShare.receivedShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.receivedShare')
    .run(receivedShareRestServiceRun);

  receivedShareRestServiceRun.$inject = [
    '$q',
    'Restangular',
    'itemUtilsService'
  ];

  /**
   *  @namespace receivedShareRestServiceRun
   *  @desc Run function for extending received_share model
   *  @memberOf LinShare.receivedShare
   */
  function receivedShareRestServiceRun(
    $q,
    Restangular,
    itemUtilsService
  ) {
    Restangular.extendModel('received_shares', function(model) {
      model.getPreview = getPreview;

      /**
       *  @name downloadAsArrayBuffer
       *  @desc Download the received share as an arrayBuffer
       *  @returns {Promise||null} Document arrayBuffer
       *  @memberOf LinShare.receivedShare.receivedShareRestServiceRun
       */
      function downloadAsArrayBuffer() {
        return Restangular
          .all(model.route)
          .one(
            model.uuid,
            'download'
          )
          .withHttpConfig({
            responseType: 'arraybuffer'
          })
          .get();
      }

      /**
       *  @name getThumbnailPdf
       *  @desc Get the large thumbnail of the received share
       *  @returns {Promise||null} Document large thumbnail
       *  @memberOf LinShare.receivedShare.receivedShareRestServiceRun
       */
      function getThumbnailLarge() {
        return Restangular
          .all(model.route)
          .one(
            model.uuid,
            'thumbnail'
          )
          .one('large')
          .get({
            base64: true
          });
      }

      /**
       *  @name getThumbnailPdf
       *  @desc Get the PDF thumbnail of the received share
       *  @returns {Promise||null} Document PDF thumbnail
       *  @memberOf LinShare.receivedShare.receivedShareRestServiceRun
       */
      function getThumbnailPdf() {
        return Restangular
          .all(model.route)
          .one(
            model.uuid,
            'thumbnail'
          )
          .one('pdf')
          .withHttpConfig({
            responseType: 'arraybuffer'
          })
          .get();

      }

      /**
       *  @name getPreview
       *  @desc Get the preview image of the received share
       *  @param {PreviewMode} mode - preview mode activation
       *  @returns {Promise||null} Document preview
       *  @memberOf LinShare.receivedShare.receivedShareRestServiceRun
       */
      function getPreview(mode) {
        if (mode.noPreview) {
          return $q.resolve(null);
        }

        if (mode.pdf) {
          return downloadAsArrayBuffer()
            .then(function(buffer) {
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
            .then(function(buffer) {
              return itemUtilsService.generateFileUrlForPdf(buffer);
            });
        }
      }

      return model;
    });
  }
})();
