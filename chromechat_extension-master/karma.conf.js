var shared = require('./karma-shared.conf');

// Karma configuration
module.exports = function(config){
  shared(config);

  config.files = shared.files.concat([
    'test/spec/**/*.js',
    // include the templates directory
    'app/templates/*.html'
  ]);

  config.preprocessors = {
    // generate js files from html templates to expose them during testing.
    'app/templates/*.html': ['ng-html2js'],
    'app/scripts/{controllers/*,directives/*,models/*,services/*, *}.js': ['coverage']
  };
};

