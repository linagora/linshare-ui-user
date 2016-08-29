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
      get: function(uuid) {
        $log.debug('LinshareShareService : get a Share');
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
        return Restangular.all('autocomplete').one(pattern).get({type: 'SHARING'});
      }
    };
  })

  .factory('LinshareFunctionalityService', function(Restangular, $log, $q) {
    var allFunctionalities = {};
    var deferred = $q.defer();
    return {
      getAll: function() {
        $log.debug('Functionality:getAll');
        return Restangular.all('functionalities').getList().then(function(allfunc) {
          angular.forEach(allfunc, function(elm) {
            allFunctionalities[elm.identifier] = elm;
          });
          deferred.resolve(allFunctionalities);
          return deferred.promise;
        });
      },
      get: function(funcId) {
        $log.debug('Functionality:get');
        return Restangular.all('functionalities').one(funcId).get();
      }
    };
  })

  /* jshint ignore:start */
  .factory('ShareObjectService', function($log, LinshareFunctionalityService, LinshareShareService, $q, growlService) {

    var
      recipients = [],
      documents = [],
      mailingListUuid = [],
      functionalities = {},
      expirationDate = {enable: false, value: '', userCanOverride: false},
      creationAcknowledgement = {enable: false, value: '', userCanOverride: false},
      enableUSDA = {},
      notificationDateForUSDA = {enable: false, value: '', userCanOverride: false},
      secured = {enable: false, value: '', userCanOverride: false},
      waitingUploadIdentifiers = [];
      //submitShare = false;

    LinshareFunctionalityService.getAll().then(function(func) {
      //Getting functionalities in map format
      angular.forEach(func, function(elm) {
        functionalities[elm.identifier] = elm;
      });

      //if share_expiration is activated, then set default value
      if(functionalities.SHARE_EXPIRATION.enable) {
        expirationDate.enable = true;
        expirationDate.value = moment().endOf('day').add(functionalities.SHARE_EXPIRATION.value,
          functionalities.SHARE_EXPIRATION.unit).subtract(1, 'd').valueOf();
        expirationDate.userCanOverride = functionalities.SHARE_EXPIRATION.canOverride;
      }

      //if creationAcknowledgement is activated, then set default value
      if(functionalities.SHARE_CREATION_ACKNOWLEDGEMENT_FOR_OWNER.enable) {
        creationAcknowledgement.enable = true;
        creationAcknowledgement.value = functionalities.SHARE_CREATION_ACKNOWLEDGEMENT_FOR_OWNER.value;
        creationAcknowledgement.userCanOverride = functionalities.SHARE_CREATION_ACKNOWLEDGEMENT_FOR_OWNER.canOverride;
      }

      if(functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT.enable) {
        enableUSDA.enable = true;
        enableUSDA.value = functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT.value;
        enableUSDA.userCanOverride = functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT.canOverride;
      }

      if(functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT__DURATION.enable) {
        notificationDateForUSDA.enable = true;
        notificationDateForUSDA.value = moment().add(functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT__DURATION.value,
        'days').valueOf();
        notificationDateForUSDA.userCanOverride = functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT__DURATION.canOverride;
      }

      if(functionalities.ANONYMOUS_URL.enable) {
        secured.enable = true;
        secured.value = functionalities.ANONYMOUS_URL.value;
        secured.userCanOverride = functionalities.ANONYMOUS_URL.canOverride;
      }
    });


    function shareObjectForm() {

      this.secured = secured;
      this.creationAcknowledgement = creationAcknowledgement;

      this.expirationDate = expirationDate;
      this.enableUSDA = enableUSDA;
      this.notificationDateForUSDA = notificationDateForUSDA;

      this.sharingNote = '';
      this.subject = '';
      this.message = '';

      this.asyncShare = false;
      this.setAsyncShare = function(state) {
        self.asyncShare = state;
      };

      this.flowObjectFiles = {};

      this.waitingUploadIdentifiers = [];

      var self = this;

      this.addRecipient = function(contact) {
        var exists = false;
        switch (contact.type) {
          case 'simple':
                angular.forEach(recipients, function (elem) {
                  if (elem.mail === contact.identifier) {
                    exists = true;
                    $log.info('The user ' + contact.identifier + ' is already in the recipients list');
                  }
                });
                if (!exists) {
                  contact.mail = contact.identifier;
                  recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
                }
                break;
          case 'user':
                angular.forEach(recipients, function (elem) {
                  if (elem.mail === contact.mail && elem.domain === contact.domain) {
                    exists = true;
                    $log.info('The user ' + contact.mail + ' is already in the recipients list');
                  }
                });
                if (!exists) {
                  recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
                }
                break;
          case 'mailinglist':
                angular.forEach(mailingListUuid, function(element) {
                  if(element.identifier === contact.identifier) {
                    exists = true;
                    $log.info('The list ' + contact.listName + ' is already in the mailinglist');
                  }
                });
                if (!exists) {
                  mailingListUuid.push(contact.identifier);
                }
                break;
        }
      };

      this.removeRecipient = function(index) {
        recipients.splice(index, 1);
      };

      this.removeMailingList = function(index) {
        mailingListUuid.splice(index, 1);
      };

      this.addDocuments = function (documentList) {
        if(!angular.isArray(documentList)) {
          documentList = [documentList];
        }
        angular.forEach(documentList, function (doc) {
          documents.push(doc);
        });
      };

      this.addwaitingUploadIdentifiers = function(identifier) {
        self.waitingUploadIdentifiers.push(identifier);
      };

      this.getFormObj = function() {
        var docUuid = [];
        angular.forEach(documents, function(doc) {
          docUuid.push(doc.uuid);
        });
        return {
          recipients: recipients,
          documents: docUuid,
          mailingListUuid: mailingListUuid,
          secured: secured.value,
          creationAcknowledgement: creationAcknowledgement.value,
          expirationDate: expirationDate.value,
          enableUSDA: enableUSDA.value,
          notificationDateForUSDA: notificationDateForUSDA.value,
          sharingNote: self.sharingNote,
          subject: self.subject,
          message: self.message
        }
      };

      this.getObjectCopy = function() {
        return {
          recipients: recipients,
          documents: documents,
          mailingListUuid: mailingListUuid,
          secured: secured.value,
          creationAcknowledgement: creationAcknowledgement.value,
          expirationDate: expirationDate.value,
          enableUSDA: enableUSDA.value,
          notificationDateForUSDA: notificationDateForUSDA.value,
          sharingNote: self.sharingNote,
          subject: self.subject,
          message: self.message
        };
      };

      this.share = function() {
        var deferred = $q.defer();
        if(self.waitingUploadIdentifiers.length === 0) {
          return LinshareShareService.shareDocuments(self.getFormObj()).then(function() {
            growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE', 'inverse');
          });
        } else {
          deferred.reject({statusText: 'asyncMode'});
          return deferred.promise;
        }
      };

      //on file upload complete check if id is in the waiting share
      this.addLinshareDocumentsAndShare = function(flowIdentifier, linshareDocument) {
        var ind = self.waitingUploadIdentifiers.indexOf(flowIdentifier);
        if(ind > -1) {
          documents.push(linshareDocument);
          self.waitingUploadIdentifiers.splice(ind, 1);
        }
        self.share();
      };

      this.resetForm = function() {
        recipients = [];
        documents = [];
        mailingListUuid = [];
        self.secured = secured;
        self.creationAcknowledgement = creationAcknowledgement;

        self.expirationDate = expirationDate;
        self.enableUSDA = enableUSDA;
        self.notificationDateForUSDA = notificationDateForUSDA;

        self.sharingNote = '';
        self.subject = '';
        self.message = '';

        self.asyncShare = false;
        self.setAsyncShare = function(state) {
          self.asyncShare = state;
        };
      };

      this.getRecipients = function() {
        return recipients;
      };

      this.getDocuments = function() {
        return documents;
      };

      this.getMailingListUuid = function() {
        return mailingListUuid;
      };

      this.isValid = function() {
        return documents.length > 0 && (recipients.length || mailingListUuid.length > 0);
      };
    }
    return shareObjectForm;
  })
  /* jshint ignore:end */

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

  .controller('LinshareShareActionController', function($scope, LinshareShareService, $log, $stateParams, growlService,
                                                        $translate, ShareObjectService) {

    $scope.newShare = new ShareObjectService();

    $scope.selectedContact = {};

    $scope.closeSideBar = function() {
      $scope.newShare.resetForm();
      $scope.mactrl.sidebarToggle.right = false;
    };

    $scope.submitShare = function(shareCreationDto, selectedDocuments, selectedUploads) {
      var currentUploads = selectedUploads || {};
      for(var upload in currentUploads) {
        if(currentUploads.hasOwnProperty(upload)) {
          var flowFile = $scope.$flow.getFromUniqueIdentifier(upload);
          flowFile.isSelected = false;
          if(flowFile.isComplete()) {
            $scope.newShare.addDocuments(flowFile.linshareDocument);
          } else {
            $scope.refFlowShares[upload] = [$scope.share_array.length];
            $scope.newShare.addwaitingUploadIdentifiers(upload);
          }
        }
      }

      if($scope.selectedDocuments.length === 0 && Object.keys(currentUploads).length === 0) {
        growlService.notifyBottomRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'danger');
        return;
      }
      if(shareCreationDto.getRecipients().length === 0 ) {
        growlService.notifyBottomRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT', 'danger');
        return;
      }

      $scope.newShare.addDocuments($scope.selectedDocuments);
      $scope.newShare.share().then(function() {
        $scope.$emit('linshare-upload-complete');
        $scope.mactrl.sidebarToggle.right = false;
        $scope.share_array.push(angular.copy($scope.newShare.getObjectCopy()));
        $scope.newShare.resetForm();
        $scope.resetSelectedDocuments();
        for(var upload in currentUploads) {
          if(currentUploads.hasOwnProperty(upload)) {
            delete $scope.selectedUploads[upload];
          }
        }
      }, function(data) {
        if(data.statusText === 'asyncMode') {
          $log.debug('share processing with files in upload progress', data);
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE_ASYNC', 'inverse');
          $scope.mactrl.sidebarToggle.right = false;
          $scope.newShare.currentUpload = [];
          // $scope.share_array.push(angular.copy($scope.newShare));
          for(var upload in currentUploads) {
            if(currentUploads.hasOwnProperty(upload)) {
              $scope.newShare.currentUpload.push(currentUploads[upload]);
              delete $scope.selectedUploads[upload];
            }
          }
          $scope.share_array.push(angular.copy($scope.newShare));
        } else {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE_FAILED', 'danger');
        }
      });
    };
    $scope.submitQuickShare = function(shareCreationDto) {
      angular.forEach($scope.selectedDocuments, function(doc) {
        shareCreationDto.documents.push(doc.uuid);
      });
      if ($scope.selectedContact.length > 0) {
        shareCreationDto.recipients.push({mail: $scope.selectedContact});
      }
      LinshareShareService.shareDocuments(shareCreationDto).then(function() {
        growlService.notifyTopRight($scope.growlMsgShareSuccess, 'inverse');
        $scope.$emit('linshare-upload-complete');
        $scope.mactrl.sidebarToggle.right = false;
        angular.element('tr').removeClass('highlightListElem');
        $scope.resetSelectedDocuments();
      });
    };

    $scope.filesToShare = $stateParams.selected;
  })

  .controller('shareDetailController', function($scope, shareIndex) {
    //$scope.shareToDisplay = $scope.share_array[shareIndex];
    var currentShare = $scope.share_array[shareIndex];


    if(currentShare.waitingUploadIdentifiers) {
      $scope.shareToDisplay = currentShare.getObjectCopy();
      $scope.selectedDocuments = currentShare.getDocuments();
      $scope.selectedDocuments.documents.push(currentShare.currentUpload);
      $scope.shareToDisplay.documents = $scope.selectedDocuments.documents;
    } else {
      $scope.shareToDisplay = currentShare;
      $scope.selectedDocuments = currentShare.documents;
    }
    $scope.shareIndex = shareIndex;
    $scope.sidebarRightDataType = 'active-share-details';
    $scope.mactrl.sidebarToggle.right = true;
  })

  .controller('LinshareAdvancedShareController', function($scope, $log, LinshareShareService, growlService) {

    $scope.sharesContainer = {waiting: [], done: []};
    $scope.onfileComplete = function () {
      if($scope.sharesContainer.waiting.length > 0) {
        // $scope.sharesContainer.waiting
      }
    };

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
      if (dropDownIsOpen) {
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
        if (wWidth > 768) {
          if (!!angular.element('.sticky').offset()) {
            var widthSticky = (wWidth * 41) / 100;
            angular.element('.sticky').css('max-width', widthSticky);
            var stickyTop = angular.element('.sticky').offset().top;
            stickyTop -= 50; // our header height
            angular.element(window).scroll(function() { // scroll event
              var windowTop = angular.element(window).scrollTop();
              if (stickyTop < windowTop) {
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
          angular.element('.custumListContainer').css({
            width: '58%'
          });
        }
        if (wWidth < 450) {
          angular.element('#recipientsCtn').addClass('w450');
        }
        if ((wWidth > 450) && (angular.element('#recipientsCtn').hasClass('w450'))) {
          angular.element('#recipientsCtn').removeClass('w450');
        }
        if (wWidth < 750) {
          angular.element('.sticky').css('max-width', '100%');
          angular.element('.custumListContainer').css({
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
        if (wWidth > 768) {
          if (!!angular.element('.sticky').offset()) {
            var widthSticky = (wWidth * 41) / 100;
            angular.element('.sticky').css('max-width', widthSticky);
            var stickyTop = angular.element('.sticky').offset().top;
            stickyTop -= 50; // our header height
            angular.element(window).scroll(function() { // scroll event
              var windowTop = angular.element(window).scrollTop();
              if (stickyTop < windowTop) {
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
          angular.element('.custumListContainer').css({
            width: '58%'
          });
        }
        if (wWidth < 450) {
          angular.element('#recipientsCtn').addClass('w450');
        }
        if ((wWidth > 450) && (angular.element('#recipientsCtn').hasClass('w450'))) {
          angular.element('#recipientsCtn').removeClass('w450');
        }
        if (wWidth < 750) {
          angular.element('.sticky').css('max-width', '100%');
          angular.element('.custumListContainer').css({
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
      if (currNum === 1) {
        var isSlideDone = angular.element('.sliderLinksCtn div:nth-child(' + currSlideNum + ')').hasClass('done');
        if (!isSlideDone) {
          angular.element('.form-wizard-nav .progress-bar').css('width', '50%');
        }
      } else if (currNum === 2) {
        angular.element('.form-wizard-nav .progress-bar').css('width', '100%');
        setSendLink();
      } else if (currNum === 3) {
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
      if (currNum === 1) {
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
      if (numSlide === 3) {
        setSendLink();
      }
      angular.element('.slideCtn').addClass('goToSlide' + numSlide);
      angular.element('.form-wizard-nav div.active').removeClass('active');
      angular.element('.sliderLinksCtn div:nth-child(' + numSlide + ')').addClass('active');
      $scope.currSlide = numSlide;
    };
    $scope.showBtnList = function($event) {
      var showBtnListElem = $event.currentTarget;
      if (angular.element(showBtnListElem).hasClass('activeShowMore')) {
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

        $scope.numSelectedItems.length=numItems;
      }
       else {
        if(n.origin !== 'directive') {

          angular.element('.media-body').removeClass('highlightListElem');
          $scope.numSelectedItems.pop($scope.numSelectedItems.length);
        }
      }
    }, true);

    // display the files pertaining to the clicked share
    $scope.showSharingItems=function(numIndex){
      $scope.isCurrentPartage=true;
      numIndex++;
      /*jshint unused:false */
      angular.element('.media-body').each(function(index) {
        if(angular.element(this).hasClass('partage'+numIndex)){
          angular.element(this).addClass('highlightListElem');
        }
      });
      $scope.numSelectedItems.length=angular.element('.partage'+numIndex+'').length;
      angular.element('#selection-actions').addClass('showMultiMenu');
          $scope.currentSharingIndex = numIndex;
          $scope.isUpdate=true;
    };

    // add numbered classes onto each file list item
    $scope.createSharing= function(){
      // if new share
      if(!$scope.isUpdate) {
        $scope.numberOfSharings++;
        $scope.resetSelection();
        $scope.sharingsBtn.push(1);
        // slide up the multiselect menu
        $scope.closeMultiSelectMenu();
        $scope.numSelectedItems.length=0;
      }else{
        $scope.updateSharing();
      }
    };
    // update the selection of the files  for the current or newly created share
    $scope.resetSelection=function(){
      /*jshint unused:false */
      angular.element('.media-body').each(function(index) {
        angular.element(this).removeClass('partage' + $scope.numberOfSharings);
        if(angular.element( this ).hasClass('highlightListElem')){
          if(!$scope.isUpdate) {
            angular.element(this).addClass('partage' + $scope.numberOfSharings);
          }else{
            angular.element(this).addClass('partage' + $scope.currentSharingIndex);
          }
        }
      });
    };
    $scope.updateSharing= function(){
      $scope.resetSelection();
      $scope.numSelectedItems.pop($scope.numSelectedItems.length);
      $scope.closeMultiSelectMenu();
      $scope.currentSharingIndex=0;
      $scope.isUpdate=false;
      $scope.isCurrentPartage=true;
    };
    // if closure of multiselect reset state
    angular.element('.exitSelection').bind('click',function() {
      $scope.isCurrentPartage=false;
      $scope.isUpdate=false;
    });
    // if share link has been clicked show quishare here
    angular.element('.partageLink').click(function(){
      $scope.$apply(function() {
        $scope.isCurrentPartage = true;
      });
    });
    // if closure of multiselect reset state
    $scope.closeMultiSelectMenu=function(){
      angular.element('#selection-actions').removeClass('showMultiMenu');
      angular.element('.media-body').removeClass('highlightListElem');
    };

    $scope.currentSharingIndex=0;
    $scope.numberOfSharings=0;
    $scope.isUpdate=false;
    $scope.isCurrentPartage=false;
    $scope.sharingsBtn=[];
    $scope.onShare = function() {
      angular.element('#focusInputShare').focus();
      $scope.sidebarRightDataType = 'more-options';
    };

  })
  .controller('DemoCtrl', function() {

    this.isOpen = false;
    this.selectedMode = 'md-scale';
    this.selectedDirection = 'left';
  })
  .directive('uploadBoxSelection', function() {
      return {
      restrict: 'A',
      scope: false,
      link: function(scope, elm) {
        function checkifMultiMenuVisible(){
          if(scope.numSelectedItems.length === 0){
            angular.element('#selection-actions').addClass('showMultiMenu');
          }
        }
        elm.bind('click', function() {
          var numItems=angular.element('.media-body').length;
          var isCurrentlySelected=elm.hasClass('highlightListElem');
          elm.toggleClass('highlightListElem','removeListElem');
          checkifMultiMenuVisible();

        if(scope.isAllSelected.status === true) {
            scope.$apply(function() {
              scope.isAllSelected.status = false;
              scope.isAllSelected.origin = 'directive';
            });
        }
          if(isCurrentlySelected){
            scope.$apply(function() {
              scope.numSelectedItems.pop(1);
            });
          }else {
            scope.$apply(function() {
              scope.numSelectedItems.push(1);
              var numSelectedItems=scope.numSelectedItems.length;
              if(numSelectedItems === numItems) {
                elm.addClass('highlightListElem');
                scope.isAllSelected.status = true;
              }
            });
          }

          if(numItems === 0){
            angular.element('.dragNDropCtn').removeClass('outOfFocus');
          }
        });

            angular.element('.exitSelection').bind('click',function(){
           scope.closeContextualToolBar();
         });

        scope.closeContextualToolBar = function() {

          scope.$apply(function() {
            scope.numSelectedItems.pop(scope.numSelectedItems.length);
          });
          angular.element('#selection-actions').removeClass('showMultiMenu');
          angular.element('.media-body').removeClass('highlightListElem');
        };
      }
    };
  });
