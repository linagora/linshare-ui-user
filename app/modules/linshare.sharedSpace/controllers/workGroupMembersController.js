/**
 * @author Alpha Sall.
 */

'use strict';

angular.module('linshareUiUserApp')
.controller('WorkGroupMembersController', WorkGroupMembersController);

function WorkGroupMembersController($scope, workGroupMembersRestService, $filter) {

  var thisCtrl = this;
  thisCtrl.currentWorkGroup = $scope.vm.currentSelectedDocument;
  thisCtrl.membersRights = {admin: 'ADMIN', write: 'WRITE', readonly: 'READ'};
  thisCtrl.memberRole = thisCtrl.membersRights.write;

  thisCtrl.propertyFilter = '';
  thisCtrl.membersSearchFilter = {$: '', role: ''};

  thisCtrl.propertyOrderBy = 'firstName';
  thisCtrl.propertyOrderByAsc = true;

  thisCtrl.changePropertyOrderBy = function(orderParam) {
    thisCtrl.propertyOrderBy = orderParam;
    thisCtrl.propertyOrderByAsc = thisCtrl.propertyOrderBy === orderParam ? !thisCtrl.propertyOrderByAsc : true;
    thisCtrl.currentWorkGroup.current.members = $filter('orderBy')(thisCtrl.currentWorkGroup.current.members,
      orderParam, thisCtrl.propertyOrderByAsc);
  };

  thisCtrl.changeFilterByProperty = function(filterParam) {
    thisCtrl.membersSearchFilter.role = thisCtrl.membersSearchFilter.role === filterParam ? '' : filterParam;
  };

  thisCtrl.addMember = addMember;
  thisCtrl.removeMember = removeMember;
  thisCtrl.updateMember = updateMember;

  function removeMember(workgroupMembers, member) {
    _.remove(workgroupMembers, member);
    return workGroupMembersRestService.delete(thisCtrl.currentWorkGroup.current.uuid, member.userUuid);
  }

  function addMember(member, listMembers) {
    var jsonMember = {
      userMail: member.mail,
      userDomainId: member.domain,
      readonly: thisCtrl.memberRole === thisCtrl.membersRights.readonly,
      admin: thisCtrl.memberRole === thisCtrl.membersRights.admin
    };
    workGroupMembersRestService.create(thisCtrl.currentWorkGroup.current.uuid, jsonMember).then(function(data) {
      listMembers.push(data.plain());
    });
  }

  function updateMember(member, role) {
    member.role = role;
    if(role === 'admin') {
      member.admin = true;
      member.readonly = false;
    }
    if(role === 'readonly') {
      member.admin = false;
      member.readonly = true;
    }
    if(role === 'normal') {
      member.admin = false;
      member.readonly = false;
    }
    workGroupMembersRestService.update(thisCtrl.currentWorkGroup.current.uuid, member).then(function(updatedMember) {
      member = updatedMember;
    });
  }
}
