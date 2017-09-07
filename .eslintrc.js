module.exports = {
  'extends': 'airbnb-base',
  'rules': {
    'func-names': ['error', 'never'],
    // require 다음 공백행 강제를 끔
    'import/newline-after-import': ['off'],
  },
  "env": {
    "mocha": true,
  }
};