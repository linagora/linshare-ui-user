/**
 * @author Alpha Sall.
 */

'use strict';

angular.module('linshareUiUserApp')
.controller('WorkGroupMembersController', WorkGroupMembersController);

function WorkGroupMembersController($scope, workGroupMembersRestService, $filter) {

  var wgmember = this;
  wgmember.currentWorkGroup = $scope.mainVm.sidebar.getData().currentSelectedDocument;
  wgmember.membersRights = {admin: 'ADMIN', write: 'WRITE', readonly: 'READ'};
  wgmember.memberRole = wgmember.membersRights.write;

  wgmember.propertyFilter = '';
  wgmember.membersSearchFilter = {$: '', role: ''};

  wgmember.propertyOrderBy = 'firstName';
  wgmember.propertyOrderByAsc = true;

  wgmember.changePropertyOrderBy = function(orderParam) {
    wgmember.propertyOrderBy = orderParam;
    wgmember.propertyOrderByAsc = wgmember.propertyOrderBy === orderParam ? !wgmember.propertyOrderByAsc : true;
    wgmember.currentWorkGroup.current.members = $filter('orderBy')(wgmember.currentWorkGroup.current.members,
      orderParam, wgmember.propertyOrderByAsc);
  };

  wgmember.changeFilterByProperty = function(filterParam) {
    wgmember.membersSearchFilter.role = wgmember.membersSearchFilter.role === filterParam ? '' : filterParam;
  };

  $scope.$watch(function() {
    return $scope.mainVm.sidebar.getData().currentSelectedDocument.current;
  }, function (currentWorkGroup) {
    workGroupMembersRestService.get(currentWorkGroup.uuid, $scope.userLogged.uuid).then(function(member) {
      wgmember.currentWorkgroupMember = member;
      $scope.mainVm.sidebar.addData('currentWorkgroupMember', member);
    });
  }, true);

  wgmember.addMember = addMember;
  wgmember.removeMember = removeMember;
  wgmember.updateMember = updateMember;

  function removeMember(workgroupMembers, member) {
    _.remove(workgroupMembers, member);
    return workGroupMembersRestService.delete(wgmember.currentWorkGroup.current.uuid, member.userUuid);
  }

  function addMember() {
    var
      member = this.selectedUser,
      listMembers = this.selectedUsersList;
    var jsonMember = {
      userMail: member.mail,
      userDomainId: member.domain,
      readonly: wgmember.memberRole === wgmember.membersRights.readonly,
      admin: wgmember.memberRole === wgmember.membersRights.admin
    };
    workGroupMembersRestService.create(wgmember.currentWorkGroup.current.uuid, jsonMember).then(function(data) {
      listMembers.push(data.plain());
    });
  }

  function updateMember(member, role) {
    member.role = role;
    if (role === 'admin') {
      member.admin = true;
      member.readonly = false;
    }
    if (role === 'readonly') {
      member.admin = false;
      member.readonly = true;
    }
    if (role === 'normal') {
      member.admin = false;
      member.readonly = false;
    }
    workGroupMembersRestService.update(wgmember.currentWorkGroup.current.uuid, member).then(function(updatedMember) {
      member = updatedMember;
    });
  }
}
