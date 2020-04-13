module.exports = function (grunt) {
  grunt.initConfig({
    standard: {
      options: {
        envs: ['jest']
      },
      api: {
        src: [
          '**/*.js'
        ]
      }
    }
  })

  grunt.loadNpmTasks('grunt-standard')

  grunt.registerTask('default', ['standard'])
}
