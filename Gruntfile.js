module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: ['*.js', '*/*.js']
        },
        jsonlint: {
            sample: {
                src: [ '*.json' ]
            }
        },
        watch : {
            js : {
                files : ['*.js', '*/*.js'],
                tasks : ['jshint']
            },
            json : {
                files : ['*.json'],
                tasks : ['jsonlint']
            },
        }
    });


    //Tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsonlint');


    grunt.registerTask('default',['watch']);

};