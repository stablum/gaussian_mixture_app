// Chart2D hover functionality tests (mathematical verification only)
import { Gaussian2DAlgorithm } from '@/lib/gaussian2d';

describe('Chart2D Hover Functionality', () => {
  const testData = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 0.5, y: 0.5 }
  ];

  const testGaussian = {
    mu: { x: 0.5, y: 0.5 },
    sigma: { xx: 1, xy: 0, yy: 1 },
    logLikelihood: -5.2
  };

  it('should calculate probability density correctly for hover points', () => {
    const algorithm = new Gaussian2DAlgorithm(testData);
    
    // Test density calculation at mean (should be highest)
    const densityAtMean = algorithm.evaluatePDF(testGaussian.mu, testGaussian);
    expect(densityAtMean).toBeGreaterThan(0);
    expect(Number.isFinite(densityAtMean)).toBe(true);
    
    // Test density calculation at a point away from mean (should be lower)
    const farPoint = { x: 3, y: 3 };
    const densityFar = algorithm.evaluatePDF(farPoint, testGaussian);
    expect(densityFar).toBeGreaterThan(0);
    expect(densityFar).toBeLessThan(densityAtMean);
    
    // Test density calculation at origin
    const originPoint = { x: 0, y: 0 };
    const densityOrigin = algorithm.evaluatePDF(originPoint, testGaussian);
    expect(densityOrigin).toBeGreaterThan(0);
    expect(Number.isFinite(densityOrigin)).toBe(true);
  });

  it('should handle hover point calculations with different Gaussian parameters', () => {
    const algorithm = new Gaussian2DAlgorithm(testData);
    
    // Test with tight Gaussian (high variance should give lower peak density)
    const tightGaussian = {
      mu: { x: 0, y: 0 },
      sigma: { xx: 0.1, xy: 0, yy: 0.1 },
      logLikelihood: 0
    };
    
    const tightDensity = algorithm.evaluatePDF({ x: 0, y: 0 }, tightGaussian);
    
    // Test with wide Gaussian
    const wideGaussian = {
      mu: { x: 0, y: 0 },
      sigma: { xx: 5, xy: 0, yy: 5 },
      logLikelihood: 0
    };
    
    const wideDensity = algorithm.evaluatePDF({ x: 0, y: 0 }, wideGaussian);
    
    // Tighter Gaussian should have higher density at the mean
    expect(tightDensity).toBeGreaterThan(wideDensity);
    expect(Number.isFinite(tightDensity)).toBe(true);
    expect(Number.isFinite(wideDensity)).toBe(true);
  });

  it('should handle hover calculations with correlation', () => {
    const algorithm = new Gaussian2DAlgorithm(testData);
    
    const correlatedGaussian = {
      mu: { x: 0, y: 0 },
      sigma: { xx: 1, xy: 0.5, yy: 1 }, // Positive correlation
      logLikelihood: 0
    };
    
    // Points along positive diagonal should have higher density than negative diagonal
    const posDiagPoint = { x: 1, y: 1 };
    const negDiagPoint = { x: 1, y: -1 };
    
    const posDensity = algorithm.evaluatePDF(posDiagPoint, correlatedGaussian);
    const negDensity = algorithm.evaluatePDF(negDiagPoint, correlatedGaussian);
    
    expect(posDensity).toBeGreaterThan(negDensity);
    expect(Number.isFinite(posDensity)).toBe(true);
    expect(Number.isFinite(negDensity)).toBe(true);
  });

  it('should return zero density for invalid covariance matrices', () => {
    const algorithm = new Gaussian2DAlgorithm(testData);
    
    const invalidGaussian = {
      mu: { x: 0, y: 0 },
      sigma: { xx: -1, xy: 0, yy: 1 }, // Negative variance (invalid)
      logLikelihood: 0
    };
    
    const density = algorithm.evaluatePDF({ x: 0, y: 0 }, invalidGaussian);
    expect(density).toBe(0);
  });

  it('should handle edge case hover points', () => {
    const algorithm = new Gaussian2DAlgorithm(testData);
    
    // Test with extreme values
    const extremePoints = [
      { x: 1000, y: 1000 },
      { x: -1000, y: -1000 },
      { x: 0, y: 1000 },
      { x: 1000, y: 0 }
    ];
    
    extremePoints.forEach(point => {
      const density = algorithm.evaluatePDF(point, testGaussian);
      expect(Number.isFinite(density)).toBe(true);
      expect(density).toBeGreaterThanOrEqual(0);
      // Should be very small for extreme points
      expect(density).toBeLessThan(0.001);
    });
  });
});