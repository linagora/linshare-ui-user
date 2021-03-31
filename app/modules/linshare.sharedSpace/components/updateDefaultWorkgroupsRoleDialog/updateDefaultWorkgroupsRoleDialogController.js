angular
  .module('linshare.sharedSpace')
  .controller('updateDefaultWorkgroupsRoleDialogController', updateDefaultWorkgroupsRoleDialogController);

updateDefaultWorkgroupsRoleDialogController.$inject = ['$mdDialog', 'sharedSpace', 'workgroupRoles', 'initialRole'];

function updateDefaultWorkgroupsRoleDialogController($mdDialog, sharedSpace, workgroupRoles, initialRole) {
  const self = this;

  self.sharedSpace = sharedSpace;
  self.workgroupRoles = workgroupRoles;
  self.selectedRole = initialRole;

  self.proceed = () => $mdDialog.hide({
    forceOverride: !!self.override,
    role: self.selectedRole
  });
  self.abort = () => $mdDialog.cancel();
}