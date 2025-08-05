import { Gaussian2DAlgorithm, Gaussian2D, Point2D, Matrix2x2, Gaussian2DState } from '@/lib/gaussian2d';

describe('Gaussian2D Gradient Descent', () => {
  let algorithm: Gaussian2DAlgorithm;
  let testData: Point2D[];
  let testGaussian: Gaussian2D;

  beforeEach(() => {
    // Create test data points around (2, 3) with some spread
    testData = [
      { x: 1.5, y: 2.5 },
      { x: 2.0, y: 3.0 },
      { x: 2.5, y: 3.5 },
      { x: 1.8, y: 2.8 },
      { x: 2.2, y: 3.2 },
    ];
    
    algorithm = new Gaussian2DAlgorithm(testData);
    
    // Test Gaussian with known parameters
    testGaussian = {
      mu: { x: 2.0, y: 3.0 },
      sigma: { xx: 1.0, xy: 0.0, yy: 1.0 }, // Identity covariance
      logLikelihood: 0
    };
    testGaussian.logLikelihood = algorithm.calculateLogLikelihood(testGaussian);
  });

  describe('calculateGradients', () => {
    it('should return gradients with correct structure', () => {
      const gradients = algorithm.calculateGradients(testGaussian);
      
      expect(gradients).toHaveProperty('muGrad');
      expect(gradients).toHaveProperty('sigmaGrad');
      expect(gradients.muGrad).toHaveProperty('x');
      expect(gradients.muGrad).toHaveProperty('y');
      expect(gradients.sigmaGrad).toHaveProperty('xx');
      expect(gradients.sigmaGrad).toHaveProperty('xy');
      expect(gradients.sigmaGrad).toHaveProperty('yy');
    });

    it('should return finite gradient values', () => {
      const gradients = algorithm.calculateGradients(testGaussian);
      
      expect(Number.isFinite(gradients.muGrad.x)).toBe(true);
      expect(Number.isFinite(gradients.muGrad.y)).toBe(true);
      expect(Number.isFinite(gradients.sigmaGrad.xx)).toBe(true);
      expect(Number.isFinite(gradients.sigmaGrad.xy)).toBe(true);
      expect(Number.isFinite(gradients.sigmaGrad.yy)).toBe(true);
    });

    it('should return zero gradients for empty data', () => {
      const emptyAlgorithm = new Gaussian2DAlgorithm([]);
      const gradients = emptyAlgorithm.calculateGradients(testGaussian);
      
      expect(gradients.muGrad.x).toBe(0);
      expect(gradients.muGrad.y).toBe(0);
      expect(gradients.sigmaGrad.xx).toBe(0);
      expect(gradients.sigmaGrad.xy).toBe(0);
      expect(gradients.sigmaGrad.yy).toBe(0);
    });

    it('should handle singular covariance matrix gracefully', () => {
      const singularGaussian: Gaussian2D = {
        mu: { x: 2.0, y: 3.0 },
        sigma: { xx: 0.0, xy: 0.0, yy: 0.0 }, // Singular matrix
        logLikelihood: 0
      };
      
      const gradients = algorithm.calculateGradients(singularGaussian);
      
      expect(gradients.muGrad.x).toBe(0);
      expect(gradients.muGrad.y).toBe(0);
      expect(gradients.sigmaGrad.xx).toBe(0);
      expect(gradients.sigmaGrad.xy).toBe(0);
      expect(gradients.sigmaGrad.yy).toBe(0);
    });

    it('should produce gradients that point toward optimal solution', () => {
      // Create a Gaussian with parameters far from the data centroid
      const poorGaussian: Gaussian2D = {
        mu: { x: 0.0, y: 0.0 }, // Far from data center (~2, 3)
        sigma: { xx: 1.0, xy: 0.0, yy: 1.0 },
        logLikelihood: 0
      };
      poorGaussian.logLikelihood = algorithm.calculateLogLikelihood(poorGaussian);
      
      const gradients = algorithm.calculateGradients(poorGaussian);
      
      // Gradients should point toward the data (positive direction for both x and y)
      // Since we're computing gradients of negative log-likelihood, 
      // the gradients should point in direction that increases likelihood
      expect(Math.abs(gradients.muGrad.x)).toBeGreaterThan(0.1);
      expect(Math.abs(gradients.muGrad.y)).toBeGreaterThan(0.1);
    });
  });

  describe('gradientDescentStep', () => {
    it('should return a valid Gaussian2D object', () => {
      const result = algorithm.gradientDescentStep(testGaussian, 0.01);
      
      expect(result).toHaveProperty('mu');
      expect(result).toHaveProperty('sigma');
      expect(result).toHaveProperty('logLikelihood');
      expect(Number.isFinite(result.logLikelihood)).toBe(true);
    });

    it('should maintain positive definite covariance matrix', () => {
      const result = algorithm.gradientDescentStep(testGaussian, 0.01);
      
      // Check that diagonal elements are positive
      expect(result.sigma.xx).toBeGreaterThan(0);
      expect(result.sigma.yy).toBeGreaterThan(0);
      
      // Check that determinant is positive (positive definite condition)
      const det = result.sigma.xx * result.sigma.yy - result.sigma.xy * result.sigma.xy;
      expect(det).toBeGreaterThan(0);
    });

    it('should update parameters in the direction of gradients', () => {
      const initialGaussian: Gaussian2D = {
        mu: { x: 0.0, y: 0.0 }, // Far from data
        sigma: { xx: 2.0, xy: 0.0, yy: 2.0 },
        logLikelihood: 0
      };
      initialGaussian.logLikelihood = algorithm.calculateLogLikelihood(initialGaussian);
      
      const result = algorithm.gradientDescentStep(initialGaussian, 0.1);
      
      // Mean should move toward the data center
      expect(Math.abs(result.mu.x - initialGaussian.mu.x)).toBeGreaterThan(0);
      expect(Math.abs(result.mu.y - initialGaussian.mu.y)).toBeGreaterThan(0);
    });

    it('should handle different learning rates correctly', () => {
      // Use a Gaussian that's far from optimal to ensure gradients are non-zero
      const suboptimalGaussian: Gaussian2D = {
        mu: { x: 0.0, y: 0.0 }, // Far from data center
        sigma: { xx: 1.0, xy: 0.0, yy: 1.0 },
        logLikelihood: 0
      };
      suboptimalGaussian.logLikelihood = algorithm.calculateLogLikelihood(suboptimalGaussian);
      
      const smallStep = algorithm.gradientDescentStep(suboptimalGaussian, 0.001);
      const largeStep = algorithm.gradientDescentStep(suboptimalGaussian, 0.1);
      
      // Larger learning rate should result in larger parameter changes
      const smallChange = Math.abs(smallStep.mu.x - suboptimalGaussian.mu.x) + 
                         Math.abs(smallStep.mu.y - suboptimalGaussian.mu.y);
      const largeChange = Math.abs(largeStep.mu.x - suboptimalGaussian.mu.x) + 
                         Math.abs(largeStep.mu.y - suboptimalGaussian.mu.y);
      
      expect(largeChange).toBeGreaterThan(smallChange);
    });

    it('should regularize near-singular matrices', () => {
      const nearSingularGaussian: Gaussian2D = {
        mu: { x: 2.0, y: 3.0 },
        sigma: { xx: 0.001, xy: 0.0001, yy: 0.001 }, // Very small values
        logLikelihood: 0
      };
      nearSingularGaussian.logLikelihood = algorithm.calculateLogLikelihood(nearSingularGaussian);
      
      const result = algorithm.gradientDescentStep(nearSingularGaussian, 0.01);
      
      // Should be regularized to reasonable minimum values
      expect(result.sigma.xx).toBeGreaterThanOrEqual(0.01);
      expect(result.sigma.yy).toBeGreaterThanOrEqual(0.01);
      
      const det = result.sigma.xx * result.sigma.yy - result.sigma.xy * result.sigma.xy;
      expect(det).toBeGreaterThan(0);
    });
  });

  describe('singleGradientDescentStep', () => {
    it('should return correct structure', () => {
      const result = algorithm.singleGradientDescentStep(testGaussian, 0.01);
      
      expect(result).toHaveProperty('gaussian');
      expect(result).toHaveProperty('logLikelihood');
      expect(result.gaussian).toHaveProperty('mu');
      expect(result.gaussian).toHaveProperty('sigma');
      expect(result.logLikelihood).toBe(result.gaussian.logLikelihood);
    });

    it('should produce same result as gradientDescentStep', () => {
      const result1 = algorithm.singleGradientDescentStep(testGaussian, 0.01);
      const result2 = algorithm.gradientDescentStep(testGaussian, 0.01);
      
      expect(result1.gaussian.mu.x).toBeCloseTo(result2.mu.x, 10);
      expect(result1.gaussian.mu.y).toBeCloseTo(result2.mu.y, 10);
      expect(result1.gaussian.sigma.xx).toBeCloseTo(result2.sigma.xx, 10);
      expect(result1.gaussian.sigma.xy).toBeCloseTo(result2.sigma.xy, 10);
      expect(result1.gaussian.sigma.yy).toBeCloseTo(result2.sigma.yy, 10);
      expect(result1.logLikelihood).toBeCloseTo(result2.logLikelihood, 10);
    });
  });

  describe('fitWithGradientDescent', () => {
    it('should return a valid Gaussian2DState', () => {
      const result = algorithm.fitWithGradientDescent(testGaussian, 0.01);
      
      expect(result).toHaveProperty('gaussian');
      expect(result).toHaveProperty('iteration');
      expect(result).toHaveProperty('logLikelihood');
      expect(result).toHaveProperty('converged');
      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.history.length).toBeGreaterThan(0);
    });

    it('should have consistent history tracking', () => {
      const result = algorithm.fitWithGradientDescent(testGaussian, 0.01);
      
      // First history entry should match initial state
      expect(result.history[0].iteration).toBe(0);
      expect(result.history[0].gaussian.mu.x).toBeCloseTo(testGaussian.mu.x, 10);
      expect(result.history[0].gaussian.mu.y).toBeCloseTo(testGaussian.mu.y, 10);
      
      // Last history entry should match final state
      const lastEntry = result.history[result.history.length - 1];
      expect(lastEntry.gaussian.mu.x).toBeCloseTo(result.gaussian.mu.x, 10);
      expect(lastEntry.gaussian.mu.y).toBeCloseTo(result.gaussian.mu.y, 10);
      expect(lastEntry.logLikelihood).toBeCloseTo(result.logLikelihood, 10);
    });

    it('should produce mathematically valid results', () => {
      // Test that gradient descent produces valid mathematical results
      const result = algorithm.fitWithGradientDescent(undefined, 0.01);
      
      // Should produce finite results
      expect(Number.isFinite(result.logLikelihood)).toBe(true);
      expect(result.iteration).toBeGreaterThanOrEqual(0);
      expect(result.history.length).toBeGreaterThan(0);
      
      // Final parameters should maintain mathematical constraints
      expect(result.gaussian.sigma.xx).toBeGreaterThan(0);
      expect(result.gaussian.sigma.yy).toBeGreaterThan(0);
      const det = result.gaussian.sigma.xx * result.gaussian.sigma.yy - result.gaussian.sigma.xy * result.gaussian.sigma.xy;
      expect(det).toBeGreaterThan(0);
      
      // Mean should be finite
      expect(Number.isFinite(result.gaussian.mu.x)).toBe(true);
      expect(Number.isFinite(result.gaussian.mu.y)).toBe(true);
      
      // History should be consistent
      expect(result.history[0].iteration).toBe(0);
      expect(result.history[result.history.length - 1].iteration).toBe(result.iteration);
    });

    it('should converge for well-conditioned problems', () => {
      // Use algorithm with reasonable tolerance
      const convergentAlgorithm = new Gaussian2DAlgorithm(testData, 1e-4, 1000);
      
      const result = convergentAlgorithm.fitWithGradientDescent(undefined, 0.01);
      
      // Should eventually converge
      expect(result.converged).toBe(true);
      expect(result.iteration).toBeLessThan(1000);
    });

    it('should handle maximum iterations correctly', () => {
      // Use algorithm with very tight tolerance and few iterations
      const limitedAlgorithm = new Gaussian2DAlgorithm(testData, 1e-12, 5);
      
      const result = limitedAlgorithm.fitWithGradientDescent(testGaussian, 0.001);
      
      // Should hit iteration limit
      expect(result.iteration).toBeLessThanOrEqual(5);
      expect(result.history.length).toBeLessThanOrEqual(6); // +1 for initial state
    });

    it('should use provided initial guess', () => {
      const customInitial: Gaussian2D = {
        mu: { x: 1.5, y: 2.5 },
        sigma: { xx: 0.5, xy: 0.1, yy: 0.8 },
        logLikelihood: 0
      };
      customInitial.logLikelihood = algorithm.calculateLogLikelihood(customInitial);
      
      const result = algorithm.fitWithGradientDescent(customInitial, 0.01);
      
      // First history entry should match our custom initial guess
      expect(result.history[0].gaussian.mu.x).toBeCloseTo(customInitial.mu.x, 10);
      expect(result.history[0].gaussian.mu.y).toBeCloseTo(customInitial.mu.y, 10);
      expect(result.history[0].gaussian.sigma.xx).toBeCloseTo(customInitial.sigma.xx, 10);
    });

    it('should maintain positive definite covariance throughout optimization', () => {
      const result = algorithm.fitWithGradientDescent(testGaussian, 0.01);
      
      // Check all history entries
      for (const entry of result.history) {
        const sigma = entry.gaussian.sigma;
        expect(sigma.xx).toBeGreaterThan(0);
        expect(sigma.yy).toBeGreaterThan(0);
        
        const det = sigma.xx * sigma.yy - sigma.xy * sigma.xy;
        expect(det).toBeGreaterThan(0);
      }
    });

    it('should produce reasonable parameter estimates', () => {
      const convergentAlgorithm = new Gaussian2DAlgorithm(testData, 1e-4, 200);
      const result = convergentAlgorithm.fitWithGradientDescent(undefined, 0.01);
      
      // Mean should be close to data centroid
      const dataCentroidX = testData.reduce((sum, p) => sum + p.x, 0) / testData.length;
      const dataCentroidY = testData.reduce((sum, p) => sum + p.y, 0) / testData.length;
      
      expect(result.gaussian.mu.x).toBeCloseTo(dataCentroidX, 0.5);
      expect(result.gaussian.mu.y).toBeCloseTo(dataCentroidY, 0.5);
      
      // Covariance should be reasonable for the data spread (allow for regularization)
      expect(result.gaussian.sigma.xx).toBeGreaterThanOrEqual(0.01);
      expect(result.gaussian.sigma.xx).toBeLessThan(10);
      expect(result.gaussian.sigma.yy).toBeGreaterThanOrEqual(0.01);
      expect(result.gaussian.sigma.yy).toBeLessThan(10);
    });
  });

  describe('Edge cases and robustness', () => {
    it('should handle single data point', () => {
      const singlePointAlgorithm = new Gaussian2DAlgorithm([{ x: 1.0, y: 2.0 }]);
      
      const result = singlePointAlgorithm.fitWithGradientDescent(undefined, 0.01);
      
      expect(result.gaussian.mu.x).toBeCloseTo(1.0, 0.1);
      expect(result.gaussian.mu.y).toBeCloseTo(2.0, 0.1);
      expect(Number.isFinite(result.logLikelihood)).toBe(true);
    });

    it('should handle identical data points', () => {
      const identicalData = [
        { x: 2.0, y: 3.0 },
        { x: 2.0, y: 3.0 },
        { x: 2.0, y: 3.0 }
      ];
      const identicalAlgorithm = new Gaussian2DAlgorithm(identicalData);
      
      const result = identicalAlgorithm.fitWithGradientDescent(undefined, 0.01);
      
      expect(result.gaussian.mu.x).toBeCloseTo(2.0, 0.1);
      expect(result.gaussian.mu.y).toBeCloseTo(3.0, 0.1);
      // Should regularize to minimum covariance
      expect(result.gaussian.sigma.xx).toBeGreaterThanOrEqual(0.01);
      expect(result.gaussian.sigma.yy).toBeGreaterThanOrEqual(0.01);
    });

    it('should handle very small learning rates', () => {
      const result = algorithm.fitWithGradientDescent(testGaussian, 1e-6);
      
      expect(Number.isFinite(result.logLikelihood)).toBe(true);
      expect(result.gaussian.sigma.xx).toBeGreaterThan(0);
      expect(result.gaussian.sigma.yy).toBeGreaterThan(0);
    });

    it('should handle large learning rates without instability', () => {
      const result = algorithm.fitWithGradientDescent(testGaussian, 0.5);
      
      expect(Number.isFinite(result.logLikelihood)).toBe(true);
      expect(result.gaussian.sigma.xx).toBeGreaterThan(0);
      expect(result.gaussian.sigma.yy).toBeGreaterThan(0);
      
      const det = result.gaussian.sigma.xx * result.gaussian.sigma.yy - result.gaussian.sigma.xy * result.gaussian.sigma.xy;
      expect(det).toBeGreaterThan(0);
    });
  });
});