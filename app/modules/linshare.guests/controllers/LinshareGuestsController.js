/**
 * LinShareGuestsController Controller
 * @namespace Guests
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .controller('LinshareGuestsController', LinshareGuestsController);

  //TODO - KLE: Check DI
  LinshareGuestsController.$inject = ['$filter', '$log', '$q', '$scope', '$translatePartialLoader',
    'growlService', 'GuestObjectService', 'LinshareGuestService', 'lsAppConfig', 'NgTableParams'
  ];

  /**
   * @namespace LinshareGuestsControlle
   * @desc Application guest management system controller
   * @memberOf LinShare.Guests
   */
  function LinshareGuestsController($filter, $log, $q, $scope, $translatePartialLoader,
    growlService, GuestObjectService, LinshareGuestService, lsAppConfig, NgTableParams) {
    /* jshint validthis: true */
    var guestVm = this;

    guestVm.addGuest = addGuest;
    guestVm.getGuestList = getGuestList;
    guestVm.guestList = [];
    guestVm.loadSidebarContent = loadSidebarContent;
    guestVm.newGuest = lsAppConfig.newGuest;
    guestVm.paramFilter = undefined;
    guestVm.setSubmitted = setSubmitted;
    $translatePartialLoader.addPart('guests');
    $translatePartialLoader.addPart('filesList');

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function activate() {
      $scope.mainVm.sidebar.hide();
      guestVm.newGuestObject = new GuestObjectService();
      return getGuestList().then(function() {
        guestVm.tableParams = loadTable(guestVm.guestList, guestVm.paramFilter);
      });
    }

    /**
     *  @name addGuest
     *  @desc Valid the object and call the method save on object Guest
     *  @param {Object} form - An Object representing the form
     *  @param {Object} newGuest - An object containing all informations of the guest
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function addGuest(form, newGuest) {
      if (form.$valid) {
        newGuest.save().then(function() {
          $scope.mainVm.sidebar.hide(form);
          growlService.notifyTopRight('ADD_GUEST_SIDEBAR.NOTIFICATION_SUCCESS');
        });
      } else {
        guestVm.setSubmitted(form);
      }
    }

    /**
     * @name getGuestList
     * @desc Get the list of guest form the API
     * @return {Array.<Guest>}
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function getGuestList() {
      // return LinshareGuestService.getList()
      //   .then(function(data) {
      //     guesguestVm.guestListguestVm.guestListtVm.guestList = data;
      //     return guestVm.guestList;
      //   });
      //TODO - KLE: put again the above code after dev
      guestVm.guestList = [{
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
      }, {
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
      }];

      return $q(function(resolve) {
        resolve(guestVm.guestList);
      });
    }

    /**
     *  @name loadTable
     *  @desc Load the table with the list give
     *  @param {Array.<Guest>} elementsList - List of Guests
     *  @param {Object.<string, string>} elementsFilter - The filter(s) to be applied to the table
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function loadTable(elementsList, elementsFilter) {
      return new NgTableParams({
        page: 1,
        sorting: {
          modificationDate: 'desc'
        },
        count: 10,
        filter: elementsFilter
      }, {
        total: elementsList.length,
        getData: function($defer, params) {
          var filteredData = params.filter() ?
            $filter('filter')(elementsList, params.filter()) : elementsList;
          var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html for possible values
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(guestVm);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.guest);
      if (content === lsAppConfig.newGuest) {
        guestVm.newGuestObject.reset();
      }
      $scope.mainVm.sidebar.show();
    }

    /**
     *  @name FunctionName
     *  @desc description
     *  @param {String} name - desc
     *  @returns {String} if there is one
     *  @memberOf NameSpaceGlobal.ElementName
     */
    //TODO - KLE: To be put in a service utils
    function setSubmitted(form) {
      form.$setSubmitted();
      angular.forEach(form, function(item) {
        if (item && item.$$parentForm === form && item.$setSubmitted) {
          setSubmitted(item);
        }
      });
    }

    ////=====> FROM HERE LIES TERROR YOU NEVER SAW, BE PREPARED AND DIE WATCHING

    //-----------
    // - Variable
    //-----------
    guestVm.currentSelectedDocument = {
      current: ''
    };
    guestVm.selectedDocuments = [];
    guestVm.selectedValue = 0;

    // For the multiselect - upon checkbox activated
    // In order to activate some contextualized features based on the current view
    guestVm.currentPage = 'my_guests';

    // \- Mobile specific -/
    //TODO - KLE: Kind of trashy, can't we do anything ?
    // In order to activate the fab  mechanism for the mobile view
    guestVm.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };


    //-----------
    // - Function
    //-----------
    //TODO - KLE: Function for select element in table, do a common sevice with an a array and the element to select
    //See app/modules/linshare.document/services/documentService.js Function toggleItemSelection
    //guestVm.addSelectedGuest = addSelectedGuest;

    //TODO - KLE: Sort mechanism
    guestVm.sortDropdownSetActive = sortDropdownSetActive;

    function sortDropdownSetActive(sortField, $event) {
      guestVm.toggleSelectedSort = !guestVm.toggleSelectedSort;
      guestVm.tableParams.sorting(sortField, guestVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }

    // TODO - KLE: add directive to focus the input of #top-search-wrap  if class labeled : search-toggled
    // was added to the #drop-area element;
    guestVm.openSearch = function() {
      angular.element('#top-search-wrap input').focus();
    };

    // \- Mobile specific -/
    // TODO - KLE: if searchMobileDropdown is off then reset search state by removing the current search value and
    // refresh filter result
    guestVm.closeSearch = function() {
      angular.element('#searchInMobileFiles').val('').trigger('change');
    };

    //TODO - KLE: Set the multi-select on top of header nav bar for the mobile view
    $scope.$on('$stateChangeSuccess', function() {
      angular.element('.multi-select-mobile').appendTo('body');
    });

    //TODO - KLE: Close multiselect on mobile view
    guestVm.resetSelectedDocuments = resetSelectedDocuments;

    function resetSelectedDocuments() {
      angular.forEach(guestVm.selectedDocuments, function(selectedDoc) {
        selectedDoc.isSelected = false;
      });
      guestVm.selectedDocuments = [];
    }
    guestVm.singleEventFab = function($event) {
      $event.stopPropagation();
    };
  }
})();
