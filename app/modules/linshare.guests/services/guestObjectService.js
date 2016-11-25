/**
 * GuestObjectService Factory
 * @namespace LinShare.guests
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .factory('GuestObjectService', GuestObjectService);

  GuestObjectService.$inject = ['$q', 'authenticationRestService', 'autocompleteUserRestService',
    'functionalityRestService', 'guestRestService'];

  /**
   *  @namespace GuestObjectService
   *  @desc Manipulation of guest object front/back
   *  @memberOf LinShare.guest
   */
  function GuestObjectService($q, authenticationRestService, autocompleteUserRestService,
    functionalityRestService, guestRestService) {

    var
      allowedToAddEditors = {},
      allowedToExpiration = {},
      allowedToProlongExpiration = {},
      allowedToRestrict = {},
      allowedToUpload = {},
      contacts = [],
      form = {
        activateDescription: false,
        activateEditors: false,
        activateMoreOptions: false,
        activateRestricted: false,
        activateUserSpace: false,
        datepicker: {
          maxDate: null,
          minDate: moment().startOf('day').valueOf(),
          options: null
        }
      },
      self;

    return GuestObject;

    ////////////

    /**
     *  @name GuestObject
     *  @desc Constructor of the guest object
     *  @param {Object} jsonObject - Json object for constructing a guest object
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function GuestObject(jsonObject) {
      self = this;
      jsonObject = jsonObject ||  {};
      checkFunctionalities().then(function() {
        self.allowedToAddEditors = jsonObject.allowedToAddEditors || _.cloneDeep(allowedToAddEditors);
        self.allowedToExpiration = jsonObject.allowedToExpiration || _.cloneDeep(allowedToExpiration);
        self.allowedToProlongExpiration = jsonObject.allowedToProlongExpiration || _.cloneDeep(allowedToProlongExpiration);
        self.allowedToRestrict = jsonObject.allowedToRestrict || _.cloneDeep(allowedToRestrict);
        self.allowedToUpload = jsonObject.allowedToUpload || _.cloneDeep(allowedToUpload);
        self.canUpload = jsonObject.canUpload || _.clone(allowedToUpload.value);
        self.comment = jsonObject.comment || '';
        //TODO: To be put once the back allow editors$
        //self.editors = jsonObject.editors || _.clone(allowedToAddEditors.value);
        self.editors = jsonObject.editors || false;
        self.editorsContacts = jsonObject.editorsContacts || [];
        self.expirationDate = jsonObject.expirationDate || _.clone(form.datepicker.maxDate);
        self.firstName = jsonObject.firstName || '';
        self.form = _.cloneDeep(form);
        self.lastName = jsonObject.lastName || '';
        self.mail = jsonObject.mail || '';
        self.message = jsonObject.message || '';
        self.reset = reset;
        self.restricted = jsonObject.restricted || _.clone(allowedToRestrict.value);
        self.restrictedContacts = jsonObject.restrictedContacts || _.cloneDeep(contacts);
        self.save = save;
        self.toDTO = toDTO;
      });
    }

    /**
     *  @name checkFunctionalities
     *  @desc Check the different rights relative to the guest
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function checkFunctionalities() {
      return $q.all([
        functionalityRestService.getFunctionalityParams('GUESTS__CAN_UPLOAD').then(function(data) {
          allowedToUpload = data;
          allowedToUpload.canOverride = _.isUndefined(data.canOverride) ? false : data.canOverride;
          allowedToUpload.value = _.isUndefined(data.value) ? false : data.value;
          form.activateUserSpace = allowedToUpload.value;
          form.activateMoreOptions = form.activateUserSpace ? true : form.activateMoreOptions;
        }),
        functionalityRestService.getFunctionalityParams('GUESTS__EXPIRATION').then(function(data) {
          allowedToExpiration = data;
          allowedToExpiration.canOverride = _.isUndefined(data.canOverride) ? false : data.canOverride;
          allowedToExpiration.value = moment()
            .startOf('day')
            .add(data.value, data.unit)
            .valueOf();
          form.datepicker.maxDate = allowedToExpiration.value;
        }),
        functionalityRestService.getFunctionalityParams('GUESTS__EXPIRATION_ALLOW_PROLONGATION')
        .then(function(data) {
          allowedToProlongExpiration = data;
          allowedToProlongExpiration.canOverride = _.isUndefined(data.canOverride) ? false : data.canOverride;
          allowedToProlongExpiration.value = _.isUndefined(data.value) ? false : data.value;
        }),
        functionalityRestService.getFunctionalityParams('GUESTS__RESTRICTED').then(function(data) {
          allowedToRestrict = data;
          allowedToRestrict.canOverride = _.isUndefined(data.canOverride) ? false : data.canOverride;
          allowedToRestrict.value = _.isUndefined(data.value) ? false : data.value;
          form.activateRestricted = allowedToRestrict.value;
          form.activateMoreOptions = form.activateRestricted ? true : form.activateMoreOptions;
          if (allowedToRestrict.enable && allowedToRestrict.canOverride) {
            authenticationRestService.getCurrentUser().then(function(user) {
              contacts.push({
                firstName: user.firstName,
                lastName: user.lastName,
                domain: user.domain,
                mail: user.mail
              });
            });
          }
        })
        //TODO: To be put once the back allow editors
        //functionalityRestService.getFunctionalityParams('GUESTS__CAN_ALLOW_EDITORS').then(function(data) {
        //  allowedToAddEditors = data;
        //  allowedToAddEditors.value = _.isUndefined(data.value) ? false : data.value;
        //  allowedToAddEditors.canOverride = _.isUndefined(data.canOverride) ? false : data.canOverride;
        //  form.activateEditors = allowedToRestrict.value;
        //}),
        //TODO: To be put oncethe back allow email edition
        //functionalityRestService.getFunctionalityParams('GUESTS__CAN_EDIT_EMAIL').then(function(data) {
        //  allowedToEmail = data;
        //  allowedToEmail.value = _.isUndefined(data.value) ? false : data.value;
        //  allowedToEmail.canOverride = _.isUndefined(data.canOverride) ? false : data.canOverride;
        //})
      ]);
    }

    /**
     *  @name toDTO
     *  @desc Build a guest DTO object from the curent guest object
     *  @returns {Object} Return a guest DTO object
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function toDTO() {
      var guestDTO = {};
      guestDTO.canUpload = setFunctionalityValue(self.canUpload, allowedToUpload);
      guestDTO.comment = _.isUndefined(self.comment) ? '' : self.comment;
      guestDTO.expirationDate = setFunctionalityValue(self.expirationDate, allowedToExpiration);
      guestDTO.firstName = _.isUndefined(self.firstName) ? '' : self.firstName;
      guestDTO.lastName = _.isUndefined(self.lastName) ? '' : self.lastName;
      guestDTO.mail = _.isUndefined(self.mail) ? '' : self.mail;
      guestDTO.restricted = setFunctionalityValue(self.restricted, allowedToRestrict);
      if (guestDTO.canUpload) {
        if (allowedToRestrict.enable && allowedToRestrict.canOverride) {
          guestDTO.restrictedContacts = _.isUndefined(self.restrictedContacts) ? contacts : self.restrictedContacts;
        } else {
          guestDTO.restrictedContacts = null;
        }
      } else {
        guestDTO.restricted = false;
        guestDTO.restrictedContacts = null;
      }
      //TODO: To be put once done in DTO
      //guestDTO.message = _.isUndefined(self.message) ? '' : _.clone(self.message);
      //guestDTO.editors = setFunctionalityValue(self.editors, allowedToRestrict);
      //if (allowedToRestrict.enable && allowedToRestrict.canOverride) {
      //  guestDTO.editorsContacts = _.isUndefined(self.editorsContacts) ? contacts : self.editorsContacts;
      //} else {
      //  guestDTO.editorsContacts = null;
      //}
      return guestDTO;
    }

    /**
     *  @name reset
     *  @desc Reset the instatiated object to the default values
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function reset() {
      self.canUpload = _.clone(allowedToUpload.value);
      self.comment = '';
      self.expirationDate = _.clone(form.datepicker.maxDate);
      self.firstName = '';
      self.form = _.cloneDeep(form);
      self.lastName = '';
      self.mail = '';
      self.restricted = _.clone(allowedToRestrict.value);
      self.restrictedContacts = _.cloneDeep(contacts);
      //self.editors = false;
      //self.editorsContacts = [];
      //self.message = '';
    }

    /**
     *  @name save
     *  @desc save the instatiated object by the API
     *  @returns {Object} result promise
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function save() {
      var
        deferred = $q.defer(),
        guestDTO = self.toDTO();
      guestRestService.create(guestDTO).then(function(data) {
        if (!(guestDTO.restrictedContacts === null || guestDTO.restrictedContacts === [])) {
          guestRestService.update(data.uuid, guestDTO).then(function(data) {
            deferred.resolve(data);
          }).catch(function(error) {
            deferred.reject(error);
          });
        } else {
          deferred.resolve(data);
        }
      }).catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    /**
     *  @name setFunctionalityValue
     *  @desc Set element value depending on functionality property
     *  @param {Object} value - Value wanted to be setted
     *  @param {Object} functionality - The functionality to check against
     *  @returns {Object} the final value to set
     *  @memberOf LinShare.guests.GuestObjectService
     */
    //TODO - KLE: To be moved in a Helper for functionality
    function setFunctionalityValue(value, functionality) {
      if (functionality.enable) {
        if (functionality.canOverride) {
          return _.isUndefined(value) ? functionality.value : value;
        } else {
          return functionality.value;
        }
      } else {
        return null;
      }
    }
  }
})();
