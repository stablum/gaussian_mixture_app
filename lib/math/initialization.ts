/**
 * Common initialization strategies for ML algorithms
 */

import { calculateBasicStats, calculateBasicStats2D } from './statistics';

/**
 * Initialize values randomly within a data range
 */
export function randomInitialization1D(data: number[], count: number): number[] {
  if (data.length === 0 || count <= 0) return [];
  
  const stats = calculateBasicStats(data);
  
  if (stats.range === 0) {
    return Array(count).fill(stats.mean);
  }
  
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    result.push(stats.min + Math.random() * stats.range);
  }
  
  return result;
}

/**
 * Initialize values evenly spaced across data range
 */
export function uniformInitialization1D(data: number[], count: number): number[] {
  if (data.length === 0 || count <= 0) return [];
  
  const stats = calculateBasicStats(data);
  
  if (count === 1) {
    return [stats.mean];
  }
  
  if (stats.range === 0) {
    return Array(count).fill(stats.mean);
  }
  
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const position = (i + 1) / (count + 1);
    result.push(stats.min + position * stats.range);
  }
  
  return result;
}

/**
 * K-means++ initialization for 1D data
 * Chooses initial points proportional to their squared distance from existing centers
 */
export function kMeansPlusPlusInitialization1D(data: number[], count: number): number[] {
  if (data.length === 0 || count <= 0) return [];
  if (count >= data.length) return [...data];
  
  const centers: number[] = [];
  const sortedData = [...data].sort((a, b) => a - b);
  
  // Choose first center randomly
  centers.push(sortedData[Math.floor(Math.random() * sortedData.length)]);
  
  // Choose remaining centers
  for (let i = 1; i < count; i++) {
    const distances = sortedData.map(point => {
      const minDistToCenter = Math.min(...centers.map(center => Math.abs(point - center)));
      return minDistToCenter * minDistToCenter; // Squared distance
    });
    
    const totalDistance = distances.reduce((sum, d) => sum + d, 0);
    
    if (totalDistance === 0) {
      // Fallback: use uniform initialization for remaining centers
      const remaining = uniformInitialization1D(data, count - i);
      centers.push(...remaining);
      break;
    }
    
    // Weighted random selection
    let random = Math.random() * totalDistance;
    for (let j = 0; j < distances.length; j++) {
      random -= distances[j];
      if (random <= 0) {
        centers.push(sortedData[j]);
        break;
      }
    }
  }
  
  return centers.sort((a, b) => a - b);
}

/**
 * Initialize 2D points randomly within data bounds
 */
export function randomInitialization2D(data: Array<{x: number, y: number}>, count: number): Array<{x: number, y: number}> {
  if (data.length === 0 || count <= 0) return [];
  
  const stats = calculateBasicStats2D(data);
  
  if (stats.rangeX === 0 && stats.rangeY === 0) {
    return Array(count).fill({ x: stats.meanX, y: stats.meanY });
  }
  
  const result: Array<{x: number, y: number}> = [];
  for (let i = 0; i < count; i++) {
    result.push({
      x: stats.rangeX > 0 ? stats.minX + Math.random() * stats.rangeX : stats.meanX,
      y: stats.rangeY > 0 ? stats.minY + Math.random() * stats.rangeY : stats.meanY
    });
  }
  
  return result;
}

/**
 * Initialize 2D points on a grid within data bounds
 */
export function gridInitialization2D(data: Array<{x: number, y: number}>, count: number): Array<{x: number, y: number}> {
  if (data.length === 0 || count <= 0) return [];
  
  const stats = calculateBasicStats2D(data);
  
  if (count === 1) {
    return [{ x: stats.meanX, y: stats.meanY }];
  }
  
  // Determine grid dimensions
  const gridSize = Math.ceil(Math.sqrt(count));
  const result: Array<{x: number, y: number}> = [];
  
  for (let i = 0; i < gridSize && result.length < count; i++) {
    for (let j = 0; j < gridSize && result.length < count; j++) {
      const x = stats.rangeX > 0 ? 
        stats.minX + (stats.rangeX * (i + 0.5)) / gridSize : 
        stats.meanX;
      const y = stats.rangeY > 0 ? 
        stats.minY + (stats.rangeY * (j + 0.5)) / gridSize : 
        stats.meanY;
      
      result.push({ x, y });
    }
  }
  
  return result.slice(0, count);
}

/**
 * Initialize parameters based on data statistics with noise
 */
export function statisticalInitialization1D(data: number[], count: number, noiseScale: number = 0.5): number[] {
  if (data.length === 0 || count <= 0) return [];
  
  const stats = calculateBasicStats(data);
  const result: number[] = [];
  
  for (let i = 0; i < count; i++) {
    // Start with mean and add noise proportional to standard deviation
    const noise = (Math.random() - 0.5) * 2 * noiseScale * stats.standardDeviation;
    result.push(stats.mean + noise);
  }
  
  return result;
}

/**
 * Initialize covariance matrix based on data statistics
 */
export function initializeCovarianceMatrix2D(
  data: Array<{x: number, y: number}>,
  scale: number = 0.25
): {xx: number, xy: number, yy: number} {
  if (data.length === 0) {
    return { xx: 1, xy: 0, yy: 1 };
  }
  
  const stats = calculateBasicStats2D(data);
  
  return {
    xx: Math.max(0.01, stats.varianceX * scale),
    xy: stats.covariance * scale,
    yy: Math.max(0.01, stats.varianceY * scale)
  };
}