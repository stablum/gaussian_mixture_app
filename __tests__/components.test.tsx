/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EMControls from '@/components/EMControls';
import FileUpload from '@/components/FileUpload';
import ParameterPanel from '@/components/ParameterPanel';
import { GaussianComponent } from '@/lib/gmm';

// Mock D3 chart component since it has complex DOM interactions
jest.mock('@/components/GMMChart', () => {
  return function MockGMMChart({ data, components, currentIteration }: any) {
    return (
      <div data-testid="gmm-chart">
        <div data-testid="chart-data-length">{data?.length || 0}</div>
        <div data-testid="chart-components-count">{components?.length || 0}</div>
        <div data-testid="chart-iteration">{currentIteration || 0}</div>
      </div>
    );
  };
});

describe('Component Integration Tests', () => {
  describe('EMControls', () => {
    const defaultProps = {
      currentStep: 0,
      totalSteps: 5,
      isRunning: false,
      converged: false,
      onStepForward: jest.fn(),
      onStepBackward: jest.fn(),
      onReset: jest.fn(),
      onRunToConvergence: jest.fn(),
      onStop: jest.fn(),
      logLikelihood: -45.678,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render all control buttons', () => {
      render(<EMControls {...defaultProps} />);
      
      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
      expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should display current iteration and log-likelihood', () => {
      render(<EMControls {...defaultProps} />);
      
      expect(screen.getByText('0 / 4')).toBeInTheDocument(); // currentStep / (totalSteps - 1)
      expect(screen.getByText('-45.6780')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('should handle button clicks', async () => {
      const user = userEvent.setup();
      render(<EMControls {...defaultProps} />);
      
      await user.click(screen.getByText('Next →'));
      expect(defaultProps.onStepForward).toHaveBeenCalledTimes(1);
      
      await user.click(screen.getByText('Reset'));
      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);

      await user.click(screen.getByText('Run to Convergence'));
      expect(defaultProps.onRunToConvergence).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons appropriately when running', () => {
      render(<EMControls {...defaultProps} isRunning={true} />);
      
      expect(screen.getByText('← Previous')).toBeDisabled();
      expect(screen.getByText('Next →')).toBeDisabled();
      expect(screen.getByText('Reset')).toBeDisabled();
      expect(screen.getByText('Stop')).not.toBeDisabled();
      expect(screen.getByText('Running...')).toBeInTheDocument();
    });

    it('should show converged state', () => {
      render(<EMControls {...defaultProps} converged={true} />);
      
      expect(screen.getByText('Converged')).toBeInTheDocument();
      expect(screen.getByText('Run to Convergence')).toBeDisabled();
    });

    it('should handle infinite log-likelihood values', () => {
      render(<EMControls {...defaultProps} logLikelihood={-Infinity} />);
      expect(screen.getByText('--')).toBeInTheDocument();
    });
  });

  describe('FileUpload', () => {
    const defaultProps = {
      onDataLoad: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render upload area and generate sample button', () => {
      render(<FileUpload {...defaultProps} />);
      
      expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
      expect(screen.getByText('Generate Sample Data')).toBeInTheDocument();
      expect(screen.getByText('Data Input')).toBeInTheDocument();
    });

    it('should generate sample data when button is clicked', async () => {
      const user = userEvent.setup();
      render(<FileUpload {...defaultProps} />);
      
      await user.click(screen.getByText('Generate Sample Data'));
      
      expect(defaultProps.onDataLoad).toHaveBeenCalledTimes(1);
      const [callData] = defaultProps.onDataLoad.mock.calls[0];
      expect(Array.isArray(callData)).toBe(true);
      expect(callData.length).toBe(100);
    });

    it('should handle file upload', async () => {
      const user = userEvent.setup();
      render(<FileUpload {...defaultProps} />);
      
      const csvContent = '1,2,3\n4,5,6\n7,8,9';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(defaultProps.onDataLoad).toHaveBeenCalledTimes(1);
      });
      
      const [callData] = defaultProps.onDataLoad.mock.calls[0];
      expect(callData).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should show feedback after file upload', async () => {
      const user = userEvent.setup();
      render(<FileUpload {...defaultProps} />);
      
      const csvContent = '1,2,3\n4,5,6';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(defaultProps.onDataLoad).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('ParameterPanel', () => {
    const sampleComponents: GaussianComponent[] = [
      { mu: 3.5, sigma: 1.2, pi: 0.6 },
      { mu: 8.1, sigma: 2.0, pi: 0.4 },
    ];

    const defaultProps = {
      components: sampleComponents,
      onComponentCountChange: jest.fn(),
      numComponents: 2,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render component parameters in GMM mode', () => {
      render(<ParameterPanel {...defaultProps} />);
      
      expect(screen.getByText('Component Parameters')).toBeInTheDocument();
      
      // Check if component parameters are displayed - they should be in the format from the actual component
      expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(2); // Two components
      expect(screen.getAllByText(/σ \(Std\):/)).toHaveLength(2);
      expect(screen.getAllByText(/π \(Weight\):/)).toHaveLength(2);
      expect(screen.getByText('3.500')).toBeInTheDocument();
      expect(screen.getByText('1.200')).toBeInTheDocument();
      expect(screen.getByText('0.600')).toBeInTheDocument();
    });

    it('should allow changing number of components', async () => {
      const user = userEvent.setup();
      render(<ParameterPanel {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '3');
      
      expect(defaultProps.onComponentCountChange).toHaveBeenCalledWith(3);
    });

    it('should handle empty components array', () => {
      render(<ParameterPanel {...defaultProps} components={[]} />);
      
      expect(screen.getByText('Component Parameters')).toBeInTheDocument();
      // Should not crash when no components are provided
    });

    it('should display correct component count options', () => {
      render(<ParameterPanel {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      const options = screen.getAllByRole('option');
      
      // Should have options for 1-5 components
      expect(options).toHaveLength(5);
      expect(options[0]).toHaveValue('1');
      expect(options[4]).toHaveValue('5');
    });
  });

  describe('Integration - Multiple Components', () => {
    it('should handle component interactions together', async () => {
      const user = userEvent.setup();
      const mockDataLoad = jest.fn();
      const mockStepForward = jest.fn();
      const mockComponentChange = jest.fn();

      render(
        <div>
          <FileUpload onDataLoad={mockDataLoad} />
          <ParameterPanel
            components={[]}
            onComponentCountChange={mockComponentChange}
            numComponents={2}
          />
        </div>
      );

      // Generate sample data
      await user.click(screen.getByText('Generate Sample Data'));
      expect(mockDataLoad).toHaveBeenCalledTimes(1);

      // Change number of components
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '3');
      expect(mockComponentChange).toHaveBeenCalledWith(3);
      
      // Test basic component interaction
      expect(mockDataLoad).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});