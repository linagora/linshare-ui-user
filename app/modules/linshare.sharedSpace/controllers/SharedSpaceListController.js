'use strict';

angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController',
    function($scope, $log, currentWorkGroup, NgTableParams, $filter, documentUtilsService, growlService, workGroupMembersRestService,
              workGroupEntriesRestService, workGroupFoldersRestService, $state, $stateParams, Restangular, $translatePartialLoader, $timeout, $translate, sharedSpaceBreadcrumbService) {
      $translatePartialLoader.addPart('filesList');
      $translatePartialLoader.addPart('sharedspace');
      var thisctrl = this;
      $scope.mactrl.sidebarToggle.right = false;
      thisctrl.uuid = $stateParams.uuid;
      thisctrl.name = $stateParams.workgroupName;
      thisctrl.folderUuid = $stateParams.folderUuid;
      thisctrl.folderName = $stateParams.folderName;
      thisctrl.parent = $stateParams.parent;
      workGroupEntriesRestService.setWorkgroupUuid(thisctrl.uuid);
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
          params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
          $defer.resolve(filesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      pushEntriesAndBreadcrumb();
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
        $timeout(function() {
          if(thisctrl.folderUuid == thisctrl.uuid) {
            workGroupFoldersRestService.getParent(thisctrl.uuid).then(function(folder) {
              thisctrl.goToSharedSpaceFolderTarget(thisctrl.uuid, thisctrl.name, folder[0].parent, folder[0].uuid, folder[0].name, true, true)
            }, 0);
          } else {
            workGroupFoldersRestService.getParent(thisctrl.folderUuid).then(function(data) {
              thisctrl.itemsList = data;
              thisctrl.itemsListCopy = data;
              $scope.isNewAddition = true;
              pushEntriesAndBreadcrumb();
              thisctrl.tableParams.reload();
              $timeout(function() {
                $scope.isNewAddition = false;
              }, 0);
            }, 0);
          }
        });
      };
      thisctrl.renameItem = renameItem;
      thisctrl.renameFolder = renameFolder;

      workGroupMembersRestService.get(thisctrl.uuid, $scope.userLogged.uuid).then(function(member) {
        thisctrl.currentWorkgroupMember = member;
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
        if (inputTxt === '') {
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
        if (!select) {
          angular.forEach(dataOnPage, function(element) {
            if (!element.isSelected) {
              element.isSelected = true;
              thisctrl.selectedDocuments.push(element);
            }
          });
          thisctrl.flagsOnSelectedPages[currentPage] = true;
        } else {
          thisctrl.selectedDocuments = _.xor(thisctrl.selectedDocuments, dataOnPage);
          angular.forEach(dataOnPage, function(element) {
            if (element.isSelected) {
              element.isSelected = false;
              _.remove(thisctrl.selectedDocuments, function(n) {
                return n.uuid === element.uuid;
              });
            }
          });
          thisctrl.flagsOnSelectedPages[currentPage] = false;
        }
      };
      var openSearch = function() {
        angular.element('#dropArea').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      };
      var closeSearch = function() {
        angular.element('#dropArea').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      };
      thisctrl.toggleSearchState = function() {
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
      var swalMultipleDownloadTitle, swalMultipleDownloadText,
        swalMultipleDownloadConfirm;
      $translate(['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'])
        .then(function(translations) {
          swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadText = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
          swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
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
          _.remove(restangularizedItem.lastAuthor);
          restangularizedItem.remove().then(function() {
            growlService.notifyTopRight('GROWL_ALERT.ACTION.DELETE', 'success');
            _.remove(thisctrl.itemsList, restangularizedItem);
            _.remove(thisctrl.selectedDocuments, restangularizedItem);
            thisctrl.itemsListCopy = thisctrl.itemsList; // I keep a copy of the data for the filter module
            thisctrl.tableParams.reload();
          }, function(error) {
            if(error.status == 400 && error.data.errCode == 26006) {
              growlService.notifyTopRight('GROWL_ALERT.ERROR.DELETE_ERROR.26006', 'danger');
            }
          });
        });
      }

      function addSelectedDocument(document) {
        documentUtilsService.selectDocument(thisctrl.selectedDocuments, document);
      }

      function toggleFilterBySelectedFiles() {
        if (thisctrl.tableParams.filter().isSelected) {
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

      var setFileToEditable = function(idElem, data) {
        var initialName = idElem[0].textContent;
        var fileExtension = data.name.substr(initialName.lastIndexOf('.'));
        angular.element(idElem).attr('contenteditable', 'true')
          .on('focus', function() {
            document.execCommand('selectAll', false, null);
            initialName = idElem[0].textContent;
          })
          .on('focusout', function() {
            data.name = idElem[0].textContent;
            if (data.name.trim() === '') {
              // if the new name is empty then replace with by previous once
              angular.element(idElem).text(initialName);
              data.name = initialName;
              updateNewName(data, idElem);
            } else {
              if (data.name.indexOf('.') === -1) {
                // if the new name does not contain a file name extension then add the previous original extension to it
                data.name = data.name + fileExtension;
                angular.element(idElem).text(data.name);
                updateNewName(data, idElem);
              } else {
                updateNewName(data, idElem);
              }
            }
          })
          .on('keypress', function(e) {
            if (e.which === 13) {
              angular.element(idElem).focusout();
            }
          });
        angular.element(idElem).focus();
      };

      function updateNewName(data, elem) {
        delete data.lastAuthor;
        workGroupEntriesRestService.update(data.uuid, data);
        angular.element(elem).attr('contenteditable', 'false');
      }

      function renameItem(item) {
        var itemNameElem = $('td[uuid=' + item.uuid + ']').find('.file-name-disp');
        setFileToEditable(itemNameElem, item);
      }

      thisctrl.goToSharedSpaceFolderTarget = function(uuid, name, parent, folderUuid, folderName, fromBreacrumb, needReplace) {
        var folderNameElem = $('td[uuid=' + folderUuid + ']').find('.file-name-disp');
        var options = needReplace ? { location: 'replace' } : {};
        if(angular.element(folderNameElem).attr('contenteditable') == "false" || fromBreacrumb) $state.go('sharedspace.workgroups.entries', {uuid: uuid, workgroupName: name.trim(), parent: parent, folderUuid: folderUuid, folderName: folderName.trim()}, options);
      };

      thisctrl.createFolder = function() {
        var defaultNamePos = newFolderNumber(thisctrl.itemsList);
        var defaultName = defaultNamePos != 0 ? swalNewFolderName+' ('+defaultNamePos+')' : swalNewFolderName;
        createFolder(defaultName);
      };

      function newFolderNumber(items) {
        var foldersName = [];
        _.forEach(items, function(item) {
          if(!item.type) foldersName.push(item.name);
        });
        if(foldersName.length == 0 || !_.includes(foldersName, swalNewFolderName)) return 0;
        else {
          var iteration = 1;
          var foldersIndex = [];
          var regex = new RegExp('^'+swalNewFolderName+' \\([0-9]+\\)');
          _.forEach(items, function(item) {
            if(!item.type && regex.test(item.name)) foldersIndex.push(parseInt(item.name.replace(/\D/g, '')));
          });
          foldersIndex = _.sortBy(foldersIndex, function(val){ return val; } );
          _.forEach(foldersIndex, function(index, key) {
            if(index == key+1) iteration++;
            else return iteration;
          });
          return iteration;
        }
      }

      function createFolder(folderName) {
        var folder = {
          name: folderName.trim(),
          uuid: Math.random().toString(36).substring(7),
          parent: thisctrl.folderUuid
        };
        thisctrl.itemsList.push(folder);
        thisctrl.tableParams.reload();
        $timeout(function() {
          renameFolder(folder, true);
        }, 0);
      }

      function saveNewFolder(folder) {
        workGroupFoldersRestService.create(folder).then(function(data) {
          thisctrl.itemsList.pop();
          thisctrl.itemsList.push(data);
          thisctrl.tableParams.reload();
          return false;
        });
      }

      var swalNewFolderName;
      $translate(['ACTION.NEW_FOLDER'])
        .then(function(translations) {
          swalNewFolderName = translations['ACTION.NEW_FOLDER'];
        });
      var setFolderToEditable = function(idElem, data, newFolder) {
        var initialName = swalNewFolderName;
        angular.element(idElem).attr('contenteditable', 'true')
          .on('focus', function() {
            document.execCommand('selectAll', false, null);
            initialName = data.name;
          })
          .on('focusout', function() {
            if(newFolder || data.name != idElem[0].textContent) {
              if(folderNotExits(thisctrl.itemsList, idElem[0].textContent.trim(), newFolder)) {
                data.name = idElem[0].textContent.trim();
                if (data.name.trim() === '') {
                  angular.element(idElem).text(initialName);
                  data.name = initialName.trim();
                }
                newFolder ? saveNewFolder(data) : workGroupFoldersRestService.update(data);
                angular.element(this).attr('contenteditable', 'false');
              } else {
                $log('Folder name exists');
                data.name = initialName;
                newFolder ? saveNewFolder(data) : null;
                growlService.notifyTopRight('GROWL_ALERT.ERROR.RENAME_FOLDER', 'danger');
                angular.element(idElem).text(initialName);
                angular.element(this).attr('contenteditable', 'false');
                angular.element(this).blur();
              }
            }
          })
          .on('keypress', function(e) {
            if (e.which === 13) {
              if(newFolder || data.name != idElem[0].textContent) {
                if(folderNotExits(thisctrl.itemsList, idElem[0].textContent.trim(), newFolder)) {
                  data.name = idElem[0].textContent.trim();
                  if ((data.name.trim() === initialName) || (data.name.trim() === '')) {
                    angular.element(idElem).text(initialName);
                    data.name = initialName.trim();
                  }
                  newFolder ? saveNewFolder(data) : data.name != initialName ? workGroupFoldersRestService.update(data) : null;
                  angular.element(this).attr('contenteditable', 'false');
                } else {
                  $log('Folder name exists');
                  data.name = initialName;
                  newFolder ? saveNewFolder(data) : null;
                  growlService.notifyTopRight('GROWL_ALERT.ERROR.RENAME_FOLDER', 'danger');
                  angular.element(idElem).text(initialName);
                  angular.element(this).attr('contenteditable', 'false');
                }
              }
              return false;
            }
          });
        angular.element(idElem).focus();
      };

      function renameFolder(folder, newFolder) {
        var folderNameElem = $('td[uuid=' + folder.uuid + ']').find('.file-name-disp');
        setFolderToEditable(folderNameElem, folder, newFolder);
      }

      function folderNotExits(items, newName, newFolder) {
        var notExists = true;
        var itemsList = _.clone(items);
        if(newFolder) itemsList.pop();
        _.forEach(itemsList, function(item) {
          if(!item.type && item.name.toLowerCase() == newName.toLowerCase()) notExists = false;
        });
        return notExists;
      }

      function pushEntriesAndBreadcrumb() {
        workGroupFoldersRestService.get(thisctrl.folderUuid).then(function(folder) {
          var currentWorkGroupEntries = _.clone(currentWorkGroup);
          currentWorkGroupEntries.route = 'entries';
          sharedSpaceBreadcrumbService.build(folder.ancestors).then(function(breadcrumb) {
            thisctrl.breadcrumbFolders = breadcrumb;
          });

          _.forEach(folder.entries, function(entry) {
            Restangular.restangularizeElement(currentWorkGroup, entry, 'entries/'+entry.uuid);
            entry.parentResource['route'] = '';
            thisctrl.itemsList.push(entry);
            thisctrl.tableParams.reload();
          });
        }, 0);
      }
    });
