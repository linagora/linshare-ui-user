// Karma configuration
// Generated on Tue Mar 03 2015 16:13:12 GMT+0000 (UTC)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. documents, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of documents / patterns to load in the browser
    files: [
      'vendors/bower_components/angular/angular.js',
      'vendors/bower_components/angular-mocks/angular-mocks.js',
      'vendors/bower_components/angular-animate/angular-animate.js',
      'vendors/bower_components/angular-cookies/angular-cookies.js',
      'vendors/bower_components/angular-messages/angular-messages.js',
      'vendors/bower_components/angular-resource/angular-resource.js',
      'vendors/bower_components/angular-route/angular-route.js',
      'vendors/bower_components/angular-sanitize/angular-sanitize.js',
      'vendors/bower_components/angular-touch/angular-touch.js',
      'vendors/bower_components/lodash/dist/lodash.js',
      'vendors/bower_components/restangular/src/restangular.js',
      'vendors/bower_components/ng-table/dist/ng-table.js',
      'vendors/bower_components/angular-http-auth/src/http-auth-interceptor.js',
      'vendors/bower_components/angular-bootstrap/ui-bootstrap.js',
      'vendors/bower_components/flow.js/dist/flow.js',
      'vendors/bower_components/ng-flow/dist/ng-flow.js',
      'vendors/bower_components/angular-pageslide-directive/dist/angular-pageslide-directive.js',
      'vendors/bower_components/angular-translate/angular-translate.js',
      'vendors/bower_components/js-base64/base64.js',
      'app/scripts/{,*/}*.js',
      'app/modules/linshare.authentication/authenticationService.js',
      'app/modules/linshare.receivedShare/receivedShareService.js',
      'app/modules/{,*/}*.js',
      'test/unit/**/*.js'
    ],


    // list of documents to exclude
    exclude: [
    ],


    // preprocess matching documents before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
