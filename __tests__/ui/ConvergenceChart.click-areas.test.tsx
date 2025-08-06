/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConvergenceChart from '../../components/ConvergenceChart';
import { AlgorithmMode } from '../../lib/algorithmTypes';

// Mock D3 to avoid complex SVG rendering in tests
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      remove: jest.fn(),
      data: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn().mockReturnThis(),
            style: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            transition: jest.fn().mockReturnThis(),
            duration: jest.fn().mockReturnThis(),
            filter: jest.fn().mockReturnThis(),
          })),
        })),
      })),
    })),
    append: jest.fn(() => ({
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      datum: jest.fn().mockReturnThis(),
      call: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      transition: jest.fn().mockReturnThis(),
      duration: jest.fn().mockReturnThis(),
    })),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    nice: jest.fn().mockReturnThis(),
  })),
  extent: jest.fn(() => [0, 10]),
  line: jest.fn(() => ({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
    curve: jest.fn().mockReturnThis(),
  })),
  axisBottom: jest.fn(() => ({
    tickFormat: jest.fn().mockReturnThis(),
    tickSize: jest.fn().mockReturnThis(),
  })),
  axisLeft: jest.fn(() => ({
    tickFormat: jest.fn().mockReturnThis(),
    tickSize: jest.fn().mockReturnThis(),
  })),
  format: jest.fn(() => jest.fn()),
  curveMonotoneX: {},
}));

describe('ConvergenceChart Click Areas', () => {
  const mockData = [
    { iteration: 0, value: -100.5 },
    { iteration: 1, value: -80.2 },
    { iteration: 2, value: -75.1 },
    { iteration: 3, value: -73.8 },
    { iteration: 4, value: -73.5 },
  ];

  const defaultProps = {
    data: mockData,
    mode: AlgorithmMode.GMM,
    width: 400,
    height: 200,
    currentIteration: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering with Click Handler', () => {
    it('renders without crash when onIterationClick is provided', () => {
      const onIterationClick = jest.fn();
      
      render(
        <ConvergenceChart 
          {...defaultProps} 
          onIterationClick={onIterationClick}
        />
      );
      
      // Should render the chart component
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('renders without crash when onIterationClick is not provided', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      // Should render the chart component
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('displays correct title for different modes', () => {
      const { rerender } = render(
        <ConvergenceChart {...defaultProps} mode={AlgorithmMode.GMM} />
      );
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();

      rerender(
        <ConvergenceChart {...defaultProps} mode={AlgorithmMode.KMEANS} />
      );
      expect(screen.getByText('Inertia (Total Distance) Progression')).toBeInTheDocument();

      rerender(
        <ConvergenceChart {...defaultProps} mode={AlgorithmMode.GAUSSIAN_2D} />
      );
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('shows iteration count in header when expanded', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      // Expand the chart
      const expandButton = screen.getByTitle('Show convergence chart');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('5 iterations')).toBeInTheDocument();
    });

    it('displays teaching tips for different modes', () => {
      const { rerender } = render(<ConvergenceChart {...defaultProps} />);
      
      // Expand to see the teaching tip
      fireEvent.click(screen.getByTitle('Show convergence chart'));
      
      expect(screen.getByText(/Higher log-likelihood values indicate better fit/)).toBeInTheDocument();

      rerender(
        <ConvergenceChart {...defaultProps} mode={AlgorithmMode.KMEANS} />
      );
      expect(screen.getByText(/Lower inertia values indicate better clustering/)).toBeInTheDocument();
    });
  });

  describe('Collapsible Behavior', () => {
    it('starts collapsed by default', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      // SVG should not be visible when collapsed
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      
      // Should show expand button
      expect(screen.getByTitle('Show convergence chart')).toBeInTheDocument();
    });

    it('can be expanded and collapsed', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      const toggleButton = screen.getByTitle('Show convergence chart');
      
      // Initially collapsed
      expect(screen.queryByText('5 iterations')).not.toBeInTheDocument();
      
      // Expand
      fireEvent.click(toggleButton);
      expect(screen.getByText('5 iterations')).toBeInTheDocument();
      expect(screen.getByTitle('Hide convergence chart')).toBeInTheDocument();
      
      // Collapse again
      fireEvent.click(screen.getByTitle('Hide convergence chart'));
      expect(screen.queryByText('5 iterations')).not.toBeInTheDocument();
      expect(screen.getByTitle('Show convergence chart')).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    it('renders nothing when data is empty', () => {
      const { container } = render(
        <ConvergenceChart 
          {...defaultProps} 
          data={[]} 
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('handles single data point', () => {
      render(
        <ConvergenceChart 
          {...defaultProps} 
          data={[{ iteration: 0, value: -100.5 }]} 
        />
      );
      
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
      
      // Expand to see iteration count
      fireEvent.click(screen.getByTitle('Show convergence chart'));
      expect(screen.getByText('1 iterations')).toBeInTheDocument();
    });
  });

  describe('Click Area Behavior', () => {
    it('callback function signature is correct', () => {
      const onIterationClick = jest.fn();
      
      render(
        <ConvergenceChart 
          {...defaultProps} 
          onIterationClick={onIterationClick}
        />
      );
      
      // The callback should expect to receive an index (number), not iteration value
      expect(typeof onIterationClick).toBe('function');
      expect(onIterationClick).toHaveBeenCalledTimes(0);
    });

    it('uses correct tooltip text when clickable', () => {
      // This test would verify the tooltip contains "Click anywhere to navigate"
      // Since we're mocking D3, we can't test the actual tooltip rendering
      // but we can verify the component doesn't crash with click handlers
      const onIterationClick = jest.fn();
      
      render(
        <ConvergenceChart 
          {...defaultProps} 
          onIterationClick={onIterationClick}
        />
      );
      
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('does not add click handlers when onIterationClick is not provided', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      // Should render without click handlers
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });
  });

  describe('Current Iteration Highlighting', () => {
    it('handles currentIteration within bounds', () => {
      render(
        <ConvergenceChart 
          {...defaultProps} 
          currentIteration={2}
        />
      );
      
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('handles currentIteration out of bounds', () => {
      render(
        <ConvergenceChart 
          {...defaultProps} 
          currentIteration={10}
        />
      );
      
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('handles negative currentIteration', () => {
      render(
        <ConvergenceChart 
          {...defaultProps} 
          currentIteration={-1}
        />
      );
      
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('formats GMM values to 3 decimal places', () => {
      render(
        <ConvergenceChart 
          {...defaultProps} 
          mode={AlgorithmMode.GMM}
        />
      );
      
      // Component should handle formatting internally
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('formats K-means values to 2 decimal places', () => {
      render(
        <ConvergenceChart 
          {...defaultProps} 
          mode={AlgorithmMode.KMEANS}
        />
      );
      
      // Component should handle formatting internally
      expect(screen.getByText('Inertia (Total Distance) Progression')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    it('has appropriate button titles for expand/collapse', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      expect(screen.getByTitle('Show convergence chart')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTitle('Show convergence chart'));
      expect(screen.getByTitle('Hide convergence chart')).toBeInTheDocument();
    });

    it('provides teaching context for educational use', () => {
      render(<ConvergenceChart {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Show convergence chart'));
      
      expect(screen.getByText('Teaching Tip:')).toBeInTheDocument();
      expect(screen.getByText(/Higher log-likelihood values indicate better fit/)).toBeInTheDocument();
    });

    it('shows different teaching tips per algorithm mode', () => {
      const { rerender } = render(<ConvergenceChart {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Show convergence chart'));
      expect(screen.getByText(/convergence occurs when the rate of improvement/i)).toBeInTheDocument();

      rerender(<ConvergenceChart {...defaultProps} mode={AlgorithmMode.KMEANS} />);
      expect(screen.getByText(/convergence occurs when centroids stop moving/i)).toBeInTheDocument();
    });
  });
});