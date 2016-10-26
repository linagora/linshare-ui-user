(function() {
  'use strict';

  angular
    .module('linshare.share')
    .factory('sharableDocumentService', sharableDocumentService);

  sharableDocumentService.$inject = ['ShareObjectService'];

  function sharableDocumentService(ShareObjectService) {
    return {
      sharableDocuments: sharableDocuments
    };

    function sharableDocuments(uploadedDocument, share_array, refFlowShares) {
      var fileIdentifier = uploadedDocument.uniqueIdentifier;
      var associativeSharings = refFlowShares[fileIdentifier] || {};
      if (associativeSharings.length > 0) {
        _.forEach(associativeSharings, function(shareIndex) {
          var correspondingShare = {};
          angular.extend(correspondingShare, share_array[shareIndex]);
          var shareInProgress = new ShareObjectService(correspondingShare);
          shareInProgress.addLinshareDocumentsAndShare(fileIdentifier, uploadedDocument.linshareDocument);
          share_array[shareIndex] = angular.copy(shareInProgress.getObjectCopy());
        });
        delete refFlowShares[fileIdentifier];
      }
    }
  }
})();
