import { GaussianMixtureModel } from '@/lib/gmm';
import { generateSampleData } from '@/lib/csvParser';

describe('Simplified Stability Tests', () => {
  describe('Core Stability Requirements', () => {
    it('should not crash with identical data points', () => {
      const identicalData = Array(50).fill(5.0);
      const gmm = new GaussianMixtureModel(identicalData, 2);
      
      expect(() => {
        const result = gmm.fit();
        expect(result.logLikelihood).toBeFinite();
        expect(result.components).toHaveLength(2);
        
        result.components.forEach(comp => {
          expect(comp.sigma).toBeGreaterThan(0);
          expect(comp.sigma).toBeFinite();
          expect(comp.mu).toBeFinite();
          expect(comp.pi).toBeFinite();
          expect(comp.pi).toBeGreaterThanOrEqual(0);
          expect(comp.pi).toBeLessThanOrEqual(1);
        });
      }).not.toThrow();
    });

    it('should handle single data point gracefully', () => {
      const singlePoint = [42];
      const gmm = new GaussianMixtureModel(singlePoint, 1);
      
      expect(() => {
        const result = gmm.fit();
        expect(result.logLikelihood).toBeFinite();
        expect(result.components).toHaveLength(1);
        expect(result.components[0].sigma).toBeGreaterThan(0);
        expect(result.components[0].mu).toBeFinite();
        expect(result.components[0].pi).toBeCloseTo(1, 0.01);
      }).not.toThrow();
    });

    it('should handle extreme data values without overflow', () => {
      const extremeData = [1e-10, 1e10, -1e10, 1e-5, 1e5];
      const gmm = new GaussianMixtureModel(extremeData, 2);
      
      expect(() => {
        const result = gmm.fit();
        expect(result.logLikelihood).toBeFinite();
        
        result.components.forEach(comp => {
          expect(comp.mu).toBeFinite();
          expect(comp.sigma).toBeFinite();
          expect(comp.sigma).toBeGreaterThan(0);
          expect(comp.pi).toBeFinite();
        });
      }).not.toThrow();
    });

    it('should maintain finite log-likelihood throughout iterations', () => {
      const data = generateSampleData(100);
      const gmm = new GaussianMixtureModel(data, 2);
      const result = gmm.fit();
      
      expect(result.history.length).toBeGreaterThan(0);
      
      // All history entries should have finite log-likelihood
      result.history.forEach(step => {
        expect(step.logLikelihood).toBeFinite();
      });
      
      // Log-likelihood should be non-decreasing (EM property)
      for (let i = 1; i < result.history.length; i++) {
        const prev = result.history[i - 1].logLikelihood;
        const curr = result.history[i].logLikelihood;
        expect(curr).toBeGreaterThanOrEqual(prev - 1e-6); // Allow small numerical errors
      }
    });

    it('should handle convergence detection correctly', () => {
      const data = generateSampleData(50);
      const gmm = new GaussianMixtureModel(data, 2, 1e-6, 200);
      const result = gmm.fit();
      
      expect(result.iteration).toBeGreaterThan(0);
      expect(result.iteration).toBeLessThanOrEqual(200);
      
      if (result.converged) {
        // If marked as converged, final change should be small
        if (result.history.length > 1) {
          const finalIdx = result.history.length - 1;
          const finalChange = Math.abs(
            result.history[finalIdx].logLikelihood - 
            result.history[finalIdx - 1].logLikelihood
          );
          expect(finalChange).toBeLessThanOrEqual(1e-6);
        }
      }
    });

    it('should handle different component counts without crashing', () => {
      const data = generateSampleData(100);
      
      for (let k = 1; k <= 5; k++) {
        expect(() => {
          const gmm = new GaussianMixtureModel(data, k);
          const result = gmm.fit();
          
          expect(result.components).toHaveLength(k);
          expect(result.logLikelihood).toBeFinite();
          
          // All components should be valid
          result.components.forEach(comp => {
            expect(comp.mu).toBeFinite();
            expect(comp.sigma).toBeGreaterThan(0);
            expect(comp.pi).toBeGreaterThanOrEqual(0);
            expect(comp.pi).toBeLessThanOrEqual(1);
          });
          
          // Weights should sum to 1
          const totalWeight = result.components.reduce((sum, comp) => sum + comp.pi, 0);
          expect(totalWeight).toBeCloseTo(1, 5);
        }).not.toThrow();
      }
    });

    it('should handle responsibilities calculation without NaN', () => {
      const data = [1, 2, 3, 4, 5];
      const gmm = new GaussianMixtureModel(data, 2);
      
      // Test with various component configurations
      const testComponents = [
        [{ mu: 2, sigma: 1, pi: 0.6 }, { mu: 4, sigma: 1, pi: 0.4 }],
        [{ mu: 0, sigma: 0.1, pi: 0.3 }, { mu: 10, sigma: 0.1, pi: 0.7 }],
        [{ mu: 2.5, sigma: 2, pi: 0.5 }, { mu: 2.5, sigma: 2, pi: 0.5 }]
      ];
      
      testComponents.forEach(components => {
        expect(() => {
          const responsibilities = gmm.calculateResponsibilities(components);
          
          expect(responsibilities).toHaveLength(data.length);
          responsibilities.forEach(resp => {
            expect(resp).toHaveLength(2);
            resp.forEach(r => {
              expect(r).toBeFinite();
              expect(r).toBeGreaterThanOrEqual(0);
              expect(r).toBeLessThanOrEqual(1);
            });
            
            const sum = resp.reduce((total, r) => total + r, 0);
            expect(sum).toBeCloseTo(1, 10);
          });
        }).not.toThrow();
      });
    });

    it('should handle PDF calculation edge cases', () => {
      const gmm = new GaussianMixtureModel([1, 2, 3], 1);
      
      const testCases = [
        { x: 0, mu: 0, sigma: 1 },
        { x: 1, mu: 1, sigma: 0.01 }, // Very small sigma
        { x: 1000, mu: 0, sigma: 1 }, // Far from mean
        { x: 1, mu: 1, sigma: 1000 }, // Very large sigma  
        { x: 1e-10, mu: 1e-10, sigma: 1e-10 } // Very small values
      ];
      
      testCases.forEach(({ x, mu, sigma }) => {
        expect(() => {
          const pdf = gmm.gaussianPDF(x, mu, sigma);
          expect(pdf).toBeFinite();
          expect(pdf).toBeGreaterThanOrEqual(0);
        }).not.toThrow();
      });
    });

    it('should handle M-step with degenerate responsibilities', () => {
      const data = [1, 2, 3];
      const gmm = new GaussianMixtureModel(data, 2);
      
      // Test various degenerate responsibility cases
      const degenerateResponsibilities = [
        [[1, 0], [1, 0], [1, 0]], // All weight to first component
        [[0, 1], [0, 1], [0, 1]], // All weight to second component
        [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], // Equal weights
        [[1e-10, 1-1e-10], [1-1e-10, 1e-10], [0.5, 0.5]] // Near-zero weights
      ];
      
      degenerateResponsibilities.forEach(resp => {
        expect(() => {
          const updatedComponents = gmm.maximizationStep(resp);
          
          expect(updatedComponents).toHaveLength(2);
          updatedComponents.forEach(comp => {
            expect(comp.mu).toBeFinite();
            expect(comp.sigma).toBeGreaterThan(0);
            expect(comp.pi).toBeGreaterThanOrEqual(0);
            expect(comp.pi).toBeLessThanOrEqual(1);
          });
          
          const totalWeight = updatedComponents.reduce((sum, comp) => sum + comp.pi, 0);
          expect(totalWeight).toBeCloseTo(1, 10);
        }).not.toThrow();
      });
    });

    it('should handle performance reasonably across data sizes', () => {
      const sizes = [10, 50, 100];
      const times: number[] = [];
      
      sizes.forEach(size => {
        const data = generateSampleData(size);
        const start = Date.now();
        
        const gmm = new GaussianMixtureModel(data, 2);
        const result = gmm.fit();
        
        const elapsed = Date.now() - start;
        times.push(elapsed);
        
        expect(result.logLikelihood).toBeFinite();
        expect(elapsed).toBeLessThan(30000); // Should complete within 30 seconds
      });
      
      // Performance should scale reasonably
      expect(times[2]).toBeGreaterThan(times[0]); // Larger should take longer
      expect(times[2]).toBeLessThan(times[0] * 1000); // But not 1000x longer
    });
  });
});