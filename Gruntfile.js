module.exports = function (grunt) {
    var pkg = grunt.file.readJSON("package.json");
    grunt.initConfig({
        clean: [
            "resourceLoader.js",
            "resourceLoader.min.js",
            "resourceLoader.min.map",
            "dest/*.js",
            "doc/*"
        ],
        ect: {
            debug: {
                src: "src/resourceLoader.js",
                dest: "dest/resourceLoader.debug.js",
                variables: {
                    version: pkg.version
                }
            }
        },
        removelogging: {
            dist: {
                src: "dest/resourceLoader.debug.js",
                dest: "dest/resourceLoader.nodebug.js"
            }
        },
        copy: {
            main: {
                files: [
                    {
                        src: "dest/resourceLoader.debug.js",
                        dest: "resourceLoader.js"
                    }
                ]
            }
        },
        yuidoc: {
            compile: {
                name: pkg.name,
                description: pkg.description,
                version: pkg.version,
                url: pkg.homepage,
                options: {
                    paths: ".",
                    exclude: "src,dest",
                    outdir: "doc/"
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    "resourceLoader.min.js": "dest/resourceLoader.nodebug.js"
                },
                options: {
                    sourceMap: true,
                    sourceMapName: "resourceLoader.min.map",
                    sourceMapIncludeSources: true,
                    preserveComments: "some"
                }
            }
        }
    });

    for (var taskName in pkg.devDependencies) {
        if (taskName.substring(0, 6) == "grunt-") {
            console.log("loadNpmTasks: ", taskName);
            grunt.loadNpmTasks(taskName);
        }
    }
    grunt.registerTask("default", [
        "clean",
        "ect",
        "removelogging",
        "copy",
        "yuidoc",
        "uglify"
    ]);
};