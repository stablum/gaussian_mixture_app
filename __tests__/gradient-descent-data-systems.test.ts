import { Gaussian2DAlgorithm, Gaussian2D, Point2D, Matrix2x2 } from '@/lib/gaussian2d';

// Helper function to generate 2D Gaussian data
function generateGaussianData(mu: Point2D, sigma: Matrix2x2, n: number, seed?: number): Point2D[] {
  // Simple Box-Muller transform for generating Gaussian random numbers
  let useLast = false;
  let y2: number;
  
  const randn = () => {
    let y1: number;
    if (useLast) {
      y1 = y2;
      useLast = false;
    } else {
      let x1, x2, w;
      do {
        x1 = 2.0 * Math.random() - 1.0;
        x2 = 2.0 * Math.random() - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);
      
      w = Math.sqrt((-2.0 * Math.log(w)) / w);
      y1 = x1 * w;
      y2 = x2 * w;
      useLast = true;
    }
    return y1;
  };

  const data: Point2D[] = [];
  
  // Cholesky decomposition for multivariate generation
  const L11 = Math.sqrt(sigma.xx);
  const L21 = sigma.xy / L11;
  const L22 = Math.sqrt(sigma.yy - L21 * L21);
  
  for (let i = 0; i < n; i++) {
    const z1 = randn();
    const z2 = randn();
    
    // Transform to desired distribution
    const x = mu.x + L11 * z1;
    const y = mu.y + L21 * z1 + L22 * z2;
    
    data.push({ x, y });
  }
  
  return data;
}

describe('Gradient Descent with Various Data Systems', () => {
  describe('Simple Well-Conditioned Data', () => {
    it('should improve log-likelihood with unit circle data', () => {
      // Generate data from standard bivariate normal
      const trueParams = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0, yy: 1 }
      };
      
      const data = generateGaussianData(trueParams.mu, trueParams.sigma, 50);
      const algorithm = new Gaussian2DAlgorithm(data, 1e-6, 50);
      
      // Start with deliberately wrong parameters
      const initialGaussian: Gaussian2D = {
        mu: { x: 2, y: 2 }, // Far from true mean
        sigma: { xx: 0.5, xy: 0, yy: 0.5 }, // Smaller variance
        logLikelihood: 0
      };
      initialGaussian.logLikelihood = algorithm.calculateLogLikelihood(initialGaussian);
      
      console.log('Initial log-likelihood:', initialGaussian.logLikelihood);
      
      // Test single step
      const result1 = algorithm.singleGradientDescentStep(initialGaussian, 0.01);
      console.log('After 1 step log-likelihood:', result1.logLikelihood);
      console.log('Change:', result1.logLikelihood - initialGaussian.logLikelihood);
      
      // Should improve (increase log-likelihood)
      expect(result1.logLikelihood).toBeGreaterThan(initialGaussian.logLikelihood);
      
      // Test multiple steps
      let current = initialGaussian;
      let improvements = 0;
      
      for (let i = 0; i < 10; i++) {
        const result = algorithm.singleGradientDescentStep(current, 0.01);
        const next = result.gaussian;
        console.log(`Step ${i + 1}: ${result.logLikelihood} (change: ${result.logLikelihood - current.logLikelihood})`);
        
        if (result.logLikelihood > current.logLikelihood) {
          improvements++;
        }
        current = next;
      }
      
      // Most steps should show improvement
      expect(improvements).toBeGreaterThan(5);
    });

    it('should improve log-likelihood with shifted data', () => {
      // Generate data from shifted Gaussian
      const trueParams = {
        mu: { x: 3, y: -1 },
        sigma: { xx: 0.8, xy: 0.2, yy: 1.2 }
      };
      
      const data = generateGaussianData(trueParams.mu, trueParams.sigma, 40);
      const algorithm = new Gaussian2DAlgorithm(data, 1e-6, 50);
      
      // Start with parameters close to true but not exact
      const initialGaussian: Gaussian2D = {
        mu: { x: 2.5, y: -0.5 },
        sigma: { xx: 1.0, xy: 0.0, yy: 1.0 },
        logLikelihood: 0
      };
      initialGaussian.logLikelihood = algorithm.calculateLogLikelihood(initialGaussian);
      
      const result1 = algorithm.singleGradientDescentStep(initialGaussian, 0.02);
      
      console.log('Shifted data test:');
      console.log('Initial LL:', initialGaussian.logLikelihood);
      console.log('After step LL:', result1.logLikelihood);
      console.log('Improvement:', result1.logLikelihood - initialGaussian.logLikelihood);
      
      expect(result1.logLikelihood).toBeGreaterThan(initialGaussian.logLikelihood);
    });
  });

  describe('Clustered Data Patterns', () => {
    it('should improve log-likelihood with tight cluster', () => {
      // Generate very tightly clustered data
      const tightCluster: Point2D[] = [
        { x: 1.0, y: 1.0 },
        { x: 1.1, y: 1.05 },
        { x: 0.95, y: 1.02 },
        { x: 1.05, y: 0.98 },
        { x: 0.98, y: 1.03 },
        { x: 1.02, y: 0.97 },
        { x: 1.01, y: 1.01 },
        { x: 0.99, y: 0.99 }
      ];
      
      const algorithm = new Gaussian2DAlgorithm(tightCluster, 1e-6, 50);
      
      const initialGaussian: Gaussian2D = {
        mu: { x: 0.5, y: 0.5 }, // Far from cluster
        sigma: { xx: 2.0, xy: 0.0, yy: 2.0 }, // Too spread out
        logLikelihood: 0
      };
      initialGaussian.logLikelihood = algorithm.calculateLogLikelihood(initialGaussian);
      
      const result1 = algorithm.singleGradientDescentStep(initialGaussian, 0.01);
      
      console.log('Tight cluster test:');
      console.log('Initial LL:', initialGaussian.logLikelihood);
      console.log('After step LL:', result1.logLikelihood);
      console.log('Mean moved from', initialGaussian.mu, 'to', result1.gaussian.mu);
      
      expect(result1.logLikelihood).toBeGreaterThan(initialGaussian.logLikelihood);
    });

    it('should improve log-likelihood with spread out data', () => {
      // Generate spread out data
      const spreadData: Point2D[] = [
        { x: -2, y: -2 },
        { x: 2, y: 2 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: 0, y: 0 },
        { x: -1.5, y: 1.5 },
        { x: 1.5, y: -1.5 },
        { x: 0.5, y: 0.5 }
      ];
      
      const algorithm = new Gaussian2DAlgorithm(spreadData, 1e-6, 50);
      
      const initialGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 0.1, xy: 0.0, yy: 0.1 }, // Too tight for spread data
        logLikelihood: 0
      };
      initialGaussian.logLikelihood = algorithm.calculateLogLikelihood(initialGaussian);
      
      const result1 = algorithm.singleGradientDescentStep(initialGaussian, 0.01);
      
      console.log('Spread data test:');
      console.log('Initial LL:', initialGaussian.logLikelihood);
      console.log('After step LL:', result1.logLikelihood);
      console.log('Sigma changed from', initialGaussian.sigma, 'to', result1.gaussian.sigma);
      
      expect(result1.logLikelihood).toBeGreaterThan(initialGaussian.logLikelihood);
    });
  });

  describe('Known Mathematical Cases', () => {
    it('should have correct gradient for simple 2-point case', () => {
      // Two points that form a clear pattern
      const simpleData: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ];
      
      const algorithm = new Gaussian2DAlgorithm(simpleData, 1e-6, 50);
      
      // Test point
      const testGaussian: Gaussian2D = {
        mu: { x: 0.3, y: 0.3 }, // Suboptimal mean
        sigma: { xx: 1.0, xy: 0.0, yy: 1.0 },
        logLikelihood: 0
      };
      testGaussian.logLikelihood = algorithm.calculateLogLikelihood(testGaussian);
      
      // Calculate gradients
      const gradients = algorithm.calculateGradients(testGaussian);
      
      console.log('Simple 2-point test:');
      console.log('Data:', simpleData);
      console.log('Current mean:', testGaussian.mu);
      console.log('Gradients:', gradients);
      console.log('Data centroid:', { 
        x: simpleData.reduce((s, p) => s + p.x, 0) / simpleData.length,
        y: simpleData.reduce((s, p) => s + p.y, 0) / simpleData.length
      });
      
      // Gradients should point toward data centroid (0.5, 0.5)
      // Since current mean (0.3, 0.3) is below centroid, gradient should be positive
      expect(gradients.muGrad.x).toBeGreaterThan(0);
      expect(gradients.muGrad.y).toBeGreaterThan(0);
      
      // Test the step
      const result = algorithm.singleGradientDescentStep(testGaussian, 0.1);
      console.log('After step mean:', result.gaussian.mu);
      console.log('LL change:', result.logLikelihood - testGaussian.logLikelihood);
      
      // Mean should move toward centroid
      expect(result.gaussian.mu.x).toBeGreaterThan(testGaussian.mu.x);
      expect(result.gaussian.mu.y).toBeGreaterThan(testGaussian.mu.y);
      expect(result.logLikelihood).toBeGreaterThan(testGaussian.logLikelihood);
    });

    it('should improve with optimal starting point nearby', () => {
      // Generate data from known distribution
      const trueParams = {
        mu: { x: 1, y: 2 },
        sigma: { xx: 0.5, xy: 0.1, yy: 0.8 }
      };
      
      const data = generateGaussianData(trueParams.mu, trueParams.sigma, 30);
      const algorithm = new Gaussian2DAlgorithm(data, 1e-6, 100);
      
      // Start very close to optimal
      const nearOptimal: Gaussian2D = {
        mu: { x: 1.05, y: 1.95 }, // Slightly off
        sigma: { xx: 0.52, xy: 0.08, yy: 0.85 }, // Slightly off
        logLikelihood: 0
      };
      nearOptimal.logLikelihood = algorithm.calculateLogLikelihood(nearOptimal);
      
      // Compare with true MLE solution
      const mleGaussian = algorithm.fitGaussian();
      
      console.log('Near optimal test:');
      console.log('True params:', trueParams);
      console.log('MLE solution:', { mu: mleGaussian.mu, sigma: mleGaussian.sigma });
      console.log('MLE log-likelihood:', mleGaussian.logLikelihood);
      console.log('Near optimal LL:', nearOptimal.logLikelihood);
      
      // Test gradient descent step
      const result = algorithm.singleGradientDescentStep(nearOptimal, 0.01);
      
      console.log('After GD step LL:', result.logLikelihood);
      console.log('GD improvement:', result.logLikelihood - nearOptimal.logLikelihood);
      
      // Should improve toward MLE solution
      expect(result.logLikelihood).toBeGreaterThan(nearOptimal.logLikelihood);
      expect(result.logLikelihood).toBeLessThanOrEqual(mleGaussian.logLikelihood + 0.1); // Allow small tolerance
    });
  });

  describe('Edge Cases and Numerical Stability', () => {
    it('should handle very small learning rates', () => {
      const data: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ];
      
      const algorithm = new Gaussian2DAlgorithm(data, 1e-8, 200);
      
      const initial: Gaussian2D = {
        mu: { x: 2, y: 2 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
      initial.logLikelihood = algorithm.calculateLogLikelihood(initial);
      
      // Very small learning rate
      const result = algorithm.singleGradientDescentStep(initial, 0.001);
      
      console.log('Small learning rate test:');
      console.log('LL change:', result.logLikelihood - initial.logLikelihood);
      
      // Should still improve, even if slowly
      expect(result.logLikelihood).toBeGreaterThanOrEqual(initial.logLikelihood);
    });

    it('should handle identity covariance properly', () => {
      const data: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: -1, y: -1 }
      ];
      
      const algorithm = new Gaussian2DAlgorithm(data, 1e-6, 50);
      
      const identityStart: Gaussian2D = {
        mu: { x: 0.1, y: 0.1 },
        sigma: { xx: 1, xy: 0, yy: 1 }, // Identity matrix
        logLikelihood: 0
      };
      identityStart.logLikelihood = algorithm.calculateLogLikelihood(identityStart);
      
      const result = algorithm.singleGradientDescentStep(identityStart, 0.02);
      
      console.log('Identity covariance test:');
      console.log('Initial LL:', identityStart.logLikelihood);
      console.log('After step LL:', result.logLikelihood);
      
      expect(result.logLikelihood).toBeGreaterThan(identityStart.logLikelihood);
    });
  });

  describe('Gradient Calculation Verification', () => {
    it('should produce numerically consistent gradients', () => {
      const data: Point2D[] = [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 1.5, y: 2.5 }
      ];
      
      const algorithm = new Gaussian2DAlgorithm(data, 1e-6, 50);
      
      const testPoint: Gaussian2D = {
        mu: { x: 1.2, y: 2.2 },
        sigma: { xx: 0.8, xy: 0.1, yy: 0.9 },
        logLikelihood: 0
      };
      testPoint.logLikelihood = algorithm.calculateLogLikelihood(testPoint);
      
      const gradients = algorithm.calculateGradients(testPoint);
      
      // Verify numerical gradient using finite differences
      const epsilon = 1e-6;
      
      // Test mu_x gradient
      const testPointPlusX = {
        ...testPoint,
        mu: { x: testPoint.mu.x + epsilon, y: testPoint.mu.y }
      };
      testPointPlusX.logLikelihood = algorithm.calculateLogLikelihood(testPointPlusX);
      
      const numericalGradMuX = (testPointPlusX.logLikelihood - testPoint.logLikelihood) / epsilon;
      
      console.log('Gradient verification:');
      console.log('Analytical mu_x gradient:', gradients.muGrad.x);
      console.log('Numerical mu_x gradient:', numericalGradMuX);
      console.log('Difference:', Math.abs(gradients.muGrad.x - numericalGradMuX));
      
      // Should be close (within numerical precision)
      expect(Math.abs(gradients.muGrad.x - numericalGradMuX)).toBeLessThan(1e-4);
    });
  });
});