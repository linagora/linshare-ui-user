'use strict';
angular.module('linshareUiUserApp')
  .controller('SharedSpaceController', function ($scope, $timeout, $translatePartialLoader, NgTableParams, $filter, workgroups, $translate, $state) {
    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('sharedspace');
    $scope.currentSelectedDocument = {};
    $scope.workgroupsData = workgroups;
    $scope.selectedDocuments = [];
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
    $scope.addRow = function () {
      var currentTimestamp = moment().valueOf();
      $scope.tableParams.sorting({modificationDate: 'desc'});
      $scope.workgroupsData.push(
        {
          'uuid': '1',
          'modificationDate': currentTimestamp,
          'name': swalNewWorkGroup
        }
      );
      $scope.tableParams.reload();
      $timeout(function () {
        var targetNameDips = angular.element('#fileListTable tbody > tr:first-child').find('.file-name-disp');
        setElemToEditable(targetNameDips);
      });
    };

    $scope.renameFolder = function (id) {
      var folderNameElem = $('td[uuid='+ id +']').find('.file-name-disp');
      setElemToEditable(folderNameElem);
    };
    $scope.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function ($defer, params) {
        var workgroups = params.sorting() ? $filter('orderBy')($scope.workgroupsData, params.orderBy()) : $scope.workgroupsData;
        params.total(workgroups.length);
        $defer.resolve(workgroups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
    $scope.sortDropdownSetActive = function ($event) {
      $scope.toggleSelectedSort = !$scope.toggleSelectedSort;
      var currTarget = $event.currentTarget;
      angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function () {
        angular.element(currTarget).addClass('selectedSorting');
      });
    };
    $scope.resetSelectedDocuments = function () {
      angular.forEach($scope.selectedDocuments, function (selectedDoc) {
        selectedDoc.isSelected = false;
      });
      $scope.selectedDocuments = [];
    };
    var openSearch = function () {
      angular.element('#dropArea').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    };
    var closeSearch = function () {
      angular.element('#dropArea').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    };

    $scope.toggleSearchState = function () {
      if (!$scope.searchMobileDropdown) {
        openSearch();
      } else {
        closeSearch();
      }
      $scope.searchMobileDropdown = !$scope.searchMobileDropdown;
    };

    $scope.$on('$stateChangeSuccess', function () {
      angular.element('.multi-select-mobile').appendTo('body');
    });
    $scope.fab = {
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
    $scope.currentPage = 'group_list';
    $scope.sortDropdownSetActive = function(sortField, $event) {
      $scope.toggleSelectedSort = !$scope.toggleSelectedSort;
      $scope.tableParams.sorting(sortField, $scope.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function() {
        angular.element(currTarget).addClass('selectedSorting');
      });
    };

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarRightDataType = content;
    };

    $scope.onAddMember = function() {
      $scope.loadSidebarContent('add-member');
      angular.element('#focusInputShare').focus();
    };
    $scope.setDropdownSelected = function ($event){
      var currTarget = $event.currentTarget;
      angular.element(currTarget).closest('ul').find('.active-check').removeClass('active-check');
      $timeout(function () {
        angular.element(currTarget).addClass('active-check');
      }, 200);
    };
    $scope.sortSearchMember = function ($event) {
      $scope.toggleSelectedSortMembers = !$scope.toggleSelectedSortMembers;
      var currTarget = $event.currentTarget;
      angular.element('.double-drop a ').removeClass('selectedSortingMembers') ;
      $timeout(function () {
        angular.element(currTarget).addClass('selectedSortingMembers');
      }, 200);
    };

    $scope.gotoSharedSpaceTarget = function(uuid, name) {
      $state.go('sharedspace.workgroups.target', {uuid: uuid, workgroupName: name});
    };
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
