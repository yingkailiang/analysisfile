/*jshint camelcase: false*/
// Generated on 2013-11-30 using generator-chrome-extension 0.1.1
'use strict';
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
            dist: {}
        },*/
        // not enabled since usemin task does concat and uglify
        // check index.html to edit your build targets
        // enable this task if you prefer defining your build targets here
        /*uglify: {
            dist: {}
        },*/
        useminPrepare: {
            html: [
                '<%= yeoman.app %>/popup.html',
                '<%= yeoman.app %>/options.html'
            ],
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        'images/{,*/}*.{webp,gif}',
                        '_locales/{,*/}*.json'
                    ]
                }]
            }
        },
        concurrent: {
            dist: [
                'imagemin',
                'svgmin',
                'htmlmin',
                'cssmin'
            ]
        },
        compress: {
            dist: {
                options: {
                    archive: 'package/tvlisting.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('prepareManifest', function() {
        var scripts = [];
        var concat = grunt.config('concat') || {dist:{files:{}}};
        var uglify = grunt.config('uglify') || {dist:{files:{}}};
        var manifest = grunt.file.readJSON(yeomanConfig.app + '/manifest.json');

        if (manifest.background.scripts) {
            manifest.background.scripts.forEach(function (script) {
                scripts.push(yeomanConfig.app + '/' + script);
            });
            concat.dist.files['<%= yeoman.dist %>/scripts/background.js'] = scripts;
            uglify.dist.files['<%= yeoman.dist %>/scripts/background.js'] = '<%= yeoman.dist %>/scripts/background.js';
        }

        if (manifest.content_scripts) {
            manifest.content_scripts.forEach(function(contentScript) {
                if (contentScript.js) {
                    contentScript.js.forEach(function(script) {
                        uglify.dist.files['<%= yeoman.dist %>/' + script] = '<%= yeoman.app %>/' + script;
                    });
                }
            });
        }

        grunt.config('concat', concat);
        grunt.config('uglify', uglify);
    });

    grunt.registerTask('manifest', function() {
        var manifest = grunt.file.readJSON(yeomanConfig.app + '/manifest.json');
        manifest.background.scripts = ['scripts/background.js'];
        grunt.file.write(yeomanConfig.dist + '/manifest.json', JSON.stringify(manifest, null, 2));
    });

    grunt.registerTask('build', [
        'clean:dist',
        'prepareManifest',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'uglify',
        'copy',
        'usemin',
        'manifest',
        'compress'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
