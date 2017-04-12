'use strict';
angular.module('linshare.sharedSpace')
  .controller('SharedSpaceController', function($scope, $timeout, $translatePartialLoader, NgTableParams, $filter, $log,
                                                workgroups, $translate, $state, documentUtilsService, fileSystemUtils,
                                                workgroupRestService, workgroupFoldersRestService,
                                                workgroupEntriesRestService, lsAppConfig, toastService) {
    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('sharedspace');

    var thisctrl = this;
    thisctrl.downloadFile = downloadFile;
    thisctrl.lsAppConfig = lsAppConfig;
    thisctrl.currentSelectedDocument = {};
    thisctrl.itemsList = workgroups;
    thisctrl.itemsListCopy = thisctrl.itemsList;
    thisctrl.selectedDocuments = [];
    thisctrl.addSelectedDocument = addSelectedDocument;
    thisctrl.showItemDetails = showItemDetails;
    thisctrl.paramFilter = {name: ''};
    thisctrl.currentWorkgroupMember = {};
    thisctrl.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20,
      filter: thisctrl.paramFilter
    }, {
      getData: function(params) {
        var filteredData = params.filter() ? $filter('filter')(thisctrl.itemsList, params.filter()) : thisctrl.itemsList;
        var workgroups = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
        params.total(workgroups.length);
        params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
        return (workgroups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
    thisctrl.deleteWorkGroup = deleteWorkGroup;
    thisctrl.memberRole = 'admin';
    thisctrl.mdtabsSelection = {
      selectedIndex: 0
    };

    var swalNewWorkGroupName, invalideNameTranslate;
    $translate(['ACTION.NEW_WORKGROUP', 'GROWL_ALERT.ERROR.RENAME_INVALID.REJECTED_CHAR'])
      .then(function(translations) {
        swalNewWorkGroupName = translations['ACTION.NEW_WORKGROUP'];
        invalideNameTranslate = translations['GROWL_ALERT.ERROR.RENAME_INVALID.REJECTED_CHAR']
          .replace('$rejectedChar', lsAppConfig.rejectedChar.join('-, -').replace(new RegExp('-', 'g'), '\''));
      });
    var setElemToEditable = function(idElem, data, isNew) {
      var initialName = swalNewWorkGroupName;
      var enterKeyPressed = false;

      angular.element(idElem).attr('contenteditable', 'true')
        .on('focus', function() {
          document.execCommand('selectAll', false, null);
          initialName = data.name;
        })
        .on('focusout', function() {
          if(!enterKeyPressed) {
            data.name = idElem[0].textContent;
            if (data.name.trim() === '') {
              angular.element(idElem).text(initialName);
              data.name = initialName.trim();
            }
            if (!fileSystemUtils.isNameValid(data.name)) {
              toastService.error(invalideNameTranslate);
              data.name = initialName;
              idElem[0].textContent = initialName;
              return;
            }
            if(isNew) {
              saveNewWorkgroup(data.name);
            } else {
              workgroupRestService.update(data);
            }
            angular.element(this).attr('contenteditable', 'false');
          }
        })
        .on('keypress', function(e) {
          if (e.which === 27 || e.keyCode === 27) {
            if (isNew) {
              _.remove(thisctrl.itemsList, {
                uuid: data.uuid
              });
              thisctrl.tableParams.reload();
              return null;
            } else {
              data.name = initialName;
              angular.element(idElem).text(initialName);
              angular.element(this).attr('contenteditable', 'false');
            }
            enterKeyPressed = true;
            return null;
          } else if (e.which === 13) {
            data.name = idElem[0].textContent;
            if ((data.name.trim() === initialName) || (data.name.trim() === '')) {
              angular.element(idElem).text(initialName);
              data.name = initialName.trim();
            }
            if (!fileSystemUtils.isNameValid(data.name)) {
              toastService.error(invalideNameTranslate);
              data.name = initialName;
              idElem[0].textContent = initialName;
              return;
            }
            if (isNew) {
              saveNewWorkgroup(data.name);
            } else {
              workgroupRestService.update(data);
            }
            enterKeyPressed = true;
            angular.element(this).attr('contenteditable', 'false');
          }
        });
      angular.element(idElem).focus();
    };

    thisctrl.createWorkGroup = function() {
      createFolder(swalNewWorkGroupName);
    };

    thisctrl.renameFolder = renameFolder;

    thisctrl.getDetails = function(item) {
      return documentUtilsService.getItemDetails(workgroupRestService, item);
    };

    thisctrl.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;

    thisctrl.sortDropdownSetActive = function($event) {
      thisctrl.toggleSelectedSort = !thisctrl.toggleSelectedSort;
      var currTarget = $event.currentTarget;
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    };

    thisctrl.resetSelectedDocuments = function() {
      delete thisctrl.tableParams.filter().isSelected;
      documentUtilsService.resetItemSelection(thisctrl.selectedDocuments);
    };

    var openSearch = function() {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    };
    var closeSearch = function() {
      angular.element('#drop-area').removeClass('search-toggled');
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

    $scope.$on('$stateChangeSuccess', function() {
      angular.element('.multi-select-mobile').appendTo('body');
    });
    thisctrl.fabButton = {
      toolbar: {
        activate: true,
        label: 'BOUTON_ADD_FILE_TITLE'
      },
      actions: [
        {
          action: null,
          label: 'WORKGROUPS_LIST.PROJECT',
          icon: 'groups-project disabled-work-in-progress',
          //TODO - SMA: Icon not working
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE',
          icon: 'zmdi zmdi-file-plus fab-groups disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: function() {return thisctrl.createWorkGroup();},
          label: 'WORKGROUPS_LIST.SHARED_FOLDER',
          icon: 'groups-shared-folder'
          //TODO - SMA: Icon not working
        },{
          action: null,
          label: 'WORKGROUPS_LIST.FOLDER',
          icon: 'groups-folder disabled-work-in-progress',
          //TODO - SMA: Icon not working
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'WORKGROUPS_LIST.UPLOAD_REQUEST',
          icon: 'zmdi zmdi-pin-account disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'WORKGROUPS_LIST.ADD_A_MEMBER',
          icon: 'groups-add-member disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }
      ]
    };

    thisctrl.currentPage = 'group_list';

    thisctrl.sortDropdownSetActive = function(sortField, $event) {
      thisctrl.toggleSelectedSort = !thisctrl.toggleSelectedSort;
      thisctrl.tableParams.sorting(sortField, thisctrl.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.labeled-dropdown.open a').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    };

    thisctrl.loadSidebarContent = function(content) {
      $scope.mainVm.sidebar.setData(thisctrl);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    };

    thisctrl.onAddMember = function() {
      thisctrl.mdtabsSelection.selectedIndex = 1;
      thisctrl.loadSidebarContent(lsAppConfig.workgroupPage);
      angular.element('#focusInputShare').focus();
    };

    thisctrl.setDropdownSelected = function($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).closest('ul').find('.active-check').removeClass('active-check');
      $timeout(function() {
        angular.element(currTarget).addClass('active-check');
      }, 200);
    };

    thisctrl.goToSharedSpaceTarget = function(uuid, name) {
      workgroupFoldersRestService.getParent(uuid, uuid).then(function(folder) {
        /*jshint eqnull: true*/
        if (folder[0] == null) {
          $state.go('sharedspace.workgroups.entries', {uuid: uuid, workgroupName: name, parent: uuid, folderUuid: uuid, folderName: name.trim()});
        } else {
          $state.go('sharedspace.workgroups.entries', {uuid: uuid, workgroupName: name.trim(), parent: folder[0].parent, folderUuid: folder[0].uuid, folderName: folder[0].name.trim()});
        }
      });
    };

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

    function deleteWorkGroup(workgroups) {
      documentUtilsService.deleteDocuments(workgroups, deleteCallback);
    }
// TODO : show a single callback toast for multiple deleted items, and check if it needs to be plural or not
    function deleteCallback(items) {
      angular.forEach(items, function(restangularizedItem) {
        $log.debug('value to delete', restangularizedItem);
        restangularizedItem.remove().then(function() {
          $translate('GROWL_ALERT.ACTION.DELETE_SINGULAR').then(function(message) {
            toastService.success(message);
          });
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
      if (thisctrl.tableParams.filter().isSelected) {
        delete thisctrl.tableParams.filter().isSelected;
      } else {
        thisctrl.tableParams.filter().isSelected = true;
      }
    }

    function showItemDetails(current, event) {
      workgroupRestService.get(current.uuid).then(function(data) {
        thisctrl.currentSelectedDocument.current = data;
        thisctrl.loadSidebarContent(lsAppConfig.workgroupPage);
        thisctrl.mdtabsSelection.selectedIndex = 0;
      });

      var currElm = event.currentTarget;
      angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    }

    function renameFolder(folder, isNew) {
      var folderNameElem = $('td[uuid=' + folder.uuid + ']').find('.file-name-disp');
      setElemToEditable(folderNameElem, folder, isNew);
    }

    function createFolder(folderName) {
      // I generate uuid for tableParams, because this object is temporary while item is not created. TableParams require an unique ID
      var workgroup = {
        name: folderName.trim(),
        /* jshint ignore:start */
        uuid: uuid.v4()
        /* jshint ignore:end */
      };
      thisctrl.itemsList.push(workgroup);
      thisctrl.tableParams.reload();
      $timeout(function() {
        renameFolder(workgroup, true);
      }, 0);
    }

    function saveNewWorkgroup(workgroupName) {
      workgroupRestService.create({name: workgroupName.trim()}).then(function(data) {
        thisctrl.itemsList.pop();
        thisctrl.itemsList.push(data);
        thisctrl.tableParams.reload();
      });
    }

    /**
     *  @name downloadFile
     *  @desc Download a file of a document for the user
     *  @param {Object) documentFile - A document object
     *  @memberOf LinShare.sharedSpace.SharedSpaceController
     */
    function downloadFile(documentFile) {
      workgroupEntriesRestService.download(thisctrl.uuid, documentFile.uuid).then(function(fileStream) {
        documentUtilsService.downloadFileFromResponse(fileStream, documentFile.name, documentFile.type);
      });
    }
  });
