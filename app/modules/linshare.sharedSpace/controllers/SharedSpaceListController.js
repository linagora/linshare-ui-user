'use strict';

angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController',
    function($scope, $log, currentWorkGroup, NgTableParams, $filter, documentUtilsService, growlService, workGroupMembersRestService,
             workGroupEntriesRestService, $stateParams, Restangular, $translatePartialLoader, $timeout , $translate) {
      $translatePartialLoader.addPart('filesList');
      $translatePartialLoader.addPart('sharedspace');
      var thisctrl = this;
      $scope.mactrl.sidebarToggle.right = false;
      thisctrl.uuid = $stateParams.uuid;
      workGroupEntriesRestService.setWorkgroupUuid(thisctrl.uuid);
      thisctrl.name = $stateParams.workgroupName;
      thisctrl.itemsList = currentWorkGroup;
      thisctrl.itemsListCopy = thisctrl.itemsList;
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
          var filteredData = params.filter() ? $filter('filter')(thisctrl.itemsList, params.filter()) : thisctrl.itemsList;
          var filesList = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(filesList.length);
          params.settings({ counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
          $defer.resolve(filesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      thisctrl.getDetails = function(item) {
        return documentUtilsService.getItemDetails(workGroupEntriesRestService, item);
      };
      $scope.$on('linshare-upload-complete', function(event, data) {
        Restangular.restangularizeElement(currentWorkGroup, data, data.uuid);
        thisctrl.itemsList.push(data);
        $scope.reloadDocuments();
      });

      thisctrl.addSelectedDocument = addSelectedDocument;
      thisctrl.deleteDocuments = deleteDocuments;

      thisctrl.downloadDocument = downloadDocument;

      thisctrl.copy = function(entryUuid) {
        workGroupEntriesRestService.copy(thisctrl.uuid, entryUuid).then(function() {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.COPY', 'inverse');
        });
      };
      $scope.reloadDocuments = function() {
        $timeout(function () {
          workGroupEntriesRestService.getAll().then(function (data) {
            thisctrl.itemsList = data;
            thisctrl.itemsListCopy = data;
            $scope.isNewAddition = true;
            thisctrl.tableParams.reload();
            $timeout(function () {
              $scope.isNewAddition = false;
            }, 0);
          }, 500);
        });
      };
      thisctrl.renameItem = renameItem;

      workGroupMembersRestService.get(thisctrl.uuid, $scope.userLogged.uuid).then(function(member) {
        thisctrl.currentWorkgroupMember = member;
        //$scope.vm.currentWorkgroupMember = member;
      });

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

      thisctrl.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
      thisctrl.flagsOnSelectedPages = {};

      thisctrl.selectDocumentsOnCurrentPage = function(data, page, selectFlag) {
        var currentPage = page || thisctrl.tableParams.page();
        var dataOnPage = data || thisctrl.tableParams.data;
        var select = selectFlag || thisctrl.flagsOnSelectedPages[currentPage];
        if(!select) {
          angular.forEach(dataOnPage, function(element) {
            if(!element.isSelected) {
              element.isSelected = true;
              thisctrl.selectedDocuments.push(element);
            }
          });
          thisctrl.flagsOnSelectedPages[currentPage] = true;
        } else {
          thisctrl.selectedDocuments = _.xor(thisctrl.selectedDocuments, dataOnPage);
          angular.forEach(dataOnPage, function(element) {
            if(element.isSelected) {
              element.isSelected = false;
              _.remove(thisctrl.selectedDocuments, function(n) {
                return n.uuid === element.uuid;
              });
            }
          });
          thisctrl.flagsOnSelectedPages[currentPage] = false;
        }
      };
      var openSearch = function () {
        angular.element('#dropArea').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      };
      var closeSearch = function () {
        angular.element('#dropArea').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      };
      thisctrl.toggleSearchState = function () {
        if (!thisctrl.searchMobileDropdown) {
          openSearch();
        } else {
          closeSearch();
        }
        thisctrl.searchMobileDropdown = !thisctrl.searchMobileDropdown;
      };

      thisctrl.sortDropdownSetActive = function(sortField, $event) {
        thisctrl.toggleSelectedSort = !thisctrl.toggleSelectedSort;
        thisctrl.tableParams.sorting(sortField, thisctrl.toggleSelectedSort ? 'desc' : 'asc');
        var currTarget = $event.currentTarget;
        angular.element('.files .sortDropdown a').removeClass('selectedSorting').promise().done(function() {
          angular.element(currTarget).addClass('selectedSorting');
        });
      };
      var  swalMultipleDownloadTitle , swalMultipleDownloadText ,
        swalMultipleDownloadConfirm;
      $translate(['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'])
        .then(function(translations) {
          swalMultipleDownloadTitle= translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadText= translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
          swalMultipleDownloadConfirm= translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
        });

      thisctrl.unavailableMultiDownload = function() {
        swal({
            title: swalMultipleDownloadTitle,
            text: swalMultipleDownloadText,
            type: 'error',
            confirmButtonColor: '#05b1ff',
            confirmButtonText: swalMultipleDownloadConfirm,
            closeOnConfirm: true
          }
        );
      };

      thisctrl.resetSelectedDocuments = function() {
        delete thisctrl.tableParams.filter().isSelected;
        documentUtilsService.resetItemSelection(thisctrl.selectedDocuments);
      };

      function deleteDocuments(items) {
        documentUtilsService.deleteDocuments(items, deleteCallback);
      }

      function deleteCallback(items) {
        angular.forEach(items, function(restangularizedItem) {
          $log.debug('value to delete', restangularizedItem);
          restangularizedItem.remove().then(function() {
            growlService.notifyTopRight('GROWL_ALERT.ACTION.DELETE', 'success');
            _.remove(thisctrl.itemsList, restangularizedItem);
            _.remove(thisctrl.selectedDocuments, restangularizedItem);
            thisctrl.itemsListCopy = thisctrl.itemsList; // I keep a copy of the data for the filter module
            thisctrl.tableParams.reload();
          });
        });
      }

      function addSelectedDocument(document) {
        documentUtilsService.selectDocument(thisctrl.selectedDocuments, document);
      }

      function toggleFilterBySelectedFiles() {
        if(thisctrl.tableParams.filter().isSelected) {
          delete thisctrl.tableParams.filter().isSelected;
        } else {
          thisctrl.tableParams.filter().isSelected = true;
        }
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

      var setElemToEditable = function (idElem, data) {
        var  initialName = idElem[0].textContent;
        var fileExtension = data.name.substr(initialName.lastIndexOf('.'));
        angular.element(idElem).attr('contenteditable', 'true')
          .on('focus', function () {
            document.execCommand('selectAll', false, null);
            initialName = idElem[0].textContent;
          })
          .on('focusout', function () {
            data.name = idElem[0].textContent;
            if (data.name.trim() === '') {
              // if the new name is empty then replace with by previous once
              angular.element(idElem).text(initialName);
              data.name = initialName;
              updateNewName(data,idElem);
            } else {
              if (data.name.indexOf('.') === -1) {
                // if the new name does not contain a file name extension then add the previous original extension to it
                data.name = data.name + fileExtension;
                angular.element(idElem).text(data.name);
                updateNewName(data,idElem);
              } else {
                updateNewName(data,idElem);
               }
            }
          })
          .on('keypress', function (e) {
            if (e.which === 13) {
              angular.element(idElem).focusout();
            }
          });
        angular.element(idElem).focus();
      };

      function updateNewName(data, elem) {
        workGroupEntriesRestService.update(data.uuid, data);
        angular.element(elem).attr('contenteditable', 'false');
      }

      function renameItem(item) {
        var itemNameElem = $('td[uuid='+ item.uuid +']').find('.file-name-disp');
        setElemToEditable(itemNameElem, item);
      }
    });
