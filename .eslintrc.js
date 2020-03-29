// Allow a 'use jessie' directive to enable Jessie linting.
const { jessieOverrides } = require('eslint-config-jessie/util');

const overrides = [...jessieOverrides(['**/*.js'], __dirname)];

module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    babelOptions: {
      configFile: `${__dirname}/babel-eslint.cjs`,
    },
  },
  overrides,
  extends: [
    'airbnb-base',
    // TODO: 'plugin:prettier/recommended',
    'plugin:eslint-comments/recommended',
  ],
  env: {
    es6: true, // supports new ES6 globals (e.g., new types such as Set)
  },
  globals: {
    HandledPromise: false,
    globalThis: false,
  },
  rules: {
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'arrow-parens': 'off',
    strict: 'off',
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-return-assign': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': ['off', 'ForOfStatement'],
    'no-unused-expressions': 'off',
    'no-loop-func': 'off',
    'import/prefer-default-export': 'off', // contrary to Agoric standard
    'import/extensions': 'off', // Needed for Web compatibility
  },
};
