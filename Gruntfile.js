// Generated on 2015-03-02 using generator-angular 0.11.1
'use strict';

var GruntfileThemes = require('./tasks/utils/Gruntfile-themes');
var uuid = require('uuid/v1');
const build_uuid = uuid().split("-").shift();

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  var serveStatic = require('serve-static');

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches documents for changes and runs tasks based on the changed documents
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: [
          '<%= yeoman.app %>/directives/*/*.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js',
          '<%= yeoman.app %>/modules/**/{,*/}*.js'
        ],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/unit/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/{,*/{,*/}*}*}*.{scss,sass}'],
        tasks: ['compass:server', 'postcss']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },


    // Dynamically manage the minification of the application themes
    cssmin : new GruntfileThemes(appConfig).list().reduce(function(config, theme) {
        if (theme.indexOf('default') === -1) {
          config[`<%= yeoman.dist %>/styles/${theme}.${build_uuid}.css`] = `.tmp/styles/${theme}.css`;
        }
        return config;
      }, {}),

    // The actual grunt server settings
    connect: {
      options: {
        port: 3504,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        open: false,
        livereload: 35728
      },
      livereload: {
        options: {
          open: true,
          middleware: function(connect) {
            return [
              serveStatic('.tmp'),
              connect().use(
                '/vendors/bower_components',
                serveStatic('./vendors/bower_components')
              ),
              connect().use(
                '/app/styles',
                serveStatic('./app/styles')
              ),
              connect().use(
                '/node_modules/',
                serveStatic('./node_modules')
              ),
              serveStatic(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function(connect) {
            return [
              serveStatic('.tmp'),
              serveStatic('test'),
              connect().use(
                '/vendors/bower_components',
                serveStatic('./vendors/bower_components')
              ),
              serveStatic(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          '<%= yeoman.app %>/scripts/{,*/}*.js',
          '<%= yeoman.app %>/directives/*/*.js',
          '<%= yeoman.app %>/modules/**/*.js',
          '!<%= yeoman.app %>/modules/**/test/karma.conf.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/unit/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')({
            browsers: ['last 5 version', 'ie >= 11', 'Firefox ESR', 'Firefox >= 38', 'Edge >= 38',]
          })
        ],
        failOnError: true
      },
      dist: {
        src: '.tmp/styles/{,*/{,*/{,*/}*}*}*.css',
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: /\.\.\//
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath: /\.\.\//,
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      },
      sass: {
        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles Sass to CSS and generates necessary documents if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        importPath: './vendors/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          sourcemap: true
        }
      }
    },

    // Renames documents for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/directives/*/*.js',
          '<%= yeoman.dist %>/styles/!(theme\.){,*/}*.css',
          //'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/config/config.js',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision documents. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>',
          '<%= yeoman.dist %>/images',
          '<%= yeoman.dist %>/styles'
        ]
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
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

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html', 'directives/*/*.html', 'modules/**/views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining documents to places other tasks can use
    copy: {
      material: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          dest: '.tmp/',
          src: [
            'styles/materialAdmin.css'
          ]
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'directives/*/*.html',
            'modules/**/**/*.html',
            'i18n/original/{,*/}*.json',
            'images/{,*/}*.{webp}',
            'config/config.js',
            'styles/fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'vendors/bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          cwd: 'vendors/bower_components/material-design-iconic-font/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          cwd: 'vendors/bower_components/font-awesome',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          cwd: 'vendors/bower_components/flag-icon-css',
          src: 'flags/{,*/}*',
          dest: '<%= yeoman.dist %>'
        }, {
          src: 'bower.json',
          dest: '<%= yeoman.dist %>/about.json'
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    ngdocs: {
      all: ['app/scripts/{,*/}*.js', 'app/directives/*/*.js', 'app/modules/{,*/}*.js']
    },

    // Test settings
    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      },
      linshareAuthentication: {
        configFile: 'app/modules/linshare.authentication/test/karma.conf.js'
      },
      linshareDocument: {
        configFile: 'app/modules/linshare.document/test/karma.conf.js'
      },
      unit: {
        configFile: 'test/karma.conf.js'
      }
    },

    protractor: {
      options: 'test/protractor.conf.js',
      keepAlive: true,
      noColor: false,
      args: {
        // Arguments passed to the command
      },
      your_target: { /* jshint ignore: line*/
        options: {
          configFile: 'e2e.conf.js',
          args: {}
        }
      }
    }
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'postcss',
      'connect:livereload',
      'watch'
    ]);
  });
  
  grunt.registerTask('cssrename', 'rename css with correct build id', function() {
    const done = this.async(); // creating an async variable
    const fs = require('fs');
    const stylesPath = process.cwd() + '/dist/styles/';
    let buildId;

    console.log('\n => CSS Rename in position!!');
    fs.readdir(stylesPath, function(err, files) {
      console.log('\n => CSS Rename: Getting build ID');
      for (let index in files) {
        let file = files[index];

        if (file.indexOf('theme.default') !== -1) {
          buildId = file.split('.')[2]
          console.log('> build id for css files: ', buildId);
        }
      }
      console.log('\n => CSS Rename: Proceed to "clone"');
      for (let index in files) {
        let file = files[index];

        if (file.indexOf('theme.') !== -1 && file.indexOf('default') === -1) {
          let itemSplitted = file.split('.');

          itemSplitted[2] = buildId;

          const nameWithBuildId = itemSplitted.join('.');

          console.log('> before ', file);
          console.log('> after ', itemSplitted.join('.'));
          fs.rename(stylesPath + file, stylesPath + nameWithBuildId, function(err) {
            if ( err ) console.log('ERROR during grunt task cssrename - could not rename: ' + err);
          });
        }
      }

      console.log('\n => CSS Rename: I\'m OUT! ');
      done();
    });
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'postcss',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build-nomin', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'filerev',
    'usemin'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'copy:material',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'cssrename',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
