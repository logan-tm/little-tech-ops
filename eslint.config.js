import antfu, { react } from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      semi: true,
      quotes: "double",
    },
    typescript: true,
    rules: {
      "node/prefer-global/process": "off",
    },
  },
  {
    rules: {
      "style/operator-linebreak": "off",
      "style/brace-style": "off",
      "unicorn/throw-new-error": "off",
      "jsonc/sort-keys": "off",
    },
  },
  react({
    files: ["apps/frontend/**/*.{ts,tsx}"],
  }),
);
