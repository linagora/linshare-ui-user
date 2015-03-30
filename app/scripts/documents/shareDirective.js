'use strict';

angular.module('linshareUiUserApp')
  .directive('lsShareModal', function($modal){
    return {
      scope: false,
      link: function(scope, element, attr){
        element.bind('click', function(){
          scope.input = {};
          var modalInstance = $modal.open({
            backdrop: 'static',
            controller: 'FilesController',
            templateUrl: 'views/documents/shareModal.html'
          });

        })
      }
    }
  });
