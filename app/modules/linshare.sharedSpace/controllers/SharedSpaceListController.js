'use strict';

angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController',
    function($scope, $log, currentWorkGroup, NgTableParams, $filter, documentUtilsService, growlService,
             WorkGroupRestService, $stateParams) {

      var self = this;
      self.uuid = $stateParams.uuid;
      self.name = $stateParams.workgroupName;
      self.allDocuments = currentWorkGroup;
      self.selectedDocuments = [];

      self.tableParams = new NgTableParams({
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

      self.addSelectedDocument = addSelectedDocument();
      self.deleteDocuments = deleteDocuments();

      self.currentPage = 'group_list_files';
      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });

      self.loadSidebarContent = function(content) {
        $scope.sidebarRightDataType = content;
      };

      self.slideTextarea = function($event) {
        var currTarget = $event.currentTarget;
        angular.element(currTarget).parent().addClass('show-full-comment');
      };

      self.slideUpTextarea = function($event) {
        var currTarget = $event.currentTarget;
        angular.element(currTarget).parent().removeClass('show-full-comment');
      };

      self.setTextInput = function($event) {
        var currTarget = $event.currentTarget;
        var inputTxt = angular.element(currTarget).text();
        if(inputTxt === '') {
          angular.element(currTarget).parent().find('span').css('display', 'block');
        } else {
          angular.element(currTarget).parent().find('span').css('display', 'none');
        }
      };

      function deleteDocuments() {
        WorkGroupRestService.workGroupUuid = self.uuid;
        return documentUtilsService.deleteDocuments
          .bind(undefined, WorkGroupRestService, self.allDocuments, self.selectedDocuments, self.tableParams);
      }

      function addSelectedDocument() {
        return documentUtilsService.selectDocument.bind(undefined, self.selectedDocuments);
      }
    });
