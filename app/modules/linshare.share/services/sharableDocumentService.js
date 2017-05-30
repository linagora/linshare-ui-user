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

    function sharableDocuments(uploadedDocument, share_array, refFlowShares) {
      if (share_array.length > 0) {
        var fileIdentifier = uploadedDocument.uniqueIdentifier;
        var associativeSharings = refFlowShares[fileIdentifier] || {
          shareArrayIndex: []
        };
        if (associativeSharings.shareArrayIndex.length > 0) {
          _.forEach(associativeSharings.shareArrayIndex, function(shareIndex) {
            if (!_.isUndefined(share_array[shareIndex])) {
              var correspondingShare = {};
              angular.extend(correspondingShare, share_array[shareIndex]);
              var shareInProgress = new ShareObjectService(correspondingShare);
              shareInProgress.addLinshareDocumentsAndShare(fileIdentifier, uploadedDocument.linshareDocument);
              share_array[shareIndex] = angular.copy(shareInProgress.getObjectCopy());
            }
          });
          delete refFlowShares[fileIdentifier];
        }
      }
    }
  }
})();
