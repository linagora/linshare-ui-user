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
  LinshareGuestsController.$inject = ['$filter', '$log', '$q', '$scope', '$state', '$translate',
    '$translatePartialLoader', 'authenticationRestService', 'growlService', 'GuestObjectService',
    'guestRestService', 'lsAppConfig', 'NgTableParams'
  ];

  /**
   * @namespace LinshareGuestsControlle
   * @desc Application guest management system controller
   * @memberOf LinShare.Guests
   */
  function LinshareGuestsController($filter, $log, $q, $scope, $state, $translate, $translatePartialLoader,
    authenticationRestService, growlService, GuestObjectService, guestRestService, lsAppConfig, NgTableParams) {
    /* jshint validthis: true */
    var
      guestVm = this,
      swalCancel,
      swalConfirm,
      swalText,
      swalTitle;

    guestVm.addGuest = addGuest;
    guestVm.confirmDelete = confirmDelete;
    guestVm.currentPage = lsAppConfig.guestsList;
    //TODO: To be deleted one ngTable directive is corrected
    guestVm.currentSelectedGuest = {
      current: ''
    };
    //TODO: use for what ?
    guestVm.flagsOnSelectedPages = {};
    guestVm.getGuestDetails = getGuestDetails;
    guestVm.guestDetails = lsAppConfig.guestDetails;
    guestVm.isMineGuest = true;
    guestVm.loadSidebarContent = loadSidebarContent;
    guestVm.loadTable = loadTable;
    guestVm.loggedUser = $scope.loggedUser;
    //TODO: To be transformed in filter
    guestVm.lsFormat = lsFormat;
    //TODO: To be transformed in filter
    guestVm.lsFullDateFormat = lsFullDateFormat;
    guestVm.guestCreate = lsAppConfig.guestCreate;
    guestVm.paramFilter = {};
    guestVm.removeGuest = removeGuest;
    guestVm.removeSelectedGuests = removeSelectedGuests;
    guestVm.selectedGuest = {};
    guestVm.selectedGuests = [];
    guestVm.setSubmitted = setSubmitted;
    guestVm.showGuestDetails = showGuestDetails;
    guestVm.tableAddSelectedGuest = tableAddSelectedGuest;
    guestVm.tableApplyFilter = tableApplyFilter;
    guestVm.tableFilterBySelected = tableFilterBySelected;
    guestVm.tableResetSelectedGuests = tableResetSelectedGuests;
    guestVm.tableSelectAll = tableSelectAll;
    guestVm.tableSort = tableSort;
    guestVm.toggleSelectedSort = true;
    guestVm.updateGuest = updateGuest;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function activate() {
      authenticationRestService.getCurrentUser().then(function(data) {
        if (data.accountType !== lsAppConfig.accountType.guest) {
          // TODO : KLE Translation Needed
          guestVm.currentView = guestVm.isMineGuest ? 'MES INVITES' : 'AUTRES INVITES';
          guestVm.guestObject = new GuestObjectService();
          $translatePartialLoader.addPart('guests');
          $translatePartialLoader.addPart('filesList');
          $translate.refresh().then(function() {
            $translate(['SWEET_ALERT.ON_GUEST_DELETE.TITLE', 'SWEET_ALERT.ON_GUEST_DELETE.TEXT',
                'SWEET_ALERT.ON_GUEST_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_GUEST_DELETE.CANCEL_BUTTON'
              ])
              .then(function(translations) {
                swalTitle = translations['SWEET_ALERT.ON_GUEST_DELETE.TITLE'];
                swalText = translations['SWEET_ALERT.ON_GUEST_DELETE.TEXT'];
                swalConfirm = translations['SWEET_ALERT.ON_GUEST_DELETE.CONFIRM_BUTTON'];
                swalCancel = translations['SWEET_ALERT.ON_GUEST_DELETE.CANCEL_BUTTON'];
              });
          });
          guestVm.tableParams = guestVm.loadTable();
        } else {
          $state.transitionTo('home');
        }
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
        newGuest.create().then(function() {
          $scope.mainVm.sidebar.hide(form, newGuest);
          growlService.notifyTopRight('SIDEBAR.NOTIFICATION.SUCCESS.CREATE','inverse');
          guestVm.tableParams.reload();
        });
      } else {
        guestVm.setSubmitted(form);
      }
    }

    /**
     *  @name confirmDelete
     *  @desc Show a pop up to confirm the deletion of the guest
     *  @param {Object} stringParams - The parameters of the string to be changed
     *  @param {function} callback - Function to be called on success
     *  @memberOf LinShare.share.LinshareShareListController
     */
    function confirmDelete(stringParams, callback) {
      swal({
          title: swalTitle,
          text: swalText.replace('${count}', stringParams.count).replace('${plural}', stringParams.plural),
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: swalConfirm,
          cancelButtonText: swalCancel,
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm) {
          if (isConfirm) {
            callback();
          }
        }
      );
    }

    /**
     *  @name getDetails
     *  @desc Retrieve element data from the API
     *  @param {String} name - des
     *  @returns {Promise} Response of the server
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function getGuestDetails(item) {
      return guestRestService.get(item.uuid).then(function(data) {
        guestVm.selectedGuest = new GuestObjectService(data);
      });
    }

    /**
     *  @name loadTable
     *  @desc Load the table
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function loadTable() {
      return new NgTableParams({
        page: 1,
        sorting: {
          modificationDate: 'desc'
        },
        count: 10,
        filter: guestVm.paramFilter
      }, {
        getData: function(params) {
          return guestRestService.getList(guestVm.isMineGuest).then(function(data) {
            var filteredData = [];
            switch (params.filter().operator) {
              case '||':
                _.forOwn(params.filter(), function(val, key) {
                  var obj = {};
                  obj[key] = val;
                  if (key !== 'operator') {
                    filteredData = _.concat(filteredData, $filter('filter')(data, obj));
                  }
                });
                filteredData = _.uniq(filteredData);
                break;
              default:
                filteredData = params.hasFilter() ? $filter('filter')(data, params.filter()) : data;
                break;
            }
            var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
            params.total(files.length);
            return files.slice((params.page() - 1) * params.count(), params.page() * params.count());
          });
        }
      });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} content - The id of the content to load
     *                           See app/views/includes/sidebar-right.html for possible values
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(guestVm);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.guestDetails);
      $scope.mainVm.sidebar.show();
    }

    /**
     *  @name lsFormat
     *  @desc Translate the date to a simple format
     *  @returns {String}The date to the simple format
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function lsFormat() {
      return $translate.use() === 'fr-FR' ? 'd MMMM y' : 'MMMM d y';
    }

    /**
     *  @name lsFullDateFormat
     *  @desc Translate the date to a long format
     *  @returns {String}The date to the long format
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function lsFullDateFormat() {
      return $translate.use() === 'fr-FR' ? 'Le d MMMM y à  h:mm a' : 'The MMMM d  y at h:mma';
    }

    /**
     *  @name removeGuest
     *  @desc remove a Guest object
     *  @param {Object} guestObject - A Guest object
     *  @param {Boolean} guestObject - Determine if confirmation pop up should be shown
     *  @return {Promise} server response
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function removeGuest(guestObject, confirm) {
      if (confirm) {
        $scope.mainVm.sidebar.hide();
        guestVm.confirmDelete({
          count: 1,
          plural: ''
        }, function() {
          return guestRestService.remove(guestObject).then(function() {
            guestVm.tableParams.reload();
          });
        });
      } else {
        return guestRestService.remove(guestObject).then(function() {
          guestVm.tableParams.reload();
        });
      }
    }

    /**
     *  @name removeSelectedGuests
     *  @desc remove a Guest object
     *  @param {Array<Object>} guestsList - An array of Guest object
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function removeSelectedGuests(guestsList) {
      var plural = guestsList.length > 1 ? 's' : '';
      $scope.mainVm.sidebar.hide();
      guestVm.confirmDelete({
        count: guestsList.length,
        plural: plural
      }, function() {
        _.forEach(guestsList, function(guestObject) {
          guestVm.removeGuest(guestObject, false).then(function() {
            _.remove(guestsList, guestObject);
          });
        });
      });
    }

    /**
     *  @name setSubmitted
     *  @desc Set a form & subform to the state 'submitted'
     *  @param {DOM Object} form - The form to set to submitted state
     *  @memberOf LinShare.Guests.LinshareGuestsController
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

    /**
     *  @name showGuestDetails
     *  @desc Load & show the sidebar to see the details of the guest
     *  @param {Object} guestObject - A guest object
     *  @param {Integer} tabIndex - The tab number to be focus on
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function showGuestDetails(guestObject, tabIndex) {
      guestVm.getGuestDetails(guestObject).then(function() {
        guestVm.selectedTab = tabIndex || 0;
        guestVm.loadSidebarContent(guestVm.guestDetails);
      });
    }

    /**
     *  @name tableAddSelectGuest
     *  @desc Helper to add/remove element from a list and set the property 'isSelected'
     *  @param {Array<Object>} selectedItems - List of the items currently selected
     *  @param {Object} item - The item to add in the selection
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableAddSelectedGuest(selectedItems, item) {
      item.isSelected = !item.isSelected;
      if (item.isSelected) {
        selectedItems.push(item);
      } else {
        _.pull(selectedItems, item);
      }
    }

    /**
     *  @name tableApplyFilter
     *  @desc Helper to apply a filter on a selection of colum
     *  @param {String} filterValue - The value to use for the filters
     *  @param {Array<String>} columns - The name of the column to apply the filter on
     *  @param {String} operator - The filter operator
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableApplyFilter(filterValue, columns, operator) {
      _.forEach(columns, function(column)  {
        guestVm.paramFilter[column] = filterValue;
      });
      guestVm.paramFilter.operator = operator ? operator : '&&';
      guestVm.tableParams.filter(guestVm.paramFilter);
      guestVm.tableParams.reload();
    }

    /**
     *  @name tableFilterBySelected
     *  @desc Helper to filter list on selected element
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableFilterBySelected() {
      if (guestVm.tableParams.filter().isSelected) {
        delete guestVm.tableParams.filter().isSelected;
      } else {
        guestVm.tableParams.filter().isSelected = true;
      }
    }

    /**
     *  @name tableResetSelectedGuests
     *  @desc Helper to reset selected elements
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableResetSelectedGuests() {
      delete guestVm.tableParams.filter().isSelected;
      _.forEach(guestVm.selectedGuests, function(selectedDoc) {
        selectedDoc.isSelected = false;
      });
      guestVm.selectedGuests = [];
    }

    /**
     *  @name tableSelectAll
     *  @desc Helper to select all element of the current table page
     *  @param {Array<Object>} data - List of element to be selected
     *  @param {Integer} page - Page number of the table
     *  @param {??????} SelectFlag - No idea/To be discovered
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableSelectAll(data, page, selectFlag) {
      var currentPage = page || guestVm.tableParams.page();
      var dataOnPage = data || guestVm.tableParams.data;
      var select = selectFlag || guestVm.flagsOnSelectedPages[currentPage];
      if (!select) {
        _.forEach(dataOnPage, function(element) {
          if (!element.isSelected) {
            element.isSelected = true;
            guestVm.selectedGuests.push(element);
          }
        });
        guestVm.flagsOnSelectedPages[currentPage] = true;
      } else {
        guestVm.selectedGuests = _.xor(guestVm.selectedGuest, dataOnPage);
        _.forEach(dataOnPage, function(element) {
          if (_.find(guestVm.selectedGuests, element)) {
            element.isSelected = false;
            _.remove(guestVm.selectedGuests, function(n) {
              return n.uuid === element.uuid;
            });
          }
        });
        guestVm.flagsOnSelectedPages[currentPage] = false;
      }
    }

    /**
     *  @name tableSort
     *  @desc Helper to sort element in table and set the visual on the right column
     *  @param {String} sortField - Name of the field to be sorted
     *  @param {jQuery.Event} $event - Event bound to the change
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableSort(sortField, $event) {
      guestVm.toggleSelectedSort = !guestVm.toggleSelectedSort;
      guestVm.tableParams.sorting(sortField, guestVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }

    /**
     *  @name updateGuest
     *  @desc Valid the object and call the method update on object Guest
     *  @param {Object} form - An Object representing the form
     *  @param {Object} guestObject - An object containing all informations of the guest
     *  @memberOf LinShare.Guests.LinshareGuestsController
     */
    function updateGuest(form, guestObject) {
      if (form.$valid) {
        guestObject.update().then(function() {
          $scope.mainVm.sidebar.hide(form, guestObject);
          growlService.notifyTopRight('SIDEBAR.NOTIFICATION.SUCCESS.UPDATE');
          guestVm.tableParams.reload();
        });
      } else {
        guestVm.setSubmitted(form);
      }
    }

    ////=====> FROM HERE LIES TERROR YOU NEVER SAW, BE PREPARED AND DIE WATCHING

    //-----------
    // - Variable
    //-----------
    guestVm.selectedValue = 0;

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
    guestVm.singleEventFab = function($event) {
      $event.stopPropagation();
    };
  }
})();
