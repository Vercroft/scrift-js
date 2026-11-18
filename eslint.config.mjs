import path from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * ESLint flat config (ESLint 9+). TypeScript is linted with syntax-based
 * rules only - tests live outside `tsconfig.json` "include", so we do not
 * use `projectService` (that would require a second tsconfig or widening
 * the main graph). `npm run typecheck` remains the authority for types.
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '**/*.d.ts',
      '**/*.d.cts',
    ],
  },
  {
    // A disable comment that no longer suppresses anything fails the lint.
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
  {
    // The layer rules of docs/invariants.md.
    files: ['src/resources/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '!../http.js', '!../types.js'],
              message: 'A resource imports only http.ts and types.ts (docs/invariants.md).',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Only http.ts calls fetch (docs/invariants.md).' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TryStatement',
          message: 'A resource never catches: http.ts maps every error (docs/invariants.md).',
        },
        {
          selector: "CallExpression[callee.property.name='catch']",
          message: 'A resource never catches: http.ts maps every error (docs/invariants.md).',
        },
      ],
    },
  },
  {
    files: ['src/http.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '!./errors.js', '!./types.js', '!./version.js', '!./api-key.js'],
              message:
                'http.ts imports only errors.ts, types.ts, version.ts and api-key.ts (docs/invariants.md).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/errors.ts', 'src/types.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message: 'errors.ts and types.ts import nothing from the SDK (docs/invariants.md).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
);
