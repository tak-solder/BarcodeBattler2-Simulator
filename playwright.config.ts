import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:8787",
    launchOptions: {
      ...(process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run build && npm run db:local && npm run dev -- --port 8787",
    url: "http://localhost:8787/api/rooms",
    reuseExistingServer: !process.env.CI,
    timeout: 90000,
  },
});
