/**
 * Probability distribution functions and utilities
 */

import { Matrix2x2, calculateDeterminant2x2, calculateInverse2x2 } from './matrix';

/**
 * Gaussian (Normal) probability density function for 1D
 */
export function gaussianPDF1D(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  
  const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
  return coefficient * Math.exp(exponent);
}

/**
 * Log of Gaussian PDF for numerical stability
 */
export function logGaussianPDF1D(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return -Infinity;
  
  const logCoeff = -Math.log(sigma) - 0.5 * Math.log(2 * Math.PI);
  const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
  return logCoeff + exponent;
}

/**
 * Multivariate Gaussian PDF for 2D
 */
export function gaussianPDF2D(
  point: {x: number, y: number}, 
  mu: {x: number, y: number}, 
  sigma: Matrix2x2
): number {
  const dx = point.x - mu.x;
  const dy = point.y - mu.y;

  const sigmaInverse = calculateInverse2x2(sigma);
  if (!sigmaInverse) {
    return 0; // Singular covariance matrix
  }

  const det = calculateDeterminant2x2(sigma);
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

/**
 * Log of multivariate Gaussian PDF for numerical stability
 */
export function logGaussianPDF2D(
  point: {x: number, y: number}, 
  mu: {x: number, y: number}, 
  sigma: Matrix2x2
): number {
  const dx = point.x - mu.x;
  const dy = point.y - mu.y;

  const sigmaInverse = calculateInverse2x2(sigma);
  if (!sigmaInverse) {
    return -Infinity; // Singular covariance matrix
  }

  const det = calculateDeterminant2x2(sigma);
  if (det <= 0) {
    return -Infinity; // Invalid covariance matrix
  }

  // Mahalanobis distance squared
  const mahalanobis = dx * dx * sigmaInverse.xx + 
                     2 * dx * dy * sigmaInverse.xy + 
                     dy * dy * sigmaInverse.yy;

  // Log normalization constant
  const logNormalization = -Math.log(2 * Math.PI) - 0.5 * Math.log(det);
  
  return logNormalization - 0.5 * mahalanobis;
}

/**
 * Safe logarithm that handles edge cases
 */
export function safeLog(x: number, minValue: number = 1e-100): number {
  return Math.log(Math.max(x, minValue));
}

/**
 * Log-sum-exp trick for numerical stability
 * Computes log(exp(a) + exp(b)) in a numerically stable way
 */
export function logSumExp(a: number, b: number): number {
  const maxVal = Math.max(a, b);
  if (maxVal === -Infinity) {
    return -Infinity;
  }
  return maxVal + Math.log(Math.exp(a - maxVal) + Math.exp(b - maxVal));
}

/**
 * Log-sum-exp for arrays
 */
export function logSumExpArray(logValues: number[]): number {
  if (logValues.length === 0) return -Infinity;
  if (logValues.length === 1) return logValues[0];
  
  const maxVal = Math.max(...logValues);
  if (maxVal === -Infinity) {
    return -Infinity;
  }
  
  const sum = logValues.reduce((acc, val) => acc + Math.exp(val - maxVal), 0);
  return maxVal + Math.log(sum);
}

/**
 * Convert log probabilities to regular probabilities with normalization
 */
export function logProbsToProbs(logProbs: number[]): number[] {
  const logSum = logSumExpArray(logProbs);
  return logProbs.map(logProb => Math.exp(logProb - logSum));
}

/**
 * Normalize probabilities to sum to 1
 */
export function normalizeProbabilities(probs: number[]): number[] {
  const sum = probs.reduce((acc, p) => acc + p, 0);
  if (sum <= 0) {
    // Return uniform distribution if sum is zero or negative
    return new Array(probs.length).fill(1 / probs.length);
  }
  return probs.map(p => p / sum);
}

/**
 * Calculate mixture probability from components and weights
 */
export function mixtureProb1D(
  x: number, 
  components: Array<{mu: number, sigma: number, weight: number}>
): {total: number, componentProbs: number[], posteriors: number[]} {
  const componentProbs = components.map(comp => 
    comp.weight * gaussianPDF1D(x, comp.mu, comp.sigma)
  );
  
  const total = componentProbs.reduce((sum, p) => sum + p, 0);
  
  const posteriors = total > 0 
    ? componentProbs.map(p => p / total)
    : new Array(components.length).fill(1 / components.length);
  
  return { total, componentProbs, posteriors };
}