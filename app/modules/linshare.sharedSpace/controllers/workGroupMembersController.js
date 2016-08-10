/**
 * @author Alpha Sall.
 */

'use strict';

angular.module('linshareUiUserApp')
.controller('WorkGroupMembersController', WorkGroupMembersController);

function WorkGroupMembersController($scope, workGroupMembersRestService, $stateParams, members, currentWorkgroup, $filter) {

  $scope.sidebarRightDataType = 'add-member';
  $scope.mactrl.sidebarToggle.right = true;
  var thisCtrl = this;
  thisCtrl.currentWorkGroup = currentWorkgroup;
  thisCtrl.workgroupUuid = $stateParams.id;
  thisCtrl.workgroupMembers = members;
  thisCtrl.membersRights = {admin: 'ADMIN', write: 'WRITE', readonly: 'READ'};
  thisCtrl.memberRole = thisCtrl.membersRights.write;

  thisCtrl.propertyFilter = '';
  thisCtrl.membersSearchFilter = {$: '', role: ''};

  thisCtrl.propertyOrderBy = 'firstName';
  thisCtrl.propertyOrderByAsc = true;

  thisCtrl.changePropertyOrderBy = function(orderParam) {
    thisCtrl.propertyOrderBy = orderParam;
    thisCtrl.propertyOrderByAsc = thisCtrl.propertyOrderBy === orderParam ? !thisCtrl.propertyOrderByAsc : true;
    thisCtrl.workgroupMembers = $filter('orderBy')(thisCtrl.workgroupMembers, orderParam, thisCtrl.propertyOrderByAsc);
  };

  thisCtrl.changeFilterByProperty = function(filterParam) {
    thisCtrl.membersSearchFilter.role = thisCtrl.membersSearchFilter.role === filterParam ? '' : filterParam;
  };

  thisCtrl.addMember = addMember;
  thisCtrl.removeMember = removeMember;
  thisCtrl.updateMember = updateMember;

  function removeMember(workgroupMembers, member) {
    _.remove(workgroupMembers, member);
    return workGroupMembersRestService.delete(thisCtrl.workgroupUuid, member.uuid);
  }

  function addMember(member, listMembers) {
    var jsonMember = {
      userMail: member.mail,
      userDomainId: member.domain,
      readonly: thisCtrl.memberRole === thisCtrl.membersRights.readonly,
      admin: thisCtrl.memberRole === thisCtrl.membersRights.admin
    };
    workGroupMembersRestService.create(thisCtrl.workgroupUuid, jsonMember).then(function(data) {
      listMembers.push(data.plain());
    });
  }

  function updateMember() {

  }
}
