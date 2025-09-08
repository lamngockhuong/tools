import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',

      // General JavaScript/TypeScript rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      // Code style rules
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'eol-last': 'error',
      'no-trailing-spaces': 'error',
      'max-len': ['error', { code: 100, ignoreUrls: true }],

      // Import/Export rules
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['**/*.test.{js,ts}', '**/__tests__/**/*.{js,ts}'],
    rules: {
      // Relax rules for test files
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-len': 'off',
    },
  },
  {
    files: ['**/*.config.{js,mjs,cjs,ts}', 'vite.config.*', 'jest.config.*'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Relax rules for config files
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
      '.github/',
    ],
  },
];
