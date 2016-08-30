'use strict';
angular.module('linshareUiUserApp')
  .controller('SharedSpaceController', function ($scope, $timeout, $translatePartialLoader, NgTableParams, $filter, $log,
                                                 workgroups, $translate, $state, documentUtilsService, workGroupRestService, growlService) {
    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('sharedspace');
    $scope.mactrl.sidebarToggle.right = false;

    var thisctrl = this;
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
      getData: function ($defer, params) {
        var filteredData = params.filter() ? $filter('filter')(thisctrl.itemsList, params.filter()) : thisctrl.itemsList;
        var workgroups = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
        params.total(workgroups.length);
        params.settings({ counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
        $defer.resolve(workgroups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
    thisctrl.deleteWorkGroup = deleteWorkGroup;
    thisctrl.memberRole = 'admin';
    thisctrl.mdtabsSelection = {
      selectedIndex : 0
    };

    var swalNewWorkGroupName;
    $translate(['ACTION.NEW_WORKGROUP'])
      .then(function (translations) {
        swalNewWorkGroupName = translations['ACTION.NEW_WORKGROUP'];
      });
    var setElemToEditable = function(idElem, data) {
      var  initialName = swalNewWorkGroupName;
      angular.element(idElem).attr('contenteditable', 'true')
        .on('focus', function () {
          document.execCommand('selectAll', false, null);
          initialName = data.name;
          })
        .on('focusout', function () {
          data.name = idElem[0].textContent;
          if(data.name.trim() === '') {
            angular.element(idElem).text(initialName);
            data.name = initialName;
          }
          workGroupRestService.update(data);
          angular.element(this).attr('contenteditable', 'false');
        })
        .on('keypress', function (e) {
          if(e.which === 13) {
            data.name = idElem[0].textContent;
            if((data.name.trim() === initialName) || (data.name.trim() === '')) {
              angular.element(idElem).text(initialName);
              data.name = initialName;
            }
            workGroupRestService.update(data);
            angular.element(this).attr('contenteditable', 'false');
            angular.element(this).blur();
          }
      });
      angular.element(idElem).focus();
    };

    thisctrl.createWorkGroup = function() {
      createFolder(swalNewWorkGroupName);
    };

    thisctrl.renameFolder = renameFolder;

    thisctrl.getDetails = function(item) {
      return documentUtilsService.getItemDetails(workGroupRestService, item);
    };

    thisctrl.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;

    thisctrl.sortDropdownSetActive = function ($event) {
      thisctrl.toggleSelectedSort = !thisctrl.toggleSelectedSort;
      var currTarget = $event.currentTarget;
      angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function () {
        angular.element(currTarget).addClass('selectedSorting');
      });
    };

    thisctrl.resetSelectedDocuments = function() {
      delete thisctrl.tableParams.filter().isSelected;
      documentUtilsService.resetItemSelection(thisctrl.selectedDocuments);
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

    $scope.$on('$stateChangeSuccess', function () {
      angular.element('.multi-select-mobile').appendTo('body');
    });
    thisctrl.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };
    $scope.$watch('fab.isOpen', function (isOpen) {
      if (isOpen) {
        angular.element('.md-toolbar-tools').addClass('setWhite');
        angular.element('.multi-select-mobile').addClass('setDisabled');
        angular.element('#overlayMobileFab').addClass('double-row-fab');
        $timeout(function () {
          angular.element('#overlayMobileFab').addClass('toggledMobileShowOverlay');
          angular.element('#content-container').addClass('setDisabled');
        }, 250);
      } else {
        angular.element('.md-toolbar-tools').removeClass('setWhite');
        $timeout(function () {
          angular.element('.multi-select-mobile').removeClass('setDisabled');
          angular.element('#overlayMobileFab').removeClass('toggledMobileShowOverlay');
          angular.element('#content-container').removeClass('setDisabled');
          angular.element('#overlayMobileFab').removeClass('double-row-fab');
        }, 250);
      }
    });
    thisctrl.currentPage = 'group_list';

    thisctrl.sortDropdownSetActive = function(sortField, $event) {
      thisctrl.toggleSelectedSort = !thisctrl.toggleSelectedSort;
      thisctrl.tableParams.sorting(sortField, thisctrl.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function() {
        angular.element(currTarget).addClass('selectedSorting');
      });
    };

    thisctrl.loadSidebarContent = function(content) {
      thisctrl.sidebarRightDataType = content;
      $scope.sidebarRightDataType = content;
    };

    thisctrl.onAddMember = function() {
      thisctrl.mdtabsSelection.selectedIndex = 1;
      $scope.mactrl.sidebarToggle.right = true;
      angular.element('#focusInputShare').focus();
    };

    thisctrl.setDropdownSelected = function ($event){
      var currTarget = $event.currentTarget;
      angular.element(currTarget).closest('ul').find('.active-check').removeClass('active-check');
      $timeout(function () {
        angular.element(currTarget).addClass('active-check');
      }, 200);
    };

    thisctrl.gotoSharedSpaceTarget = function(uuid, name) {
      $state.go('sharedspace.workgroups.entries', {uuid: uuid, workgroupName: name});
    };

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

    function deleteWorkGroup(workgroups) {
      documentUtilsService.deleteDocuments(workgroups, deleteCallback);
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

    function showItemDetails(current, event) {
      workGroupRestService.get(current.uuid).then(function(data) {
        thisctrl.currentSelectedDocument.current = data;
        $scope.mactrl.sidebarToggle.right = true;
        thisctrl.mdtabsSelection.selectedIndex = 0;
      });

      var currElm = event.currentTarget;
      angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    }

    function renameFolder(folder) {
      var folderNameElem = $('td[uuid='+ folder.uuid +']').find('.file-name-disp');
      setElemToEditable(folderNameElem, folder);
    }

    function createFolder(folderName) {
      workGroupRestService.create({name: folderName}).then(function(data) {
        thisctrl.itemsList.push(data);
        thisctrl.tableParams.reload();
        $timeout(function () {
          renameFolder(data);
        },0);
      });
    }

  });
