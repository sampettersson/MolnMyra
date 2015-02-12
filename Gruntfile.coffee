module.exports = (grunt) ->

  grunt.initConfig
    coffee:
      MolnMyra:
        options:
          bare: true
          sourceMap: false
        expand: true
        flatten: false
        src: ["**/*.coffee", "!**/Gruntfile.coffee", "!node_modules/**/*"]
        ext: ".js"

  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.registerTask 'compile', ["coffee:MolnMyra"]
