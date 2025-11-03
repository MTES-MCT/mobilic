import js from '@eslint/js';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
        babelOptions: {
          presets: [
            ['@babel/preset-env', { targets: 'defaults' }],
            ['@babel/preset-react', { runtime: 'automatic' }],
          ],
          // Avoid babel-preset-react-app which requires NODE_ENV
          parserOpts: {
            plugins: ['jsx', 'flow', 'doExpressions', 'objectRestSpread']
          }
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.json'],
        },
      },
    },
    rules: {
      // Core ESLint rules
      'no-console': 'off',
      'no-param-reassign': 'error',
      'no-var': 'error',
      'no-unused-vars': ['warn', {
        'varsIgnorePattern': '^(React|_|theme|props?|e|err|error|config|val|day|ref|index|rowId|cellData|rowIndex|dense|maxHeight|id|km|handleSubmit|setView|px|py|textAlign|passwordError|other|fileRejections|base|width|openHistory|frColorTheme|req|forceNonBatchable|r|prevState|k|triggerRowAdd|color)$',
        'argsIgnorePattern': '^(_|theme|props?|e|err|error|config|val|day|ref|index|rowId|cellData|rowIndex|dense|maxHeight|id|km|handleSubmit|setView|px|py|textAlign|passwordError|other|fileRejections|base|width|openHistory|frColorTheme|req|forceNonBatchable|r|prevState|k|triggerRowAdd|color)',
        'ignoreRestSiblings': true,
        'destructuredArrayIgnorePattern': '^(_|k|r)'
      }],
      
      // New ES2022 rules - more lenient for now
      'no-unsafe-optional-chaining': 'warn',
      'no-constant-binary-expression': 'warn',

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.js', '.jsx', '.tsx'],
        },
      ],
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-comment-textnodes': 'error',

      // React Hooks rules - strict
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',

      // Import rules
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-mutable-exports': 'error',
      'import/first': 'error',

      // Custom rules
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*'],
        },
      ],
    },
  },
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'public/**',
      '*.min.js',
      'coverage/**',
      '.git/**',
    ],
  },
];