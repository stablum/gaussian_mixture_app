/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlgorithmControlsBase from '../../components/ui/AlgorithmControlsBase';
import { AlgorithmMode } from '../../lib/algorithmTypes';
import { LogLikelihoodState } from '../../hooks/useLogLikelihoodUpdater';

// Mock ConvergenceChart component
jest.mock('../../components/ConvergenceChart', () => {
  return function MockConvergenceChart({ data, currentIteration, onIterationClick }: any) {
    return (
      <div data-testid="convergence-chart">
        <div>Current Iteration: {currentIteration}</div>
        <div>Data Points: {data.length}</div>
        {onIterationClick && (
          <button 
            onClick={() => onIterationClick(5)}
            data-testid="chart-navigation"
          >
            Navigate to Step 5
          </button>
        )}
      </div>
    );
  };
});

describe('AlgorithmControlsBase', () => {
  const mockProps = {
    title: 'Test Algorithm Controls',
    mode: AlgorithmMode.GMM,
    currentStep: 5,
    totalSteps: 10,
    isRunning: false,
    converged: false,
    onStepForward: jest.fn(),
    onStepBackward: jest.fn(),
    onReset: jest.fn(),
    onRunToConvergence: jest.fn(),
    onStop: jest.fn(),
    metricValue: -123.45,
    metricLabel: 'Log-Likelihood'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      expect(screen.getByText('Test Algorithm Controls')).toBeInTheDocument();
      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
      expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('displays metric value and label', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      expect(screen.getByText('Log-Likelihood:')).toBeInTheDocument();
      expect(screen.getByText('-123.45')).toBeInTheDocument();
    });

    it('displays current step information', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      expect(screen.getByText('Step:')).toBeInTheDocument();
      expect(screen.getByText('5 / 9')).toBeInTheDocument(); // totalSteps - 1 for 0-based indexing
    });

    it('displays status as Ready when not running and not converged', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });
  });

  describe('Button States and Interactions', () => {
    it('calls onStepForward when Next button is clicked', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      fireEvent.click(screen.getByText('Next →'));
      expect(mockProps.onStepForward).toHaveBeenCalledTimes(1);
    });

    it('calls onStepBackward when Previous button is clicked', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      fireEvent.click(screen.getByText('← Previous'));
      expect(mockProps.onStepBackward).toHaveBeenCalledTimes(1);
    });

    it('calls onReset when Reset button is clicked', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      fireEvent.click(screen.getByText('Reset'));
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('calls onRunToConvergence when Run to Convergence is clicked', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      fireEvent.click(screen.getByText('Run to Convergence'));
      expect(mockProps.onRunToConvergence).toHaveBeenCalledTimes(1);
    });

    it('disables Previous button when at step 0', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          currentStep={0} 
        />
      );
      
      const prevButton = screen.getByText('← Previous');
      expect(prevButton).toBeDisabled();
    });

    it('disables Next button when converged and at final step', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          currentStep={9}
          totalSteps={10}
          converged={true} 
        />
      );
      
      const nextButton = screen.getByText('Next →');
      expect(nextButton).toBeDisabled();
    });

    it('disables all buttons when running except Stop', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          isRunning={true} 
        />
      );
      
      expect(screen.getByText('← Previous')).toBeDisabled();
      expect(screen.getByText('Next →')).toBeDisabled();
      expect(screen.getByText('Reset')).toBeDisabled();
      expect(screen.getByText('Stop')).not.toBeDisabled();
    });
  });

  describe('Running State', () => {
    it('shows Stop button instead of Run to Convergence when running', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          isRunning={true} 
        />
      );
      
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.queryByText('Run to Convergence')).not.toBeInTheDocument();
    });

    it('calls onStop when Stop button is clicked', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          isRunning={true} 
        />
      );
      
      fireEvent.click(screen.getByText('Stop'));
      expect(mockProps.onStop).toHaveBeenCalledTimes(1);
    });

    it('shows progress bar when running', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          isRunning={true}
          currentStep={3}
          totalSteps={10} 
        />
      );
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Progress should be 30% (3/10)
      expect(progressBar.style.width).toBe('30%');
    });

    it('displays Running status when isRunning is true', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          isRunning={true} 
        />
      );
      
      expect(screen.getByText('Running...')).toBeInTheDocument();
    });
  });

  describe('Converged State', () => {
    it('displays Converged status when converged', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          converged={true} 
        />
      );
      
      expect(screen.getByText('Converged')).toBeInTheDocument();
    });

    it('disables Run to Convergence button when converged', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          converged={true} 
        />
      );
      
      expect(screen.getByText('Run to Convergence')).toBeDisabled();
    });
  });

  describe('Optional Features', () => {
    it('shows step navigation when onNavigateToStep is provided', () => {
      const onNavigateToStep = jest.fn();
      
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          onNavigateToStep={onNavigateToStep}
          totalSteps={5}
        />
      );
      
      // Should show step selector buttons
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('calls onNavigateToStep when step selector is clicked', () => {
      const onNavigateToStep = jest.fn();
      
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          onNavigateToStep={onNavigateToStep}
          totalSteps={5}
          currentStep={0}
        />
      );
      
      fireEvent.click(screen.getByText('3'));
      expect(onNavigateToStep).toHaveBeenCalledWith(2); // 0-based indexing
    });

    it('renders additional controls when provided', () => {
      const additionalControls = <div data-testid="additional-controls">Custom Controls</div>;
      
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          additionalControls={additionalControls}
        />
      );
      
      expect(screen.getByTestId('additional-controls')).toBeInTheDocument();
      expect(screen.getByText('Custom Controls')).toBeInTheDocument();
    });

    it('renders LogLikelihoodIndicator when logLikelihoodState provided', () => {
      const logLikelihoodState: LogLikelihoodState = {
        currentValue: -123.45,
        previousValue: -150.0,
        isImproving: true,
        changeRate: 0.15,
        changeDirection: 'increasing'
      };
      
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          logLikelihoodState={logLikelihoodState}
        />
      );
      
      // LogLikelihoodIndicator should render instead of plain value
      expect(screen.queryByText('-123.45')).not.toBeInTheDocument();
      // Should show indicator component (implementation details would be tested in LogLikelihoodIndicator tests)
    });
  });

  describe('Convergence Chart', () => {
    it('renders convergence chart when convergenceData is provided', () => {
      const convergenceData = [
        { iteration: 0, value: -200 },
        { iteration: 1, value: -180 },
        { iteration: 2, value: -160 },
        { iteration: 3, value: -150 },
        { iteration: 4, value: -145 }
      ];
      
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          convergenceData={convergenceData}
        />
      );
      
      expect(screen.getByTestId('convergence-chart')).toBeInTheDocument();
      expect(screen.getByText('Current Iteration: 5')).toBeInTheDocument();
      expect(screen.getByText('Data Points: 5')).toBeInTheDocument();
    });

    it('passes onNavigateToStep to convergence chart', () => {
      const onNavigateToStep = jest.fn();
      const convergenceData = [
        { iteration: 0, value: -200 },
        { iteration: 1, value: -180 }
      ];
      
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          convergenceData={convergenceData}
          onNavigateToStep={onNavigateToStep}
        />
      );
      
      fireEvent.click(screen.getByTestId('chart-navigation'));
      expect(onNavigateToStep).toHaveBeenCalledWith(5);
    });

    it('does not render chart when convergenceData is empty', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          convergenceData={[]}
        />
      );
      
      expect(screen.queryByTestId('convergence-chart')).not.toBeInTheDocument();
    });
  });

  describe('Metric Display', () => {
    it('handles different metric values', () => {
      const { rerender } = render(<AlgorithmControlsBase {...mockProps} />);
      
      // Test large negative values
      rerender(<AlgorithmControlsBase {...mockProps} metricValue={-1234.56789} />);
      expect(screen.getByText('-1234.57')).toBeInTheDocument();
      
      // Test small positive values
      rerender(<AlgorithmControlsBase {...mockProps} metricValue={0.12345} />);
      expect(screen.getByText('0.12')).toBeInTheDocument();
      
      // Test zero
      rerender(<AlgorithmControlsBase {...mockProps} metricValue={0} />);
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles infinity and NaN values', () => {
      const { rerender } = render(<AlgorithmControlsBase {...mockProps} />);
      
      // Test -Infinity
      rerender(<AlgorithmControlsBase {...mockProps} metricValue={-Infinity} />);
      expect(screen.getByText('--')).toBeInTheDocument();
      
      // Test NaN
      rerender(<AlgorithmControlsBase {...mockProps} metricValue={NaN} />);
      expect(screen.getByText('NaN')).toBeInTheDocument();
    });

    it('uses different metric labels correctly', () => {
      const { rerender } = render(<AlgorithmControlsBase {...mockProps} />);
      
      rerender(<AlgorithmControlsBase {...mockProps} metricLabel="Inertia (WCSS)" />);
      expect(screen.getByText('Inertia (WCSS):')).toBeInTheDocument();
      
      rerender(<AlgorithmControlsBase {...mockProps} metricLabel="Custom Metric" />);
      expect(screen.getByText('Custom Metric:')).toBeInTheDocument();
    });
  });

  describe('Collapsible Behavior', () => {
    it('is expanded by default', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      // Control buttons should be visible
      expect(screen.getByText('Next →')).toBeInTheDocument();
      expect(screen.getByText('← Previous')).toBeInTheDocument();
    });

    it('can be collapsed', () => {
      render(<AlgorithmControlsBase {...mockProps} />);
      
      // Collapse the panel
      fireEvent.click(screen.getByTitle('Collapse panel'));
      
      // Control content should be hidden
      expect(screen.queryByText('Next →')).not.toBeInTheDocument();
      expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
      
      // But title should still be visible
      expect(screen.getByText('Test Algorithm Controls')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          className="custom-controls-class"
        />
      );
      
      const panel = screen.getByText('Test Algorithm Controls').closest('.custom-controls-class');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero total steps gracefully', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          totalSteps={0}
          currentStep={0}
        />
      );
      
      expect(screen.getByText('0 / -1')).toBeInTheDocument();
      expect(screen.getByText('← Previous')).toBeDisabled();
      expect(screen.getByText('Next →')).toBeDisabled();
    });

    it('handles negative current step', () => {
      render(
        <AlgorithmControlsBase 
          {...mockProps} 
          currentStep={-1}
          totalSteps={5}
        />
      );
      
      expect(screen.getByText('-1 / 4')).toBeInTheDocument();
    });
  });
});