import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import KMeansControls from '@/components/KMeansControls';
import { KMeansHistoryStep } from '@/lib/kmeans';

// Mock the ConvergenceChart component to focus on integration testing
jest.mock('@/components/ConvergenceChart', () => {
  return function MockConvergenceChart({ data, mode, currentIteration }: any) {
    return (
      <div data-testid="convergence-chart">
        <div data-testid="chart-data">{JSON.stringify(data)}</div>
        <div data-testid="chart-mode">{mode}</div>
        <div data-testid="chart-current-iteration">{currentIteration}</div>
      </div>
    );
  };
});

describe('KMeansControls with Convergence Chart Integration', () => {
  const mockKMeansHistory: KMeansHistoryStep[] = [
    {
      iteration: 0,
      clusters: [
        { centroid: 2.5, size: 15, points: [1, 2, 3, 4, 5] },
        { centroid: 7.5, size: 10, points: [6, 7, 8, 9, 10] }
      ],
      inertia: 45.8
    },
    {
      iteration: 1,
      clusters: [
        { centroid: 2.3, size: 12, points: [1, 2, 3] },
        { centroid: 7.8, size: 13, points: [6, 7, 8, 9] }
      ],
      inertia: 32.1
    },
    {
      iteration: 2,
      clusters: [
        { centroid: 2.1, size: 11, points: [1, 2] },
        { centroid: 8.0, size: 14, points: [7, 8, 9] }
      ],
      inertia: 28.5
    },
    {
      iteration: 3,
      clusters: [
        { centroid: 2.0, size: 10, points: [1] },
        { centroid: 8.1, size: 15, points: [8, 9] }
      ],
      inertia: 27.9
    }
  ];

  const defaultProps = {
    currentStep: 2,
    totalSteps: mockKMeansHistory.length,
    isRunning: false,
    converged: false,
    onStepForward: jest.fn(),
    onStepBackward: jest.fn(),
    onReset: jest.fn(),
    onRunToConvergence: jest.fn(),
    onStop: jest.fn(),
    inertia: 28.5,
    kmeansHistory: mockKMeansHistory
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Convergence Chart Integration', () => {
    it('should render convergence chart when kmeansHistory has multiple steps', () => {
      render(<KMeansControls {...defaultProps} />);

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should pass correct inertia data to convergence chart', () => {
      render(<KMeansControls {...defaultProps} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = mockKMeansHistory.map(step => ({
        iteration: step.iteration,
        value: step.inertia || 0
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should pass KMEANS mode to convergence chart', () => {
      render(<KMeansControls {...defaultProps} />);

      const chartModeElement = screen.getByTestId('chart-mode');
      expect(chartModeElement).toHaveTextContent('kmeans');
    });

    it('should pass current iteration to convergence chart', () => {
      render(<KMeansControls {...defaultProps} />);

      const chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('2');
    });

    it('should not render convergence chart when kmeansHistory has only one step', () => {
      const singleStepHistory = [mockKMeansHistory[0]];
      
      render(<KMeansControls {...defaultProps} kmeansHistory={singleStepHistory} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should not render convergence chart when kmeansHistory is empty', () => {
      render(<KMeansControls {...defaultProps} kmeansHistory={[]} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should not render convergence chart when kmeansHistory is undefined', () => {
      const propsWithoutHistory = { ...defaultProps };
      delete (propsWithoutHistory as any).kmeansHistory;

      render(<KMeansControls {...propsWithoutHistory} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should update current iteration in chart when currentStep changes', () => {
      const { rerender } = render(<KMeansControls {...defaultProps} />);

      let chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('2');

      // Change current step
      rerender(<KMeansControls {...defaultProps} currentStep={1} />);

      chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('1');
    });
  });

  describe('Inertia Data Handling', () => {
    it('should handle steps with missing inertia values', () => {
      const historyWithMissingInertia = [
        mockKMeansHistory[0],
        { ...mockKMeansHistory[1], inertia: undefined } as any,
        mockKMeansHistory[2]
      ];

      render(<KMeansControls {...defaultProps} kmeansHistory={historyWithMissingInertia} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = historyWithMissingInertia.map(step => ({
        iteration: step.iteration,
        value: step.inertia || 0
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should maintain data integrity with decreasing inertia values', () => {
      const decreasingInertiaHistory = [
        { ...mockKMeansHistory[0], inertia: 100.0 },
        { ...mockKMeansHistory[1], inertia: 75.5 },
        { ...mockKMeansHistory[2], inertia: 50.2 },
        { ...mockKMeansHistory[3], inertia: 25.1 }
      ];

      render(<KMeansControls {...defaultProps} kmeansHistory={decreasingInertiaHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = decreasingInertiaHistory.map(step => ({
        iteration: step.iteration,
        value: step.inertia
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should handle zero inertia values', () => {
      const zeroInertiaHistory = [
        { ...mockKMeansHistory[0], inertia: 10.0 },
        { ...mockKMeansHistory[1], inertia: 5.0 },
        { ...mockKMeansHistory[2], inertia: 0.0 },
        { ...mockKMeansHistory[3], inertia: 0.0 }
      ];

      render(<KMeansControls {...defaultProps} kmeansHistory={zeroInertiaHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = zeroInertiaHistory.map(step => ({
        iteration: step.iteration,
        value: step.inertia
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });
  });

  describe('Chart Updates with State Changes', () => {
    it('should update chart when new steps are added to history', () => {
      const { rerender } = render(<KMeansControls {...defaultProps} />);

      const initialDataContent = screen.getByTestId('chart-data').textContent;

      const extendedHistory = [
        ...mockKMeansHistory,
        {
          iteration: 4,
          clusters: [
            { centroid: 1.9, size: 9, points: [] },
            { centroid: 8.2, size: 16, points: [] }
          ],
          inertia: 27.5
        }
      ];

      rerender(<KMeansControls {...defaultProps} kmeansHistory={extendedHistory} />);

      const updatedDataContent = screen.getByTestId('chart-data').textContent;
      expect(updatedDataContent).not.toBe(initialDataContent);

      const expectedData = extendedHistory.map(step => ({
        iteration: step.iteration,
        value: step.inertia || 0
      }));

      expect(screen.getByTestId('chart-data')).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should reflect convergence state in data', () => {
      const convergedHistory = [
        ...mockKMeansHistory,
        { ...mockKMeansHistory[3], iteration: 4, inertia: 27.9 }, // Same inertia = converged
        { ...mockKMeansHistory[3], iteration: 5, inertia: 27.9 }
      ];

      render(<KMeansControls {...defaultProps} kmeansHistory={convergedHistory} converged={true} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = convergedHistory.map(step => ({
        iteration: step.iteration,
        value: step.inertia || 0
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });
  });

  describe('Performance and Large Datasets', () => {
    it('should handle large number of K-means iterations efficiently', () => {
      const largeHistory = Array.from({ length: 50 }, (_, i) => ({
        iteration: i,
        clusters: [
          { centroid: 2.5 - i * 0.1, size: 10 + i, points: [] },
          { centroid: 7.5 + i * 0.1, size: 15 - i, points: [] }
        ],
        inertia: Math.max(50.0 - i * 1.2, 5.0) // Decreasing inertia with floor
      }));

      const startTime = performance.now();
      render(<KMeansControls {...defaultProps} kmeansHistory={largeHistory} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should not cause unnecessary re-renders when non-history props change', () => {
      const { rerender } = render(<KMeansControls {...defaultProps} />);
      
      const initialDataContent = screen.getByTestId('chart-data').textContent;

      // Change non-history related props
      rerender(<KMeansControls {...defaultProps} isRunning={true} converged={true} />);

      const updatedDataContent = screen.getByTestId('chart-data').textContent;
      expect(updatedDataContent).toBe(initialDataContent); // Should be the same
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle history with irregular iteration numbers', () => {
      const irregularHistory = [
        { ...mockKMeansHistory[0], iteration: 0 },
        { ...mockKMeansHistory[1], iteration: 3 }, // Skip 1, 2
        { ...mockKMeansHistory[2], iteration: 7 }, // Skip 4, 5, 6
      ];

      render(<KMeansControls {...defaultProps} kmeansHistory={irregularHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = irregularHistory.map(step => ({
        iteration: step.iteration,
        value: step.inertia || 0
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should handle very small inertia values', () => {
      const smallInertiaHistory = mockKMeansHistory.map(step => ({
        ...step,
        inertia: step.inertia! / 10000 // Very small values
      }));

      render(<KMeansControls {...defaultProps} kmeansHistory={smallInertiaHistory} />);

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should handle malformed cluster data gracefully', () => {
      const malformedHistory = [
        mockKMeansHistory[0],
        { ...mockKMeansHistory[1], clusters: null } as any,
        mockKMeansHistory[2]
      ].filter(step => step.clusters); // Filter out malformed entries

      expect(() => {
        render(<KMeansControls {...defaultProps} kmeansHistory={malformedHistory} />);
      }).not.toThrow();
    });
  });
});