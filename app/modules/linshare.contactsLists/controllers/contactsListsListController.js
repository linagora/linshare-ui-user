/**
 * contactsListsListController Controller
 * @namespace LinShare.contactsLists
 */
(function() {
  'use strict';

  angular
    .module('linshare.contactsLists')
    .controller('contactsListsListController', contactsListsListController);

  contactsListsListController.$inject = ['$filter', '$scope', '$state', '$stateParams', '$timeout', '$translate',
    '$translatePartialLoader', 'contactsListsList', 'contactsListsListRestService',
    'contactsListsContactsRestService', 'contactsListsService', 'createNew', 'documentUtilsService', 'growlService',
    'lsAppConfig', 'NgTableParams'];

  /**
   * @namespace contactsListsListController
   * @desc Application contactsLists management system controller
   * @memberOf LinShare.contactsLists
   */
  function contactsListsListController($filter, $scope, $state, $stateParams, $timeout, $translate,
                                       $translatePartialLoader, contactsListsList,
                                       contactsListsListRestService, contactsListsContactsRestService,
                                       contactsListsService, createNew, documentUtilsService, growlService,
                                       lsAppConfig, NgTableParams) {

    /* jshint validthis:true */
    var contactsListsListVm = this;

    var
      copySuffix,
      newContactsListName,
      privateList,
      publicList,
      stillExists;

    contactsListsListVm.addSelectedDocument = addSelectedDocument;
    contactsListsListVm.closeSearch = closeSearch;
    contactsListsListVm.contactsListsMinePage = lsAppConfig.contactsListsMinePage;
    contactsListsListVm.contactsListsOthersPage = lsAppConfig.contactsListsOthersPage;
    contactsListsListVm.contactsToAddList = [];
    contactsListsListVm.createContactsList = createContactsList;
    contactsListsListVm.createNew = createNew;
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
    contactsListsListVm.isFromMyContactsLists = ($stateParams.from === lsAppConfig.contactsListsMinePage);
    contactsListsListVm.itemsList = contactsListsList;
    contactsListsListVm.loadSidebarContent = loadSidebarContent;
    contactsListsListVm.loadTable = loadTable;
    contactsListsListVm.mdtabsSelection = {
      selectedIndex: 0
    };
    contactsListsListVm.openSearch = openSearch;
    contactsListsListVm.paramFilter = {};
    contactsListsListVm.resetSelectedDocuments = resetSelectedDocuments;
    contactsListsListVm.renameContactsList = renameContactsList;
    contactsListsListVm.saveContacts = saveContacts;
    contactsListsListVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    contactsListsListVm.selectedContactsLists = [];
    contactsListsListVm.setDropdownSelected = setDropdownSelected;
    contactsListsListVm.setElemToEditable = setElemToEditable;
    contactsListsListVm.showItemDetails = showItemDetails;
    contactsListsListVm.sortDropdownSetActive = sortDropdownSetActive;
    contactsListsListVm.switchVisibility = switchVisibility;
    contactsListsListVm.tableApplyFilter = tableApplyFilter;
    contactsListsListVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
    contactsListsListVm.toggleSearchState = toggleSearchState;

    activate();

    ////////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function activate() {
      $translatePartialLoader.addPart('contactsLists');

      loadTable();

      $translate.refresh().then(function() {
        $translate(['ACTION.NEW_CONTACTS_LIST',
          'CONTACTS_LISTS_ACTION.FILTER_BY.MY_LISTS',
          'CONTACTS_LISTS_ACTION.FILTER_BY.OTHER_LISTS',
          'CONTACTS_LISTS_DETAILS.PRIVATE',
          'CONTACTS_LISTS_DETAILS.PUBLIC',
          'GROWL_ALERT.WARNING.CONTACT_STILL_EXISTS',
          'ACTION.COPY_ADJ'])
          .then(function(translations) {
            newContactsListName = translations['ACTION.NEW_CONTACTS_LIST'];
            contactsListsListVm.myLists = translations['CONTACTS_LISTS_ACTION.FILTER_BY.MY_LISTS'];
            contactsListsListVm.otherLists = translations['CONTACTS_LISTS_ACTION.FILTER_BY.OTHER_LISTS'];
            contactsListsListVm.currentView = contactsListsListVm.isFromMyContactsLists ? contactsListsListVm.myLists : contactsListsListVm.otherLists;
            privateList = translations['CONTACTS_LISTS_DETAILS.PRIVATE'];
            publicList = translations['CONTACTS_LISTS_DETAILS.PUBLIC'];
            stillExists = translations['GROWL_ALERT.WARNING.CONTACT_STILL_EXISTS'];
            copySuffix = translations['ACTION.COPY_ADJ'];
          });
      });

      $timeout(function() {
        if(contactsListsListVm.createNew && contactsListsListVm.isFromMyContactsLists) {
          createContactsList();
        }
      }, 0);

      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });
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
     * @name copyAllContacts
     * @desc add all contacts from source contactsList to the duplicated contactsList
     * @param {String} contactsListUuidSource - uuid of source contactsList
     * @param {String} contactListUuidDestination - uuid of destination contactsList
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function copyAllContacts(contactsListUuidSource, contactListUuidDestination) {
      contactsListsContactsRestService.getList(contactsListUuidSource).then(function(success) {
        contactsListsListVm.contactsToAddList = success;
        saveContacts(true, contactListUuidDestination);
        growlService.notifyTopRight('GROWL_ALERT.ACTION.UPDATE', 'inverse');
      });
    }

    /**
     * @name createContactsList
     * @desc launch creation of contactsList with new unique name
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function createContactsList() {
      if(!contactsListsListVm.isFromMyContactsLists) {
        contactsListsListVm.isFromMyContactsLists = !contactsListsListVm.isFromMyContactsLists;
      }
      var defaultNamePos = itemNumber(contactsListsListVm.itemsList.plain());
      var defaultName = defaultNamePos !== null ? newContactsListName + ' (' + defaultNamePos + ')' : newContactsListName;
      createContactsListFunction(defaultName);
    }

    /**
     * @name createContactsListFunction
     * @desc create object contactList and add it to the table in edition mode
     * @param {String} itemName - name of the contactsList
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function createContactsListFunction(itemName) {
      var item = {
        name: cleanString(itemName),
        uuid: Math.random().toString(36).substring(7),
        owner: $scope.userLogged,
        show: true
      };
      contactsListsListVm.itemsList.push(item);
      contactsListsListVm.tableParams.sorting('modificationDate', 'desc');
      contactsListsListVm.tableParams.reload();
      $timeout(function() {
        renameContactsList(item, true);
      }, 0);
    }

    /**
     * @name deleteCallback
     * @desc launch deletion of contactsLists
     * @param {Array<Object>} items - contactsLists to delete
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB remove documentUtilsService and implement generic delete items methods (if possible in service)
    function deleteCallback(items) {
      _.forEach(items, function(restangularizedItem) {
        restangularizedItem.remove().then(function() {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.DELETE', 'inverse');
          _.remove(contactsListsListVm.itemsList, restangularizedItem);
          _.remove(contactsListsListVm.selectedContactsLists, restangularizedItem);
          contactsListsListVm.tableParams.reload();
        });
      });
    }

    /**
     * @name deleteContactsList
     * @desc delete contacts alert
     * @param {Array<Object>} contactsListsList - contactsList to delete
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB remove documentUtilsService and implement generic delete items methods (if possible in service)
    function deleteContactsList(contactsListsList) {
      documentUtilsService.deleteDocuments(contactsListsList, deleteCallback);
    }

    /**
     * @name duplicateItem
     * @desc duplicate contactsList with unique name (with date)
     * @param {Object} item - contactsList to duplicate
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function duplicateItem(item) {
      var itemCopy = _.clone(item);
      itemCopy.name = itemCopy.name + ' (' + copySuffix + ' ' + moment().format() + ')';
      itemCopy.owner = $scope.userLogged;
      saveNewItem(itemCopy, true);
    }

    /**
     * @name getDetails
     * @desc show details of contactsList
     * @param {Object} item - contactsList to show with details
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB remove documentUtilsService and implement own method
    function getDetails(item) {
      return documentUtilsService.getItemDetails(contactsListsListRestService, item);
    }

    /**
     * @name getVisibility
     * @desc Get visibility of the contactsList (private of public)
     * @param {Object} item - contactsList
     * @returns {String} Private or public contactsList
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function getVisibility(item) {
      if(item.public) {
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
      $state.go('administration.contactslists.contacts', {
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
        $state.go('administration.contactslists.contacts', {
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
      $state.go('administration.contactslists', {from: contactsListsListVm.contactsListsMinePage, createNew: true});
    }

    /**
     * @name itemNotExits
     * @desc check if contactsList exists
     * @param {Array<Object>} items - list of contactsLists to look over
     * @param {String} newName - name to check
     * @param {object} newItem - new contactsList to compare
     * @returns {Boolean} if exists or not
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function itemNotExits(items, newName, newItem) {
      var notExists = true;
      var itemsList = _.clone(items);
      if(newItem) {
        itemsList.pop();
      }
      _.forEach(itemsList, function(item) {
        if(item.owner.uuid === $scope.userLogged.uuid && item.name.toLowerCase() === newName.toLowerCase()) {
          notExists = false;
        }
      });
      return notExists;
    }

    /**
     * @name itemNumber
     * @desc Check all "new contactsList (x)" where x is the number of the biggest value +1, or missing value
              Exemple 1 : if 1, 2 and 3 exist, the next string will be => New contactsList (4),
              Exemple 2 : if 1, 2 ,4 exist the value of the next string will be => New contactsList (3), because 3 is missing
     * @param {Array<Object>} items - contactsLists
     * @returns {integer} number of new item name
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function itemNumber(items) {
      if(items.length === 0 || !_.some(items, {name: newContactsListName})) {
        return null;
      } else {
        var iteration = 1;
        var contactsListsIndex = [];
        var regex = new RegExp('^' + newContactsListName + ' \\([0-9]+\\)');
        _.forEach(items, function(item) {
          if(item.name !== newContactsListName + ' (0)' && regex.test(item.name)) {
            contactsListsIndex.push(parseInt(item.name.replace(/\D/g, '')));
          }
        });
        contactsListsIndex = _.sortBy(contactsListsIndex, function(val) {
          return val;
        });
        _.forEach(contactsListsIndex, function(index, key) {
          if(index === key + 1) {
            iteration++;
          } else {
            return iteration;
          }
        });
        return iteration;
      }
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
        sorting: {modificationDate: 'desc'},
        count: 20,
        filter: contactsListsListVm.paramFilter
      }, {
        getData: function($defer, params) {
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
              filteredData = params.hasFilter() ? $filter('filter')(contactsListsListVm.itemsList, params.filter()) : contactsListsListVm.itemsList;
              break;
          }
          var contactsListsList = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(contactsListsList.length);
          params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
          $defer.resolve(contactsListsList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
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
     * @name removeUnpersistedContactsLists
     * @desc remove all contactsLists which are not saved in database
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function removeUnpersistedContactsLists() {
      _.forEach(contactsListsListVm.itemsList, function(item) {
        if(!_.isUndefined(item) && !item.modificationDate) {
          _.remove(contactsListsListVm.itemsList, item);
        }
      });
    }

    /**
     * @name renameContactsList
     * @desc switch contactsList name to edit mode
     * @param {Object} item - original contactsList
     * @param {Object} newItem - contactsList with new name
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function renameContactsList(item, newItem) {
      var itemNameElem = $('td[uuid=' + item.uuid + ']').find('.file-name-disp');
      contactsListsListVm.setElemToEditable(itemNameElem, item, newItem);
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

    /**
     * @name saveContacts
     * @desc Create contacts to a specific contactsList
     * @param {Boolean} duplicate - check if it is a new contactsList or a duplicata
     * @param {String} contactListUuidDestination - uuid of destination contactsList
     * @returns {Promise} Response of the server
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function saveContacts(duplicate, contactListUuidDestination) {
      var errorOccured = false;
      var nbContacts = contactsListsListVm.contactsToAddList.length;
      contactListUuidDestination = contactListUuidDestination || contactsListsListVm.contactsListUuidAddContacts;
      _.forEach(contactsListsListVm.contactsToAddList, function(contact, index) {
        contactsListsContactsRestService.create(contactListUuidDestination, contact).then(function() {
          if(!duplicate) {
            growlService.notifyTopRight('GROWL_ALERT.ACTION.UPDATE', 'inverse');
          }
          _.remove(contactsListsListVm.contactsToAddList, {
            mail: contact.mail
          });
          if(index+1 === nbContacts) {
            $scope.mainVm.sidebar.hide();
          }
        }, function(error) {
          if(error.data.errCode === 45400) {
            // TODO : IAB & KLE : improve serverResponse module to allow default or custom message
            growlService.notifyTopRight(contact.firstName + ' ' + contact.lastName + ' ' + stillExists, 'inverse');
            _.remove(contactsListsListVm.contactsToAddList, {
              mail: contact.mail
            });
          }
          errorOccured = true;
        });
      });
    }

    /**
     * @name saveNewItem
     * @desc persist new contactsList to database
     * @param {Object} item - contactsList to save
     * @param {Boolean} duplicate - is launched from new contactsList or duplicata
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function saveNewItem(item, duplicate) {
      contactsListsListRestService.create({name: cleanString(item.name)}).then(function(data) {
        removeUnpersistedContactsLists();
        if(duplicate) {
          copyAllContacts(item.uuid, data.uuid);
        }
        contactsListsListVm.itemsList.push(data);
        contactsListsListVm.tableParams.reload();
      }, function(error) {
        if(error) {
          removeUnpersistedContactsLists();
          contactsListsListVm.tableParams.reload();
        }
        return null;
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
      if(!select) {
        _.forEach(dataOnPage, function(element) {
          if(!element.isSelected) {
            element.isSelected = true;
            contactsListsListVm.selectedContactsLists.push(element);
          }
        });
        contactsListsListVm.flagsOnSelectedPages[currentPage] = true;
      } else {
        contactsListsListVm.selectedContactsLists = _.xor(contactsListsListVm.selectedContactsLists, dataOnPage);
        _.forEach(dataOnPage, function(element) {
          if(element.isSelected) {
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
     * @name setDropdownSelected
     * @desc open dropdown menu
     * @param {Object} $event - event handle
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB : directive to externalize this code
    function setDropdownSelected($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).closest('ul').find('.active-check').removeClass('active-check');
      $timeout(function() {
        angular.element(currTarget).addClass('active-check');
      }, 200);
    }

    /**
     * @name setElemToEditable
     * @desc Set element to editable in the table to change name
     * @param {String} idElem - uuid of selected contactsList (also DOM's element's id)
     * @param {Object} data - selected contactsList
     * @param {Boolean} isNewItem -
     * @returns {Null}
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    // TODO : IAB - refactor - directives and services
    function setElemToEditable(idElem, data, isNewItem) {
      var initialName = newContactsListName;
      var enterKeyPressed = false;
      angular.element(idElem).attr('contenteditable', 'true')
        .on('focus', function() {
          document.execCommand('selectAll', false, null);
          initialName = data.name;
        })
        .on('focusout', function() {
          if(isNewItem || cleanString(data.name) !== cleanString(idElem[0].textContent)) {
            if(itemNotExits(contactsListsListVm.itemsList.plain(), cleanString(idElem[0].textContent), isNewItem)) {
              data.name = cleanString(idElem[0].textContent);
              if(cleanString(data.name) === '') {
                angular.element(idElem).text(initialName);
                data.name = cleanString(initialName);
              }
              if(isNewItem && !enterKeyPressed) {
                saveNewItem(data);
              } else if(!isNewItem && data.name !== initialName) {
                contactsListsListRestService.update(data).then(function() {
                }, function(error) {
                  data.name = initialName;
                  if(error.errCode === 25001) {
                    growlService.notifyTopRight('GROWL_ALERT.ERROR.RENAME_CONTACTS_LIST', 'danger');
                  }
                });
              }
              angular.element(this).attr('contenteditable', 'false');
            } else {
              data.name = initialName;
              removeUnpersistedContactsLists();
              if(isNewItem) {
                saveNewItem(data);
              }
              growlService.notifyTopRight('GROWL_ALERT.ERROR.RENAME_CONTACTS_LIST', 'danger');
              angular.element(idElem).text(cleanString(initialName));
              angular.element(this).attr('contenteditable', 'false');
            }
          } else {
            return null;
          }
          return null;
        })
        .on('keydown', function(e) {
          if(e.which === 27 || e.keyCode === 27) {
            if(isNewItem) {
              _.remove(contactsListsListVm.itemsList, {
                uuid: data.uuid
              });
              contactsListsListVm.tableParams.reload();
              return null;
            } else {
              data.name = cleanString(initialName);
              angular.element(idElem).text(cleanString(initialName));
              angular.element(this).attr('contenteditable', 'false');
            }
            return null;
          } else if(e.which === 13) {
            enterKeyPressed = true;
            if(isNewItem || cleanString(data.name) !== cleanString(idElem[0].textContent)) {
              if(itemNotExits(contactsListsListVm.itemsList.plain(), cleanString(idElem[0].textContent), isNewItem)) {
                data.name = cleanString(idElem[0].textContent);
                if(cleanString(data.name) === initialName || cleanString(data.name) === '') {
                  angular.element(idElem).text(initialName);
                  data.name = cleanString(initialName);
                }
                if(isNewItem) {
                  saveNewItem(data);
                } else if(!isNewItem && data.name !== initialName) {
                  contactsListsListRestService.update(data).then(function() {
                  }, function(error) {
                    data.name = initialName;
                    if(error.errCode === 25001) {
                      growlService.notifyTopRight('GROWL_ALERT.ERROR.RENAME_CONTACTS_LIST', 'danger');
                    }
                  });
                }
                angular.element(this).attr('contenteditable', 'false');
              } else {
                data.name = cleanString(initialName);
                removeUnpersistedContactsLists();
                if(isNewItem) {
                  saveNewItem(data);
                }
                growlService.notifyTopRight('GROWL_ALERT.ERROR.RENAME_CONTACTS_LIST', 'danger');
                angular.element(idElem).text(cleanString(initialName));
                angular.element(this).attr('contenteditable', 'false');
              }
            } else {
              return null;
            }
            return null;
          }
        });
      angular.element(idElem).focus();
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
      contactsListsListRestService.get(item.uuid).then(function(data) {
        contactsListsListVm.currentSelectedDocument.current = data;
        contactsListsListVm.loadSidebarContent(lsAppConfig.contactslists);
        contactsListsListVm.mdtabsSelection.selectedIndex = 0;
      });

      var currElm = event.currentTarget;
      angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
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
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
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
        (_.find(contactsListsListVm.itemsList, {'uuid': data.uuid})).public = data.public;
        contactsListsListVm.tableParams.reload();
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
      _.forEach(columns, function(column)  {
        contactsListsListVm.paramFilter[column] = filterValue;
      });
      contactsListsListVm.paramFilter.operator = operator ? operator : '&&';
      contactsListsListVm.tableParams.filter(contactsListsListVm.paramFilter);
      contactsListsListVm.tableParams.reload();
    }

    /**
     * @name toggleFilterBySelectedFiles
     * @desc isolate selected elements
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function toggleFilterBySelectedFiles() {
      if(contactsListsListVm.tableParams.filter().isSelected) {
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
      if(!contactsListsListVm.searchMobileDropdown) {
        openSearch();
      } else {
        closeSearch();
      }
      contactsListsListVm.searchMobileDropdown = !contactsListsListVm.searchMobileDropdown;
    }
  }
})();
