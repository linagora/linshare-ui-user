/**
 * GuestObjectService Factory
 * @namespace LinShare.guests
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .factory('GuestObjectService', GuestObjectService);

  GuestObjectService.$inject = [
    '_', '$q', 'authenticationRestService', 'functionalityRestService', 'guestRestService', 'moment'
  ];

  /**
   *  @namespace GuestObjectService
   *  @desc Manipulation of guest object front/back
   *  @memberOf LinShare.guest
   */
  function GuestObjectService(_, $q, authenticationRestService, functionalityRestService, guestRestService, moment) {

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
          isEditable: false,
          options: {
            maxDate: null,
            minDate: moment().endOf('day').valueOf()
          }
        },
        display: {
          firstName: '',
          lastName: ''
        },
        isRestrictedContact: false
      },
      loggedUser = authenticationRestService.getCurrentUser().$$state.value,
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
      jsonObject = jsonObject || {};
      checkFunctionalities().then(function() {
        self.allowedToAddEditors = _.cloneDeep(allowedToAddEditors);
        self.allowedToExpiration = _.cloneDeep(allowedToExpiration);
        self.allowedToProlongExpiration = _.cloneDeep(allowedToProlongExpiration);
        self.allowedToRestrict = _.cloneDeep(allowedToRestrict);
        self.allowedToUpload = _.cloneDeep(allowedToUpload);
        self.canUpload = setPropertyValue(jsonObject.canUpload, _.clone(allowedToUpload.value));
        self.comment = setPropertyValue(jsonObject.comment, '');
        self.create = create;
        self.creationDate = setPropertyValue(jsonObject.creationDate, '');
        self.domain = setPropertyValue(jsonObject.domain, '');
        //TODO: To be put once the back allow editors$
        //self.editors = setPropertyValue(jsonObject.editors, _.clone(allowedToAddEditors.value));
        self.editorsContacts = setPropertyValue(jsonObject.editorsContacts, []);
        self.expirationDate = setPropertyValue(jsonObject.expirationDate, allowedToExpiration.value);
        self.firstName = setPropertyValue(jsonObject.firstName, '');
        self.lastName = setPropertyValue(jsonObject.lastName, '');
        self.mail = setPropertyValue(jsonObject.mail, '');
        self.message = setPropertyValue(jsonObject.message, '');
        self.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
        self.owner = setPropertyValue(jsonObject.owner, {});
        self.reset = reset;
        self.restricted = setPropertyValue(jsonObject.restricted, _.clone(allowedToRestrict.value));
        self.restrictedContacts = setPropertyValue(jsonObject.restrictedContacts, _.cloneDeep(contacts));
        self.toDTO = toDTO;
        self.update = update;
        self.uuid = setPropertyValue(jsonObject.uuid, undefined);
        setFormValue().then(function(formData) {
          self.form = formData;
          self.form.isRestrictedContact = _.some(self.restrictedContacts, {
            'mail': loggedUser.mail
          });
          if (!_.isUndefined(self.uuid)) {
            self.form.activateMoreOptions = true;
            self.form.display.firstName = _.clone(self.firstName);
            self.form.display.lastName = _.clone(self.lastName);
          }
        });
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
          var clonedData = _.cloneDeep(data);
          allowedToUpload = clonedData;
          allowedToUpload.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
          allowedToUpload.value = _.isUndefined(clonedData.value) ? false : clonedData.value;
        }),
        functionalityRestService.getFunctionalityParams('GUESTS__EXPIRATION').then(function(data) {
          var clonedData = _.cloneDeep(data);
          allowedToExpiration = clonedData;
          allowedToExpiration.canOverride =
            _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
          allowedToExpiration.value = moment()
            .endOf('day')
            .add(clonedData.value, clonedData.unit)
            .subtract(1, 'days')
            .valueOf();
        }),
        functionalityRestService.getFunctionalityParams('GUESTS__EXPIRATION_ALLOW_PROLONGATION')
          .then(function(data) {
            var clonedData = _.cloneDeep(data);
            allowedToProlongExpiration = clonedData;
            //There is no delegation policy for this one so by it's default the functionality is overridable by a user
            allowedToProlongExpiration.canOverride = clonedData.enable;
            allowedToProlongExpiration.value = _.clone(allowedToExpiration.value);
          }),
        functionalityRestService.getFunctionalityParams('GUESTS__RESTRICTED').then(function(data) {
          var clonedData = _.cloneDeep(data);
          allowedToRestrict = clonedData;
          allowedToRestrict.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
          allowedToRestrict.value = _.isUndefined(clonedData.value) ? false : clonedData.value;
          if (allowedToRestrict.enable && allowedToRestrict.canOverride) {
            var myself = {
              firstName: loggedUser.firstName,
              lastName: loggedUser.lastName,
              domain: loggedUser.domain,
              mail: loggedUser.mail
            };
            if (_.isUndefined(_.find(contacts, myself))) {
              contacts.push(myself);
            }
          }
        })
        //TODO: To be put once the back allow editors
        //functionalityRestService.getFunctionalityParams('GUESTS__CAN_ALLOW_EDITORS').then(function(data) {
        //  var clonedData = _.cloneDeep(data);
        //  allowedToAddEditors = clonedData;
        //  allowedToAddEditors.value = _.isUndefined(clonedData.value) ? false : clonedData.value;
        //  allowedToAddEditors.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        //}),
        //TODO: To be put oncethe back allow email edition
        //functionalityRestService.getFunctionalityParams('GUESTS__CAN_EDIT_EMAIL').then(function(data) {
        //  var clonedData = _.cloneDeep(data);
        //  allowedToEmail = clonedData;
        //  allowedToEmail.value = _.isUndefined(clonedData.value) ? false : clonedData.value;
        //  allowedToEmail.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        //})
      ]);
    }

    /**
     *  @name create
     *  @desc Create the instatiated object by the API
     *  @returns {Object} result promise
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function create() {
      /* jshint validthis:true */
      self = this;
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
     *  @name reset
     *  @desc Reset the instatiated object to the default values
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function reset() {
      /* jshint validthis:true */
      self = this;
      self.canUpload = _.clone(allowedToUpload.value);
      self.comment = '';
      self.expirationDate = _.clone(form.datepicker.options.maxDate);
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
     *  @name setFormValue
     *  @desc Set form element value depending on ithe object property
     *  @returns {Promise}
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function setFormValue() {
      var deferred = $q.defer();

      form.activateDescription = !(_.isUndefined(self.comment) || self.comment === '' || self.comment === null);
      //  form.activateEditors = _.clone(allowedToRestrict.value);
      form.activateRestricted = setPropertyValue(self.restricted, allowedToRestrict.value);
      form.activateUserSpace = setPropertyValue(self.canUpload, allowedToUpload.value);
      form.datepicker.options.maxDate = _.clone(allowedToExpiration.value);
      if (!_.isUndefined(self.uuid) && !(allowedToProlongExpiration.enable)) {
        form.datepicker.isEditable = false;
        form.datepicker.options.maxDate = _.clone(self.expirationDate);
      }
      form.activateMoreOptions = (!form.activateUserSpace);
      if (_.isUndefined(self.uuid) && allowedToExpiration.canOverride) {
        form.datepicker.isEditable = true;
      }
      deferred.resolve(_.cloneDeep(form));
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


    /**
     *  @name setPropertyValue
     *  @desc Set element value depending on object retrieved property
     *  @param {Object} value - Value wanted to be setted
     *  @param {Object} defaultValue - The defaultValue if no object is retrieved
     *  @returns {Object} the final value to set
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function setPropertyValue(value, defaultValue) {
      return _.cloneDeep(_.isUndefined(value) ? defaultValue : value);
    }

    /**
     *  @name toDTO
     *  @desc Build a guest DTO object from the curent guest object
     *  @returns {Object} Return a guest DTO object
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function toDTO() {
      /* jshint validthis:true */
      self = this;
      var guestDTO = {};
      guestDTO.canUpload = setFunctionalityValue(self.canUpload, allowedToUpload);
      guestDTO.comment = _.defaultTo(self.comment, '');
      self.expirationDate = moment(self.expirationDate).endOf('day').valueOf();
      if (_.isUndefined(self.uuid)) {
        guestDTO.expirationDate = setFunctionalityValue(self.expirationDate, allowedToExpiration);
      } else {
        guestDTO.expirationDate = setFunctionalityValue(self.expirationDate, allowedToProlongExpiration);
      }
      guestDTO.firstName = _.defaultTo(self.firstName, '');
      guestDTO.lastName = _.defaultTo(self.lastName, '');
      guestDTO.mail = _.defaultTo(self.mail, '');
      guestDTO.restricted = setFunctionalityValue(self.restricted, allowedToRestrict);
      if (guestDTO.canUpload) {
        if (allowedToRestrict.enable && allowedToRestrict.canOverride) {
          guestDTO.restrictedContacts =
            _.uniq(_.defaultTo(self.restrictedContacts, contacts));
        } else {
          guestDTO.restrictedContacts = null;
        }
      } else {
        guestDTO.restricted = false;
        guestDTO.restrictedContacts = null;
      }
      if (!_.isUndefined(self.uuid)) {
        guestDTO.uuid = self.uuid;
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
     *  @name update
     *  @desc Update the instatiated object by the API
     *  @returns {Object} result promise
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function update() {
      /* jshint validthis:true */
      self = this;
      var
        deferred = $q.defer(),
        guestDTO = self.toDTO();
      guestRestService.update(guestDTO.uuid, guestDTO).then(function(data) {
        deferred.resolve(data);
      }).catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }
  }
})();
