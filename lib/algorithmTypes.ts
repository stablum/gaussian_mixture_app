// Algorithm mode types and enums

export enum AlgorithmMode {
  GMM = 'gmm',
  KMEANS = 'kmeans'
}

export interface AlgorithmConfig {
  mode: AlgorithmMode;
  componentCount: number; // Number of components/clusters
}

export const ALGORITHM_LABELS = {
  [AlgorithmMode.GMM]: 'Gaussian Mixture Model',
  [AlgorithmMode.KMEANS]: 'K-Means Clustering'
} as const;

export const ALGORITHM_DESCRIPTIONS = {
  [AlgorithmMode.GMM]: 'Probabilistic model using Expectation-Maximization algorithm',
  [AlgorithmMode.KMEANS]: 'Centroid-based clustering using iterative assignment and update'
} as const;

// Parameter names for each mode
export const PARAMETER_NAMES = {
  [AlgorithmMode.GMM]: {
    primary: 'μ (Mean)',
    secondary: 'σ (Std Dev)', 
    weight: 'π (Weight)',
    element: 'Component'
  },
  [AlgorithmMode.KMEANS]: {
    primary: 'Centroid',
    secondary: 'Size',
    weight: 'Points',
    element: 'Cluster'
  }
} as const;