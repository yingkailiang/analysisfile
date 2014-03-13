var shared = require('./karma-shared.conf');

// Karma E2E configuration
module.exports = function(config){
  shared(config);

  config.files = shared.files.concat([
    'app/bower_components/ngMidwayTester/Source/ngMidwayTester.js',
    'test/midway/**/*.js',
    // include the templates and views directories
    'app/templates/*.html',
    'app/views/*.html'
  ]);

  config.preprocessors = {
    // generate js files from html templates to expose them during testing.
    'app/{templates,views}/*.html': ['ng-html2js'],
    'app/scripts/{controllers/*,directives/*,models/*,services/*, *}.js': ['coverage']
  };

  // Uncomment the following lines if you are using grunt's server to run the tests
  // proxies: {
  //   '/': 'http://localhost:9000/'
  // },
  // URL root prevent conflicts with the site root
  // urlRoot: '_karma_'
};

