module.exports = {
  "plugins": [
    "mocha",
    "requirejs",
    "chai-friendly"
  ],
  "env": {
    "mocha": true,
    "amd": true
  },
  "extends": "standard",
  'rules': {
    'semi': [2, 'always'],
    "no-unused-expressions": 0,

    "mocha/no-exclusive-tests": "error",

    // "requirejs/no-invalid-define": 2,
    "requirejs/no-multiple-define": 2,
    "requirejs/no-named-define": 2,
    "requirejs/no-commonjs-wrapper": 2,
    "requirejs/no-object-define": 1,

    "chai-friendly/no-unused-expressions": 2
  }
};