'use strict';

angular.module('linshareUiUserApp')
  .controller('headerCtrl', function($timeout, $translate){

    // Top Search
    this.openSearch = function(){
      angular.element('#header').addClass('search-toggled');
    };

    this.closeSearch = function(){
      angular.element('#header').removeClass('search-toggled');
    };

    //Clear Notification
    this.clearNotification = function($event) {
      $event.preventDefault();

      var x = angular.element($event.target).closest('.listview');
      var y = x.find('.lv-item');
      var z = y.size();

      angular.element($event.target).parent().fadeOut();

      x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
      x.find('.grid-loading').fadeIn(1500);
      var w = 0;

      y.each(function(){
        var z = $(this);
        $timeout(function(){
          z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
            z.remove();
          });
        }, w+=150);
      });

      $timeout(function(){
        angular.element('#notifications').addClass('empty');
      }, (z*150)+200);
    };

    // Clear Local Storage
    var self = this;
    $translate(['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TITLE', 'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TEXT',
      'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.DONE',
      'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.IS_CLEARED']).then(function(translations) {
      self.swalTitle = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TITLE'];
      self.swalText = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TEXT'];
      self.swalConfirm = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.CONFIRM_BUTTON'];
      self.swalDone = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.DONE'];
      self.swalCleared = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.IS_CLEARED'];
    });

    this.clearLocalStorage = function() {

      //Get confirmation, if confirmed clear the localStorage
      var thisLocal = this;
      swal({
        title: this.swalTitle,
        text: this.swalText,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#F44336',
        confirmButtonText: this.swalConfirm,
        closeOnConfirm: false
      }, function(){
        localStorage.clear();
        swal(thisLocal.swalDone, thisLocal.swalCleared, 'inverse');
      });

    };

    //Fullscreen View
    this.fullScreen = function() {
      //Launch
      function launchIntoFullscreen(element) {
        if(element.requestFullscreen) {
          element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }

      //Exit
      function exitFullscreen() {
        if(document.exitFullscreen) {
          document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }

      if (exitFullscreen()) {
        launchIntoFullscreen(document.documentElement);
      }
      else {
        launchIntoFullscreen(document.documentElement);
      }
    };
  });
