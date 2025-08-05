/**
 * Distance calculations used across ML algorithms
 */

import { Matrix2x2, calculateInverse2x2 } from './matrix';

/**
 * Calculate Euclidean distance between two 1D points
 */
export function euclideanDistance1D(a: number, b: number): number {
  return Math.abs(a - b);
}

/**
 * Calculate squared Euclidean distance between two 1D points
 */
export function squaredEuclideanDistance1D(a: number, b: number): number {
  const diff = a - b;
  return diff * diff;
}

/**
 * Calculate Euclidean distance between two 2D points
 */
export function euclideanDistance2D(a: {x: number, y: number}, b: {x: number, y: number}): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared Euclidean distance between two 2D points
 */
export function squaredEuclideanDistance2D(a: {x: number, y: number}, b: {x: number, y: number}): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate Mahalanobis distance between a point and mean given covariance matrix
 */
export function mahalanobisDistance2D(
  point: {x: number, y: number}, 
  mean: {x: number, y: number}, 
  covarianceMatrix: Matrix2x2
): number {
  const dx = point.x - mean.x;
  const dy = point.y - mean.y;
  
  const inverse = calculateInverse2x2(covarianceMatrix);
  if (!inverse) {
    // Fallback to Euclidean distance if covariance matrix is singular
    return euclideanDistance2D(point, mean);
  }
  
  // Mahalanobis distance squared: (x-μ)ᵀ Σ⁻¹ (x-μ)
  const mahalanobisSquared = dx * dx * inverse.xx + 
                             2 * dx * dy * inverse.xy + 
                             dy * dy * inverse.yy;
  
  return Math.sqrt(Math.max(0, mahalanobisSquared));
}

/**
 * Calculate squared Mahalanobis distance (more efficient when you don't need the square root)
 */
export function squaredMahalanobisDistance2D(
  point: {x: number, y: number}, 
  mean: {x: number, y: number}, 
  covarianceMatrix: Matrix2x2
): number {
  const dx = point.x - mean.x;
  const dy = point.y - mean.y;
  
  const inverse = calculateInverse2x2(covarianceMatrix);
  if (!inverse) {
    // Fallback to squared Euclidean distance
    return squaredEuclideanDistance2D(point, mean);
  }
  
  return dx * dx * inverse.xx + 2 * dx * dy * inverse.xy + dy * dy * inverse.yy;
}

/**
 * Find the nearest point from a list of candidates
 */
export function findNearest1D(point: number, candidates: number[]): {index: number, distance: number} {
  if (candidates.length === 0) {
    return { index: -1, distance: Infinity };
  }
  
  let minDistance = Infinity;
  let nearestIndex = 0;
  
  candidates.forEach((candidate, index) => {
    const distance = euclideanDistance1D(point, candidate);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  
  return { index: nearestIndex, distance: minDistance };
}

/**
 * Find the nearest point from a list of 2D candidates
 */
export function findNearest2D(
  point: {x: number, y: number}, 
  candidates: Array<{x: number, y: number}>
): {index: number, distance: number} {
  if (candidates.length === 0) {
    return { index: -1, distance: Infinity };
  }
  
  let minDistance = Infinity;
  let nearestIndex = 0;
  
  candidates.forEach((candidate, index) => {
    const distance = euclideanDistance2D(point, candidate);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  
  return { index: nearestIndex, distance: minDistance };
}