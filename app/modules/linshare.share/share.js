'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module('linshare.share', ['restangular', 'ui.bootstrap'])

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


/**
 * @ngdoc controller
 * @name linshare.share.controller:LinshareShareController
 * @description
 *
 * The controller to manage shared documents
 */
  .controller('LinshareShareController', function($scope, $filter, ngTableParams, sharedDocumentsList) {
    $scope.tableParams = new ngTableParams({
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
    $scope.share = {
      recipients: [],
      documents: []
    };

    angular.forEach($scope.selectedDocuments, function(doc) {
      $scope.share.documents.push(doc.uuid);
    });

    $scope.$watch('selectedDocuments', function(n) {
      if (n) {
        $scope.share.documents = [];
        angular.forEach(n, function(doc) {
          $scope.share.documents.push(doc.uuid);
        });
      }
    }, true);

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
        growlService.growl($scope.growlMsgShareSuccess, 'inverse');
        $scope.$emit('linshare-upload-complete');
      });
    };

    $scope.filesToShare = $stateParams.selected;
  })
  .controller('LinshareAdvancedShareController', function($scope, allFunctionalities) {
    angular.forEach($scope.filesToShare, function(doc) {
      $scope.share.documents.push(doc.uuid);
    });
    $scope.allFunctionalities = allFunctionalities;

  })
  .controller('nomController', function($scope) {



    $scope.currSlide=1;

   function clearNavClasses () {
      $(".slideCtn").removeClass('goToSlide1 goToSlide2 goToSlide3');

    }
    function setSendLink(){
      $(".transfertFilesBtnCtn .nextLink").addClass('hide');
      $(".transfertFilesBtnCtn .sendLink").removeClass('hide');
    }
    function resetSendLink(){
      $(".transfertFilesBtnCtn .sendLink").addClass('hide');
      $(".transfertFilesBtnCtn .nextLink").removeClass('hide');
    }
    function goToNextSlide (currNum) {

     var currSlideNum=currNum;
     var nextNumSlide=currSlideNum+1;
     clearNavClasses();
      resetSendLink();

      if(currNum==1){
        var isSlideDone=$(".sliderLinksCtn div:nth-child("+currSlideNum+")").hasClass('done');
        if(!isSlideDone)$(".form-wizard-nav .progress-bar").css('width','50%');
      }else if(currNum==2){
        $(".form-wizard-nav .progress-bar").css('width','100%');
        setSendLink();

      }else if(currNum==3){
        nextNumSlide=1;
      }
      $(".slideCtn").addClass('goToSlide'+nextNumSlide+'');
      $(".form-wizard-nav div.active").removeClass('active');
      $(".sliderLinksCtn div:nth-child("+nextNumSlide+")").addClass('active');
      $(".sliderLinksCtn div:nth-child("+currSlideNum+")").addClass('done');
      $scope.currSlide =nextNumSlide;
    }


    function goToPreviousSlide (currNum) {
      var currSlideNum=currNum;
      var prevNumSlide=currSlideNum-1;
      clearNavClasses();
      resetSendLink();
      if(currNum==1){
        prevNumSlide=1;
      }
      $(".slideCtn").addClass('goToSlide'+prevNumSlide+'');
      $(".form-wizard-nav div.active").removeClass('active');
      $(".sliderLinksCtn div:nth-child("+prevNumSlide+")").addClass('active');
      $scope.currSlide =prevNumSlide;
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
      if(numSlide==3) {
        setSendLink();
      }
      $(".slideCtn").addClass('goToSlide'+numSlide);
      $(".form-wizard-nav div.active").removeClass('active');
      $(".sliderLinksCtn div:nth-child("+numSlide+")").addClass('active');
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
