import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/generated/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  // Base rules for all TS/TSX files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Enforce all env var access goes through packages/shared/src/env.ts
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct process.env access is forbidden. Import from '@rzf/shared/env' instead.",
        },
      ],
    },
  },
  // Next.js apps: allow process.env for NEXT_PUBLIC_* vars and enable Next.js rules
  {
    files: [
      'apps/rostermind/**/*.ts', 'apps/rostermind/**/*.tsx',
      'apps/directory/**/*.ts', 'apps/directory/**/*.tsx',
      'apps/admin/**/*.ts', 'apps/admin/**/*.tsx',
    ],
    plugins: { '@next/next': nextPlugin },
    rules: {
      'no-restricted-syntax': 'off',
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // External image URLs from user-generated content (YouTube thumbnails, source avatars)
      // cannot use next/image without allowlisting every possible CDN domain.
      '@next/next/no-img-element': 'warn',
    },
  },
]
