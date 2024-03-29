angular
  .module('linshare.sharedSpace')
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('filesList');
    $translatePartialLoaderProvider.addPart('sharedspace');
  }])
  // TODO: Should dispatch some function to other service or controller
  .controller('SharedSpaceController', SharedSpaceController);

SharedSpaceController.$inject = [
  '_',
  '$q',
  '$timeout',
  '$filter',
  '$log',
  '$scope',
  '$state',
  '$translate',
  'documentUtilsService',
  'filterBoxService',
  'functionalityRestService',
  'itemUtilsService',
  'lsAppConfig',
  'lsErrorCode',
  'toastService',
  'workgroupPermissionsService',
  'sharedSpaceRestService',
  'sidebarService',
  'tableParamsService'
];

function SharedSpaceController(
  _,
  $q,
  $timeout,
  $filter,
  $log,
  $scope,
  $state,
  $translate,
  documentUtilsService,
  filterBoxService,
  functionalityRestService,
  itemUtilsService,
  lsAppConfig,
  lsErrorCode,
  toastService,
  workgroupPermissionsService,
  sharedSpaceRestService,
  sidebarService,
  tableParamsService
) {
  const sharedSpaceVm = this;

  sharedSpaceVm.$onInit = $onInit;

  function $onInit() {
    sharedSpaceVm.functionalities = {};
    sharedSpaceVm.canDeleteSharedSpaces = false;
    sharedSpaceVm.canCreate = true;
    sharedSpaceVm.lsAppConfig = lsAppConfig;
    sharedSpaceVm.currentSelectedDocument = {};
    sharedSpaceVm.selectedDocuments = [];
    sharedSpaceVm.paramFilter = {name: ''};
    sharedSpaceVm.mdtabsSelection = { selectedIndex: 0 };
    sharedSpaceVm.flagsOnSelectedPages = {};
    sharedSpaceVm.currentPage = 'group_list';
    sharedSpaceVm.deleteSharedSpace = deleteSharedSpace;
    sharedSpaceVm.goToSharedSpaceTarget = goToSharedSpaceTarget;
    sharedSpaceVm.addSelectedDocument = addSelectedDocument;
    sharedSpaceVm.showItemDetails = showItemDetails;
    sharedSpaceVm.createSharedSpace = createSharedSpace;
    sharedSpaceVm.renameFolder = renameFolder;
    sharedSpaceVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
    sharedSpaceVm.sortDropdownSetActive = sortDropdownSetActive;
    sharedSpaceVm.resetSelectedDocuments = resetSelectedDocuments;
    sharedSpaceVm.toggleSearchState = toggleSearchState;
    sharedSpaceVm.sortDropdownSetActive = sortDropdownSetActive;
    sharedSpaceVm.loadSidebarContent = loadSidebarContent;
    sharedSpaceVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    sharedSpaceVm.canRenameSharedSpace = canRenameSharedSpace;
    sharedSpaceVm.canCreateSharedSpace = canCreateSharedSpace;
    sharedSpaceVm.goToPreviousFolder = goToPreviousFolder;
    sharedSpaceVm.updateVersioningParameter = updateVersioningParameter;
    sharedSpaceVm.updateSharedSpaceDescription = updateSharedSpaceDescription;
    sharedSpaceVm.canUpdateSharedSpace = canUpdateSharedSpace;
    sharedSpaceVm.onSelfRemoveFromSharedSpace = onSelfRemoveFromSharedSpace;
    sharedSpaceVm.workspaceUuid = $state.params && $state.params.workspaceUuid;
    sharedSpaceVm.isWorkspaceState = $state.current.name === 'sharedspace.workspace';
    sharedSpaceVm.status = 'loading';
    sharedSpaceVm.NODE_TYPE_PROPERTIES = {
      WORK_GROUP: {
        creationDialogTitle: 'CREATE_NEW_WORKGROUP',
        icon: 'ls-workgroup',
        defaultName: 'ACTION.NEW_WORKGROUP',
        backgroundTitle: 'BACKGROUND_SHARED_SPACE_TITLE_MSG',
        backgroundMessage: 'BACKGROUND_SHARED_SPACE_MSG'
      },
      WORK_SPACE: {
        creationDialogTitle: 'CREATE_NEW_WORKSPACE',
        icon: 'ls-workspace',
        defaultName: 'ACTION.NEW_WORKSPACE',
        backgroundTitle: 'BACKGROUND_WORKGROUP_TITLE_MSG',
        backgroundMessage: 'BACKGROUND_WORKGROUP_MSG'
      }
    };


    return fetchSharedSpaces()
      .then(fetchSharedSpacePermissions)
      .then(initTableParams)
      .then(fetchFunctionalities)
      .then(setFabBehavior)
      .finally(() => {
        sharedSpaceVm.status = 'loaded';
      });
  }

  function fetchSharedSpaces () {
    let fetchingSharedSpaces = [];

    if (sharedSpaceVm.isWorkspaceState && sharedSpaceVm.workspaceUuid) {
      fetchingSharedSpaces.push(
        sharedSpaceRestService.getList(true, sharedSpaceVm.workspaceUuid),
        sharedSpaceRestService.get(sharedSpaceVm.workspaceUuid, { withRole: true })
      );
    } else {
      fetchingSharedSpaces.push(sharedSpaceRestService.getList(true));
    }

    return $q.all(fetchingSharedSpaces).then(results => {
      sharedSpaceVm.itemsList = results[0];
      sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList;
      sharedSpaceVm.currentWorkspace = results[1];
    });
  }

  function fetchSharedSpacePermissions() {
    return workgroupPermissionsService
      .getWorkgroupsPermissions([...sharedSpaceVm.itemsList, sharedSpaceVm.currentWorkspace].filter(Boolean))
      .then(permissions => workgroupPermissionsService.formatPermissions(permissions))
      .then(formattedPermissions => {
        sharedSpaceVm.permissions = formattedPermissions;
      });
  }

  function initTableParams () {
    return tableParamsService.initTableParams(sharedSpaceVm.itemsList, sharedSpaceVm.paramFilter)
      .then(() => {
        sharedSpaceVm.tableParamsService = tableParamsService;
        sharedSpaceVm.tableParams = tableParamsService.getTableParams();
      });
  }

  function fetchFunctionalities () {
    return functionalityRestService.getAll().then(({
      CONTACTS_LIST, CONTACTS_LIST__CREATION_RIGHT, SHARED_SPACE, WORK_GROUP__CREATION_RIGHT, WORK_GROUP__FILE_VERSIONING, WORK_SPACE__CREATION_RIGHT }) => {
      sharedSpaceVm.functionalities.contactsList = CONTACTS_LIST.enable && CONTACTS_LIST__CREATION_RIGHT.enable;
      sharedSpaceVm.functionalities.sharedSpace = SHARED_SPACE.enable;
      sharedSpaceVm.functionalities.workgroupCreationRight = WORK_GROUP__CREATION_RIGHT.enable;
      sharedSpaceVm.functionalities.canOverrideVersioning = WORK_GROUP__FILE_VERSIONING.canOverride;
      sharedSpaceVm.functionalities.workspaceCreationRight = WORK_SPACE__CREATION_RIGHT.enable;
    });
  }

  function setFabBehavior () {
    if (sharedSpaceVm.functionalities.sharedSpace) {
      sharedSpaceVm.fabButton = {
        toolbar: {
          activate: true,
          label: sharedSpaceVm.isWorkspaceState ? 'MENU_TITLE.WORKSPACE' : 'MENU_TITLE.SHARED_SPACE'
        },
        actions: []
      };

      if (sharedSpaceVm.functionalities.workgroupCreationRight) {
        sharedSpaceVm.fabButton.actions.push({
          action: () => sharedSpaceVm.createSharedSpace('WORK_GROUP'),
          label: sharedSpaceVm.NODE_TYPE_PROPERTIES.WORK_GROUP.defaultName,
          icon: sharedSpaceVm.NODE_TYPE_PROPERTIES.WORK_GROUP.icon,
        });
      }

      if (sharedSpaceVm.functionalities.workspaceCreationRight && !sharedSpaceVm.isWorkspaceState) {
        sharedSpaceVm.fabButton.actions.push({
          action: () => sharedSpaceVm.createSharedSpace('WORK_SPACE'),
          label: sharedSpaceVm.NODE_TYPE_PROPERTIES.WORK_SPACE.defaultName,
          icon: sharedSpaceVm.NODE_TYPE_PROPERTIES.WORK_SPACE.icon,
        });
      }
    }
  }


  function createSharedSpace(nodeType) {
    $('.shared-space-tooltip-trigger').trigger('mouseleave');

    if (sharedSpaceVm.canCreate) {
      sharedSpaceVm.canCreate = false;
      if (sharedSpaceVm.itemsList.length !== sharedSpaceVm.itemsListCopy.length) {
        sharedSpaceVm.itemsList = sharedSpaceVm.itemsListCopy;
      }

      filterBoxService.getSetDateFilter(false);
      filterBoxService.resetTableList();
      sharedSpaceVm.paramFilter.name = '';
      sharedSpaceVm.tableParams.reload();

      const translatedDefaultPrefix = $translate.instant(sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].defaultName);
      const defaultNamePos = itemUtilsService.itemNumber(sharedSpaceVm.itemsList, translatedDefaultPrefix);
      const defaultName = defaultNamePos > 0 ?
        `${translatedDefaultPrefix} (${defaultNamePos})`
        : translatedDefaultPrefix;

      const sharedSpace = sharedSpaceRestService.restangularize({
        name: defaultName.trim(),
        parentUuid: sharedSpaceVm.workspaceUuid,
        nodeType
      });

      itemUtilsService
        .enterItemName(sharedSpace, sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].creationDialogTitle)
        .then(newName => sharedSpaceRestService.create({
          ...sharedSpace,
          name: newName
        }))
        .then(item => sharedSpaceRestService.get(item.uuid, {
          withRole: true,
          withMembers: true
        }))
        .then(itemWithRole => {
          sharedSpaceVm.itemsList.push(itemWithRole);
          sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList;
          filterBoxService.getSetItems(sharedSpaceVm.itemsList);
        })
        .then(fetchSharedSpacePermissions)
        .finally(() => {
          sharedSpaceVm.tableParams.reload();
          sharedSpaceVm.canCreate = true;
        });
    }
  };

  function sortDropdownSetActive($event) {
    sharedSpaceVm.toggleSelectedSort = !sharedSpaceVm.toggleSelectedSort;
    var currTarget = $event.currentTarget;

    angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(() => {
      angular.element(currTarget).addClass('selected-sorting');
    });
  };

  function resetSelectedDocuments() {
    delete sharedSpaceVm.tableParams.filter().isSelected;
    documentUtilsService.resetItemSelection(sharedSpaceVm.selectedDocuments);
    updateFlagsOnSelectedPages();
  };

  function openSearch() {
    angular.element('#drop-area').addClass('search-toggled');
    angular.element('#top-search-wrap input').focus();
  };

  function closeSearch() {
    angular.element('#drop-area').removeClass('search-toggled');
    angular.element('#searchInMobileFiles').val('').trigger('change');
  };

  function toggleSearchState() {
    if (!sharedSpaceVm.searchMobileDropdown) {
      openSearch();
    } else {
      closeSearch();
    }
    sharedSpaceVm.searchMobileDropdown = !sharedSpaceVm.searchMobileDropdown;
  };

  function sortDropdownSetActive(sortField, $event) {
    sharedSpaceVm.toggleSelectedSort = !sharedSpaceVm.toggleSelectedSort;
    sharedSpaceVm.tableParams.sorting(sortField, sharedSpaceVm.toggleSelectedSort ? 'desc' : 'asc');
    var currTarget = $event.currentTarget;

    angular.element('.labeled-dropdown.open a').removeClass('selected-sorting').promise().done(() => {
      angular.element(currTarget).addClass('selected-sorting');
    });
  };

  function loadSidebarContent(content) {
    sidebarService.setData(sharedSpaceVm);
    sidebarService.setContent(content);
    sidebarService.show();
  };

  function goToSharedSpaceTarget(event, uuid, name, nodeType) {
    event.stopPropagation();
    var element = angular.element($('td[uuid=' + uuid + ']').find('.file-name-disp'));

    if (element.attr('contenteditable') === 'false') {
      if (nodeType === 'WORK_GROUP') {
        $state.go('sharedspace.workgroups.root', {workgroupUuid: uuid, workgroupName: name.trim()});
      } else if (nodeType === 'WORK_SPACE') {
        $state.go('sharedspace.workspace', {workspaceUuid: uuid});
      }
    }
  }

  function goToPreviousFolder() {
    $state.go('sharedspace.all');
  }

  function selectDocumentsOnCurrentPage(data, page, selectFlag) {
    var currentPage = page || sharedSpaceVm.tableParams.page();
    var dataOnPage = data || sharedSpaceVm.tableParams.data;
    var select = selectFlag || sharedSpaceVm.flagsOnSelectedPages[currentPage];

    if (!select) {
      angular.forEach(dataOnPage, element => {
        if (!element.isSelected) {
          element.isSelected = true;
          sharedSpaceVm.selectedDocuments.push(element);
        }
      });

      sharedSpaceVm.flagsOnSelectedPages[currentPage] = true;
    } else {
      sharedSpaceVm.selectedDocuments = _.xor(sharedSpaceVm.selectedDocuments, dataOnPage);
      angular.forEach(dataOnPage, element => {
        if (element.isSelected) {
          element.isSelected = false;
          _.remove(sharedSpaceVm.selectedDocuments, n => {
            return n.uuid === element.uuid;
          });
        }
      });
      sharedSpaceVm.flagsOnSelectedPages[currentPage] = false;
    }

    sharedSpaceVm.canDeleteSharedSpaces = $filter('canDeleteSharedSpaces')(sharedSpaceVm.selectedDocuments, sharedSpaceVm.permissions);
  };

  function deleteSharedSpace(sharedSpaces) {
    let messageKey;
    const nodeTypes = (!_.isArray(sharedSpaces) ? [sharedSpaces] : sharedSpaces).map(sharedSpace => sharedSpace.nodeType);

    if (nodeTypes.indexOf('WORK_GROUP') >= 0 && nodeTypes.indexOf('WORK_SPACE') >= 0) {
      messageKey = itemUtilsService.itemUtilsConstant.WORKGROUP_AND_WORKSPACE;
    } else if (nodeTypes.indexOf('WORK_GROUP') >= 0) {
      messageKey = itemUtilsService.itemUtilsConstant.WORKGROUP;
    } else {
      messageKey = itemUtilsService.itemUtilsConstant.WORKSPACE;
    }

    itemUtilsService.deleteItem(sharedSpaces, messageKey, deleteCallback);
  }

  // TODO : show a single callback toast for multiple deleted items, and check if it needs to be plural or not
  function deleteCallback(items) {
    angular.forEach(items, restangularizedItem => {
      $log.debug('value to delete', restangularizedItem);
      sharedSpaceRestService.remove(restangularizedItem.uuid).then(() => {
        toastService.success({key: 'TOAST_ALERT.ACTION.DELETE_SINGULAR'});
        _.remove(sharedSpaceVm.itemsList, restangularizedItem);
        _.remove(sharedSpaceVm.selectedDocuments, restangularizedItem);

        if (sharedSpaceVm.tableParams.data.length === 1 && sharedSpaceVm.tableParams.page() !== 1) {
          sharedSpaceVm.tableParams.page(sharedSpaceVm.tableParams.page() - 1);
        }

        sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList; // I keep a copy of the data for the filter module
        filterBoxService.getSetItems(sharedSpaceVm.itemsList);
        sharedSpaceVm.tableParams.reload().then(function(data) {
          if (data.length === 0 && sharedSpaceVm.tableParams.total() > 0) {
            sharedSpaceVm.tableParams.page(sharedSpaceVm.tableParams.page() - 1);
            sharedSpaceVm.tableParams.reload();
          };
        });
        sidebarService.hide(items);
        updateFlagsOnSelectedPages();
      });
    });
  }

  function addSelectedDocument(document) {
    documentUtilsService.selectDocument(sharedSpaceVm.selectedDocuments, document);

    updateFlagsOnSelectedPages();

    sharedSpaceVm.canDeleteSharedSpaces = $filter('canDeleteSharedSpaces')(sharedSpaceVm.selectedDocuments, sharedSpaceVm.permissions);
  }

  function updateFlagsOnSelectedPages() {
    if (!sharedSpaceVm.itemsList.length) {
      sharedSpaceVm.flagsOnSelectedPages[sharedSpaceVm.tableParams.page()] = false;

      return;
    }

    if (!sharedSpaceVm.flagsOnSelectedPages[sharedSpaceVm.tableParams.page()] &&
        (sharedSpaceVm.itemsList.length === sharedSpaceVm.selectedDocuments.length)) {
      sharedSpaceVm.flagsOnSelectedPages[sharedSpaceVm.tableParams.page()] = true;
    }

    if (sharedSpaceVm.flagsOnSelectedPages[sharedSpaceVm.tableParams.page()] &&
        (sharedSpaceVm.itemsList.length !== sharedSpaceVm.selectedDocuments.length)) {
      sharedSpaceVm.flagsOnSelectedPages[sharedSpaceVm.tableParams.page()] = false;
    }
  }

  function toggleFilterBySelectedFiles() {
    if (sharedSpaceVm.tableParams.filter().isSelected) {
      delete sharedSpaceVm.tableParams.filter().isSelected;
    } else {
      sharedSpaceVm.tableParams.filter().isSelected = true;
    }
  }

  function showItemDetails(workgroupUuid, loadAction, memberTab) {
    sharedSpaceRestService.get(workgroupUuid, {
      withMembers: true,
      withRole: true
    }).then(workgroup => {
      sharedSpaceVm.currentSelectedDocument.current = Object.assign({}, workgroup);
      sharedSpaceVm.currentSelectedDocument.original = Object.assign({}, workgroup);

      if (sharedSpaceVm.currentSelectedDocument.current.quotaUuid) {
        return sharedSpaceRestService
          .getQuota(sharedSpaceVm.currentSelectedDocument.current.quotaUuid);
      }
    }).then(quota => {
      if (quota) {
        sharedSpaceVm.currentSelectedDocument.quotas = Object.assign({}, quota);
      }

      if (loadAction) {
        openMemberTab(memberTab);
        sharedSpaceVm.loadSidebarContent(lsAppConfig.workgroupPage);
      }
    });

    /**
     * @name openMemberTab
     * @desc Check if we have to be on member tab on sidebar opening
     * @param {boolean} ifMemberTab - Open member tab
     * @memberOf LinShare.sharedSpace.SharedSpaceController
     */
    function openMemberTab(ifMemberTab) {
      if (ifMemberTab) {
        sharedSpaceVm.mdtabsSelection.selectedIndex = 1;
        //TODO Don't Use angular.element, Do a component/directive
        $timeout(() => {
          if (sharedSpaceVm.mdtabsSelection.selectedIndex === 1) {
            angular.element('#focusInputShare').trigger('focus');
          }
        }, 500);
      } else {
        sharedSpaceVm.mdtabsSelection.selectedIndex = 0;
      }
    }
  }

  function renameFolder(item) {
    return sharedSpaceRestService.get(item.uuid)
      .then(itemDetails => {
        return item.uuid ?
          itemUtilsService.rename(
            Object.assign(item, { versioningParameters: itemDetails.versioningParameters}), sharedSpaceRestService.update
          ) :
          itemUtilsService.rename(item, sharedSpaceRestService.update);
      })
      .then(newItemDetails => {
        item = _.assign(item, newItemDetails);
        sharedSpaceVm.canCreate = true;

        return sharedSpaceRestService.get(item.uuid, {
          withMembers: true,
          withRole: true
        });
      })
      .then(newItemDetailsWithRole => {
        item = _.assign(item, newItemDetailsWithRole);
      })
      .then(fetchSharedSpacePermissions)
      .catch(response => {
        //TODO - Manage error from back
        var data = response.data;

        if (data.errCode === lsErrorCode.CANCELLED_BY_USER) {
          if (!item.uuid) {
            var itemListIndex = _.findIndex(sharedSpaceVm.itemsList, item);

            sharedSpaceVm.itemsList.splice(itemListIndex, 1);
          }
          sharedSpaceVm.canCreate = true;
        }
      })
      .finally(() => sharedSpaceVm.tableParams.reload());
  }

  function canRenameSharedSpace(sharedSpace, isSelected = false) {
    if (!sharedSpace || (sharedSpaceVm.selectedDocuments.length > 1 && isSelected)) {
      return false;
    }

    return canUpdateSharedSpace(sharedSpace);
  }

  function canUpdateSharedSpace(sharedSpace) {
    if (sharedSpace.nodeType === 'WORK_GROUP') {
      return sharedSpaceVm.permissions[sharedSpace.uuid] &&
        sharedSpaceVm.permissions[sharedSpace.uuid].WORK_GROUP &&
        sharedSpaceVm.permissions[sharedSpace.uuid].WORK_GROUP.UPDATE;
    }

    if (sharedSpace.nodeType === 'WORK_SPACE') {
      return sharedSpaceVm.permissions[sharedSpace.uuid] &&
      sharedSpaceVm.permissions[sharedSpace.uuid].WORK_SPACE &&
      sharedSpaceVm.permissions[sharedSpace.uuid].WORK_SPACE.UPDATE;
    }
  }

  function canCreateSharedSpace(type) {
    if (sharedSpaceVm.status !== 'loaded') {
      return false;
    }

    if (type === 'WORK_GROUP' && sharedSpaceVm.isWorkspaceState) {
      return sharedSpaceVm.canCreate &&
        sharedSpaceVm.permissions[sharedSpaceVm.workspaceUuid] &&
        sharedSpaceVm.permissions[sharedSpaceVm.workspaceUuid].WORK_GROUP &&
        sharedSpaceVm.permissions[sharedSpaceVm.workspaceUuid].WORK_GROUP.CREATE;
    }

    if (type === 'WORK_GROUP' && !sharedSpaceVm.isWorkspaceState) {
      return sharedSpaceVm.canCreate && sharedSpaceVm.functionalities.workgroupCreationRight;
    }

    if (type === 'WORK_SPACE' && !sharedSpaceVm.isWorkspaceState) {
      return sharedSpaceVm.canCreate && sharedSpaceVm.functionalities.workspaceCreationRight;
    }

    if (type === 'WORK_SPACE' && sharedSpaceVm.isWorkspaceState) {
      return false;
    }
  }

  function updateVersioningParameter () {
    if (sharedSpaceVm.currentSelectedDocument && sharedSpaceVm.currentSelectedDocument.original) {
      sharedSpaceRestService.update(sharedSpaceVm.currentSelectedDocument.original.plain());
    }
  }

  function updateSharedSpaceDescription(description) {
    const targetSharedSpace = _.clone(sharedSpaceVm.currentSelectedDocument.current);

    sharedSpaceVm.currentSelectedDocument.current.description = $translate.instant('SAVING');

    sharedSpaceRestService
      .update({ ...targetSharedSpace, description })
      .then(() => {
        sharedSpaceVm.currentSelectedDocument.current.description = description;
      })
      .catch(() => {
        sharedSpaceVm.currentSelectedDocument.current.description = targetSharedSpace.description;
      });
  }

  function onSelfRemoveFromSharedSpace(sharedSpace) {
    if (sharedSpaceVm.isWorkspaceState && sharedSpace.uuid === sharedSpaceVm.workspaceUuid) {
      return $state.go('sharedspace.all');
    }

    _.remove(sharedSpaceVm.itemsList, item => item.uuid === sharedSpace.uuid);
    _.remove(sharedSpaceVm.selectedDocuments, item => item.uuid === sharedSpace.uuid);
    sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList;
    filterBoxService.getSetItems(sharedSpaceVm.itemsList);
    sharedSpaceVm.tableParams.reload();
    sidebarService.hide();
    updateFlagsOnSelectedPages();
  }
}
