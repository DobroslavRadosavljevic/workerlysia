import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core],
  ignorePatterns: [...(core.ignorePatterns ?? []), "worker-configuration.d.ts"],
  rules: {
    "func-style": [
      "error",
      "expression",
      {
        allowArrowFunctions: true,
      },
    ],
    "import/consistent-type-specifier-style": "off",
    "max-statements": "off",
  },
});
