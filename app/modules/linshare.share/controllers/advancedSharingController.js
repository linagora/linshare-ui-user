'use strict';

angular.module('linshare.share')


/**
 * This is controller is not used in the current user flow of the application
 * It has been written for the advanced sharing with the sharing in three steps (slides)
 */
  .controller('LinshareAdvancedShareController', function($scope, $log, LinshareShareService, growlService) {

    $scope.sharesContainer = {waiting: [], done: []};

    $scope.submitShare = function(shareCreationDto, now) {
      if($scope.selectedDocuments.length === 0 ) {
        growlService.notifyTopRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'danger');
        return;
      }
      if(now) {
        LinshareShareService.shareDocuments(shareCreationDto.getFormObj()).then(function() {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE', 'inverse');
          $scope.$emit('linshare-upload-complete');
          $scope.mactrl.sidebarToggle.right = false;
          angular.element('tr').removeClass('info');
          $scope.initSelectedDocuments();
          $scope.share_array[1] = {};
        }, function(errorData) {
          growlService.notifyTopRight(errorData.statusText, 'danger');
        });
      } else {
        shareCreationDto.setAsyncShare(!now);
      }
    };
    angular.forEach($scope.filesToShare, function(doc) {
      $scope.share.documents.push(doc.uuid);
    });
    $scope.id = 1;
    var dropDownIsOpen = false;
    // list - upon clicking on any contact list item, it is removed
    $scope.removeItem = function($event) {
      var currItem = $event.currentTarget;
      angular.element(currItem).parent().parent().css('display', 'none');
    };

    // pop up :  save recipients to a list
    // once the  : "save as list" button is clicked it sets the field to focus
    $scope.toggled = function() {
      dropDownIsOpen = !dropDownIsOpen;
      if(dropDownIsOpen) {
        angular.element('#labelList').focus();
      }
    };
    function closeDropdownPopUp() {
      angular.element('.savelistBtn').click();
    }

    /* once the "create button" is clicked (located within the "save as list" pop up) it launches a function and then
     closes the drop down pop up
     */
    $scope.createRecipientList = function($event) {
      closeDropdownPopUp($event);
    };
    /* once the cancel button is clicked (located within the "save as list" pop up) it launches a function and then
     closes the drop down pop up
     */
    $scope.closeDropdown = function($event) {
      closeDropdownPopUp($event);
    };

    /*jshint unused:false */
    $scope.addUploadedDocument = function(file, message, flow) {
      var documentResponse = [angular.fromJson(message)];
      $scope.share_array[1].addDocuments(documentResponse);
    };
    $scope.isComplete = false;
    $scope.onCompleteUpload = function(shareCreationDto) {
      $scope.isComplete = true;
      if(shareCreationDto.asyncShare) {
        $scope.submitShare(shareCreationDto, true);
      }
    };
    /* chosen : if the user selects an item located within the select dropdown, it launches a function
     in order to create a new contact chip  */
    angular.element('.chosen-select').chosen({
      width: '100%'
    });
    /*jshint unused:false */
    angular.element('.chosen-results').on('change', function(evt, params) {
    });


    /* affix : slide 2 recipients: set up required in order to maintain the left sidebar recipient selection
     onto the screen after the users scrolls down beyond the "add recipient" first field's position*/
    angular.element(function() {
      function setSticky() {
        var wWidth = angular.element('.sticky').parent().width();
        if(wWidth > 768) {
          if(!!angular.element('.sticky').offset()) {
            var widthSticky = (wWidth * 41) / 100;
            angular.element('.sticky').css('max-width', widthSticky);
            var stickyTop = angular.element('.sticky').offset().top;
            stickyTop -= 50; // our header height
            angular.element(window).scroll(function() { // scroll event
              var windowTop = angular.element(window).scrollTop();
              if(stickyTop < windowTop) {
                angular.element('.sticky').css({
                  position: 'fixed',
                  top: 50
                });
              } else {
                angular.element('.sticky').css({
                  position: 'static',
                  clear: 'both'
                });
              }
            });
          }
          angular.element('#recipientsCtn').removeClass('w768');
          angular.element('.custom-list-container').css({
            width: '58%'
          });
        }
        if(wWidth < 450) {
          angular.element('#recipientsCtn').addClass('w450');
        }
        if((wWidth > 450) && (angular.element('#recipientsCtn').hasClass('w450'))) {
          angular.element('#recipientsCtn').removeClass('w450');
        }
        if(wWidth < 750) {
          angular.element('.sticky').css('max-width', '100%');
          angular.element('.custom-list-container').css({
            width: '100%'
          });
          angular.element('#recipientsCtn').addClass('w768');
        }
      }

      setSticky();
      angular.element(window).resize(function() {
        setSticky();
      });
    });
    /*slider navigation code */
    $scope.currSlide = 1;

    function clearNavClasses() {
      angular.element('.slideCtn').removeClass('goToSlide1 goToSlide2 goToSlide3');
    }

    $(function() {
      function setSticky() {
        var wWidth = angular.element('.sticky').parent().width();
        if(wWidth > 768) {
          if(!!angular.element('.sticky').offset()) {
            var widthSticky = (wWidth * 41) / 100;
            angular.element('.sticky').css('max-width', widthSticky);
            var stickyTop = angular.element('.sticky').offset().top;
            stickyTop -= 50; // our header height
            angular.element(window).scroll(function() { // scroll event
              var windowTop = angular.element(window).scrollTop();
              if(stickyTop < windowTop) {
                angular.element('.sticky').css({
                  position: 'fixed',
                  top: 50
                });
              } else {
                angular.element('.sticky').css({
                  position: 'static',
                  clear: 'both'
                });
              }
            });
          }
          angular.element('#recipientsCtn').removeClass('w768');
          angular.element('.custom-list-container').css({
            width: '58%'
          });
        }
        if(wWidth < 450) {
          angular.element('#recipientsCtn').addClass('w450');
        }
        if((wWidth > 450) && (angular.element('#recipientsCtn').hasClass('w450'))) {
          angular.element('#recipientsCtn').removeClass('w450');
        }
        if(wWidth < 750) {
          angular.element('.sticky').css('max-width', '100%');
          angular.element('.custom-list-container').css({
            width: '100%'
          });
          angular.element('#recipientsCtn').addClass('w768');
        }
      }

      setSticky();
      angular.element(window).resize(function() {
        setSticky();
      });
    });

    function setSendLink() {
      angular.element('.transfertFilesBtnCtn .nextLink').addClass('hide');
      angular.element('.transfertFilesBtnCtn .sendLink').removeClass('hide');
    }

    function resetSendLink() {
      angular.element('.transfertFilesBtnCtn .sendLink').addClass('hide');
      angular.element('.transfertFilesBtnCtn .nextLink').removeClass('hide');
    }

    function goToNextSlide(currNum) {
      var currSlideNum = currNum;
      var nextNumSlide = currSlideNum + 1;
      clearNavClasses();
      resetSendLink();
      if(currNum === 1) {
        var isSlideDone = angular.element('.sliderLinksCtn div:nth-child(' + currSlideNum + ')').hasClass('done');
        if(!isSlideDone) {
          angular.element('.form-wizard-nav .progress-bar').css('width', '50%');
        }
      } else if(currNum === 2) {
        angular.element('.form-wizard-nav .progress-bar').css('width', '100%');
        setSendLink();
      } else if(currNum === 3) {
        nextNumSlide = 1;
      }
      angular.element('.slideCtn').addClass('goToSlide' + nextNumSlide + '');
      angular.element('.form-wizard-nav div.active').removeClass('active');
      angular.element('.sliderLinksCtn div:nth-child(' + nextNumSlide + ')').addClass('active');
      angular.element('.sliderLinksCtn div:nth-child(' + currSlideNum + ')').addClass('done');
      $scope.currSlide = nextNumSlide;
    }

    function goToPreviousSlide(currNum) {
      var prevNumSlide = currNum - 1;
      clearNavClasses();
      resetSendLink();
      if(currNum === 1) {
        prevNumSlide = 1;
      }
      angular.element('.slideCtn').addClass('goToSlide' + prevNumSlide + '');
      angular.element('.form-wizard-nav div.active').removeClass('active');
      angular.element('.sliderLinksCtn div:nth-child(' + prevNumSlide + ')').addClass('active');
      $scope.currSlide = prevNumSlide;
    }

    $scope.moveSliderForward = function() {
      goToNextSlide($scope.currSlide);
    };

    $scope.moveSliderBackwards = function() {
      goToPreviousSlide($scope.currSlide);
    };
    $scope.goToSlide = function(numSlide) {
      resetSendLink();
      clearNavClasses();
      if(numSlide === 3) {
        setSendLink();
      }
      angular.element('.slideCtn').addClass('goToSlide' + numSlide);
      angular.element('.form-wizard-nav div.active').removeClass('active');
      angular.element('.sliderLinksCtn div:nth-child(' + numSlide + ')').addClass('active');
      $scope.currSlide = numSlide;
    };
    $scope.showBtnList = function($event) {
      var showBtnListElem = $event.currentTarget;
      if(angular.element(showBtnListElem).hasClass('activeShowMore')) {
        angular.element(showBtnListElem).parent().prev().find('div').first().removeClass('dataListSlideToggle');
        angular.element(showBtnListElem).removeClass('activeShowMore');
        angular.element(showBtnListElem).css('display:none !important;');
      } else {
        angular.element(showBtnListElem).addClass('activeShowMore').parent().prev().find('div').first().addClass('dataListSlideToggle');
      }
    };

    $scope.numSelectedItems = [];

    $scope.isAllSelected = {status: false, origin: ''};
    $scope.$watch('isAllSelected', function(n) {
      if(n.status === true) {
        var numItems = angular.element('.media-body').length;

        angular.element('.media-body').addClass('highlightListElem');

        $scope.numSelectedItems.length = numItems;
      }
      else {
        if(n.origin !== 'directive') {

          angular.element('.media-body').removeClass('highlightListElem');
          $scope.numSelectedItems.pop($scope.numSelectedItems.length);
        }
      }
    }, true);

    // display the files pertaining to the clicked share
    $scope.showSharingItems = function(numIndex) {
      $scope.isCurrentPartage = true;
      numIndex++;
      /*jshint unused:false */
      angular.element('.media-body').each(function(index) {
        if(angular.element(this).hasClass('partage' + numIndex)) {
          angular.element(this).addClass('highlightListElem');
        }
      });
      $scope.numSelectedItems.length = angular.element('.partage' + numIndex + '').length;
      angular.element('#selection-actions').addClass('showMultiMenu');
      $scope.currentSharingIndex = numIndex;
      $scope.isUpdate = true;
    };

    // add numbered classes onto each file list item
    $scope.createSharing = function() {
      // if new share
      if(!$scope.isUpdate) {
        $scope.numberOfSharings++;
        $scope.resetSelection();
        $scope.sharingsBtn.push(1);
        // slide up the multiselect menu
        $scope.closeMultiSelectMenu();
        $scope.numSelectedItems.length = 0;
      } else {
        $scope.updateSharing();
      }
    };
    // update the selection of the files  for the current or newly created share
    $scope.resetSelection = function() {
      /*jshint unused:false */
      angular.element('.media-body').each(function(index) {
        angular.element(this).removeClass('partage' + $scope.numberOfSharings);
        if(angular.element(this).hasClass('highlightListElem')) {
          if(!$scope.isUpdate) {
            angular.element(this).addClass('partage' + $scope.numberOfSharings);
          } else {
            angular.element(this).addClass('partage' + $scope.currentSharingIndex);
          }
        }
      });
    };
    $scope.updateSharing = function() {
      $scope.resetSelection();
      $scope.numSelectedItems.pop($scope.numSelectedItems.length);
      $scope.closeMultiSelectMenu();
      $scope.currentSharingIndex = 0;
      $scope.isUpdate = false;
      $scope.isCurrentPartage = true;
    };
    // if closure of multiselect reset state
    angular.element('.exit-selection').bind('click', function() {
      $scope.isCurrentPartage = false;
      $scope.isUpdate = false;
    });
    // if share link has been clicked show quishare here
    angular.element('.partage-link').click(function() {
      $scope.$apply(function() {
        $scope.isCurrentPartage = true;
      });
    });
    // if closure of multiselect reset state
    $scope.closeMultiSelectMenu = function() {
      angular.element('#selection-actions').removeClass('showMultiMenu');
      angular.element('.media-body').removeClass('highlightListElem');
    };

    $scope.currentSharingIndex = 0;
    $scope.numberOfSharings = 0;
    $scope.isUpdate = false;
    $scope.isCurrentPartage = false;
    $scope.sharingsBtn = [];
    $scope.onShare = function() {
      angular.element('#focusInputShare').focus();
      $scope.sidebarRightDataType = 'more-options';
    };

  });
