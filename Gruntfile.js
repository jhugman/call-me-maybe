'use strict';


module.exports = function(grunt){
  var conf = require('build-facets')(__dirname)
            .loadRules('./config/server-facets.js')
            .loadConfiguration('./config/build-config.js');

  var themeFile = conf.get('theme');

  grunt.initConfig({
    dist: {
      build: 'build',
      assemble: 'build/assemble',
      dir: conf.resolve('project-dir', 'dist-relative'),
      assets: conf.resolve('project-dir', 'dist-relative', 'assets-relative'),
      theme: themeFile
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      client: ['client/**/*.js', 'lib/**/*.js'],
      server: ['lib/**/*.js', 'test/**/*.js', 'servers/**/*.js'],
      project: ['**/*.js', '!client/**/*.js', '!lib/**/*.js', '!test/*/**.js']
    },

    node_tap: {
      short_tests: {
        options: {
          outputType: 'failures', // tap, failures, stats
          outputTo: 'console' // or file
          //outputFilePath: '/tmp/out.log' // path for output file, only makes sense with outputTo 'file'
        },
        files: {
          'tests': ['./test/test-*.js', './client/test/test-*.js']
        }
      }
    },

    browserify: {
      dist: {
        files: {
          // should use '<%=dist.build%>'
          // the rest of the modules will be lazily discovered.
          'build/assemble/app.min.js': ['client/lib/entry/*.js']
        }
      },
      options: {
        debug: true
      }
    },

    stylus: {
      compile: {
        paths: ['client/style'],
        files: {
          'build/assemble/style.css': [themeFile]
        }
      }
    },

    clean: {
      options: {
        force: true, // we need this to be able to clean the dist directory outside of this dir.
      },
      client: {
        force: true,
        src: [ '<%=dist.dir%>', '<%=dist.assemble%>', '<%=dist.build%>' ]
      }
    },

    copy: {
      client: {
        files: [
          { expand: true, dot: true, cwd: 'build/assemble', src: [ '**' ], dest: '<%=dist.assets%>' },
          { flatten: false, expand: true, cwd: 'resources', src: conf.get('resources-common'), dest: '<%=dist.assets%>' },
          { flatten: false, expand: true, cwd: 'resources', src: conf.get('resources-specific'), dest: '<%=dist.assets%>' },
          
          //{ flatten: true, expand: true, src: ['node_modules/x-tag-core/dist/x-tag-core.js'], dest: '<%=dist.dir%>' },
          { flatten: true, expand: true, src: ['views/*'], dest: '<%=dist.dir%>/views', filter: 'isFile' },
        ]
      },

      server: {
        files: [
          { flatten: true, expand: true, src: ['views/*'], dest: '<%=dist.dir%>/views', filter: 'isFile' },
        ]
      }
    },

    concurrent: {
      dev: {
        options: {
          logConcurrentOutput: true
        },
        tasks: ['watch', 'nodemon:dev']
      }
    },

    nodemon: {
      dev: {
        script: './lib/app.js',
        watch: ['lib/**', 'servers/**', 'views/**']
      }
    },

    watch: {
      options: {
        interrupt: true
      },
      client: {
        files: [
          '<%= jshint.client %>',
          'client/**/*.html',
          'client/**/*.styl',
          'views/**/*.html',
        ],
        tasks: ['build-client']
      },
      server: {
        files: [
          '<%= jshint.server %>',
          'lib/**/*.js',
          'test/**/*.js',
          'views/*.html',
        ],
        tasks: ['build-server']
      },
      project: {
        files: [
          'Gruntfile.js', 
          'config/*.js',
        ],
        tasks: ['build-project']
      },
    },

    shell: {
      runNative: {
        command: conf.get('run-command'),
        options: {
          execOptions: {
            cwd: conf.resolve('project-dir')
          }
        }
      }
    },

    manifest: {
      generate: {
        options: {
          basePath: 'build',
          cache: [],
          //network: ['http://*', 'https://*'],
          //fallback: ['/ /offline.html'],
          //exclude: ['js/jquery.min.js'],
          preferOnline: false,
          verbose: true,
          timestamp: true,
          hash: true,
          master: ['index.html']
        },
        src: [
          '*.html',
          '*.js',
          '*.css'
        ],
        dest: '<%=dist.assets%>/manifest.appcache'
      }
    },

    connect: {
      server: {
        options: {
          port: 9001,
          hostname: "*",
          base: '<%=dist.dir%>'
        }
      }
    },


  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-node-tap');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('_build-extras', conf.get('extra-build-tasks'));  

  grunt.registerTask('default',[
    'build-project', 'concurrent'
  ]);

  grunt.registerTask('build-client',[
    'jshint:client', 'clean:client', 'browserify', 'stylus', 'copy:client', '_build-extras'
  ]);

  grunt.registerTask('build-server', [
    'jshint:server', 'copy:server',
  ]);

  grunt.registerTask('build-project', [
    'build-client', 'build-server'
  ]);

  

  // deprecated?
  grunt.registerTask('server', [
    'connect:server:keepalive'
  ]);

  grunt.registerTask('test',[
    'jshint', 'node_tap'
  ]);

  grunt.registerTask('run-native',[
    'shell:runNative'
  ]);

};
