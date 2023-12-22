/**
 * contactsListsListController Controller
 * @namespace LinShare.contactsLists
 */
(function() {
  'use strict';

  angular
    .module('linshare.contactsLists')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('contactsLists');
    }])
    .controller('contactsListsListController', contactsListsListController);

  contactsListsListController.$inject = [
    '_',
    '$filter',
    '$q',
    '$scope',
    '$state',
    '$timeout',
    '$transition$',
    '$translate',
    'auditDetailsService',
    'contactsListsList',
    'contactsListsListRestService',
    'contactsListsContactsRestService',
    'contactsListsService',
    'documentUtilsService',
    'functionalityRestService',
    'itemUtilsService',
    'lsAppConfig',
    'lsErrorCode',
    'moment',
    'NgTableParams',
    'toastService'
  ];

  /**
   * @namespace contactsListsListController
   * @desc Application contactsLists management system controller
   * @memberOf LinShare.contactsLists
   */
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false, maxstatements: false */
  function contactsListsListController(
    _, $filter,
    $q,
    $scope,
    $state,
    $timeout,
    $transition$,
    $translate,
    auditDetailsService,
    contactsListsList,
    contactsListsListRestService,
    contactsListsContactsRestService,
    contactsListsService,
    documentUtilsService,
    functionalityRestService,
    itemUtilsService,
    lsAppConfig,
    lsErrorCode,
    moment,
    NgTableParams,
    toastService
  ) {
    const contactsListsListVm = this;

    var
      copySuffix,
      newContactsListName,
      privateList,
      publicList,
      stillExists;

    contactsListsListVm.addSelectedDocument = addSelectedDocument;
    contactsListsListVm.canCreate = true;
    contactsListsListVm.closeSearch = closeSearch;
    contactsListsListVm.contactsListsMinePage = lsAppConfig.contactsListsMinePage;
    contactsListsListVm.contactsListsOthersPage = lsAppConfig.contactsListsOthersPage;
    contactsListsListVm.contactsToAddList = [];
    contactsListsListVm.createContactsList = createContactsList;
    contactsListsListVm.createNew = $transition$.params().createNew;
    contactsListsListVm.currentSelectedDocument = {};
    contactsListsListVm.deleteContactsList = deleteContactsList;
    contactsListsListVm.duplicateItem = duplicateItem;
    contactsListsListVm.flagsOnSelectedPages = {};
    contactsListsListVm.getDetails = getDetails;
    contactsListsListVm.getOwnerName = contactsListsService.getOwnerName;
    contactsListsListVm.getVisibility = getVisibility;
    contactsListsListVm.goToContactsListAndAddContacts = goToContactsListAndAddContacts;
    contactsListsListVm.goToContactsListTarget = goToContactsListTarget;
    contactsListsListVm.goToMineAndCreateContactsList = goToMineAndCreateContactsList;
    contactsListsListVm.isFromMyContactsLists = $transition$.params().from !== lsAppConfig.contactsListsOthersPage;
    contactsListsListVm.itemsList = contactsListsList;
    contactsListsListVm.loadSidebarContent = loadSidebarContent;
    contactsListsListVm.loadTable = loadTable;
    contactsListsListVm.mdtabsSelection = {
      selectedIndex: 0
    };
    contactsListsListVm.openSearch = openSearch;
    contactsListsListVm.paramFilter = {
      name: ''
    };
    contactsListsListVm.resetSelectedDocuments = resetSelectedDocuments;
    contactsListsListVm.renameContactsList = renameContactsList;
    contactsListsListVm.saveContacts = saveContacts;
    contactsListsListVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    contactsListsListVm.selectedContactsLists = [];
    contactsListsListVm.showItemDetails = showItemDetails;
    contactsListsListVm.sortDropdownSetActive = sortDropdownSetActive;
    contactsListsListVm.switchVisibility = switchVisibility;
    contactsListsListVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
    contactsListsListVm.toggleSearchState = toggleSearchState;
    contactsListsListVm.updateContactsListDescription = updateContactsListDescription;

    activate();

    ////////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function activate() {
      functionalityRestService.getFunctionalityParams('CONTACTS_LIST__CREATION_RIGHT').then(function(data) {
        contactsListsListVm.functionality = data;
      });

      loadTable();

      $translate.refresh().then(function() {
        $translate(['ACTION.NEW_CONTACTS_LIST',
          'CONTACTS_LISTS_ACTION.FILTER_BY.MY_LISTS',
          'CONTACTS_LISTS_ACTION.FILTER_BY.OTHER_LISTS',
          'CONTACTS_LISTS_DETAILS.PRIVATE',
          'CONTACTS_LISTS_DETAILS.PUBLIC',
          'TOAST_ALERT.WARNING.CONTACT_STILL_EXISTS',
          'ACTION.COPY_ADJ', 'TOAST_ALERT.ERROR.RENAME_CONTACTS_LIST'
        ])
          .then(function(translations) {
            newContactsListName = translations['ACTION.NEW_CONTACTS_LIST'];
            contactsListsListVm.myLists = translations['CONTACTS_LISTS_ACTION.FILTER_BY.MY_LISTS'];
            contactsListsListVm.otherLists = translations['CONTACTS_LISTS_ACTION.FILTER_BY.OTHER_LISTS'];
            contactsListsListVm.currentView =
              contactsListsListVm.isFromMyContactsLists ? contactsListsListVm.myLists : contactsListsListVm.otherLists;
            privateList = translations['CONTACTS_LISTS_DETAILS.PRIVATE'];
            publicList = translations['CONTACTS_LISTS_DETAILS.PUBLIC'];
            stillExists = translations['TOAST_ALERT.WARNING.CONTACT_STILL_EXISTS'];
            copySuffix = translations['ACTION.COPY_ADJ'];
          });
      });

      $timeout(function() {
        if (contactsListsListVm.createNew && contactsListsListVm.isFromMyContactsLists) {
          createContactsList();
        }
      }, 0);

      contactsListsListVm.fabButton = {
        actions: [{
          action: function() {
            return contactsListsListVm.isFromMyContactsLists ?
              contactsListsListVm.createContactsList() : contactsListsListVm.goToMineAndCreateContactsList();
          },
          label: 'CONTACTS_LISTS_ACTION.CREATE_CONTACTS_LIST',
          icon: 'zmdi zmdi-plus'
        }]
      };
    }
    /**
     * @name addSelectedDocument
     * @desc add contacts to list of new contacts to create
     * @param {Object} document - document to add to the list of selected contactsLists
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB - refactor - remove document service and implement generic method which manage elements selections
    function addSelectedDocument(document) {
      documentUtilsService.selectDocument(contactsListsListVm.selectedContactsLists, document);
    }

    /**
     * @name cleanString
     * @desc remove useless spaces, backspaces and indents
     * @param {String} string - string to format
     * @returns {String} Formatted string
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB add it in utils service
    function cleanString(string) {
      return string.trim().replace(/(\r\n|\n|\r)/gm, '');
    }

    /**
     * @name closeSearch
     * @desc close search mode
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB : refactor in directives/services
    function closeSearch() {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }

    /**
     * @name createContactsList
     * @desc launch creation of contactsList with new unique name
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function createContactsList() {
      if (!contactsListsListVm.isFromMyContactsLists) {
        contactsListsListVm.isFromMyContactsLists = !contactsListsListVm.isFromMyContactsLists;
      }
      var defaultNamePos = itemUtilsService.itemNumber(contactsListsListVm.itemsList.plain(), newContactsListName);
      var defaultName = defaultNamePos > 0 ? newContactsListName + ' (' + defaultNamePos + ')' : newContactsListName;

      createContactsListFunction(defaultName);
    }

    /**
     * @name createContactsListFunction
     * @desc create object contactList and add it to the table in edition mode
     * @param {String} itemName - name of the contactsList
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function createContactsListFunction(itemName) {
      if (contactsListsListVm.canCreate && contactsListsListVm.functionality.enable) {
        contactsListsListVm.paramFilter.name = '';
        var item = contactsListsListRestService.restangularize({
          name: cleanString(itemName),
          owner: _.pick($scope.userLogged, ['firstName', 'lastName', 'uuid'])
        });

        contactsListsListVm.canCreate = false;
        popDialogAndCreateContactList(item)
          .then(createdItem => {
            contactsListsListVm.itemsList.push(createdItem);
            contactsListsListVm.tableParams.sorting('modificationDate', 'desc');
            contactsListsListVm.tableParams.reload();
          })
          .finally(() => {
            contactsListsListVm.canCreate = true;
          });
      }
    }

    /**
     * @name deleteCallback
     * @desc Execute deletion of contactsLists
     * @param {Array<Object>} items - contactsLists to delete
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : show a single callback toast for multiple deleted items, and check if it needs to be plural or not
    function deleteCallback(items) {
      _.forEach(items, function(restangularizedItem) {
        restangularizedItem.remove().then(function() {
          toastService.success({key: 'TOAST_ALERT.ACTION.DELETE_SINGULAR'});
          _.remove(contactsListsListVm.itemsList, restangularizedItem);
          _.remove(contactsListsListVm.selectedContactsLists, restangularizedItem);
          contactsListsListVm.tableParams.reload().then(function(data) {
            if (data.length === 0 && contactsListsListVm.tableParams.total() > 0) {
              contactsListsListVm.tableParams.page(contactsListsListVm.tableParams.page() - 1);
              contactsListsListVm.tableParams.reload();
            };
          });
          $scope.mainVm.sidebar.hide(items);
        });
      });
    }

    /**
     * @name deleteContactsList
     * @desc delete contacts alert
     * @param {Array<Object>} contactsListsList - contactsList to delete
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function deleteContactsList(contactsListsList) {
      itemUtilsService.deleteItem(contactsListsList, itemUtilsService.itemUtilsConstant.CONTACTS_LIST, deleteCallback);
    }

    /**
     * @name duplicateItem
     * @desc duplicate contactsList with unique name (with date)
     * @param {Object} item - contactsList to duplicate
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function duplicateItem(item) {
      var newContactsListName = item.name + ' (' + copySuffix + ' ' + moment().format() + ')';

      contactsListsListRestService.duplicate(item.uuid, newContactsListName).then(function(newItem) {
        var duplicatedItem = contactsListsListRestService.restangularize({
          name: cleanString(newItem.name),
          owner: _.pick($scope.userLogged, ['firstName', 'lastName', 'uuid']),
          uuid: newItem.uuid,
          modificationDate: moment().format()
        });

        contactsListsListVm.itemsList.push(duplicatedItem);
        contactsListsListVm.tableParams.sorting('modificationDate', 'desc');
        contactsListsListVm.tableParams.reload();
      });
    }

    /**
     * @name getContactsListAudit
     * @desc Get audit details of a contactsList
     * @param {Object} contactsList - contactsList object
     * @returns {Promise} contactsList with audit details
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function getContactsListAudit(contactsList) {
      return contactsListsListRestService.getAudit(contactsList.uuid).then(function(auditData) {
        return auditData;
      }).then(function(auditData) {
        auditDetailsService.generateAllDetails($scope.userLogged.uuid, auditData.plain()).then(function(auditActions) {
          contactsListsListVm.currentSelectedDocument.current.auditActions = auditActions;
        });
      });
    }

    /**
     * @name getDetails
     * @desc show details of contactsList
     * @param {Object} item - contactsList to show with details
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function getDetails(item) {
      return contactsListsListVm.showItemDetails(item);
    }

    /**
     * @name getVisibility
     * @desc Get visibility of the contactsList (private of public)
     * @param {Object} item - contactsList
     * @returns {String} Private or public contactsList
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function getVisibility(item) {
      if (item.public) {
        return publicList;
      } else {
        return privateList;
      }
    }

    /**
     * @name goToContactsListAndAddContacts
     * @desc redirect to the contactsList and open add contacts right sidebar
     * @param {String} contactsListUuid - uuid of the selected contactsList where to add new contacts
     * @param {String} contactsListName - name of the selected contactsList where to add new contacts
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function goToContactsListAndAddContacts(contactsListUuid, contactsListName) {
      $state.go('administration.contactslists.list.contacts', {
        contactsListUuid: contactsListUuid,
        contactsListName: contactsListName,
        addContacts: true
      });
    }

    /**
     * @name goToContactsListTarget
     * @desc add contacts to list of new contacts to create
     * @param {String} contactsListUuid - uuid of contactsList where to enter
     * @param {String} contactsListName - name of contactsList where to enter
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function goToContactsListTarget(contactsListUuid, contactsListName) {
      var contactsListNameElem = $('td[uuid=' + contactsListUuid + ']').find('.file-name-disp');

      if (angular.element(contactsListNameElem).attr('contenteditable') === 'false') {
        $state.go('administration.contactslists.list.contacts', {
          contactsListUuid: contactsListUuid,
          contactsListName: contactsListName
        });
      }
    }

    /**
     * @name goToMineAndCreateContactsList
     * @desc return to "Mine" tab and launch creation of contactsList
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function goToMineAndCreateContactsList() {
      $state.go('administration.contactslists.list', {
        from: contactsListsListVm.contactsListsMinePage,
        createNew: true
      });
    }

    /**
     * @name loadSidebarContent
     * @desc open the right sidebar with choosen template
     * @param {String} content - name of template to display
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(contactsListsListVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    /**
     * @name loadTable
     * @desc Load the table
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function loadTable() {
      contactsListsListVm.tableParams = new NgTableParams({
        page: 1,
        sorting: {
          modificationDate: 'desc'
        },
        count: 20,
        filter: contactsListsListVm.paramFilter
      }, {
        getData: function(params) {
          var filteredData = [];

          switch (params.filter().operator) {
            case '||':
              _.forOwn(params.filter(), function(val, key) {
                var obj = {};

                obj[key] = val;
                if (key !== 'operator') {
                  filteredData = _.concat(filteredData, $filter('filter')(contactsListsListVm.itemsList, obj));
                }
              });
              filteredData = _.uniq(filteredData);
              break;
            default:
              filteredData = params.hasFilter() ?
                $filter('filter')(contactsListsListVm.itemsList, params.filter()) : contactsListsListVm.itemsList;
              break;
          }
          var contactsListsList = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

          params.total(contactsListsList.length);
          params.settings({
            counts: filteredData.length > 10 ? [10, 25, 50, 100] : []
          });

          return (contactsListsList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    }

    /**
     * @name openSearch
     * @desc focus to search input
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB : refactor in directive/service
    function openSearch() {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    }

    /**
     * @name renameContactsList
     * @desc switch contactsList name to edit mode
     * @param {Object} item - original contactsList
     * @param {string} itemNameElem - Name of the item in view which is in edition mode
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function renameContactsList(item) {
      // Set fromServer to true to prevent sending POST request instead of PUT request ( with duplicated contact list )
      item.fromServer = !!item.uuid;
      itemUtilsService
        .rename(item, contactsListsListRestService.update)
        .then(function(newItemDetails) {
          item = _.assign(item, newItemDetails);
          contactsListsListVm.canCreate = true;
        })
        .catch(function(response) {
          var data = response.data;

          if (data.errCode === 25001) {
            toastService.error({ key: 'TOAST_ALERT.ERROR.RENAME_CONTACTS_LIST' });
            renameContactsList(item);
          }
          if (data.errCode === lsErrorCode.CANCELLED_BY_USER) {
            if (!item.uuid) {
              var itemListIndex = _.findIndex(contactsListsListVm.itemsList, item);

              contactsListsListVm.itemsList.splice(itemListIndex, 1);
            }
            contactsListsListVm.canCreate = true;
          }
        })
        .finally(contactsListsListVm.tableParams.reload);
    }

    /**
     * @name popDialogAndCreateContactList
     * @desc pop dialog and create new contactsList
     * @param {Object} item - original contactsList
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function popDialogAndCreateContactList(item) {
      return itemUtilsService
        .enterItemName(item, 'CONTACTS_LISTS_ACTION.CREATE_NEW')
        .then(newName => contactsListsListRestService.create({
          ...item,
          name: newName
        }));
    }

    /**
     * @name resetSelectedDocuments
     * @desc clear the array of selected documents
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB remove documentUtilsService and implement generic selections methods with services
    function resetSelectedDocuments() {
      delete contactsListsListVm.tableParams.filter().isSelected;
      documentUtilsService.resetItemSelection(contactsListsListVm.selectedContactsLists);
      contactsListsListVm.flagsOnSelectedPages = {};
    }

    /*********************************************** DEAD CODE WALKING ***********************************************\
    /**
     * @name saveContacts
     * @desc Create contacts to a specific contactsList
     * @param {Boolean} duplicate - check if it is a new contactsList or a duplicata
     * @param {String} contactListUuidDestination - uuid of destination contactsList
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function saveContacts(duplicate, contactListUuidDestination) {
      var nbContacts = contactsListsListVm.contactsToAddList.length;

      contactListUuidDestination = contactListUuidDestination || contactsListsListVm.contactsListUuidAddContacts;
      _.forEach(contactsListsListVm.contactsToAddList, function(contact, index) {
        contactsListsContactsRestService.create(contactListUuidDestination, contact).then(function() {
          if (!duplicate) {
            toastService.success({key: 'TOAST_ALERT.ACTION.UPDATE'});
          }
          _.remove(contactsListsListVm.contactsToAddList, {
            mail: contact.mail
          });
          if (index + 1 === nbContacts) {
            $scope.mainVm.sidebar.hide();
          }
        }, function(error) {
          if (error.data.errCode === 45400) {
            // TODO : IAB & KLE : improve serverResponse module to allow default or custom message
            var message = contact.firstName + ' ' + contact.lastName + ' ' + stillExists;

            toastService.error({key: message});
            _.remove(contactsListsListVm.contactsToAddList, {
              mail: contact.mail
            });
          }
        });
      });
    }

    /**
     * @name selectDocumentsOnCurrentPage
     * @desc Helper to select all element of the current table page
     * @param {Array<Object>} data - List of element to be selected
     * @param {Integer} page - Page number of the table
     * @param {Boolean} selectFlag - element selected or not
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB remove documentUtilsService and implement generic selections methods with services
    function selectDocumentsOnCurrentPage(data, page, selectFlag) {
      var currentPage = page || contactsListsListVm.tableParams.page();
      var dataOnPage = data || contactsListsListVm.tableParams.data;
      var select = selectFlag || contactsListsListVm.flagsOnSelectedPages[currentPage];

      if (!select) {
        _.forEach(dataOnPage, function(element) {
          if (!element.isSelected) {
            element.isSelected = true;
            contactsListsListVm.selectedContactsLists.push(element);
          }
        });
        contactsListsListVm.flagsOnSelectedPages[currentPage] = true;
      } else {
        contactsListsListVm.selectedContactsLists = _.xor(contactsListsListVm.selectedContactsLists, dataOnPage);
        _.forEach(dataOnPage, function(element) {
          if (element.isSelected) {
            element.isSelected = false;
            _.remove(contactsListsListVm.selectedContactsLists, function(n) {
              return n.uuid === element.uuid;
            });
          }
        });
        contactsListsListVm.flagsOnSelectedPages[currentPage] = false;
      }
    }

    /**
     * @name showItemDetails
     * @desc Get selected contactsList's details and open right sidebar with these details
     * @param {Object} item - contactsList
     * @param {Object} event - event handle
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB - refactor with service
    function showItemDetails(item, event) {
      return $q.when(contactsListsListRestService.get(item.uuid)).then(function(data) {
        contactsListsListVm.currentSelectedDocument.current = data;

        return getContactsListAudit(contactsListsListVm.currentSelectedDocument.current);
      }).then(function() {
        contactsListsListVm.loadSidebarContent(lsAppConfig.contactslists);
        contactsListsListVm.mdtabsSelection.selectedIndex = 0;
        if (!_.isUndefined(event)) {
          var currElm = event.currentTarget;

          angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
            angular.element(currElm).addClass('activeActionButton');
          });
        }

        return contactsListsListVm.currentSelectedDocument.current;
      });
    }

    /**
     * @name sortDropdownSetActive
     * @desc change ordonnation of the table
     * @param {Object} sortField - contact to add
     * @param {Object} $event - event handle
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function sortDropdownSetActive(sortField, $event) {
      contactsListsListVm.toggleSelectedSort = !contactsListsListVm.toggleSelectedSort;
      contactsListsListVm.tableParams.sorting(sortField, contactsListsListVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;

      angular.element('.labeled-dropdown.open a').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }

    /**
     * @name switchVisibility
     * @desc switch visibility of contactsList (private or public)
     * @param {Object} item - contactsList to edit
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function switchVisibility(item) {
      item.public = !item.public;
      contactsListsListRestService.update(item).then(function(data) {
        contactsListsListVm.currentSelectedDocument.current = data;
        (_.find(contactsListsListVm.itemsList, {
          'uuid': data.uuid
        })).public = data.public;
        contactsListsListVm.tableParams.reload();
      });
    }

    /**
     * @name toggleFilterBySelectedFiles
     * @desc isolate selected elements
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function toggleFilterBySelectedFiles() {
      if (contactsListsListVm.tableParams.filter().isSelected) {
        delete contactsListsListVm.tableParams.filter().isSelected;
      } else {
        contactsListsListVm.tableParams.filter().isSelected = true;
      }
    }

    /**
     * @name toggleSearchState
     * @desc open/close search input
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function toggleSearchState() {
      if (!contactsListsListVm.searchMobileDropdown) {
        openSearch();
      } else {
        closeSearch();
      }
      contactsListsListVm.searchMobileDropdown = !contactsListsListVm.searchMobileDropdown;
    }

    function updateContactsListDescription(description) {
      const targetSharedSpace = _.clone(contactsListsListVm.currentSelectedDocument.current);

      contactsListsListVm.currentSelectedDocument.current.description = $translate.instant('SAVING');

      contactsListsListRestService.update({ ...targetSharedSpace, description })
        .then(() => {
          contactsListsListVm.currentSelectedDocument.current.description = description;
        })
        .catch(() => {
          contactsListsListVm.currentSelectedDocument.current.description = targetSharedSpace.description;
        });
    }
  }
})();
