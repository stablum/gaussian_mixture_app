// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import '@testing-library/jest-dom';

// Add custom matchers
expect.extend({
  toBeFinite(received) {
    const pass = Number.isFinite(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be finite`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be finite`,
        pass: false,
      };
    }
  },
});