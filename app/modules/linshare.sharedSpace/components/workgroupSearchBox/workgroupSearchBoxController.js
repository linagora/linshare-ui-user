angular
  .module('linshare.sharedSpace')
  .controller('workgroupSearchBoxController', workgroupSearchBoxController);

workgroupSearchBoxController.$inject = ['_', '$translate', 'moment', 'unitService', 'autocompleteUserRestService', 'WORKGROUP_SEARCH_DEFAULT_PARAMS'];

function workgroupSearchBoxController (_, $translate, moment, unitService, autocompleteUserRestService, WORKGROUP_SEARCH_DEFAULT_PARAMS) {
  const workgroupSearchBoxVm = this;

  workgroupSearchBoxVm.$onInit = $onInit;
  workgroupSearchBoxVm.unitService = unitService;
  workgroupSearchBoxVm.reset = reset;
  workgroupSearchBoxVm.submit = submit;
  workgroupSearchBoxVm.submitOnEnter = submitOnEnter;
  workgroupSearchBoxVm.updateTypesList = updateTypesList;
  workgroupSearchBoxVm.getSelectedFileKinds = getSelectedFileKinds;
  workgroupSearchBoxVm.userRepresentation = userRepresentation;
  workgroupSearchBoxVm.formatLabel = formatLabel;
  workgroupSearchBoxVm.autocompleteUserRestService = autocompleteUserRestService;

  function $onInit() {
    workgroupSearchBoxVm.maxDate = moment().add(1, 'day').hours(23).minutes(59).seconds(59);
    workgroupSearchBoxVm.params = {
      sizeUnit: unitService.units.MB,
      ...WORKGROUP_SEARCH_DEFAULT_PARAMS,
      ...workgroupSearchBoxVm.params,
    };

    workgroupSearchBoxVm.searchFiles = workgroupSearchBoxVm.params.type.includes('DOCUMENT');
    workgroupSearchBoxVm.searchFolders = workgroupSearchBoxVm.params.type.includes('FOLDER');
    workgroupSearchBoxVm.searchRevisions = workgroupSearchBoxVm.params.type.includes('DOCUMENT_REVISION');
  }

  function submit() {
    workgroupSearchBoxVm.onSubmit(workgroupSearchBoxVm.params);
  }

  function reset() {
    workgroupSearchBoxVm.params = {
      sizeUnit: unitService.units.MB,
      ...WORKGROUP_SEARCH_DEFAULT_PARAMS
    };

    workgroupSearchBoxVm.searchFiles = workgroupSearchBoxVm.params.type.includes('DOCUMENT');
    workgroupSearchBoxVm.searchFolders = workgroupSearchBoxVm.params.type.includes('FOLDER');
    workgroupSearchBoxVm.searchRevisions = workgroupSearchBoxVm.params.type.includes('DOCUMENT_REVISION');

    submit();
  }

  function submitOnEnter($event) {
    if ($event.keyCode === 13) {
      submit();
    }
  }

  function updateTypesList(type, addToList) {
    const typeIndex = workgroupSearchBoxVm.params.type.indexOf(type);

    if (addToList && typeIndex === -1) {
      workgroupSearchBoxVm.params.type =  [...workgroupSearchBoxVm.params.type, type];
    }

    if (!addToList && typeIndex !== -1) {
      workgroupSearchBoxVm.params.type.splice(typeIndex, 1);
    }
  }

  function getSelectedFileKinds() {
    if (workgroupSearchBoxVm.params.kind.length === 0) {
      return $translate.instant('WORKGROUP_SEARCH_BOX.TYPES.ANY');
    }

    return workgroupSearchBoxVm.params.kind
      .map(kind => $translate.instant(`WORKGROUP_SEARCH_BOX.TYPES.${kind}`))
      .join(', ');
  }

  function userRepresentation(user) {
    if (_.isString(user)) {
      return user;
    }

    if (_.isObject(user)) {
      return `<span>${user.display}</span> <span><i class="zmdi zmdi-email"></i> &nbsp;${user.mail}'</span>`;
    }
  }

  function formatLabel(user) {
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
  }
}