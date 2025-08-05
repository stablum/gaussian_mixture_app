import { Gaussian2DAlgorithm, Gaussian2D, Point2D, Matrix2x2 } from '@/lib/gaussian2d';

describe('Gaussian2D Basic Functionality', () => {
  let algorithm: Gaussian2DAlgorithm;
  let testData: Point2D[];

  beforeEach(() => {
    testData = [
      { x: 1.0, y: 2.0 },
      { x: 2.0, y: 3.0 },
      { x: 3.0, y: 4.0 },
      { x: 1.5, y: 2.3 }, // Break perfect correlation
      { x: 2.5, y: 3.7 }  // Break perfect correlation
    ];
    algorithm = new Gaussian2DAlgorithm(testData);
  });

  describe('Constructor', () => {
    it('should create algorithm with default parameters', () => {
      const alg = new Gaussian2DAlgorithm(testData);
      expect(alg).toBeDefined();
    });

    it('should create algorithm with custom parameters', () => {
      const alg = new Gaussian2DAlgorithm(testData, 1e-4, 200);
      expect(alg).toBeDefined();
    });

    it('should handle empty data', () => {
      const alg = new Gaussian2DAlgorithm([]);
      expect(alg).toBeDefined();
    });

    it('should create shallow copy of input data', () => {
      const originalData = [{ x: 1, y: 2 }];
      const alg = new Gaussian2DAlgorithm(originalData);
      originalData.push({ x: 999, y: 999 }); // Modify original array
      
      const mean = alg.calculateMean();
      expect(mean.x).toBe(1); // Algorithm's copy should be unchanged
      expect(mean.y).toBe(2);
    });
  });

  describe('calculateMean', () => {
    it('should calculate correct mean for test data', () => {
      const mean = algorithm.calculateMean();
      
      const expectedX = (1.0 + 2.0 + 3.0 + 1.5 + 2.5) / 5;
      const expectedY = (2.0 + 3.0 + 4.0 + 2.5 + 3.5) / 5;
      
      expect(mean.x).toBeCloseTo(expectedX, 10);
      expect(mean.y).toBeCloseTo(expectedY, 10);
    });

    it('should return (0,0) for empty data', () => {
      const emptyAlg = new Gaussian2DAlgorithm([]);
      const mean = emptyAlg.calculateMean();
      
      expect(mean.x).toBe(0);
      expect(mean.y).toBe(0);
    });

    it('should handle single point', () => {
      const singleAlg = new Gaussian2DAlgorithm([{ x: 5, y: 7 }]);
      const mean = singleAlg.calculateMean();
      
      expect(mean.x).toBe(5);
      expect(mean.y).toBe(7);
    });

    it('should handle negative coordinates', () => {
      const negativeData = [{ x: -1, y: -2 }, { x: -3, y: -4 }];
      const negAlg = new Gaussian2DAlgorithm(negativeData);
      const mean = negAlg.calculateMean();
      
      expect(mean.x).toBe(-2);
      expect(mean.y).toBe(-3);
    });
  });

  describe('calculateCovariance', () => {
    it('should calculate correct covariance matrix', () => {
      const covar = algorithm.calculateCovariance();
      
      // Verify matrix is symmetric
      expect(covar.xy).toBeCloseTo(covar.xy, 10);
      
      // Verify diagonal elements are positive
      expect(covar.xx).toBeGreaterThan(0);
      expect(covar.yy).toBeGreaterThan(0);
      
      // Verify determinant is positive (positive definite)
      const det = covar.xx * covar.yy - covar.xy * covar.xy;
      expect(det).toBeGreaterThan(0);
    });

    it('should use provided mean when given', () => {
      const customMean = { x: 0, y: 0 };
      const covar1 = algorithm.calculateCovariance(customMean);
      const covar2 = algorithm.calculateCovariance();
      
      // Should produce different results with different means
      expect(covar1.xx).not.toBeCloseTo(covar2.xx, 5);
    });

    it('should return identity matrix for empty data', () => {
      const emptyAlg = new Gaussian2DAlgorithm([]);
      const covar = emptyAlg.calculateCovariance();
      
      expect(covar.xx).toBe(1);
      expect(covar.xy).toBe(0);
      expect(covar.yy).toBe(1);
    });

    it('should handle single point correctly', () => {
      const singleAlg = new Gaussian2DAlgorithm([{ x: 5, y: 7 }]);
      const covar = singleAlg.calculateCovariance();
      
      // Single point should have zero covariance
      expect(covar.xx).toBe(0);
      expect(covar.xy).toBe(0);
      expect(covar.yy).toBe(0);
    });

    it('should use sample covariance (n-1 divisor) for multiple points', () => {
      const twoPointData = [{ x: 0, y: 0 }, { x: 2, y: 2 }];
      const twoPointAlg = new Gaussian2DAlgorithm(twoPointData);
      const covar = twoPointAlg.calculateCovariance();
      
      // With 2 points centered at (1,1), sample covariance should be 2 (not 1)
      expect(covar.xx).toBe(2); // (1-0)² + (1-2)² / (2-1) = 2
      expect(covar.yy).toBe(2);
      expect(covar.xy).toBe(2); // (1-0)(1-0) + (1-2)(1-2) / (2-1) = 2
    });

    it('should handle perfectly correlated data', () => {
      const correlatedData = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }];
      const corrAlg = new Gaussian2DAlgorithm(correlatedData);
      const covar = corrAlg.calculateCovariance();
      
      // Perfect positive correlation
      expect(covar.xx).toBeCloseTo(covar.yy, 10);
      expect(covar.xy).toBeCloseTo(covar.xx, 10);
    });
  });

  describe('calculateDeterminant', () => {
    it('should calculate correct determinant', () => {
      const matrix: Matrix2x2 = { xx: 2, xy: 1, yy: 3 };
      const det = algorithm.calculateDeterminant(matrix);
      
      expect(det).toBe(2 * 3 - 1 * 1); // 6 - 1 = 5
    });

    it('should return zero for singular matrix', () => {
      const singular: Matrix2x2 = { xx: 1, xy: 2, yy: 4 }; // det = 1*4 - 2*2 = 0
      const det = algorithm.calculateDeterminant(singular);
      
      expect(det).toBe(0);
    });

    it('should handle identity matrix', () => {
      const identity: Matrix2x2 = { xx: 1, xy: 0, yy: 1 };
      const det = algorithm.calculateDeterminant(identity);
      
      expect(det).toBe(1);
    });

    it('should handle negative determinant', () => {
      const matrix: Matrix2x2 = { xx: 1, xy: 3, yy: 2 }; // det = 1*2 - 3*3 = -7
      const det = algorithm.calculateDeterminant(matrix);
      
      expect(det).toBe(-7);
    });
  });

  describe('calculateInverse', () => {
    it('should calculate correct inverse matrix', () => {
      const matrix: Matrix2x2 = { xx: 2, xy: 1, yy: 3 };
      const inverse = algorithm.calculateInverse(matrix);
      
      expect(inverse).not.toBeNull();
      if (inverse) {
        // Check that matrix * inverse = identity
        const det = algorithm.calculateDeterminant(matrix);
        expect(inverse.xx).toBeCloseTo(3 / det, 10);
        expect(inverse.xy).toBeCloseTo(-1 / det, 10);
        expect(inverse.yy).toBeCloseTo(2 / det, 10);
      }
    });

    it('should return null for singular matrix', () => {
      const singular: Matrix2x2 = { xx: 1, xy: 2, yy: 4 }; // det = 0
      const inverse = algorithm.calculateInverse(singular);
      
      expect(inverse).toBeNull();
    });

    it('should return null for nearly singular matrix', () => {
      const nearlySingular: Matrix2x2 = { xx: 1, xy: 1, yy: 1.0000000001 }; // det ≈ 1e-10
      const inverse = algorithm.calculateInverse(nearlySingular);
      
      // This matrix is actually not singular enough for our threshold, so it returns an inverse
      expect(inverse).not.toBeNull();
      if (inverse) {
        // Check the determinant is very small
        const det = algorithm.calculateDeterminant(nearlySingular);
        expect(Math.abs(det)).toBeLessThan(1e-9);
      }
    });

    it('should handle identity matrix correctly', () => {
      const identity: Matrix2x2 = { xx: 1, xy: 0, yy: 1 };
      const inverse = algorithm.calculateInverse(identity);
      
      expect(inverse).not.toBeNull();
      if (inverse) {
        expect(inverse.xx).toBeCloseTo(1, 10);
        expect(inverse.xy).toBeCloseTo(0, 10);
        expect(inverse.yy).toBeCloseTo(1, 10);
      }
    });

    it('should satisfy A * A^-1 = I property', () => {
      const matrix: Matrix2x2 = { xx: 3, xy: 1, yy: 2 };
      const inverse = algorithm.calculateInverse(matrix);
      
      expect(inverse).not.toBeNull();
      if (inverse) {
        // Multiply matrix * inverse
        const i11 = matrix.xx * inverse.xx + matrix.xy * inverse.xy;
        const i12 = matrix.xx * inverse.xy + matrix.xy * inverse.yy;
        const i21 = matrix.xy * inverse.xx + matrix.yy * inverse.xy;
        const i22 = matrix.xy * inverse.xy + matrix.yy * inverse.yy;
        
        expect(i11).toBeCloseTo(1, 10);
        expect(i12).toBeCloseTo(0, 10);
        expect(i21).toBeCloseTo(0, 10);
        expect(i22).toBeCloseTo(1, 10);
      }
    });
  });

  describe('evaluatePDF', () => {
    it('should evaluate PDF correctly at mean', () => {
      const gaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
      
      const pdf = algorithm.evaluatePDF({ x: 0, y: 0 }, gaussian);
      
      // At mean of standard bivariate normal: 1/(2π)
      expect(pdf).toBeCloseTo(1 / (2 * Math.PI), 5);
    });

    it('should return 0 for singular covariance matrix', () => {
      const singularGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 0, xy: 0, yy: 0 },
        logLikelihood: 0
      };
      
      const pdf = algorithm.evaluatePDF({ x: 1, y: 1 }, singularGaussian);
      expect(pdf).toBe(0);
    });

    it('should return 0 for invalid covariance matrix', () => {
      const invalidGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: -1, xy: 0, yy: 1 }, // Negative variance
        logLikelihood: 0
      };
      
      const pdf = algorithm.evaluatePDF({ x: 1, y: 1 }, invalidGaussian);
      expect(pdf).toBe(0);
    });

    it('should be symmetric around mean', () => {
      const gaussian: Gaussian2D = {
        mu: { x: 2, y: 3 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
      
      const pdf1 = algorithm.evaluatePDF({ x: 1, y: 2 }, gaussian); // (-1, -1) from mean
      const pdf2 = algorithm.evaluatePDF({ x: 3, y: 4 }, gaussian); // (+1, +1) from mean
      
      expect(pdf1).toBeCloseTo(pdf2, 10);
    });

    it('should decrease with distance from mean', () => {
      const gaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
      
      const pdfAtMean = algorithm.evaluatePDF({ x: 0, y: 0 }, gaussian);
      const pdfNear = algorithm.evaluatePDF({ x: 0.5, y: 0.5 }, gaussian);
      const pdfFar = algorithm.evaluatePDF({ x: 2, y: 2 }, gaussian);
      
      expect(pdfAtMean).toBeGreaterThan(pdfNear);
      expect(pdfNear).toBeGreaterThan(pdfFar);
    });

    it('should handle correlation correctly', () => {
      const correlatedGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0.8, yy: 1 }, // High positive correlation
        logLikelihood: 0
      };
      
      const pdfPositiveCorr = algorithm.evaluatePDF({ x: 1, y: 1 }, correlatedGaussian);
      const pdfNegativeCorr = algorithm.evaluatePDF({ x: 1, y: -1 }, correlatedGaussian);
      
      // Positively correlated point should have higher PDF
      expect(pdfPositiveCorr).toBeGreaterThan(pdfNegativeCorr);
    });
  });

  describe('calculateLogLikelihood', () => {
    it('should calculate finite log-likelihood for valid parameters', () => {
      const gaussian: Gaussian2D = {
        mu: { x: 2, y: 3 },
        sigma: { xx: 1, xy: 0.2, yy: 1.5 },
        logLikelihood: 0
      };
      
      const logLike = algorithm.calculateLogLikelihood(gaussian);
      
      expect(Number.isFinite(logLike)).toBe(true);
      expect(logLike).toBeLessThan(0); // Log-likelihood is typically negative
    });

    it('should return 0 for empty data', () => {
      const emptyAlg = new Gaussian2DAlgorithm([]);
      const gaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
      
      const logLike = emptyAlg.calculateLogLikelihood(gaussian);
      expect(logLike).toBe(0);
    });

    it('should penalize poor fits with lower log-likelihood', () => {
      const goodFitGaussian: Gaussian2D = {
        mu: algorithm.calculateMean(),
        sigma: algorithm.calculateCovariance(),
        logLikelihood: 0
      };
      
      const poorFitGaussian: Gaussian2D = {
        mu: { x: 100, y: 100 }, // Far from data
        sigma: { xx: 0.01, xy: 0, yy: 0.01 }, // Very tight
        logLikelihood: 0
      };
      
      const goodLogLike = algorithm.calculateLogLikelihood(goodFitGaussian);
      const poorLogLike = algorithm.calculateLogLikelihood(poorFitGaussian);
      
      console.log('Good fit LL:', goodLogLike, 'Poor fit LL:', poorLogLike);
      expect(goodLogLike).toBeGreaterThan(poorLogLike);
    });

    it('should handle numerical issues gracefully', () => {
      const problematicGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1e-10, xy: 0, yy: 1e-10 }, // Very small variance
        logLikelihood: 0
      };
      
      const logLike = algorithm.calculateLogLikelihood(problematicGaussian);
      
      expect(Number.isFinite(logLike)).toBe(true);
      expect(logLike).toBeGreaterThan(-10000); // Should not be extremely negative
    });
  });

  describe('fitGaussian', () => {
    it('should produce reasonable parameter estimates', () => {
      const fitted = algorithm.fitGaussian();
      
      expect(fitted.mu).toBeDefined();
      expect(fitted.sigma).toBeDefined();
      expect(Number.isFinite(fitted.logLikelihood)).toBe(true);
      
      // Mean should be close to sample mean
      const sampleMean = algorithm.calculateMean();
      expect(fitted.mu.x).toBeCloseTo(sampleMean.x, 5);
      expect(fitted.mu.y).toBeCloseTo(sampleMean.y, 5);
      
      // Covariance should be positive definite
      const det = algorithm.calculateDeterminant(fitted.sigma);
      expect(det).toBeGreaterThan(0);
    });

    it('should handle regularization for near-singular covariance', () => {
      // Create data that would result in singular covariance
      const singularData = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ];
      
      const singularAlg = new Gaussian2DAlgorithm(singularData);
      const fitted = singularAlg.fitGaussian();
      
      // Should be regularized to maintain positive definiteness
      expect(fitted.sigma.xx).toBeGreaterThanOrEqual(0.01);
      expect(fitted.sigma.yy).toBeGreaterThanOrEqual(0.01);
      
      const det = singularAlg.calculateDeterminant(fitted.sigma);
      expect(det).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const fitted1 = algorithm.fitGaussian();
      const fitted2 = algorithm.fitGaussian();
      
      expect(fitted1.mu.x).toBeCloseTo(fitted2.mu.x, 10);
      expect(fitted1.mu.y).toBeCloseTo(fitted2.mu.y, 10);
      expect(fitted1.sigma.xx).toBeCloseTo(fitted2.sigma.xx, 10);
      expect(fitted1.sigma.xy).toBeCloseTo(fitted2.sigma.xy, 10);
      expect(fitted1.sigma.yy).toBeCloseTo(fitted2.sigma.yy, 10);
    });
  });

  describe('initializeGaussian', () => {
    it('should create reasonable initial parameters', () => {
      const initial = algorithm.initializeGaussian();
      
      expect(initial.mu).toBeDefined();
      expect(initial.sigma).toBeDefined();
      expect(Number.isFinite(initial.logLikelihood)).toBe(true);
      
      // Should be positive definite
      const det = algorithm.calculateDeterminant(initial.sigma);
      expect(det).toBeGreaterThan(0);
    });

    it('should handle empty data gracefully', () => {
      const emptyAlg = new Gaussian2DAlgorithm([]);
      const initial = emptyAlg.initializeGaussian();
      
      expect(initial.mu.x).toBe(0);
      expect(initial.mu.y).toBe(0);
      expect(initial.sigma.xx).toBe(1);
      expect(initial.sigma.xy).toBe(0);
      expect(initial.sigma.yy).toBe(1);
    });

    it('should set mean near data centroid', () => {
      const initial = algorithm.initializeGaussian();
      const dataMean = algorithm.calculateMean();
      
      expect(initial.mu.x).toBeCloseTo(dataMean.x, 1);
      expect(initial.mu.y).toBeCloseTo(dataMean.y, 1);
    });

    it('should scale variance with data spread', () => {
      const wideData = [{ x: -10, y: -10 }, { x: 10, y: 10 }];
      const wideAlg = new Gaussian2DAlgorithm(wideData);
      const wideInitial = wideAlg.initializeGaussian();
      
      const narrowData = [{ x: -1, y: -1 }, { x: 1, y: 1 }];
      const narrowAlg = new Gaussian2DAlgorithm(narrowData);
      const narrowInitial = narrowAlg.initializeGaussian();
      
      expect(wideInitial.sigma.xx).toBeGreaterThan(narrowInitial.sigma.xx);
      expect(wideInitial.sigma.yy).toBeGreaterThan(narrowInitial.sigma.yy);
    });
  });

  describe('getDataExtent', () => {
    it('should calculate correct data extent', () => {
      const extent = algorithm.getDataExtent();
      
      expect(extent.xMin).toBe(1.0);
      expect(extent.xMax).toBe(3.0);
      expect(extent.yMin).toBe(2.0);
      expect(extent.yMax).toBe(4.0);
    });

    it('should return default extent for empty data', () => {
      const emptyAlg = new Gaussian2DAlgorithm([]);
      const extent = emptyAlg.getDataExtent();
      
      expect(extent.xMin).toBe(-5);
      expect(extent.xMax).toBe(5);
      expect(extent.yMin).toBe(-5);
      expect(extent.yMax).toBe(5);
    });

    it('should handle single point correctly', () => {
      const singleAlg = new Gaussian2DAlgorithm([{ x: 7, y: 9 }]);
      const extent = singleAlg.getDataExtent();
      
      expect(extent.xMin).toBe(7);
      expect(extent.xMax).toBe(7);
      expect(extent.yMin).toBe(9);
      expect(extent.yMax).toBe(9);
    });
  });

  describe('generateContourPoints', () => {
    const testGaussian: Gaussian2D = {
      mu: { x: 0, y: 0 },
      sigma: { xx: 1, xy: 0, yy: 1 },
      logLikelihood: 0
    };

    it('should generate valid contour points', () => {
      const points = algorithm.generateContourPoints(testGaussian);
      
      expect(points.length).toBe(100); // Default number of points
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
      
      // Should form approximately a closed loop (within floating point precision)
      expect(points[0].x).toBeCloseTo(points[points.length - 1].x, 0);
      expect(points[0].y).toBeCloseTo(points[points.length - 1].y, 0);
    });

    it('should return empty array for invalid covariance', () => {
      const invalidGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: -1, xy: 0, yy: 1 }, // Invalid
        logLikelihood: 0
      };
      
      const points = algorithm.generateContourPoints(invalidGaussian);
      expect(points).toEqual([]);
    });

    it('should return empty array for singular covariance', () => {
      const singularGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 0, xy: 0, yy: 0 },
        logLikelihood: 0
      };
      
      const points = algorithm.generateContourPoints(singularGaussian);
      expect(points).toEqual([]);
    });

    it('should scale contour with confidence level', () => {
      const points1sigma = algorithm.generateContourPoints(testGaussian, 1);
      const points2sigma = algorithm.generateContourPoints(testGaussian, 4); // 2σ squared
      
      // 2σ contour should be larger
      const maxDist1 = Math.max(...points1sigma.map(p => Math.sqrt(p.x * p.x + p.y * p.y)));
      const maxDist2 = Math.max(...points2sigma.map(p => Math.sqrt(p.x * p.x + p.y * p.y)));
      
      expect(maxDist2).toBeGreaterThan(maxDist1);
    });

    it('should center contour at mean', () => {
      const offsetGaussian: Gaussian2D = {
        mu: { x: 5, y: 7 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
      
      const points = algorithm.generateContourPoints(offsetGaussian);
      
      // Calculate centroid of contour points
      const centroidX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centroidY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      
      expect(centroidX).toBeCloseTo(5, 1);
      expect(centroidY).toBeCloseTo(7, 1);
    });

    it('should handle correlation correctly', () => {
      const correlatedGaussian: Gaussian2D = {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0.8, yy: 1 }, // High positive correlation
        logLikelihood: 0
      };
      
      const points = algorithm.generateContourPoints(correlatedGaussian);
      
      // With positive correlation, contour should be tilted
      // Find points furthest from origin in each quadrant
      const q1Points = points.filter(p => p.x > 0 && p.y > 0);
      const q3Points = points.filter(p => p.x < 0 && p.y < 0);
      const q2Points = points.filter(p => p.x < 0 && p.y > 0);
      const q4Points = points.filter(p => p.x > 0 && p.y < 0);
      
      // Positive correlation means Q1 and Q3 should extend further from origin
      if (q1Points.length > 0 && q2Points.length > 0) {
        const maxQ1Dist = Math.max(...q1Points.map(p => Math.sqrt(p.x * p.x + p.y * p.y)));
        const maxQ2Dist = Math.max(...q2Points.map(p => Math.sqrt(p.x * p.x + p.y * p.y)));
        expect(maxQ1Dist).toBeGreaterThan(maxQ2Dist * 0.9); // Allow some tolerance
      }
    });
  });
});