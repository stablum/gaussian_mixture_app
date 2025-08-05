import { Point2D } from './gaussian2d';

export function parseCSV(csvText: string): number[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const hasHeader = isNaN(parseFloat(firstLine.split(',')[0].trim()));
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const values: number[] = [];

  for (const line of dataLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const cells = trimmedLine.split(',');
    
    for (const cell of cells) {
      const trimmedCell = cell.trim();
      const value = parseFloat(trimmedCell);
      
      if (!isNaN(value) && isFinite(value)) {
        values.push(value);
      }
    }
  }

  return values;
}

export function parseCSV2D(csvText: string): Point2D[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const hasHeader = isNaN(parseFloat(firstLine.split(',')[0].trim()));
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const points: Point2D[] = [];

  for (const line of dataLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const cells = trimmedLine.split(',');
    
    if (cells.length >= 2) {
      const x = parseFloat(cells[0].trim());
      const y = parseFloat(cells[1].trim());
      
      if (!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

// Box-Muller transform for generating normal distribution
function normalRandom(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

export interface SampleDataConfig {
  totalPoints: number;
  components: {
    mean: number;
    stdDev: number;
    weight: number;
  }[];
  preset?: 'bimodal' | 'trimodal' | 'overlapping' | 'separated' | 'uniform' | 'custom';
}

export interface GeneratedDataInfo {
  data: number[];
  actualConfig: SampleDataConfig;
  statistics: {
    count: number;
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    componentCounts: number[];
  };
}

export function generateSampleData(config?: Partial<SampleDataConfig>): number[] {
  // Default bimodal configuration
  const defaultConfig: SampleDataConfig = {
    totalPoints: 100,
    components: [
      { mean: 3, stdDev: 1, weight: 0.6 },
      { mean: 8, stdDev: 1.2, weight: 0.4 }
    ]
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  // Apply preset configurations
  if (finalConfig.preset) {
    switch (finalConfig.preset) {
      case 'bimodal':
        finalConfig.components = [
          { mean: 3, stdDev: 1, weight: 0.6 },
          { mean: 8, stdDev: 1.2, weight: 0.4 }
        ];
        break;
      case 'trimodal':
        finalConfig.components = [
          { mean: 2, stdDev: 0.8, weight: 0.3 },
          { mean: 6, stdDev: 1, weight: 0.4 },
          { mean: 10, stdDev: 1.2, weight: 0.3 }
        ];
        break;
      case 'overlapping':
        finalConfig.components = [
          { mean: 4, stdDev: 1.5, weight: 0.5 },
          { mean: 6, stdDev: 1.5, weight: 0.5 }
        ];
        break;
      case 'separated':
        finalConfig.components = [
          { mean: 1, stdDev: 0.5, weight: 0.4 },
          { mean: 9, stdDev: 0.5, weight: 0.6 }
        ];
        break;
      case 'uniform':
        finalConfig.components = [
          { mean: 5, stdDev: 2.5, weight: 1.0 }
        ];
        break;
    }
  }
  
  // Normalize weights
  const totalWeight = finalConfig.components.reduce((sum, comp) => sum + comp.weight, 0);
  finalConfig.components = finalConfig.components.map(comp => ({
    ...comp,
    weight: comp.weight / totalWeight
  }));
  
  const data: number[] = [];
  
  // Generate data points for each component
  for (const component of finalConfig.components) {
    const numPoints = Math.round(finalConfig.totalPoints * component.weight);
    
    for (let i = 0; i < numPoints; i++) {
      const point = normalRandom(component.mean, component.stdDev);
      data.push(point);
    }
  }
  
  // Fill remaining points if needed due to rounding
  while (data.length < finalConfig.totalPoints) {
    const randomComponent = finalConfig.components[Math.floor(Math.random() * finalConfig.components.length)];
    const point = normalRandom(randomComponent.mean, randomComponent.stdDev);
    data.push(point);
  }
  
  return data.sort((a, b) => a - b);
}

export function generateSampleDataWithInfo(config?: Partial<SampleDataConfig>): GeneratedDataInfo {
  // Default bimodal configuration
  const defaultConfig: SampleDataConfig = {
    totalPoints: 100,
    components: [
      { mean: 3, stdDev: 1, weight: 0.6 },
      { mean: 8, stdDev: 1.2, weight: 0.4 }
    ]
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  // Apply preset configurations
  if (finalConfig.preset) {
    switch (finalConfig.preset) {
      case 'bimodal':
        finalConfig.components = [
          { mean: 3, stdDev: 1, weight: 0.6 },
          { mean: 8, stdDev: 1.2, weight: 0.4 }
        ];
        break;
      case 'trimodal':
        finalConfig.components = [
          { mean: 2, stdDev: 0.8, weight: 0.3 },
          { mean: 6, stdDev: 1, weight: 0.4 },
          { mean: 10, stdDev: 1.2, weight: 0.3 }
        ];
        break;
      case 'overlapping':
        finalConfig.components = [
          { mean: 4, stdDev: 1.5, weight: 0.5 },
          { mean: 6, stdDev: 1.5, weight: 0.5 }
        ];
        break;
      case 'separated':
        finalConfig.components = [
          { mean: 1, stdDev: 0.5, weight: 0.4 },
          { mean: 9, stdDev: 0.5, weight: 0.6 }
        ];
        break;
      case 'uniform':
        finalConfig.components = [
          { mean: 5, stdDev: 2.5, weight: 1.0 }
        ];
        break;
    }
  }
  
  // Normalize weights
  const totalWeight = finalConfig.components.reduce((sum, comp) => sum + comp.weight, 0);
  finalConfig.components = finalConfig.components.map(comp => ({
    ...comp,
    weight: comp.weight / totalWeight
  }));
  
  const data: number[] = [];
  const componentCounts: number[] = new Array(finalConfig.components.length).fill(0);
  
  // Generate data points for each component
  finalConfig.components.forEach((component, componentIndex) => {
    const numPoints = Math.round(finalConfig.totalPoints * component.weight);
    componentCounts[componentIndex] = numPoints;
    
    for (let i = 0; i < numPoints; i++) {
      const point = normalRandom(component.mean, component.stdDev);
      data.push(point);
    }
  });
  
  // Fill remaining points if needed due to rounding
  while (data.length < finalConfig.totalPoints) {
    const randomComponentIndex = Math.floor(Math.random() * finalConfig.components.length);
    const randomComponent = finalConfig.components[randomComponentIndex];
    const point = normalRandom(randomComponent.mean, randomComponent.stdDev);
    data.push(point);
    componentCounts[randomComponentIndex]++;
  }
  
  const sortedData = data.sort((a, b) => a - b);
  
  // Calculate statistics
  const mean = sortedData.reduce((sum, x) => sum + x, 0) / sortedData.length;
  const variance = sortedData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (sortedData.length - 1);
  const stdDev = Math.sqrt(variance);
  
  return {
    data: sortedData,
    actualConfig: finalConfig,
    statistics: {
      count: sortedData.length,
      mean: mean,
      stdDev: stdDev,
      min: sortedData[0],
      max: sortedData[sortedData.length - 1],
      componentCounts: componentCounts
    }
  };
}

// Backward compatibility
export function generateSimpleSampleData(n: number = 100): number[] {
  return generateSampleData({ totalPoints: n });
}

// 2D Sample Data Generation
export interface SampleData2DConfig {
  totalPoints: number;
  mean: Point2D;
  covariance: {
    xx: number;
    xy: number;
    yy: number;
  };
  preset?: 'circular' | 'elliptical' | 'correlated' | 'anticorrelated' | 'stretched' | 'custom';
}

// Generate 2D samples from multivariate normal distribution
export function generateSampleData2D(config?: Partial<SampleData2DConfig>): Point2D[] {
  const defaultConfig: SampleData2DConfig = {
    totalPoints: 100,
    mean: { x: 0, y: 0 },
    covariance: {
      xx: 1,
      xy: 0,
      yy: 1
    }
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  // Apply preset configurations
  if (finalConfig.preset) {
    switch (finalConfig.preset) {
      case 'circular':
        finalConfig.mean = { x: 0, y: 0 };
        finalConfig.covariance = { xx: 1, xy: 0, yy: 1 };
        break;
      case 'elliptical':
        finalConfig.mean = { x: 0, y: 0 };
        finalConfig.covariance = { xx: 4, xy: 0, yy: 1 };
        break;
      case 'correlated':
        finalConfig.mean = { x: 0, y: 0 };
        finalConfig.covariance = { xx: 2, xy: 1.2, yy: 2 };
        break;
      case 'anticorrelated':
        finalConfig.mean = { x: 0, y: 0 };
        finalConfig.covariance = { xx: 2, xy: -1.2, yy: 2 };
        break;
      case 'stretched':
        finalConfig.mean = { x: 0, y: 0 };
        finalConfig.covariance = { xx: 0.25, xy: 0, yy: 4 };
        break;
    }
  }
  
  const points: Point2D[] = [];
  
  // Calculate Cholesky decomposition for sampling
  const sigma = finalConfig.covariance;
  const det = sigma.xx * sigma.yy - sigma.xy * sigma.xy;
  
  if (det <= 0) {
    // Fallback to independent samples if covariance is not positive definite
    for (let i = 0; i < finalConfig.totalPoints; i++) {
      points.push({
        x: normalRandom(finalConfig.mean.x, Math.sqrt(Math.abs(sigma.xx))),
        y: normalRandom(finalConfig.mean.y, Math.sqrt(Math.abs(sigma.yy)))
      });
    }
    return points;
  }
  
  // Cholesky decomposition: L where Σ = L L^T
  const L11 = Math.sqrt(sigma.xx);
  const L21 = sigma.xy / L11;
  const L22 = Math.sqrt(sigma.yy - L21 * L21);
  
  // Generate samples
  for (let i = 0; i < finalConfig.totalPoints; i++) {
    // Generate independent standard normal variables
    const z1 = normalRandom(0, 1);
    const z2 = normalRandom(0, 1);
    
    // Transform using Cholesky decomposition
    const x = finalConfig.mean.x + L11 * z1;
    const y = finalConfig.mean.y + L21 * z1 + L22 * z2;
    
    points.push({ x, y });
  }
  
  return points;
}

export function generateSimpleSampleData2D(n: number = 100): Point2D[] {
  return generateSampleData2D({ totalPoints: n, preset: 'correlated' });
}