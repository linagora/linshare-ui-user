/**
 * DocumentPreviewToolbar Controller
 * @namespace linshare.components.documentPreviewButton.components
 */

angular
  .module('linshare.components')
  .controller('DocumentPreviewToolbarController', DocumentPreviewToolbarController);

DocumentPreviewToolbarController.$inject = [
  '_',
  'documentPreviewService',
  'functionalityRestService'
];

function DocumentPreviewToolbarController(
  _,
  documentPreviewService,
  functionalityRestService
) {
  const documentPreviewToolbarVm = this;

  documentPreviewToolbarVm.$onInit = $onInit;
  documentPreviewToolbarVm.$onChanges = $onChanges;
  documentPreviewToolbarVm.close = documentPreviewService.close;
  documentPreviewToolbarVm.copyToMySpace = documentPreviewService.copyToMySpace;
  documentPreviewToolbarVm.copyToWorkgroup = documentPreviewService.copyToWorkgroup;
  documentPreviewToolbarVm.download = documentPreviewService.download;
  documentPreviewToolbarVm.executeAndClose = documentPreviewService.executeAndClose;
  documentPreviewToolbarVm.showItemDetails = documentPreviewService.showItemDetails;
  documentPreviewToolbarVm.canDownloadItem = canDownloadItem;
  documentPreviewToolbarVm.TYPE_FOLDER = 'FOLDER';

  ////////////

  /**
   * @name $onInit
   * @desc Initialization function of the component
   * @namespace linshare.components.documentPreviewButton.components.DocumentPreviewToolbarController
   */
  function $onInit() {
    documentPreviewToolbarVm.canCopyToMySpace = !_.isNil(documentPreviewService.copyToMySpace);


    functionalityRestService
      .getAll()
      .then(({
        WORK_GROUP,
        WORK_GROUP__DOWNLOAD_ARCHIVE
      }) => {
        documentPreviewToolbarVm.canCopyToWorkGroup = !_.isNil(documentPreviewService.copyToWorkgroup) && WORK_GROUP && WORK_GROUP.enable;
        documentPreviewToolbarVm.downloadFolderEnabled = WORK_GROUP__DOWNLOAD_ARCHIVE && WORK_GROUP__DOWNLOAD_ARCHIVE.enable;
      });
  }

  /**
   * @name $onChanges
   * @desc Called whenever one-way bindings are updated
   * @namespace linshare.components.documentPreviewButton.components.DocumentPreviewToolbarController
   */
  function $onChanges() {
    documentPreviewToolbarVm.item = Object.assign(
      {},
      documentPreviewToolbarVm.item,
      documentPreviewService.getItem()
    );
  }

  function canDownloadItem(item) {
    return item.type === documentPreviewToolbarVm.TYPE_FOLDER ? documentPreviewToolbarVm.downloadFolderEnabled : true ;
  }
}
