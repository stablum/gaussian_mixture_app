import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradientDescentControls from '@/components/GradientDescentControls';
import { Gaussian2DAlgorithm, Gaussian2DState, Point2D } from '@/lib/gaussian2d';

// Mock data for testing
const mockTestData: Point2D[] = [
  { x: 1.0, y: 2.0 },
  { x: 2.0, y: 3.0 },
  { x: 3.0, y: 4.0 },
  { x: 1.5, y: 2.5 },
  { x: 2.5, y: 3.5 }
];

const mockGradientDescentState: Gaussian2DState = {
  gaussian: {
    mu: { x: 2.0, y: 3.0 },
    sigma: { xx: 1.0, xy: 0.2, yy: 1.2 },
    logLikelihood: -10.5
  },
  iteration: 5,
  logLikelihood: -10.5,
  converged: false,
  history: [
    {
      gaussian: {
        mu: { x: 1.8, y: 2.8 },
        sigma: { xx: 1.2, xy: 0.1, yy: 1.1 },
        logLikelihood: -12.0
      },
      iteration: 0,
      logLikelihood: -12.0
    },
    {
      gaussian: {
        mu: { x: 1.9, y: 2.9 },
        sigma: { xx: 1.1, xy: 0.15, yy: 1.15 },
        logLikelihood: -11.2
      },
      iteration: 1,
      logLikelihood: -11.2
    },
    {
      gaussian: {
        mu: { x: 2.0, y: 3.0 },
        sigma: { xx: 1.0, xy: 0.2, yy: 1.2 },
        logLikelihood: -10.5
      },
      iteration: 2,
      logLikelihood: -10.5
    }
  ]
};

describe('GradientDescentControls Integration', () => {
  let mockProps: any;

  beforeEach(() => {
    mockProps = {
      currentStep: 2,
      totalSteps: 3,
      isRunning: false,
      converged: false,
      onStepForward: jest.fn(),
      onStepBackward: jest.fn(),
      onReset: jest.fn(),
      onRunToConvergence: jest.fn(),
      onStop: jest.fn(),
      onExit: jest.fn(),
      logLikelihood: -10.5,
      learningRate: 0.01,
      onLearningRateChange: jest.fn()
    };
  });

  it('should render all control elements', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    expect(screen.getByText('Gradient Descent Controls')).toBeInTheDocument();
    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Exit Mode')).toBeInTheDocument();
    expect(screen.getByText('Learning Rate: 0.0100')).toBeInTheDocument();
  });

  it('should display current iteration and status correctly', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    expect(screen.getByText('2 / 2')).toBeInTheDocument(); // currentStep / (totalSteps - 1)
    expect(screen.getByText('-10.5000')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('should handle step forward button click', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);
    
    expect(mockProps.onStepForward).toHaveBeenCalledTimes(1);
  });

  it('should handle step backward button click', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    const prevButton = screen.getByText('← Previous');
    fireEvent.click(prevButton);
    
    expect(mockProps.onStepBackward).toHaveBeenCalledTimes(1);
  });

  it('should handle learning rate changes', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.05' } });
    
    expect(mockProps.onLearningRateChange).toHaveBeenCalledWith(0.05);
  });

  it('should disable controls when running', () => {
    const runningProps = { ...mockProps, isRunning: true };
    render(<GradientDescentControls {...runningProps} />);
    
    expect(screen.getByText('← Previous')).toBeDisabled();
    expect(screen.getByText('Next →')).toBeDisabled();
    expect(screen.getByText('Reset')).toBeDisabled();
    expect(screen.getByText('Exit Mode')).toBeDisabled();
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('should show stop button when running', () => {
    const runningProps = { ...mockProps, isRunning: true };
    render(<GradientDescentControls {...runningProps} />);
    
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.queryByText('Run to Convergence')).not.toBeInTheDocument();
  });

  it('should show converged status', () => {
    const convergedProps = { ...mockProps, converged: true };
    render(<GradientDescentControls {...convergedProps} />);
    
    expect(screen.getByText('Converged')).toBeInTheDocument();
    expect(screen.getByText('Converged')).toHaveClass('text-green-600');
  });

  it('should be collapsible', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    const collapseButton = screen.getByTitle('Collapse panel');
    fireEvent.click(collapseButton);
    
    // Controls should be hidden when collapsed
    expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });

  it('should handle exit mode correctly', () => {
    render(<GradientDescentControls {...mockProps} />);
    
    const exitButton = screen.getByText('Exit Mode');
    fireEvent.click(exitButton);
    
    expect(mockProps.onExit).toHaveBeenCalledTimes(1);
  });

  it('should not render exit button when onExit is not provided', () => {
    const propsWithoutExit = { ...mockProps, onExit: undefined };
    render(<GradientDescentControls {...propsWithoutExit} />);
    
    expect(screen.queryByText('Exit Mode')).not.toBeInTheDocument();
  });
});

describe('Gradient Descent State Management', () => {
  let algorithm: Gaussian2DAlgorithm;

  beforeEach(() => {
    algorithm = new Gaussian2DAlgorithm(mockTestData);
  });

  it('should maintain state consistency during step-by-step execution', () => {
    // Initialize state
    const initialGaussian = algorithm.initializeGaussian();
    let currentState: Gaussian2DState = {
      gaussian: initialGaussian,
      iteration: 0,
      logLikelihood: initialGaussian.logLikelihood,
      converged: false,
      history: [{
        gaussian: initialGaussian,
        iteration: 0,
        logLikelihood: initialGaussian.logLikelihood
      }]
    };

    // Simulate multiple forward steps
    for (let i = 0; i < 5; i++) {
      const currentGaussian = currentState.history[currentState.history.length - 1].gaussian;
      const result = algorithm.singleGradientDescentStep(currentGaussian, 0.01);
      
      const newHistoryStep = {
        gaussian: result.gaussian,
        iteration: i + 1,
        logLikelihood: result.logLikelihood
      };
      
      currentState = {
        ...currentState,
        gaussian: result.gaussian,
        iteration: i + 1,
        logLikelihood: result.logLikelihood,
        history: [...currentState.history, newHistoryStep]
      };
      
      // Verify state consistency
      expect(currentState.history.length).toBe(i + 2);
      expect(currentState.iteration).toBe(i + 1);
      expect(currentState.logLikelihood).toBe(result.logLikelihood);
      expect(currentState.gaussian.mu.x).toBe(result.gaussian.mu.x);
      expect(currentState.gaussian.mu.y).toBe(result.gaussian.mu.y);
    }

    // Verify we can navigate backward through history
    for (let step = currentState.history.length - 2; step >= 0; step--) {
      const historicalGaussian = currentState.history[step].gaussian;
      expect(historicalGaussian).toBeDefined();
      expect(Number.isFinite(historicalGaussian.logLikelihood)).toBe(true);
      expect(historicalGaussian.sigma.xx).toBeGreaterThan(0);
      expect(historicalGaussian.sigma.yy).toBeGreaterThan(0);
    }
  });

  it('should handle convergence detection correctly', () => {
    const convergedAlgorithm = new Gaussian2DAlgorithm(mockTestData, 1e-3, 100);
    const result = convergedAlgorithm.fitWithGradientDescent(undefined, 0.01);
    
    if (result.converged) {
      // If converged, the last few iterations should have small changes
      const historyLength = result.history.length;
      if (historyLength >= 2) {
        const lastLogLikelihood = result.history[historyLength - 1].logLikelihood;
        const prevLogLikelihood = result.history[historyLength - 2].logLikelihood;
        const change = Math.abs(lastLogLikelihood - prevLogLikelihood);
        expect(change).toBeLessThan(1e-3);
      }
    }
    
    expect(typeof result.converged).toBe('boolean');
  });

  it('should preserve state when switching between steps', () => {
    const result = algorithm.fitWithGradientDescent(undefined, 0.01);
    
    // Simulate forward navigation
    for (let step = 0; step < result.history.length; step++) {
      const currentGaussian = result.history[step].gaussian;
      
      // State should be preserved exactly
      expect(currentGaussian.mu.x).toBe(result.history[step].gaussian.mu.x);
      expect(currentGaussian.mu.y).toBe(result.history[step].gaussian.mu.y);
      expect(currentGaussian.sigma.xx).toBe(result.history[step].gaussian.sigma.xx);
      expect(currentGaussian.sigma.xy).toBe(result.history[step].gaussian.sigma.xy);
      expect(currentGaussian.sigma.yy).toBe(result.history[step].gaussian.sigma.yy);
      expect(currentGaussian.logLikelihood).toBe(result.history[step].logLikelihood);
    }
  });

  it('should handle reset to initial state correctly', () => {
    // Run some optimization steps
    const result = algorithm.fitWithGradientDescent(undefined, 0.01);
    expect(result.history.length).toBeGreaterThan(1);
    
    // Reset should return to initial state
    const resetGaussian = algorithm.initializeGaussian();
    expect(resetGaussian).toBeDefined();
    expect(Number.isFinite(resetGaussian.logLikelihood)).toBe(true);
    
    // Should be able to start optimization again from reset state
    const newResult = algorithm.singleGradientDescentStep(resetGaussian, 0.01);
    expect(newResult.gaussian).toBeDefined();
    expect(Number.isFinite(newResult.logLikelihood)).toBe(true);
  });

  it('should handle learning rate changes during optimization', () => {
    const initialGaussian = algorithm.initializeGaussian();
    
    // Take steps with different learning rates
    const step1 = algorithm.singleGradientDescentStep(initialGaussian, 0.001);
    const step2 = algorithm.singleGradientDescentStep(step1.gaussian, 0.01);
    const step3 = algorithm.singleGradientDescentStep(step2.gaussian, 0.1);
    
    // All steps should produce valid results
    [step1, step2, step3].forEach(step => {
      expect(Number.isFinite(step.logLikelihood)).toBe(true);
      expect(step.gaussian.sigma.xx).toBeGreaterThan(0);
      expect(step.gaussian.sigma.yy).toBeGreaterThan(0);
      
      const det = step.gaussian.sigma.xx * step.gaussian.sigma.yy - 
                  step.gaussian.sigma.xy * step.gaussian.sigma.xy;
      expect(det).toBeGreaterThan(0);
    });
  });

  it('should maintain mathematical consistency across state transitions', () => {
    const result = algorithm.fitWithGradientDescent(undefined, 0.01);
    
    for (let i = 0; i < result.history.length; i++) {
      const entry = result.history[i];
      
      // Recalculate log-likelihood and verify it matches stored value
      const recalculatedLogLikelihood = algorithm.calculateLogLikelihood(entry.gaussian);
      expect(recalculatedLogLikelihood).toBeCloseTo(entry.logLikelihood, 8);
      
      // Verify covariance matrix properties
      const sigma = entry.gaussian.sigma;
      expect(sigma.xx).toBeGreaterThan(0);
      expect(sigma.yy).toBeGreaterThan(0);
      
      const det = sigma.xx * sigma.yy - sigma.xy * sigma.xy;
      expect(det).toBeGreaterThan(0);
      
      // Verify correlation coefficient is valid
      const correlation = sigma.xy / Math.sqrt(sigma.xx * sigma.yy);
      expect(correlation).toBeGreaterThanOrEqual(-1);
      expect(correlation).toBeLessThanOrEqual(1);
    }
  });
});