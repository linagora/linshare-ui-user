'use strict';
angular.module('linshareUiUserApp')
  .controller('SharedSpaceController', function ($scope, $timeout, $translatePartialLoader, NgTableParams, $filter,
                                                 workgroups, $translate, $state, documentUtilsService, workGroupRestService) {
    var thisctrl = this;
    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('sharedspace');
    thisctrl.currentSelectedDocument = {};
    thisctrl.workgroupsData = workgroups;
    thisctrl.selectedDocuments = [];
    thisctrl.deleteWorkGroup = deleteWorkGroup;
    thisctrl.addSelectedDocument = addSelectedDocument();
    thisctrl.currentSelectedDocument = {};
    thisctrl.showItemDetails = showItemDetails;


    var swalNewWorkGroup;
    $translate(['ACTION.NEW_WORKGROUP'])
      .then(function (translations) {
        swalNewWorkGroup = translations['ACTION.NEW_WORKGROUP'];
      });
    var setElemToEditable = function (idElem) {
      angular.element(idElem).attr('contenteditable', 'true')
        .on('focus', function () {
          document.execCommand('selectAll', false, null);})
        .on('focusout', function () {
          angular.element(this).attr('contenteditable', 'false');
        });
      angular.element(idElem).focus();
    };
    thisctrl.addRow = function () {
      var currentTimestamp = moment().valueOf();
      thisctrl.tableParams.sorting({modificationDate: 'desc'});
      thisctrl.workgroupsData.push(
        {
          'uuid': '1',
          'modificationDate': currentTimestamp,
          'name': swalNewWorkGroup
        }
      );
      thisctrl.tableParams.reload();
      $timeout(function () {
        var targetNameDips = angular.element('#fileListTable tbody > tr:first-child').find('.file-name-disp');
        setElemToEditable(targetNameDips);
      });
    };

    thisctrl.renameFolder = function (id) {
      var folderNameElem = $('td[uuid='+ id +']').find('.file-name-disp');
      setElemToEditable(folderNameElem);
    };

    thisctrl.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function ($defer, params) {
        var workgroups = params.sorting() ? $filter('orderBy')(thisctrl.workgroupsData, params.orderBy()) : thisctrl.workgroupsData;
        params.total(workgroups.length);
        $defer.resolve(workgroups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });

    thisctrl.sortDropdownSetActive = function ($event) {
      thisctrl.toggleSelectedSort = !thisctrl.toggleSelectedSort;
      var currTarget = $event.currentTarget;
      angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function () {
        angular.element(currTarget).addClass('selectedSorting');
      });
    };

    thisctrl.resetSelectedDocuments = function () {
      angular.forEach(thisctrl.selectedDocuments, function (selectedDoc) {
        selectedDoc.isSelected = false;
      });
      thisctrl.selectedDocuments = [];
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
    };

    thisctrl.onAddMember = function() {
      thisctrl.loadSidebarContent('add-member');
      angular.element('#focusInputShare').focus();
    };

    thisctrl.setDropdownSelected = function ($event){
      var currTarget = $event.currentTarget;
      angular.element(currTarget).closest('ul').find('.active-check').removeClass('active-check');
      $timeout(function () {
        angular.element(currTarget).addClass('active-check');
      }, 200);
    };

    thisctrl.sortSearchMember = function ($event) {
      thisctrl.toggleSelectedSortMembers = !thisctrl.toggleSelectedSortMembers;
      var currTarget = $event.currentTarget;
      angular.element('.double-drop a ').removeClass('selectedSortingMembers') ;
      $timeout(function () {
        angular.element(currTarget).addClass('selectedSortingMembers');
      }, 200);
    };

    thisctrl.gotoSharedSpaceTarget = function(uuid, name) {
      $state.go('sharedspace.workgroups.target', {uuid: uuid, workgroupName: name});
    };

    function deleteWorkGroup() {
      return documentUtilsService.deleteDocuments
        .bind(undefined, workGroupRestService, thisctrl.allDocuments, thisctrl.selectedDocuments, thisctrl.tableParams);
    }

    function addSelectedDocument() {
      return documentUtilsService.selectDocument.bind(undefined, thisctrl.selectedDocuments);
    }

    function showItemDetails(current, event) {
      thisctrl.sidebarRightDataType = 'details';
      $scope.sidebarRightDataType = 'details';

      workGroupRestService.getWorkGroup(current.uuid).then(function(data) {
        thisctrl.currentSelectedDocument.current = data;
      });

      $scope.mactrl.sidebarToggle.right = true;
      var currElm = event.currentTarget;
      angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    }

  })

  .directive('hoverDropdownFix', function() {
    return {
      restrict: 'A',
      link: function(scope, el) {
        scope.$watch(function() {
          return el.hasClass('open');
        }, function(newValue) {
          if(newValue) {
            angular.element(el).parent().addClass('setVisible');
          }else{
            angular.element(el).parent().removeClass('setVisible');
          }
        });

      }
    };
});
