/**
 * WorkgroupNodesController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .controller('WorkgroupNodesController', WorkgroupNodesController);

  WorkgroupNodesController.$inject = ['$q', '$scope', '$state', '$stateParams', '$timeout', '$translate',
    '$translatePartialLoader', 'documentUtilsService', 'flowUploadService', 'lsAppConfig', 'nodesList',
    'tableParamsService', 'toastService', 'workgroupRestService', 'workgroupMembersRestService',
    'workgroupNodesRestService'];

  /**
   * @namespace WorkgroupNodesController
   * @desc Application Workgroup Nodes system controller
   * @memberOf LinShare.sharedSpace
   */
  function WorkgroupNodesController($q, $scope, $state, $stateParams, $timeout, $translate, $translatePartialLoader,
                                    documentUtilsService, flowUploadService, lsAppConfig, nodesList, tableParamsService,
                                    toastService, workgroupRestService, workgroupMembersRestService,
                                    workgroupNodesRestService) {
    /* jshint validthis:true */
    var workgroupNodesVm = this;

    // TODO : remove it when create/update edition mode will be implemented
    const FOLDERS_DEV = ['Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia and Herzegowina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Congo, the Democratic Republic of the', 'Cook Islands', 'Costa Rica', 'Cote d\'Ivoire', 'Croatia (Hrvatska)', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands (Malvinas)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'France Metropolitan', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard and Mc Donald Islands', 'Holy See (Vatican City State)', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, Democratic People\'s Republic of', 'Korea, Republic of', 'Kuwait', 'Kyrgyzstan', 'Lao, People\'s Democratic Republic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libyan Arab Jamahiriya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia, The Former Yugoslav Republic of', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia, Federated States of', 'Moldova, Republic of', 'Monaco', 'Mongolia', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia (Slovak Republic)', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'Spain', 'Sri Lanka', 'St. Helena', 'St. Pierre and Miquelon', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen Islands', 'Swaziland', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Taiwan, Province of China', 'Tajikistan', 'Tanzania, United Republic of', 'Thailand', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Virgin Islands (British)', 'Virgin Islands (U.S.)', 'Wallis and Futuna Islands', 'Western Sahara', 'Yemen', 'Yugoslavia', 'Zambia', 'Zimbabwe'];

    const TYPE_DOCUMENT = 'DOCUMENT';
    const TYPE_FOLDER = 'FOLDER';

    // TODO : for all REST callbacks messages, remove them when interceptor will be set
    var copyNodeSuccessMessage, deleteNodeError26006Message, deleteNodeSuccessMessage, invalideNameTranslate,
      swalMultipleDownloadTitle, swalMultipleDownloadText, swalMultipleDownloadConfirm;

    workgroupNodesVm.addUploadedDocument = addUploadedDocument;
    workgroupNodesVm.copyNode = copyNode;
    workgroupNodesVm.createFolder = createFolder;
    workgroupNodesVm.currentPage = 'workgroup_nodes';
    workgroupNodesVm.currentSelectedDocument = {};
    workgroupNodesVm.deleteNodes = deleteNodes;
    workgroupNodesVm.downloadFile = downloadFile;
    workgroupNodesVm.flowUploadService = flowUploadService;
    workgroupNodesVm.folderDetails = $stateParams;
    workgroupNodesVm.getNodeDetails = getNodeDetails;
    workgroupNodesVm.goToFolder = goToFolder;
    workgroupNodesVm.isDocument = isDocument;
    workgroupNodesVm.loadSidebarContent = loadSidebarContent;
    workgroupNodesVm.mdtabsSelection = {selectedIndex: 0};
    workgroupNodesVm.nodesList = nodesList;
    workgroupNodesVm.paramFilter = {name: ''};
    workgroupNodesVm.showSelectedNodeDetails = showSelectedNodeDetails;
    workgroupNodesVm.showWorkgroupDetails = showWorkgroupDetails;
    workgroupNodesVm.unavailableMultiDownload = unavailableMultiDownload;
    workgroupNodesVm.workgroupPage = lsAppConfig.workgroupPage;
    workgroupNodesVm.workgroupDetailFile = lsAppConfig.workgroupDetailFile;

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
        'GROWL_ALERT.ACTION.COPY',
        'GROWL_ALERT.ERROR.DELETE_ERROR.26006',
        'GROWL_ALERT.ACTION.DELETE_SINGULAR',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
        'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON',
        'GROWL_ALERT.ERROR.RENAME_INVALID'])
        .then(function(translations) {
          copyNodeSuccessMessage = translations['GROWL_ALERT.ACTION.COPY'];
          deleteNodeError26006Message = translations['GROWL_ALERT.ERROR.DELETE_ERROR.26006'];
          deleteNodeSuccessMessage = translations['GROWL_ALERT.ACTION.DELETE_SINGULAR'];
          swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadText = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
          swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
          invalideNameTranslate = translations['GROWL_ALERT.ERROR.RENAME_INVALID']
            .replace('$rejectedChar', lsAppConfig.rejectedChar.join('-, -').replace(new RegExp('-', 'g'), '\''));
        });

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
          toastService.success(copyNodeSuccessMessage);
          addNewItemInTableParams(data);
        });
    }

    /**
     * @name createFolder
     * @desc Create a folder
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function createFolder() {
      workgroupNodesRestService.create(workgroupNodesVm.folderDetails.workgroupUuid, {
        // TODO : remove this logic when renaming service will be implemented
        name: FOLDERS_DEV[Math.floor((Math.random() * FOLDERS_DEV.length) + 1)],
        parent: workgroupNodesVm.folderDetails.folderUuid,
        type: TYPE_FOLDER
      }).then(function(data) {
        workgroupNodesVm.nodesList.push(data);
        workgroupNodesVm.tableParamsService.reloadTableParams();
      });
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
            toastService.success(deleteNodeSuccessMessage);
            _.remove(workgroupNodesVm.nodesList, restangularizedItem);
            _.remove(workgroupNodesVm.selectedDocuments, restangularizedItem);
            workgroupNodesVm.tableParamsService.reloadTableParams();
          }, function(error) {
            if (error.status === 400 && error.data.errCode === 26006) {
              toastService.error(deleteNodeError26006Message);
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
      workgroupNodesRestService.download(workgroupNodesVm.folderDetails.workgroupUuid, fileDocument.uuid)
        .then(function(fileStream) {
          // TODO : Change this service to something generic for documents and workgroups (filesService.js or else..)
          documentUtilsService.downloadFileFromResponse(fileStream, fileDocument.name, fileDocument.type);
        });
    }

    /**
     * @name getNodeDetails
     * @desc Get node details and thumbnail if exists
     * @param {Object} nodeItem - A node object
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
        deferred.resolve(nodeDetails);
      }, function(error) {
        deferred.reject(error);
      });
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
            icon: 'zmdi zmdi-file-plus fab-groups',
            flowBtn: true,
            hide: workgroupNodesVm.currentWorkgroupMember.readonly
          });
        });
    }

    /**
     * @name goToFolder
     * @desc Enter inside a folder
     * @param {object} folder - Folder where to enter
     * @param {boolean} fromBreadcrumb - If user entering in this folder from breadcrumb or not
     * @param {boolean} needReplace - If keeping history is required or not
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function goToFolder(folder, fromBreadcrumb, needReplace) {
      if (!workgroupNodesVm.isDocument(folder.nodeType)) {
        var folderNameElem = $('td[uuid=' + folder.uuid + ']').find('.file-name-disp');
        var options = needReplace ? {location: 'replace'} : {};
        if (angular.element(folderNameElem).attr('contenteditable') === 'false' || fromBreadcrumb) {
          $state.go('sharedspace.workgroups.nodes', {
            workgroupUuid: folder.workGroup,
            workgroupName: workgroupNodesVm.folderDetails.workgroupName.trim(),
            parentUuid: folder.parent,
            folderUuid: folder.uuid,
            folderName: folder.name.trim()
          }, options);
        }
      }
    }

    /**
     * @name isDocument
     * @desc Determine if the nodeType is a document
     * @param {string} nodeType - The type of the node
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
     * @param {String} content - The id of the content to load, see app/views/includes/sidebar-right.html for possible values
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    // TODO : service with content and vm as parameter (because these 3 line are always same in all controller...)
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(workgroupNodesVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
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
          label: 'WORKGROUPS_LIST.PROJECT',
          icon: 'groups-project disabled-work-in-progress',
          //TODO - SMA: Icon not working
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }, {
          action: null,
          label: 'WORKGROUPS_LIST.SHARED_FOLDER',
          icon: 'groups-shared-folder disabled-work-in-progress',
          //TODO - SMA: Icon not working
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }, {
          action: function() {
            return workgroupNodesVm.createFolder();
          },
          label: 'WORKGROUPS_LIST.FOLDER',
          icon: 'groups-folder'
        }, {
          action: null,
          label: 'WORKGROUPS_LIST.UPLOAD_REQUEST',
          icon: 'zmdi zmdi-pin-account disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }, {
          action: function() {
            return workgroupNodesVm.showWorkgroupDetails(true);
          },
          label: 'WORKGROUPS_LIST.ADD_A_MEMBER',
          icon: 'groups-add-member'
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
        workgroupNodesVm.loadSidebarContent(workgroupNodesVm.workgroupDetailFile);
      });
    }

    /**
     * @name showWorkgroupDetails
     * @desc Get current workgroup details
     * @param {boolean} [showMemberTab] - Show add member tab
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showWorkgroupDetails(showMemberTab) {
      workgroupRestService.get(workgroupNodesVm.folderDetails.workgroupUuid).then(function(data) {
        workgroupNodesVm.currentSelectedDocument.current = data;
        workgroupNodesVm.mdtabsSelection.selectedIndex = showMemberTab ? 1 : 0;
        workgroupNodesVm.loadSidebarContent(workgroupNodesVm.workgroupPage);
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

    $scope.$on('$stateChangeSuccess', function() {
      angular.element('.multi-select-mobile').appendTo('body');
    });

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
