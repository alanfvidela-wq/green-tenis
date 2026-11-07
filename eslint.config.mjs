import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Lo que generan los tests E2E (el reporte trae el visor de trazas, minificado)
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),
]);

export default eslintConfig;
