import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      'playwright-report/',
      'mochawesome-report/',
      'test-results/',
      'test-output/',
      'allure-report/',
      'allure-results/',
    ],
  },
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'require-await': 'error',
      'no-empty-pattern': 'off',
    },
  },
  {
    files: ['ui/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
