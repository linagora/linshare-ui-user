/**
 * browseController Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('browseController', BrowseController);

  BrowseController.$inject = [
    '_',
    '$q',
    '$scope',
    '$timeout',
    '$transitions',
    '$translate',
    'functionalityRestService',
    'itemUtilsService',
    'lsErrorCode',
    'toastService',
    'workgroupNodesRestService',
    'workgroupPermissionsService',
    'workgroupRestService'
  ];

  /**
   * @namespace BrowseController
   * @desc Controller of browse component
   * @memberOf linshare.components
   */
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false */
  function BrowseController(
    _,
    $q,
    $scope,
    $timeout,
    $transitions,
    $translate,
    functionalityRestService,
    itemUtilsService,
    lsErrorCode,
    toastService,
    workgroupNodesRestService,
    workgroupPermissionsService,
    workgroupRestService
  ) {
    /* jshint validthis:true */
    var browseVm = this;
    var newFolderName;
    const TYPE_FOLDER = 'FOLDER';
    browseVm.createFolder = createFolder;
    browseVm.disableFolder = disableFolder;
    browseVm.goToFolder = goToFolder;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshare.components.BrowseController
     */
    function activate() {
      browseVm.isSharedSpace = false;
      browseVm.canCreateFolder = false;

      functionalityRestService.getFunctionalityParams('WORK_GROUP__CREATION_RIGHT')
        .then(function(creationRight) {
          browseVm.canCreateFolder =
            (browseVm.isSharedSpace && creationRight.enable) ||
            (!browseVm.isSharedSpace);
      });

      $translate([
        'ACTION.NEW_FOLDER'
      ]).then(function(translations) {
        newFolderName = translations['ACTION.NEW_FOLDER'];
      });

      loadBrowseList();

      $transitions.onStart({}, function() {
        browseVm.$mdDialog.cancel();
      });
    }

    /**
     * @name createFolder
     * @desc Create a folder
     * @memberOf linshare.components.BrowseController
     */
    // TODO : a service to harmonize with workgroupNodesController's createFolder()
    function createFolder() {
      if (browseVm.canCreateFolder) {
        var newFolderObject = browseVm.restService.restangularize({
          name: newFolderName,
          parent: browseVm.currentFolder.uuid,
          type: TYPE_FOLDER
        }, browseVm.currentFolder.workGroup);
        browseVm.restService.create(browseVm.currentFolder.workGroup, newFolderObject, true)
          .then(function(data) {
            newFolderObject.name = data.name;
            browseVm.canCreateFolder = false;
            browseVm.currentList.unshift(newFolderObject);
            $timeout(function() {
              renameNode(newFolderObject, 'div[uuid=""] .file-name-disp');
            }, 0);
          });
      }
    }

    /**
     * @name copyNode
     * @desc Copy the node
     * @memberOf linshare.components.BrowseController
     */
    function copyNode() {
      var failedNodes = [],
        nodeItems = [],
        promises = [];

      _.forEach(browseVm.nodeItems, function(nodeItem) {
        var deferred = $q.defer();
        browseVm.restService.copy(browseVm.currentFolder.workGroup, nodeItem.uuid,
          browseVm.currentFolder.uuid, browseVm.kind).then(function(newNode) {
          var _newNode = browseVm.restService.restangularize(newNode[0]);
          deferred.resolve(_newNode);
        }).catch(function(error) {
          failedNodes.push(_.assign(error, {nodeItem: nodeItem}));
          deferred.reject(error);
        });
        promises.push(deferred.promise);
      });

      $q.all(promises).then(function(_nodeItems) {
        nodeItems = _nodeItems;
      }).finally(function() {
        browseVm.$mdDialog.hide({
          nodeItems: nodeItems,
          failedNodes: failedNodes,
          folder: browseVm.currentFolder
        });
      });
    }

    /**
     * @name disableFolder
     * @desc Check if folder is in list of selected items and disable it to prevent from moving a folder inside itself
     * @param {Object} folder - Folder to check
     * @memberOf linshare.components.BrowseController
     */
    function disableFolder(folder) {
      return _.find(browseVm.nodeItems, folder);
    }

    /**
     * @name goToFolder
     * @desc Enter inside a folder
     * @param {Object} selectedFolder - Folder where to enter
     * @param {boolean} goToParent - Enter in parent folder with previous arrow button
     * @memberOf linshare.components.BrowseController
     */
    function goToFolder(selectedFolder, goToParent) {
      if (!browseVm.canCreateFolder) {
        return;
      }

      if (browseVm.isSharedSpace) {
        browseVm.restService = workgroupNodesRestService;
        browseVm.restService.get(selectedFolder.uuid, selectedFolder.uuid).then(function(currentFolder) {
          browseVm.currentFolder = currentFolder;
          browseVm.currentFolder.workgroupUuid = currentFolder.workGroup;
          browseVm.currentFolder.workgroupName = currentFolder.name;
          browseVm.restService.getList(currentFolder.workGroup).then(function(currentList) {
            browseVm.currentList = _.orderBy(_.filter(currentList, {'type': TYPE_FOLDER}), 'modificationDate', 'desc');
            browseVm.isSharedSpace = false;
          });
        });
      } else if (goToParent && browseVm.currentFolder.parent === browseVm.currentFolder.workGroup) {
        browseVm.currentFolder = null;
        loadBrowseList();
      } else if (browseVm.canCreateFolder) {
        var folderUuid = goToParent ? selectedFolder.parent : selectedFolder.uuid;
        browseVm.restService.getList(selectedFolder.workGroup, folderUuid, TYPE_FOLDER).then(function(folders) {
          browseVm.currentList = _.orderBy(folders, 'modificationDate', 'desc');
        });

        if (!goToParent) {
          _.assign(browseVm.currentFolder, selectedFolder);
        } else {
          browseVm.restService.get(selectedFolder.workGroup, folderUuid).then(function(parentFolder) {
            _.assign(browseVm.currentFolder, parentFolder);
          });
        }
      }
    }

    /**
     * @name loadBrowseList
     * @desc Load browse list from Workgroup root folder or child folder
     * @memberOf linshare.components.BrowseController
     */
    function loadBrowseList() {
      if (_.isNil(browseVm.currentFolder)) {
        browseVm.currentFolder = {};
        browseVm.restService = workgroupRestService;
        browseVm.isSharedSpace = true;

        browseVm.restService.getList()
          .then(function(currentList) {
            browseVm.currentList = _.orderBy(currentList, 'modificationDate', 'desc');
            return workgroupPermissionsService.getWorkgroupsPermissions(currentList);
          })
          .then(function(workgroupsPermissions) {
            browseVm.permissions = workgroupPermissionsService.formatPermissions(workgroupsPermissions);
          });
      } else {
        browseVm.sourceFolder = _.cloneDeep(browseVm.currentFolder);
        browseVm.isSharedSpace = false;

        workgroupPermissionsService
          .getWorkgroupsPermissions(
            [{ uuid: browseVm.currentFolder.workGroup }]
          )
          .then(function(workgroupsPermissions) {
            browseVm.permissions = workgroupPermissionsService.formatPermissions(workgroupsPermissions);
          });
      }
      browseVm.validateAction = browseVm.isMove ? moveNode : copyNode;
    }

    /**
     * @name moveNode
     * @desc Move the node
     * @memberOf linshare.components.BrowseController
     */
    function moveNode() {
      var failedNodes = [],
        nodeItems = [],
        promises = [];

      _.forEach(browseVm.nodeItems, function(nodeItem) {
        var deferred = $q.defer();
        nodeItem.parent = browseVm.currentFolder.uuid;
        nodeItem.save().then(function(newNode) {
          deferred.resolve(newNode);
        }).catch(function(error) {
          failedNodes.push(_.assign(error, {nodeItem: nodeItem}));
          deferred.reject(error);
        });
        promises.push(deferred.promise);
      });

      $q.all(promises).then(function(_nodeItems) {
        nodeItems = _nodeItems;
      }).finally(function() {
        browseVm.$mdDialog.hide({
          nodeItems: nodeItems,
          failedNodes: failedNodes,
          folder: browseVm.currentFolder
        });
      });
    }

    /**
     * @name renameNode
     * @desc Rename node name
     * @param {object} nodeToRename - Node to rename
     * @param {string} [itemNameElem] - Name of the item in view which is in edition mode
     * @memberOf linshare.components.BrowseController
     */
    function renameNode(nodeToRename, itemNameElem) {
      itemNameElem = itemNameElem || 'div[uuid=' + nodeToRename.uuid + '] .file-name-disp';
      itemUtilsService.rename(nodeToRename, itemNameElem).then(function(data) {
        var changedNodePos = _.findIndex(browseVm.currentList, nodeToRename);
        browseVm.currentList[changedNodePos] = data;
        if (nodeToRename.name !== data.name) {
          $timeout(function() {
            renameNode(data, 'div[uuid=' + data.uuid + '] .file-name-disp');
            toastService.error({key: 'TOAST_ALERT.ERROR.RENAME_NODE'});
          }, 0);
        } else {
          browseVm.canCreateFolder = true;
        }
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26445 :
          case 28005 :
            toastService.error({key: 'TOAST_ALERT.ERROR.RENAME_NODE'});
            renameNode(nodeToRename, itemNameElem);
            break;
          case lsErrorCode.CANCELLED_BY_USER :
            if (!nodeToRename.uuid) {
              browseVm.currentList.shift(_.findIndex(browseVm.currentList, nodeToRename), 1);
            }
            browseVm.canCreateFolder = true;
            break;
        }
      });
    }
  }
})();
