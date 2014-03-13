var shared = function(config) {
  config.set({
    basePath: '',
    exclude: [],
    port: 8081,
    runnerPort: 9100,
    colors: true,
    autoWatch: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    captureTimeout: 5000,
    singleRun: false,

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    plugins: [
      "karma-jasmine",
      "karma-chrome-launcher",
      "karma-ng-html2js-preprocessor",
      //"karma-ng-scenario",
      "karma-coverage"
    ],

    frameworks: [
      'jasmine',
      //"ng-scenario"
    ],

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'app/',

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'templates'
    }
  });
};

shared.files = [
  'app/bower_components/jquery/jquery.js',
  'app/bower_components/underscore/underscore.js',
  'app/bower_components/angular/angular.js',
  'app/bower_components/angular-sanitize/angular-sanitize.js',
  'app/bower_components/angular-mocks/angular-mocks.js',
  'app/scripts/vendor/foundation/foundation.js',
  'app/scripts/*.js',
  'app/scripts/**/*.js'
];

shared.reporters = ['progress', 'coverage'];

module.exports = shared;
