import { AlgorithmMode, ALGORITHM_LABELS, ALGORITHM_DESCRIPTIONS, PARAMETER_NAMES } from '@/lib/algorithmTypes';

describe('Algorithm Types', () => {
  describe('AlgorithmMode enum', () => {
    it('should have correct values', () => {
      expect(AlgorithmMode.GMM).toBe('gmm');
      expect(AlgorithmMode.KMEANS).toBe('kmeans');
    });

    it('should have all expected modes', () => {
      const modes = Object.values(AlgorithmMode);
      expect(modes).toHaveLength(2);
      expect(modes).toContain('gmm');
      expect(modes).toContain('kmeans');
    });
  });

  describe('ALGORITHM_LABELS', () => {
    it('should have labels for all modes', () => {
      expect(ALGORITHM_LABELS[AlgorithmMode.GMM]).toBe('Gaussian Mixture Model');
      expect(ALGORITHM_LABELS[AlgorithmMode.KMEANS]).toBe('K-Means Clustering');
    });

    it('should have labels for all enum values', () => {
      Object.values(AlgorithmMode).forEach(mode => {
        expect(ALGORITHM_LABELS[mode]).toBeDefined();
        expect(typeof ALGORITHM_LABELS[mode]).toBe('string');
        expect(ALGORITHM_LABELS[mode].length).toBeGreaterThan(0);
      });
    });
  });

  describe('ALGORITHM_DESCRIPTIONS', () => {
    it('should have descriptions for all modes', () => {
      expect(ALGORITHM_DESCRIPTIONS[AlgorithmMode.GMM]).toBe('Probabilistic model using Expectation-Maximization algorithm');
      expect(ALGORITHM_DESCRIPTIONS[AlgorithmMode.KMEANS]).toBe('Centroid-based clustering using iterative assignment and update');
    });

    it('should have descriptions for all enum values', () => {
      Object.values(AlgorithmMode).forEach(mode => {
        expect(ALGORITHM_DESCRIPTIONS[mode]).toBeDefined();
        expect(typeof ALGORITHM_DESCRIPTIONS[mode]).toBe('string');
        expect(ALGORITHM_DESCRIPTIONS[mode].length).toBeGreaterThan(0);
      });
    });
  });

  describe('PARAMETER_NAMES', () => {
    it('should have parameter names for GMM mode', () => {
      const gmmParams = PARAMETER_NAMES[AlgorithmMode.GMM];
      expect(gmmParams.element).toBe('Component');
      expect(gmmParams.primary).toBe('μ (Mean)');
      expect(gmmParams.secondary).toBe('σ (Std Dev)');
      expect(gmmParams.weight).toBe('π (Weight)');
    });

    it('should have parameter names for K-means mode', () => {
      const kmeansParams = PARAMETER_NAMES[AlgorithmMode.KMEANS];
      expect(kmeansParams.element).toBe('Cluster');
      expect(kmeansParams.primary).toBe('Centroid');
      expect(kmeansParams.secondary).toBe('Size');
      expect(kmeansParams.weight).toBe('Points');
    });

    it('should have parameter names for all enum values', () => {
      Object.values(AlgorithmMode).forEach(mode => {
        const params = PARAMETER_NAMES[mode];
        expect(params).toBeDefined();
        expect(params.element).toBeDefined();
        expect(params.primary).toBeDefined();
        expect(params.secondary).toBeDefined();
        expect(params.weight).toBeDefined();
        
        expect(typeof params.element).toBe('string');
        expect(typeof params.primary).toBe('string');
        expect(typeof params.secondary).toBe('string');
        expect(typeof params.weight).toBe('string');
      });
    });
  });

  describe('Type consistency', () => {
    it('should have consistent keys across all objects', () => {
      const modes = Object.values(AlgorithmMode);
      
      modes.forEach(mode => {
        expect(ALGORITHM_LABELS[mode]).toBeDefined();
        expect(ALGORITHM_DESCRIPTIONS[mode]).toBeDefined();
        expect(PARAMETER_NAMES[mode]).toBeDefined();
      });
    });

    it('should have no extra keys in mapping objects', () => {
      const modes = Object.values(AlgorithmMode);
      
      expect(Object.keys(ALGORITHM_LABELS).sort()).toEqual(modes.sort());
      expect(Object.keys(ALGORITHM_DESCRIPTIONS).sort()).toEqual(modes.sort());
      expect(Object.keys(PARAMETER_NAMES).sort()).toEqual(modes.sort());
    });
  });
});