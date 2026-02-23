import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      semi: true,
      quotes: "double",
    },
    typescript: true,
    react: true,
    rules: {
      "antfu/if-newline": "off",
      "node/prefer-global/process": "off",
      "no-console": "off",
      "style/operator-linebreak": "off",
      "style/brace-style": "off",
      "unicorn/throw-new-error": "off",
      "jsonc/sort-keys": "off",
      "style/arrow-parens": "off",
      "style/indent": "off",
      "style/jsx-one-expression-per-line": "off",
      "style/multiline-ternary": "off",
      "style/jsx-wrap-multilines": "off",
      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          groups: [
            "side-effect",
            ["builtin", "external"],
            "internal",
            "parent",
            "sibling",
            "index",
            "unknown",
          ],
          newlinesBetween: 1,
        },
      ],
      "no-alert": "off", // turning this off since the demo makes use of it
    },
    ignores: ["dist", "node_modules", "**/*/routeTree.gen.ts"],
  },
  {
    files: ["apps/frontend/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off", // for later, not todo: find elegant way to solve this with TSRouter principles
    },
  },
);
