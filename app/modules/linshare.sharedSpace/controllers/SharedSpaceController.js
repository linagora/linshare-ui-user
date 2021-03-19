'use strict';
angular.module('linshare.sharedSpace')
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('filesList');
    $translatePartialLoaderProvider.addPart('sharedspace');
  }])
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false, maxstatements: false */
  .controller('SharedSpaceController', function(
    _,
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
    NgTableParams,
    toastService,
    workgroupPermissionsService,
    workgroupRestService,
    workgroups,
    workgroupsPermissions
  ) {
    const sharedSpaceVm = this;

    sharedSpaceVm.$onInit = $onInit;

    function $onInit() {
      sharedSpaceVm.functionalities = {};
      sharedSpaceVm.permissions = workgroupsPermissions;
      sharedSpaceVm.canDeleteWorkgroups = false;
      sharedSpaceVm.canCreate = true;
      sharedSpaceVm.lsAppConfig = lsAppConfig;
      sharedSpaceVm.currentSelectedDocument = {};
      sharedSpaceVm.itemsList = workgroups;
      sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList;
      sharedSpaceVm.selectedDocuments = [];
      sharedSpaceVm.paramFilter = {name: ''};
      sharedSpaceVm.currentWorkgroupMember = {};
      sharedSpaceVm.mdtabsSelection = {
        selectedIndex: 0
      };
      sharedSpaceVm.flagsOnSelectedPages = {};
      sharedSpaceVm.currentPage = 'group_list';
      sharedSpaceVm.deleteWorkGroup = deleteWorkGroup;
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

      sharedSpaceVm.tableParams = new NgTableParams({
        page: 1,
        sorting: {modificationDate: 'desc'},
        count: 20,
        filter: sharedSpaceVm.paramFilter
      }, {
        getData: params => {
          var filteredData =
            params.filter() ? $filter('filter')(sharedSpaceVm.itemsList, params.filter()) : sharedSpaceVm.itemsList;
          var workgroups = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

          params.total(workgroups.length);
          params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});

          return (workgroups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

      $translate(['ACTION.NEW_WORKGROUP', 'ACTION.NEW_DRIVE'])
        .then(translations => {
          sharedSpaceVm.NODE_TYPE_PROPERTIES = {
            WORK_GROUP: {
              creationDialogTitle: 'CREATE_NEW_WORKGROUP',
              icon: 'ls-workgroup',
              defaultName: translations['ACTION.NEW_WORKGROUP']
            },
            DRIVE: {
              creationDialogTitle: 'CREATE_NEW_DRIVE',
              icon: 'ls-drive',
              defaultName: translations['ACTION.NEW_DRIVE']
            }
          };
        }).then(() => {
          functionalityRestService.getAll().then(functionalities => {
            sharedSpaceVm.functionalities.contactsList = functionalities.CONTACTS_LIST.enable && functionalities.CONTACTS_LIST__CREATION_RIGHT.enable;
            sharedSpaceVm.functionalities.workgroup = functionalities.WORK_GROUP.enable && functionalities.WORK_GROUP__CREATION_RIGHT.enable;
            sharedSpaceVm.functionalities.canOverrideVersioning = functionalities.WORK_GROUP.enable && functionalities.WORK_GROUP__FILE_VERSIONING.canOverride;
            sharedSpaceVm.functionalities.drive = functionalities.DRIVE.enable && functionalities.DRIVE__CREATION_RIGHT.enable;

            if (sharedSpaceVm.functionalities.workgroup || sharedSpaceVm.functionalities.drive) {
              sharedSpaceVm.fabButton = {
                toolbar: {
                  activate: true,
                  label: 'MENU_TITLE.SHARED_SPACE'
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

              if (sharedSpaceVm.functionalities.drive) {
                sharedSpaceVm.fabButton.actions.push({
                  action: () => sharedSpaceVm.createSharedSpace('DRIVE'),
                  label: sharedSpaceVm.NODE_TYPE_PROPERTIES.DRIVE.defaultName,
                  icon: sharedSpaceVm.NODE_TYPE_PROPERTIES.DRIVE.icon,
                });
              }
            }
          });
        });
    }

    function createSharedSpace(nodeType) {
      if (sharedSpaceVm.canCreate) {
        sharedSpaceVm.canCreate = false;
        filterBoxService.setFilters(false);
        sharedSpaceVm.paramFilter.name = '';
        const defaultNamePos = itemUtilsService.itemNumber(sharedSpaceVm.itemsList, sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].defaultName);
        const defaultName = defaultNamePos > 0 ?
          `${sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].defaultName} (${defaultNamePos})`
          : sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].defaultName;

        const sharedSpace = workgroupRestService.restangularize({
          name: defaultName.trim(),
          nodeType
        });

        popDialogAndCreateFolder(sharedSpace, sharedSpaceVm.NODE_TYPE_PROPERTIES[nodeType].creationDialogTitle).then(created => {
          sharedSpaceVm.itemsList.push(created);

          return workgroupPermissionsService.getWorkgroupsPermissions(workgroups);
        }).then(workgroupsPermissions => {
          Object.assign(
            sharedSpaceVm.permissions,
            workgroupPermissionsService.formatPermissions(workgroupsPermissions)
          );
        }).finally(() => {
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

    function goToSharedSpaceTarget(event, workgroupUuid, name) {
      event.stopPropagation();
      var element = angular.element($('td[uuid=' + workgroupUuid + ']').find('.file-name-disp'));

      if (element.attr('contenteditable') === 'false') {
        $state.go('sharedspace.workgroups.root', {workgroupUuid: workgroupUuid, workgroupName: name.trim()});
      }
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

      sharedSpaceVm.canDeleteWorkgroups = $filter('canDeleteWorkgroups')(sharedSpaceVm.selectedDocuments, sharedSpaceVm.permissions);
    };

    function deleteWorkGroup(workgroups) {
      itemUtilsService.deleteItem(workgroups, itemUtilsService.itemUtilsConstant.WORKGROUP, deleteCallback);
    }

    // TODO : show a single callback toast for multiple deleted items, and check if it needs to be plural or not
    function deleteCallback(items) {
      angular.forEach(items, restangularizedItem => {
        $log.debug('value to delete', restangularizedItem);
        restangularizedItem.remove().then(() => {
          toastService.success({key: 'TOAST_ALERT.ACTION.DELETE_SINGULAR'});
          _.remove(sharedSpaceVm.itemsList, restangularizedItem);
          _.remove(sharedSpaceVm.selectedDocuments, restangularizedItem);
          sharedSpaceVm.itemsListCopy = sharedSpaceVm.itemsList; // I keep a copy of the data for the filter module
          sharedSpaceVm.tableParams.reload();
          $scope.mainVm.sidebar.hide(items);

          updateFlagsOnSelectedPages();
        });
      });
    }

    function addSelectedDocument(document) {
      documentUtilsService.selectDocument(sharedSpaceVm.selectedDocuments, document);

      updateFlagsOnSelectedPages();

      sharedSpaceVm.canDeleteWorkgroups = $filter('canDeleteWorkgroups')(sharedSpaceVm.selectedDocuments, sharedSpaceVm.permissions);
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
      workgroupRestService
        .get(workgroupUuid, true, true)
        .then(workgroup => {
          sharedSpaceVm.currentSelectedDocument.current = Object.assign({}, workgroup);
          sharedSpaceVm.currentSelectedDocument.original = Object.assign({}, workgroup);

          return workgroupRestService
            .getQuota(sharedSpaceVm.currentSelectedDocument.current.quotaUuid);
        })
        .then(quota => {
          sharedSpaceVm.currentSelectedDocument.quotas = Object.assign({}, quota);

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
          angular.element('#focusInputShare').focus();
        } else {
          sharedSpaceVm.mdtabsSelection.selectedIndex = 0;
        }
      }
    }

    function renameFolder(item, itemNameElem) {
      var itemNameElement = itemNameElem || 'td[uuid=' + item.uuid + '] .file-name-disp';

      return workgroupRestService.get(item.uuid)
        .then(itemDetails => {
          return item.uuid ?
            itemUtilsService.rename(
              Object.assign(item, { versioningParameters: itemDetails.versioningParameters}), itemNameElement
            ) :
            itemUtilsService.rename(item, itemNameElement);
        })
        .then(newItemDetails => {
          item = _.assign(item, newItemDetails);
          sharedSpaceVm.canCreate = true;

          return workgroupRestService.get(item.uuid, true, true);
        })
        .then(newItemDetailsWithRole => {
          item = _.assign(item, newItemDetailsWithRole);

          return workgroupPermissionsService.getWorkgroupsPermissions(workgroups);
        })
        .then(workgroupsPermissions => {
          sharedSpaceVm.permissions = Object.assign(
            {},
            sharedSpaceVm.permissions,
            workgroupPermissionsService.formatPermissions(workgroupsPermissions)
          );
        })
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

    function popDialogAndCreateFolder(item, title) {
      return itemUtilsService.popDialogAndCreate(
        Object.assign(item), title
      )
        .then(newItemDetails => {
          item = _.assign(item, newItemDetails);

          return workgroupRestService.get(item.uuid, true, true);
        });
    }
  });
