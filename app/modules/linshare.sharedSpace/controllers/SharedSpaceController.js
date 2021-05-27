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
    sharedSpaceVm.currentWorkgroupMember = {};
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
    sharedSpaceVm.canDeleteSharedSpaceMember = canDeleteSharedSpaceMember;
    sharedSpaceVm.goToPreviousFolder = goToPreviousFolder;
    sharedSpaceVm.updateVersioningParameter = updateVersioningParameter;
    sharedSpaceVm.updateSharedSpaceDescription = updateSharedSpaceDescription;
    sharedSpaceVm.canUpdateSharedSpace = canUpdateSharedSpace;
    sharedSpaceVm.driveUuid = $state.params && $state.params.driveUuid;
    sharedSpaceVm.isDriveState = $state.current.name === 'sharedspace.drive';
    sharedSpaceVm.status = 'loading';
    sharedSpaceVm.NODE_TYPE_PROPERTIES = {
      WORK_GROUP: {
        creationDialogTitle: 'CREATE_NEW_WORKGROUP',
        icon: 'ls-workgroup',
        defaultName: 'ACTION.NEW_WORKGROUP',
        backgroundTitle: 'BACKGROUND_SHARED_SPACE_TITLE_MSG',
        backgroundMessage: 'BACKGROUND_SHARED_SPACE_MSG'
      },
      DRIVE: {
        creationDialogTitle: 'CREATE_NEW_DRIVE',
        icon: 'ls-drive',
        defaultName: 'ACTION.NEW_DRIVE',
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

    if (sharedSpaceVm.isDriveState && sharedSpaceVm.driveUuid) {
      fetchingSharedSpaces.push(
        sharedSpaceRestService.getList(true, sharedSpaceVm.driveUuid),
        sharedSpaceRestService.get(sharedSpaceVm.driveUuid, null, true)
      );
    } else {
      fetchingSharedSpaces.push(sharedSpaceRestService.getList(true));
    }

    return $q.all(fetchingSharedSpaces).then(results => {
      sharedSpaceVm.itemsList = results[0];
      sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList;
      sharedSpaceVm.currentDrive = results[1];
    });
  }

  function fetchSharedSpacePermissions() {
    return workgroupPermissionsService
      .getWorkgroupsPermissions([...sharedSpaceVm.itemsList, sharedSpaceVm.currentDrive].filter(Boolean))
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
    return functionalityRestService.getAll().then(functionalities => {
      sharedSpaceVm.functionalities.contactsList = functionalities.CONTACTS_LIST.enable && functionalities.CONTACTS_LIST__CREATION_RIGHT.enable;
      sharedSpaceVm.functionalities.workgroup = functionalities.WORK_GROUP.enable && functionalities.WORK_GROUP__CREATION_RIGHT.enable;
      sharedSpaceVm.functionalities.canOverrideVersioning = functionalities.WORK_GROUP.enable && functionalities.WORK_GROUP__FILE_VERSIONING.canOverride;
      sharedSpaceVm.functionalities.drive = functionalities.DRIVE.enable;
      sharedSpaceVm.functionalities.driveCreationRight = functionalities.DRIVE__CREATION_RIGHT.enable;
    });
  }

  function setFabBehavior () {
    if (sharedSpaceVm.functionalities.workgroup || sharedSpaceVm.functionalities.drive) {
      sharedSpaceVm.fabButton = {
        toolbar: {
          activate: true,
          label: sharedSpaceVm.isDriveState ? 'MENU_TITLE.DRIVE' : 'MENU_TITLE.SHARED_SPACE'
        },
        actions: []
      };

      if (sharedSpaceVm.functionalities.workgroup) {
        sharedSpaceVm.fabButton.actions.push({
          action: () => sharedSpaceVm.createSharedSpace('WORK_GROUP'),
          label: sharedSpaceVm.NODE_TYPE_PROPERTIES.WORK_GROUP.defaultName,
          icon: sharedSpaceVm.NODE_TYPE_PROPERTIES.WORK_GROUP.icon,
        });
      }

      if (sharedSpaceVm.functionalities.drive && sharedSpaceVm.functionalities.driveCreationRight && !sharedSpaceVm.isDriveState) {
        sharedSpaceVm.fabButton.actions.push({
          action: () => sharedSpaceVm.createSharedSpace('DRIVE'),
          label: sharedSpaceVm.NODE_TYPE_PROPERTIES.DRIVE.defaultName,
          icon: sharedSpaceVm.NODE_TYPE_PROPERTIES.DRIVE.icon,
        });
      }
    }
  }


  function createSharedSpace(nodeType) {
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
        parentUuid: sharedSpaceVm.driveUuid,
        nodeType
      });

      itemUtilsService
        .enterItemName(sharedSpace, sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].creationDialogTitle)
        .then(newName => sharedSpaceRestService.create({
          ...sharedSpace,
          name: newName
        }))
        .then(item => sharedSpaceRestService.get(item.uuid, true, true))
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
    $scope.mainVm.sidebar.setData(sharedSpaceVm);
    $scope.mainVm.sidebar.setContent(content);
    $scope.mainVm.sidebar.show();
  };

  function goToSharedSpaceTarget(event, uuid, name, nodeType) {
    event.stopPropagation();
    var element = angular.element($('td[uuid=' + uuid + ']').find('.file-name-disp'));

    if (element.attr('contenteditable') === 'false') {
      if (nodeType === 'WORK_GROUP') {
        $state.go('sharedspace.workgroups.root', {workgroupUuid: uuid, workgroupName: name.trim()});
      } else if (nodeType === 'DRIVE') {
        $state.go('sharedspace.drive', {driveUuid: uuid});
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

    if (nodeTypes.indexOf('WORK_GROUP') >= 0 && nodeTypes.indexOf('DRIVE') >= 0) {
      messageKey = itemUtilsService.itemUtilsConstant.WORKGROUP_AND_DRIVE;
    } else if (nodeTypes.indexOf('WORK_GROUP') >= 0) {
      messageKey = itemUtilsService.itemUtilsConstant.WORKGROUP;
    } else {
      messageKey = itemUtilsService.itemUtilsConstant.DRIVE;
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
        sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList; // I keep a copy of the data for the filter module
        filterBoxService.getSetItems(sharedSpaceVm.itemsList);
        sharedSpaceVm.tableParams.reload();
        $scope.mainVm.sidebar.hide(items);
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
    sharedSpaceRestService
      .get(workgroupUuid, true, true)
      .then(workgroup => {
        sharedSpaceVm.currentSelectedDocument.current = Object.assign({}, workgroup);
        sharedSpaceVm.currentSelectedDocument.original = Object.assign({}, workgroup);

        if (sharedSpaceVm.currentSelectedDocument.current.quotaUuid) {
          return sharedSpaceRestService
            .getQuota(sharedSpaceVm.currentSelectedDocument.current.quotaUuid);
        }
      })
      .then(quota => {
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
        $timeout(() => angular.element('#focusInputShare').trigger('focus'), 300);
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

        return sharedSpaceRestService.get(item.uuid, true, true);
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
        sharedSpaceVm.permissions[sharedSpace.uuid].WORKGROUP &&
        sharedSpaceVm.permissions[sharedSpace.uuid].WORKGROUP.UPDATE;
    }

    if (sharedSpace.nodeType === 'DRIVE') {
      return sharedSpaceVm.permissions[sharedSpace.uuid] &&
      sharedSpaceVm.permissions[sharedSpace.uuid].DRIVE &&
      sharedSpaceVm.permissions[sharedSpace.uuid].DRIVE.UPDATE;
    }
  }

  function canCreateSharedSpace(type) {
    if (sharedSpaceVm.status !== 'loaded') {
      return false;
    }

    if (type === 'WORK_GROUP' && sharedSpaceVm.isDriveState) {
      return sharedSpaceVm.canCreate &&
        sharedSpaceVm.functionalities.workgroup &&
        sharedSpaceVm.permissions[sharedSpaceVm.driveUuid] &&
        sharedSpaceVm.permissions[sharedSpaceVm.driveUuid].WORKGROUP &&
        sharedSpaceVm.permissions[sharedSpaceVm.driveUuid].WORKGROUP.CREATE;
    }

    if (type === 'WORK_GROUP' && !sharedSpaceVm.isDriveState) {
      return sharedSpaceVm.canCreate && sharedSpaceVm.functionalities.workgroup;
    }

    if (type === 'DRIVE') {
      return sharedSpaceVm.canCreate && sharedSpaceVm.functionalities.drive && sharedSpaceVm.functionalities.driveCreationRight;
    }
  }

  function updateVersioningParameter () {
    if (sharedSpaceVm.currentSelectedDocument && sharedSpaceVm.currentSelectedDocument.original) {
      sharedSpaceRestService.update(sharedSpaceVm.currentSelectedDocument.original.plain());
    }
  }

  function canDeleteSharedSpaceMember () {
    return sharedSpaceVm.permissions[sharedSpaceVm.currentSelectedDocument.current.uuid].MEMBER.DELETE ||
    (
      sharedSpaceVm.permissions &&
      sharedSpaceVm.permissions.MEMBER &&
      sharedSpaceVm.permissions.MEMBER.DELETE
    );
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
}