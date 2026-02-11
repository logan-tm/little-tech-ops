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
    },
  },
  react({
    files: ["apps/frontend/**/*.{ts,tsx}"],
  }),
);
