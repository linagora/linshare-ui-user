angular
  .module('linshare.components')
  .controller('quickShareController', quickShareController);

quickShareController.$inject = [
  'tableParamsService',
  'lsAppConfig',
  'toastService',
  '$q',
  'LinshareDocumentRestService',
  'sidebarService',
  '$timeout'
];

function quickShareController(tableParamsService, lsAppConfig, toastService, $q, LinshareDocumentRestService, sidebarService, $timeout) {
  const quickShareVm = this;

  quickShareVm.$onInit = $onInit;

  function $onInit() {
    quickShareVm.form = {};
    quickShareVm.tableParamsService = tableParamsService;
    quickShareVm.linshareModeProduction = lsAppConfig.production;
    quickShareVm.lsAppConfig = lsAppConfig;
    quickShareVm.displayAdvancedOptions = false;
    quickShareVm.toggleDisplayAdvancedOptions = toggleDisplayAdvancedOptions;
    sidebarService.addData('submitForward', submitForward);
  }

  function handleErrors(shareCreationDto, selectedDocuments, selectedUploads) {
    if (selectedDocuments.length === 0 &&
      (selectedUploads === undefined || (Object.keys(selectedUploads).length === 0))) {
      toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT'});

      return true;
    }
    if (shareCreationDto.getRecipients().length === 0 && shareCreationDto.getMailingListUuid().length === 0) {
      toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT'});

      return true;
    }
  }

  function toggleDisplayAdvancedOptions() {
    if (quickShareVm.displayAdvancedOptions) {
      quickShareVm.displayAdvancedOptions = false;
    } else {
      quickShareVm.displayAdvancedOptions = true;
      $('#content-ctn-sidebar').animate(
        {
          scrollTop: $('#advanced-options-anchor').offset().top
        },
        400
      );
    }
  }

  function submitForward (shareCreationDto, selectedDocuments) {
    if (handleErrors(shareCreationDto, selectedDocuments) || (quickShareVm.form && !quickShareVm.form.$valid)) {
      focusToError(quickShareVm.form);

      return;
    }

    return copyItemsToMySpace(selectedDocuments).then(data => {
      data = data || {};
      const { resolvedItems, rejectedItems } = data;

      if (resolvedItems && resolvedItems.length) {
        shareCreationDto.addDocuments(resolvedItems);
        shareCreationDto.share(false).then(() => {
          showToastAlertFor('forward', 'info', resolvedItems);
          if(quickShareVm.onAfterShare) {
            quickShareVm.onAfterShare();
          }
        }).catch(() => {
          showToastAlertFor('copy_before_forward', 'info', resolvedItems);
        });
      }

      if (rejectedItems && rejectedItems.length) {
        showToastAlertFor('forward', 'error', rejectedItems);
      }
    });
  }

  function copyItemsToMySpace(items = []) {
    return $q.allSettled(items.map(item => LinshareDocumentRestService.copy(item.uuid, 'RECEIVED_SHARE')))
      .then(promises => {
        const copied = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value[0]);
        const rejectedPromises = promises
          .filter(promise => promise.state === 'rejected')
          .map(promise => promise.reason);

        return {
          resolvedItems: copied,
          rejectedItems: rejectedPromises
        };
      });
  }

  function showToastAlertFor(action, type, items = []) {
    if (action === 'forward') {
      toastService[type]({
        key: `TOAST_ALERT.ACTION.FORWARD.${type.toUpperCase()}`,
        pluralization: true,
        params: {
          singular: items.length === 1,
          nbItems: items.length
        }
      }, type === 'success' && 'TOAST_ALERT.ACTION_BUTTON');
    }
  }

  function focusToError(form) {
    const invalidFields = $('input.ng-invalid, textarea.ng-invalid');

    if (invalidFields.length) {
      if (form.notificationDateIfUndownloaded && form.notificationDateIfUndownloaded.$invalid) {
        quickShareVm.displayAdvancedOptions = true;
      }

      $timeout(() => {
        invalidFields.first().trigger('focus');
      }, 300);
    }
  }
}
