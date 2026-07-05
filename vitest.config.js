import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
    },
    tags: [
      {
        name: "ci",
        description:
          "Tests tagged with 'ci' will be run in the CI environment.",
      },
    ],
  },
});
