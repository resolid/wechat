import { defineConfig, type ViteUserConfig } from "vitest/config";

const config: ViteUserConfig = defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.e2e.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["src/**/*.e2e.test.ts"],
          setupFiles: "./vitest.setup.ts",
        },
      },
    ],
    dir: "./src",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      enabled: true,
    },
  },
});

export default config;
