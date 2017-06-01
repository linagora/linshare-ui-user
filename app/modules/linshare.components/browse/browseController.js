/**
 * browseController Controller
 * @namespace linshare.component
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('browseController', browseController);

  browseController.$inject = ['_', '$q', '$timeout', '$translate', 'itemUtilsService', 'lsErrorCode', 'toastService'];

  /**
   * @namespace browseController
   * @desc Controller of browse component
   * @memberOf linshare.components
   */
  function browseController(_, $q, $timeout, $translate, itemUtilsService, lsErrorCode, toastService) {
    /* jshint validthis:true */
    var browseVm = this;

    const TYPE_FOLDER = 'FOLDER';

    var newFolderName;

    browseVm.canCreateFolder = true;
    browseVm.createFolder = createFolder;
    browseVm.disableFolder = disableFolder;
    browseVm.goToFolder = goToFolder;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshare.components.browseController
     */
    function activate() {
      $translate([
        'GROWL_ALERT.ERROR.RENAME_FOLDER',
        'GROWL_ALERT.ERROR.RENAME_FILE',
        'ACTION.NEW_FOLDER'
      ]).then(function(translations) {
        newFolderName = translations['ACTION.NEW_FOLDER'];
      });

      browseVm.validateAction = browseVm.isMove ? moveNode : copyNode;
      browseVm.sourceFolder = _.cloneDeep(browseVm.currentFolder);
    }

    /**
     * @name createFolder
     * @desc Create a folder
     * @memberOf linshare.components.browseController
     */
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
            newFolderObject.parent = data.parent;
            newFolderObject.type = data.type;
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
     * @memberOf linshare.components.browseController
     */
    function copyNode() {
      var failedNodes = [],
        promises = [];
      _.forEach(browseVm.nodeItems, function(nodeItem) {
        var deferred = $q.defer();
        browseVm.restService.copy(browseVm.currentFolder.workGroup, nodeItem, browseVm.currentFolder.uuid)
          .then(function(newNode) {
            deferred.resolve(newNode);
          }).catch(function(error) {
          deferred.reject(error);
        });
        promises.push(deferred.promise);
      });

      $q.all(promises).then(function(nodeItems) {
        browseVm.$mdDialog.hide({
          nodeItems: nodeItems,
          failedNodes: failedNodes,
          folder: browseVm.currentFolder
        });
      });
    }

    /**
     * @name disableFolder
     * @desc Check if folder is in list and disable it to prevent from moving a folder inside itself
     * @param {Object} folder - Folder to check
     * @memberOf linshare.components.browseController
     */
    function disableFolder(folder) {
      return _.find(browseVm.nodeItems, folder);
    }

    /**
     * @name goToFolder
     * @desc Get current folder name, or workgroup's name if folder is root
     * @param {Object} selectedFolder - Selected folder object inside to enter
     * @param {boolean} goToParent - Enter in parent folder with previous arrow button
     * @memberOf linshare.components.browseController
     */
    function goToFolder(selectedFolder, goToParent) {
      if (browseVm.canCreateFolder) {
        var folderUuid = goToParent ? selectedFolder.parent : selectedFolder.uuid;
        browseVm.restService.getList(selectedFolder.workGroup, folderUuid, TYPE_FOLDER).then(function(folders) {
          browseVm.currentList = _.orderBy(folders, 'modificationDate', 'desc');
        });

        if (!goToParent) {
          browseVm.currentFolder = selectedFolder;
        } else {
          browseVm.restService.get(selectedFolder.workGroup, folderUuid).then(function(parentFolder) {
            browseVm.currentFolder = parentFolder;
          });
        }
      }
    }

    /**
     * @name moveNode
     * @desc Move the node
     * @memberOf linshare.components.browseController
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
     * @param {string} itemNameElem - Name of the item in view which is in edition mode
     * @memberOf linshare.components.browseController
     */
    function renameNode(nodeToRename, itemNameElem) {
      itemNameElem = itemNameElem || 'div[uuid=' + nodeToRename.uuid + '] .file-name-disp';
      itemUtilsService.rename(nodeToRename, itemNameElem).then(function(data) {
        var changedNodePos = _.findIndex(browseVm.currentList, nodeToRename);
        browseVm.currentList[changedNodePos] = data;
        if (nodeToRename.name !== data.name) {
          $timeout(function() {
            renameNode(data, 'div[uuid=' + data.uuid + '] .file-name-disp');
            toastService.error({key: 'GROWL_ALERT.ERROR.RENAME_NODE'});
          }, 0);
        } else {
          browseVm.canCreateFolder = true;
        }
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26445 :
          case 28005 :
            toastService.error({key: 'GROWL_ALERT.ERROR.RENAME_NODE'});
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
