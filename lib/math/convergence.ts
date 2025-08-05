/**
 * Convergence checking utilities for iterative algorithms
 */

/**
 * Check convergence based on absolute change in a value
 */
export function hasConvergedAbsolute(current: number, previous: number, tolerance: number): boolean {
  return Math.abs(current - previous) < tolerance;
}

/**
 * Check convergence based on relative change in a value
 */
export function hasConvergedRelative(current: number, previous: number, tolerance: number): boolean {
  if (Math.abs(previous) < 1e-10) {
    // If previous value is essentially zero, use absolute convergence
    return hasConvergedAbsolute(current, previous, tolerance);
  }
  return Math.abs((current - previous) / previous) < tolerance;
}

/**
 * Check convergence for arrays of values (e.g., centroids, parameters)
 */
export function hasConvergedArray(current: number[], previous: number[], tolerance: number): boolean {
  if (current.length !== previous.length) {
    return false;
  }
  
  return current.every((value, index) => 
    hasConvergedAbsolute(value, previous[index], tolerance)
  );
}

/**
 * Check convergence for 2D points
 */
export function hasConverged2D(
  current: {x: number, y: number}, 
  previous: {x: number, y: number}, 
  tolerance: number
): boolean {
  return hasConvergedAbsolute(current.x, previous.x, tolerance) &&
         hasConvergedAbsolute(current.y, previous.y, tolerance);
}

/**
 * Check convergence for arrays of 2D points
 */
export function hasConvergedArray2D(
  current: Array<{x: number, y: number}>, 
  previous: Array<{x: number, y: number}>, 
  tolerance: number
): boolean {
  if (current.length !== previous.length) {
    return false;
  }
  
  return current.every((point, index) => 
    hasConverged2D(point, previous[index], tolerance)
  );
}

/**
 * Calculate the maximum change in an array of values
 */
export function calculateMaxChange(current: number[], previous: number[]): number {
  if (current.length !== previous.length) {
    return Infinity;
  }
  
  let maxChange = 0;
  for (let i = 0; i < current.length; i++) {
    const change = Math.abs(current[i] - previous[i]);
    if (change > maxChange) {
      maxChange = change;
    }
  }
  
  return maxChange;
}

/**
 * Calculate the maximum change in an array of 2D points
 */
export function calculateMaxChange2D(
  current: Array<{x: number, y: number}>, 
  previous: Array<{x: number, y: number}>
): number {
  if (current.length !== previous.length) {
    return Infinity;
  }
  
  let maxChange = 0;
  for (let i = 0; i < current.length; i++) {
    const changeX = Math.abs(current[i].x - previous[i].x);
    const changeY = Math.abs(current[i].y - previous[i].y);
    const change = Math.max(changeX, changeY);
    if (change > maxChange) {
      maxChange = change;
    }
  }
  
  return maxChange;
}

/**
 * Early stopping criteria for iterative algorithms
 */
export interface EarlyStoppingConfig {
  maxIterations: number;
  tolerance: number;
  minImprovement?: number;
  patienceSteps?: number;
}

export class EarlyStoppingChecker {
  private config: EarlyStoppingConfig;
  private bestValue: number;
  private patienceCounter: number;
  private iterationCount: number;

  constructor(config: EarlyStoppingConfig) {
    this.config = config;
    this.bestValue = -Infinity;
    this.patienceCounter = 0;
    this.iterationCount = 0;
  }

  shouldStop(currentValue: number, previousValue?: number): boolean {
    this.iterationCount++;

    // Check max iterations
    if (this.iterationCount >= this.config.maxIterations) {
      return true;
    }

    // Check tolerance-based convergence
    if (previousValue !== undefined && 
        hasConvergedAbsolute(currentValue, previousValue, this.config.tolerance)) {
      return true;
    }

    // Check patience-based early stopping (for loss functions)
    if (this.config.patienceSteps && this.config.minImprovement) {
      if (currentValue > this.bestValue + this.config.minImprovement) {
        this.bestValue = currentValue;
        this.patienceCounter = 0;
      } else {
        this.patienceCounter++;
        if (this.patienceCounter >= this.config.patienceSteps) {
          return true;
        }
      }
    }

    return false;
  }

  reset(): void {
    this.bestValue = -Infinity;
    this.patienceCounter = 0;
    this.iterationCount = 0;
  }

  getIterationCount(): number {
    return this.iterationCount;
  }
}