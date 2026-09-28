import { defineConfig, type ViteUserConfig } from "vitest/config";

const config: ViteUserConfig = defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["**/*.test.ts"],
          exclude: ["**/*.e2e.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["**/*.e2e.test.ts"],
          setupFiles: "./vitest.setup.ts",
        },
      },
    ],
    dir: "./src",
    coverage: {
      enabled: true,
    },
  },
});

export default config;
