/**
 * Created by alpha on 6/24/15.
 */
'use strict';

angular.module('linshare.userProfile', [])
  .service('LinshareUserService', function () {

    this.profile = {
      firstName: null,
      lastName: null,
      locale: null,
      role: null,
      mail: null,
      accountType: null
    };

    var self = this;
    this.loggedIn = false;
    this.authorized = false;

    this.fillProfile = function (userDto) {
      self.profile.firstName = userDto.firstName;
      self.profile.lastName = userDto.lastName;
      self.profile.locale = userDto.locale;
      self.profile.role = userDto.role;
      self.profile.mail = userDto.mail;
      self.profile.accountType = userDto.accountType;
    };

    this.init = function() {
      self.profile = {
        firstName: null,
        lastName: null,
        locale: null,
        role: null,
        mail: null,
        accountType: null
      };
    };

    // will see the implementation of these methods
    this.getProfile = function () {
      return self.profile;
    };
    this.isLoggedIn = function () {
      return self.loggedIn;
    };
    this.hasRightRole = function (role) {
      return self.profile.role == role;
    };
    this.hasRightAccountType = function(accountType) {
      return self.profile.accountType == accountType;
    };
  });
