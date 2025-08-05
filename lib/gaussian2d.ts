// 2D Gaussian Distribution Implementation
// Mathematical formulation based on Bishop's "Pattern Recognition and Machine Learning"

import { calculateMean2D, calculateBasicStats2D } from './math';
import { calculateDeterminant2x2, calculateInverse2x2, isPositiveDefinite2x2, regularizeCovariance2x2 } from './math';
import { gaussianPDF2D, safeLog } from './math';
import { hasConvergedAbsolute, hasConverged2D } from './math';
import { initializeCovarianceMatrix2D } from './math';

export interface Point2D {
  x: number;
  y: number;
}

export interface Matrix2x2 {
  xx: number; // σ11
  xy: number; // σ12 = σ21
  yy: number; // σ22
}

export interface Gaussian2D {
  mu: Point2D;        // Mean vector [μx, μy]
  sigma: Matrix2x2;   // Covariance matrix [[σ11, σ12], [σ21, σ22]]
  logLikelihood: number;
}

export interface Gaussian2DHistoryStep {
  gaussian: Gaussian2D;
  iteration: number;
  logLikelihood: number;
}

export interface Gaussian2DState {
  gaussian: Gaussian2D;
  iteration: number;
  logLikelihood: number;
  converged: boolean;
  history: Gaussian2DHistoryStep[];
}

export class Gaussian2DAlgorithm {
  private data: Point2D[];
  private tolerance: number;
  private maxIterations: number;

  constructor(data: Point2D[], tolerance: number = 1e-6, maxIterations: number = 100) {
    this.data = [...data];
    this.tolerance = tolerance;
    this.maxIterations = maxIterations;
  }

  // Calculate sample mean
  calculateMean(): Point2D {
    return calculateMean2D(this.data);
  }

  // Calculate sample covariance matrix
  calculateCovariance(mu?: Point2D): Matrix2x2 {
    if (this.data.length === 0) {
      return { xx: 1, xy: 0, yy: 1 };
    }

    const mean = mu || this.calculateMean();
    const n = this.data.length;

    let sumXX = 0, sumXY = 0, sumYY = 0;

    for (const point of this.data) {
      const dx = point.x - mean.x;
      const dy = point.y - mean.y;
      
      sumXX += dx * dx;
      sumXY += dx * dy;
      sumYY += dy * dy;
    }

    // Use sample covariance (divide by n-1) if we have more than 1 point
    const divisor = n > 1 ? n - 1 : n;

    return {
      xx: sumXX / divisor,
      xy: sumXY / divisor,
      yy: sumYY / divisor
    };
  }

  // Calculate determinant of 2x2 covariance matrix
  calculateDeterminant(sigma: Matrix2x2): number {
    return calculateDeterminant2x2(sigma);
  }

  // Calculate inverse of 2x2 covariance matrix
  calculateInverse(sigma: Matrix2x2): Matrix2x2 | null {
    return calculateInverse2x2(sigma);
  }

  // Evaluate multivariate Gaussian PDF at a point
  evaluatePDF(point: Point2D, gaussian: Gaussian2D): number {
    return gaussianPDF2D(point, gaussian.mu, gaussian.sigma);
  }

  // Calculate log-likelihood of the data given the Gaussian parameters
  calculateLogLikelihood(gaussian: Gaussian2D): number {
    if (this.data.length === 0) {
      return 0;
    }

    let logLikelihood = 0;
    
    for (const point of this.data) {
      const pdf = this.evaluatePDF(point, gaussian);
      logLikelihood += safeLog(pdf);
    }

    return logLikelihood;
  }

  // Fit a 2D Gaussian to the data using maximum likelihood estimation
  fitGaussian(): Gaussian2D {
    const mu = this.calculateMean();
    const sigma = this.calculateCovariance(mu);
    
    // Ensure covariance matrix is positive definite
    let regularizedSigma = sigma;
    if (!isPositiveDefinite2x2(sigma)) {
      regularizedSigma = regularizeCovariance2x2(sigma);
    }

    const gaussian: Gaussian2D = {
      mu,
      sigma: regularizedSigma,
      logLikelihood: 0
    };

    // Calculate log-likelihood
    gaussian.logLikelihood = this.calculateLogLikelihood(gaussian);

    return gaussian;
  }

  // Initialize a Gaussian with reasonable default parameters
  initializeGaussian(): Gaussian2D {
    if (this.data.length === 0) {
      return {
        mu: { x: 0, y: 0 },
        sigma: { xx: 1, xy: 0, yy: 1 },
        logLikelihood: 0
      };
    }

    // Use simple initial estimates
    const mu = this.calculateMean();
    const sigma = initializeCovarianceMatrix2D(this.data);

    const gaussian: Gaussian2D = { mu, sigma, logLikelihood: 0 };
    gaussian.logLikelihood = this.calculateLogLikelihood(gaussian);

    return gaussian;
  }

  // Get data extent for visualization
  getDataExtent(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    if (this.data.length === 0) {
      return { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
    }

    const xValues = this.data.map(p => p.x);
    const yValues = this.data.map(p => p.y);

    return {
      xMin: Math.min(...xValues),
      xMax: Math.max(...xValues),
      yMin: Math.min(...yValues),
      yMax: Math.max(...yValues)
    };
  }

  // Generate contour points for visualization
  generateContourPoints(gaussian: Gaussian2D, level: number = 1): Point2D[] {
    const points: Point2D[] = [];
    const numPoints = 100;
    
    // Calculate eigenvalues and eigenvectors for ellipse orientation
    const sigma = gaussian.sigma;
    const trace = sigma.xx + sigma.yy;
    const det = this.calculateDeterminant(sigma);
    
    if (det <= 0) {
      return points; // Invalid covariance matrix
    }

    // Eigenvalues
    const discriminant = Math.sqrt((trace * trace) / 4 - det);
    const lambda1 = trace / 2 + discriminant;
    const lambda2 = trace / 2 - discriminant;
    
    if (lambda1 <= 0 || lambda2 <= 0) {
      return points; // Invalid eigenvalues
    }

    // Semi-axes lengths (scaled by confidence level)
    const a = Math.sqrt(lambda1 * level);
    const b = Math.sqrt(lambda2 * level);
    
    // Rotation angle
    let theta = 0;
    if (Math.abs(sigma.xy) > 1e-10) {
      theta = 0.5 * Math.atan2(2 * sigma.xy, sigma.xx - sigma.yy);
    }
    
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    // Generate ellipse points
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      // Point on unit circle scaled by semi-axes
      const xLocal = a * cosAngle;
      const yLocal = b * sinAngle;
      
      // Rotate and translate
      const x = gaussian.mu.x + xLocal * cosTheta - yLocal * sinTheta;
      const y = gaussian.mu.y + xLocal * sinTheta + yLocal * cosTheta;
      
      points.push({ x, y });
    }

    return points;
  }

  // Gradient descent methods for parameter fitting

  // Calculate gradients of log-likelihood with respect to parameters
  // log L = -n/2 * log(2π) - n/2 * log|Σ| - 1/2 * Σᵢ (xᵢ - μ)ᵀ Σ⁻¹ (xᵢ - μ)
  calculateGradients(gaussian: Gaussian2D): {
    muGrad: Point2D;
    sigmaGrad: Matrix2x2;
  } {
    const n = this.data.length;
    if (n === 0) {
      return {
        muGrad: { x: 0, y: 0 },
        sigmaGrad: { xx: 0, xy: 0, yy: 0 }
      };
    }

    const sigmaInverse = this.calculateInverse(gaussian.sigma);
    if (!sigmaInverse) {
      return {
        muGrad: { x: 0, y: 0 },
        sigmaGrad: { xx: 0, xy: 0, yy: 0 }
      };
    }

    // ∂log L/∂μ = Σᵢ Σ⁻¹(xᵢ - μ)
    let muGradX = 0, muGradY = 0;
    
    for (const point of this.data) {
      const dx = point.x - gaussian.mu.x;
      const dy = point.y - gaussian.mu.y;

      // Add contribution from each data point
      muGradX += sigmaInverse.xx * dx + sigmaInverse.xy * dy;
      muGradY += sigmaInverse.xy * dx + sigmaInverse.yy * dy;
    }

    // For covariance matrix gradients, we need:
    // ∂log L/∂Σ = -n/2 * Σ⁻¹ + 1/2 * Σᵢ Σ⁻¹(xᵢ - μ)(xᵢ - μ)ᵀΣ⁻¹
    
    // Start with the -n/2 * Σ⁻¹ term
    let sigmaGradXX = -0.5 * n * sigmaInverse.xx;
    // For off-diagonal element: need factor of 2 due to symmetry constraint
    let sigmaGradXY = -0.5 * n * sigmaInverse.xy * 2;
    let sigmaGradYY = -0.5 * n * sigmaInverse.yy;

    // Add the data-dependent term: 1/2 * Σᵢ Σ⁻¹(xᵢ - μ)(xᵢ - μ)ᵀΣ⁻¹
    for (const point of this.data) {
      const dx = point.x - gaussian.mu.x;
      const dy = point.y - gaussian.mu.y;

      // Compute Σ⁻¹(xᵢ - μ)
      const invSigmaDiffX = sigmaInverse.xx * dx + sigmaInverse.xy * dy;
      const invSigmaDiffY = sigmaInverse.xy * dx + sigmaInverse.yy * dy;

      // Compute Σ⁻¹(xᵢ - μ)(xᵢ - μ)ᵀΣ⁻¹
      sigmaGradXX += 0.5 * invSigmaDiffX * invSigmaDiffX;
      // For off-diagonal element: need factor of 2 due to symmetry constraint (∂f/∂σ₁₂ = 2*(∂f/∂Σ)₁₂)
      sigmaGradXY += invSigmaDiffX * invSigmaDiffY;
      sigmaGradYY += 0.5 * invSigmaDiffY * invSigmaDiffY;
    }

    return {
      muGrad: { x: muGradX, y: muGradY },
      sigmaGrad: { xx: sigmaGradXX, xy: sigmaGradXY, yy: sigmaGradYY }
    };
  }

  // Perform one gradient descent step
  gradientDescentStep(gaussian: Gaussian2D, learningRate: number = 0.01): Gaussian2D {
    const gradients = this.calculateGradients(gaussian);
    
    // Update mean - move in direction of positive log-likelihood gradient (gradient ascent)
    const newMu: Point2D = {
      x: gaussian.mu.x + learningRate * gradients.muGrad.x,
      y: gaussian.mu.y + learningRate * gradients.muGrad.y
    };

    // Update covariance matrix - move in direction of positive log-likelihood gradient
    let newSigma: Matrix2x2 = {
      xx: gaussian.sigma.xx + learningRate * gradients.sigmaGrad.xx,
      xy: gaussian.sigma.xy + learningRate * gradients.sigmaGrad.xy,
      yy: gaussian.sigma.yy + learningRate * gradients.sigmaGrad.yy
    };

    // Ensure covariance matrix remains positive definite
    const det = newSigma.xx * newSigma.yy - newSigma.xy * newSigma.xy;
    if (det <= 1e-6 || newSigma.xx <= 1e-6 || newSigma.yy <= 1e-6) {
      // Add regularization
      newSigma.xx = Math.max(newSigma.xx, 0.01);
      newSigma.yy = Math.max(newSigma.yy, 0.01);
      
      // Ensure positive definite
      const maxCorr = 0.99 * Math.sqrt(newSigma.xx * newSigma.yy);
      newSigma.xy = Math.max(-maxCorr, Math.min(maxCorr, newSigma.xy));
    }

    const newGaussian: Gaussian2D = {
      mu: newMu,
      sigma: newSigma,
      logLikelihood: 0
    };

    newGaussian.logLikelihood = this.calculateLogLikelihood(newGaussian);
    return newGaussian;
  }

  // Fit using gradient descent with history tracking
  fitWithGradientDescent(initialGaussian?: Gaussian2D, learningRate: number = 0.01): Gaussian2DState {
    let gaussian = initialGaussian || this.initializeGaussian();
    let iteration = 0;
    let prevLogLikelihood = gaussian.logLikelihood;
    
    const history: Gaussian2DHistoryStep[] = [{
      gaussian: JSON.parse(JSON.stringify(gaussian)),
      iteration: 0,
      logLikelihood: gaussian.logLikelihood
    }];

    while (iteration < this.maxIterations) {
      const newGaussian = this.gradientDescentStep(gaussian, learningRate);
      
      iteration++;
      const logLikelihoodChange = Math.abs(newGaussian.logLikelihood - prevLogLikelihood);
      
      history.push({
        gaussian: JSON.parse(JSON.stringify(newGaussian)),
        iteration,
        logLikelihood: newGaussian.logLikelihood
      });

      // Check for convergence
      if (hasConvergedAbsolute(newGaussian.logLikelihood, prevLogLikelihood, this.tolerance)) {
        return {
          gaussian: newGaussian,
          iteration,
          logLikelihood: newGaussian.logLikelihood,
          converged: true,
          history
        };
      }

      prevLogLikelihood = gaussian.logLikelihood;
      gaussian = newGaussian;
    }

    return {
      gaussian,
      iteration,
      logLikelihood: gaussian.logLikelihood,
      converged: false,
      history
    };
  }

  // Single gradient descent step for interactive stepping
  singleGradientDescentStep(gaussian: Gaussian2D, learningRate: number = 0.01): {
    gaussian: Gaussian2D;
    logLikelihood: number;
  } {
    const newGaussian = this.gradientDescentStep(gaussian, learningRate);
    return {
      gaussian: newGaussian,
      logLikelihood: newGaussian.logLikelihood
    };
  }
}