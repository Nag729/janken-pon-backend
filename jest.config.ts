/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from "jest";

const config: Config = {
    // test environment
    preset: "ts-jest",
    testEnvironment: "node",

    // mock
    clearMocks: true,

    // coverage
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    coverageReporters: ["json", "text", "lcov", "clover"],

    // test match
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
};

export default config;
