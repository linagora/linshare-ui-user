'use strict';

angular.module('linshareUiUserApp')
  .controller('materialadminCtrl', function($timeout, $state){

    // Detact Mobile Browser
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      angular.element('html').addClass('ismobile');
    }

    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
    this.sidebarToggle = {
      left: true,
      right: false
    };

    // By default template has a boxed layout
    this.layoutType = localStorage.getItem('ma-layout-status');

    // For Mainmenu Active Class
    this.$state = $state;

    //Close sidebar on click
    this.sidebarStat = function(event) {
      if (!angular.element(event.target).parent().hasClass('active')) {
        this.sidebarToggle.left = false;
      }
    };

    //Listview Search (Check listview pages)
    this.listviewSearchStat = false;

    this.lvSearch = function() {
      this.listviewSearchStat = true;
    };

    //Listview menu toggle in small screens
    this.lvMenuStat = false;

  });
