/**
 * WorkgroupNodesController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .controller('WorkgroupNodesController', WorkgroupNodesController);

  WorkgroupNodesController.$inject = ['_', '$q', '$scope', '$state', '$stateParams', '$timeout', '$translate',
    '$translatePartialLoader', 'auditDetailsService', 'browseService', 'currentFolder', 'documentUtilsService',
    'flowUploadService', 'itemUtilsService', 'lsAppConfig', 'lsErrorCode', 'nodesList', 'swal', 'tableParamsService',
    'toastService', 'workgroupRestService', 'workgroupMembersRestService', 'workgroupNodesRestService'];

  /**
   * @namespace WorkgroupNodesController
   * @desc Application Workgroup Nodes system controller
   * @memberOf LinShare.sharedSpace
   */
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false, maxstatements: false */
  function WorkgroupNodesController(_, $q, $scope, $state, $stateParams, $timeout, $translate, $translatePartialLoader,
                                    auditDetailsService, browseService, currentFolder, documentUtilsService,
                                    flowUploadService, itemUtilsService, lsAppConfig, lsErrorCode, nodesList, swal,
                                    tableParamsService, toastService, workgroupRestService, workgroupMembersRestService,
                                    workgroupNodesRestService) {
    /* jshint validthis:true */
    var workgroupNodesVm = this;

    const TYPE_DOCUMENT = 'DOCUMENT';
    const TYPE_FOLDER = 'FOLDER';

    var newFolderName, swalMultipleDownloadConfirm, swalMultipleDownloadTitle, swalMultipleDownloadText, showIt;

    workgroupNodesVm.addUploadedDocument = addUploadedDocument;
    workgroupNodesVm.breadcrumb = [];
    workgroupNodesVm.canCreateFolder = true;
    workgroupNodesVm.copyNode = copyNode;
    workgroupNodesVm.createFolder = createFolder;
    workgroupNodesVm.currentFolder = currentFolder;
    workgroupNodesVm.currentPage = 'workgroup_nodes';
    workgroupNodesVm.currentSelectedDocument = {};
    workgroupNodesVm.deleteNodes = deleteNodes;
    workgroupNodesVm.downloadFile = downloadFile;
    workgroupNodesVm.flowUploadService = flowUploadService;
    workgroupNodesVm.folderDetails = $stateParams;
    workgroupNodesVm.getNodeDetails = getNodeDetails;
    workgroupNodesVm.goToFolder = goToFolder;
    workgroupNodesVm.goToPreviousFolder = goToPreviousFolder;
    workgroupNodesVm.isDocument = isDocument;
    workgroupNodesVm.loadSidebarContent = loadSidebarContent;
    workgroupNodesVm.mdtabsSelection = {selectedIndex: 0};
    workgroupNodesVm.nodesList = nodesList;
    workgroupNodesVm.openBrowser = openBrowser;
    workgroupNodesVm.paramFilter = {name: ''};
    workgroupNodesVm.renameNode = renameNode;
    workgroupNodesVm.showSelectedNodeDetails = showSelectedNodeDetails;
    workgroupNodesVm.showWorkgroupDetails = showWorkgroupDetails;
    workgroupNodesVm.unavailableMultiDownload = unavailableMultiDownload;
    workgroupNodesVm.workgroupPage = lsAppConfig.workgroupPage;
    workgroupNodesVm.workgroupNode = lsAppConfig.workgroupNode;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function activate() {
      $translatePartialLoader.addPart('filesList');
      $translatePartialLoader.addPart('sharedspace');

      $translate([
        'ACTION.NEW_FOLDER',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON',
        'TOAST_SHOW_IT'])
        .then(function(translations) {
          newFolderName = translations['ACTION.NEW_FOLDER'];
          swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadText = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
          swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
          showIt = translations.TOAST_SHOW_IT;
        });

      getBreadcrumb();
      setFabConfig();
      getWorkgroupMemberDetails();
      launchTableParamsInitiation();
    }

    /**
     * @name addNewItemInTableParams
     * @desc Add new item in list and reload tableParams
     * @param {object} newItem - Node to add in tableParams
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function addNewItemInTableParams(newItem) {
      workgroupNodesVm.nodesList.push(newItem);
      $scope.isNewAddition = true;
      workgroupNodesVm.tableParamsService.reloadTableParams();
      $timeout(function() {
        $scope.isNewAddition = false;
      }, 0);
    }

    /**
     * @name addUploadedDocument
     * @desc Add uploaded document to the list
     * @param {object} flowFile - Upload file
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function addUploadedDocument(flowFile) {
      if (flowFile._from === workgroupNodesVm.workgroupPage) {
        if (flowFile.folderDetails.workgroupUuid === workgroupNodesVm.folderDetails.workgroupUuid &&
          flowFile.folderDetails.folderUuid === workgroupNodesVm.folderDetails.folderUuid) {
          flowFile.asyncUploadDeferred.promise.then(function(file) {
            addNewItemInTableParams(file.linshareDocument);
          });
        }
      }
    }

    // TODO : show a single callback toast for multiple items copied, and check if it needs to be plural or not,
    // additionally please prefix the sentence by number of files copied
    /**
     * @name copyNode
     * @desc Copy a file from existing list
     * @param {object} nodeItem - Uuid of file to copy
     * @param {string} destinationNodeUuid - The uuid of the Destination Node object
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function copyNode(nodeItem, destinationNodeUuid) {
      var _destinationNodeUuid = destinationNodeUuid || workgroupNodesVm.folderDetails.folderUuid;
      workgroupNodesRestService.copy(workgroupNodesVm.folderDetails.workgroupUuid, nodeItem, _destinationNodeUuid)
        .then(function(data) {
          var copiedNode = workgroupNodesRestService.restangularize(data, workgroupNodesVm.folderDetails.workgroupUuid);
          toastService.success({key: 'GROWL_ALERT.ACTION.COPY'});
          addNewItemInTableParams(copiedNode);
        });
    }

    /**
     * @name createFolder
     * @desc Create a folder
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function createFolder() {
      if (workgroupNodesVm.canCreateFolder) {
        var newFolderObject = workgroupNodesRestService.restangularize({
          name: newFolderName,
          parent: workgroupNodesVm.folderDetails.folderUuid,
          type: TYPE_FOLDER
        }, workgroupNodesVm.folderDetails.workgroupUuid);
        workgroupNodesRestService.create(workgroupNodesVm.folderDetails.workgroupUuid, newFolderObject, true)
          .then(function(data) {
            newFolderObject.name = data.name;
            newFolderObject.parent = data.parent;
            newFolderObject.type = data.type;
            workgroupNodesVm.canCreateFolder = false;
            workgroupNodesVm.nodesList.push(newFolderObject);
            workgroupNodesVm.tableParamsService.reloadTableParams();
            $timeout(function() {
              renameNode(newFolderObject, 'td[uuid=""] .file-name-disp');
            }, 0);
          });
      }
    }

    /**
     * @name deleteNodes
     * @desc Delete nodes
     * @param {Array<Object>} nodes - List of nodes to delete
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    // TODO : multiple delete like in mySpace and remove documentUtilsService code (do it other way)
    function deleteNodes(nodes) {
      documentUtilsService.deleteDocuments(nodes, function(nodes) {
        _.forEach(nodes, function(restangularizedItem) {
          restangularizedItem.remove().then(function() {
            toastService.success({key: 'GROWL_ALERT.ACTION.DELETE_SINGULAR'});
            _.remove(workgroupNodesVm.nodesList, restangularizedItem);
            _.remove(workgroupNodesVm.selectedDocuments, restangularizedItem);
            workgroupNodesVm.tableParamsService.reloadTableParams();
          }, function(error) {
            if (error.status === 400 && error.data.errCode === 26006) {
              toastService.error({key: 'GROWL_ALERT.ERROR.DELETE_ERROR.26006'});
            } else if (error.data.errCode === 26444) {
              toastService.error({key: 'GROWL_ALERT.ERROR.DELETE_ERROR.26444'});
            }
          });
        });
      });
    }

    /**
     * @name downloadFile
     * @desc Download a file
     * @param {Object} fileDocument - File to download's document
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function downloadFile(fileDocument) {
      var url = workgroupNodesRestService.download(workgroupNodesVm.folderDetails.workgroupUuid, fileDocument.uuid);
      itemUtilsService.download(url, fileDocument.name);
    }

    /**
     * @name getBreadcrumb
     * @desc Generate breadcrumb object for view
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function getBreadcrumb() {
      workgroupNodesVm.breadcrumb = workgroupNodesVm.currentFolder.treePath || [];
      workgroupNodesVm.breadcrumb.shift();
      if (workgroupNodesVm.currentFolder.parent !== workgroupNodesVm.currentFolder.workGroup) {
        workgroupNodesVm.breadcrumb.push({
          name: workgroupNodesVm.currentFolder.name,
          uuid: workgroupNodesVm.currentFolder.uuid
        });
      }
    }

    /**
     * @name getNodeDetails
     * @desc Get node details and thumbnail if exists
     * @param {Object} nodeItem - A node object
     * @returns {Promise} Node object with details
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function getNodeDetails(nodeItem) {
      var deferred = $q.defer();
      var nodeDetails = {};
      workgroupNodesRestService.get(workgroupNodesVm.folderDetails.workgroupUuid, nodeItem.uuid).then(function(data) {
        nodeDetails = data;
        if (data.hasThumbnail) {
          workgroupNodesRestService.thumbnail(workgroupNodesVm.folderDetails.workgroupUuid, nodeItem.uuid)
            .then(function(thumbnail) {
              nodeDetails.thumbnail = thumbnail;
            });
        } else {
          delete nodeDetails.thumbnail;
        }

        workgroupNodesRestService.getAudit(workgroupNodesVm.folderDetails.workgroupUuid, nodeItem.uuid)
          .then(function(data) {
            auditDetailsService.generateAllDetails($scope.userLogged.uuid, data.plain()).then(function(auditActions) {
              nodeDetails.auditActions = auditActions;
              deferred.resolve(nodeDetails);
            });
          });
      }, function(error) {
        deferred.reject(error);
      });
      // TODO : change the watcher method in activate() of workgroupMembersController, then do it better
      $scope.mainVm.sidebar.setContent(workgroupNodesVm.workgroupNode);
      return deferred.promise;
    }

    /**
     * @name getWorkgroupMemberDetails
     * @desc Get current workgroup details
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function getWorkgroupMemberDetails() {
      workgroupMembersRestService.get(workgroupNodesVm.folderDetails.workgroupUuid, $scope.userLogged.uuid)
        .then(function(member) {
          workgroupNodesVm.currentWorkgroupMember = member;
          workgroupNodesVm.fabButton.actions.push({
            action: null,
            label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE',
            icon: 'ls-upload-fill',
            flowBtn: true,
            hide: workgroupNodesVm.currentWorkgroupMember.readonly
          });
        });
    }

    /**
     * @name goToFolder
     * @desc Enter inside a folder
     * @param {object} folder - Folder where to enter
     * @param {boolean} [forceEnter] - Force entering
     * @param {string} [selectFileUuid] - Uuid of file to put in selected mode
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function goToFolder(folder, forceEnter, selectFileUuid) {
      var folderNameElem;
      var isNotInEditMode = true;
      var canEnter = _.isNil(folder) ? true : !workgroupNodesVm.isDocument(folder.type);

      if (!_.isNil(folder) && !forceEnter) {
        folderNameElem = $('td[uuid=' + folder.uuid + ']').find('.file-name-disp');
        isNotInEditMode = (angular.element(folderNameElem).attr('contenteditable') === 'false');
      }

      var folderDetails = {
        workgroupUuid: workgroupNodesVm.folderDetails.workgroupUuid,
        workgroupName: workgroupNodesVm.folderDetails.workgroupName.trim(),
        parentUuid: folder ? folder.parent : null,
        folderUuid: folder ? folder.uuid : null,
        folderName: folder ? folder.name.trim() : null,
        uploadedFileUuid: selectFileUuid
      };

      if (canEnter && isNotInEditMode) {
        if (_.isNil(folderDetails.folderUuid)) {
          $state.go('sharedspace.workgroups.root', folderDetails);
        } else {
          $state.go('sharedspace.workgroups.folder', folderDetails);
        }
      }
    }

    /**
     * @name goToPreviousFolder
     * @desc Enter inside the parent folder or Workgroups page if current folder is root
     * @param {boolean} goToWorkgroupPage - Go to Workgroups page
     * @param {object} folder - Folder where to enter
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function goToPreviousFolder(goToWorkgroupPage, folder) {
      if (goToWorkgroupPage) {
        $state.go('sharedspace.all');
      } else {
        workgroupNodesVm.goToFolder(folder, true);
      }
    }

    /**
     * @name isDocument
     * @desc Determine if the node type is a document
     * @param {string} nodeType - The type of the node
     * @returns {boolean} Is node a document or not
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function isDocument(nodeType) {
      return (nodeType === TYPE_DOCUMENT);
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function launchTableParamsInitiation() {
      tableParamsService.initTableParams(workgroupNodesVm.nodesList, workgroupNodesVm.paramFilter,
        workgroupNodesVm.folderDetails.uploadedFileUuid)
        .then(function(data) {
          workgroupNodesVm.tableParamsService = tableParamsService;
          workgroupNodesVm.tableParams = tableParamsService.getTableParams();
          workgroupNodesVm.lengthOfSelectedDocuments = tableParamsService.lengthOfSelectedDocuments;
          workgroupNodesVm.resetSelectedDocuments = tableParamsService.resetSelectedItems;
          workgroupNodesVm.selectedDocuments = tableParamsService.getSelectedItemsList();
          workgroupNodesVm.selectDocumentsOnCurrentPage = tableParamsService.tableSelectAll;
          workgroupNodesVm.addSelectedDocument = tableParamsService.toggleItemSelection;
          workgroupNodesVm.sortDropdownSetActive = tableParamsService.tableSort;
          workgroupNodesVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
          workgroupNodesVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
          workgroupNodesVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();

          if (!_.isNil(data.itemToSelect)) {
            workgroupNodesVm.showSelectedNodeDetails(data.itemToSelect);
          }
        });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {string} content - The id of the content to load, see app/views/includes/sidebar-right.html
     * for possible values
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    // TODO : service with content and vm as parameter (because these 3 line are always same in all controller...)
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(workgroupNodesVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    /**
     * @name openBrowser
     * @desc Open browser of folders to move/copy a node
     * @param {object} nodeItem - Node to copy
     * @param {boolean} isMove - Check if it is a copy or a move
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function openBrowser(nodeItem, isMove) {
      browseService.show({
        currentFolder: workgroupNodesVm.currentFolder,
        currentList: _.orderBy(_.filter(workgroupNodesVm.nodesList, {'type': TYPE_FOLDER}), 'modificationDate', 'desc'),
        nodeItem: nodeItem,
        isMove: isMove,
        restService: workgroupNodesRestService
      }).then(function(data) {
        if (data.nodeItem.parent === workgroupNodesVm.currentFolder.uuid) {
          toastService.success({key: 'GROWL_ALERT.ACTION.COPY'});
        } else {
          var action = isMove ? 'moved' : '';
          $translate('GROWL_ALERT.ACTION.BROWSER_ACTION', {
            ACTION: action,
            folderName: data.folder.name
          }, 'messageformat')
            .then(function(message) {
              toastService.success(message, showIt).then(function(response) {
                if (!_.isUndefined(response)) {
                  if (response.actionClicked) {
                    workgroupNodesVm.goToFolder(data.folder, true, data.nodeItem.uuid);
                  }
                }
              });
            });
        }
        reloadTableParamsDatas();
      }).catch(function() {
        reloadTableParamsDatas();
      });
    }

    /**
     * @name reloadTableParamsDatas
     * @desc Get all nodes from back and refresh tableParams
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function reloadTableParamsDatas() {
      workgroupNodesRestService.getList(workgroupNodesVm.currentFolder.workGroup, workgroupNodesVm.currentFolder.uuid)
        .then(function(nodeItems) {
          if (workgroupNodesVm.nodesList !== nodeItems) {
            workgroupNodesVm.nodesList = nodeItems;
            tableParamsService.reloadTableParams(workgroupNodesVm.nodesList);
          }
        });
    }

    /**
     * @name renameNode
     * @desc Rename node name
     * @param {object} nodeToRename - Node to rename
     * @param {string} itemNameElem - Name of the item in view which is in edition mode
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function renameNode(nodeToRename, itemNameElem) {
      itemNameElem = itemNameElem || 'td[uuid=' + nodeToRename.uuid + '] .file-name-disp';
      itemUtilsService.rename(nodeToRename, itemNameElem).then(function(data) {
        var changedNodePos = _.findIndex(workgroupNodesVm.nodesList, nodeToRename);
        workgroupNodesVm.nodesList[changedNodePos] = data;
        if (nodeToRename.name !== data.name) {
          $timeout(function() {
            renameNode(data, 'td[uuid=' + data.uuid + '] .file-name-disp');
            toastService.error({key: 'GROWL_ALERT.ERROR.RENAME_FOLDER'});
          }, 0);
        } else {
          workgroupNodesVm.canCreateFolder = true;
        }
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26445 :
          case 28005 :
            var errorMessage = isDocument(nodeToRename.type) ? 'GROWL_ALERT.ERROR.RENAME_FILE' :
              'GROWL_ALERT.ERROR.RENAME_FOLDER';
            toastService.error({key: errorMessage});
            renameNode(nodeToRename, itemNameElem);
            break;
          case lsErrorCode.CANCELLED_BY_USER :
            if (!nodeToRename.uuid) {
              workgroupNodesVm.nodesList.splice(_.findIndex(workgroupNodesVm.nodesList, nodeToRename), 1);
            }
            workgroupNodesVm.canCreateFolder = true;
            break;
        }
      }).finally(function() {
        workgroupNodesVm.tableParamsService.reloadTableParams();
      });
    }

    /**
     * @name setFabConfig
     * @desc Build the floating actions button
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function setFabConfig() {
      workgroupNodesVm.fabButton = {
        toolbar: {
          activate: true,
          label: 'BOUTON_ADD_FILE_TITLE'
        },
        actions: [{
          action: null,
          label: 'WORKGROUPS_LIST.SHARED_FOLDER',
          icon: 'ls-workgroup disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }, {
          action: function() {
            return workgroupNodesVm.showWorkgroupDetails(true);
          },
          label: 'WORKGROUPS_LIST.ADD_A_MEMBER',
          icon: 'ls-add-user'
        }, {
          action: function() {
            return workgroupNodesVm.createFolder();
          },
          label: 'WORKGROUPS_LIST.FOLDER',
          icon: 'ls-folder'
        }, {
          action: null,
          label: 'WORKGROUPS_LIST.UPLOAD_REQUEST',
          icon: 'ls-upload-request disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }, {
          action: null,
          label: 'WORKGROUPS_LIST.PROJECT',
          icon: 'ls-project disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }]
      };
    }

    /**
     * @name showSelectedNodeDetails
     * @desc Get information from a node and show them in the right sidebar
     * @param {Object} selectedNode - A Document node object
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showSelectedNodeDetails(selectedNode) {
      workgroupNodesVm.getNodeDetails(selectedNode).then(function(data) {
        workgroupNodesVm.currentSelectedDocument.current = data;
        workgroupNodesVm.mdtabsSelection.selectedIndex = 0;
        workgroupNodesVm.loadSidebarContent(workgroupNodesVm.workgroupNode);
      });
    }

    /**
     * @name showWorkgroupDetails
     * @desc Get current workgroup details
     * @param {boolean} [showMemberTab] - Show add member tab
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showWorkgroupDetails(showMemberTab) {
      workgroupRestService.get(workgroupNodesVm.folderDetails.workgroupUuid).then(function(workgroup) {
        workgroupRestService.getAudit(workgroupNodesVm.folderDetails.workgroupUuid).then(function(auditData) {
          auditDetailsService.generateAllDetails($scope.userLogged.uuid, auditData.plain())
            .then(function(auditActions) {
              workgroup.auditActions = auditActions;
              workgroupNodesVm.currentSelectedDocument.current = workgroup;
              workgroupNodesVm.mdtabsSelection.selectedIndex = showMemberTab ? 1 : 0;
              workgroupNodesVm.loadSidebarContent(workgroupNodesVm.workgroupPage);
            });
        });
      });
    }

    // TODO : Remove it when multi download will be implemented
    function unavailableMultiDownload() {
      swal({
          title: swalMultipleDownloadTitle,
          text: swalMultipleDownloadText,
          type: 'error',
          confirmButtonColor: '#05b1ff',
          confirmButtonText: swalMultipleDownloadConfirm,
          closeOnConfirm: true
        }
      );
    }

    // TODO : directive for all functions below (check sidebar-content-details.html for input and textarea)
    workgroupNodesVm.toggleSearchState = toggleSearchState;

    function toggleSearchState() {
      if (!workgroupNodesVm.searchMobileDropdown) {
        angular.element('#drop-area').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      } else {
        angular.element('#drop-area').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      }
      workgroupNodesVm.searchMobileDropdown = !workgroupNodesVm.searchMobileDropdown;
    }
  }
})();
