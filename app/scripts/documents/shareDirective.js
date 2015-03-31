'use strict';

angular.module('linshareUiUserApp')
  .directive('lsShareModal', function($modal){
    return {
      scope: false,
      link: function(scope, element, attr){
        element.bind('click', function(){
          var modalInstance = $modal.open({
            backdrop: 'static',
            controller: function($scope, receivedShare){
              $scope.share = {};
              $scope.$watch('shareMail', function(n, o){
                console.log('new value', n);
                $scope.share.recipients = [{uuid: '14992f22-b658-4ad0-86e8-cc39be7693db', mail:  $scope.shareMail}];
              });
              $scope.share.documents = scope.SelectedElement;
              console.log('my sahre', $scope.share);
              $scope.submitShare = function() {
                receivedShare.shareDocuments($scope.share).then(function(){
                });
                console.log('sharing document');
              };
            },
            templateUrl: 'views/documents/shareModal.html'
          });


        })
      }
    }
  });
