module.exports = {
  extends: [
    "prettier/@typescript-eslint",
    "prettier/prettier",
    "plugin:promise/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 12,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "prefer-const": "error",
    semi: ["error", "always"],
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // prefer to be able to be implicit sometimes
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // allow `index.ts` files to aggregate exports
    "import/export": "off",
    // always prefer named exports
    "import/prefer-default-export": "off",
    // when you're running in parallel and waiting on Promise.all() this is problematic
    "promise/always-return": "off",
    // not helpful when destructuring an array
    "@typescript-eslint/no-unused-vars": "off",
    // note you must disable the base rule as it can report incorrect errors
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
  },
};
