angular
  .module('linshare.guests')
  .controller('guestModeratorsController', guestModeratorsController);

guestModeratorsController.$inject = ['_', '$q', 'guestRestService', 'authenticationRestService'];

function guestModeratorsController(_, $q, guestRestService, authenticationRestService) {
  const guestModeratorsVm = this;

  guestModeratorsVm.$onInit = fetchModerators;
  guestModeratorsVm.$onChanges = $onChanges;
  guestModeratorsVm.changePropertyOrderBy = changePropertyOrderBy;
  guestModeratorsVm.toggleRoleFilter = toggleRoleFilter;
  guestModeratorsVm.moderatorFilter = { account: { name: '' } };
  guestModeratorsVm.MODERATOR_ROLES = ['SIMPLE', 'ADMIN'];

  function $onChanges(changesObject) {
    if (!changesObject.guest.previousValue.uuid) {
      return;
    }

    if (changesObject.guest.previousValue.uuid !== changesObject.guest.currentValue.uuid) {
      fetchModerators();
    }
  }

  function fetchModerators() {
    guestModeratorsVm.status = 'loading';

    $q.all([
      authenticationRestService.getCurrentUser(),
      guestRestService.listGuestModerator(guestModeratorsVm.guest.uuid)
    ])
      .then(([currentUser, moderators]) => {
        guestModeratorsVm.status = 'loaded';
        guestModeratorsVm.moderators = moderators;

        const currentUserAsModerator = moderators.find(moderator => moderator.account.uuid === currentUser.uuid);

        guestModeratorsVm.currentUserRole = currentUserAsModerator ? currentUserAsModerator.role : 'READER';
      })
      .catch(() => {
        guestModeratorsVm.status = 'error';
      });
  }

  function toggleRoleFilter(role) {
    if (guestModeratorsVm.moderatorFilter.role === role ) {
      delete guestModeratorsVm.moderatorFilter.role;

      return;
    }

    guestModeratorsVm.moderatorFilter.role = role;
  }

  function changePropertyOrderBy(orderParam, $event) {
    guestModeratorsVm.propertyOrderBy = orderParam;
    guestModeratorsVm.propertyOrderByAsc =
        guestModeratorsVm.propertyOrderBy === orderParam ? !guestModeratorsVm.propertyOrderByAsc : true;

    const mappingOrderFields = {
      name: 'account.name',
      role: 'role'
    };

    guestModeratorsVm.moderators = _.orderBy(guestModeratorsVm.moderators, [mappingOrderFields[orderParam]], [guestModeratorsVm.propertyOrderByAsc ? 'asc' : 'desc']);
    angular.element('.sort-dropdown a').removeClass('selected-sorting').promise().done(() => {
      angular.element($event.currentTarget).addClass('selected-sorting');
    });
  }
}
