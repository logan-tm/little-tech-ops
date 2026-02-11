import antfu from "@antfu/eslint-config";

export default antfu({
  stylistic: {
    semi: true,
  },
  typescript: true,
  react: true,
  rules: {
    "node/prefer-global/process": "off",
  },
});
