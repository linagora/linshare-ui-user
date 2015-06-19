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
              $scope.$watch('shareMail', function(n){
                console.log('new value', n);
                $scope.share.recipients = [{mail:  $scope.shareMail}];
              });
              $scope.share.documents = scope.SelectedElement;
              console.log('my sahre', $scope.share);
              $scope.submitShare = function() {
                receivedShare.shareDocuments($scope.share).then(function(){
                });
                console.log('sharing document');
              };
              $scope.close = function() {
                console.log('hahaha');
              }
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
