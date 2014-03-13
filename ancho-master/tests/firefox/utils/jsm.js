(function() {
  var fs = require('fs'),
    vm = require('vm'),
    path = require('path'),
    components = require('../mocks/components');

  var loaded = {};
  var sandboxStack = [];

  function load(filename) {
    var filepath;
    if ('/' === filename.charAt(0)) {
      filepath = filename;
    }
    else {
      filepath = path.resolve(__dirname, filename);
    }
    if (filepath in loaded) {
      return loaded[filepath];
    }
    var source = '\'use strict\';\n' + fs.readFileSync(filepath, 'utf8');
    EXPORTED_SYMBOLS = [];
    Components = components.Components;
    dump = console.log;
    vm.runInThisContext(source, filename);
    var result = {};
    for (var i=0; i<EXPORTED_SYMBOLS.length; i++) {
      var symbol = EXPORTED_SYMBOLS[i];
      result[symbol] = GLOBAL[symbol];
    }
    loaded[filepath] = result;
    return result;
  }

  exports.sandboxStack = sandboxStack;
  exports.load = load;
}).call(this);