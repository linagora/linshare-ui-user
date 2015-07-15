'use strict';

angular.module('linshareUiUserApp')
  .directive('lsShareModal', function($modal){
    return {
      scope: false,
      link: function(scope, element){
        element.bind('click', function(){
          $modal.open({
            backdrop: 'static',
            backdropClass: 'modal-backdrop',
            controller: function($scope, LinshareShareService, $modalInstance){
              $scope.share = {};
              $scope.$watch('shareMail', function(n){
                console.log('new value', n);
                $scope.share.recipients = [{mail:  $scope.shareMail}];
              });
              $scope.share.documents = scope.SelectedElement;
              console.log('my sahre', $scope.share);
              $scope.submitShare = function() {
                LinshareShareService.shareDocuments($scope.share).then(function(){
                  $modalInstance.close();
                });
                console.log('sharing document');
              };
              $scope.close = function() {
                console.log('hahaha');
              };
            },
            templateUrl: 'views/documents/shareModal.html'
          });
        });
      }//,
      //controller: function($scope) {
      //  $scope.showModal = function(_dao) {
      //    $scope.data.dao = _dao;
      //    $modal({title: _dao.name, content: 'body', scope: $scope, animation: 'am-fade-and-slide-top',
      //      template: '../modules/digital-object/modal_dao.html', show: true});
      //  };
      //}
    };
  });
