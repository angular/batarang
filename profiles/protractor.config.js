// An example configuration file.
// https://raw.github.com/angular/protractor/master/example/conf.js
exports.config = {
  // The address of a running selenium server.
  // if you get a permissions error, you can try this (warning: unsecure)
  // chmod -R nobody:<group> /usr/local/lib/node_modules/protractor/selenium
  seleniumServerJar: '../node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar', // Make use you check the version in the folder
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
};