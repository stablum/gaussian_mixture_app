/**
 * Common statistical functions used across ML algorithms
 */

export interface BasicStats {
  mean: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  range: number;
}

export interface BasicStats2D {
  meanX: number;
  meanY: number;
  varianceX: number;
  varianceY: number;
  covariance: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  rangeX: number;
  rangeY: number;
}

/**
 * Calculate mean of an array of numbers
 */
export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, x) => sum + x, 0) / data.length;
}

/**
 * Calculate sample variance of an array of numbers
 */
export function calculateVariance(data: number[], mean?: number): number {
  if (data.length === 0) return 0;
  const actualMean = mean ?? calculateMean(data);
  const sumSquaredDiffs = data.reduce((sum, x) => sum + Math.pow(x - actualMean, 2), 0);
  // Use sample variance (n-1) if we have more than 1 point
  const divisor = data.length > 1 ? data.length - 1 : data.length;
  return sumSquaredDiffs / divisor;
}

/**
 * Calculate sample standard deviation of an array of numbers
 */
export function calculateStandardDeviation(data: number[], mean?: number): number {
  return Math.sqrt(calculateVariance(data, mean));
}

/**
 * Calculate comprehensive basic statistics for 1D data
 */
export function calculateBasicStats(data: number[]): BasicStats {
  if (data.length === 0) {
    return {
      mean: 0,
      variance: 0,
      standardDeviation: 0,
      min: 0,
      max: 0,
      range: 0
    };
  }

  const mean = calculateMean(data);
  const variance = calculateVariance(data, mean);
  const min = Math.min(...data);
  const max = Math.max(...data);

  return {
    mean,
    variance,
    standardDeviation: Math.sqrt(variance),
    min,
    max,
    range: max - min
  };
}

/**
 * Calculate mean of 2D points
 */
export function calculateMean2D(data: Array<{x: number, y: number}>): {x: number, y: number} {
  if (data.length === 0) return { x: 0, y: 0 };
  
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  
  return {
    x: sumX / data.length,
    y: sumY / data.length
  };
}

/**
 * Calculate comprehensive basic statistics for 2D data
 */
export function calculateBasicStats2D(data: Array<{x: number, y: number}>): BasicStats2D {
  if (data.length === 0) {
    return {
      meanX: 0, meanY: 0,
      varianceX: 0, varianceY: 0,
      covariance: 0,
      minX: 0, maxX: 0,
      minY: 0, maxY: 0,
      rangeX: 0, rangeY: 0
    };
  }

  const xValues = data.map(p => p.x);
  const yValues = data.map(p => p.y);
  
  const meanX = calculateMean(xValues);
  const meanY = calculateMean(yValues);
  const varianceX = calculateVariance(xValues, meanX);
  const varianceY = calculateVariance(yValues, meanY);
  
  // Calculate covariance
  const n = data.length;
  const divisor = n > 1 ? n - 1 : n;
  const covariance = data.reduce((sum, point) => {
    return sum + (point.x - meanX) * (point.y - meanY);
  }, 0) / divisor;
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return {
    meanX, meanY,
    varianceX, varianceY,
    covariance,
    minX, maxX, minY, maxY,
    rangeX: maxX - minX,
    rangeY: maxY - minY
  };
}