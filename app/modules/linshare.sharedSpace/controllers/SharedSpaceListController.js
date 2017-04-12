(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .controller('SharedSpaceListController', sharedSpaceListController);

  function sharedSpaceListController($scope, $log, currentWorkGroup, NgTableParams, $filter, documentUtilsService,
                                     itemUtilsService, workgroupMembersRestService, workgroupEntriesRestService,
                                     workgroupFoldersRestService, $state, $stateParams, Restangular,
                                     $translatePartialLoader, $timeout, $translate, sharedSpaceBreadcrumbService,
                                     flowUploadService, lsAppConfig, lsErrorCode, $q, toastService) {
    /* jshint validthis:true */
    var sharedSpaceListVm = this;

    var swalNewFolderName;
    var swalMultipleDownloadTitle, swalMultipleDownloadText, swalMultipleDownloadConfirm;
    var invalideNameTranslate;
    var openSearch = openSearchFunction;
    var closeSearch = closeSearchFunction;

    $scope.reloadDocuments = reloadDocuments;

    // TODO : work around to disable folders, with this user never see root folder, he is directly inside it, remove these 2 lines after RC
    $stateParams.folderName = $stateParams.workgroupName;
    $stateParams.parent = $stateParams.uuid;

    sharedSpaceListVm.addSelectedDocument = addSelectedDocument;
    sharedSpaceListVm.addUploadedEntry = addUploadedEntry;
    sharedSpaceListVm.canCreate = true;
    sharedSpaceListVm.copy = copy;
    sharedSpaceListVm.createFolder = createFolder;
    sharedSpaceListVm.currentPage = 'group_list_files';
    sharedSpaceListVm.currentSelectedDocument = {};
    sharedSpaceListVm.deleteDocuments = deleteDocuments;
    sharedSpaceListVm.downloadFile = downloadFile;
    sharedSpaceListVm.flagsOnSelectedPages = {};
    sharedSpaceListVm.flowUploadService = flowUploadService;
    sharedSpaceListVm.folderDetails = $stateParams;
    sharedSpaceListVm.folderName = $stateParams.folderName;
    sharedSpaceListVm.folderUuid = $stateParams.folderUuid;
    sharedSpaceListVm.getDetails = getDetails;
    sharedSpaceListVm.goToSharedSpaceFolderTarget = goToSharedSpaceFolderTarget;
    sharedSpaceListVm.itemsList = currentWorkGroup;
    sharedSpaceListVm.itemsListCopy = sharedSpaceListVm.itemsList;
    sharedSpaceListVm.loadSidebarContent = loadSidebarContent;
    sharedSpaceListVm.name = $stateParams.workgroupName;
    sharedSpaceListVm.paramFilter = {name: ''};
    sharedSpaceListVm.parent = $stateParams.parent;
    sharedSpaceListVm.renameItem = renameItem;
    sharedSpaceListVm.renameFolder = renameFolder;
    sharedSpaceListVm.resetSelectedDocuments = resetSelectedDocuments;
    sharedSpaceListVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    sharedSpaceListVm.selectedDocuments = [];
    sharedSpaceListVm.setTextInput = setTextInput;
    sharedSpaceListVm.showItemDetails = showItemDetails;
    sharedSpaceListVm.slideTextarea = slideTextarea;
    sharedSpaceListVm.slideUpTextarea = slideUpTextarea;
    sharedSpaceListVm.sortDropdownSetActive = sortDropdownSetActive;
    sharedSpaceListVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
    sharedSpaceListVm.toggleSearchState = toggleSearchState;
    sharedSpaceListVm.unavailableMultiDownload = unavailableMultiDownload;
    sharedSpaceListVm.uuid = $stateParams.uuid;
    sharedSpaceListVm.workgroupPage = lsAppConfig.workgroupPage;
    sharedSpaceListVm.workgroupDetailFile = lsAppConfig.workgroupDetailFile;

    activate();

    ////////////////

    function activate() {
      workgroupMembersRestService.get(sharedSpaceListVm.uuid, $scope.userLogged.uuid).then(function(member) {
        sharedSpaceListVm.currentWorkgroupMember = member;
        sharedSpaceListVm.fabButton.actions.push({
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE',
          icon: 'zmdi zmdi-file-plus fab-groups',
          flowBtn: true,
          hide: sharedSpaceListVm.currentWorkgroupMember.readonly
        });
      });

      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });

      sharedSpaceListVm.fab = {
        isOpen: false,
        count: 0,
        selectedDirection: 'left'
      };

      $translate(['ACTION.NEW_FOLDER'])
        .then(function(translations) {
          swalNewFolderName = translations['ACTION.NEW_FOLDER'];
        });
      $translate(['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON', 'GROWL_ALERT.ERROR.RENAME_INVALID.REJECTED_CHAR'])
        .then(function(translations) {
          swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadText = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
          swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
          invalideNameTranslate = translations['GROWL_ALERT.ERROR.RENAME_INVALID.REJECTED_CHAR']
            .replace('$rejectedChar', lsAppConfig.rejectedChar.join('-, -').replace(new RegExp('-', 'g'), '\''));
        });

      $translatePartialLoader.addPart('filesList');
      $translatePartialLoader.addPart('sharedspace');

      pushEntriesAndBreadcrumb();

      sharedSpaceListVm.fabButton = {
        toolbar: {
          activate: true,
          label: 'BOUTON_ADD_FILE_TITLE'
        },
        actions: [
          {
            action: null,
            label: 'WORKGROUPS_LIST.PROJECT',
            icon: 'groups-project disabled-work-in-progres',
            //TODO - SMA: Icon not working
            disabled: true,
            hide: lsAppConfig.linshareModeProduction
          },  {
            action: null,
            label: 'WORKGROUPS_LIST.SHARED_FOLDER',
            icon: 'groups-shared-folder disabled-work-in-progress',
            //TODO - SMA: Icon not working
            disabled: true,
            hide: lsAppConfig.linshareModeProduction
          }, {
            action: function() {return sharedSpaceListVm.createFolder();},
            label: 'WORKGROUPS_LIST.FOLDER',
            icon: 'groups-folder'
          }, {
            action: null,
            label: 'WORKGROUPS_LIST.UPLOAD_REQUEST',
            icon: 'zmdi zmdi-pin-account disabled-work-in-progress',
            disabled: true,
            hide: lsAppConfig.linshareModeProduction
          }, {
            action: null,
            label: 'WORKGROUPS_LIST.ADD_A_MEMBER',
            icon: 'groups-add-member',
            //TODO - SMA: Icon not working
            disabled: true,
            hide: lsAppConfig.linshareModeProduction
          }]
      };
    }

    function addSelectedDocument(document) {
      documentUtilsService.selectDocument(sharedSpaceListVm.selectedDocuments, document);
    }

    function addUploadedEntry(flowFile) {
      if (flowFile._from === $scope.workgroupPage) {
        if (flowFile.folderDetails.uuid === sharedSpaceListVm.folderDetails.uuid &&
          flowFile.folderDetails.folderUuid === sharedSpaceListVm.folderDetails.folderUuid) {
          flowFile.asyncUploadDeferred.promise.then(function(file) {
            sharedSpaceListVm.itemsList.push(file.linshareDocument);
            $scope.isNewAddition = true;
            sharedSpaceListVm.tableParams.reload();
            $timeout(function() {
              $scope.isNewAddition = false;
            }, 0);
          });
        }
      }
    }

    function closeSearchFunction() {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }

    // TODO : show a single callback toast for multiple items copied, and check if it needs to be plural or not,
    // additionally please prefix the sentence by number of files copied
    function copy(entryUuid) {
      workgroupEntriesRestService.copy(sharedSpaceListVm.uuid, entryUuid).then(function() {
        $translate('GROWL_ALERT.ACTION.COPY').then(function(message) {
          toastService.success(message);
        });
      });
    }

    function createFolder() {
      var defaultNamePos = itemUtilsService.itemNumber(sharedSpaceListVm.itemsList, swalNewFolderName);
      var defaultName = defaultNamePos > 0 ? swalNewFolderName + ' (' + defaultNamePos + ')' : swalNewFolderName;
      createFolderFunction(defaultName);
    }

    function createFolderFunction(folderName) {
      if (sharedSpaceListVm.canCreate) {
        var folder = workgroupFoldersRestService.restangularize({
          name: folderName.trim(),
          parent: sharedSpaceListVm.folderUuid
        }, sharedSpaceListVm.uuid);
        sharedSpaceListVm.canCreate = false;
        sharedSpaceListVm.itemsList.push(folder);
        sharedSpaceListVm.tableParams.reload();
        $timeout(function() {
          renameFolder(folder, 'td[uuid=""] .file-name-disp');
        }, 0);
      }
    }

  // TODO : show a single callback toast for multiple  deleted items, and check if it needs to be plural or not
    function deleteCallback(items) {
      angular.forEach(items, function(restangularizedItem) {
        _.remove(restangularizedItem.lastAuthor);
        restangularizedItem.remove().then(function() {
          $translate('GROWL_ALERT.ACTION.DELETE_SINGULAR').then(function(message) {
            toastService.success(message);
          });
          _.remove(sharedSpaceListVm.itemsList, restangularizedItem);
          _.remove(sharedSpaceListVm.selectedDocuments, restangularizedItem);
          sharedSpaceListVm.itemsListCopy = sharedSpaceListVm.itemsList; // I keep a copy of the data for the filter module
          sharedSpaceListVm.tableParams.reload();
        }, function(error) {
          if (error.status === 400 && error.data.errCode === 26006) {
            $translate('GROWL_ALERT.ERROR.DELETE_ERROR.26006').then(function(message) {
              toastService.error(message);
            });
          }
        });
      });
    }

    function deleteDocuments(items) {
      documentUtilsService.deleteDocuments(items, deleteCallback);
    }

    /**
     *  @name downloadFile
     *  @desc Download a file of a document for the user
     *  @param {Object) documentFile - A document object
     *  @memberOf LinShare.sharedSpace.SharedSpaceListController
     */
    function downloadFile(documentFile) {
      workgroupEntriesRestService.download(sharedSpaceListVm.uuid, documentFile.uuid).then(function(fileStream) {
        documentUtilsService.downloadFileFromResponse(fileStream, documentFile.name, documentFile.type);
      });
    }

    function getDetails(item) {
      var
        deferred = $q.defer(),
        details = {},
        service = item.workGroup ? workgroupFoldersRestService : workgroupEntriesRestService;

      service.get(sharedSpaceListVm.uuid, item.uuid).then(function(data) {
        details = data;
        if (data.hasThumbnail) {
          service.thumbnail(sharedSpaceListVm.uuid, item.uuid).then(function(thumbnail) {
            details.thumbnail = thumbnail;
          });
        } else {
          delete details.thumbnail;
        }
        deferred.resolve(details);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function goToSharedSpaceFolderTarget(uuid, name, parent, folderUuid, folderName, fromBreacrumb, needReplace) {
      var folderNameElem = $('td[uuid=' + folderUuid + ']').find('.file-name-disp');
      var options = needReplace ? {location: 'replace'} : {};
      if (angular.element(folderNameElem).attr('contenteditable') === 'false' || fromBreacrumb) {
        $state.go('sharedspace.workgroups.entries', {
          uuid: uuid,
          workgroupName: name.trim(),
          parent: parent,
          folderUuid: folderUuid,
          folderName: folderName.trim()
        }, options);
      }
    }

    function loadSelectedDocument(filteredData) {
      var documentToSelect = _.find(filteredData, {'uuid': $stateParams.uploadedFileUuid});
      if (!_.isUndefined(documentToSelect)) {
        addSelectedDocument(documentToSelect);
      }
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(sharedSpaceListVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    function loadSpecificPage() {
      var items = _.orderBy(sharedSpaceListVm.itemsList.plain(), 'modificationDate', ['desc']);
      if ($stateParams.uploadedFileUuid) {
        return Math.floor(_.findIndex(items, {'uuid': $stateParams.uploadedFileUuid}) / 10) + 1;
      }
      return 1;
    }

    function loadTable() {
      return $q(function(resolve) {
        resolve(
          new NgTableParams({
            page: loadSpecificPage(),
            sorting: {modificationDate: 'desc'},
            count: 10,
            filter: sharedSpaceListVm.paramFilter
          }, {
            getData: function(params) {
              var filteredData = params.filter() ? $filter('filter')(sharedSpaceListVm.itemsList, params.filter()) : sharedSpaceListVm.itemsList;
              var filesList = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
              params.total(filesList.length);
              params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
              if ($stateParams.uploadedFileUuid) {
                loadSelectedDocument(filteredData);
              }
              return (filesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
          })
        );
      });
    }

    function openSearchFunction() {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    }

    function pushEntriesAndBreadcrumb() {
      // TODO : workaround to disable folders, with this user never see root folder, he is directly inside it, remove first if after RC
      if(currentWorkGroup.plain().length > 0) {
        _.forEach(currentWorkGroup[0].entries, function(entry) {
          Restangular.restangularizeElement(currentWorkGroup, entry, 'entries/' + entry.uuid);
          entry.parentResource.route = '';
          sharedSpaceListVm.itemsList.push(entry);
        });

        _.remove(sharedSpaceListVm.itemsList, {route: 'folders'});
        loadTable().then(function(data) {
          sharedSpaceListVm.tableParams = data;
        });
      } else {
        if (sharedSpaceListVm.folderUuid !== sharedSpaceListVm.uuid) {
          workgroupFoldersRestService.get(sharedSpaceListVm.uuid, sharedSpaceListVm.folderUuid).then(function(folder) {
            var currentWorkGroupEntries = _.clone(currentWorkGroup);
            currentWorkGroupEntries.route = 'entries';
            sharedSpaceBreadcrumbService.build(sharedSpaceListVm.uuid, folder.ancestors).then(function(breadcrumb) {
              sharedSpaceListVm.breadcrumbFolders = breadcrumb;
            });

          _.forEach(folder.entries, function(entry) {
            Restangular.restangularizeElement(currentWorkGroup, entry, 'entries/' + entry.uuid);
            entry.parentResource.route = '';
            sharedSpaceListVm.itemsList.push(entry);
          });

            loadTable().then(function(data) {
              sharedSpaceListVm.tableParams = data;
            });
          }, 0);
        } else {
          loadTable().then(function(data) {
            sharedSpaceListVm.tableParams = data;
          });
        }
      }
    }

    function reloadDocuments() {
      $timeout(function() {
        if (sharedSpaceListVm.folderUuid === sharedSpaceListVm.uuid) {
          workgroupFoldersRestService.getParent(sharedSpaceListVm.uuid, sharedSpaceListVm.uuid).then(function(folder) {
            sharedSpaceListVm.goToSharedSpaceFolderTarget(sharedSpaceListVm.uuid, sharedSpaceListVm.name, folder[0].parent, folder[0].uuid, folder[0].name, true, true);
          }, 0);
        } else {
          workgroupFoldersRestService.getParent(sharedSpaceListVm.uuid, sharedSpaceListVm.folderUuid).then(function(data) {
            sharedSpaceListVm.itemsList = data;
            sharedSpaceListVm.itemsListCopy = data;
            $scope.isNewAddition = true;
            pushEntriesAndBreadcrumb();
            sharedSpaceListVm.tableParams.reload();
            $timeout(function() {
              $scope.isNewAddition = false;
            }, 0);
          }, 0);
        }
      });
    }

    function renameFolder(item, itemNameElem) {
      itemNameElem = itemNameElem || 'td[uuid=' + item.uuid + '] .file-name-disp';
      itemUtilsService.rename(item, itemNameElem).then(function(data) {
          item = _.assign(item, data);
          sharedSpaceListVm.canCreate = true;
        }).catch(function(error) {
          //TODO - Manage error from back
          //$translate('GROWL_ALERT.ERROR.RENAME_FOLDER').then(function(message) {
          //  toastService.error(message);
          //});
          if (error.data.errCode === lsErrorCode.CANCELLED_BY_USER) {
            if (!item.uuid) {
              sharedSpaceListVm.itemsList.splice(_.findIndex(sharedSpaceListVm.itemsList, item), 1);
            }
            sharedSpaceListVm.canCreate = true;
          }
        }).finally(function() {
          sharedSpaceListVm.tableParams.reload();
        });
    }

    function renameItem(item, itemNameElem) {
      itemNameElem = itemNameElem || 'td[uuid=' + item.uuid + '] .file-name-disp';
      itemUtilsService.rename(item, itemNameElem).then(function(data) {
          item = _.assign(item, data);
        }).catch(function() {
          //TODO - Manage error from back
          //$translate('GROWL_ALERT.ERROR.RENAME_FILE').then(function(message) {
          //  toastService.error(message);
          //});
        }).finally(function() {
          sharedSpaceListVm.tableParams.reload();
        });
    }

    function resetSelectedDocuments() {
      delete sharedSpaceListVm.tableParams.filter().isSelected;
      documentUtilsService.resetItemSelection(sharedSpaceListVm.selectedDocuments);
    }

    function selectDocumentsOnCurrentPage(data, page, selectFlag) {
      var currentPage = page || sharedSpaceListVm.tableParams.page();
      var dataOnPage = data || sharedSpaceListVm.tableParams.data;
      var select = selectFlag || sharedSpaceListVm.flagsOnSelectedPages[currentPage];
      if (!select) {
        _.forEach(dataOnPage, function(element) {
          if (!element.isSelected) {
            element.isSelected = true;
            sharedSpaceListVm.selectedDocuments.push(element);
          }
        });
        sharedSpaceListVm.flagsOnSelectedPages[currentPage] = true;
      } else {
        sharedSpaceListVm.selectedDocuments = _.xor(sharedSpaceListVm.selectedDocuments, dataOnPage);
        angular.forEach(dataOnPage, function(element) {
          if (element.isSelected) {
            element.isSelected = false;
            _.remove(sharedSpaceListVm.selectedDocuments, function(n) {
              return n.uuid === element.uuid;
            });
          }
        });
        sharedSpaceListVm.flagsOnSelectedPages[currentPage] = false;
      }
    }

    function setTextInput($event) {
      var currTarget = $event.currentTarget;
      var inputTxt = angular.element(currTarget).text();
      if (inputTxt === '') {
        angular.element(currTarget).parent().find('span').css('display', 'block');
      } else {
        angular.element(currTarget).parent().find('span').css('display', 'none');
      }
    }

    function showItemDetails(current, event) {
      workgroupEntriesRestService.get(sharedSpaceListVm.uuid, current.uuid).then(function(data) {
        sharedSpaceListVm.currentSelectedDocument.current = data;
      });
      $scope.loadSidebarContent(sharedSpaceListVm.workgroupDetailFile);
      var currElm = event.currentTarget;
      angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    }

    function slideTextarea($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().addClass('show-full-comment');
    }

    function slideUpTextarea($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().removeClass('show-full-comment');
    }

    function sortDropdownSetActive(sortField, $event) {
      sharedSpaceListVm.toggleSelectedSort = !sharedSpaceListVm.toggleSelectedSort;
      sharedSpaceListVm.tableParams.sorting(sortField, sharedSpaceListVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.labeled-dropdown.open a').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }

    function toggleFilterBySelectedFiles() {
      if (sharedSpaceListVm.tableParams.filter().isSelected) {
        delete sharedSpaceListVm.tableParams.filter().isSelected;
      } else {
        sharedSpaceListVm.tableParams.filter().isSelected = true;
      }
    }

    function toggleSearchState() {
      if (!sharedSpaceListVm.searchMobileDropdown) {
        openSearch();
      } else {
        closeSearch();
      }
      sharedSpaceListVm.searchMobileDropdown = !sharedSpaceListVm.searchMobileDropdown;
    }

    function unavailableMultiDownload() {
      swal({
          title: swalMultipleDownloadTitle,
          text: swalMultipleDownloadText,
          type: 'error',
          confirmButtonColor: '#05b1ff',
          confirmButtonText: swalMultipleDownloadConfirm,
          closeOnConfirm: true
        }
      );
    }
  }
})();
