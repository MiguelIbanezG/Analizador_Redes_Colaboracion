// karma.conf.js
module.exports = function(config) {
    config.set({
      frameworks: ['jasmine'],
      files: [
        // Agrega aquí los archivos de prueba que deseas incluir
        'src/app/*.spec.ts'
      ],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter')
      ],
      browsers: ['Chrome'],
      reporters: ['progress', 'kjhtml'],
      singleRun: false
    });
  };
  