import js from "@eslint/js";
import honoBaseConfig from "@hono/eslint-config";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintImport from "eslint-plugin-import";
import functional from "eslint-plugin-functional";
import unicorn from "eslint-plugin-unicorn";
import nodePlugin from "eslint-plugin-n";

export default [
  {
    ignores: [
      "dist/**",
      "**/assets/**",
      "src-tauri/target/**",
      "**/*.test.{ts,tsx}",
    ],
  },
  // 1. Base JS Rules
  js.configs.recommended,

  // 2. Hono Rules
  ...honoBaseConfig,

  // 3. TypeScript Rules
  ...tseslint.configs.strict,

  // 4. Import Plugin Setup (Fixed for Flat Config)
  {
    // Define the plugin object explicitly
    plugins: {
      node: nodePlugin, // This tells ESLint that "node/..." rules belong to this plugin
      import: eslintImport,
      functional,
      unicorn, // File Name Convetion
    },
    // CRITICAL: Tell ESLint how to resolve "@/..." paths using your tsconfig
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json", // Ensure this points to your tsconfig
          bun: true,
        },
      },
    },
    // Add recommended import rules manually (safer than spreading the legacy config object)
    rules: {
      ...eslintImport.configs.recommended.rules,
      ...eslintImport.configs.typescript.rules,
    },
  },

  // 5. Language Options
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 6. Custom Rules
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // The "No Throw" Rule
      "functional/no-throw-statements": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "unicorn/filename-case": [
        "error",
        {
          case: "snakeCase",
          // Ignore specific files using regex
          ignore: [/^README\.md$/, /^Dockerfile$/],
        },
      ],
      "node/no-process-env": "error",
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "import/no-unresolved": ["error"],
      /* 2. ENCAPSULATION & IMPORT PATHS */
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              /* Deep imports (Encapsulation) */
              /* Blocks: import { logger } from "~/middlewares/logger" */
              group: [
                "~/modules/*/*",
                "~/middlewares/*",
                "~/constants/*",
                "~/services/*",
                "~/types/*",
                "~/utils/*",
              ],
              message:
                "Violating encapsulation! Please import from the public API (index.ts) instead. Example: import { logger } from '~/middlewares';",
            },
            {
              /* Relative imports to strict modules (Alias usage) */
              /* Blocks: import { logger } from "../middlewares" */
              group: [
                "**/middlewares",
                "**/modules/*",
                "**/constants",
                "**/services",
                "**/types",
                "**/utils",

                /* EXCLUSIONS: Allow aliases. */
                "!~/middlewares",
                "!~/modules/*",
                "!~/constants",
                "!~/services",
                "!~/types",
                "!~/utils",

                /* EXCLUSIONS: Allow 3rd party packages */
                "!hono/**",
              ],
              message:
                "Do not reach for shared layers via relative paths. Use aliases (e.g., '~/middlewares') instead.",
            },
          ],
        },
      ],
      /* 3. PREVENT CRASHES (Reliability Rule) */
      /* This detects if Module A imports B, and B imports A */
      "import/no-cycle": "error",
      /* 3. ENFORCE "TYPES" IMPORTS */
      /* Improves performance and safety for serverless/edge runtimes */
      "@typescript-eslint/consistent-type-imports": "error",
      // Formatting handled by Prettier
      ...prettier.rules,
    },
  },
];
