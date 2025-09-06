module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/eslint-recommended',
    '@typescript-eslint/recommended',
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // General rules
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    
    // Obsidian specific allowances
    'prefer-const': 'error',
    'no-var': 'error',
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'main.js',
    '*.d.ts',
  ],
};