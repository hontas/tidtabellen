/* jshint indent: 2 */
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },

      dist: {
        src: [
          'src/js/vendor/jquery.js',
          'src/js/vendor/underscore.js',
          'src/js/vendor/bootstrap.js',
          'src/js/vendor/angular.js',

          'src/js/*.js'
        ],
        dest: 'public/js/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },

      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'public/js/<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          angular: true,
          console: true,
          jQuery: true,
          $: true,
          expect: true,
          describe: true,
          it: true
        }
      },

      gruntfile: {
        src: 'Gruntfile.js'
      },

      js: {
        src: ['src/js/*.js']
      }
    },

    less: {
      development: {
        options: {
          paths: ["less"]
        },
        files: {
          "public/css/style.css": "src/less/style.less"
        }
      },

      production: {
        options: {
          paths: ["less"],
          cleancss: true
        },
        files: {
          "public/css/style.css": "src/less/style.less"
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    clean: {
      all: ['public'],
      html: ['public/index.html'],
      fonts: ['public/fonts'],
      css: ['public/css'],
      js: ['public/js']
    },

    copy: {
      html: {
        expand: true,
        cwd: 'src',
        src: 'index.html',
        dest: 'public/'
      },

      fonts: {
        expand: true,
        cwd: 'src/',
        src: ['fonts/*'],
        dest: 'public/'
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },

      html: {
        files: ['src/index.html'],
        tasks: ['copy:html'],
        options: {
          livereload: true
        }
      },

      js: {
        files: ['src/js/*.js'],
        tasks: ['jshint:js', 'karma', 'concat'],
        options: {
          livereload: true
        }
      },

      test: {
        files: ['test/**/*.js'],
        tasks: ['karma'],
        options: {
          livereload: false
        }
      },

      less: {
        files: 'src/css/**/*.less',
        tasks: ['less'],
        options: {
          livereload: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', ['clean:all', 'copy', 'less:development', 'jshint', 'karma', 'concat', 'watch']);
  grunt.registerTask('production', ['clean:all', 'copy', 'less:production', 'jshint', 'karma', 'concat', 'uglify']);

};
