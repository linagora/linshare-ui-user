angular
  .module('linshare.components')
  .controller('dateTimePickerController', dateTimePickerController)
  .constant('HOUR_VALUES', [
    { value: 0, key: '00:00' },
    { value: 1, key: '01:00' },
    { value: 2, key: '02:00' },
    { value: 3, key: '03:00' },
    { value: 4, key: '04:00' },
    { value: 5, key: '05:00' },
    { value: 6, key: '06:00' },
    { value: 7, key: '07:00' },
    { value: 8, key: '08:00' },
    { value: 9, key: '09:00' },
    { value: 10, key: '10:00' },
    { value: 11, key: '11:00' },
    { value: 12, key: '12:00' },
    { value: 13, key: '13:00' },
    { value: 14, key: '14:00' },
    { value: 15, key: '15:00' },
    { value: 16, key: '16:00' },
    { value: 17, key: '17:00' },
    { value: 18, key: '18:00' },
    { value: 19, key: '19:00' },
    { value: 20, key: '20:00' },
    { value: 21, key: '21:00' },
    { value: 22, key: '22:00' },
    { value: 23, key: '23:00' },
  ]);

dateTimePickerController.$inject = ['moment', '$scope', 'HOUR_VALUES'];

function dateTimePickerController(moment, $scope, HOUR_VALUES) {
  const dateTimePickerVm = this;
  let removeDateChangeWatcher;

  dateTimePickerVm.$onInit = $onInit;
  dateTimePickerVm.$onChanges = $onChanges;
  dateTimePickerVm.$onDestroy = $onDestroy;
  dateTimePickerVm.updateHourOfDatetime = updateHourOfDatetime;

  function $onInit() {
    dateTimePickerVm.hour = moment(dateTimePickerVm.datetime).hour();

    //NOTE: watcher to fix uib-datepicker-popup automatically set hour to 0:00 when change date via input
    removeDateChangeWatcher = $scope.$watch(() => dateTimePickerVm.datetime, (newValue, oldValue) => {
      if (newValue && (!oldValue || (new Date(newValue).getTime() !== new Date(oldValue).getTime()))) {
        updateHourOfDatetime();
      }
    });
  };

  function $onChanges({ options }) {
    if (options) {
      updateHoursList(options.currentValue);
    }
  }

  function $onDestroy() {
    if (removeDateChangeWatcher) {
      removeDateChangeWatcher();
    }
  }

  function updateHourOfDatetime() {
    dateTimePickerVm.datetime = moment(dateTimePickerVm.datetime).set({ hour: dateTimePickerVm.hour }).toDate();
    dateTimePickerVm.onChange(dateTimePickerVm.datetime);
  };

  function updateHoursList({ minHour, maxHour } = {}) {
    dateTimePickerVm.hours = HOUR_VALUES
      .filter(
        hour => ((minHour && hour.value >= minHour) || !minHour) &&
                ((maxHour && hour.value <= maxHour) || !maxHour)
      );
  }
}