// K-means algorithm implementation for 1D data
import { uniformInitialization1D, kMeansPlusPlusInitialization1D } from './math';
import { findNearest1D, squaredEuclideanDistance1D } from './math';
import { hasConvergedArray } from './math';

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
    return kMeansPlusPlusInitialization1D(this.data, this.k);
  }

  // Simple initialization - spread centroids evenly across data range
  public initializeCentroidsSimple(): number[] {
    return uniformInitialization1D(this.data, this.k);
  }

  // Assign each data point to the nearest centroid
  private assignPointsToCentroids(centroids: number[]): number[] {
    return this.data.map(point => {
      const result = findNearest1D(point, centroids);
      return result.index;
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
      inertia += squaredEuclideanDistance1D(point, centroid);
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
    const converged = hasConvergedArray(newCentroids, currentCentroids, 1e-6);

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