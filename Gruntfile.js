module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    lambda_invoke: {
      default: {
        options: {
          file_name: 'index.js',
          event: 'event.json'
        }
      }
    },
    lambda_package: {
      default: {
      }
    },
    lambda_deploy: {
      default: {
        options: {
          timeout: 300,
          memory: 512
        },
        arn: 'arn:aws:lambda:us-east-1:AWS-ACCOUNT-ID:function:cymonTwitterBot'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load Grunt AWS Lambda plugin
  grunt.loadNpmTasks('grunt-aws-lambda');
  grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};
