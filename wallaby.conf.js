module.exports = function () {
  return {
    files: ['src/**/*.js', 'test/**/*.json', 'package.json'],
    tests: ['test/**/*.spec.js'],
    testFramework: 'jasmine',
    env: {
      type: 'node',
      runner: 'node'
    }
  };
};
