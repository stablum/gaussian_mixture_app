// K-means algorithm implementation for 1D data
export interface Centroid {
  value: number;
  color: string;
}

export interface KMeansCluster {
  centroid: number;
  points: number[];
  size: number;
}

export interface KMeansResult {
  centroids: number[];
  assignments: number[];
  clusters: KMeansCluster[];
  iteration: number;
  inertia: number; // Within-cluster sum of squares
  converged: boolean;
}

export interface KMeansHistoryStep {
  centroids: number[];
  assignments: number[];
  clusters: KMeansCluster[];
  iteration: number;
  inertia: number;
}

export class KMeansAlgorithm {
  private data: number[];
  private k: number;

  constructor(data: number[], k: number = 2) {
    this.data = [...data].sort((a, b) => a - b); // Sort for better initialization
    this.k = Math.min(k, data.length); // Can't have more clusters than data points
  }

  // Initialize centroids using k-means++ algorithm for better initial placement
  private initializeCentroids(): number[] {
    if (this.data.length === 0) return [];

    const centroids: number[] = [];
    const dataRange = Math.max(...this.data) - Math.min(...this.data);
    
    if (dataRange === 0) {
      // All data points are the same
      return Array(this.k).fill(this.data[0]);
    }

    // K-means++ initialization
    // Choose first centroid randomly
    centroids.push(this.data[Math.floor(Math.random() * this.data.length)]);

    // Choose remaining centroids based on distance from existing ones
    for (let i = 1; i < this.k; i++) {
      const distances = this.data.map(point => {
        const minDistToCentroid = Math.min(...centroids.map(c => Math.abs(point - c)));
        return minDistToCentroid * minDistToCentroid; // Squared distance
      });

      // Weighted random selection
      const totalDistance = distances.reduce((sum, d) => sum + d, 0);
      if (totalDistance === 0) {
        // Fallback: spread centroids evenly
        const min = Math.min(...this.data);
        const max = Math.max(...this.data);
        centroids.push(min + (max - min) * i / (this.k - 1));
      } else {
        let random = Math.random() * totalDistance;
        for (let j = 0; j < distances.length; j++) {
          random -= distances[j];
          if (random <= 0) {
            centroids.push(this.data[j]);
            break;
          }
        }
      }
    }

    return centroids.sort((a, b) => a - b); // Sort centroids for consistent display
  }

  // Simple initialization - spread centroids evenly across data range
  public initializeCentroidsSimple(): number[] {
    if (this.data.length === 0) return [];
    
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min;

    if (range === 0) {
      return Array(this.k).fill(min);
    }

    const centroids: number[] = [];
    for (let i = 0; i < this.k; i++) {
      centroids.push(min + (range * (i + 1)) / (this.k + 1));
    }

    return centroids;
  }

  // Assign each data point to the nearest centroid
  private assignPointsToCentroids(centroids: number[]): number[] {
    return this.data.map(point => {
      let minDistance = Infinity;
      let closestCentroid = 0;

      centroids.forEach((centroid, index) => {
        const distance = Math.abs(point - centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });

      return closestCentroid;
    });
  }

  // Update centroids to the mean of assigned points
  private updateCentroids(assignments: number[]): number[] {
    const newCentroids: number[] = [];

    for (let k = 0; k < this.k; k++) {
      const clusterPoints = this.data.filter((_, index) => assignments[index] === k);
      
      if (clusterPoints.length > 0) {
        const mean = clusterPoints.reduce((sum, point) => sum + point, 0) / clusterPoints.length;
        newCentroids.push(mean);
      } else {
        // If no points assigned to this centroid, keep it in place or reinitialize
        newCentroids.push(newCentroids[k] || this.data[Math.floor(Math.random() * this.data.length)]);
      }
    }

    return newCentroids;
  }

  // Calculate within-cluster sum of squares (inertia)
  private calculateInertia(centroids: number[], assignments: number[]): number {
    let inertia = 0;
    
    this.data.forEach((point, index) => {
      const centroid = centroids[assignments[index]];
      inertia += Math.pow(point - centroid, 2);
    });

    return inertia;
  }

  // Create clusters from centroids and assignments
  private createClusters(centroids: number[], assignments: number[]): KMeansCluster[] {
    const clusters: KMeansCluster[] = [];

    for (let k = 0; k < this.k; k++) {
      const clusterPoints = this.data.filter((_, index) => assignments[index] === k);
      clusters.push({
        centroid: centroids[k],
        points: clusterPoints,
        size: clusterPoints.length
      });
    }

    return clusters;
  }

  // Run a single iteration of k-means
  public singleIteration(currentCentroids: number[]): KMeansResult {
    // Assignment step: assign points to nearest centroids
    const assignments = this.assignPointsToCentroids(currentCentroids);
    
    // Update step: recalculate centroids
    const newCentroids = this.updateCentroids(assignments);
    
    // Calculate inertia (within-cluster sum of squares)
    const inertia = this.calculateInertia(newCentroids, assignments);
    
    // Create clusters
    const clusters = this.createClusters(newCentroids, assignments);
    
    // Check convergence (centroids haven't moved significantly)
    const converged = currentCentroids.every((centroid, index) => 
      Math.abs(centroid - newCentroids[index]) < 1e-6
    );

    return {
      centroids: newCentroids,
      assignments,
      clusters,
      iteration: 0, // Will be set by caller
      inertia,
      converged
    };
  }

  // Run complete k-means algorithm
  public run(maxIterations: number = 100, tolerance: number = 1e-6): KMeansResult[] {
    let centroids = this.initializeCentroids();
    const history: KMeansResult[] = [];
    
    // Add initial state
    const initialAssignments = this.assignPointsToCentroids(centroids);
    const initialInertia = this.calculateInertia(centroids, initialAssignments);
    const initialClusters = this.createClusters(centroids, initialAssignments);
    
    history.push({
      centroids: [...centroids],
      assignments: [...initialAssignments],
      clusters: initialClusters,
      iteration: 0,
      inertia: initialInertia,
      converged: false
    });

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      const result = this.singleIteration(centroids);
      result.iteration = iteration;
      
      history.push(result);
      
      if (result.converged) {
        break;
      }
      
      centroids = result.centroids;
    }

    return history;
  }

  // Get optimal number of clusters using elbow method
  public findOptimalK(maxK: number = Math.min(10, Math.floor(this.data.length / 2))): Array<{k: number, inertia: number}> {
    const results: Array<{k: number, inertia: number}> = [];
    
    for (let k = 1; k <= maxK; k++) {
      const kmeans = new KMeansAlgorithm(this.data, k);
      const history = kmeans.run();
      const finalResult = history[history.length - 1];
      
      results.push({
        k,
        inertia: finalResult.inertia
      });
    }
    
    return results;
  }
}