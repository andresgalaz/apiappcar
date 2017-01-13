module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  require('jit-grunt')(grunt);
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "assets/css/snapcar-custom.min.css": "assets/less/snapcar-custom.less" // destination file and source file
        }
      }
    },
    gitadd: {
      task: {
        options: {
          all: true
        }
      }
    },
    gitcommit: {
      task: {
        options: {
          message: 'Actualizado ' + grunt.template.today(),
          allowEmpty: true
        }
      }
    },
    gitpush: {
      task: {
        options: {
          remote: 'origin',
          branch: 'master'
        }
      }
    },
    watch: {
      styles: {
        files: ['assets/less/**/*.less'],
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },
      templates: {
        files: ['views/*', 'assets/css/*'],
        tasks: ['gitadd','gitcommit','gitpush']
      }
    }
  });

  grunt.registerTask('default', ['less', 'watch']);
};