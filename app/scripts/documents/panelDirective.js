'use strict';

angular.module('linshareUiUserApp')
  .directive('panelFilesDetail', function(filesService, $log) {
    return {
      scope: {
        uuid : '@',
        ischecked: '@',
        selectedElement: '=',
        document: '=docDetails'

      },
      transclude: false,
      link: function($scope, element, attr, ctrl) {
        console.log('link scope',$scope.selected);
        console.log('scope from checkbox', $scope.ischecked);
        element.bind('click', function() {

          if($scope.ischecked === 'false' || $scope.ischecked === '') {
            $log.debug('sibling', element.siblings(), 'ischecked',$scope.ischecked);
            element.toggleClass('info').siblings().removeClass('info');
            if(element.hasClass('info')) {
              $scope.open = true;
              element.parent().parent().addClass('col-md-10');
              console.log($scope.open, 'here', $scope.uuid);

              filesService.getFileInfo($scope.uuid).then(function(info){
                $scope.document.detail = info;
                $log.debug('Document Details ', $scope.uuid, info);

              });
              filesService.getThumbnail($scope.uuid).then(function(thumbnail){
                console.log(encodeURI(thumbnail));
                $scope.document.detail.thumbnail = thumbnail;
                //$scope.document.detail.thumbnail = btoa(encodeURI(thumbnail));
                console.log('64', $scope.document.detail.thumbnail);
              })
            } else {
              $scope.open = false;
              console.log('else ', $scope.open);
            }
            console.log('TESTEUR', this);
          }
          else {
            if(element.parent().hasClass('info')) {
              //element.parent().removeClass('info');
             // scope.selected = false;
            }
           // else element.parent().addClass('info');
          }
        });

       // $scope.SelectedElement = [];
        $scope.$watch('ischecked', function(newValue) {
          console.log('ischecked1', newValue, $scope.uuid, $scope.selectedElement);
          if(newValue === 'true') {
            $log.debug('ischecked2', newValue, $scope.uuid, $scope.selectedElement);
            $scope.selectedElement.push($scope.uuid);
            console.log('SELECTED ELEMENT', $scope.selectedElement);
            //console.log('dir', element.find('span'));
            if(element.hasClass('info')){

            } else {
              console.log('adding class info on ', element, ' rather than ', element.parent());
              element.addClass('active');
            }
          }
          if(newValue === 'false') {
            console.log('remove class info', element.parent());
            element.removeClass('active');
            console.log('MY SZLZX', $scope.selectedElement);
            var index = $scope.selectedElement.indexOf($scope.uuid);
            if (index >-1){
              console.log('index', index);
              $scope.selectedElement.splice(index, 1);
            }
            console.log(index);
          }
        });
        $scope.$watch('open', function(n) {
          if(n === true) {
            console.log('open treue');
          }
          else {
            console.log('open falsee');
          }
        });
      }
    };
  });
