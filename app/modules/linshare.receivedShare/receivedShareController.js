'use strict';
angular.module('linshare.receivedShare')
  .controller('ReceivedController',
    function($scope,  $filter, $window, $translatePartialLoader, ngTableParams, LinshareReceivedShareService, LinshareShareService, files){
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
        if ($scope.showActions.length !== $scope.tableData.length && $scope.showActions.length !== 0) {
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
      $scope.files = setExtensions(files);
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
            angular.forEach($scope.files, function(f, k) {
              if (f.uuid === file.uuid) {
                $scope.files.splice(k, 1);
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
      $scope.remove = function() {
        swal({
          title: 'Are you sure?',
          text: 'You will not be able to recover this imaginary file!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, delete it!',
          closeOnConfirm: false
        }, function(){
          angular.forEach($scope.showActions, function(file, key) {
            LinshareReceivedShareService.delete(file.uuid).then(function(){
              angular.forEach($scope.files, function(f, k) {
                if (f.uuid === file.uuid) {
                  $scope.files.splice(k, 1);
                  $scope.showActions.splice(key, 1);
                  $scope.tableParams.reload();
                }
              });
            });
          });
          swal('Deleted!', 'Your imaginary file has been deleted.', 'success');
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
            function(file, key) {
            if (!file.isChecked) {
              isSelected = false;
            }
          });
          $scope.datasIsSelected = check;
        }
      });

      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25
      }, {
        getData: function($defer, params){
          var filteredData = $scope.files;
          params.filter().name = $scope.filters.name;
          var userData = {
            firstName: $scope.selectedRecipient.firstName,
            lastName: $scope.selectedRecipient.lastName,
            mail: $scope.selectedRecipient.mail
          };
          if($scope.showRecipients === false) {
            userData = {};
          }
          params.filter().sender = {};
          params.filter().sender = userData;

          // i load the files in the ngTable and i stock it in the scope
          // with this method when i will delete file i can reload ngTable with the new data
          if ($scope.showUnit || $scope.showDateRange) {
            if(($scope.showUnit === false) && ($scope.filters.sizeStart === null)) {
              $scope.filters.sizeStart = null;
              $scope.filters.sizeEnd = null;
            }
            filteredData = _.filter(filteredData, function(file){
              var sizeIsValide = true;
              var dateIsValide = true;
              if($scope.showUnit === true){
                if ($scope.filters.sizeStart || $scope.filters.sizeEnd) {
                  // convert the size to select byte
                  var start = ($scope.filters.sizeStart) ? parseInt($scope.filters.sizeStart, 10) * parseInt($scope.filters.unity, 10) : 0;
                  var end = ($scope.filters.sizeEnd) ? parseInt($scope.filters.sizeEnd, 10) * parseInt($scope.filters.unity, 10) : file.size + 10;
                  var size = file.size.toFixed(1);
                  sizeIsValide = (size >= start && size <= end);
                }
              }
              if ($scope.showDateRange) {
                var dateFile = ($scope.filters.dateType === '1') ? moment(file.modificationDate) : moment(file.creationDate);
                // moment set la date a 00:00, il faut ajouter une journée afin de cibler la journée entiere
                var dateEnd;
                if($scope.filters.dateEnd){
                  dateEnd = moment($scope.filters.dateEnd).add('day', +1);
                }else{
                  dateEnd = moment().add('day', +1);
                }

                dateIsValide = (dateFile >= $scope.filters.dateStart && dateFile <= dateEnd);
              }
              return (sizeIsValide && dateIsValide);
            });
            filteredData = params.filter() ?
              $filter('filter')(filteredData, params.filter()) :
              filteredData;
            $scope.tableData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          } else {
            filteredData = params.filter() ?
              $filter('filter')($scope.files, params.filter()) :
              $scope.files;
            $scope.tableData = params.sorting() ?
              $filter('orderBy')(filteredData, params.orderBy()) :
              filteredData;
          }
          params.total($scope.tableData.length);
          $defer.resolve($scope.tableData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
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
    }).directive('slideable', function () {
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
