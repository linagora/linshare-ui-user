/**
 * browseController Controller
 * @namespace linshare.component
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('browseController', browseController);

  browseController.$inject = ['_', '$timeout', '$translate', 'itemUtilsService', 'lsErrorCode', 'toastService'];

  /**
   * @namespace browseController
   * @desc Controller of browse component
   * @memberOf linshare.components
   */
  function browseController(_, $timeout, $translate, itemUtilsService, lsErrorCode, toastService) {
    /* jshint validthis:true */
    var browseVm = this;

    const TYPE_FOLDER = 'FOLDER';

    var errorRenameFolder,
      fileStillExists,
      newFolderName;

    browseVm.canCreateFolder = true;
    browseVm.createFolder = createFolder;
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
        errorRenameFolder = translations['GROWL_ALERT.ERROR.RENAME_FOLDER'];
        fileStillExists = translations['GROWL_ALERT.ERROR.RENAME_FILE'];
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
      browseVm.restService.copy(browseVm.currentFolder.workGroup, browseVm.nodeItem, browseVm.currentFolder.uuid)
        .then(function(newNode) {
          browseVm.$mdDialog.hide({
            nodeItem: newNode,
            folder: browseVm.currentFolder
          });
        });
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
      browseVm.nodeItem.parent = browseVm.currentFolder.uuid;
      browseVm.nodeItem.save().then(function(newNode) {
        browseVm.$mdDialog.hide({
          nodeItem: newNode,
          folder: browseVm.currentFolder
        });
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26445 :
          case 28005 :
            toastService.error(fileStillExists);
            browseVm.nodeItem.parent = browseVm.sourceFolder.uuid;
            break;
        }
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
            toastService.error(errorRenameFolder);
          }, 0);
        } else {
          browseVm.canCreateFolder = true;
        }
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26445 :
          case 28005 :
            toastService.error(errorRenameFolder);
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
