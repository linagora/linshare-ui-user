'use strict';

angular.module('linshare.share')
  .directive('lsShareModal', function($modal) {
    return {
      scope: false,
      link: function(scope, element) {
        element.bind('click', function() {
          $modal.open({
            backdrop: 'static',
            backdropClass: 'modal-backdrop',
            controller: function($scope, LinshareShareService, $modalInstance) {

              $scope.share = {
                recipients: [],
                documents: []
              };

              $scope.selectedDocuments = scope.selectedDocuments;
              angular.forEach(scope.selectedDocuments, function(doc) {
                $scope.share.documents.push(doc.uuid);
              });

              $scope.addRecipients = function(recipient) {
                $scope.share.recipients.push({mail: recipient});
                $scope.shareMail = '';
              };

              $scope.submitShare = function() {
                LinshareShareService.shareDocuments($scope.share).then(function() {
                  $modalInstance.close();
                });
              };

              $scope.cancel = function() {
                $modalInstance.close();
              };

            },
            templateUrl: 'modules/linshare.share/views/shareModal.html'
          });
        });
      }
    };
  });
