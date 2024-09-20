module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect', // Automatically detects the React version
    },
  },
  rules: {
    'react/no-unstable-nested-components': 'off', // Turn off the nested component warning
    '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}], // Adjust unused vars rule
    '@typescript-eslint/no-require-imports': 'off', // Disable the require rule for this file
  },
};
