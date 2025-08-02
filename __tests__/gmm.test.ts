import { GaussianMixtureModel, GaussianComponent } from '@/lib/gmm';

describe('GaussianMixtureModel', () => {
  let gmm: GaussianMixtureModel;
  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  beforeEach(() => {
    gmm = new GaussianMixtureModel(testData, 2);
  });

  describe('gaussianPDF', () => {
    it('should calculate correct PDF for standard normal distribution', () => {
      const pdf = gmm.gaussianPDF(0, 0, 1);
      // PDF of standard normal at x=0 should be 1/sqrt(2π) ≈ 0.3989
      expect(pdf).toBeCloseTo(0.3989, 3);
    });

    it('should calculate correct PDF for different parameters', () => {
      const pdf = gmm.gaussianPDF(2, 2, 1);
      // PDF at mean should be 1/(σ*sqrt(2π))
      expect(pdf).toBeCloseTo(0.3989, 3);
    });

    it('should handle very small sigma values without overflow', () => {
      const pdf = gmm.gaussianPDF(1, 1, 0.01);
      expect(pdf).toBeGreaterThan(0);
      expect(pdf).toBeFinite();
    });

    it('should return symmetric values around mean', () => {
      const mu = 5, sigma = 2;
      const pdf1 = gmm.gaussianPDF(mu - 1, mu, sigma);
      const pdf2 = gmm.gaussianPDF(mu + 1, mu, sigma);
      expect(pdf1).toBeCloseTo(pdf2, 10);
    });
  });

  describe('initializeComponents', () => {
    it('should initialize correct number of components', () => {
      const components = gmm.initializeComponents();
      expect(components).toHaveLength(2);
    });

    it('should initialize components with valid parameters', () => {
      const components = gmm.initializeComponents();
      
      components.forEach(comp => {
        expect(comp.mu).toBeGreaterThanOrEqual(Math.min(...testData));
        expect(comp.mu).toBeLessThanOrEqual(Math.max(...testData));
        expect(comp.sigma).toBeGreaterThan(0);
        expect(comp.pi).toBeGreaterThan(0);
        expect(comp.pi).toBeLessThanOrEqual(1);
      });
    });

    it('should have mixing coefficients that sum to 1', () => {
      const components = gmm.initializeComponents();
      const totalPi = components.reduce((sum, comp) => sum + comp.pi, 0);
      expect(totalPi).toBeCloseTo(1, 10);
    });
  });

  describe('calculateLogLikelihood', () => {
    it('should return negative value for valid components', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.5 },
        { mu: 7, sigma: 2, pi: 0.5 }
      ];
      const logLikelihood = gmm.calculateLogLikelihood(components);
      expect(logLikelihood).toBeLessThan(0);
      expect(logLikelihood).toBeFinite();
    });

    it('should increase with better fitting components', () => {
      const poorFit: GaussianComponent[] = [
        { mu: -10, sigma: 0.1, pi: 0.5 },
        { mu: 20, sigma: 0.1, pi: 0.5 }
      ];
      
      const goodFit: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.5 },
        { mu: 7, sigma: 2, pi: 0.5 }
      ];

      const poorLL = gmm.calculateLogLikelihood(poorFit);
      const goodLL = gmm.calculateLogLikelihood(goodFit);
      
      // Both should be negative, but good fit should be less negative (closer to 0)
      expect(poorLL).toBeLessThan(goodLL);
      expect(goodLL).toBeLessThan(0);
      expect(poorLL).toBeLessThan(0);
    });

    it('should handle edge cases gracefully', () => {
      const components: GaussianComponent[] = [
        { mu: 0, sigma: 0.001, pi: 1 }
      ];
      
      const singlePointGMM = new GaussianMixtureModel([5], 1);
      const logLikelihood = singlePointGMM.calculateLogLikelihood(components);
      expect(logLikelihood).toBeFinite();
    });
  });

  describe('calculateResponsibilities', () => {
    it('should return responsibilities that sum to 1 for each data point', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.3 },
        { mu: 7, sigma: 2, pi: 0.7 }
      ];
      
      const responsibilities = gmm.calculateResponsibilities(components);
      
      responsibilities.forEach(resp => {
        const sum = resp.reduce((total, r) => total + r, 0);
        expect(sum).toBeCloseTo(1, 10);
      });
    });

    it('should have correct dimensions', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.5 },
        { mu: 7, sigma: 2, pi: 0.5 }
      ];
      
      const responsibilities = gmm.calculateResponsibilities(components);
      expect(responsibilities).toHaveLength(testData.length);
      responsibilities.forEach(resp => {
        expect(resp).toHaveLength(components.length);
      });
    });

    it('should handle zero likelihood gracefully', () => {
      const components: GaussianComponent[] = [
        { mu: -1000, sigma: 0.001, pi: 0.5 },
        { mu: 1000, sigma: 0.001, pi: 0.5 }
      ];
      
      const responsibilities = gmm.calculateResponsibilities(components);
      
      responsibilities.forEach(resp => {
        const sum = resp.reduce((total, r) => total + r, 0);
        expect(sum).toBeCloseTo(1, 10);
        resp.forEach(r => {
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('maximizationStep', () => {
    it('should update component parameters correctly', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.5 },
        { mu: 7, sigma: 2, pi: 0.5 }
      ];
      
      const responsibilities = gmm.calculateResponsibilities(components);
      const newComponents = gmm.maximizationStep(responsibilities);
      
      expect(newComponents).toHaveLength(components.length);
      newComponents.forEach(comp => {
        expect(comp.mu).toBeFinite();
        expect(comp.sigma).toBeGreaterThan(0);
        expect(comp.pi).toBeGreaterThan(0);
        expect(comp.pi).toBeLessThanOrEqual(1);
      });
    });

    it('should maintain mixing coefficient sum of 1', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.3 },
        { mu: 7, sigma: 2, pi: 0.7 }
      ];
      
      const responsibilities = gmm.calculateResponsibilities(components);
      const newComponents = gmm.maximizationStep(responsibilities);
      
      const totalPi = newComponents.reduce((sum, comp) => sum + comp.pi, 0);
      expect(totalPi).toBeCloseTo(1, 10);
    });

    it('should enforce minimum sigma value', () => {
      // Create responsibilities that would lead to very small sigma
      const responsibilities = testData.map(() => [1, 0]);
      const newComponents = gmm.maximizationStep(responsibilities);
      
      newComponents.forEach(comp => {
        expect(comp.sigma).toBeGreaterThanOrEqual(0.01);
      });
    });
  });

  describe('singleEMStep', () => {
    it('should return components, responsibilities, and logLikelihood', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.5 },
        { mu: 7, sigma: 2, pi: 0.5 }
      ];
      
      const result = gmm.singleEMStep(components);
      
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('responsibilities');
      expect(result).toHaveProperty('logLikelihood');
      
      expect(result.components).toHaveLength(2);
      expect(result.responsibilities).toHaveLength(testData.length);
      expect(result.logLikelihood).toBeFinite();
    });

    it('should generally improve or maintain log-likelihood', () => {
      const components: GaussianComponent[] = [
        { mu: 1, sigma: 5, pi: 0.5 },
        { mu: 10, sigma: 5, pi: 0.5 }
      ];
      
      const initialLL = gmm.calculateLogLikelihood(components);
      const result = gmm.singleEMStep(components);
      
      // EM should not decrease likelihood (allowing for small numerical errors)
      expect(result.logLikelihood).toBeGreaterThanOrEqual(initialLL - 1e-10);
    });
  });

  describe('fit', () => {
    it('should return complete GMM state', () => {
      const result = gmm.fit();
      
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('iteration');
      expect(result).toHaveProperty('logLikelihood');
      expect(result).toHaveProperty('converged');
      expect(result).toHaveProperty('history');
      
      expect(result.data).toEqual(testData);
      expect(result.components).toHaveLength(2);
      expect(result.iteration).toBeGreaterThanOrEqual(0);
      expect(result.history).toHaveLength(result.iteration + 1);
    });

    it('should improve log-likelihood over iterations', () => {
      const result = gmm.fit();
      
      expect(result.history.length).toBeGreaterThan(1);
      
      // Check that log-likelihood generally improves
      for (let i = 1; i < result.history.length; i++) {
        const prev = result.history[i - 1].logLikelihood;
        const curr = result.history[i].logLikelihood;
        expect(curr).toBeGreaterThanOrEqual(prev - 1e-10);
      }
    });

    it('should converge within reasonable iterations', () => {
      const result = gmm.fit();
      expect(result.iteration).toBeLessThanOrEqual(100); // Allow hitting max iterations
    });

    it('should accept initial components', () => {
      const initialComponents: GaussianComponent[] = [
        { mu: 2, sigma: 1, pi: 0.4 },
        { mu: 8, sigma: 1, pi: 0.6 }
      ];
      
      const result = gmm.fit(initialComponents);
      expect(result.history[0].components).toEqual(initialComponents);
    });
  });

  describe('evaluateMixture', () => {
    it('should return correct structure', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.5 },
        { mu: 7, sigma: 2, pi: 0.5 }
      ];
      
      const result = gmm.evaluateMixture(5, components);
      
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('componentProbs');
      expect(result).toHaveProperty('posteriors');
      
      expect(result.componentProbs).toHaveLength(2);
      expect(result.posteriors).toHaveLength(2);
    });

    it('should have posteriors that sum to 1', () => {
      const components: GaussianComponent[] = [
        { mu: 3, sigma: 2, pi: 0.3 },
        { mu: 7, sigma: 2, pi: 0.7 }
      ];
      
      const result = gmm.evaluateMixture(5, components);
      const posteriorSum = result.posteriors.reduce((sum, p) => sum + p, 0);
      
      expect(posteriorSum).toBeCloseTo(1, 10);
    });

    it('should handle edge cases', () => {
      const components: GaussianComponent[] = [
        { mu: -1000, sigma: 0.001, pi: 0.5 },
        { mu: 1000, sigma: 0.001, pi: 0.5 }
      ];
      
      const result = gmm.evaluateMixture(0, components);
      
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.posteriors.every(p => p >= 0 && p <= 1)).toBe(true);
      
      const posteriorSum = result.posteriors.reduce((sum, p) => sum + p, 0);
      expect(posteriorSum).toBeCloseTo(1, 10);
    });
  });
});