'use strict';
angular.module('linshare.receivedShare')
  .controller('ReceivedController',
    function($scope,  $filter, $window, $translatePartialLoader, ngTableParams, LinshareReceivedShareService,
             LinshareShareService, LinshareDocumentService, files, $translate, growlService, $log){
      $translatePartialLoader.addPart('filesList');
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
      $scope.filters.selectedContact = initDestinataireObject;
      $scope.selectedRecipient = {};
      var checkdatasIsSelecteds = function() {
        if ($scope.showActions.length !== orderedData.length && $scope.showActions.length !== 0) {
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
        angular.forEach(list, function(value, key) {
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
      $scope.copy = function() {
        angular.forEach($scope.showActions, function(file, key) {
          LinshareReceivedShareService.copy(file.uuid).then(function(data) {
            angular.forEach(receivedFiles, function(f, k) {
              if (f.uuid === file.uuid) {
                receivedFiles.splice(k, 1);
                $scope.showActions.splice(key, 1);
                $scope.tableParams.reload();
              }
            });
          });
        });
      };
      $scope.download = function() {
        angular.forEach($scope.showActions, function(file, key) {
          LinshareReceivedShareService.download(file.uuid).then(function(data) {
            var url;
            var contentType = file.type;
            var blob = new Blob([data], {type: contentType});
            var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
            //  creation of a Blob object using the BlobBuilder Api
             // https://msdn.microsoft.com/fr-fr/library/hh779016(v=vs.85).aspx
            if (navigator.msSaveBlob) {
              navigator.msSaveBlob(blob, file.name);
            }
            else if (urlCreator) {
              // create tag element a to simulate a download by click
              var link = document.createElement('a');

              // if the attribute download isset in the tag a
              if ('download' in link) {
                // Prepare a blob URL
                url = urlCreator.createObjectURL(blob);

                // Set the attribute to the tag element a
                link.setAttribute('href', url);
                link.setAttribute('download', file.name);

                // Simulate clicking the download link
                var event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                link.dispatchEvent(event);
              }
              else {
                // Prepare a blob URL
                // Use application/octet-stream when using window.location to force download
                blob = new Blob([data], { type: octetStreamMime });
                url = urlCreator.createObjectURL(blob);
                $window.location = url;
              }
            }
          });
        });
      };

      $scope.multipleSelection = true;
      $scope.selectedDocuments = [];//basket
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

      $scope.$watch('mactrl.sidebarToggle.right', function(n) {
        if(n === true) {
          angular.element('.card').css('width', '70%');
        } else {
          angular.element('.card').css('width', '100%');
        }
      });
      $scope.loadSidebarContent = function(content) {
        $scope.sidebarData = content || 'share';
      };

      $scope.onShare = function() {
        $('#focusInputShare').focus();
        $scope.loadSidebarContent();
      };

      $scope.showCurrentFile = function(currentFile) {
        $scope.currentSelectedDocument.current = currentFile;
        $scope.sidebarData = 'details';
        if(currentFile.shared > 0) {
          LinshareDocumentService.getFileInfo(currentFile.uuid).then(function(data) {
            $scope.currentSelectedDocument.current.shares = data.shares;
          });
        }
        if(currentFile.hasThumbnail === true) {
          LinshareDocumentService.getThumbnail(currentFile.uuid).then(function(thumbnail) {
            $scope.currentSelectedDocument.current.thumbnail = thumbnail;
          });
        }
        $scope.mactrl.sidebarToggle.right = true;
      };


      //$scope.remove = function() {
      //  swal({
      //    title: 'Are you sure?',
      //    text: 'You will not be able to recover this imaginary file!',
      //    type: 'warning',
      //    showCancelButton: true,
      //    confirmButtonColor: '#DD6B55',
      //    confirmButtonText: 'Yes, delete it!',
      //    closeOnConfirm: false
      //  }, function(){
      //    angular.forEach($scope.showActions, function(file, key) {
      //      LinshareReceivedShareService.delete(file.uuid).then(function(){
      //        angular.forEach(receivedFiles, function(f, k) {
      //          if (f.uuid === file.uuid) {
      //            receivedFiles.splice(k, 1);
      //            $scope.showActions.splice(key, 1);
      //            $scope.tableParams.reload();
      //          }
      //        });
      //      });
      //    });
      //    swal('Deleted!', 'Your imaginary file has been deleted.', 'success');
      //  });
      //};

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
              angular.forEach(document, function(doc, indice) {
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
            function(file, key) {
            if (!file.isChecked) {
              isSelected = false;
            }
          });
          $scope.datasIsSelected = check;
        }
      });

      $scope.paramFilter = {
        name: ''
      };

      $scope.documentsList2 = receivedFiles;
      $scope.documentsList = receivedFiles;

      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25,
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
            var y =innerHeightInnerCtn;
            var  stateExpandedStyle = $('#searchFilterCtn').attr('style');
            var resetOverflowStyle = stateExpandedStyle.replace('initial', 'hidden');
            var resetHeightStyle =  resetOverflowStyle.replace('' + y + 'px', '0px');

            $('#searchFilterCtn').attr('style', resetOverflowStyle).delay(10).promise().done(function() {
              $('#searchFilterCtn').attr('style', resetHeightStyle);
            });
          }
          attrs.expanded = !attrs.expanded;
        });
      }
    };
  });
