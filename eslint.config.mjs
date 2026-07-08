import nextConfig from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [...nextConfig, eslintConfigPrettier];

const tsConfig = eslintConfig.find((c) => c.name === "next/typescript");
if (tsConfig) {
  tsConfig.rules = {
    ...tsConfig.rules,
    "@typescript-eslint/no-explicit-any": "error",
  };
}

export default eslintConfig;
