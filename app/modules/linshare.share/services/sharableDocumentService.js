(function() {
  'use strict';

  angular
    .module('linshare.share')
    .factory('sharableDocumentService', sharableDocumentService);

  sharableDocumentService.$inject = ['_', 'ShareObjectService'];

  function sharableDocumentService(_, ShareObjectService) {
    return {
      sharableDocuments: sharableDocuments
    };

    function sharableDocuments(uploadedDocument, shareArray, refFlowShares) {
      if (shareArray.length > 0) {
        var fileIdentifier = uploadedDocument.uniqueIdentifier;
        var associativeSharings = refFlowShares[fileIdentifier] || {
          shareArrayIndex: []
        };

        if (associativeSharings.shareArrayIndex.length > 0) {
          _.forEach(associativeSharings.shareArrayIndex, function(shareIndex) {
            if (!_.isUndefined(shareArray[shareIndex])) {
              var correspondingShare = {
                name: parseInt(shareIndex) + 1
              };

              angular.extend(correspondingShare, shareArray[shareIndex]);
              var shareInProgress = new ShareObjectService(correspondingShare);

              shareInProgress.addLinshareDocumentsAndShare(fileIdentifier, uploadedDocument.linshareDocument);
              shareArray[shareIndex] = angular.copy(shareInProgress.getObjectCopy());
            }
          });
          delete refFlowShares[fileIdentifier];
        }
      }
    }
  }
})();
