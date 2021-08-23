/**
 * sharedSpaceMembersController Controller
 * @namespace LinShare.sharedSpace
 */

angular
  .module('linshare.sharedSpace')
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('notification');
  }])
  .controller('sharedSpaceMembersController', sharedSpaceMembersController);

sharedSpaceMembersController.$inject = [
  '_',
  '$q',
  '$log',
  '$scope',
  '$mdDialog',
  '$translate',
  'authenticationRestService',
  'dialogService',
  'lsAppConfig',
  'toastService',
  'sidebarService',
  'sharedSpaceMembersRestService',
  'workgroupRolesRestService',
  'workgroupPermissionsService'
];

/**
 * @namespace sharedSpaceMembersController
 * @desc Application home management system controller
 * @memberOf LinShare.sharedSpace
 */
function sharedSpaceMembersController(
  _,
  $q,
  $log,
  $scope,
  $mdDialog,
  $translate,
  authenticationRestService,
  dialogService,
  lsAppConfig,
  toastService,
  sidebarService,
  sharedSpaceMembersRestService,
  workgroupRolesRestService,
  workgroupPermissionsService
) {
  const sharedSpaceMembersVm = this;
  const DEFAULT_WORKGROUP_ROLE_ORDERS = ['ADMIN', 'WRITER', 'CONTRIBUTOR', 'READER'];
  let onSelfRemoveFromSharedSpace;

  sharedSpaceMembersVm.addMember = addMember;
  sharedSpaceMembersVm.updateRoleFilterOnCurrentMembers = updateRoleFilterOnCurrentMembers;
  sharedSpaceMembersVm.changePropertyOrderBy = changePropertyOrderBy;
  sharedSpaceMembersVm.removeMember = removeMember;
  sharedSpaceMembersVm.updateMember = updateMember;
  sharedSpaceMembersVm.updateDefaultWorkroupsRole = updateDefaultWorkroupsRole;
  sharedSpaceMembersVm.canDeleteSharedSpaceMember = canDeleteSharedSpaceMember;

  sharedSpaceMembersVm.membersRights = {};
  sharedSpaceMembersVm.searchMemberInput = '';
  sharedSpaceMembersVm.membersSearchFilter = {
    role: {
      uuid: undefined
    }
  };
  sharedSpaceMembersVm.propertyFilter = '';
  sharedSpaceMembersVm.propertyOrderBy = 'firstName';
  sharedSpaceMembersVm.propertyOrderByAsc = true;
  sharedSpaceMembersVm.members = [];
  sharedSpaceMembersVm.driveMembers = [];

  sharedSpaceMembersVm.$onInit = $onInit;

  ////////////

  function $onInit() {
    onSelfRemoveFromSharedSpace = sidebarService.getData().onSelfRemoveFromSharedSpace;
    sharedSpaceMembersVm.currentWorkGroup = sidebarService.getData().currentSelectedDocument;
    sharedSpaceMembersVm.currentDrive = sidebarService.getData().currentDrive;

    if (sharedSpaceMembersVm.currentDrive && sharedSpaceMembersVm.currentDrive.uuid) {
      sharedSpaceMembersRestService.getList(sharedSpaceMembersVm.currentDrive.uuid)
        .then(driveMembers => {
          sharedSpaceMembersVm.driveMembers = driveMembers.plain().map(member => member.account && member.account.mail).filter(Boolean);
        })
        .catch(() => {
          sharedSpaceMembersVm.driveMembers = [];
        });
    }

    workgroupRolesRestService.getList(sharedSpaceMembersVm.currentWorkGroup.current.nodeType).then(roles => {
      const defaultConfiguredRoleIndex = roles.findIndex(role =>
        role.name === (sharedSpaceMembersVm.currentWorkGroup.current.nodeType === 'WORK_GROUP' ?
          lsAppConfig.defaultWorkgroupMemberRole :
          lsAppConfig.defaultDriveMemberRole )
      );

      sharedSpaceMembersVm.membersRights = roles.sort((a, b) => {
        return DEFAULT_WORKGROUP_ROLE_ORDERS.indexOf(a.name) - DEFAULT_WORKGROUP_ROLE_ORDERS.indexOf(b.name);
      });
      sharedSpaceMembersVm.memberRole = sharedSpaceMembersVm.membersRights[defaultConfiguredRoleIndex];
    });

    if (sharedSpaceMembersVm.currentWorkGroup.current.nodeType === 'DRIVE') {
      workgroupRolesRestService.getList('WORK_GROUP').then(roles => {
        const defaultConfiguredRoleIndex = roles.findIndex(role => role.name === lsAppConfig.defaultWorkgroupMemberRole);

        sharedSpaceMembersVm.workgroupMembersRights =
            defaultConfiguredRoleIndex === 0 || defaultConfiguredRoleIndex === -1
              ? roles
              : [].concat(
                roles[defaultConfiguredRoleIndex],
                roles.slice(0, defaultConfiguredRoleIndex),
                roles.slice(defaultConfiguredRoleIndex + 1, roles.length)
              );
        sharedSpaceMembersVm.workgroupDefaultRole = sharedSpaceMembersVm.workgroupMembersRights[0];
      });
    }

    authenticationRestService.getCurrentUser().then(loggedUser => {
      sharedSpaceMembersVm.loggedUser = loggedUser;

      $scope.$watch(
        () => sidebarService.getData().currentSelectedDocument.current.uuid,
        sharedSpaceUuid => sharedSpaceMembersRestService.getList(sharedSpaceUuid)
          .then(members => sharedSpaceMembersVm.members = members)
          .then(fetchPermissionsOnCurrentSharedSpace)
          .catch(error => $log.debug(error)),
        true
      );
    });
  }

  /**
   * @name addMember
   * @desc Add member to members's list
   * @param {Object} member - Member to add
   * @param {Array<Object>} workgroupMembers - List of members of workgroup
   * @memberOf LinShare.sharedSpace.sharedSpaceMembersController
   */
  function addMember(member, workgroupMembers) {
    var currentWorkgroupMember = workgroupMembers.filter(function(workgroupMember) {
      return workgroupMember.account && workgroupMember.account.uuid === member.userUuid;
    });

    if (currentWorkgroupMember.length !== 0) {
      toastService.error({
        key: sharedSpaceMembersVm.currentWorkGroup.current.nodeType === 'WORK_GROUP' ?
          'TOAST_ALERT.ERROR.MEMBER_ALREADY_IN_WORKGROUP' :
          'TOAST_ALERT.ERROR.MEMBER_ALREADY_IN_DRIVE',
        params: {
          firstName: member.firstName,
          lastName: member.lastName
        }
      });

      return;
    }

    if (sharedSpaceMembersVm.isAddingMember) {
      return;
    }

    sharedSpaceMembersVm.isAddingMember = true;

    sharedSpaceMembersRestService
      .create(
        formatWorkgroupMember(
          sharedSpaceMembersVm.currentWorkGroup.current,
          member,
          sharedSpaceMembersVm.memberRole,
          sharedSpaceMembersVm.workgroupDefaultRole
        )
      )
      .then(function(data) {
        workgroupMembers.push(data.plain());
      })
      .finally(() => {
        sharedSpaceMembersVm.isAddingMember = false;
      });
  }

  /**
   * @name changePropertyOrderBy
   * @desc Manage order options
   * @param {string} orderParam - which order to apply
   * @param {jQuery.Event} $event - Event bound to the change
   * @memberOf LinShare.sharedSpace.sharedSpaceMembersController
   */
  // TODO : When a directive/service will be done for this type of orderBy, apply it here
  function changePropertyOrderBy(orderParam, $event) {
    sharedSpaceMembersVm.propertyOrderBy = orderParam;
    sharedSpaceMembersVm.propertyOrderByAsc =
        sharedSpaceMembersVm.propertyOrderBy === orderParam ? !sharedSpaceMembersVm.propertyOrderByAsc : true;

    const mappingOrderFields = {
      firstName: 'account.firstName',
      lastName: 'account.lastName',
      role: 'role.name'
    };

    sharedSpaceMembersVm.members = _.orderBy(sharedSpaceMembersVm.members, [mappingOrderFields[orderParam]], [sharedSpaceMembersVm.propertyOrderByAsc ? 'asc' : 'desc']);
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
   * @memberOf LinShare.sharedSpace.sharedSpaceMembersController
   */
  function removeMember(currentSharedSpace, member) {
    if (currentSharedSpace.nodeType === 'WORK_GROUP' && sharedSpaceMembersVm.driveMembers.includes(member.account.mail)) {
      $log.error('This member is a part of the drive');

      return;
    }

    const translationPrefix = currentSharedSpace.nodeType === 'DRIVE' ? 'SWEET_ALERT.ON_DRIVE_MEMBER_DELETE' : 'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE';
    const selfRemove = member && member.account && member.account.uuid === sharedSpaceMembersVm.loggedUser.uuid;

    $q.all([
      $translate(selfRemove ? `${translationPrefix}.SELF_REMOVE_TEXT` : `${translationPrefix}.TEXT`, {
        firstName: member.account.firstName,
        lastName: member.account.lastName,
        sharedSpaceName: currentSharedSpace.name,
      }),
      $translate([
        `${translationPrefix}.TITLE`,
        `${translationPrefix}.CANCEL_BUTTON`,
        `${translationPrefix}.CONFIRM_BUTTON`
      ])
    ])
      .then(([text, translations]) => dialogService.dialogConfirmation(
        {
          text,
          title: translations[`${translationPrefix}.TITLE`],
          buttons: {
            cancel: translations[`${translationPrefix}.CANCEL_BUTTON`],
            confirm: translations[`${translationPrefix}.CONFIRM_BUTTON`]
          }
        },
        dialogService.dialogType.warning
      ))
      .then(confirmed => !confirmed ? $q.reject() : sharedSpaceMembersRestService.remove(
        sharedSpaceMembersVm.currentWorkGroup.current.uuid,
        member.uuid
      ))
      .then(() => {
        _.remove(sharedSpaceMembersVm.members, member);

        if (selfRemove && onSelfRemoveFromSharedSpace) {
          onSelfRemoveFromSharedSpace(sharedSpaceMembersVm.currentWorkGroup.current);
        }

        toastService.success({
          key: currentSharedSpace.nodeType === 'WORK_GROUP' ? 'TOAST_ALERT.ACTION.DELETE_WORKGROUP_MEMBER' : 'TOAST_ALERT.ACTION.DELETE_DRIVE_MEMBER',
          params: {
            firstName: member.account.firstName,
            lastName: member.account.lastName,
          }
        });
      })
      .catch(error => error && $log.error('Failed to remove member', error));
  }

  /**
   * @name updateMember
   * @desc Update member
   * @param {Object} member - Member to update
   * @param {Boolean} isNestedRole - True if thehe role to be update is nested
   * @param {Boolean} forceOverride - Force to override all the nested shared space with given role
   * @param {Role} role - A {@link Role} object.
   * @memberOf LinShare.sharedSpace.sharedSpaceMembersController
   */
  function updateMember(member, role, isNestedRole = false, forceOverride = false) {
    if (isNestedRole) {
      member.nestedRole = role;
    } else {
      member.role = role;
    }

    sharedSpaceMembersRestService.update(
      formatWorkgroupMember(
        sharedSpaceMembersVm.currentWorkGroup.current,
        member,
        member.role,
        member.nestedRole
      ),
      forceOverride
    ).then(() => {
      if (member.account && member.account.uuid === sharedSpaceMembersVm.loggedUser.uuid) {
        sharedSpaceMembersVm.currentWorkGroup.current.role = {
          uuid: member.role.uuid,
          name: member.role.name
        };
        fetchPermissionsOnCurrentSharedSpace();
      }
    });
  }

  /**
   * @name formatWorkgroupMember
   * @desc Update member
   * @param {Object} workgroup - Current workgroup
   * @param {Object} member - Member to update
   * @param {Role} role - A {@link Role} object.
   * @param {Role} nestedRole - A {@link Role} object
   * @returns {WorkgroupMember} A {@link WorkgroupMember} object.
   * @memberOf LinShare.sharedSpace.sharedSpaceMembersController
   */
  function formatWorkgroupMember(workgroup, member, role, nestedRole) {
    return {
      role: {
        uuid: role.uuid
      },
      node: {
        uuid: workgroup.uuid
      },
      account: {
        uuid: member.account ? member.account.uuid : member.userUuid
      },
      nestedRole: nestedRole && nestedRole.uuid && {
        uuid: nestedRole.uuid
      },
      type: nestedRole && 'DRIVE'
    };
  }

  function updateRoleFilterOnCurrentMembers(role) {
    sharedSpaceMembersVm.membersSearchFilter.role.uuid = sharedSpaceMembersVm.membersSearchFilter.role.uuid === role.uuid ?
      undefined :
      sharedSpaceMembersVm.membersSearchFilter.role.uuid = role.uuid;
  }

  function updateDefaultWorkroupsRole(member) {
    $mdDialog
      .show({
        template: require('../components/updateDefaultWorkgroupsRoleDialog/updateDefaultWorkgroupsRoleDialog.html'),
        controller: 'updateDefaultWorkgroupsRoleDialogController',
        controllerAs: 'vm',
        locals: {
          sharedSpace: sharedSpaceMembersVm.currentWorkGroup.current,
          workgroupRoles: sharedSpaceMembersVm.workgroupMembersRights,
          initialRole: member.nestedRole
        }
      })
      .then(({ forceOverride, role}) => updateMember(member, role, true, forceOverride))
      .catch(error => error && $log.error(error));
  }

  function fetchPermissionsOnCurrentSharedSpace() {
    const currentSharedSpace = sidebarService.getData().currentSelectedDocument.current;

    return workgroupPermissionsService
      .getWorkgroupsPermissions([currentSharedSpace].filter(Boolean))
      .then(workgroupPermissionsService.formatPermissions)
      .then(formattedPermissions => {
        sharedSpaceMembersVm.permission = formattedPermissions && formattedPermissions[currentSharedSpace.uuid];
      });
  }

  function canDeleteSharedSpaceMember () {
    return sharedSpaceMembersVm.permission &&
          sharedSpaceMembersVm.permission.MEMBER &&
          sharedSpaceMembersVm.permission.MEMBER.DELETE;
  }
}