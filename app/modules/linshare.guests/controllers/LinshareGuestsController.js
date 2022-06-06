/**
 * LinShareGuestsController Controller
 * @namespace Guests
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('guests');
      $translatePartialLoaderProvider.addPart('filesList');
    }])
    .controller('LinshareGuestsController', LinshareGuestsController);

  //TODO - KLE: Check DI
  LinshareGuestsController.$inject = [
    '_',
    '$filter',
    '$scope',
    '$translate',
    'GuestObjectService',
    'guestRestService',
    'itemUtilsService',
    'lsAppConfig',
    'NgTableParams',
    'toastService',
    'withEmail',
    'formUtilsService',
    'sidebarService'
  ];

  /**
   * @namespace LinshareGuestsController
   * @desc Application guest management system controller
   * @memberOf LinShare.Guests
   */
  // TODO: Should dispatch some function to other service or controller in order to valid the maxparams linter
  function LinshareGuestsController(
    _,
    $filter,
    $scope,
    $translate,
    GuestObjectService,
    guestRestService,
    itemUtilsService,
    lsAppConfig,
    NgTableParams,
    toastService,
    withEmail,
    formUtilsService,
    sidebarService
  ) {
    /* jshint validthis: true */
    var guestVm = this;

    guestVm.currentPage = lsAppConfig.guestsList;
    //TODO: To be deleted one ngTable directive is corrected
    guestVm.currentSelectedGuest = {
      current: ''
    };
    guestVm.deleteGuests = deleteGuests;
    //TODO: use for what ?
    guestVm.flagsOnSelectedPages = {};
    guestVm.getGuestDetails = getGuestDetails;
    guestVm.guestDetails = lsAppConfig.guestDetails;
    guestVm.currentView = 'HEADER_GUEST.SLIDER.ALL';
    guestVm.loadSidebarContent = loadSidebarContent;
    guestVm.loadTable = loadTable;
    guestVm.loggedUser = $scope.loggedUser;
    guestVm.guestCreate = lsAppConfig.guestCreate;
    guestVm.paramFilter = {};
    guestVm.selectedGuest = {};
    guestVm.selectedGuests = [];
    guestVm.showGuestDetails = showGuestDetails;
    guestVm.tableAddSelectedGuest = tableAddSelectedGuest;
    guestVm.tableApplyFilter = tableApplyFilter;
    guestVm.tableFilterBySelected = tableFilterBySelected;
    guestVm.tableResetSelectedGuests = tableResetSelectedGuests;
    guestVm.tableSelectAll = tableSelectAll;
    guestVm.tableSort = tableSort;
    guestVm.toggleSelectedSort = true;
    guestVm.onUpdatedGuest = onUpdatedGuest;
    guestVm.onCreatedGuest = onCreatedGuest;
    guestVm.withEmail = withEmail;
    guestVm.updateCommentOnSelectedGuest = updateCommentOnSelectedGuest;
    guestVm.switchGuestFilter = switchGuestFilter;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function activate() {
      guestVm.guestObject = new GuestObjectService({mail: guestVm.withEmail});
      guestVm.tableParams = guestVm.loadTable();
      guestVm.fabButton = {
        actions: [{
          action: function() {
            return guestVm.loadSidebarContent(guestVm.guestCreate);
          },
          icon: 'zmdi zmdi-plus',
          label: 'CONTACTS_LISTS_ACTION.MORE.ADD_CONTACT'
        }]
      };

      if (guestVm.withEmail) {
        guestVm.loadSidebarContent(guestVm.guestCreate);
      }
    }

    function onCreatedGuest() {
      sidebarService.hide(guestVm.guestObject);
      toastService.success({key: 'SIDEBAR.NOTIFICATION.SUCCESS.CREATE'});
      guestVm.tableParams.reload();
    }

    /**
     * @name deleteGuests
     * @desc Delete Guests
     * @param {Object|Array<Object>} guestObjects - List of guests to delete
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function deleteGuests(guestObjects) {
      itemUtilsService.deleteItem(guestObjects, itemUtilsService.itemUtilsConstant.GUEST, function(items) {
        _.forEach(items, function(guestObject) {
          guestRestService.remove(guestObject)
            .then(function() {
              _.remove(guestVm.selectedGuests, {'uuid': guestObject.uuid});})
            .then(function() {
              guestVm.tableParams.reload();
              sidebarService.hide(guestObjects);
              toastService.success({key: 'SIDEBAR.NOTIFICATION.SUCCESS.DELETE'});
            });
        });
      });
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
     * @name loadSelectedGuests
     * @desc Set 'selected' variable to true to selected elements after table is refreshed
     * @param {Object|Array<Object>} guests - List of guests getted from server
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    function loadSelectedGuests(guests) {
      _.forEach(guests, function(guest) {
        if (_.find(guestVm.selectedGuests, {uuid: guest.uuid})) {
          guest.isSelected = true;
        }
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
        count: 25,
        filter: guestVm.paramFilter
      }, {
        getData: function(params) {
          return guestRestService.getList(guestVm.guestFilter).then(function(data) {
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
            loadSelectedGuests(data);
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
      sidebarService.setData(guestVm);
      sidebarService.setContent(content || lsAppConfig.guestDetails);
      sidebarService.show();
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

      updateFlagsOnSelectedPages();
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
      _.forEach(columns, function(column) {
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

      angular.element('ul.sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
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
    function onUpdatedGuest() {
      sidebarService.hide(guestVm.guestObject);
      toastService.success({key: 'SIDEBAR.NOTIFICATION.SUCCESS.UPDATE'});
      guestVm.tableParams.reload();
    }

    ////=====> FROM HERE LIES TERROR YOU NEVER SAW, BE PREPARED AND DIE WATCHING

    //-----------
    // - Variable
    //-----------
    guestVm.selectedValue = 0;

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

    //TODO - KLE: Close multiselect on mobile view
    guestVm.singleEventFab = function($event) {
      $event.stopPropagation();
    };

    //TODO this is for calculate selected all when toggling selection of item
    //need to check when refactor this controller fwith tableParamsService
    function updateFlagsOnSelectedPages() {
      if (guestVm.tableParams && !guestVm.tableParams.data.length) {
        guestVm.flagsOnSelectedPages[guestVm.tableParams.page()] = false;

        return;
      }

      if (!guestVm.flagsOnSelectedPages[guestVm.tableParams.page()] &&
        (guestVm.tableParams.data.length === guestVm.selectedGuests.length)) {
        guestVm.flagsOnSelectedPages[guestVm.tableParams.page()] = true;
      }

      if (guestVm.flagsOnSelectedPages[guestVm.tableParams.page()] &&
        (guestVm.tableParams.data.length !== guestVm.selectedGuests.length)) {
        guestVm.flagsOnSelectedPages[guestVm.tableParams.page()] = false;
      }
    }

    function updateCommentOnSelectedGuest(comment) {
      const originalComment = guestVm.selectedGuest.comment;

      guestVm.selectedGuest.comment = comment;
      guestVm.selectedGuest.update().catch(() => {
        guestVm.selectedGuest.comment = originalComment;
      });
    }

    function switchGuestFilter(filter) {
      if (!filter) {
        guestVm.currentView = 'HEADER_GUEST.SLIDER.ALL';
      } else {
        guestVm.currentView = `HEADER_GUEST.SLIDER.MY_GUESTS_${filter}`;
      }
      guestVm.guestFilter = filter;
      guestVm.tableParams.reload();
      sidebarService.hide();
    }
  }
})();
