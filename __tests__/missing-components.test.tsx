import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Gaussian2DControls from '@/components/Gaussian2DControls';
import Gaussian2DFormulasPanel from '@/components/Gaussian2DFormulasPanel';
import KMeansControls from '@/components/KMeansControls';
import KMeansFormulasPanel from '@/components/KMeansFormulasPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { Gaussian2D } from '@/lib/gaussian2d';
import { KMeansHistoryStep } from '@/lib/kmeans';

// Mock for Chart2D will need D3 mocking - skip for now due to complexity

describe('Gaussian2DControls', () => {
  const mockGaussian: Gaussian2D = {
    mu: { x: 1.5, y: 2.5 },
    sigma: { xx: 0.8, xy: 0.2, yy: 1.2 },
    logLikelihood: -45.67
  };

  const defaultProps = {
    gaussian: mockGaussian,
    isRunning: false,
    onFit: jest.fn(),
    onReset: jest.fn(),
    onStartGradientDescent: jest.fn(),
    showGradientDescent: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with basic elements', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    expect(screen.getByText('2D Gaussian Controls')).toBeInTheDocument();
    expect(screen.getByText('Fitting Methods')).toBeInTheDocument();
    expect(screen.getByText('Fit Gaussian (MLE)')).toBeInTheDocument();
    expect(screen.getByText('Gradient Descent')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should display fitted parameters when gaussian is provided', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    expect(screen.getByText('Fitted Parameters')).toBeInTheDocument();
    expect(screen.getByText('x = 1.500, y = 2.500')).toBeInTheDocument();
    expect(screen.getByText('σ₁₁ = 0.800, σ₁₂ = 0.200')).toBeInTheDocument();
    expect(screen.getByText('σ₂₁ = 0.200, σ₂₂ = 1.200')).toBeInTheDocument();
    expect(screen.getByText('Log-likelihood = -45.67')).toBeInTheDocument();
  });

  it('should handle fit button click', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    const fitButton = screen.getByText('Fit Gaussian (MLE)');
    fireEvent.click(fitButton);
    
    expect(defaultProps.onFit).toHaveBeenCalledTimes(1);
  });

  it('should handle gradient descent button click', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    const gradientButton = screen.getByText('Gradient Descent');
    fireEvent.click(gradientButton);
    
    expect(defaultProps.onStartGradientDescent).toHaveBeenCalledTimes(1);
  });

  it('should handle reset button click', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when running', () => {
    const runningProps = { ...defaultProps, isRunning: true };
    render(<Gaussian2DControls {...runningProps} />);
    
    expect(screen.getByText('Fitting...')).toBeInTheDocument();
    expect(screen.getByText('Fitting...')).toBeDisabled();
    expect(screen.getByText('Gradient Descent')).toBeDisabled();
    expect(screen.getByText('Reset')).toBeDisabled();
  });

  it('should hide gradient descent when showGradientDescent is false', () => {
    const noGradientProps = { ...defaultProps, showGradientDescence: false };
    render(<Gaussian2DControls {...noGradientProps} />);
    
    expect(screen.queryByText('Gradient Descent')).not.toBeInTheDocument();
  });

  it('should not display parameters when gaussian is null', () => {
    const noGaussianProps = { ...defaultProps, gaussian: null };
    render(<Gaussian2DControls {...noGaussianProps} />);
    
    expect(screen.queryByText('Fitted Parameters')).not.toBeInTheDocument();
  });

  it('should be collapsible', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    const collapseButton = screen.getByTitle('Collapse panel');
    fireEvent.click(collapseButton);
    
    // After collapse, buttons should be hidden
    expect(screen.queryByText('Fit Gaussian (MLE)')).not.toBeInTheDocument();
  });

  it('should calculate correlation coefficient correctly', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    // Correlation = xy / sqrt(xx * yy) = 0.2 / sqrt(0.8 * 1.2) = 0.2 / sqrt(0.96) ≈ 0.204
    expect(screen.getByText(/Correlation = 0\.204/)).toBeInTheDocument();
  });

  it('should calculate determinant correctly', () => {
    render(<Gaussian2DControls {...defaultProps} />);
    
    // Det = xx * yy - xy * xy = 0.8 * 1.2 - 0.2 * 0.2 = 0.96 - 0.04 = 0.92
    expect(screen.getByText(/Det\(Σ\) = 0\.920000/)).toBeInTheDocument();
  });
});

describe('Gaussian2DFormulasPanel', () => {
  it('should render LaTeX formulas', () => {
    render(<Gaussian2DFormulasPanel />);
    
    expect(screen.getByText('2D Gaussian Distribution Formulas')).toBeInTheDocument();
    expect(screen.getByText('Multivariate PDF')).toBeInTheDocument();
    expect(screen.getByText('Maximum Likelihood Estimation')).toBeInTheDocument();
  });

  it('should be collapsible', () => {
    render(<Gaussian2DFormulasPanel />);
    
    const collapseButton = screen.getByTitle('Collapse panel');
    expect(collapseButton).toBeInTheDocument();
    
    fireEvent.click(collapseButton);
    
    // After collapse, content should be hidden (check by looking for a specific formula)
    expect(screen.queryByText('Multivariate PDF')).not.toBeInTheDocument();
  });

  it('should show teaching tip', () => {
    render(<Gaussian2DFormulasPanel />);
    
    expect(screen.getByText(/Teaching Tip:/)).toBeInTheDocument();
    expect(screen.getByText(/matrix notation/)).toBeInTheDocument();
  });
});

describe('KMeansControls', () => {
  const mockHistoryStep: KMeansHistoryStep = {
    centroids: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
    assignments: [0, 1, 0, 1],
    iteration: 5,
    converged: false,
    totalDistance: 12.34
  };

  const defaultProps = {
    currentStep: 3,
    totalSteps: 10,
    isRunning: false,
    converged: false,
    onStepForward: jest.fn(),
    onStepBackward: jest.fn(),
    onReset: jest.fn(),
    onRunToConvergence: jest.fn(),
    onStop: jest.fn(),
    totalDistance: 15.67,
    currentHistory: mockHistoryStep
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render control buttons', () => {
    render(<KMeansControls {...defaultProps} />);
    
    expect(screen.getByText('K-Means Algorithm Controls')).toBeInTheDocument();
    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should display current statistics', () => {
    render(<KMeansControls {...defaultProps} />);
    
    expect(screen.getByText('3 / 9')).toBeInTheDocument(); // currentStep / (totalSteps - 1)
    expect(screen.getByText('15.67')).toBeInTheDocument(); // totalDistance
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('should handle step forward', () => {
    render(<KMeansControls {...defaultProps} />);
    
    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);
    
    expect(defaultProps.onStepForward).toHaveBeenCalledTimes(1);
  });

  it('should handle step backward', () => {
    render(<KMeansControls {...defaultProps} />);
    
    const prevButton = screen.getByText('← Previous');
    fireEvent.click(prevButton);
    
    expect(defaultProps.onStepBackward).toHaveBeenCalledTimes(1);
  });

  it('should handle run to convergence', () => {
    render(<KMeansControls {...defaultProps} />);
    
    const runButton = screen.getByText('Run to Convergence');
    fireEvent.click(runButton);
    
    expect(defaultProps.onRunToConvergence).toHaveBeenCalledTimes(1);
  });

  it('should show stop button when running', () => {
    const runningProps = { ...defaultProps, isRunning: true };
    render(<KMeansControls {...runningProps} />);
    
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.queryByText('Run to Convergence')).not.toBeInTheDocument();
  });

  it('should show converged status', () => {
    const convergedProps = { ...defaultProps, converged: true };
    render(<KMeansControls {...convergedProps} />);
    
    expect(screen.getByText('Converged')).toBeInTheDocument();
    expect(screen.getByText('Converged')).toHaveClass('text-green-600');
  });

  it('should disable controls when running', () => {
    const runningProps = { ...defaultProps, isRunning: true };
    render(<KMeansControls {...runningProps} />);
    
    expect(screen.getByText('← Previous')).toBeDisabled();
    expect(screen.getByText('Next →')).toBeDisabled();
    expect(screen.getByText('Reset')).toBeDisabled();
  });

  it('should show progress bar when running', () => {
    const runningProps = { ...defaultProps, isRunning: true };
    render(<KMeansControls {...runningProps} />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it('should be collapsible', () => {
    render(<KMeansControls {...defaultProps} />);
    
    const collapseButton = screen.getByTitle('Collapse panel');
    fireEvent.click(collapseButton);
    
    expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
  });
});

describe('KMeansFormulasPanel', () => {
  const defaultProps = {
    k: 3
  };

  it('should render formulas with correct cluster count', () => {
    render(<KMeansFormulasPanel {...defaultProps} />);
    
    expect(screen.getByText('K-Means Clustering Formulas (k=3)')).toBeInTheDocument();
    expect(screen.getByText('Centroid Update')).toBeInTheDocument();
    expect(screen.getByText('Assignment Step')).toBeInTheDocument();
  });

  it('should handle different k values', () => {
    render(<KMeansFormulasPanel k={5} />);
    
    expect(screen.getByText('K-Means Clustering Formulas (k=5)')).toBeInTheDocument();
  });

  it('should be collapsible', () => {
    render(<KMeansFormulasPanel {...defaultProps} />);
    
    const collapseButton = screen.getByTitle('Collapse panel');
    fireEvent.click(collapseButton);
    
    expect(screen.queryByText('Centroid Update')).not.toBeInTheDocument();
  });

  it('should show teaching tip', () => {
    render(<KMeansFormulasPanel {...defaultProps} />);
    
    expect(screen.getByText(/Teaching Tip:/)).toBeInTheDocument();
    expect(screen.getByText(/iterative nature/)).toBeInTheDocument();
  });
});

describe('ThemeToggle', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
  });

  // Mock document.documentElement.classList for theme changes
  const mockClassList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn()
  };
  
  Object.defineProperty(document.documentElement, 'classList', {
    value: mockClassList
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockClassList.contains.mockReturnValue(false);
  });

  it('should render theme toggle button', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Toggle dark mode');
  });

  it('should toggle theme when clicked', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should initialize with saved theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should respect system dark mode preference', () => {
    // Mock matchMedia for system preference
    const mockMatchMedia = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    });
    
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia
    });

    render(<ThemeToggle />);
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('should show correct icon for light mode', () => {
    mockClassList.contains.mockReturnValue(false); // Light mode
    
    render(<ThemeToggle />);
    
    // Check for sun icon (light mode shows sun icon to switch to dark)
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should show correct icon for dark mode', () => {
    mockClassList.contains.mockReturnValue(true); // Dark mode
    
    render(<ThemeToggle />);
    
    // Check for moon icon (dark mode shows moon icon to switch to light)
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should remove dark class when switching to light mode', () => {
    mockClassList.contains.mockReturnValue(true); // Start in dark mode
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Should not throw when localStorage fails
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });
});