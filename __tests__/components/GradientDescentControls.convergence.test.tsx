import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import GradientDescentControls from '@/components/GradientDescentControls';
import { Gaussian2DHistoryStep } from '@/lib/gaussian2d';

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

describe('GradientDescentControls with Convergence Chart Integration', () => {
  const mockGradientDescentHistory: Gaussian2DHistoryStep[] = [
    {
      iteration: 0,
      gaussian: {
        mu: { x: 1.0, y: 2.0 },
        sigma: { xx: 1.0, xy: 0.0, yy: 1.0 },
        logLikelihood: -85.2
      },
      logLikelihood: -85.2
    },
    {
      iteration: 1,
      gaussian: {
        mu: { x: 1.1, y: 2.1 },
        sigma: { xx: 0.95, xy: 0.05, yy: 0.98 },
        logLikelihood: -72.5
      },
      logLikelihood: -72.5
    },
    {
      iteration: 2,
      gaussian: {
        mu: { x: 1.05, y: 2.05 },
        sigma: { xx: 0.92, xy: 0.08, yy: 0.95 },
        logLikelihood: -68.1
      },
      logLikelihood: -68.1
    },
    {
      iteration: 3,
      gaussian: {
        mu: { x: 1.02, y: 2.02 },
        sigma: { xx: 0.91, xy: 0.09, yy: 0.94 },
        logLikelihood: -66.8
      },
      logLikelihood: -66.8
    }
  ];

  const defaultProps = {
    currentStep: 2,
    totalSteps: mockGradientDescentHistory.length,
    isRunning: false,
    converged: false,
    onStepForward: jest.fn(),
    onStepBackward: jest.fn(),
    onReset: jest.fn(),
    onRunToConvergence: jest.fn(),
    onStop: jest.fn(),
    onExit: jest.fn(),
    logLikelihood: -68.1,
    learningRate: 0.01,
    onLearningRateChange: jest.fn(),
    gradientDescentHistory: mockGradientDescentHistory
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Convergence Chart Integration', () => {
    it('should render convergence chart when gradientDescentHistory has multiple steps', () => {
      render(<GradientDescentControls {...defaultProps} />);

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should pass correct log-likelihood data to convergence chart', () => {
      render(<GradientDescentControls {...defaultProps} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = mockGradientDescentHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should pass GAUSSIAN_2D mode to convergence chart', () => {
      render(<GradientDescentControls {...defaultProps} />);

      const chartModeElement = screen.getByTestId('chart-mode');
      expect(chartModeElement).toHaveTextContent('gaussian_2d');
    });

    it('should pass current iteration to convergence chart', () => {
      render(<GradientDescentControls {...defaultProps} />);

      const chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('2');
    });

    it('should not render convergence chart when gradientDescentHistory has only one step', () => {
      const singleStepHistory = [mockGradientDescentHistory[0]];
      
      render(<GradientDescentControls {...defaultProps} gradientDescentHistory={singleStepHistory} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should not render convergence chart when gradientDescentHistory is empty', () => {
      render(<GradientDescentControls {...defaultProps} gradientDescentHistory={[]} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should not render convergence chart when gradientDescentHistory is undefined', () => {
      const propsWithoutHistory = { ...defaultProps };
      delete (propsWithoutHistory as any).gradientDescentHistory;

      render(<GradientDescentControls {...propsWithoutHistory} />);

      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });

    it('should update current iteration in chart when currentStep changes', () => {
      const { rerender } = render(<GradientDescentControls {...defaultProps} />);

      let chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('2');

      // Change current step
      rerender(<GradientDescentControls {...defaultProps} currentStep={1} />);

      chartCurrentIterationElement = screen.getByTestId('chart-current-iteration');
      expect(chartCurrentIterationElement).toHaveTextContent('1');
    });
  });

  describe('Learning Rate Integration', () => {
    it('should display learning rate slider when chart is expanded', async () => {
      render(<GradientDescentControls {...defaultProps} />);

      // The learning rate control should be visible
      expect(screen.getByText('Learning Rate: 0.0100')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should call onLearningRateChange when slider is moved', async () => {
      const user = userEvent.setup();
      render(<GradientDescentControls {...defaultProps} />);

      const slider = screen.getByRole('slider');
      
      await user.click(slider);
      fireEvent.change(slider, { target: { value: '0.05' } });

      expect(defaultProps.onLearningRateChange).toHaveBeenCalledWith(0.05);
    });

    it('should disable learning rate control when running', () => {
      render(<GradientDescentControls {...defaultProps} isRunning={true} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });
  });

  describe('Log-Likelihood Data Accuracy', () => {
    it('should handle improving log-likelihood values correctly', () => {
      const improvingHistory = [
        { ...mockGradientDescentHistory[0], logLikelihood: -100.0 },
        { ...mockGradientDescentHistory[1], logLikelihood: -90.0 },
        { ...mockGradientDescentHistory[2], logLikelihood: -85.0 },
        { ...mockGradientDescentHistory[3], logLikelihood: -82.5 }
      ];

      render(<GradientDescentControls {...defaultProps} gradientDescentHistory={improvingHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = improvingHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should handle very negative log-likelihood values', () => {
      const veryNegativeHistory = mockGradientDescentHistory.map(step => ({
        ...step,
        logLikelihood: step.logLikelihood - 1000 // Make very negative
      }));

      render(<GradientDescentControls {...defaultProps} gradientDescentHistory={veryNegativeHistory} />);

      const chartDataElement = screen.getByTestId('chart-data');
      const expectedData = veryNegativeHistory.map(step => ({
        iteration: step.iteration,
        value: step.logLikelihood
      }));

      expect(chartDataElement).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('should handle plateau in log-likelihood values', () => {
      const plateauHistory = [
        { ...mockGradientDescentHistory[0], logLikelihood: -70.0 },
        { ...mockGradientDescentHistory[1], logLikelihood: -69.5 },
        { ...mockGradientDescentHistory[2], logLikelihood: -69.49 },
        { ...mockGradientDescentHistory[3], logLikelihood: -69.48 } // Minimal improvement
      ];

      render(<GradientDescentControls {...defaultProps} gradientDescentHistory={plateauHistory} />);

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });
  });

  describe('Chart Updates with Gradient Descent Progress', () => {
    it('should update chart when new gradient descent steps are added', () => {
      const { rerender } = render(<GradientDescentControls {...defaultProps} />);

      const initialDataContent = screen.getByTestId('chart-data').textContent;

      const extendedHistory = [
        ...mockGradientDescentHistory,
        {
          iteration: 4,
          gaussian: {
            mu: { x: 1.01, y: 2.01 },
            sigma: { xx: 0.90, xy: 0.10, yy: 0.93 },
            logLikelihood: -66.2
          },
          logLikelihood: -66.2
        }
      ];

      rerender(<GradientDescentControls {...defaultProps} gradientDescentHistory={extendedHistory} />);

      const updatedDataContent = screen.getByTestId('chart-data').textContent;
      expect(updatedDataContent).not.toBe(initialDataContent);
    });

    it('should handle rapid convergence in few steps', () => {
      const rapidConvergenceHistory = [
        { ...mockGradientDescentHistory[0], logLikelihood: -100.0 },
        { ...mockGradientDescentHistory[1], logLikelihood: -50.0 }, // Large improvement
        { ...mockGradientDescentHistory[2], logLikelihood: -49.9 } // Quick convergence
      ];

      render(
        <GradientDescentControls 
          {...defaultProps} 
          gradientDescentHistory={rapidConvergenceHistory}
          converged={true}
        />
      );

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
      expect(screen.getByText('Converged')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle long gradient descent runs efficiently', () => {
      const longHistory = Array.from({ length: 200 }, (_, i) => ({
        iteration: i,
        gaussian: {
          mu: { x: 1.0 + i * 0.001, y: 2.0 + i * 0.001 },
          sigma: { xx: 1.0 - i * 0.001, xy: i * 0.0001, yy: 1.0 - i * 0.001 },
          logLikelihood: -85.2 + i * 0.1 // Gradually improving
        },
        logLikelihood: -85.2 + i * 0.1
      }));

      const startTime = performance.now();
      render(<GradientDescentControls {...defaultProps} gradientDescentHistory={longHistory} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(150); // Should render reasonably quickly
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should not recreate chart data when learning rate changes', () => {
      const { rerender } = render(<GradientDescentControls {...defaultProps} />);
      
      const initialDataContent = screen.getByTestId('chart-data').textContent;

      // Change learning rate (should not affect chart data)
      rerender(<GradientDescentControls {...defaultProps} learningRate={0.05} />);

      const updatedDataContent = screen.getByTestId('chart-data').textContent;
      expect(updatedDataContent).toBe(initialDataContent);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing log-likelihood values gracefully', () => {
      const incompleteHistory = [
        mockGradientDescentHistory[0],
        { ...mockGradientDescentHistory[1], logLikelihood: undefined } as any,
        mockGradientDescentHistory[2]
      ];

      expect(() => {
        render(<GradientDescentControls {...defaultProps} gradientDescentHistory={incompleteHistory} />);
      }).not.toThrow();

      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should handle malformed gaussian data in history', () => {
      const malformedHistory = [
        mockGradientDescentHistory[0],
        { ...mockGradientDescentHistory[1], gaussian: null } as any,
        mockGradientDescentHistory[2]
      ];

      expect(() => {
        render(<GradientDescentControls {...defaultProps} gradientDescentHistory={malformedHistory} />);
      }).not.toThrow();
    });

    it('should handle very small learning rates', () => {
      render(<GradientDescentControls {...defaultProps} learningRate={0.0001} />);

      expect(screen.getByText('Learning Rate: 0.0001')).toBeInTheDocument();
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });

    it('should handle maximum learning rates', () => {
      render(<GradientDescentControls {...defaultProps} learningRate={0.1} />);

      expect(screen.getByText('Learning Rate: 0.1000')).toBeInTheDocument();
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
    });
  });

  describe('Exit Mode Integration', () => {
    it('should show exit button when onExit is provided', () => {
      render(<GradientDescentControls {...defaultProps} />);

      expect(screen.getByText('Exit Mode')).toBeInTheDocument();
    });

    it('should call onExit when exit button is clicked', async () => {
      const user = userEvent.setup();
      render(<GradientDescentControls {...defaultProps} />);

      const exitButton = screen.getByText('Exit Mode');
      await user.click(exitButton);

      expect(defaultProps.onExit).toHaveBeenCalled();
    });

    it('should disable exit button when running', () => {
      render(<GradientDescentControls {...defaultProps} isRunning={true} />);

      const exitButton = screen.getByText('Exit Mode');
      expect(exitButton).toBeDisabled();
    });
  });
});