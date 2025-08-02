import { COMPONENT_COLORS, getComponentColor } from '@/lib/colors';

describe('Color Utilities', () => {
  describe('COMPONENT_COLORS', () => {
    it('should have exactly 10 colors', () => {
      expect(COMPONENT_COLORS).toHaveLength(10);
    });

    it('should contain valid hex color codes', () => {
      COMPONENT_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should start with expected colors', () => {
      expect(COMPONENT_COLORS[0]).toBe('#1f77b4'); // blue
      expect(COMPONENT_COLORS[1]).toBe('#ff7f0e'); // orange
      expect(COMPONENT_COLORS[2]).toBe('#2ca02c'); // green
      expect(COMPONENT_COLORS[3]).toBe('#d62728'); // red
    });
  });

  describe('getComponentColor', () => {
    it('should return correct colors for valid indices', () => {
      expect(getComponentColor(0)).toBe('#1f77b4');
      expect(getComponentColor(1)).toBe('#ff7f0e');
      expect(getComponentColor(2)).toBe('#2ca02c');
      expect(getComponentColor(9)).toBe('#17becf');
    });

    it('should wrap around for indices beyond array length', () => {
      expect(getComponentColor(10)).toBe(COMPONENT_COLORS[0]);
      expect(getComponentColor(11)).toBe(COMPONENT_COLORS[1]);
      expect(getComponentColor(25)).toBe(COMPONENT_COLORS[5]);
    });

    it('should handle large indices correctly', () => {
      const largeIndex = 1337;
      const expectedIndex = largeIndex % COMPONENT_COLORS.length;
      expect(getComponentColor(largeIndex)).toBe(COMPONENT_COLORS[expectedIndex]);
    });

    it('should be consistent for same index', () => {
      const color1 = getComponentColor(5);
      const color2 = getComponentColor(5);
      expect(color1).toBe(color2);
    });
  });

  describe('Color Accessibility', () => {
    it('should provide sufficient color contrast', () => {
      // Test that we have distinct colors (no duplicates)
      const uniqueColors = new Set(COMPONENT_COLORS);
      expect(uniqueColors.size).toBe(COMPONENT_COLORS.length);
    });

    it('should return different colors for consecutive indices', () => {
      for (let i = 0; i < 9; i++) {
        expect(getComponentColor(i)).not.toBe(getComponentColor(i + 1));
      }
    });
  });
});