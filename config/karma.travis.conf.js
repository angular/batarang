/*
 * karma.conf.js optionally loads this
 */

module.exports = function(options) {
  if (!isTravis()) {
    return;
  } else if (!options.sauceLabs) {
    throw new Error('This should be loaded after karma.sauce config');
  }
  options.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
  options.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
  options.sauceLabs.startConnect = false;

  options.singleRun = true;
};

function isTravis() {
  return !!process.env.TRAVIS;
}
