'use strict';

const sass = require('node-sass');

module.exports = function(grunt) {
    // Do grunt-related things in here
    // Variable

    // Project configuration.
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= pkg.license %> */\n',

        clean : {
            src : ['dist']
        },

        // concat
        concat : {
            options : {
                separator : ';',
                banner : '<%= banner %>',
                stripBanners : true
            },
            dist : {
                src : ['src/**/*.js'],
                dest : 'dist/<%= pkg.name %>.js'
            }
        },

        // uglify
        uglify : {
            // Task-level options may go here, overriding task defaults.
            options : {
                banner : '<%= banner %>',
            },
            dist : {
                // No options specified; this target will use task-level options.
                src : '<%= concat.dist.dest %>',
                dest : 'dist/<%= pkg.name %>.min.js'
            }
        },

        // javascript unit test framework
        qunit : {
            files : ['test/**/*.html']
        },

        // static check, detect the errors and potential problems in the js code
        jshint : {
            options : {
                jshintrc : true,
            },
//            gruntfile : {
//                options : {
//                    jshintrc : '.jshintrc'
//                },
//                src : 'Gruntfile.js'
//            },
            src : {
                src : ['src/**/*.js']
            },
            test : {
                src : ['test/**/*.js']
            },
        },

        // SCSS compile
        sass : {
            dist : {
                options : {
                    implementation : sass,
                    outputStyle : 'compressed'
                },
                files : {
                    'dist/css/<%= pkg.name %>.min.css' : ['src/**/*.scss']
                }
            },
        },

        // watch
        watch : {
            js : {
                files : ['src/**/*.js', 'test/**/*.js'],
                tasks : ['dev']
            },
            css : {
                files : ['src/**/*.scss'],
                tasks : ['dev']
            }
        }
    });

    // Load the plugin
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    //grunt.registerTask('dev', ['jshint', 'qunit', 'clean', 'concat:dist', 'uglify', 'sass']);
    grunt.registerTask('clear', ['clean']);
    grunt.registerTask('dev', ['jshint', 'clean', 'uglify', 'sass']);
    grunt.registerTask('prod', ['clean', 'concat:dist', 'uglify', 'sass']);
};
