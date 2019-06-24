/**
 * @file Angular controller to interact with the system of AnonymousUrl
 * @copyright LINAGORA © 2009–2019
 * @license AGPL-3.0
 * @module anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('filesList');
      $translatePartialLoaderProvider.addPart('anonymousUrl');
    }])
    .controller('AnonymousUrlController', AnonymousUrlController);

  AnonymousUrlController.$inject = [
    '_',
    '$filter',
    '$log',
    '$state',
    '$uibModal',
    'anonymousUrlService',
    'anonymousUrlData',
    'NgTableParams'
  ];

  /**
   * @class AnonymousUrlController
   * @description Anonymous url management system controller
   * @memberOf LinShare.anonymousUrl
   */
  function AnonymousUrlController(
    _,
    $filter,
    $log,
    $state,
    $uibModal,
    anonymousUrlService,
    anonymousUrlData,
    NgTableParams
  ) {

    /* jshint validthis:true */
    var anonymousUrlVm = this;

    anonymousUrlVm.activate = activate;
    anonymousUrlVm.anonymousUrlData = {};
    anonymousUrlVm.anonymousUrlShareEntries = [];
    anonymousUrlVm.download = download;
    anonymousUrlVm.loadTable = loadTable;
    anonymousUrlVm.modalPasswordShow = modalPasswordShow;
    anonymousUrlVm.paramFilter = {
      name: ''
    };
    anonymousUrlVm.urlData = anonymousUrlData;
    activate();

    ////////////

    /**
     * @function
     * @name activate
     * @description Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function activate() {
      if (anonymousUrlVm.urlData.protectedByPassword) {
        anonymousUrlVm.modalPasswordShow();
      } else {
        anonymousUrlVm.tableParams = anonymousUrlVm.loadTable();
      }
    }

    /**
     * @function
     * @name download
     * @description Retrieve the file from the server
     * @param {Object} documentFile - A Document object
     * @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function download(documentFile) {
      var url = anonymousUrlService.downloadUrl(anonymousUrlVm.urlData.uuid, anonymousUrlVm.password,
                                                documentFile.uuid);
      var downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', url);
      downloadLink.setAttribute('download', documentFile.name);

      if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        downloadLink.dispatchEvent(event);
      } else {
        downloadLink.click();
      }

      downloadLink.remove();
    }

    /**
     * @function
     * @name loadTable
     * @description Load the table
     * @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function loadTable() {
      return new NgTableParams({
        page: 1,
        sorting: {
          modificationDate: 'desc'
        },
        filter: anonymousUrlVm.paramFilter,
        count: 10
      }, {
        total: anonymousUrlVm.anonymousUrlShareEntries.length,
        getData: function(params) {
          return anonymousUrlService.getAnonymousUrl(anonymousUrlVm.urlData.uuid, anonymousUrlVm.password)
            .then(function(anonymousUrl) {
              anonymousUrlVm.anonymousUrlData = anonymousUrl.data;
              anonymousUrlVm.anonymousUrlShareEntries = anonymousUrlVm.anonymousUrlData.documents;
              var filteredData = params.filter() ?
                $filter('filter')(anonymousUrlVm.anonymousUrlShareEntries, params.filter()) :
                anonymousUrlVm.anonymousUrlShareEntries;
              var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
              params.total(files.length);
              return (files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            });
        }
      });
    }

    /**
     * @class modalPasswordShow
     * @description Open a modal dialog for the user to input the password
     * @memberOf LinShare.anonymousUrl.AnonymousUrlController
     */
    function modalPasswordShow() {
      anonymousUrlVm.modalPassword = $uibModal.open({
        backdrop: 'static',
        backdropClass: 'modal-backdrop',
        size: 'swal',
        controller: function modalPasswordController($state, $uibModalInstance) {
          /* jshint validthis: true*/
          var modalPasswordVm = this;
          modalPasswordVm.hasError = hasError;
          modalPasswordVm.hide = hide;
          modalPasswordVm.invalid = false;
          modalPasswordVm.submit = submit;

          /**
           * @function
           * @name hasError
           * @description Determine if the field is in an error state
           * @param {object} form - A form dom object
           * @param {object} field - A field fom object
           * @returns {Boolean} Error state of the field
           * @memberOf LinShare.anonymousUrl.AnonymousUrlController.modalPasswordShow
           */
          function hasError(form, field) {
            return ((field.$touched || form.$submitted) && field.$invalid);
          }

          /**
           * @function
           * @name hide
           * @description Hide the modal dialog
           * @memberOf LinShare.anonymousUrl.AnonymousUrlController.modalPasswordShow
           */
          function hide() {
            $state.go('anonymousUrl.home');
            $uibModalInstance.close();
          }

          /**
           * @function
           * @name submit
           * @description Submit the form of the modal dialog
           * @memberOf LinShare.anonymousUrl.AnonymousUrlController.modalPasswordShow
           */
          function submit() {
            anonymousUrlVm.password = modalPasswordVm.password;
            anonymousUrlService.getAnonymousUrl(anonymousUrlVm.urlData.uuid, anonymousUrlVm.password)
              .then(function(data) {
                 if (data.status === 403) {
                   if (!_.isUndefined(modalPasswordVm.password) && modalPasswordVm.password !== '') {
                     modalPasswordVm.invalid = true;
                   }
                   $log.debug('Bad input for anonymous url password', data);
                 } else if (data.status === 404) {
                   $state.go('anonymousUrl.home', {
                     'error': data.status
                   });
                   $log.debug('Anonymous url password doesn\'t exist', data);
                 } else {
                   modalPasswordVm.invalid = false;
                   anonymousUrlVm.tableParams = anonymousUrlVm.loadTable();
                   $uibModalInstance.close();
                 }
              }).catch(function(data) {
                $log.debug('Error on password submit', data);
              });
          }
        },
        controllerAs: 'modalPasswordVm',
        templateUrl: 'modules/linshare.anonymousUrl/views/passwordModal.html'
      });
    }
  }
})();
