import { KMeansAlgorithm } from '@/lib/kmeans';

describe('KMeansAlgorithm', () => {
  let kmeans: KMeansAlgorithm;
  const testData = [1, 2, 3, 7, 8, 9];

  beforeEach(() => {
    kmeans = new KMeansAlgorithm(testData, 2);
  });

  describe('initialization', () => {
    test('should initialize centroids correctly', () => {
      const centroids = kmeans.initializeCentroidsSimple();
      expect(centroids).toHaveLength(2);
      expect(centroids.every(c => typeof c === 'number')).toBe(true);
    });
  });

  describe('single iteration', () => {
    test('should perform single iteration correctly', () => {
      const initialCentroids = [2, 8];
      const result = kmeans.singleIteration(initialCentroids);
      
      expect(result.clusters).toHaveLength(2);
      expect(result.iteration).toBe(0);
      expect(result.inertia).toBeGreaterThanOrEqual(0);
      expect(typeof result.converged).toBe('boolean');
      
      // Check that all data points are assigned
      const totalPoints = result.clusters.reduce((sum, cluster) => sum + cluster.points.length, 0);
      expect(totalPoints).toBe(testData.length);
    });

    test('should calculate inertia correctly', () => {
      const centroids = [2, 8];
      const result = kmeans.singleIteration(centroids);
      
      // Calculate expected inertia manually
      let expectedInertia = 0;
      result.clusters.forEach(cluster => {
        cluster.points.forEach(point => {
          expectedInertia += Math.pow(point - cluster.centroid, 2);
        });
      });
      
      expect(result.inertia).toBeCloseTo(expectedInertia, 5);
    });

    test('should update centroids correctly', () => {
      const initialCentroids = [1, 9];
      const result = kmeans.singleIteration(initialCentroids);
      
      result.clusters.forEach(cluster => {
        if (cluster.points.length > 0) {
          const expectedCentroid = cluster.points.reduce((sum, point) => sum + point, 0) / cluster.points.length;
          expect(cluster.centroid).toBeCloseTo(expectedCentroid, 5);
        }
      });
    });
  });

  describe('run to convergence', () => {
    test('should run and return history', () => {
      const history = kmeans.run();
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].clusters).toHaveLength(2);
    });

    test('should respect max iterations', () => {
      const history = kmeans.run(5); // Low max iterations
      
      expect(history.length).toBeLessThanOrEqual(6); // +1 for initial state
    });

    test('should maintain decreasing inertia trend', () => {
      const history = kmeans.run();
      
      // Inertia should generally decrease or stay the same
      for (let i = 1; i < history.length; i++) {
        expect(history[i].inertia).toBeLessThanOrEqual(history[i - 1].inertia + 1e-10);
      }
    });
  });

  describe('optimal k finding', () => {
    test('should find optimal k using elbow method', () => {
      const results = kmeans.findOptimalK(4);
      
      expect(results).toHaveLength(4);
      results.forEach((result, i) => {
        expect(result.k).toBe(i + 1);
        expect(result.inertia).toBeGreaterThanOrEqual(0);
      });
      
      // Inertia should generally decrease as k increases
      for (let i = 1; i < results.length; i++) {
        expect(results[i].inertia).toBeLessThanOrEqual(results[i - 1].inertia);
      }
    });
  });

  describe('edge cases', () => {
    test('should handle single data point', () => {
      const singlePointKmeans = new KMeansAlgorithm([5], 1);
      const history = singlePointKmeans.run();
      const result = history[history.length - 1];
      
      expect(result.clusters).toHaveLength(1);
      expect(result.clusters[0].centroid).toBe(5);
      expect(result.clusters[0].points).toEqual([5]);
      expect(result.inertia).toBe(0);
    });

    test('should handle k equal to number of data points', () => {
      const data = [1, 2, 3];
      const kmeans = new KMeansAlgorithm(data, 3);
      const history = kmeans.run();
      const result = history[history.length - 1];
      
      expect(result.clusters).toHaveLength(3);
      expect(result.inertia).toBeCloseTo(0, 5);
    });

    test('should handle identical data points', () => {
      const identicalData = [5, 5, 5, 5];
      const kmeans = new KMeansAlgorithm(identicalData, 2);
      const history = kmeans.run();
      const result = history[history.length - 1];
      
      expect(result.clusters).toHaveLength(2);
      expect(result.inertia).toBe(0);
      result.clusters.forEach(cluster => {
        if (cluster.points.length > 0) {
          expect(cluster.centroid).toBe(5);
        }
      });
    });
  });

  describe('convergence detection', () => {
    test('should detect convergence when centroids stop moving', () => {
      // Use data that should converge quickly
      const simpleData = [1, 2, 8, 9];
      const kmeans = new KMeansAlgorithm(simpleData, 2);
      const history = kmeans.run();
      const finalResult = history[history.length - 1];
      
      expect(finalResult.converged).toBe(true);
      
      if (history.length > 1) {
        // Check that final iteration has same centroids as previous
        const finalHistory = history[history.length - 1];
        const prevHistory = history[history.length - 2];
        
        finalHistory.clusters.forEach((cluster, i) => {
          expect(cluster.centroid).toBeCloseTo(prevHistory.clusters[i].centroid, 6);
        });
      }
    });
  });
});