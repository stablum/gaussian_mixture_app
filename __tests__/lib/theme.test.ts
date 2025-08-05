/**
 * @jest-environment jsdom
 */
import { isDarkMode, getThemeColor, themeColors } from '../../lib/theme';

// Mock document for testing
const mockClassListContains = jest.fn();
Object.defineProperty(document.documentElement, 'classList', {
  value: {
    contains: mockClassListContains,
  },
  writable: true,
});

describe('theme utilities', () => {
  describe('isDarkMode', () => {
    it('returns true when dark class is present', () => {
      mockClassListContains.mockReturnValue(true);
      expect(isDarkMode()).toBe(true);
    });

    it('returns false when dark class is not present', () => {
      mockClassListContains.mockReturnValue(false);
      expect(isDarkMode()).toBe(false);
    });

    it('returns false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(isDarkMode()).toBe(false);
      
      global.window = originalWindow;
    });
  });

  describe('getThemeColor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns dark color when in dark mode', () => {
      mockClassListContains.mockReturnValue(true);
      
      const result = getThemeColor('axis');
      expect(result).toBe(themeColors.axis.dark);
    });

    it('returns light color when not in dark mode', () => {
      mockClassListContains.mockReturnValue(false);
      
      const result = getThemeColor('axis');
      expect(result).toBe(themeColors.axis.light);
    });

    it('works with all theme color keys', () => {
      mockClassListContains.mockReturnValue(false);
      
      Object.keys(themeColors).forEach(key => {
        const colorKey = key as keyof typeof themeColors;
        const result = getThemeColor(colorKey);
        expect(result).toBe(themeColors[colorKey].light);
      });
    });
  });

  describe('themeColors', () => {
    it('has all expected color keys', () => {
      const expectedKeys = ['axis', 'text', 'legendBg', 'legendBorder', 'mixtureCurve'];
      expect(Object.keys(themeColors)).toEqual(expect.arrayContaining(expectedKeys));
    });

    it('has light and dark variants for each color', () => {
      Object.values(themeColors).forEach(colorObj => {
        expect(colorObj).toHaveProperty('light');
        expect(colorObj).toHaveProperty('dark');
        expect(typeof colorObj.light).toBe('string');
        expect(typeof colorObj.dark).toBe('string');
      });
    });
  });
});