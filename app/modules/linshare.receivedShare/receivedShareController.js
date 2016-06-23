'use strict';
angular.module('linshare.receivedShare')
  .controller('ReceivedController',
    function($scope,  $filter, $window, $translatePartialLoader, NgTableParams, LinshareReceivedShareService,
             LinshareShareService, LinshareDocumentService, files, $translate, growlService, $log, $timeout){
      $scope.mactrl.sidebarToggle.right = false;
      $translatePartialLoader.addPart('receivedShare');
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
        angular.forEach(list, function(value) {
          type.forEach( function (regex)
          {
            if (value.type.match(regex.regex)) {
              value.typeImage = regex.image;
              value.info = regex.info;
            }
          });
          if (!value.typeImage) {
            value.typeImage = 'fa-file-text-o';
            value.info = 'TEXT';
          }
          this.push(value);
        }, data);
        return data;
      };
      var receivedFiles = setExtensions(files);
      // Used to check/activate the checkbox related to the params
      $scope.paramsIsActivate = function(param) {
        return param > 0;
      };
      $scope.clearParams = function(){
        $scope.filters.sizeStart = null;
        $scope.filters.sizeEnd = null;
        $scope.filters.unity = '1000';
        $scope.filters.dateType = '1';
        $scope.filters.dateStart ='';
        $scope.filters.dateEnd = '';
        $scope.showUnit = true;
        $scope.filters.selectedContact = initDestinataireObject;
        $scope.popoverValue = '';
        $scope.selectedRecipient = '';
        $scope.showDateRange = true;
        $scope.tableParams.reload();
      };
      $scope.updateParams = function(){
        $scope.tableParams.reload();
        checkdatasIsSelecteds();
      };

      var swalCopyText, swalCopyConfirm;
      $translate(['SWEET_ALERT.ON_FILE_COPY.TEXT',
        'SWEET_ALERT.ON_FILE_COPY.CONFIRM_BUTTON'])
        .then(function(translations) {
          swalCopyText = translations['SWEET_ALERT.ON_FILE_COPY.TEXT'];
          swalCopyConfirm = translations['SWEET_ALERT.ON_FILE_COPY.CONFIRM_BUTTON'];
        });
      $scope.download = function() {
        angular.forEach($scope.showActions, function(file) {
          LinshareReceivedShareService.download(file.uuid).then(function(data) {
            $scope.downloadFileFromResponse(file.name, file.type, data);
          });
        });
      };

      $scope.downloadCurrentFile = function(currentFile) {
        LinshareReceivedShareService.download(currentFile.uuid).then(function(downloadedFile) {
            $scope.downloadFileFromResponse(currentFile.name, currentFile.type, downloadedFile);
          });
      };

      $scope.resetSelectedDocuments = function() {
        angular.forEach($scope.selectedDocuments, function(selectedDoc) {
          selectedDoc.isSelected = false;
        });
        $scope.selectedDocuments = [];
      };


      $scope.getDocumentThumbnail = function(uuid) {
        LinshareReceivedShareService.getThumbnail(uuid).then(function(thumbnail) {
          $scope.currentSelectedDocument.current.thumbnail = thumbnail;
        });
      };

      $scope.currentSelectedDocument = {current: ''};
      $scope.flagsOnSelectedPages = {};
      $scope.selectDocumentsOnCurrentPage = function(data, page, selectFlag) {
        var currentPage = page || $scope.tableParams.page();
        var dataOnPage = data || $scope.tableParams.data;
        var select = selectFlag || $scope.flagsOnSelectedPages[currentPage];
        if(!select) {
          angular.forEach(dataOnPage, function(element) {
            if(!element.isSelected) {
              element.isSelected = true;
              $scope.selectedDocuments.push(element);
            }
          });
          $scope.flagsOnSelectedPages[currentPage] = true;
        } else {
          $scope.selectedDocuments = _.xor($scope.selectedDocuments, dataOnPage);
          angular.forEach(dataOnPage, function(element) {
            if(element.isSelected) {
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
        $scope.currentSelectedDocument.current = currentFile;
        $scope.sidebarRightDataType = 'details';
        if(currentFile.shared > 0) {
          LinshareReceivedShareService.getReceivedShare(currentFile.uuid).then(function(data) {
            $scope.currentSelectedDocument.current.shares = data.shares;
          });
        }
        if(currentFile.hasThumbnail === true) {
          LinshareReceivedShareService.getThumbnail(currentFile.uuid).then(function(thumbnail) {
            $scope.currentSelectedDocument.current.thumbnail = thumbnail;
          });
        }
        $scope.mactrl.sidebarToggle.right = true;
        var currElm = event.currentTarget;
        angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
          angular.element(currElm).addClass('activeActionButton');
        });
      };

      var swalTitle, swalText, swalConfirm, swalCancel;
      $translate(['SWEET_ALERT.ON_FILE_DELETE.TITLE', 'SWEET_ALERT.ON_FILE_DELETE.TEXT',
        'SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'])
        .then(function(translations) {
        swalTitle = translations['SWEET_ALERT.ON_FILE_DELETE.TITLE'];
        swalText = translations['SWEET_ALERT.ON_FILE_DELETE.TEXT'];
        swalConfirm = translations['SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON'];
        swalCancel = translations['SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'];
      });
      var removeElementFromCollection = function(collection, element) {
        var index = collection.indexOf(element);
        if (index > -1) {
          collection.splice(index, 1);
        }
      };
      $scope.deleteDocuments = function(document) {
        if(!angular.isArray(document)) {
          document = [document];
        }
        swal({
            title: swalTitle,
            text: swalText,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: swalConfirm,
            cancelButtonText: swalCancel,
            closeOnConfirm: true,
            closeOnCancel: true
          },
          function(isConfirm) {
            if (isConfirm) {
              angular.forEach(document, function(doc) {
                $log.debug('value to delete', doc);
                $log.debug('value to delete', receivedFiles.length);
                LinshareReceivedShareService.delete(doc.uuid).then(function() {
                  growlService.notifyTopRight('GROWL_ALERT.ACTION.DELETE', 'success');
                  removeElementFromCollection(receivedFiles, doc);
                  removeElementFromCollection($scope.selectedDocuments, doc);
                  $scope.tableParams.reload();
                });
              });
            }
          }
        );
      };

      $scope.copyIntoFiles = function(selectedDocuments) {
        if(!angular.isArray(selectedDocuments)) {
          selectedDocuments = [selectedDocuments];
        }
        swal({
            title: swalTitle,
            text: swalCopyText,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#05b1ff',
            confirmButtonText: swalCopyConfirm,
            cancelButtonText: swalCancel,
            closeOnConfirm: true,
            closeOnCancel: true
          },
          function(isConfirm) {
            if (isConfirm) {
              angular.forEach(selectedDocuments, function(file, key) {
                LinshareReceivedShareService.copy(file.uuid).then(function() {
                  angular.forEach(receivedFiles, function(f, k) {
                    if (f.uuid === file.uuid) {
                      receivedFiles.splice(k, 1);
                      selectedDocuments.splice(key, 1);
                      $scope.tableParams.reload();
                    }
                  });
                });
              });
            }
          }
        );
      };
      $scope.sortDropdownSetActive = function(sortField, $event) {
        $scope.toggleSelectedSort = !$scope.toggleSelectedSort;
        $scope.tableParams.sorting(sortField, $scope.toggleSelectedSort ? 'desc' : 'asc');
        var currTarget = $event.currentTarget;
        angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function() {
          angular.element(currTarget).addClass('selectedSorting');
        });
      };

      // onChange on the inputs in the table
      // Insert or remove the file in the list of selected files
      $scope.setShowActions = function (documentFile) {
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
      };
      // Used by the template to select all data in the table
      // Only in the current page of the pagination table
      $scope.selectAll = function () {
        $scope.showActions = [];
        $scope.datasIsSelected = !$scope.datasIsSelected;
        angular.forEach(
          $scope.tableData.slice(($scope.tableParams.$params.page - 1) * $scope.tableParams.$params.count,
          $scope.tableParams.$params.page * $scope.tableParams.$params.count),
          function(file, key) {
          $scope.tableData[key].isChecked = $scope.datasIsSelected;
          if ($scope.datasIsSelected) {
            file.isChecked = true;
            $scope.showActions.push(file);
          }
        });
      };
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

      $scope.documentsListCopy = receivedFiles;
      $scope.documentsList = receivedFiles;

      $scope.tableParams = new NgTableParams({
        page: 1,
        sorting: {modificationDate: 'desc'},
        count: 10,
        filter: $scope.paramFilter
      }, {
        getData: function($defer, params){
          var userData = {
            firstName: $scope.selectedRecipient.firstName,
            lastName: $scope.selectedRecipient.lastName,
            mail: $scope.selectedRecipient.mail
          };
          params.filter().sender = {};
          params.filter().sender = userData;
          var filteredData = params.filter() ?
              $filter('filter')($scope.documentsList, params.filter()) : $scope.documentsList;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

      $scope.formatLabel = function(u) {
        if (u.firstName !== '' ) {
          return u.firstName.concat(' ', u.lastName);
        }
      };

      $scope.userRepresentation = function(u) {
        if (angular.isString(u)) {
          return u;
        }
        return '<span>' + u.firstName + ' ' + u.lastName + '</span> <span > <i class="zmdi zmdi-email"></i> &nbsp;'+ u.mail + '</span>';
      };

      $scope.searchGuestRestrictedContacts = function(pattern) {
        $scope.popoverValue = '';
        $scope.selectedRecipient = '';
        return LinshareShareService.autocomplete(pattern);
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

      $scope.formats = ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

      var swalCopyInGroup, swalTransferer, swalDelete, swalDownload, numItems, swalInformation;
      $translate(['ACTION.COPY_IN_MY_FILES', 'ACTION.TRANSFERT', 'ACTION.INFORMATION',
        'ACTION.DELETE', 'ACTION.DOWNLOAD', 'SELECTION.NUM_ITEM_SELECTED'])
        .then(function(translations) {
          swalCopyInGroup = translations['ACTION.COPY_IN_MY_FILES'];
          swalTransferer = translations['ACTION.TRANSFERT'];
          swalDelete = translations['ACTION.DELETE'];
          swalDownload = translations['ACTION.DOWNLOAD'];
          swalInformation = translations['ACTION.INFORMATION'];
          numItems = translations['SELECTION.NUM_ITEM_SELECTED'];
          /* jshint unused: false */
          $scope.moreOptionsContexualMenu = [
            [function($itemScope, $event) {
              return $itemScope.selectedDocuments.length + ' ' + numItems;
            }],
            [swalCopyInGroup, function($itemScope) {
              $scope.copyIntoFiles($itemScope.documentFile);
            }],
            [swalDownload, function($itemScope) {
              var landingUrl = $itemScope.linshareBaseUrl + '/documents/' + $itemScope.documentFile.uuid + '/download';
              $window.location.href = landingUrl;
            }, function($itemScope) {
              return $itemScope.selectedDocuments.length === 1;
            }],
            [swalTransferer, function($itemScope, $event, model) {
            }, function() {
              return false;
            }],
            [swalDelete, function($itemScope) {
              $scope.deleteDocuments($itemScope.selectedDocuments);
            }],
            [swalInformation, function($itemScope) {
              $scope.showCurrentFile($itemScope.documentFile);
            }, function($itemScope) {
              return $itemScope.selectedDocuments.length === 1;
            }]
          ];
        });

      $scope.closeDetailSidebar = function() {
        angular.element('#fileListTable tr li').removeClass('activeActionButton');
      };
      $scope.sortDropdownSetActive = function($event) {
        var currentStateToggle = $scope.toggleSelectedSort;
        $scope.toggleSelectedSort = !currentStateToggle;
        var currTarget = $event.currentTarget;
        angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function() {
          angular.element(currTarget).addClass('selectedSorting');
        });
      };

      $scope.toggleSearchState=function(){
        if(!$scope.searchMobileDropdown){
          $scope.openSearch();
        }else{
          $scope.closeSearch();
        }
        $scope.searchMobileDropdown = !$scope.searchMobileDropdown;
      };
      $scope.openSearch = function(){
        angular.element('#dropArea').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      };

      $scope.closeSearch = function(){
        angular.element('#dropArea').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      };

      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });

      $scope.fab = {
        isOpen: false,
        count: 0,
        selectedDirection: 'left'
      };

      $scope.$watch('fab.isOpen', function(isOpen) {
        if(isOpen) {
          angular.element('.md-toolbar-tools').addClass('setWhite');
          angular.element('.multi-select-mobile').addClass('setDisabled');
          $timeout(function() {
            angular.element('#overlayMobileFab').addClass('toggledMobileShowOverlay');
            angular.element('#content-container').addClass('setDisabled');
          }, 250);
        } else {
          angular.element('.md-toolbar-tools').removeClass('setWhite');
          $timeout(function() {
            angular.element('.multi-select-mobile').removeClass('setDisabled');
            angular.element('#overlayMobileFab').removeClass('toggledMobileShowOverlay');
            angular.element('#content-container').removeClass('setDisabled');
          }, 250);
        }
      });
      $scope.currentPage = 'received_files';
    })

  // ===========================================================================
  // SLIDEABLE
  // ===========================================================================
  .directive('slideable', function () {
    return {
      restrict:'C',
      compile: function (element) {
        // wrap tag
        var contents = element.html();
        element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

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
  })

  // ===========================================================================
  // SLIDETOGGLE
  // ===========================================================================
  .directive('slideToggle', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        attrs.expanded = false;
        element.bind('click', function() {
          var innerHeightInnerCtn = $('.slideable_content').innerHeight();
          if(!attrs.expanded) {
            var y = innerHeightInnerCtn;
            var  initClicked = $('#searchFilterCtn').attr('style');

            var heightRestStyle =  initClicked.replace('0px', y + 'px');
            var heightAndOverflow = heightRestStyle.replace('hidden', 'initial');
            $('#searchFilterCtn').attr('style', heightRestStyle).delay(750).promise().done(function() {
              $('#searchFilterCtn').attr('style', heightAndOverflow);
            });

          } else {
            innerHeightInnerCtn = $('.slideable_content').innerHeight();
            var yy = innerHeightInnerCtn;
            var  stateExpandedStyle = $('#searchFilterCtn').attr('style');
            var resetOverflowStyle = stateExpandedStyle.replace('initial', 'hidden');
            var resetHeightStyle =  resetOverflowStyle.replace('' + yy + 'px', '0px');

            $('#searchFilterCtn').attr('style', resetOverflowStyle).delay(10).promise().done(function() {
              $('#searchFilterCtn').attr('style', resetHeightStyle);
            });
          }
          attrs.expanded = !attrs.expanded;
        });
      }
    };
  });
