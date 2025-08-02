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

// Backward compatibility
export function generateSimpleSampleData(n: number = 100): number[] {
  return generateSampleData({ totalPoints: n });
}