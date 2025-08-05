import {
  euclideanDistance1D,
  squaredEuclideanDistance1D,
  euclideanDistance2D,
  squaredEuclideanDistance2D,
  mahalanobisDistance2D,
  squaredMahalanobisDistance2D,
  findNearest1D,
  findNearest2D
} from '../../../lib/math/distance';

describe('Distance Utilities', () => {
  describe('euclideanDistance1D', () => {
    it('calculates distance correctly', () => {
      expect(euclideanDistance1D(3, 7)).toBe(4);
      expect(euclideanDistance1D(-2, 1)).toBe(3);
      expect(euclideanDistance1D(5, 5)).toBe(0);
    });
  });

  describe('squaredEuclideanDistance1D', () => {
    it('calculates squared distance correctly', () => {
      expect(squaredEuclideanDistance1D(3, 7)).toBe(16);
      expect(squaredEuclideanDistance1D(-2, 1)).toBe(9);
      expect(squaredEuclideanDistance1D(5, 5)).toBe(0);
    });
  });

  describe('euclideanDistance2D', () => {
    it('calculates 2D distance correctly', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(euclideanDistance2D(a, b)).toBe(5); // 3-4-5 triangle
    });

    it('handles same points', () => {
      const a = { x: 2, y: 3 };
      const b = { x: 2, y: 3 };
      expect(euclideanDistance2D(a, b)).toBe(0);
    });
  });

  describe('squaredEuclideanDistance2D', () => {
    it('calculates squared 2D distance correctly', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(squaredEuclideanDistance2D(a, b)).toBe(25);
    });
  });

  describe('mahalanobisDistance2D', () => {
    it('calculates Mahalanobis distance with identity covariance', () => {
      const point = { x: 1, y: 1 };
      const mean = { x: 0, y: 0 };
      const covariance = { xx: 1, xy: 0, yy: 1 };
      
      const distance = mahalanobisDistance2D(point, mean, covariance);
      expect(distance).toBeCloseTo(Math.sqrt(2), 5);
    });

    it('handles singular covariance matrix', () => {
      const point = { x: 1, y: 1 };
      const mean = { x: 0, y: 0 };
      const covariance = { xx: 0, xy: 0, yy: 0 }; // singular
      
      const distance = mahalanobisDistance2D(point, mean, covariance);
      expect(distance).toBeCloseTo(Math.sqrt(2), 5); // falls back to Euclidean
    });

    it('calculates with non-identity covariance', () => {
      const point = { x: 2, y: 0 };
      const mean = { x: 0, y: 0 };
      const covariance = { xx: 4, xy: 0, yy: 1 }; // different variances
      
      const distance = mahalanobisDistance2D(point, mean, covariance);
      expect(distance).toBeCloseTo(1, 5); // sqrt((2^2)/4 + 0^2/1) = 1
    });
  });

  describe('squaredMahalanobisDistance2D', () => {
    it('calculates squared Mahalanobis distance', () => {
      const point = { x: 2, y: 0 };
      const mean = { x: 0, y: 0 };
      const covariance = { xx: 4, xy: 0, yy: 1 };
      
      const distance = squaredMahalanobisDistance2D(point, mean, covariance);
      expect(distance).toBeCloseTo(1, 5); // (2^2)/4 = 1
    });
  });

  describe('findNearest1D', () => {
    it('finds nearest point', () => {
      const candidates = [1, 5, 10, 15];
      const result = findNearest1D(7, candidates);
      
      expect(result.index).toBe(1); // index of 5
      expect(result.distance).toBe(2);
    });

    it('handles empty candidates', () => {
      const result = findNearest1D(5, []);
      expect(result.index).toBe(-1);
      expect(result.distance).toBe(Infinity);
    });

    it('finds exact match', () => {
      const candidates = [1, 5, 10];
      const result = findNearest1D(5, candidates);
      
      expect(result.index).toBe(1);
      expect(result.distance).toBe(0);
    });
  });

  describe('findNearest2D', () => {
    it('finds nearest 2D point', () => {
      const candidates = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 3, y: 4 }
      ];
      const result = findNearest2D({ x: 2, y: 2 }, candidates);
      
      expect(result.index).toBe(1); // (1,1) is closest to (2,2)
      expect(result.distance).toBeCloseTo(Math.sqrt(2), 5);
    });

    it('handles empty candidates', () => {
      const result = findNearest2D({ x: 0, y: 0 }, []);
      expect(result.index).toBe(-1);
      expect(result.distance).toBe(Infinity);
    });
  });
});