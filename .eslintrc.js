module.exports = {
  'extends': 'airbnb-base',
  'rules': {
    'func-names': [
      'error',
      'never',
    ],
    // turn off newline after import(require)
    'import/newline-after-import': [
      'off',
    ],
    // Exception just for _id
    'no-underscore-dangle': [
      'error',
      {
        'allow': [
          '_id',
        ],
      },
    ],
    'function-paren-newline': ['error', 'consistent'],
  },
  'env': {
    'mocha': true,
  },
};