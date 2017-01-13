module.exports = function (grunt) {
  require('jit-grunt')(grunt);

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
          force: true,
          all: true,
          cwd: '/'
        }
      }
    },
    watch: {
      styles: {
        files: ['less/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.registerTask('default', ['less', 'watch']);
};