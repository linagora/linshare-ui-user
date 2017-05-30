'use strict';
angular.module('linshare.sharedSpace')
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false, maxstatements: false */
  .controller('SharedSpaceController', function(_, $scope, $timeout, $translatePartialLoader, NgTableParams, $filter,
    $log, workgroups, $translate, $state, documentUtilsService, itemUtilsService, workgroupRestService,
    workgroupFoldersRestService, auditDetailsService, workgroupEntriesRestService, lsAppConfig, lsErrorCode,
    toastService, functionalityRestService) {
    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('sharedspace');

    var thisctrl = this;
    thisctrl.canCreate = true;
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
        var filteredData =
          params.filter() ? $filter('filter')(thisctrl.itemsList, params.filter()) : thisctrl.itemsList;
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

    thisctrl.createWorkGroup = function() {
      var defaultNamePos = itemUtilsService.itemNumber(thisctrl.itemsList, swalNewWorkGroupName);
      var defaultName = defaultNamePos > 0 ?
        swalNewWorkGroupName + ' (' + defaultNamePos + ')' : swalNewWorkGroupName;
      createFolder(defaultName);
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
          label: 'WORKGROUPS_LIST.ADD_A_MEMBER',
          icon: 'ls-add-user disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE',
          icon: 'ls-upload-fill fab-groups disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'WORKGROUPS_LIST.FOLDER',
          icon: 'ls-folder disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'WORKGROUPS_LIST.UPLOAD_REQUEST',
          icon: 'ls-upload-request disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        },{
          action: null,
          label: 'WORKGROUPS_LIST.PROJECT',
          icon: 'ls-project disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }
      ]
    };

    functionalityRestService.getFunctionalityParams('WORK_GROUP__CREATION_RIGHT').then(function(data) {
      thisctrl.functionality = data;
      if (data.enable) {
        thisctrl.fabButton.actions.splice(2, 0, {
          action: function() {return thisctrl.createWorkGroup();},
          label: 'WORKGROUPS_LIST.SHARED_FOLDER',
          icon: 'ls-workgroup'
        });
      }
    });


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

    thisctrl.goToSharedSpaceTarget = function(workgroupUuid, name) {
      var element = angular.element($('td[uuid=' + workgroupUuid + ']').find('.file-name-disp'));
      if (element.attr('contenteditable') === 'false') {
        $state.go('sharedspace.workgroups.root', {workgroupUuid: workgroupUuid, workgroupName: name.trim()});
      }
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
      workgroupRestService.get(current.uuid).then(function(workgroup) {
        workgroupRestService.getAudit(current.uuid).then(function(auditData) {
          auditDetailsService.generateAllDetails($scope.userLogged.uuid, auditData.plain())
           .then(function(auditActions) {
              workgroup.auditActions = auditActions;
              thisctrl.currentSelectedDocument.current = workgroup;
              thisctrl.loadSidebarContent(lsAppConfig.workgroupPage);
              thisctrl.mdtabsSelection.selectedIndex = 0;
            });
        });
      });

      var currElm = event.currentTarget;
      angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    }

    function renameFolder(item, itemNameElem) {
      itemNameElem = itemNameElem || 'td[uuid=' + item.uuid + '] .file-name-disp';
      itemUtilsService.rename(item, itemNameElem).then(function(data) {
        item = _.assign(item, data);
        thisctrl.canCreate = true;
      }).catch(function(error) {
        //TODO - Manage error from back
        if (error.data.errCode === lsErrorCode.CANCELLED_BY_USER) {
          if (!item.uuid) {
            thisctrl.itemsList.splice(_.findIndex(thisctrl.itemsList, item), 1);
          }
          thisctrl.canCreate = true;
        }
      }).finally(function() {
        thisctrl.tableParams.reload();
      });
    }

    function createFolder(folderName) {
      if (thisctrl.canCreate) {
        var workgroup = workgroupRestService.restangularize({name: folderName.trim()});
        thisctrl.canCreate = false;
        thisctrl.itemsList.push(workgroup);
        thisctrl.tableParams.reload();
        $timeout(function() {
          renameFolder(workgroup, 'td[uuid=""] .file-name-disp');
        }, 0);
      }
    }

    /**
     *  @name downloadFile
     *  @desc Download a file of a document for the user
     *  @param {Object) documentFile - A document object
     *  @memberOf LinShare.sharedSpace.SharedSpaceController
     */
    function downloadFile(documentFile) {
      var url = workgroupEntriesRestService.download(thisctrl.uuid, documentFile.uuid);
      itemUtilsService.download(url, documentFile.name);
    }
  });
