'use strict';
angular.module('linshare.guests', ['restangular', 'ui.bootstrap', 'linshare.components'])

  .controller('LinshareGuestController', function ($scope, $filter, $translatePartialLoader, NgTableParams, $timeout, documentUtilsService) {
    
    $scope.mainVm.sidebar.setContent('guest-sidebar');
    $scope.mainVm.sidebar.hide();
    var guestList = [
      {
        'canUpload': false,
        'comment': null,
        'creationDate': '2016-10-03 15:06:05',
        'domain': 'guests',
        'expirationDate': '2017-01-03 15:06:05',
        'externalMailLocale': 'FRENCH',
        'firstName': 'Yo',
        'lastName': 'Da',
        'locale': 'FRENCH',
        'mail': 'arthur.pendragon@int3.linshare.dev',
        'modificationDate': '2016-10-03 15:06:05',
        'owner': 'Bart Simpson <bart.simpson@int1.linshare.dev>',
        'restricted': false,
        'restrictedContacts': [],
        'uuid': '315850be-49c6-4a40-8a09-b1b36760c499'
      },
      {
        'canUpload': false,
        'comment': null,
        'creationDate': '2016-10-03 15:06:05',
        'domain': 'guests',
        'expirationDate': '2017-01-03 15:06:05',
        'externalMailLocale': 'FRENCH',
        'firstName': 'amy',
        'lastName': 'wolsh',
        'locale': 'FRENCH',
        'mail': 'amy.wolsh@int3.linshare.dev',
        'modificationDate': '2016-10-03 15:06:05',
        'owner': 'Bart Simpson <bart.simpson@int1.linshare.dev>',
        'restricted': false,
        'restrictedContacts': [],
        'uuid': '315850be-49c6-4a40-8a09-b1b36760c489'
      }
    ];
    var guestListVm = this;
    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('guests');
    guestListVm.addSelectedDocument = addSelectedDocument;
    //guestListVm.sidebarRightDataType = lsAppConfig.addGuest;
    // For the multiselect - upon checkbox activated
    // In order to activate some contextualized features based on the current view
    guestListVm.currentPage = 'my_guests';
    guestListVm.currentSelectedDocument = {current: ''};
    // In order to activate the fab  mechanism for the mobile view
    guestListVm.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };
    guestListVm.guestList = guestList;
    guestListVm.resetSelectedDocuments = resetSelectedDocuments;
    guestListVm.selectedDocuments = [];
    guestListVm.selectedValue = 0;
    guestListVm.sortDropdownSetActive = sortDropdownSetActive;
    guestListVm.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 10,
      filter: guestListVm.paramFilter
    }, {
      total: guestListVm.guestList.length,
      getData: function($defer, params) {
        var filteredData = params.filter() ?
          $filter('filter')(guestListVm.guestList, params.filter()) : guestListVm.guestList;
        var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
        params.total(files.length);
        $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });

    // Set the multi-select on top of header nav bar for the mobile view
    $scope.$on('$stateChangeSuccess', function () {
      angular.element('.multi-select-mobile').appendTo('body');
    });

    function addSelectedDocument(document) {
      documentUtilsService.selectDocument(guestListVm.selectedDocuments, document);
    }

    // TODO: if searchMobileDropdown is off then reset search state by removing the current search value and
    // refresh filter result
    guestListVm.closeSearch = function (){
      angular.element('#searchInMobileFiles').val('').trigger('change');
    };

    // TODO: add directive to focus the input of #top-search-wrap  if class labeled : search-toggled
    // was added to the #drop-area element;
    guestListVm.openSearch = function (){
      angular.element('#top-search-wrap input').focus();
    };

    // To close the multiselect within the mobile view
    function resetSelectedDocuments() {
      angular.forEach(guestListVm.selectedDocuments, function(selectedDoc) {
        selectedDoc.isSelected = false;
      });
      guestListVm.selectedDocuments = [];
    }

    guestListVm.singleEventFab = function ($event) {
      $event.stopPropagation();
    };

    // In order to activate the sort mechanism
    function sortDropdownSetActive(sortField, $event) {
      guestListVm.toggleSelectedSort = !guestListVm.toggleSelectedSort;
      guestListVm.tableParams.sorting(sortField, guestListVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }
  });
