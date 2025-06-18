const noConsoleLog = require('./no-console-log');

module.exports = {
  rules: {
    'no-console-log': noConsoleLog
  },
  configs: {
    recommended: {
      plugins: ['local'],
      rules: {
        'local/no-console-log': 'warn'
      }
    }
  }
};