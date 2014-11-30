module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: "/*!\n * Cartoon.js v<%= pkg.version %> \n" +
                        " * Copyright (c) 2012-2014 Andrew Myers (The Masked Coder) \n" +
                        " * MIT License \n" +
                        " */\n"
            },
            dist: {
                src: "<%= concat.dist.dest %>",
                dest: "dist/cartoon-<%= pkg.version %>.min.js"
            }
        },
        concat: {
            options: {
                banner: "/*!\n * Cartoon.js v<%= pkg.version %> \n" +
                        " * Copyright (c) 2012-2014 Andrew Myers (The Masked Coder)\n" +
                        " * MIT License \n" +
                        " */\n"
            },
            dist: {
                src: ["src/intro.js", "src/request-animation-frame.js", "src/canvas.js", "src/item.js", "src/animation.js", "src/outro.js"],
                dest: "dist/cartoon-<%= pkg.version %>.js",
                nonull: true
            }
        },
        jshint: {
            all: ["src/request-animation-frame.js", "src/canvas.js", "src/item.js", "src/animation.js"],
            build: "<%= concat.dist.dest %>"
        },
        sass: {
            dist: {
                files: {
                    "dist/cartoon.css": "src/cartoon.scss"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['concat', 'uglify', 'sass']);
};