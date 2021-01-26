angular
  .module('linshare.utils')
  .factory('formUtilsService', formUtilsService);

formUtilsService.$inject = ['_'];

function formUtilsService(_) {
  return {
    setSubmitted
  };

  function setSubmitted(form) {
    form.$setSubmitted();

    _.forEach(form, item => {
      if (item && item.$$parentForm === form && item.$setSubmitted) {
        setSubmitted(item);
      }
    });
  }
}
