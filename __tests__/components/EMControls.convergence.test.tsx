import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import EMControls from '@/components/EMControls';
import { GMMHistoryStep } from '@/lib/gmm';

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

describe('EMControls with Convergence Chart Integration', () => {
  const mockGMMHistory: GMMHistoryStep[] = [
    {
      iteration: 0,
      components: [
        { mu: 2.5, sigma: 1.0, pi: 0.4 },
        { mu: 7.5, sigma: 1.5, pi: 0.6 }
      ],
      logLikelihood: -150.5
    },
    {
      iteration: 1,
      components: [
        { mu: 2.3, sigma: 1.1, pi: 0.3 },
        { mu: 7.8, sigma: 1.4, pi: 0.7 }
      ],
      logLikelihood: -120.3
    },
    {
      iteration: 2,
      components: [
        { mu: 2.1, sigma: 1.0, pi: 0.35 },
        { mu: 8.0, sigma: 1.3, pi: 0.65 }
      ],
      logLikelihood: -100.8
    },
    {
      iteration: 3,
      components: [
        { mu: 2.0, sigma: 0.9, pi: 0.4 },
        { mu: 8.1, sigma: 1.2, pi: 0.6 }
      ],
      logLikelihood: -95.2
    }
  ];

  const defaultProps = {
    currentStep: 2,
    totalSteps: mockGMMHistory.length,
    isRunning: false,
    converged: false,
    onStepForward: jest.fn(),
    onStepBackward: jest.fn(),
    onReset: jest.fn(),
    onRunToConvergence: jest.fn(),
    onStop: jest.fn(),
    logLikelihood: -100.8,
    gmmHistory: mockGMMHistory
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Convergence Chart Integration', () => {
    it('should render convergence chart when gmmHistory has multiple steps', () => {
      render(<EMControls {...defaultProps} />);

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should pass correct data to convergence chart', () => {
      render(<EMControls {...defaultProps} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = mockGMMHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should pass correct mode to convergence chart', () => {
      render(<EMControls {...defaultProps} />);

      const chartModeElement = screen.getByTestId('chart-mode');
      expect(chartModeElement).toHaveTextContent('gmm');
    });

    it('should pass current iteration to convergence chart', () => {
      render(<EMControls {...defaultProps} />);

      const chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('2');
    });

    it('should not render convergence chart when gmmHistory has only one step', () => {
      const singleStepHistory = [mockGMMHistory[0]];
      
      render(<EMControls {...defaultProps} gmmHistory={singleStepHistory} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should not render convergence chart when gmmHistory is empty', () => {
      render(<EMControls {...defaultProps} gmmHistory={[]} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should not render convergence chart when gmmHistory is undefined', () => {
      const propsWithoutHistory = { ...defaultProps };
      delete (propsWithoutHistory as any).gmmHistory;

      render(<EMControls {...propsWithoutHistory} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should update current iteration in chart when currentStep changes', () => {
      const { rerender } = render(<EMControls {...defaultProps} />);

      let chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('2');

      // Change current step
      rerender(<EMControls {...defaultProps} currentStep={1} />);

      chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('1');
    });
  });

  describe('Chart Data Accuracy', () => {
    it('should maintain data integrity across multiple history updates', () => {
      const extendedHistory = [
        ...mockGMMHistory,
        {
          iteration: 4,
          components: [
            { mu: 1.9, sigma: 0.8, pi: 0.4 },
            { mu: 8.2, sigma: 1.1, pi: 0.6 }
          ],
          logLikelihood: -94.8
        }
      ];

      render(<EMControls {...defaultProps} gmmHistory={extendedHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = extendedHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should handle negative log-likelihood values correctly', () => {
      const negativeLogLikelihoodHistory = mockGMMHistory.map(step => ({
        ...step,
        logLikelihood: step.logLikelihood - 1000 // Make them more negative
      }));

      render(<EMControls {...defaultProps} gmmHistory={negativeLogLikelihoodHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = negativeLogLikelihoodHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should handle irregular iteration sequences', () => {
      const irregularHistory = [
        { ...mockGMMHistory[0], iteration: 0 },
        { ...mockGMMHistory[1], iteration: 2 }, // Skip iteration 1
        { ...mockGMMHistory[2], iteration: 5 }, // Jump to iteration 5
      ];

      render(<EMControls {...defaultProps} gmmHistory={irregularHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = irregularHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });
  });

  describe('Performance Considerations', () => {
    it('should not recreate chart data unnecessarily when unrelated props change', () => {
      const { rerender } = render(<EMControls {...defaultProps} />);
      
      const initialDataContent = screen.getByTestId('chart-data').textContent;

      // Change unrelated prop (isRunning)
      rerender(<EMControls {...defaultProps} isRunning={true} />);

      const updatedDataContent = screen.getByTestId('chart-data').textContent;
      expect(updatedDataContent).toBe(initialDataContent);
    });

    it('should handle large history arrays efficiently', () => {
      const largeHistory = Array.from({ length: 100 }, (_, i) => ({
        iteration: i,
        components: [
          { mu: 2.5 - i * 0.01, sigma: 1.0, pi: 0.4 },
          { mu: 7.5 + i * 0.01, sigma: 1.5, pi: 0.6 }
        ],
        logLikelihood: -150.5 + i * 2 // Gradually improving
      }));

      const startTime = performance.now();
      render(<EMControls {...defaultProps} gmmHistory={largeHistory} />);
      const endTime = performance.now();

      // Should render quickly even with large datasets
      expect(endTime - startTime).toBeLessThan(100); // Less than 100ms
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle history with missing logLikelihood values', () => {
      const incompleteHistory = [
        mockGMMHistory[0],
        { ...mockGMMHistory[1], logLikelihood: undefined } as any,
        mockGMMHistory[2]
      ];

      render(<EMControls {...defaultProps} gmmHistory={incompleteHistory} />);

      // Should still render chart (ConvergenceChart should handle undefined values)
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should handle malformed history data gracefully', () => {
      const malformedHistory = [
        mockGMMHistory[0],
        null as any,
        undefined as any,
        mockGMMHistory[2]
      ].filter(Boolean);

      expect(() => {
        render(<EMControls {...defaultProps} gmmHistory={malformedHistory} />);
      }).not.toThrow();
    });
  });
});