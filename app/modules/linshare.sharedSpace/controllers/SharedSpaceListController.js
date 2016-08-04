'use strict';

angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController',
    function($scope, $log, currentWorkGroup, NgTableParams, $filter, documentUtilsService, growlService,
             workGroupEntriesRestService, $stateParams, Restangular) {
      var thisctrl = this;
      thisctrl.uuid = $stateParams.uuid;
      workGroupEntriesRestService.setWorkgroupUuid(thisctrl.uuid);
      thisctrl.name = $stateParams.workgroupName;
      thisctrl.allDocuments = currentWorkGroup;
      thisctrl.selectedDocuments = [];
      thisctrl.currentSelectedDocument = {};
      thisctrl.showItemDetails = showItemDetails;
      thisctrl.paramFilter = {
        name: ''
      };
      thisctrl.tableParams = new NgTableParams({
        page: 1,
        sorting: {modificationDate: 'desc'},
        count: 20,
        filter: thisctrl.paramFilter
      }, {
        getData: function($defer, params) {
          var filteredData = params.filter() ? $filter('filter')(thisctrl.allDocuments, params.filter()) : thisctrl.allDocuments;
          var filesList = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(filesList.length);
          $defer.resolve(filesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      thisctrl.getDetails = function(item) {
        return documentUtilsService.getItemDetails(workGroupEntriesRestService, item);
      };
      $scope.$on('linshare-upload-complete', function(event, data) {
        Restangular.restangularizeElement(currentWorkGroup, data, data.uuid);
        thisctrl.allDocuments.push(data);
        thisctrl.tableParams.reload();
      });

      thisctrl.addSelectedDocument = addSelectedDocument();
      thisctrl.deleteDocuments = deleteDocuments();

      thisctrl.downloadDocument = downloadDocument;

      thisctrl.copy = function(entryUuid) {
        workGroupEntriesRestService.copy(thisctrl.uuid, entryUuid).then(function() {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.COPY', 'success');
        });
      };

      thisctrl.renameItem = renameItem;

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
        return documentUtilsService.deleteDocuments
          .bind(undefined, thisctrl.allDocuments, thisctrl.selectedDocuments, thisctrl.tableParams);
      }

      function addSelectedDocument() {
        return documentUtilsService.selectDocument.bind(undefined, thisctrl.selectedDocuments);
      }

      function downloadDocument(document) {
        return workGroupEntriesRestService.download(thisctrl.uuid, document.uuid).then(function(fileStream) {
            documentUtilsService.downloadFileFromResponse(fileStream, document.name, document.type);
          });
      }

      function showItemDetails(current, event) {
        thisctrl.sidebarRightDataType = 'details';
        $scope.sidebarRightDataType = 'details';

        workGroupEntriesRestService.get(thisctrl.uuid, current.uuid).then(function(data) {
          thisctrl.currentSelectedDocument.current = data;
        });

        $scope.mactrl.sidebarToggle.right = true;
        var currElm = event.currentTarget;
        angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
          angular.element(currElm).addClass('activeActionButton');
        });
      }

      var setElemToEditable = function(idElem, data) {
        angular.element(idElem).attr('contenteditable', 'true')
          .on('focus', function () {
            document.execCommand('selectAll', false, null);})
          .on('focusout', function () {
            data.name = idElem[0].textContent;
            workGroupEntriesRestService.update(thisctrl.uuid, data.uuid, data).then(function() {
              angular.element(this).attr('contenteditable', 'false');
            });
          });
        angular.element(idElem).focus();
      };

      function renameItem(item) {
        var itemNameElem = $('td[uuid='+ item.uuid +']').find('.file-name-disp');
        setElemToEditable(itemNameElem, item);
      }
    });
