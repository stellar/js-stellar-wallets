// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  automock: false,

  setupFiles: ["<rootDir>/config/polyfills.js"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // The test environment that will be used for testing
  testEnvironment: "node",

  coveragePathIgnorePatterns: [
    "node_modules",
    "documentation",
    "playground",
    "build",
    "dist",
  ],

  modulePathIgnorePatterns: ["documentation", "playground", "build", "dist"],

  testPathIgnorePatterns: [
    "node_modules",
    "documentation",
    "playground",
    "build",
    "dist",
  ],
};
