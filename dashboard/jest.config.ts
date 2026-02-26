// ============================================
// JEST CONFIG - Sets up Jest for Next.js + TypeScript
// ============================================
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // setupFilesAfterEnv runs code after Jest loads the test environment (jsdom)
  // This is where we load @testing-library/jest-dom for extra matchers like toBeInTheDocument()
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Exclude test utility helpers and Playwright e2e directory (Playwright has its own runner)
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/src/__tests__/testUtils.tsx", "/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(config);
