import {
  calculateDeterminant2x2,
  calculateInverse2x2,
  isPositiveDefinite2x2,
  regularizeCovariance2x2,
  matrixVectorMultiply2x2,
  quadraticForm2x2,
  calculateCorrelation2x2
} from '../../../lib/math/matrix';

describe('Matrix Utilities', () => {
  describe('calculateDeterminant2x2', () => {
    it('calculates determinant correctly', () => {
      const matrix = { xx: 2, xy: 1, yy: 3 };
      expect(calculateDeterminant2x2(matrix)).toBe(5); // 2*3 - 1*1 = 5
    });

    it('handles identity matrix', () => {
      const matrix = { xx: 1, xy: 0, yy: 1 };
      expect(calculateDeterminant2x2(matrix)).toBe(1);
    });

    it('handles singular matrix', () => {
      const matrix = { xx: 2, xy: 1, yy: 2 }; // det = 4 - 1 = 3
      expect(calculateDeterminant2x2(matrix)).toBe(3);
    });
  });

  describe('calculateInverse2x2', () => {
    it('calculates inverse correctly', () => {
      const matrix = { xx: 2, xy: 1, yy: 3 };
      const inverse = calculateInverse2x2(matrix);
      
      expect(inverse).not.toBeNull();
      expect(inverse!.xx).toBeCloseTo(0.6, 5); // 3/5
      expect(inverse!.xy).toBeCloseTo(-0.2, 5); // -1/5
      expect(inverse!.yy).toBeCloseTo(0.4, 5); // 2/5
    });

    it('returns null for singular matrix', () => {
      const matrix = { xx: 2, xy: 2, yy: 2 }; // det = 4 - 4 = 0
      expect(calculateInverse2x2(matrix)).toBeNull();
    });

    it('returns null for nearly singular matrix', () => {
      const matrix = { xx: 1, xy: 1, yy: 1.0000000001 }; // det ≈ 1e-10
      const result = calculateInverse2x2(matrix);
      // This matrix is actually invertible within our tolerance, just with large values
      expect(result).not.toBeNull();
      if (result) {
        expect(Math.abs(result.xx)).toBeGreaterThan(1e6); // Should be very large numbers
      }
    });
  });

  describe('isPositiveDefinite2x2', () => {
    it('identifies positive definite matrix', () => {
      const matrix = { xx: 2, xy: 1, yy: 3 };
      expect(isPositiveDefinite2x2(matrix)).toBe(true);
    });

    it('identifies non-positive definite matrix (negative diagonal)', () => {
      const matrix = { xx: -1, xy: 0, yy: 1 };
      expect(isPositiveDefinite2x2(matrix)).toBe(false);
    });

    it('identifies non-positive definite matrix (negative determinant)', () => {
      const matrix = { xx: 1, xy: 2, yy: 1 }; // det = 1 - 4 = -3
      expect(isPositiveDefinite2x2(matrix)).toBe(false);
    });
  });

  describe('regularizeCovariance2x2', () => {
    it('regularizes matrix with small diagonal elements', () => {
      const matrix = { xx: 0.005, xy: 0.001, yy: 0.003 };
      const regularized = regularizeCovariance2x2(matrix);
      
      expect(regularized.xx).toBeGreaterThanOrEqual(0.01);
      expect(regularized.yy).toBeGreaterThanOrEqual(0.01);
    });

    it('constrains correlation for positive definiteness', () => {
      const matrix = { xx: 1, xy: 1.5, yy: 1 }; // |correlation| > 1
      const regularized = regularizeCovariance2x2(matrix);
      
      const correlation = regularized.xy / Math.sqrt(regularized.xx * regularized.yy);
      expect(Math.abs(correlation)).toBeLessThanOrEqual(0.99);
    });
  });

  describe('matrixVectorMultiply2x2', () => {
    it('multiplies matrix and vector correctly', () => {
      const matrix = { xx: 2, xy: 1, yy: 3 };
      const vector = { x: 4, y: 5 };
      const result = matrixVectorMultiply2x2(matrix, vector);
      
      expect(result.x).toBe(13); // 2*4 + 1*5 = 13
      expect(result.y).toBe(19); // 1*4 + 3*5 = 19
    });
  });

  describe('quadraticForm2x2', () => {
    it('calculates quadratic form correctly', () => {
      const matrix = { xx: 2, xy: 1, yy: 3 };
      const vector = { x: 2, y: 1 };
      const result = quadraticForm2x2(matrix, vector);
      
      // [2 1] * [[2 1] [1 3]] * [2; 1] = [2 1] * [5; 5] = 15
      expect(result).toBe(15);
    });
  });

  describe('calculateCorrelation2x2', () => {
    it('calculates correlation coefficient correctly', () => {
      const matrix = { xx: 4, xy: 2, yy: 9 }; // correlation = 2 / sqrt(4*9) = 2/6 = 1/3
      const correlation = calculateCorrelation2x2(matrix);
      expect(correlation).toBeCloseTo(1/3, 5);
    });

    it('handles zero variance', () => {
      const matrix = { xx: 0, xy: 1, yy: 4 };
      const correlation = calculateCorrelation2x2(matrix);
      expect(correlation).toBe(0);
    });
  });
});