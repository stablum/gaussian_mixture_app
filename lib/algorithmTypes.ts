// Algorithm mode types and enums

export enum AlgorithmMode {
  GMM = 'gmm',
  KMEANS = 'kmeans',
  GAUSSIAN_2D = 'gaussian_2d'
}

export interface AlgorithmConfig {
  mode: AlgorithmMode;
  componentCount: number; // Number of components/clusters
}

export const ALGORITHM_LABELS = {
  [AlgorithmMode.GMM]: 'Gaussian Mixture Model',
  [AlgorithmMode.KMEANS]: 'K-Means Clustering',
  [AlgorithmMode.GAUSSIAN_2D]: '2D Gaussian Fitting'
} as const;

export const ALGORITHM_DESCRIPTIONS = {
  [AlgorithmMode.GMM]: 'Probabilistic model using Expectation-Maximization algorithm',
  [AlgorithmMode.KMEANS]: 'Centroid-based clustering using iterative assignment and update',
  [AlgorithmMode.GAUSSIAN_2D]: 'Single bivariate Gaussian distribution fitted to 2D data points'
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
  },
  [AlgorithmMode.GAUSSIAN_2D]: {
    primary: 'μ (Mean)',
    secondary: 'Σ (Covariance)',
    weight: 'Density',
    element: 'Gaussian'
  }
} as const;