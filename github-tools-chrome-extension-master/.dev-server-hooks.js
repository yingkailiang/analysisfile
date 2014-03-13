
var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;
var execFile = child_process.execFile;

var JAVA = '/usr/bin/java';


/**
 @param {Object} app - Express application.
 @param {Function} debug - Debug function.
 */
exports.hook = function(app, debug) {

  var notify = app.notify;

  var reClosureLibraryBuilder =
      /(\d+)\s*error\(s\),\s*(\d+)\s*warning(s),\s*([\d,\.]+)%\s*typed/i;

  /*
  if (process.env.DEV_SERVER_ENV === 'build') {
    var closureCompiler = function(files) {
      closureCompiler.kill();

      var args = [
        '-jar', 'tools/closure-compiler/build/compiler.jar',
        '--warning_level', 'verbose',
        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
        '--externs', 'lib/externs/maps.js',
        //'--compilation_level', 'WHITESPACE_ONLY',
        '--source_map_format', 'V3',
        '--create_source_map', 'build/frontend.js.map',
        '--js_output_file', 'build/frontend.js'
      ];

      args = args.concat(files);

      var handler = function(error, stdout, stderr) {
        closureCompiler.running = null;
        if (!error) {
          console.log('BUILD: ', stdout);
          console.error('BUILD ERROR AND/OR WARNINGS: ', stderr);
          console.log('BUILD SUCCEEDED');

          var match = stderr.match(reClosureLibraryBuilder);
          if (match) {
            notify('<b>BUILD SUCCEEDED</b>' + match[0]);
          }
        } else {
          if (error.killed) return;

          console.log('BUILD: ', stdout);
          console.error('BUILD ERROR: ', stderr);
          notify('Build Error !', 'error');
        }
      };

      closureCompiler.running = execFile(JAVA, args, handler);
      var pid = closureCompiler.running.pid;
      debug('closureCompiler: spawned ' + pid);
      closureCompiler.running.on('exit', function() {
        debug('closureCompiler: exit ' + pid);
      });
    };

    closureCompiler.kill = function() {
      if (closureCompiler.running) {
        debug('closureCompiler: killing ' + closureCompiler.running.pid,
            closureCompiler.running.kill('SIGTERM'));
        closureCompiler.running = null;
      }
    };
  } else {
    var closureCompiler = function(files) {
      closureCompiler.kill();

      var source = files.map(function(file) {
        return fs.readFileSync(file);
      }).join('\n;\n');

      fs.writeFile('build/frontend.js', source, function(err) {
        if (err)
          return notify('<b>BUILD ERROR</b>', 'error');

        notify('<b>FAKE BUILD SUCCEEDED!</b>', 'info');
      });
    };

    closureCompiler.kill = function() {
    };
  }

  var checkBuild = function() {
    //closureCompiler.kill();
    checkBuild.kill();
    var command = [
      'sh ./closure-library-builder',
      '--root=lib',
      '--output_mode=script',
      '--output_file=build/frontend.js',
      '--input=lib/frontend.js'
    ];

    var handler = function(error, stdout, stderr) {
      checkBuild.running = null;

      if (!error) {

        notify('<b>Dependencies calculated</b>\n' + stdout.trim(), 'info');

        //closureCompiler(deps);

      } else {
        if (error.killed) return;
        console.log('checkBuild: ', stdout);
        console.error('checkBuild error: ', stderr);
        notify(stderr, 'error');
      }
    };

    checkBuild.running = exec(command.join(' '), handler);
    var pid = checkBuild.running.pid;
    debug('checkBuild: spawned ' + pid);
    checkBuild.running.on('exit', function() {
      debug('checkBuild: exit ' + pid);
    });
  };

  checkBuild.kill = function() {
    if (checkBuild.running) {
      debug('checkBuild: killing ' + checkBuild.running.pid,
          checkBuild.running.kill('SIGTERM'));
      checkBuild.running = null;
    }
  }
  */

  /*
  app.watch(/\.js$/i, function(ev) {
    if (/^build\//i.test(ev.path))
      return;

    var command = ['/bin/sh ./jslint'];

    command.push('"' + ev.path + '"');

    var child = exec(command.join(' '), function(error, stdout, stderr) {
      var output = stdout.trim().split('\n');
      var niceoutput = [];
      output.slice(0, 5).forEach(function(line) {
        console.error(line);

        line = line.trim();
        if (line === '')
          return;

        var match = line.match(/:(\d+):\(([^)]*)\)\s*(.*)$/);
        if (match) {
          niceoutput.push('\n<b>', match[1], '</b>: ', match[3]);
        }
      });

      if (niceoutput.length > 0) {
        notify('<b>Lint</b>: ' + ev.path + niceoutput.join(''), 'error');
        //checkBuild(ev.path);
      } else {
        notify('<b>Lint OK</b>: ' + ev.path + niceoutput.join(''), 'info');
        //checkBuild(ev.path);
      }
    });

  });
  */

  app.watch(/\.jade$/i, function(ev) {
    var command = ['jade'];

    command.push('"' + ev.path + '"');

    var child = exec(command.join(' '), function(error, stdout, stderr) {
      var output = stdout.trim().split('\n');
      var niceoutput = [];
      output.slice(0, 5).forEach(function(line) {
        console.error(line);

        line = line.trim();
        if (line === '')
          return;

        var match = line.match(/:(\d+):\(([^)]*)\)\s*(.*)$/);
        if (match) {
          niceoutput.push('\n<b>', match[1], '</b>: ', match[3]);
        }
      });

      if (niceoutput.length > 0) {
        notify('<b>Jade</b>: ' + ev.path + niceoutput.join(''), 'error');
      } else {
        notify('<b>Jade OK</b>: ' + ev.path + niceoutput.join(''), 'info');
      }
    });

  });

};
