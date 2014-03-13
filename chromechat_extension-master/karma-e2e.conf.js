var shared = require('./karma-shared.conf');

// Karma E2E configuration
module.exports = function(config){
  shared(config);

  config.files = shared.files.concat([
    'app/bower_components/angular-scenario/angular-scenario.js',
    'test/e2e/**/*.js'
  ]);

  config.preprocessors = {
    'app/scripts/{controllers/*,directives/*,models/*,services/*, *}.js': ['coverage']
  };

  // Uncomment the following lines if you are using grunt's server to run the tests
  // proxies: {
  //   '/': 'http://localhost:9000/'
  // },
  // URL root prevent conflicts with the site root
  // urlRoot: '_karma_'
};

