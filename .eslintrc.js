module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
  },
  extends: [
    'eslint:recommended',
  ],
  globals: {
    Vue: false,
    VueCarousel: false,
    d3: false,
    ls: false,
  },
  rules: {
    'no-console': 'off',
    'no-constant-binary-expression': 'off',
    'no-unused-vars': 'off',
    'no-useless-catch': 'off',
  },
};