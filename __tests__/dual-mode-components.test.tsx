import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ParameterPanel from '@/components/ParameterPanel';
import CurveVisibilityControls from '@/components/CurveVisibilityControls';
import AlgorithmModeSwitch from '@/components/AlgorithmModeSwitch';
import { AlgorithmMode } from '@/lib/algorithmTypes';

// Mock KaTeX to avoid import issues
jest.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => <span data-testid="inline-math">{math}</span>,
  BlockMath: ({ math }: { math: string }) => <div data-testid="block-math">{math}</div>,
}));

describe('Dual-Mode Components', () => {
  describe('ParameterPanel', () => {
    const mockComponents = [
      { mu: 2.5, sigma: 1.0, pi: 0.4 },
      { mu: 7.5, sigma: 1.5, pi: 0.6 }
    ];

    const mockClusters = [
      { centroid: 2.5, size: 15, points: [1, 2, 3, 4, 5] },
      { centroid: 7.5, size: 10, points: [6, 7, 8, 9, 10] }
    ];

    const defaultProps = {
      onComponentCountChange: jest.fn(),
      onParameterChange: jest.fn(),
      onCentroidChange: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render GMM mode correctly', () => {
      render(
        <ParameterPanel
          {...defaultProps}
          mode={AlgorithmMode.GMM}
          components={mockComponents}
        />
      );

      expect(screen.getByText('Component Parameters')).toBeInTheDocument();
      expect(screen.getByText('Components:')).toBeInTheDocument();
      expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(2);
      expect(screen.getAllByText(/σ \(Std\):/)).toHaveLength(2);
      expect(screen.getAllByText(/π \(Weight\):/)).toHaveLength(2);
    });

    it('should render K-means mode correctly', () => {
      render(
        <ParameterPanel
          {...defaultProps}
          mode={AlgorithmMode.KMEANS}
          clusters={mockClusters}
        />
      );

      expect(screen.getByText('Cluster Parameters')).toBeInTheDocument();
      expect(screen.getByText('Clusters:')).toBeInTheDocument();
      expect(screen.getAllByText(/Centroid:/)).toHaveLength(2);
      expect(screen.getAllByText(/Size:/)).toHaveLength(2);
      expect(screen.getAllByText(/Points:/)).toHaveLength(2);
    });

    it('should handle centroid changes in K-means mode', async () => {
      const user = userEvent.setup();
      render(
        <ParameterPanel
          {...defaultProps}
          mode={AlgorithmMode.KMEANS}
          clusters={mockClusters}
        />
      );

      const centroidInputs = screen.getAllByDisplayValue('2.500');
      const centroidInput = centroidInputs[0];
      await user.clear(centroidInput);
      await user.type(centroidInput, '3.0');

      expect(defaultProps.onCentroidChange).toHaveBeenCalledWith(0, 3);
    });

    it('should show hover info for GMM mode', () => {
      const hoverInfo = {
        x: 5.0,
        probabilities: {
          total: 0.8,
          componentProbs: [0.3, 0.5],
          posteriors: [0.375, 0.625]
        }
      };

      render(
        <ParameterPanel
          {...defaultProps}
          mode={AlgorithmMode.GMM}
          components={mockComponents}
          hoverInfo={hoverInfo}
        />
      );

      expect(screen.getByText('Query at x = 5.000')).toBeInTheDocument();
      expect(screen.getByText('Total Probability:')).toBeInTheDocument();
      expect(screen.getByText('0.8000')).toBeInTheDocument();
    });

    it('should show hover info for K-means mode', () => {
      const hoverInfo = {
        x: 5.0,
        clusterDistances: [2.5, 2.5],
        nearestCluster: 0
      };

      render(
        <ParameterPanel
          {...defaultProps}
          mode={AlgorithmMode.KMEANS}
          clusters={mockClusters}
          hoverInfo={hoverInfo}
        />
      );

      expect(screen.getByText('Query at x = 5.000')).toBeInTheDocument();
      expect(screen.getByText('Nearest Cluster:')).toBeInTheDocument();
      expect(screen.getAllByText('Cluster 1')[0]).toBeInTheDocument();
    });
  });

  describe('CurveVisibilityControls', () => {
    const defaultVisibility = {
      mixture: true,
      components: true,
      posteriors: true,
      dataPoints: true
    };

    const mockOnVisibilityChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render GMM mode controls', () => {
      render(
        <CurveVisibilityControls
          mode={AlgorithmMode.GMM}
          visibility={defaultVisibility}
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      expect(screen.getByText('Chart Display')).toBeInTheDocument();
      expect(screen.getByText('Mixture Distribution')).toBeInTheDocument();
      expect(screen.getByText('Component Densities')).toBeInTheDocument();
      expect(screen.getByText('Posteriors (scaled)')).toBeInTheDocument();
      expect(screen.getByText('Data Points')).toBeInTheDocument();
    });

    it('should render K-means mode controls', () => {
      render(
        <CurveVisibilityControls
          mode={AlgorithmMode.KMEANS}
          visibility={defaultVisibility}
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      expect(screen.getByText('Chart Display')).toBeInTheDocument();
      expect(screen.getByText('Cluster Centroids')).toBeInTheDocument();
      expect(screen.getByText('Cluster Boundaries')).toBeInTheDocument();
      expect(screen.getByText('Data Points (Colored)')).toBeInTheDocument();
      
      // K-means mode should not show posteriors option
      expect(screen.queryByText('Posteriors (scaled)')).not.toBeInTheDocument();
    });

    it('should handle visibility changes', async () => {
      const user = userEvent.setup();
      render(
        <CurveVisibilityControls
          mode={AlgorithmMode.GMM}
          visibility={defaultVisibility}
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      const mixtureCheckbox = screen.getByRole('checkbox', { name: /mixture distribution/i });
      await user.click(mixtureCheckbox);

      expect(mockOnVisibilityChange).toHaveBeenCalledWith('mixture', false);
    });

    it('should show appropriate teaching tips', () => {
      const { rerender } = render(
        <CurveVisibilityControls
          mode={AlgorithmMode.GMM}
          visibility={defaultVisibility}
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      expect(screen.getByText(/Hide curves to focus on specific aspects during explanations/)).toBeInTheDocument();

      rerender(
        <CurveVisibilityControls
          mode={AlgorithmMode.KMEANS}
          visibility={defaultVisibility}
          onVisibilityChange={mockOnVisibilityChange}
        />
      );

      expect(screen.getByText(/Hide elements to focus on specific aspects of clustering during explanations/)).toBeInTheDocument();
    });
  });

  describe('AlgorithmModeSwitch', () => {
    const mockOnModeChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render both algorithm options', () => {
      render(
        <AlgorithmModeSwitch
          currentMode={AlgorithmMode.GMM}
          onModeChange={mockOnModeChange}
        />
      );

      expect(screen.getByText('Algorithm Mode')).toBeInTheDocument();
      expect(screen.getByText('Gaussian Mixture Model')).toBeInTheDocument();
      expect(screen.getByText('K-means Clustering')).toBeInTheDocument();
      expect(screen.getByText('Current: Gaussian Mixture Model')).toBeInTheDocument();
    });

    it('should highlight current mode', () => {
      render(
        <AlgorithmModeSwitch
          currentMode={AlgorithmMode.KMEANS}
          onModeChange={mockOnModeChange}
        />
      );

      const kmeansButton = screen.getByRole('button', { name: /k-means clustering/i });
      expect(kmeansButton).toHaveClass('border-blue-500');
      expect(screen.getByText('Current: K-means Clustering')).toBeInTheDocument();
    });

    it('should handle mode changes', async () => {
      const user = userEvent.setup();
      render(
        <AlgorithmModeSwitch
          currentMode={AlgorithmMode.GMM}
          onModeChange={mockOnModeChange}
        />
      );

      const kmeansButton = screen.getByRole('button', { name: /k-means clustering/i });
      await user.click(kmeansButton);

      expect(mockOnModeChange).toHaveBeenCalledWith(AlgorithmMode.KMEANS);
    });

    it('should be collapsible', async () => {
      const user = userEvent.setup();
      render(
        <AlgorithmModeSwitch
          currentMode={AlgorithmMode.GMM}
          onModeChange={mockOnModeChange}
        />
      );

      const collapseButton = screen.getByTitle('Collapse panel');
      await user.click(collapseButton);

      // When collapsed, should show current mode
      expect(screen.getByText('Gaussian Mixture Model')).toBeInTheDocument();
      // But mode switch buttons should be hidden
      expect(screen.queryByRole('button', { name: /k-means clustering/i })).not.toBeInTheDocument();
    });
  });
});