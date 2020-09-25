angular.module('linshare.directives')
  .directive('otpInput', otpInput);

otpInput.$inject = ['$timeout'];

function otpInput($timeout) {
  return {
    restrict: 'E',
    scope: {
      options: '=',
      nextElem: '=',
      value: '='
    },
    template: require('./otpInputDirective.html'),
    link: function($scope) {
      let elementArr = [];
      const options = $scope.options || {};
      const size = parseInt(options.size) || 6;

      //generating a random number to attach to id
      const randomNumber = Math.floor(Math.random() * 10000) + 100;

      // Focus forward when enter number
      $scope.onKeyUp = function(index, event) {
        const key = event.key;

        if ($scope.characters[index].value.length > 0 && isNumberKey(key)) {
          setOtpValue();
          if (index !== size - 1) {
            $timeout(() => {
              elementArr[index + 1][0].focus();
              if ($scope.characters[index + 1].value) {
                elementArr[index + 1][0].select();
              }
            }, 50);
          }
        }
      };

      // Focus back when press delete
      $scope.onKeyDown = function(index, event) {
        const key = event.keyCode || event.which;

        // Handle arrow button
        if (key === 39 && index !== size - 1) {
          $timeout(() => {
            elementArr[index + 1][0].focus();
            if ($scope.characters[index + 1].value) {
              elementArr[index + 1][0].select();
            }
          }, 50);
        } else if (key === 37 && index !== 0) {
          $timeout(() => {
            elementArr[index - 1][0].focus();
            if ($scope.characters[index - 1].value) {
              elementArr[index - 1][0].select();
            }
          }, 50);
        } else if (key === 8 && index !== 0) {
          $timeout(() => {
            elementArr[index - 1][0].focus();
            if ($scope.characters[index - 1].value) {
              elementArr[index - 1][0].select();
            }
          }, 50);
        }
      };

      $scope.onKeyPress = function(event) {
        if (event.key === 'Enter' || isNumberKey(event.key)) {
          return;
        }
        event.originalEvent.preventDefault();
      };

      // Handle copy & paste from user
      $scope.onPaste = function(event) {
        // Stop data actually being pasted into div
        event.preventDefault();
        const pastedData = event.originalEvent.clipboardData.getData('text/plain').split('');

        if (pastedData.find(letter => !isNumberKey(letter))) {
          return;
        }

        const otpPastedData = pastedData.slice(0, 6);

        setCharactersAndOTPValue(otpPastedData);
      };

      // Handle click on input
      $scope.onClick = function(index) {
        if ($scope.characters[index].value) {
          elementArr[index][0].select();
        }
      };

      function setCharactersAndOTPValue(arrayValue = []) {
        $scope.characters = Array.apply(null, {length: size}).map(Number.call, Number).map(index => ({
          index: `${randomNumber}-${index}`,
          value: arrayValue[index] || '',
          i: index
        }));

        $timeout(() => {
          // Initialize elementArr
          elementArr = $scope.characters.map(character => {
            return angular.element(document.querySelector(`#otpInput${character.index}`));
          });

          // Focus on the first empty element, or the last element
          const indexOfEmptyInput = $scope.characters.find(char => char.value === '');

          if (indexOfEmptyInput) {
            elementArr[indexOfEmptyInput.i][0].focus();
          } else {
            elementArr[size - 1][0].focus();
          }
        }, 50);

        setOtpValue();
      }

      function isNumberKey(letter) {
        return letter.match(/^[0-9]$/);
      }

      function calculateInputSize() {
        const width = 100 / (size + 1);
        const margin = width / size;
        
        $scope.style = {
          'margin-right': margin + '%',
          'width': width + '%'
        };
      }

      function setOtpValue() {
        $scope.value = '';

        $scope.characters.forEach((character) => {
          $scope.value = $scope.value + character.value;
        });
      };

      $scope.$watch(() => {
        return $scope.value;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          setCharactersAndOTPValue(newValue.split(''));
        }
      });

      calculateInputSize();
      setCharactersAndOTPValue();
    }
  };
}