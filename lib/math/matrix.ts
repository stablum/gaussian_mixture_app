/**
 * Matrix operations for 2x2 matrices used in 2D Gaussian calculations
 */

export interface Matrix2x2 {
  xx: number; // σ11 or [0,0]
  xy: number; // σ12 = σ21 or [0,1] = [1,0]
  yy: number; // σ22 or [1,1]
}

/**
 * Calculate determinant of a 2x2 matrix
 */
export function calculateDeterminant2x2(matrix: Matrix2x2): number {
  return matrix.xx * matrix.yy - matrix.xy * matrix.xy;
}

/**
 * Calculate inverse of a 2x2 matrix
 * Returns null if matrix is singular or nearly singular
 */
export function calculateInverse2x2(matrix: Matrix2x2): Matrix2x2 | null {
  const det = calculateDeterminant2x2(matrix);
  
  if (Math.abs(det) < 1e-10) {
    // Matrix is singular or nearly singular
    return null;
  }

  return {
    xx: matrix.yy / det,
    xy: -matrix.xy / det,
    yy: matrix.xx / det
  };
}

/**
 * Check if a 2x2 matrix is positive definite
 */
export function isPositiveDefinite2x2(matrix: Matrix2x2): boolean {
  // For 2x2 matrix to be positive definite:
  // 1. Diagonal elements must be positive
  // 2. Determinant must be positive
  return matrix.xx > 0 && matrix.yy > 0 && calculateDeterminant2x2(matrix) > 0;
}

/**
 * Regularize a 2x2 covariance matrix to ensure it's positive definite
 */
export function regularizeCovariance2x2(matrix: Matrix2x2, minDiagonal: number = 0.01): Matrix2x2 {
  let regularized = { ...matrix };
  
  // Ensure diagonal elements are at least minDiagonal
  regularized.xx = Math.max(regularized.xx, minDiagonal);
  regularized.yy = Math.max(regularized.yy, minDiagonal);
  
  // Ensure positive definite by constraining correlation
  const maxCorr = 0.99 * Math.sqrt(regularized.xx * regularized.yy);
  regularized.xy = Math.max(-maxCorr, Math.min(maxCorr, regularized.xy));
  
  return regularized;
}

/**
 * Matrix-vector multiplication: matrix * [x, y]
 */
export function matrixVectorMultiply2x2(matrix: Matrix2x2, vector: {x: number, y: number}): {x: number, y: number} {
  return {
    x: matrix.xx * vector.x + matrix.xy * vector.y,
    y: matrix.xy * vector.x + matrix.yy * vector.y
  };
}

/**
 * Calculate quadratic form: [x, y] * matrix * [x, y]
 */
export function quadraticForm2x2(matrix: Matrix2x2, vector: {x: number, y: number}): number {
  return vector.x * vector.x * matrix.xx + 
         2 * vector.x * vector.y * matrix.xy + 
         vector.y * vector.y * matrix.yy;
}

/**
 * Create covariance matrix from variance and covariance values
 */
export function createCovarianceMatrix2x2(varX: number, varY: number, covariance: number): Matrix2x2 {
  return {
    xx: varX,
    xy: covariance,
    yy: varY
  };
}

/**
 * Calculate correlation coefficient from covariance matrix
 */
export function calculateCorrelation2x2(matrix: Matrix2x2): number {
  const denominator = Math.sqrt(matrix.xx * matrix.yy);
  return denominator > 0 ? matrix.xy / denominator : 0;
}