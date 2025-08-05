import {
  gaussianPDF1D,
  logGaussianPDF1D,
  gaussianPDF2D,
  logGaussianPDF2D,
  safeLog,
  logSumExp,
  logSumExpArray,
  logProbsToProbs,
  normalizeProbabilities,
  mixtureProb1D
} from '../../../lib/math/probability';

describe('Probability Utilities', () => {
  describe('gaussianPDF1D', () => {
    it('calculates standard normal PDF correctly', () => {
      const pdf = gaussianPDF1D(0, 0, 1);
      expect(pdf).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 5);
    });

    it('handles different parameters', () => {
      const pdf = gaussianPDF1D(2, 1, 0.5);
      const expected = (1 / (0.5 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((2 - 1) / 0.5) ** 2);
      expect(pdf).toBeCloseTo(expected, 5);
    });

    it('returns 0 for invalid sigma', () => {
      expect(gaussianPDF1D(0, 0, 0)).toBe(0);
      expect(gaussianPDF1D(0, 0, -1)).toBe(0);
    });
  });

  describe('logGaussianPDF1D', () => {
    it('calculates log PDF correctly', () => {
      const logPdf = logGaussianPDF1D(0, 0, 1);
      const expected = -0.5 * Math.log(2 * Math.PI);
      expect(logPdf).toBeCloseTo(expected, 5);
    });

    it('returns -Infinity for invalid sigma', () => {
      expect(logGaussianPDF1D(0, 0, 0)).toBe(-Infinity);
      expect(logGaussianPDF1D(0, 0, -1)).toBe(-Infinity);
    });
  });

  describe('gaussianPDF2D', () => {
    it('calculates 2D PDF with identity covariance', () => {
      const point = { x: 0, y: 0 };
      const mu = { x: 0, y: 0 };
      const sigma = { xx: 1, xy: 0, yy: 1 };
      
      const pdf = gaussianPDF2D(point, mu, sigma);
      expect(pdf).toBeCloseTo(1 / (2 * Math.PI), 5);
    });

    it('returns 0 for singular covariance', () => {
      const point = { x: 0, y: 0 };
      const mu = { x: 0, y: 0 };
      const sigma = { xx: 0, xy: 0, yy: 0 };
      
      expect(gaussianPDF2D(point, mu, sigma)).toBe(0);
    });

    it('handles non-identity covariance', () => {
      const point = { x: 1, y: 0 };
      const mu = { x: 0, y: 0 };
      const sigma = { xx: 2, xy: 0, yy: 2 };
      
      const pdf = gaussianPDF2D(point, mu, sigma);
      const expected = (1 / (2 * Math.PI * 2)) * Math.exp(-0.25); // exp(-0.5 * 0.5)
      expect(pdf).toBeCloseTo(expected, 5);
    });
  });

  describe('safeLog', () => {
    it('handles positive values normally', () => {
      expect(safeLog(Math.E)).toBeCloseTo(1, 5);
      expect(safeLog(1)).toBe(0);
    });

    it('handles zero and negative values safely', () => {
      expect(safeLog(0)).toBe(Math.log(1e-100));
      expect(safeLog(-1)).toBe(Math.log(1e-100));
    });

    it('uses custom minimum value', () => {
      expect(safeLog(0, 1e-50)).toBe(Math.log(1e-50));
    });
  });

  describe('logSumExp', () => {
    it('computes log(exp(a) + exp(b)) correctly', () => {
      const result = logSumExp(1, 2);
      const expected = Math.log(Math.exp(1) + Math.exp(2));
      expect(result).toBeCloseTo(expected, 5);
    });

    it('handles -Infinity values', () => {
      expect(logSumExp(-Infinity, 1)).toBe(1);
      expect(logSumExp(1, -Infinity)).toBe(1);
      expect(logSumExp(-Infinity, -Infinity)).toBe(-Infinity);
    });

    it('is numerically stable for large values', () => {
      const result = logSumExp(1000, 1001);
      expect(result).toBeCloseTo(1001 + Math.log(1 + Math.exp(-1)), 5);
    });
  });

  describe('logSumExpArray', () => {
    it('handles empty array', () => {
      expect(logSumExpArray([])).toBe(-Infinity);
    });

    it('handles single value', () => {
      expect(logSumExpArray([5])).toBe(5);
    });

    it('computes correctly for multiple values', () => {
      const values = [1, 2, 3];
      const result = logSumExpArray(values);
      const expected = Math.log(Math.exp(1) + Math.exp(2) + Math.exp(3));
      expect(result).toBeCloseTo(expected, 5);
    });
  });

  describe('logProbsToProbs', () => {
    it('converts log probabilities to normalized probabilities', () => {
      const logProbs = [Math.log(0.1), Math.log(0.2), Math.log(0.3)];
      const probs = logProbsToProbs(logProbs);
      
      expect(probs).toHaveLength(3);
      expect(probs.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 5);
      expect(probs[0]).toBeCloseTo(0.1 / 0.6, 5);
      expect(probs[1]).toBeCloseTo(0.2 / 0.6, 5);
      expect(probs[2]).toBeCloseTo(0.3 / 0.6, 5);
    });
  });

  describe('normalizeProbabilities', () => {
    it('normalizes probabilities to sum to 1', () => {
      const probs = [1, 2, 3];
      const normalized = normalizeProbabilities(probs);
      
      expect(normalized.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 5);
      expect(normalized[0]).toBeCloseTo(1/6, 5);
      expect(normalized[1]).toBeCloseTo(2/6, 5);
      expect(normalized[2]).toBeCloseTo(3/6, 5);
    });

    it('handles zero sum by returning uniform distribution', () => {
      const probs = [0, 0, 0];
      const normalized = normalizeProbabilities(probs);
      
      expect(normalized).toEqual([1/3, 1/3, 1/3]);
    });

    it('handles negative sum by returning uniform distribution', () => {
      const probs = [-1, -2, -3];
      const normalized = normalizeProbabilities(probs);
      
      expect(normalized).toEqual([1/3, 1/3, 1/3]);
    });
  });

  describe('mixtureProb1D', () => {
    it('calculates mixture probabilities correctly', () => {
      const components = [
        { mu: 0, sigma: 1, weight: 0.5 },
        { mu: 2, sigma: 1, weight: 0.5 }
      ];
      
      const result = mixtureProb1D(1, components);
      
      expect(result.componentProbs).toHaveLength(2);
      expect(result.posteriors).toHaveLength(2);
      expect(result.posteriors.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 5);
      expect(result.total).toBeCloseTo(result.componentProbs.reduce((sum, p) => sum + p, 0), 5);
    });

    it('handles edge case with zero total probability', () => {
      const components = [
        { mu: 0, sigma: 0.001, weight: 0.5 },
        { mu: 0, sigma: 0.001, weight: 0.5 }
      ];
      
      const result = mixtureProb1D(1000, components); // very far from means
      
      // Should return uniform posteriors when total is essentially zero
      expect(result.posteriors[0]).toBeCloseTo(0.5, 1);
      expect(result.posteriors[1]).toBeCloseTo(0.5, 1);
    });
  });
});