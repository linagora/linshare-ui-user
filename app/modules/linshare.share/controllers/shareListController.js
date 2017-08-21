/**
 * LinshareShareListController Controller
 * @namespace LinShare.share
 */
(function() {
  'use strict';

  angular
    .module('linshare.share')
    .controller('LinshareShareListController', LinshareShareListController);

  LinshareShareListController.$inject = ['_', '$scope', '$state', '$translate', '$translatePartialLoader',
    'lsAppConfig', 'previousState', 'shareIndex', 'swal'
  ];

  /**
   *  @namespace LinshareShareListController
   *  @desc Controller for managing shared elements
   *  @memberOf LinShare.share
   */
  function LinshareShareListController(_, $scope, $state, $translate, $translatePartialLoader, lsAppConfig,
    previousState, shareIndex, swal) {

    var
      shareListVm = this,
      swalTitle,
      swalText,
      swalConfirm,
      swalCancel;

    shareListVm.activeShareDetails = lsAppConfig.activeShareDetails;
    shareListVm.cancelShare = cancelShare;
    shareListVm.confirmCancel = confirmCancel;
    shareListVm.currentShare = $scope.shareArray[shareIndex];
    shareListVm.goToPreviousState = goToPreviousState;
    shareListVm.loadSidebarContent = loadSidebarContent;
    shareListVm.shareIndex = Number(shareIndex) + 1;
    shareListVm.waitingShareDetails = lsAppConfig.waitingShareDetails;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.share.LinshareShareListController
     */
    function activate() {
      if (!_.isUndefined(shareListVm.currentShare)) {
        $translatePartialLoader.addPart('filesList');
        shareListVm.selectedDocuments = shareListVm.currentShare.documents;
        shareListVm.loadSidebarContent(shareListVm.activeShareDetails);
        $translate(['SWEET_ALERT.ON_SHARE_DELETE.TITLE', 'SWEET_ALERT.ON_SHARE_DELETE.TEXT',
            'SWEET_ALERT.ON_SHARE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_SHARE_DELETE.CANCEL_BUTTON'
          ])
          .then(function(translations) {
            swalTitle = translations['SWEET_ALERT.ON_SHARE_DELETE.TITLE'];
            swalText = translations['SWEET_ALERT.ON_SHARE_DELETE.TEXT'];
            swalConfirm = translations['SWEET_ALERT.ON_SHARE_DELETE.CONFIRM_BUTTON'];
            swalCancel = translations['SWEET_ALERT.ON_SHARE_DELETE.CANCEL_BUTTON'];
          });

      } else {
        $state.transitionTo('home');
      }
    }

    /**
     *  @name cancelShare
     *  @desc Cancel the current share seleced
     *  @param {Object} shareObject - The Share object to cancel
     *  @memberOf LinShare.share.LinshareShareListController
     */
    function cancelShare(shareObject) {
      shareListVm.confirmCancel(shareObject, function(item) {
        _.remove($scope.shareArray, item);
        shareListVm.goToPreviousState();
      });
    }

    /**
     *  @name confirmCancel
     *  @desc Show a pop up to comfirm the cancel of the share
     *  @param {Object} item - The share object concern by the deletion
     *  @param {Function} callback - Function to be called on success
     *  @memberOf LinShare.share.LinshareShareListController
     */
    function confirmCancel(item, callback) {
      swal({
          title: swalTitle,
          text: swalText,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: swalConfirm,
          cancelButtonText: swalCancel,
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm) {
          if (isConfirm) {
            callback(item);
          }
        }
      );
    }

    /**
     *  @name goToPreviousState
     *  @desc Go back to the previous page the user was on
     *  @memberOf LinShare.share.LinshareShareListController
     */
    function goToPreviousState() {
      $state.go(previousState.Name, previousState.Params);
      $scope.mainVm.sidebar.hide();
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} content The id of the content to load
     *                 see app/views/includes/sidebar-right.html for possible values
     * @memberOf LinShare.share.LinshareShareListController
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      $scope.mainVm.sidebar.setContent(content || shareListVm.activeShareDetails);
      $scope.mainVm.sidebar.show();
    }
  }
})();
