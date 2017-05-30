/**
 * workGroupMembersController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .controller('WorkGroupMembersController', workGroupMembersController);

  workGroupMembersController.$inject = ['_', '$filter', '$scope', 'lsAppConfig', 'workgroupMembersRestService'];

  /**
   * @namespace workGroupMembersController
   * @desc Application home management system controller
   * @memberOf LinShare.sharedSpace
   */
  function workGroupMembersController(_, $filter, $scope, lsAppConfig, workgroupMembersRestService) {
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
      workgroupMembersRestService.create(workgroupMemberVm.currentWorkGroup.current.uuid, jsonMember).then(function(data) {
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
      workgroupMemberVm.membersSearchFilter.role = workgroupMemberVm.membersSearchFilter.role === filterParam ? '' : filterParam;
    }

    /**
     * @name changePropertyOrderBy
     * @desc Manage order options
     * @param {string} orderParam - which order to apply
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function changePropertyOrderBy(orderParam) {
      workgroupMemberVm.propertyOrderBy = orderParam;
      workgroupMemberVm.propertyOrderByAsc = workgroupMemberVm.propertyOrderBy === orderParam ? !workgroupMemberVm.propertyOrderByAsc : true;
      workgroupMemberVm.currentWorkGroup.current.members = $filter('orderBy')(workgroupMemberVm.currentWorkGroup.current.members,
        orderParam, workgroupMemberVm.propertyOrderByAsc);
    }

    /**
     * @name removeMember
     * @desc Remove member from workgroup members's list
     * @param {Array<Object>} workgroupMembers - List of members of workgroup
     * @param {Object} member - The member to remove from workgroup members's list
     * @returns {Promise} Response of the server
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function removeMember(workgroupMembers, member) {
      _.remove(workgroupMembers, member);
      return workgroupMembersRestService.remove(workgroupMemberVm.currentWorkGroup.current.uuid, member.userUuid);
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
      workgroupMembersRestService.update(workgroupMemberVm.currentWorkGroup.current.uuid, member).then(function(updatedMember) {
        member = updatedMember;
      });
    }
  }
})();
