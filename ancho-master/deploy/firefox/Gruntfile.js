module.exports = function(grunt) {

  var path = require('path');
  var _s = require('underscore.string');

  var CODE_DIR = '../../code/firefox/';
  var TEST_EXTENSION_DIR = '../../tests/test-suite-extension';
  var MINIFIED_MODULES = 'minified_modules';
  var TEST_EXTENSION_ID = 'test@salsitasoft.com';

  var outputDir = grunt.option('outputDir') || '../../build';
  var destDir = path.join(outputDir, 'ancho');

  function buildModuleList(pkg) {
    var moduleList = [];
    for (var dependency in pkg.bundledDependencies) {
      moduleList.push(path.join(path.join('node_modules', dependency), 'package.json'));
    }
    return moduleList;
  }

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,

    crx: {
      test_extension: {
        'src': TEST_EXTENSION_DIR,
        'dest': outputDir,
        'filename': '<%= pkg.name %>-test-<%= pkg.version %>.crx',
        'privateKey': 'key.pem'
      }
    },
    package_minifier: {
      node_modules: {
        options: { target: 'browser' },
        src: buildModuleList(pkg),
        dest: MINIFIED_MODULES
      }
    },
    copy: {
      main: {
        files: [
          { expand: true, src: [ 'package.json' ], dest: destDir },
          { expand: true, cwd: CODE_DIR, src: [ 'chrome.manifest '], dest: destDir },
          { expand: true, cwd: CODE_DIR, src: [ 'content/**/*' ], dest: destDir },
          { expand: true, cwd: CODE_DIR, src: [ 'js/**/*' ], dest: destDir },
          { expand: true, cwd: CODE_DIR, src: [ 'modules/**/*' ], dest: destDir },
          { expand: true, cwd: MINIFIED_MODULES, src: [ '**/*' ], dest: path.join(destDir, 'js/node_modules') }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-crx');
  grunt.loadNpmTasks('grunt-package-minifier');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', [ 'package_minifier', 'copy' ]);
};