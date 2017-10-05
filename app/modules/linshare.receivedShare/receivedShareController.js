/**
 * @author Alpha O. Sall
 */

'use strict';

angular.module('linshare.receivedShare')
  // TODO: Should dispatch some function to other service or controller in order to valid the maxparams linter
  /* jshint maxparams: false, maxstatements: false */
  .controller('ReceivedController',
    function(_, $filter, $log, $scope, $q, $state, $timeout, $translate, $translatePartialLoader, $window,
      auditDetailsService, authenticationRestService, autocompleteUserRestService, browseService, documentSelected,
      documentUtilsService, files, lsAppConfig, NgTableParams, receivedShareRestService, swal, toastService) {
      $translatePartialLoader.addPart('receivedShare');
      $scope.documentSelected = documentSelected;
      $scope.multiDownload = multiDownload;
      $scope.openBrowser = openBrowser;
      $scope.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;
      $scope.datasIsSelected = false;
      $scope.advancedFilterBool = false;
      $scope.showActions = [];
      $scope.filters = {};
      $scope.showDateRangeStart = false;
      $scope.filters.dateStart = '';
      $scope.filters.dateEnd = '';
      $scope.showUnit = true;
      var initDestinataireObject = {
        firstName: '',
        mail: '',
        lastName: ''
      };
      $scope.selectedDocuments = [];
      $scope.filters.selectedContact = initDestinataireObject;
      $scope.selectedRecipient = {};
      var checkdatasIsSelecteds = function() {
        /* jshint undef: false */
        if ($scope.showActions.length !== $scope.showActions.length !== 0) {
          $scope.datasIsSelected = false;
        }
      };
      var setExtensions = function(list) {
        var data = [];
        var type = [
          {regex: /pdf/, image: 'fa-file-pdf-o', info: 'PDF'},
          {regex: /image/, image: 'fa-file-image-o', info: 'IMAGE'},
          {regex: /audio/, image: 'fa-file-audio-o', info: 'AUDIO'},
          {regex: /video/, image: 'fa-file-video-o', info: 'VIDEO'},
          {regex: /powerpoint/, image: 'fa-file-powerpoint-o', info: 'POWERPOINT'},
          {regex: /word/, image: 'fa-file-word-o', info: 'WORD'},
          {regex: /zip|tar|compressed/, image: 'fa-file-archive-o', info: 'ARCHIVE'},
          {regex: /excel/, image: 'fa-file-excel-o', info: 'EXCEL'},
          {regex: /text\/plain/, image: 'fa-file-text-o', info: 'TEXT'},
          {regex: /text/, image: 'fa-file-code-o', info: 'CODE'}
        ];
        _.forEach(list, function(value) {
          _.forEach(type, function(regex) {
            if (value.type.match(regex.regex)) {
              value.typeImage = regex.image;
              value.info = regex.info;
            }
          });
          if (!value.typeImage) {
            value.typeImage = 'fa-file-text-o';
            value.info = 'TEXT';
          }
          data.push(value);
        });
        return data;
      };
      var receivedFiles = setExtensions(files);
      // Used to check/activate the checkbox related to the params
      $scope.paramsIsActivate = function(param) {
        return param > 0;
      };

      $scope.clearParams = clearParams;

      authenticationRestService.getCurrentUser().then(function(data) {
        $scope.canUpload = data.canUpload;
      });

      function clearParams() {
        $scope.filters.sizeStart = null;
        $scope.filters.sizeEnd = null;
        $scope.filters.unity = '1000';
        $scope.filters.dateType = '1';
        $scope.filters.dateStart = '';
        $scope.filters.dateEnd = '';
        $scope.showUnit = true;
        $scope.filters.selectedContact = initDestinataireObject;
        $scope.popoverValue = '';
        $scope.selectedRecipient = '';
        $scope.showDateRange = true;
        $scope.tableParams.reload();
      }

      $scope.updateParams = updateParams;

      function updateParams() {
        $scope.tableParams.reload();
        checkdatasIsSelecteds();
      }

      var swalMultipleDownloadTitle, swalMultipleDownloadCancel, swalMultipleDownloadConfirm;

      $translate([
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CANCEL_BUTTON'
      ]).then(function(translations) {
        swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
        swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
        swalMultipleDownloadCancel = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CANCEL_BUTTON'];
      });

    /**
     *  @name downloadFile
     *  @desc Download a file of a document for the user
     *  @param {Object) documentFile - A document object
     *  @memberOf LinShare.receivedShare.receivedShareController
     */
      $scope.downloadFile = function(documentFile) {
        var url = receivedShareRestService.download(documentFile.uuid);
        documentUtilsService.download(url, documentFile.name);
      };

      /**
       * @name downloadSelectedFiles
       * @desc Download selected files
       * @param {Array<Object>} selectedDocuments - List of selected documents
       * @memberOf LinShare.receivedShare.receivedShareController
       */
      function downloadSelectedFiles(selectedDocuments) {
        _.forEach(selectedDocuments, function(document) {
          $scope.downloadFile(document);
        });
      }

      $scope.resetSelectedDocuments = function() {
        $scope.activeBtnShowSelection = !$scope.activeBtnShowSelection;
        delete $scope.tableParams.filter().isSelected;
        angular.forEach($scope.selectedDocuments, function(selectedDoc) {
          selectedDoc.isSelected = false;
        });
        $scope.selectedDocuments = [];
        $scope.flagsOnSelectedPages = {};
      };

      $scope.loadSidebarContent = loadSidebarContent;

     /**
      * @name loadSidebarContent
      * @desc Update the content of the sidebar
      * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html
      * for possible values
      */
      function loadSidebarContent(content) {
        $scope.mainVm.sidebar.setData($scope);
        $scope.mainVm.sidebar.setContent(content || lsAppConfig.share);
        $scope.mainVm.sidebar.show();
      }

      $scope.currentSelectedDocument = {current: ''};
      $scope.flagsOnSelectedPages = {};
      var initFlagsOnSelectedPages = function() {
        $scope.flagsOnSelectedPages = {};
      };
      $scope.selectDocumentsOnCurrentPage = function(data, page, selectFlag) {
        var currentPage = page || $scope.tableParams.page();
        var dataOnPage = data || $scope.tableParams.data;
        var select = selectFlag || $scope.flagsOnSelectedPages[currentPage];
        if (!select) {
          angular.forEach(dataOnPage, function(element) {
            if (!element.isSelected) {
              element.isSelected = true;
              $scope.selectedDocuments.push(element);
            }
          });
          $scope.flagsOnSelectedPages[currentPage] = true;
        } else {
          $scope.selectedDocuments = _.xor($scope.selectedDocuments, dataOnPage);
          angular.forEach(dataOnPage, function(element) {
            if (element.isSelected) {
              element.isSelected = false;
              _.remove($scope.selectedDocuments, function(n) {
                return n.uuid === element.uuid;
              });
            }
          });
          $scope.flagsOnSelectedPages[currentPage] = false;
        }
      };

      $scope.showCurrentFile = function(currentFile, event) {
        return $q(function(resolve) {
          $scope.currentSelectedDocument.current = currentFile;
          if (currentFile.shared > 0) {
            receivedShareRestService.get(currentFile.uuid).then(function(data) {
              $scope.currentSelectedDocument.current.shares = data.shares;
            });
          }

          documentUtilsService.loadItemThumbnail($scope.currentSelectedDocument.current,
            receivedShareRestService.thumbnail($scope.currentSelectedDocument.current.uuid));

          resolve($scope.currentSelectedDocument.current);

          getReceivedShareAudit($scope.currentSelectedDocument.current).then(function() {
            $scope.loadSidebarContent(lsAppConfig.details);
            if (!_.isUndefined(event)) {
              var currElm = event.currentTarget;
              angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
                angular.element(currElm).addClass('activeActionButton');
              });
            }
          });
        });
      };

      /**
       * @name getReceivedShareAudit
       * @desc Get audit details of a receivedShare object
       * @param {Object} receivedShare - receivedShare object
       * @returns {Promise} receivedShare object with audit details
       * @memberOf LinShare.receivedShare.receivedShareController
       */
      function getReceivedShareAudit(receivedShare) {
        return receivedShareRestService.getAudit(receivedShare.uuid).then(function(auditData) {
          return auditData;
        }).then(function(auditData) {
          auditDetailsService.generateAllDetails($scope.userLogged.uuid, auditData.plain())
            .then(function(auditActions) {
              $scope.currentSelectedDocument.current.auditActions = auditActions;
            });
        });
      }

      $scope.copyIntoFiles = function(selectedDocuments) {
        if (!$scope.canUpload) {
          return;
        }
        if (!_.isArray(selectedDocuments)) {
          selectedDocuments = [selectedDocuments];
        }
        _.forEach(selectedDocuments, function(file) {
          receivedShareRestService.copy(file.uuid);
        });
      };

      /**
       * @name openBrowser
       * @desc Open browser of folders to copy documents
       * @param {Array<Object>} documents - Documents to copy
       * @memberOf LinShare.receivedShare.ReceivedController
       */
      function openBrowser(documents) {
        browseService.show({
          nodeItems: documents,
          isMove: false,
          kind: 'RECEIVED_SHARE'
        }).then(function(data) {
          if (data.failedNodes.length) {
            notifyBrowseActionError(data);
          } else {
            notifyBrowseActionSuccess(data);
          }
        });
      }

      /**
       * @name notifyBrowseActionError
       * @desc Notify when an error occurred on copy documents
       * @param {object} data - mdDialog's close datas
       * @memberOf LinShare.receivedShare.ReceivedController
       */
      function notifyBrowseActionError(data) {
        var responses = [];
        _.forEach(data.failedNodes, function(error) {
          switch(error.data.errCode) {
            case 26444 :
              responses.push({
                'title': error.nodeItem.name,
                'message': {key: 'TOAST_ALERT.ERROR.COPY.26444'}
              });
              break;
            case 26445 :
            case 28005 :
              responses.push({
                'title': error.nodeItem.name,
                'message': {key: 'TOAST_ALERT.ERROR.RENAME_NODE'}
              });
              break;
          }
        });

        toastService.error({
          key: 'TOAST_ALERT.ERROR.BROWSER_ACTION',
          pluralization: true,
          params: {
            action: '',
            nbNodes: data.failedNodes.length,
            singular: data.failedNodes.length === 1 ? 'true' : ''
          }
        }, undefined, responses.length ? responses : undefined);
      }

      /**
       * @name notifyBrowseActionSuccess
       * @desc Notify success on copy documents
       * @param {object} data - mdDialog's close datas
       * @memberOf LinShare.receivedShare.ReceivedController
       */
      function notifyBrowseActionSuccess(data) {
        toastService.success({
          key: 'TOAST_ALERT.ACTION.BROWSER_ACTION',
          pluralization: true,
          params: {
            singular: data.nodeItems.length <= 1 ? 'true' : '',
            action: '',
            folderName: data.folder.name
          }
        }, 'TOAST_ALERT.ACTION_BUTTON').then(function(response) {
          if (!_.isUndefined(response)) {
            if (response.actionClicked) {
              var nodeToSelectUuid = data.nodeItems.length === 1 ? data.nodeItems[0].uuid : null;
              var routeStateSuffix = data.folder.parent === data.folder.workGroup ? 'root' : 'folder';
              $state.go('sharedspace.workgroups.' + routeStateSuffix, {
                workgroupUuid: data.folder.workGroup,
                workgroupName: data.folder.workgroupName,
                parentUuid: data.folder.parent,
                folderUuid: data.folder.uuid,
                folderName: data.folder.name,
                uploadedFileUuid: nodeToSelectUuid
              });
            }
          }
        });
      }

      /**
       * @name multiDownload
       * @desc Prompt dialog to warn about multi download
       * @memberOf LinShare.document.documentController
       */
      function multiDownload() {
        if ($scope.selectedDocuments.length > 10) {
          $translate('SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT', {
            nbFiles: $scope.selectedDocuments.length,
            totalSize: $filter('readableSize')(_.sumBy($scope.selectedDocuments, 'size'), true)
          }).then(function(swalText) {
            swal({
                title: swalMultipleDownloadTitle,
                text: swalText,
                type: 'error',
                showCancelButton: true,
                confirmButtonText: swalMultipleDownloadConfirm,
                cancelButtonText: swalMultipleDownloadCancel,
                closeOnConfirm: true,
                closeOnCancel: true
              },
              function(isConfirm) {
                if (isConfirm) {
                  downloadSelectedFiles($scope.selectedDocuments);
                }
              });
          });
        } else {
          downloadSelectedFiles($scope.selectedDocuments);
        }
      }

      $scope.sortDropdownSetActive = function(sortField, $event) {
        $scope.toggleSelectedSort = !$scope.toggleSelectedSort;
        $scope.tableParams.sorting(sortField, $scope.toggleSelectedSort ? 'desc' : 'asc');
        var currTarget = $event.currentTarget;
        angular.element('.labeled-dropdown.open a').removeClass('selected-sorting').promise().done(function() {
          angular.element(currTarget).addClass('selected-sorting');
        });
      };

      $scope.setShowActions = setShowActions;

      // onChange on the inputs in the table
      // Insert or remove the file in the list of selected files
      function setShowActions(documentFile) {
        var exist = false;
        // check if document isset in the array
        angular.forEach($scope.showActions, function(file, key) {
          if (file.uuid === documentFile.uuid) {
            exist = key;
          }
        });
        if (documentFile.isChecked && !exist) {
          $scope.showActions.push(documentFile);
        } else if (!documentFile.isChecked && exist >= 0) {
          if (exist > -1) {
            $scope.showActions.splice(exist, 1);
          }
        }
      }

      $scope.selectAll = selectAll;

      // Used by the template to select all data in the table
      // Only in the current page of the pagination table
      function selectAll() {
        $scope.showActions = [];
        $scope.datasIsSelected = !$scope.datasIsSelected;
        _.forEach(
          $scope.tableData.slice(($scope.tableParams.$params.page - 1) * $scope.tableParams.$params.count,
            $scope.tableParams.$params.page * $scope.tableParams.$params.count),
          function(file, key) {
            $scope.tableData[key].isChecked = $scope.datasIsSelected;
            if ($scope.datasIsSelected) {
              file.isChecked = true;
              $scope.showActions.push(file);
            }
          });
      }
      // When the page changed check / uncheck
      // the checkbox in the filter template
      // if one data in the table is checked the checkboxe is also checked
      $scope.$watch('tableParams.$params.page', function() {
        var isSelected = true;
        if ($scope.tableData) {
          angular.forEach(
            $scope.tableData.slice(($scope.tableParams.$params.page - 1) * $scope.tableParams.$params.count,
              $scope.tableParams.$params.page * $scope.tableParams.$params.count),
            function(file) {
              if (!file.isChecked) {
                isSelected = false;
              }
            });

          $scope.datasIsSelected = isSelected;
        }
      });

      $scope.paramFilter = {
        name: ''
      };

      loadTable().then(function(data) {
        $scope.tableParams = data;
        if (_.isUndefined($scope.documentSelected)) {
          toastService.error({key: 'TOAST_ALERT.ERROR.FILE_NOT_FOUND'});
        }
        else if ($scope.documentSelected !== null ) {
          toastService.isolate({key: 'TOAST_ALERT.WARNING.ISOLATED_FILE'});
          $scope.addSelectedDocument($scope.documentSelected);
          $scope.toggleFilterBySelectedFiles();
          if (!$scope.isMobile) {
            $scope.showCurrentFile($scope.documentSelected);
          }
        }
      });

      function toggleFilterBySelectedFiles() {
        $scope.activeBtnShowSelection = !$scope.activeBtnShowSelection;
        if ($scope.tableParams.filter().isSelected) {
          delete $scope.tableParams.filter().isSelected;
        } else {
          $scope.tableParams.filter().isSelected = true;
        }
      }


      function loadTable() {
        return $q(function(resolve) {
          resolve(
            new NgTableParams({
              page: 1,
              sorting: {
                modificationDate: 'desc'
              },
              count: 25,
              filter: $scope.paramFilter
            }, {
              getData: function(params) {
                var filteredData = params.filter() ?
                  $filter('filter')($scope.documentsList, params.filter()) : $scope.documentsList;
                var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) :
                  filteredData;

                params.total(orderedData.length);
                return (orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
              }
            })
          );
        });
      }

      $scope.documentsListCopy = receivedFiles;
      $scope.documentsList = receivedFiles;

      $scope.deleteDocuments = function(items) {
        documentUtilsService.deleteItem(items, documentUtilsService.itemUtilsConstant.RECEIVED_SHARE, deleteCallback);
      };

      function deleteCallback(items) {
        // TODO : show a single callback toast for the deleted item(s), and check if it needs to be plural or not
        angular.forEach(items, function(restangularizedItem) {
          $log.debug('value to delete', restangularizedItem);
          restangularizedItem.remove().then(function() {
            _.remove($scope.documentsList, restangularizedItem);
            _.remove($scope.selectedDocuments, restangularizedItem);
            $scope.documentsListCopy = $scope.documentsList; // I keep a copy of the data for the filter module
            $scope.tableParams.reload();
            initFlagsOnSelectedPages();
            toastService.success({key: 'TOAST_ALERT.ACTION.DELETE_SINGULAR'});
          });
        });
      }

      $scope.formatLabel = function(u) {
        if (u.firstName !== '') {
          return u.firstName.concat(' ', u.lastName);
        }
      };

      $scope.userRepresentation = function(u) {
        if (angular.isString(u)) {
          return u;
        }
        return '<span>' + u.firstName + ' ' + u.lastName +
          '</span> <span > + <i class="zmdi zmdi-email"></i> &nbsp;' + u.mail + '</span>';
      };

      $scope.searchGuestRestrictedContacts = function(pattern) {
        $scope.popoverValue = '';
        $scope.selectedRecipient = '';
        return autocompleteUserRestService.search(pattern, 'SHARING');
      };

      $scope.addRecipients = function(users, contact) {
        $scope.selectedRecipient = contact;
        $scope.filters.selectedContact = contact;
        $scope.popoverValue = contact.mail;
      };

      $scope.removeRecipients = function(users, index) {
        users.splice(index, 1);
      };

      $scope.today = function() {
        $scope.dt = new Date();
      };
      $scope.today();
      $scope.minRange = '';

      $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
        $scope.maxDate = $scope.maxDate ? null : new Date();
      };
      $scope.toggleMin();

      $scope.open = function($event, dateStartOpened) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope[dateStartOpened] = true;
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.closeDetailSidebar = function() {
        angular.element('#file-list-table tr li').removeClass('activeActionButton');
      };
      $scope.sortDropdownSetActive = function(sortField, $event) {
        $scope.toggleSelectedSort = !$scope.toggleSelectedSort;
        $scope.tableParams.sorting(sortField, $scope.toggleSelectedSort ? 'desc' : 'asc');
        var currTarget = $event.currentTarget;
        angular.element('.labeled-dropdown.open a').removeClass('selected-sorting').promise().done(function() {
          angular.element(currTarget).addClass('selected-sorting');
        });
      };

      $scope.toggleSearchState = toggleSearchState;

      function toggleSearchState() {
        if (!$scope.searchMobileDropdown) {
          $scope.openSearch();
        } else {
          $scope.closeSearch();
        }
        $scope.searchMobileDropdown = !$scope.searchMobileDropdown;
      }
      $scope.openSearch = function(){
        angular.element('#drop-area').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      };

      $scope.closeSearch = function(){
        angular.element('#drop-area').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      };

      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });

      $scope.currentPage = 'received_files';

      $scope.getDetails = function(item) {
        return $scope.showCurrentFile(item);
      };

      $scope.addSelectedDocument = addSelectedDocument;
      function addSelectedDocument(document) {
        documentUtilsService.selectDocument($scope.selectedDocuments, document);
      }
    })

  // ===========================================================================
  // SLIDEABLE
  // ===========================================================================
  .directive('slideable', function() {
    return {
      restrict: 'C',
      compile: function(element) {
        // wrap tag
        var contents = element.html();
        element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' +
          contents + '</div>');

        return function postLink(scope, element, attrs) {
          // default properties
          attrs.duration = (!attrs.duration) ? '1s' : attrs.duration;
          attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
          element.css({
            'overflow': 'hidden',
            'height': '0px',
            'transitionProperty': 'height',
            'transitionDuration': attrs.duration,
            'transitionTimingFunction': attrs.easing
          });

        };
      }
    };
  });
