/**
 * workGroupMembersController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .controller('WorkGroupMembersController', workGroupMembersController);

  workGroupMembersController.$inject = [
    '_',
    '$q',
    '$translate',    
    '$filter',
    '$scope',
    'lsAppConfig',
    'workgroupMembersRestService',
    'dialogService',
    '$translatePartialLoader'    
  ];

  /**
   * @namespace workGroupMembersController
   * @desc Application home management system controller
   * @memberOf LinShare.sharedSpace
   */
  function workGroupMembersController(
    _,
    $q,
    $translate,
    $filter,
    $scope,
    lsAppConfig,
    workgroupMembersRestService,
    dialogService,
    $translatePartialLoader
  ) {
    /* jshint validthis: true */
    var workgroupMemberVm = this;

    const ROLE_ADMIN = 'admin';
    const ROLE_NORMAL = 'normal';
    const ROLE_READONLY = 'readonly';

    workgroupMemberVm.addMember = addMember;
    workgroupMemberVm.changeFilterByProperty = changeFilterByProperty;
    workgroupMemberVm.changePropertyOrderBy = changePropertyOrderBy;
    workgroupMemberVm.membersRights = lsAppConfig.roles;
    workgroupMemberVm.membersSearchFilter = {
      $: '',
      role: ''
    };
    workgroupMemberVm.propertyFilter = '';
    workgroupMemberVm.propertyOrderBy = 'firstName';
    workgroupMemberVm.propertyOrderByAsc = true;
    workgroupMemberVm.removeMember = removeMember;
    workgroupMemberVm.updateMember = updateMember;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function activate() {
      // TODO : I added the if to work around, the watcher solution is very bad, need to change it !
      $translatePartialLoader.addPart('notification');
      workgroupMemberVm.memberRole = workgroupMemberVm.membersRights.write;
      workgroupMemberVm.currentWorkGroup = $scope.mainVm.sidebar.getData().currentSelectedDocument;

      $scope.$watch(function() {
        return $scope.mainVm.sidebar.getData().currentSelectedDocument.current;
      }, function(currentWorkGroup) {
        workgroupMembersRestService.get(currentWorkGroup.uuid, $scope.userLogged.uuid).then(function(member) {
          workgroupMemberVm.currentWorkgroupMember = member;
          $scope.mainVm.sidebar.addData('currentWorkgroupMember', member);
        });
      }, true);
    }

    /**
     * @name addMember
     * @desc Add member to members's list
     * @param {Object} member - Member to add
     * @param {Array<Object>} workgroupMembers - List of members of workgroup
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function addMember(member, workgroupMembers) {
      var jsonMember = {
        userMail: member.mail,
        userDomainId: member.domain,
        readonly: workgroupMemberVm.memberRole === workgroupMemberVm.membersRights.readonly,
        admin: workgroupMemberVm.memberRole === workgroupMemberVm.membersRights.admin
      };
      workgroupMembersRestService.create(workgroupMemberVm.currentWorkGroup.current.uuid, jsonMember)
        .then(function(data) {
          workgroupMembers.push(data.plain());
        });
    }

    /**
     * @name changeFilterByProperty
     * @desc Manage filter options
     * @param {string} filterParam - name of property for filter
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function changeFilterByProperty(filterParam) {
      workgroupMemberVm.membersSearchFilter.role =
        workgroupMemberVm.membersSearchFilter.role === filterParam ? '' : filterParam;
    }

    /**
     * @name changePropertyOrderBy
     * @desc Manage order options
     * @param {string} orderParam - which order to apply
     * @param {jQuery.Event} $event - Event bound to the change
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    // TODO : When a directive/service will be done for this type of orderBy, apply it here
    function changePropertyOrderBy(orderParam, $event) {
      workgroupMemberVm.propertyOrderBy = orderParam;
      workgroupMemberVm.propertyOrderByAsc =
        workgroupMemberVm.propertyOrderBy === orderParam ? !workgroupMemberVm.propertyOrderByAsc : true;
      workgroupMemberVm.currentWorkGroup.current.members =
        $filter('orderBy')(workgroupMemberVm.currentWorkGroup.current.members, orderParam,
          workgroupMemberVm.propertyOrderByAsc);
      angular.element('.sort-dropdown a').removeClass('selected-sorting').promise().done(function() {
        angular.element($event.currentTarget).addClass('selected-sorting');
      });
    }

    /**
     * @name removeMember
     * @desc Remove member from workgroup members's list     
     * @param {Object} member - The member to remove from workgroup members's list
     * @param {Object} currentWorkgroup - The current workgroup from which the member is removed.
     * @returns {Promise} Response of the server
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function removeMember(currentWorkgroup, member) { 
      $q.all([
        $translate(
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.TEXT',
          {
            firstName: member.firstName,
            lastName: member.lastName,
            workgroupName: currentWorkgroup.name
          }
        ),
        $translate([
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.TITLE',
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CANCEL_BUTTON',
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CONFIRM_BUTTON'
        ])
      ]).then(function(translations) {   
        var sentences = {
          text: translations[0],
          title: translations[1]['SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.TITLE'],
          buttons: {
            cancel: translations[1]['SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CANCEL_BUTTON'],
            confirm: translations[1]['SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CONFIRM_BUTTON']
          }
        };
        return dialogService.dialogConfirmation(sentences, dialogService.dialogType.warning);
      }).then(function() {
      _.remove(currentWorkgroup.members, member)
      return workgroupMembersRestService.remove(workgroupMemberVm.currentWorkGroup.current.uuid, member.userUuid);      
      })
    }

    /**
     * @name updateMember
     * @desc Update member
     * @param {Object} member - Member to update
     * @param {string} role - Role of member
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function updateMember(member, role) {
      member.role = role;
      if (role === ROLE_ADMIN) {
        member.admin = true;
        member.readonly = false;
      }
      if (role === ROLE_READONLY) {
        member.admin = false;
        member.readonly = true;
      }
      if (role === ROLE_NORMAL) {
        member.admin = false;
        member.readonly = false;
      }
      workgroupMembersRestService.update(workgroupMemberVm.currentWorkGroup.current.uuid, member)
        .then(function(updatedMember) {
          member = updatedMember;
        });
    }
  }
})();
