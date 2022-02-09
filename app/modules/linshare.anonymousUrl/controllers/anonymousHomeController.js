
angular
  .module('linshare.anonymousUrl')
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('anonymousUrl');
  }])
  .controller('AnonymousHomeController', AnonymousHomeController)
  .controller('AnonymousHomeMessageModal', AnonymousHomeMessageModal);

AnonymousHomeController.$inject = ['message', '$mdDialog'];
AnonymousHomeMessageModal.$inject = ['$state', 'message', '$mdDialog'];

function AnonymousHomeController(message, $mdDialog) {
  $mdDialog.show({
    template: require('../views/messageModal.html'),
    controllerAs: 'messageModalVm',
    controller: 'AnonymousHomeMessageModal',
    clickOutsideToClose: false,
    locals: { message }
  });
}

function AnonymousHomeMessageModal ($state, message, $mdDialog) {
  const messageModalVm = this;

  messageModalVm.message = message;
  messageModalVm.backToHome = () => {
    $mdDialog.hide();
    $state.go('home');
  };
}
