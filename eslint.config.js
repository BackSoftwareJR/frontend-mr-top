import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'backend/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'useAuth',
            'useB2B',
            'useB2BOnboardingGate',
            'isContactFieldsComplete',
            'isContactSubmitReady',
            'OPERATIONS_FORM_CONFIG',
            'TRUST_QUESTIONS',
            'STATS',
            'statsContainerVariants',
            'statsItemVariants',
            'ACCENT_PALETTE',
          ],
        },
      ],
    },
  },
  {
    files: ['*.config.js', 'e2e/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
