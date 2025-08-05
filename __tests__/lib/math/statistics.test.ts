import {
  calculateMean,
  calculateVariance,
  calculateStandardDeviation,
  calculateBasicStats,
  calculateMean2D,
  calculateBasicStats2D
} from '../../../lib/math/statistics';

describe('Statistics Utilities', () => {
  describe('calculateMean', () => {
    it('calculates mean of positive numbers', () => {
      expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('calculates mean of mixed numbers', () => {
      expect(calculateMean([-2, -1, 0, 1, 2])).toBe(0);
    });

    it('handles single value', () => {
      expect(calculateMean([42])).toBe(42);
    });

    it('handles empty array', () => {
      expect(calculateMean([])).toBe(0);
    });
  });

  describe('calculateVariance', () => {
    it('calculates variance correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const variance = calculateVariance(data);
      expect(variance).toBeCloseTo(2.5, 5); // sample variance
    });

    it('uses provided mean', () => {
      const data = [1, 2, 3, 4, 5];
      const mean = 3;
      const variance = calculateVariance(data, mean);
      expect(variance).toBeCloseTo(2.5, 5);
    });

    it('handles empty array', () => {
      expect(calculateVariance([])).toBe(0);
    });

    it('handles single value', () => {
      expect(calculateVariance([5])).toBe(0);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('calculates standard deviation correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const std = calculateStandardDeviation(data);
      expect(std).toBeCloseTo(Math.sqrt(2.5), 5);
    });
  });

  describe('calculateBasicStats', () => {
    it('calculates comprehensive stats', () => {
      const data = [1, 2, 3, 4, 5];
      const stats = calculateBasicStats(data);
      
      expect(stats.mean).toBe(3);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
      expect(stats.range).toBe(4);
      expect(stats.variance).toBeCloseTo(2.5, 5);
      expect(stats.standardDeviation).toBeCloseTo(Math.sqrt(2.5), 5);
    });

    it('handles empty array', () => {
      const stats = calculateBasicStats([]);
      expect(stats.mean).toBe(0);
      expect(stats.variance).toBe(0);
      expect(stats.standardDeviation).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.range).toBe(0);
    });
  });

  describe('calculateMean2D', () => {
    it('calculates 2D mean correctly', () => {
      const data = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ];
      const mean = calculateMean2D(data);
      expect(mean.x).toBe(3);
      expect(mean.y).toBe(4);
    });

    it('handles empty array', () => {
      const mean = calculateMean2D([]);
      expect(mean.x).toBe(0);
      expect(mean.y).toBe(0);
    });
  });

  describe('calculateBasicStats2D', () => {
    it('calculates comprehensive 2D stats', () => {
      const data = [
        { x: 1, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: 2 }
      ];
      const stats = calculateBasicStats2D(data);
      
      expect(stats.meanX).toBe(2);
      expect(stats.meanY).toBe(2);
      expect(stats.minX).toBe(1);
      expect(stats.maxX).toBe(3);
      expect(stats.minY).toBe(1);
      expect(stats.maxY).toBe(3);
      expect(stats.rangeX).toBe(2);
      expect(stats.rangeY).toBe(2);
      expect(stats.varianceX).toBe(1); // sample variance
      expect(stats.varianceY).toBe(1);
      expect(stats.covariance).toBe(0.5); // (1-2)*(1-2) + (2-2)*(3-2) + (3-2)*(2-2) / 2 = 1*1 + 0*1 + 1*0 / 2 = 0.5
    });

    it('handles empty array', () => {
      const stats = calculateBasicStats2D([]);
      expect(stats.meanX).toBe(0);
      expect(stats.meanY).toBe(0);
      expect(stats.varianceX).toBe(0);
      expect(stats.varianceY).toBe(0);
      expect(stats.covariance).toBe(0);
    });
  });
});