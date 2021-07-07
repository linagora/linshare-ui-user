angular
  .module('linshare.sharedSpace')
  .controller('workgroupSearchBoxController', workgroupSearchBoxController);

workgroupSearchBoxController.$inject = ['_', '$translate', 'moment', 'unitService', 'autocompleteUserRestService'];

function workgroupSearchBoxController (_, $translate, moment, unitService, autocompleteUserRestService) {
  const workgroupSearchBoxVm = this;
  const DEFAULT_PARAMS = {
    pattern: '',
    type: ['DOCUMENT', 'FOLDER'],
    kind: [],
    lastAuthor: null,
    creationDateAfter: null,
    creationDateBefore: null,
    modificationDateAfter: null,
    modificationDateBefore: null,
    sizeStart: null,
    sizeEnd: null,
    sizeUnit: unitService.units.MB
  };

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
      ...DEFAULT_PARAMS,
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
    Object.assign(workgroupSearchBoxVm.params, DEFAULT_PARAMS);
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
      workgroupSearchBoxVm.params.type.push(type);
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