// Algorithm mode types and enums

export enum AlgorithmMode {
  GAUSSIAN_2D = 'gaussian_2d',
  KMEANS = 'kmeans', 
  GMM = 'gmm'
}

export interface AlgorithmConfig {
  mode: AlgorithmMode;
  componentCount: number; // Number of components/clusters
}

export const ALGORITHM_LABELS = {
  [AlgorithmMode.GAUSSIAN_2D]: '2D Gaussian Fitting',
  [AlgorithmMode.KMEANS]: 'K-Means Clustering',
  [AlgorithmMode.GMM]: '1D Gaussian Mixture Model'
} as const;

export const ALGORITHM_DESCRIPTIONS = {
  [AlgorithmMode.GAUSSIAN_2D]: 'Single bivariate Gaussian distribution fitted to 2D data points',
  [AlgorithmMode.KMEANS]: 'Centroid-based clustering using iterative assignment and update',
  [AlgorithmMode.GMM]: 'Probabilistic model using Expectation-Maximization algorithm'
} as const;

// Parameter names for each mode
export const PARAMETER_NAMES = {
  [AlgorithmMode.GAUSSIAN_2D]: {
    primary: 'μ (Mean)',
    secondary: 'Σ (Covariance)',
    weight: 'Density',
    element: 'Gaussian'
  },
  [AlgorithmMode.KMEANS]: {
    primary: 'Centroid',
    secondary: 'Size',
    weight: 'Points',
    element: 'Cluster'
  },
  [AlgorithmMode.GMM]: {
    primary: 'μ (Mean)',
    secondary: 'σ (Std Dev)', 
    weight: 'π (Weight)',
    element: 'Component'
  }
} as const;