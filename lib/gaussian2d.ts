// 2D Gaussian Distribution Implementation
// Mathematical formulation based on Bishop's "Pattern Recognition and Machine Learning"

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
    if (this.data.length === 0) {
      return { x: 0, y: 0 };
    }

    const sumX = this.data.reduce((sum, point) => sum + point.x, 0);
    const sumY = this.data.reduce((sum, point) => sum + point.y, 0);

    return {
      x: sumX / this.data.length,
      y: sumY / this.data.length
    };
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
    return sigma.xx * sigma.yy - sigma.xy * sigma.xy;
  }

  // Calculate inverse of 2x2 covariance matrix
  calculateInverse(sigma: Matrix2x2): Matrix2x2 | null {
    const det = this.calculateDeterminant(sigma);
    
    if (Math.abs(det) < 1e-10) {
      // Matrix is singular or nearly singular
      return null;
    }

    return {
      xx: sigma.yy / det,
      xy: -sigma.xy / det,
      yy: sigma.xx / det
    };
  }

  // Evaluate multivariate Gaussian PDF at a point
  evaluatePDF(point: Point2D, gaussian: Gaussian2D): number {
    const dx = point.x - gaussian.mu.x;
    const dy = point.y - gaussian.mu.y;

    const sigmaInverse = this.calculateInverse(gaussian.sigma);
    if (!sigmaInverse) {
      return 0; // Singular covariance matrix
    }

    const det = this.calculateDeterminant(gaussian.sigma);
    if (det <= 0) {
      return 0; // Invalid covariance matrix
    }

    // Mahalanobis distance squared: (x-μ)ᵀ Σ⁻¹ (x-μ)
    const mahalanobis = dx * dx * sigmaInverse.xx + 
                       2 * dx * dy * sigmaInverse.xy + 
                       dy * dy * sigmaInverse.yy;

    // Multivariate Gaussian PDF: (2π)^(-k/2) |Σ|^(-1/2) exp(-1/2 * mahalanobis)
    const normalization = 1.0 / (2 * Math.PI * Math.sqrt(det));
    return normalization * Math.exp(-0.5 * mahalanobis);
  }

  // Calculate log-likelihood of the data given the Gaussian parameters
  calculateLogLikelihood(gaussian: Gaussian2D): number {
    if (this.data.length === 0) {
      return 0;
    }

    let logLikelihood = 0;
    
    for (const point of this.data) {
      const pdf = this.evaluatePDF(point, gaussian);
      if (pdf > 0) {
        logLikelihood += Math.log(pdf);
      } else {
        // Handle numerical issues
        logLikelihood += -1000; // Very low log probability
      }
    }

    return logLikelihood;
  }

  // Fit a 2D Gaussian to the data using maximum likelihood estimation
  fitGaussian(): Gaussian2D {
    const mu = this.calculateMean();
    const sigma = this.calculateCovariance(mu);
    
    // Ensure covariance matrix is positive definite by adding small regularization if needed
    const det = this.calculateDeterminant(sigma);
    if (det <= 1e-6) {
      sigma.xx += 0.01;
      sigma.yy += 0.01;
    }

    const gaussian: Gaussian2D = {
      mu,
      sigma,
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
    
    // Calculate data range for initial covariance
    const xValues = this.data.map(p => p.x);
    const yValues = this.data.map(p => p.y);
    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);
    
    const sigma: Matrix2x2 = {
      xx: Math.max(0.1, (xRange / 4) ** 2), // Initial variance
      xy: 0, // No initial correlation
      yy: Math.max(0.1, (yRange / 4) ** 2)
    };

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

  // Calculate gradients of negative log-likelihood with respect to parameters
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

    let muGradX = 0, muGradY = 0;
    let sigmaGradXX = 0, sigmaGradXY = 0, sigmaGradYY = 0;

    for (const point of this.data) {
      const dx = point.x - gaussian.mu.x;
      const dy = point.y - gaussian.mu.y;

      // Gradient w.r.t. mean (mu)
      muGradX += sigmaInverse.xx * dx + sigmaInverse.xy * dy;
      muGradY += sigmaInverse.xy * dx + sigmaInverse.yy * dy;

      // For covariance gradients, we need the outer product and sigma inverse
      const outerProd = {
        xx: dx * dx,
        xy: dx * dy,
        yy: dy * dy
      };

      // Gradient w.r.t. covariance matrix elements
      // d(-log L)/d(sigma_ij) = -0.5 * n * (sigma^-1)_ij + 0.5 * sum((x-mu)(x-mu)^T * sigma^-1)_ij * sigma^-1)
      sigmaGradXX += -0.5 * sigmaInverse.xx + 0.5 * (
        sigmaInverse.xx * outerProd.xx * sigmaInverse.xx +
        sigmaInverse.xy * outerProd.xy * sigmaInverse.xx +
        sigmaInverse.xx * outerProd.xy * sigmaInverse.xy +
        sigmaInverse.xy * outerProd.yy * sigmaInverse.xy
      );

      sigmaGradXY += -0.5 * sigmaInverse.xy + 0.5 * (
        sigmaInverse.xx * outerProd.xx * sigmaInverse.xy +
        sigmaInverse.xy * outerProd.xy * sigmaInverse.xy +
        sigmaInverse.xx * outerProd.xy * sigmaInverse.yy +
        sigmaInverse.xy * outerProd.yy * sigmaInverse.yy
      );

      sigmaGradYY += -0.5 * sigmaInverse.yy + 0.5 * (
        sigmaInverse.xy * outerProd.xx * sigmaInverse.xy +
        sigmaInverse.yy * outerProd.xy * sigmaInverse.xy +
        sigmaInverse.xy * outerProd.xy * sigmaInverse.yy +
        sigmaInverse.yy * outerProd.yy * sigmaInverse.yy
      );
    }

    return {
      muGrad: { x: muGradX, y: muGradY },
      sigmaGrad: { xx: sigmaGradXX, xy: sigmaGradXY, yy: sigmaGradYY }
    };
  }

  // Perform one gradient descent step
  gradientDescentStep(gaussian: Gaussian2D, learningRate: number = 0.01): Gaussian2D {
    const gradients = this.calculateGradients(gaussian);
    
    // Update mean
    const newMu: Point2D = {
      x: gaussian.mu.x - learningRate * gradients.muGrad.x,
      y: gaussian.mu.y - learningRate * gradients.muGrad.y
    };

    // Update covariance matrix
    let newSigma: Matrix2x2 = {
      xx: gaussian.sigma.xx - learningRate * gradients.sigmaGrad.xx,
      xy: gaussian.sigma.xy - learningRate * gradients.sigmaGrad.xy,
      yy: gaussian.sigma.yy - learningRate * gradients.sigmaGrad.yy
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
      if (logLikelihoodChange < this.tolerance) {
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