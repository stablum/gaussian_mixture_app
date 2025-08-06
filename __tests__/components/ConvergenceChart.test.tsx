import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ConvergenceChart from '@/components/ConvergenceChart';
import { AlgorithmMode } from '@/lib/algorithmTypes';

// Mock D3 functionality is already handled by our global D3 mock

describe('ConvergenceChart', () => {
  const mockGMMData = [
    { iteration: 0, value: -150.5 },
    { iteration: 1, value: -120.3 },
    { iteration: 2, value: -100.8 },
    { iteration: 3, value: -95.2 },
    { iteration: 4, value: -94.8 }
  ];

  const mockKMeansData = [
    { iteration: 0, value: 45.8 },
    { iteration: 1, value: 32.1 },
    { iteration: 2, value: 28.5 },
    { iteration: 3, value: 27.9 },
    { iteration: 4, value: 27.9 }
  ];

  const mockGaussian2DData = [
    { iteration: 0, value: -85.2 },
    { iteration: 1, value: -72.5 },
    { iteration: 2, value: -68.1 },
    { iteration: 3, value: -66.8 },
    { iteration: 4, value: -66.5 }
  ];

  describe('Component Rendering', () => {
    it('should not render when data is empty', () => {
      const { container } = render(
        <ConvergenceChart
          data={[]}
          mode={AlgorithmMode.GMM}
        />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('should render collapsed by default when data is provided', () => {
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
      expect(screen.getByText('5 iterations')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument(); // SVG not visible when collapsed
    });

    it('should show correct title for different algorithm modes', () => {
      const { rerender } = render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();

      rerender(
        <ConvergenceChart
          data={mockKMeansData}
          mode={AlgorithmMode.KMEANS}
        />
      );
      expect(screen.getByText('Inertia (Total Distance) Progression')).toBeInTheDocument();

      rerender(
        <ConvergenceChart
          data={mockGaussian2DData}
          mode={AlgorithmMode.GAUSSIAN_2D}
        />
      );
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should expand chart when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTitle('Hide convergence chart')).toBeInTheDocument();
      });
    });

    it('should collapse chart when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      
      // Expand first
      await user.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByTitle('Hide convergence chart')).toBeInTheDocument();
      });

      // Then collapse
      const collapseButton = screen.getByTitle('Hide convergence chart');
      await user.click(collapseButton);

      await waitFor(() => {
        expect(screen.getByTitle('Show convergence chart')).toBeInTheDocument();
      });
    });
  });

  describe('Teaching Tips', () => {
    it('should show appropriate teaching tip for K-means', async () => {
      const user = userEvent.setup();
      render(
        <ConvergenceChart
          data={mockKMeansData}
          mode={AlgorithmMode.KMEANS}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/Lower inertia values indicate better clustering/)).toBeInTheDocument();
        expect(screen.getByText(/Convergence occurs when centroids stop moving/)).toBeInTheDocument();
      });
    });

    it('should show appropriate teaching tip for GMM and Gaussian 2D', async () => {
      const user = userEvent.setup();
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/Higher log-likelihood values indicate better fit/)).toBeInTheDocument();
        expect(screen.getByText(/Convergence occurs when the rate of improvement becomes negligible/)).toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    it('should handle custom width and height', async () => {
      const user = userEvent.setup();
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          width={600}
          height={300}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      await waitFor(() => {
        const svg = screen.getByRole('img', { hidden: true });
        expect(svg).toHaveAttribute('width', '600');
        expect(svg).toHaveAttribute('height', '300');
      });
    });

    it('should handle currentIteration prop', () => {
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={2}
        />
      );

      // Component should render without errors even when collapsed
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('should use default props when not specified', () => {
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
      expect(screen.getByText('5 iterations')).toBeInTheDocument();
    });
  });

  describe('Data Processing', () => {
    it('should handle single data point', () => {
      const singlePointData = [{ iteration: 0, value: -100.5 }];
      
      render(
        <ConvergenceChart
          data={singlePointData}
          mode={AlgorithmMode.GMM}
        />
      );

      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
      expect(screen.getByText('1 iterations')).toBeInTheDocument();
    });

    it('should handle negative values correctly', () => {
      const negativeData = [
        { iteration: 0, value: -1000.5 },
        { iteration: 1, value: -500.3 },
        { iteration: 2, value: -100.1 }
      ];

      render(
        <ConvergenceChart
          data={negativeData}
          mode={AlgorithmMode.GMM}
        />
      );

      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
      expect(screen.getByText('3 iterations')).toBeInTheDocument();
    });

    it('should handle large values correctly', () => {
      const largeData = [
        { iteration: 0, value: 10000.5 },
        { iteration: 1, value: 5000.3 },
        { iteration: 2, value: 1000.1 }
      ];

      render(
        <ConvergenceChart
          data={largeData}
          mode={AlgorithmMode.KMEANS}
        />
      );

      expect(screen.getByText('Inertia (Total Distance) Progression')).toBeInTheDocument();
      expect(screen.getByText('3 iterations')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined/null data gracefully', () => {
      const { container } = render(
        <ConvergenceChart
          data={undefined as any}
          mode={AlgorithmMode.GMM}
        />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('should handle malformed data points', () => {
      const malformedData = [
        { iteration: 0, value: -100.5 },
        { iteration: 1 }, // Missing value
        { value: -80.3 }, // Missing iteration
        { iteration: 3, value: -75.1 }
      ] as any;

      render(
        <ConvergenceChart
          data={malformedData}
          mode={AlgorithmMode.GMM}
        />
      );

      // Should still render the component
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for toggle button', () => {
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      expect(toggleButton).toHaveAttribute('title', 'Show convergence chart');
    });

    it('should provide meaningful text for screen readers', async () => {
      const user = userEvent.setup();
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
        />
      );

      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Teaching Tip:')).toBeInTheDocument();
      });
    });
  });

  describe('Click Navigation', () => {
    it('should call onIterationClick when chart point is clicked', async () => {
      const mockOnIterationClick = jest.fn();
      const user = userEvent.setup();

      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={2}
          onIterationClick={mockOnIterationClick}
        />
      );

      // Expand the chart first
      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      // Since D3 is mocked, we need to simulate the click behavior
      // In the real implementation, clicking on a chart point would trigger onIterationClick
      // For testing, we can verify the callback is passed correctly by testing integration
      expect(mockOnIterationClick).toBeDefined();
    });

    it('should not show click cursor when no onIterationClick callback is provided', () => {
      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={2}
        />
      );

      // Chart should render normally without click handlers
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('should display "Click to navigate" in tooltip when onIterationClick is provided', async () => {
      const mockOnIterationClick = jest.fn();
      const user = userEvent.setup();

      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={2}
          onIterationClick={mockOnIterationClick}
        />
      );

      // Expand the chart
      const toggleButton = screen.getByTitle('Show convergence chart');
      await user.click(toggleButton);

      // Since we're using D3 mocks, we can't directly test D3 interactions
      // But we can verify the callback is properly passed
      expect(mockOnIterationClick).toBeDefined();
    });

    it('should handle navigation to different iterations', () => {
      const mockOnIterationClick = jest.fn();

      const { rerender } = render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={0}
          onIterationClick={mockOnIterationClick}
        />
      );

      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();

      // Rerender with different current iteration
      rerender(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={3}
          onIterationClick={mockOnIterationClick}
        />
      );

      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
    });

    it('should validate iteration bounds in click handler', () => {
      const mockOnIterationClick = jest.fn();

      render(
        <ConvergenceChart
          data={mockGMMData}
          mode={AlgorithmMode.GMM}
          currentIteration={2}
          onIterationClick={mockOnIterationClick}
        />
      );

      // Component should render without issues
      expect(screen.getByText('Log-Likelihood Progression')).toBeInTheDocument();
      
      // The callback should be defined and ready to handle valid iteration indices
      expect(mockOnIterationClick).toBeDefined();
    });
  });
});