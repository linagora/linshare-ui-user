'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module('linshare.share', ['restangular', 'ui.bootstrap', 'linshare.components'])

/**
 * @ngdoc service
 * @name linshare.share.service:LinshareShareService
 * @description
 *
 * Service to get and post all information about files shared by the user
 */
  .factory('LinshareShareService', function (Restangular, $log) {
    return {
      getMyShares: function () {
        $log.debug('LinshareShareService : getMyShares');
        return Restangular.all('shares').getList();
      },
      getShare: function(uuid) {
        $log.debug('LinshareShareService : getShare');
        return Restangular.one('shares', uuid).get();
      },
      shareDocuments: function (shareDocument) {
        $log.debug('LinshareShareService : shareDocuments');
        return Restangular.all('shares').post(shareDocument);
      },
      download: function(uuid) {
        $log.debug('LinshareShareService : downloadShare');
        return Restangular.one('shares', uuid).one('download').get();
      },
      downloadThumbnail: function(uuid) {
        $log.debug('LinshareShareService : downloadThumbnail');
        return Restangular.one('shares', uuid).one('thumbnail').get();
      },
      delete: function(uuid) {
        $log.debug('LinshareShareService : delete');
        return Restangular.one('shares', uuid).remove();
      },
      autocomplete: function(pattern) {
        $log.debug('FileService:autocomplete');
        return Restangular.all('users').one('autocomplete', pattern).get();
      }
    };
  })

  .factory('ShareObjectService', function() {

    return function() {

      this.id = null;

      this.share = {};

      this.validationStep = null;

      this.flowObjectFiles = {};

      this.linshareFiles = [];
    };

    //SETTER AND GETTER AND OTHER METHODS

  })


/**
 * @ngdoc controller
 * @name linshare.share.controller:LinshareShareController
 * @description
 *
 * The controller to manage shared documents
 */
  .controller('LinshareShareController', function($scope, $filter, NgTableParams, sharedDocumentsList) {
    $scope.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function($defer, params) {
        var files =  params.sorting() ? $filter('orderBy')(sharedDocumentsList, params.orderBy()) : sharedDocumentsList;
        params.total(files.length);
        $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  })

  .controller('LinshareShareActionController', function($scope, LinshareShareService, $log, $stateParams, growlService, $translate) {

    //Share Object
    $scope.share = {
      recipients: [],
      documents: []
    };

    //angular.forEach($scope.selectedDocuments, function(doc) {
    //  $scope.share.documents.push(doc.uuid);
    //});
    //
    //$scope.$watch('selectedDocuments', function(n) {
    //  if (n) {
    //    $scope.share.documents = [];
    //    angular.forEach(n, function(doc) {
    //      $scope.share.documents.push(doc.uuid);
    //    });
    //  }
    //}, true);

    $translate('GROWL_ALERT.SHARE').then(function(translations) {
      $scope.growlMsgShareSuccess = translations;
    });

    $scope.selectedContact = {};
    $scope.submitShare = function(shareCreationDto) {
      angular.forEach($scope.selectedDocuments, function(doc) {
        shareCreationDto.documents.push(doc.uuid);
      });
      if ($scope.selectedContact.length > 0) {
        shareCreationDto.recipients.push({mail: $scope.selectedContact});
      }
      LinshareShareService.shareDocuments(shareCreationDto).then(function() {
        $scope.share.recipients = [];
        $scope.share.documents = [];
        growlService.notifyTopRight($scope.growlMsgShareSuccess, 'success');
        $scope.$emit('linshare-upload-complete');
        $scope.mactrl.sidebarToggle.right = false;
        angular.element('tr').removeClass('info');
        $scope.initSelectedDocuments();
      });
    };

    $scope.filesToShare = $stateParams.selected;

    $scope.shareCreationObject = function() {
      this._recipients = [];
      this._documents = [];
      this.secured = false;
      this.creationAcknowledgement = false;
      this.expirationDate = null;
      this.subject = '';
      this.enableUSDA = false;
      this.notificationDateForUSDA = null;
      this.sharingNote = '';
      this.mailingListUuid = '';
      this.creationAcknowledgement = false;
      var self = this;

      this.addRecipient = function(contact) {
        var exists = false;
        angular.forEach(self._recipients, function(elem) {
          if (elem.mail === contact.mail && elem.domain === contact.domain) {
            exists = true;
            $log.info('The contact ' + contact.mail + ' is already in the recipients list');
          }
        });
        if (!exists) {
          self._recipients.push(_.omit(contact, 'restrictedContacts', 'uuid'));
        }
      };

      this.addDocument = function(documents) {
        angular.forEach(documents, function(doc) {
          self._documents.push(doc);
        });
      }

    }

    })
    .controller('LinshareAdvancedShareController', function($scope) {

    angular.forEach($scope.filesToShare, function(doc) {
      $scope.share.documents.push(doc.uuid);
    });

    $scope.id = 1;
    var dropDownIsOpen = false;
    // list - upon clicking on any contact list item, it is removed
    $scope.removeItem = function($event) {
      var currItem = $event.currentTarget;
      $(currItem).parent().parent().css("display", "none");
    };

    // pop up :  save recipients to a list
    // once the  : "save as list" button is clicked it sets the field to focus
    $scope.toggled = function() {
      dropDownIsOpen = !dropDownIsOpen;
      if (dropDownIsOpen) {
        $("#labelList").focus();
      }
    };
    /* once the "create button" is clicked (located within the "save as list" pop up) it launches a function and then
     closes the drop down pop up
     */
    $scope.createRecipientList = function($event) {
      closeDropdownPopUp($event)
    };
    /* once the cancel button is clicked (located within the "save as list" pop up) it launches a function and then
     closes the drop down pop up
     */
    $scope.closeDropdown = function($event) {
      closeDropdownPopUp($event);
    };

    function closeDropdownPopUp($event) {
      $(".savelistBtn").click();
    }

    /* chosen : if the user selects an item located within the select dropdown, it launches a function
     in order to create a new contact chip  */
    $(".chosen-select").chosen({
      width: "100%"
    });
    $('.chosen-results').on('change', function(evt, params) {
      createNewItem();
    });

    function createNewItem() {}
    /* affix : slide 2 recipients: set up required in order to maintain the left sidebar recipient selection
     onto the screen after the users scrolls down beyond the "add recipient" first field's position*/
    $(function() {
      setSticky();
      $(window).resize(function() {
        setSticky();
      });

      function setSticky() {
        var wWidth = $(".sticky").parent().width();
        if (wWidth > 768) {
          if (!!$('.sticky').offset()) {
            var widthSticky = (wWidth * 41) / 100;
            $(".sticky").css("max-width", widthSticky);
            var stickyTop = $('.sticky').offset().top;
            stickyTop -= 50; // our header height
            $(window).scroll(function() { // scroll event
              var windowTop = $(window).scrollTop();
              if (stickyTop < windowTop) {
                $('.sticky').css({
                  position: 'fixed',
                  top: 50
                });
              } else {
                $('.sticky').css({
                  position: 'static',
                  clear: 'both'
                });
              }
            });
          }
          $("#recipientsCtn").removeClass("w768");
          $(".custumListContainer").css({
            width: '58%'
          });
        }
        if (wWidth < 450) {
          $("#recipientsCtn").addClass("w450");
        }
        if ((wWidth > 450) && ($("#recipientsCtn").hasClass("w450"))) {
          $("#recipientsCtn").removeClass("w450");
        }
        if (wWidth < 750) {
          $(".sticky").css("max-width", "100%");
          $(".custumListContainer").css({
            width: '100%'
          });
          $("#recipientsCtn").addClass("w768");
        }
      }
    });
    /*slider navigation code */
    $scope.currSlide = 1;

    function clearNavClasses() {
      $(".slideCtn").removeClass('goToSlide1 goToSlide2 goToSlide3');
    }

    function setSendLink() {
      $(".transfertFilesBtnCtn .nextLink").addClass('hide');
      $(".transfertFilesBtnCtn .sendLink").removeClass('hide');
    }

    function resetSendLink() {
      $(".transfertFilesBtnCtn .sendLink").addClass('hide');
      $(".transfertFilesBtnCtn .nextLink").removeClass('hide');
    }

    function goToNextSlide(currNum) {
      var currSlideNum = currNum;
      var nextNumSlide = currSlideNum + 1;
      clearNavClasses();
      resetSendLink();
      if (currNum == 1) {
        var isSlideDone = $(".sliderLinksCtn div:nth-child(" + currSlideNum + ")").hasClass('done');
        if (!isSlideDone) $(".form-wizard-nav .progress-bar").css('width', '50%');
      } else if (currNum == 2) {
        $(".form-wizard-nav .progress-bar").css('width', '100%');
        setSendLink();
      } else if (currNum == 3) {
        nextNumSlide = 1;
      }
      $(".slideCtn").addClass('goToSlide' + nextNumSlide + '');
      $(".form-wizard-nav div.active").removeClass('active');
      $(".sliderLinksCtn div:nth-child(" + nextNumSlide + ")").addClass('active');
      $(".sliderLinksCtn div:nth-child(" + currSlideNum + ")").addClass('done');
      $scope.currSlide = nextNumSlide;
    }

    function goToPreviousSlide(currNum) {
      var currSlideNum = currNum;
      var prevNumSlide = currSlideNum - 1;
      clearNavClasses();
      resetSendLink();
      if (currNum == 1) {
        prevNumSlide = 1;
      }
      $(".slideCtn").addClass('goToSlide' + prevNumSlide + '');
      $(".form-wizard-nav div.active").removeClass('active');
      $(".sliderLinksCtn div:nth-child(" + prevNumSlide + ")").addClass('active');
      $scope.currSlide = prevNumSlide;
    }
    $scope.moveSliderForward = function() {
      goToNextSlide($scope.currSlide);
    }

    $scope.moveSliderBackwards = function() {
      goToPreviousSlide($scope.currSlide);
    }
    $scope.goToSlide = function(numSlide) {
      resetSendLink();
      clearNavClasses();
      if (numSlide == 3) {
        setSendLink();
      }
      $(".slideCtn").addClass('goToSlide' + numSlide);
      $(".form-wizard-nav div.active").removeClass('active');
      $(".sliderLinksCtn div:nth-child(" + numSlide + ")").addClass('active');
      $scope.currSlide = numSlide;
    }
    $scope.showBtnList = function($event) {
      var showBtnListElem = $event.currentTarget;
      if ($(showBtnListElem).hasClass('activeShowMore')) {
        $(showBtnListElem).parent().prev().find('div').first().removeClass('dataListSlideToggle');
        $(showBtnListElem).removeClass('activeShowMore');
        $(showBtnListElem).css('display:none !important;');
      } else {
        $(showBtnListElem).addClass('activeShowMore').parent().prev().find('div').first().addClass('dataListSlideToggle');
      }
    }
  })
  .controller('DemoCtrl', function() {

    this.isOpen = false;

    this.selectedMode = 'md-scale';

    this.selectedDirection = 'left';
  });
