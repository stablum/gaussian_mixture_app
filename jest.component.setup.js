// Setup for component tests (jsdom environment)

require('@testing-library/jest-dom');

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}));

// Mock localStorage for theme persistence
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver  
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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