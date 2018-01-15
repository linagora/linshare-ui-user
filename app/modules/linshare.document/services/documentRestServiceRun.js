/**
 * documentRestServiceRun
 * @namespace LinShare.document
 */
(function() {
  'use strict';

  angular
    .module('linshare.document')
    .run(documentRestServiceRun);

  documentRestServiceRun.$inject = [
    '$q',
    'Restangular',
    'itemUtilsService'
  ];

  /**
   *  @namespace documentRestServiceRun
   *  @desc Run function for extending documents model
   *  @memberOf LinShare.document
   */
  function documentRestServiceRun(
    $q,
    Restangular,
    itemUtilsService
  ) {
    Restangular.extendModel('documents', function(model) {
      model.getPreview = getPreview;

      /**
       *  @name downloadAsArrayBuffer
       *  @desc Download the document as an arrayBuffer
       *  @returns {Promise||null} Document arrayBuffer
       *  @memberOf LinShare.document.documentRestServiceRun
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
       *  @desc Get the large thumbnail of the document
       *  @returns {Promise||null} Document large thumbnail
       *  @memberOf LinShare.document.documentRestServiceRun
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
       *  @desc Get the PDF thumbnail of the document
       *  @returns {Promise||null} Document PDF thumbnail
       *  @memberOf LinShare.document.documentRestServiceRun
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
       *  @desc Get the preview image of the document
       *  @param {PreviewMode} mode - preview mode activation
       *  @returns {Promise||null} Document preview
       *  @memberOf LinShare.document.documentRestServiceRun
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
