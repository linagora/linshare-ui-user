/**
 * contactsListsContactsController Controller
 * @namespace LinShare.contactsLists
 */
(function() {
  'use strict';
  angular
    .module('linshare.contactsLists')
    .controller('contactsListsContactsController', contactsListsContactsController);

  contactsListsContactsController.$inject = ['$filter', '$scope', '$stateParams', '$timeout', '$translate',
    '$translatePartialLoader', 'addContacts', 'contactsListsContacts', 'contactsListsListRestService',
    'contactsListsContactsRestService', 'contactsListsService', 'documentUtilsService', 'growlService', 'lsAppConfig',
    'NgTableParams'];

  /**
   * @namespace contactsListsContactsController
   * @desc Application contactsLists contacts management system controller
   * @memberOf LinShare.contactsLists
   */
  function contactsListsContactsController($filter, $scope, $stateParams, $timeout, $translate,
                                           $translatePartialLoader, addContacts, contactsListsContacts,
                                           contactsListsListRestService, contactsListsContactsRestService,
                                           contactsListsService, documentUtilsService, growlService, lsAppConfig,
                                           NgTableParams) {
    /* jshint validthis:true */
    var contactsListsContactsVm = this;
    var
      privateList,
      publicList,
      stillExists;
    contactsListsContactsVm.addContacts = addContacts;
    contactsListsContactsVm.addRecipientToCreateUsersList = addRecipientToCreateUsersList;
    contactsListsContactsVm.addSelectedDocument = addSelectedDocument;
    contactsListsContactsVm.closeSearch = closeSearch;
    contactsListsContactsVm.contactsListName = $stateParams.contactsListName;
    contactsListsContactsVm.contactsListUuid = $stateParams.contactsListUuid;
    contactsListsContactsVm.currentSelectedDocument = {};
    contactsListsContactsVm.deleteContact = deleteContact;
    contactsListsContactsVm.flagsOnSelectedPages = {};
    contactsListsContactsVm.getOwnerName = contactsListsService.getOwnerName;
    contactsListsContactsVm.itemsList = contactsListsContacts;
    contactsListsContactsVm.itemsListCopy = contactsListsContactsVm.itemsList;
    contactsListsContactsVm.loadSidebarContent = loadSidebarContent;
    contactsListsContactsVm.loadTable = loadTable;
    contactsListsContactsVm.mdtabsSelection = {
      selectedIndex: 0
    };
    contactsListsContactsVm.onAddContacts = onAddContacts;
    contactsListsContactsVm.openSearch = openSearch;
    contactsListsContactsVm.paramFilter = {};
    contactsListsContactsVm.resetSelectedDocuments = resetSelectedDocuments;
    contactsListsContactsVm.saveContact = saveContact;
    contactsListsContactsVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    contactsListsContactsVm.selectedContacts = [];
    contactsListsContactsVm.setDropdownSelected = setDropdownSelected;
    contactsListsContactsVm.setSubmitted = setSubmitted;
    contactsListsContactsVm.showItemDetails = showItemDetails;
    contactsListsContactsVm.sortDropdownSetActive = sortDropdownSetActive;
    contactsListsContactsVm.tableApplyFilter = tableApplyFilter;
    contactsListsContactsVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
    contactsListsContactsVm.toggleSearchState = toggleSearchState;
    contactsListsContactsVm.updateContact = updateContact;

    activate();

    ////////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function activate() {
      $translatePartialLoader.addPart('contactsLists');

      contactsListsListRestService.get(contactsListsContactsVm.contactsListUuid).then(function(details) {
        contactsListsContactsVm.contactsListDetails = details;
        contactsListsContactsVm.canManage = (contactsListsContactsVm.contactsListDetails.owner.uuid === $scope.userLogged.uuid);
        contactsListsContactsVm.contactsListUuid = details.uuid;
      });

      $timeout(function() {
        if (contactsListsContactsVm.addContacts) {
          onAddContacts();
        }
      }, 0);

      loadTable();

      $translate(['CONTACTS_LISTS_DETAILS.PRIVATE', 'CONTACTS_LISTS_DETAILS.PUBLIC', 'GROWL_ALERT.WARNING.CONTACT_STILL_EXISTS'])
        .then(function(translations) {
          privateList = translations['CONTACTS_LISTS_DETAILS.PRIVATE'];
          publicList = translations['CONTACTS_LISTS_DETAILS.PUBLIC'];
          stillExists = translations['GROWL_ALERT.WARNING.CONTACT_STILL_EXISTS'];
        });

      // TODO directive to externalize this code
      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });
    }

    /**
     * @name addRecipientToCreateUsersList
     * @desc add contacts to list of new contacts to create
     * @param {Object} contact - contact to add
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function addRecipientToCreateUsersList(contact) {
      var itemsListContact = _.find(contactsListsContactsVm.itemsList, {'mail': contact.mail});
      if (_.isUndefined(itemsListContact)) {
        var newContact = {
          firstName: contact.firstName || contact.mail.substring(0, contact.mail.indexOf('@')),
          lastName: contact.lastName || '',
          mail: contact.mail,
          mailingListUuid: contactsListsContactsVm.contactsListUuid,
        };
        saveContact(newContact);
      } else {
        growlService.notifyTopRight((contact.firstName || contact.mail) + ' ' + (contact.lastName || '') + ' ' + stillExists, 'inverse');
      }
    }

    /**
     * @name addSelectedDocument
     * @desc add contacts to list of new contacts to create
     * @param {Object} document - document to add to the list of selected contactsLists
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB remove documentUtilsService and implement generic selections methods with services
    function addSelectedDocument(document) {
      documentUtilsService.selectDocument(contactsListsContactsVm.selectedContacts, document);
    }

    /**
     * @name closeSearch
     * @desc close search mode
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB : refactor with directives/services
    function closeSearch() {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }

    /**
     * @name deleteCallback
     * @desc launch deletion of contactsLists
     * @param {Array<Object>} items - contactsLists to delete
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB remove documentUtilsService and implement generic delete items methods (if possible in service)
    function deleteCallback(items) {
      _.forEach(items, function(restangularizedItem) {
        delete restangularizedItem.show;
        restangularizedItem.remove().then(function() {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.DELETE', 'inverse');
          _.remove(contactsListsContactsVm.itemsList, restangularizedItem);
          _.remove(contactsListsContactsVm.selectedContacts, restangularizedItem);
          contactsListsContactsVm.itemsListCopy = contactsListsContactsVm.itemsList; // I keep a copy of the data for the filter module
          contactsListsContactsVm.tableParams.reload();
          $scope.mainVm.sidebar.hide();
        });
      });
    }

    /**
     * @name deleteContact
     * @desc delete contacts alert
     * @param {Array<Object>} contactsListsContacts - contacts to delete
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB remove documentUtilsService and implement generic selections methods with services
    function deleteContact(contactsListsContacts) {
      documentUtilsService.deleteDocuments(contactsListsContacts, deleteCallback);
    }

    /**
     * @name loadSidebarContent
     * @desc open the right sidebar with choosen template
     * @param {String} content - name of template to display
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(contactsListsContactsVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    /**
     * @name loadTable
     * @desc Load the table
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB - refactor with service for all tables
    function loadTable() {
      contactsListsContactsVm.tableParams = new NgTableParams({
        page: 1,
        sorting: {modificationDate: 'desc'},
        count: 20,
        filter: contactsListsContactsVm.paramFilter
      }, {
        getData: function($defer, params) {
          var filteredData = [];
          switch(params.filter().operator) {
            case '||':
              _.forOwn(params.filter(), function(val, key) {
                var obj = {};
                obj[key] = val;
                if (key !== 'operator') {
                  filteredData = _.concat(filteredData, $filter('filter')(contactsListsContactsVm.itemsList, obj));
                }
              });
              filteredData = _.uniq(filteredData);
              break;
            default:
              filteredData = params.hasFilter() ? $filter('filter')(contactsListsContactsVm.itemsList, params.filter()) : contactsListsContactsVm.itemsList;
              break;
          }
          var contactsListsContacts = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(contactsListsContacts.length);
          params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
          $defer.resolve(contactsListsContacts.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    }

    /**
     * @name onAddContacts
     * @desc add contacts to list of new contacts to create
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function onAddContacts() {
      contactsListsContactsVm.mdtabsSelection.selectedIndex = 1;
      contactsListsContactsVm.loadSidebarContent(lsAppConfig.contactslistsAddContacts);
      angular.element('#focusInputShare').focus();
    }

    /**
     * @name openSearch
     * @desc focus to search input
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB : refactor in directive/service
    function openSearch() {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    }

    /**
     * @name resetSelectedDocuments
     * @desc clear the array of selected documents
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB remove documentUtilsService and implement generic selections methods with services
    function resetSelectedDocuments() {
      delete contactsListsContactsVm.tableParams.filter().isSelected;
      documentUtilsService.resetItemSelection(contactsListsContactsVm.selectedContacts);
      contactsListsContactsVm.flagsOnSelectedPages = {};
    }

    /**
     * @name saveContact
     * @desc Create contacts to a specific contactsList
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function saveContact(contact) {
      contactsListsContactsRestService.create(contactsListsContactsVm.contactsListUuid, contact).then(function(data) {
        contactsListsContactsVm.itemsList.push(data);
        growlService.notifyTopRight('GROWL_ALERT.ACTION.INSERT', 'inverse');
        contactsListsContactsVm.tableParams.sorting('modificationDate', 'desc');
        contactsListsContactsVm.tableParams.reload();
      });
    }

    /**
     * @name selectDocumentsOnCurrentPage
     * @desc Helper to select all element of the current table page
     * @param {Array<Object>} data - List of element to be selected
     * @param {Integer} page - Page number of the table
     * @param {Boolean} selectFlag - element selected or not
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB remove documentUtilsService and implement generic selections methods with services
    function selectDocumentsOnCurrentPage(data, page, selectFlag) {
      var currentPage = page || contactsListsContactsVm.tableParams.page();
      var dataOnPage = data || contactsListsContactsVm.tableParams.data;
      var select = selectFlag || contactsListsContactsVm.flagsOnSelectedPages[currentPage];
      if (!select) {
        _.forEach(dataOnPage, function(element) {
          if (!element.isSelected) {
            element.isSelected = true;
            contactsListsContactsVm.selectedContacts.push(element);
          }
        });
        contactsListsContactsVm.flagsOnSelectedPages[currentPage] = true;
      } else {
        contactsListsContactsVm.selectedContacts = _.xor(contactsListsContactsVm.selectedContacts, dataOnPage);
        _.forEach(dataOnPage, function(element) {
          if (element.isSelected) {
            element.isSelected = false;
            _.remove(contactsListsContactsVm.selectedContacts, function(n) {
              return n.uuid === element.uuid;
            });
          }
        });
        contactsListsContactsVm.flagsOnSelectedPages[currentPage] = false;
      }
    }

    /**
     * @name setDropdownSelected
     * @desc open dropdown menu
     * @param {Object} $event - event handle
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function setDropdownSelected($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).closest('ul').find('.active-check').removeClass('active-check');
      $timeout(function() {
        angular.element(currTarget).addClass('active-check');
      }, 200);
    }

    /**
     * @name setSubmitted
     * @desc description
     * @param {DOM} form - form to validate
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : guest same method to refactor
    function setSubmitted(form) {
      form.$setSubmitted();
      _.forEach(form, function(item) {
        if (item && item.$$parentForm === form && item.$setSubmitted) {
          setSubmitted(item);
        }
      });
    }

    /**
     * @name showItemDetails
     * @desc Get selected contactsList's details and open right sidebar with these details
     * @param {Object} item - contactsList
     * @param {Object} event - event handle
     * @param {Integer} whichTab - number of tab to display
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    // TODO : IAB - refactor with service
    function showItemDetails(item, event, whichTab) {
      var itemClonned = _.cloneDeep(item);
      itemClonned.displayedFirstName = _.clone(item.firstName);
      itemClonned.displayedLastName = _.clone(item.lastName);
      contactsListsContactsVm.currentSelectedDocument.current = itemClonned;
      contactsListsContactsVm.loadSidebarContent(lsAppConfig.contactslistsContact);
      contactsListsContactsVm.mdtabsSelection.selectedIndex = whichTab || 0;

      angular.element('#lastname').trigger('focus');
      if (event) {
        var currElm = event.currentTarget;
        angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
          angular.element(currElm).addClass('activeActionButton');
        });
      }
    }

    /**
     * @name sortDropdownSetActive
     * @desc change ordonnation of the table
     * @param {Object} sortField - contact to add
     * @param {Object} $event - event handle
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function sortDropdownSetActive(sortField, $event) {
      contactsListsContactsVm.toggleSelectedSort = !contactsListsContactsVm.toggleSelectedSort;
      contactsListsContactsVm.tableParams.sorting(sortField, contactsListsContactsVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }

    /**
     * @name tableApplyFilter
     * @desc Helper to apply a filter on a selection of colum
     * @param {String} filterValue - The value to use for the filters
     * @param {Array<String>} columns - The name of the column to apply the filter on
     * @param {String} operator - The filter operator
     * @memberOf LinShare.Guests.LinshareGuestsController
     */
    //TODO - IAB: refactor as utils
    function tableApplyFilter(filterValue, columns, operator) {
      _.forEach(columns, function(column) {
        contactsListsContactsVm.paramFilter[column] = filterValue;
      });
      contactsListsContactsVm.paramFilter.operator = operator ? operator : '&&';
      contactsListsContactsVm.tableParams.filter(contactsListsContactsVm.paramFilter);
      contactsListsContactsVm.tableParams.reload();
    }

    /**
     * @name toggleFilterBySelectedFiles
     * @desc isolate selected elements
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function toggleFilterBySelectedFiles() {
      if (contactsListsContactsVm.tableParams.filter().isSelected) {
        delete contactsListsContactsVm.tableParams.filter().isSelected;
      } else {
        contactsListsContactsVm.tableParams.filter().isSelected = true;
      }
    }

    /**
     * @name toggleSearchState
     * @desc open/close search input
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function toggleSearchState() {
      if (!contactsListsContactsVm.searchMobileDropdown) {
        openSearch();
      } else {
        closeSearch();
      }
      contactsListsContactsVm.searchMobileDropdown = !contactsListsContactsVm.searchMobileDropdown;
    }

    /**
     * @name updateContact
     * @desc update values of a contact
     * @param {DOM} form - form to check
     * @param {Object} contact - contact's new values
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function updateContact(form, contact) {
      if (form.$valid) {
        var contactToSave = _.cloneDeep(contact);
        delete contactToSave.displayedFirstName;
        delete contactToSave.displayedLastName;
        // TODO : IAB object returned to implement -> contactSaved
        contactsListsContactsRestService.update(contactsListsContactsVm.contactsListUuid, contactToSave).then(function() {
          contactsListsContactsVm.itemsList[_.findIndex(contactsListsContactsVm.itemsList, {'uuid': contactToSave.uuid})] = contactToSave;
          growlService.notifyTopRight('GROWL_ALERT.ACTION.UPDATE', 'inverse');
          contactsListsContactsVm.tableParams.reload();
          $scope.mainVm.sidebar.hide();
        });
      } else {
        contactsListsContactsVm.setSubmitted(form);
      }
    }
  }
})();
