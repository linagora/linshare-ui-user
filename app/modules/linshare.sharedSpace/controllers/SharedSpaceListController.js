'use strict';

angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController',
    function($scope, $log, currentWorkGroup, NgTableParams, $filter, documentUtilsService, growlService,
             workGroupRestService, $stateParams) {

      var thisctrl = this;
      thisctrl.uuid = $stateParams.uuid;
      thisctrl.name = $stateParams.workgroupName;
      thisctrl.allDocuments = currentWorkGroup;
      thisctrl.selectedDocuments = [];
      thisctrl.currentSelectedDocument = {};
      thisctrl.showItemDetails = showItemDetails;

      thisctrl.tableParams = new NgTableParams({
        page: 1,
        sorting: {modificationDate: 'desc'},
        count: 20
      }, {
        getData: function($defer, params) {
          var filesList = params.sorting() ? $filter('orderBy')(currentWorkGroup, params.orderBy()) : currentWorkGroup;
          params.total(filesList.length);
          $defer.resolve(filesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

      thisctrl.addSelectedDocument = addSelectedDocument();
      thisctrl.deleteDocuments = deleteDocuments();

      thisctrl.downloadDocument = downloadDocument;

      thisctrl.currentPage = 'group_list_files';
      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });

      thisctrl.loadSidebarContent = function(content) {
        $scope.sidebarRightDataType = content;
      };

      thisctrl.slideTextarea = function($event) {
        var currTarget = $event.currentTarget;
        angular.element(currTarget).parent().addClass('show-full-comment');
      };

      thisctrl.slideUpTextarea = function($event) {
        var currTarget = $event.currentTarget;
        angular.element(currTarget).parent().removeClass('show-full-comment');
      };

      thisctrl.setTextInput = function($event) {
        var currTarget = $event.currentTarget;
        var inputTxt = angular.element(currTarget).text();
        if(inputTxt === '') {
          angular.element(currTarget).parent().find('span').css('display', 'block');
        } else {
          angular.element(currTarget).parent().find('span').css('display', 'none');
        }
      };

      function deleteDocuments() {
        workGroupRestService.workGroupUuid = thisctrl.uuid;
        return documentUtilsService.deleteDocuments
          .bind(undefined, workGroupRestService, thisctrl.allDocuments, thisctrl.selectedDocuments, thisctrl.tableParams);
      }

      function addSelectedDocument() {
        return documentUtilsService.selectDocument.bind(undefined, thisctrl.selectedDocuments);
      }

      function downloadDocument(document) {
        return workGroupRestService.downloadWorkGroupEntry(thisctrl.uuid, document.uuid).then(function(fileStream) {
            documentUtilsService.downloadFileFromResponse(fileStream, document.name, document.type);
          });
      }

      function showItemDetails(current, event) {
        thisctrl.sidebarRightDataType = 'details';
        $scope.sidebarRightDataType = 'details';

        workGroupRestService.getWorkGroupEntry(thisctrl.uuid, current.uuid).then(function(data) {
          thisctrl.currentSelectedDocument.current = data;
        });

        $scope.mactrl.sidebarToggle.right = true;
        var currElm = event.currentTarget;
        angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
          angular.element(currElm).addClass('activeActionButton');
        });
      }
    });
