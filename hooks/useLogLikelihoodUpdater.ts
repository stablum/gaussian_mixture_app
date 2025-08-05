import { useCallback, useRef, useState } from 'react';
import { GaussianComponent, GaussianMixtureModel } from '@/lib/gmm';
import { KMeansCluster, KMeansAlgorithm } from '@/lib/kmeans';
import { Gaussian2D, Gaussian2DAlgorithm, Point2D } from '@/lib/gaussian2d';
import { AlgorithmMode } from '@/lib/algorithmTypes';

export interface LogLikelihoodState {
  isCalculating: boolean;
  isStale: boolean;
  lastUpdated: number;
}

export function useLogLikelihoodUpdater() {
  const [logLikelihoodState, setLogLikelihoodState] = useState<LogLikelihoodState>({
    isCalculating: false,
    isStale: false,
    lastUpdated: Date.now()
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const calculationTimeoutRef = useRef<NodeJS.Timeout>();

  // Mark parameters as changed (stale)
  const markAsStale = useCallback(() => {
    setLogLikelihoodState(prev => ({
      ...prev,
      isStale: true
    }));
  }, []);

  // Clear any pending calculations
  const clearPendingCalculations = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }
  }, []);

  // Calculate log-likelihood for GMM
  const calculateGMMLogLikelihood = useCallback(
    (data: number[], components: GaussianComponent[]): Promise<number> => {
      return new Promise((resolve) => {
        // Use setTimeout to make calculation non-blocking
        calculationTimeoutRef.current = setTimeout(() => {
          try {
            const gmm = new GaussianMixtureModel(data, components.length);
            const logLikelihood = gmm.calculateLogLikelihood(components);
            resolve(logLikelihood);
          } catch (error) {
            console.error('Error calculating GMM log-likelihood:', error);
            resolve(-Infinity);
          }
        }, 0);
      });
    },
    []
  );

  // Calculate total distance for K-means (equivalent to log-likelihood)
  const calculateKMeansDistance = useCallback(
    (data: number[], clusters: KMeansCluster[]): Promise<number> => {
      return new Promise((resolve) => {
        calculationTimeoutRef.current = setTimeout(() => {
          try {
            const kmeans = new KMeansAlgorithm(data, clusters.length);
            const centroids = clusters.map(c => c.centroid);
            const result = kmeans.singleIteration(centroids);
            resolve(result.inertia);
          } catch (error) {
            console.error('Error calculating K-means distance:', error);
            resolve(Infinity);
          }
        }, 0);
      });
    },
    []
  );

  // Calculate log-likelihood for 2D Gaussian
  const calculateGaussian2DLogLikelihood = useCallback(
    (data: Point2D[], gaussian: Gaussian2D): Promise<number> => {
      return new Promise((resolve) => {
        calculationTimeoutRef.current = setTimeout(() => {
          try {
            const gaussian2dAlg = new Gaussian2DAlgorithm(data);
            const logLikelihood = gaussian2dAlg.calculateLogLikelihood(gaussian);
            resolve(logLikelihood);
          } catch (error) {
            console.error('Error calculating 2D Gaussian log-likelihood:', error);
            resolve(-Infinity);
          }
        }, 0);
      });
    },
    []
  );

  // Main update function with debouncing
  const scheduleLogLikelihoodUpdate = useCallback(
    async (
      mode: AlgorithmMode,
      data: number[] | Point2D[],
      params: GaussianComponent[] | KMeansCluster[] | Gaussian2D,
      onUpdate: (value: number) => void,
      debounceMs: number = 300
    ) => {
      // Clear any existing timeout
      clearPendingCalculations();

      // Mark as stale immediately
      markAsStale();

      // Set up debounced calculation
      debounceTimeoutRef.current = setTimeout(async () => {
        setLogLikelihoodState(prev => ({
          ...prev,
          isCalculating: true
        }));

        try {
          let result: number;

          switch (mode) {
            case AlgorithmMode.GMM:
              result = await calculateGMMLogLikelihood(
                data as number[],
                params as GaussianComponent[]
              );
              break;
            case AlgorithmMode.KMEANS:
              result = await calculateKMeansDistance(
                data as number[],
                params as KMeansCluster[]
              );
              break;
            case AlgorithmMode.GAUSSIAN_2D:
              result = await calculateGaussian2DLogLikelihood(
                data as Point2D[],
                params as Gaussian2D
              );
              break;
            default:
              result = -Infinity;
          }

          // Update the result
          onUpdate(result);

          // Mark as fresh
          setLogLikelihoodState({
            isCalculating: false,
            isStale: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          console.error('Error in log-likelihood calculation:', error);
          setLogLikelihoodState(prev => ({
            ...prev,
            isCalculating: false
          }));
        }
      }, debounceMs);
    },
    [
      clearPendingCalculations,
      markAsStale,
      calculateGMMLogLikelihood,
      calculateKMeansDistance,
      calculateGaussian2DLogLikelihood
    ]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    clearPendingCalculations();
  }, [clearPendingCalculations]);

  return {
    logLikelihoodState,
    scheduleLogLikelihoodUpdate,
    markAsStale,
    cleanup
  };
}