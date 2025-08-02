/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EMControls from '@/components/EMControls';
import FileUpload from '@/components/FileUpload';
import ParameterPanel from '@/components/ParameterPanel';
import { GaussianComponent } from '@/lib/gmm';

describe('State Lifecycle Tests', () => {
  describe('EMControls State Transitions', () => {
    const baseProps = {
      currentStep: 0,
      totalSteps: 1,
      isRunning: false,
      converged: false,
      onStepForward: jest.fn(),
      onStepBackward: jest.fn(),
      onReset: jest.fn(),
      onRunToConvergence: jest.fn(),
      onStop: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle undefined logLikelihood gracefully', () => {
      const { rerender } = render(<EMControls {...baseProps} logLikelihood={undefined as any} />);
      
      // Should not crash with undefined
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      
      // Should show some reasonable fallback
      const llText = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      expect(llText).toMatch(/Log-Likelihood:\s*(--|NaN|undefined)/);
    });

    it('should handle NaN logLikelihood gracefully', () => {
      render(<EMControls {...baseProps} logLikelihood={NaN} />);
      
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      const llText = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      expect(llText).toMatch(/Log-Likelihood:\s*NaN/);
    });

    it('should handle zero logLikelihood correctly', () => {
      render(<EMControls {...baseProps} logLikelihood={0} />);
      
      // Zero is a valid log-likelihood (though unusual), should show 0.0000
      expect(screen.getByText('0.0000')).toBeInTheDocument();
    });

    it('should handle very large negative logLikelihood', () => {
      render(<EMControls {...baseProps} logLikelihood={-999999} />);
      
      expect(screen.getByText('-999999.0000')).toBeInTheDocument();
    });

    it('should handle very small negative logLikelihood', () => {
      render(<EMControls {...baseProps} logLikelihood={-0.0001} />);
      
      expect(screen.getByText('-0.0001')).toBeInTheDocument();
    });

    it('should transition between states correctly', () => {
      const { rerender } = render(<EMControls {...baseProps} logLikelihood={-100} />);
      
      // Initial state
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
      
      // Running state
      rerender(<EMControls {...baseProps} logLikelihood={-90} isRunning={true} />);
      expect(screen.getByText('Running...')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeDisabled();
      
      // Converged state
      rerender(<EMControls {...baseProps} logLikelihood={-85} converged={true} />);
      expect(screen.getByText('Converged')).toBeInTheDocument();
      expect(screen.getByText('Run to Convergence')).toBeDisabled();
    });

    it('should handle totalSteps edge cases', () => {
      // Zero steps
      const { rerender } = render(<EMControls {...baseProps} totalSteps={0} />);
      expect(screen.getByText('0 / 0')).toBeInTheDocument();
      
      // One step  
      rerender(<EMControls {...baseProps} totalSteps={1} />);
      expect(screen.getByText('0 / 0')).toBeInTheDocument(); // totalSteps - 1
      
      // Many steps
      rerender(<EMControls {...baseProps} totalSteps={100} currentStep={50} />);
      expect(screen.getByText('50 / 99')).toBeInTheDocument();
    });
  });

  describe('FileUpload State Management', () => {
    const mockOnDataLoad = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle file upload state transitions', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      // Normal CSV
      const csvContent = '1,2,3,4,5';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
      });
    });

    it('should handle empty file gracefully', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      const emptyFile = new File([''], 'empty.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, emptyFile);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalledWith([]);
      });
    });

    it('should handle malformed CSV data', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      const malformedCSV = 'header\nabc,def\n1,2,invalid\n,,,\n3,4,5';
      const file = new File([malformedCSV], 'malformed.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
      });
    });

    it('should handle CSV with headers correctly', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      const csvWithHeaders = 'x,y,z\n1,2,3\n4,5,6\n7,8,9';
      const file = new File([csvWithHeaders], 'headers.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });
    });

    it('should handle very large files', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      // Generate large CSV
      const largeData = Array.from({length: 10000}, (_, i) => i.toString()).join(',');
      const file = new File([largeData], 'large.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalled();
        const [callData] = mockOnDataLoad.mock.calls[0];
        expect(callData).toHaveLength(10000);
      }, { timeout: 10000 });
    });

    it('should handle special numeric values', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      const specialValues = '1.5,-2.7,0,0.0001,-999999,1e-10,1e10,3.14159';
      const file = new File([specialValues], 'special.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalledWith([
          1.5, -2.7, 0, 0.0001, -999999, 1e-10, 1e10, 3.14159
        ]);
      });
    });

    it('should reject infinite and NaN values', async () => {
      const user = userEvent.setup();
      render(<FileUpload onDataLoad={mockOnDataLoad} />);
      
      const invalidValues = '1,2,Infinity,3,-Infinity,4,NaN,5';
      const file = new File([invalidValues], 'invalid.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnDataLoad).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
      });
    });
  });

  describe('ParameterPanel State Consistency', () => {
    const mockOnComponentChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle empty components array', () => {
      render(<ParameterPanel 
        components={[]} 
        onComponentCountChange={mockOnComponentChange}
        numComponents={2}
      />);
      
      expect(screen.getByText('Parameters')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      // Should not crash, might show empty state
      expect(screen.queryByText(/Component \d+/)).not.toBeInTheDocument();
    });

    it('should handle single component', () => {
      const singleComponent: GaussianComponent[] = [
        { mu: 5.0, sigma: 1.5, pi: 1.0 }
      ];
      
      render(<ParameterPanel 
        components={singleComponent} 
        onComponentCountChange={mockOnComponentChange}
        numComponents={1}
      />);
      
      expect(screen.getByText('Component 1')).toBeInTheDocument();
      expect(screen.getByText('5.000')).toBeInTheDocument();
      expect(screen.getByText('1.500')).toBeInTheDocument();
      expect(screen.getByText('1.000')).toBeInTheDocument();
    });

    it('should handle maximum components (5)', () => {
      const maxComponents: GaussianComponent[] = Array.from({length: 5}, (_, i) => ({
        mu: i * 2,
        sigma: 1,
        pi: 0.2
      }));
      
      render(<ParameterPanel 
        components={maxComponents} 
        onComponentCountChange={mockOnComponentChange}
        numComponents={5}
      />);
      
      expect(screen.getAllByText(/Component \d+/)).toHaveLength(5);
      expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(5);
    });

    it('should handle extreme parameter values', () => {
      const extremeComponents: GaussianComponent[] = [
        { mu: -999999, sigma: 0.0001, pi: 0.99 },
        { mu: 999999, sigma: 1000, pi: 0.01 }
      ];
      
      render(<ParameterPanel 
        components={extremeComponents} 
        onComponentCountChange={mockOnComponentChange}
        numComponents={2}
      />);
      
      expect(screen.getByText('-999999.000')).toBeInTheDocument();
      expect(screen.getByText('0.000')).toBeInTheDocument(); // Very small sigma
      expect(screen.getByText('0.990')).toBeInTheDocument();
      expect(screen.getByText('999999.000')).toBeInTheDocument();
      expect(screen.getByText('1000.000')).toBeInTheDocument();
      expect(screen.getByText('0.010')).toBeInTheDocument();
    });

    it('should handle NaN and infinite parameter values', () => {
      const invalidComponents: GaussianComponent[] = [
        { mu: NaN, sigma: Infinity, pi: -Infinity },
        { mu: 0, sigma: 0, pi: NaN }
      ];
      
      render(<ParameterPanel 
        components={invalidComponents} 
        onComponentCountChange={mockOnComponentChange}
        numComponents={2}
      />);
      
      // Should not crash, should display the invalid values somehow
      expect(screen.getByText('Parameters')).toBeInTheDocument();
    });

    it('should handle component count changes consistently', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ParameterPanel 
        components={[]} 
        onComponentCountChange={mockOnComponentChange}
        numComponents={2}
      />);
      
      const select = screen.getByRole('combobox');
      
      // Change to each valid option
      for (let i = 1; i <= 5; i++) {
        await user.selectOptions(select, i.toString());
        expect(mockOnComponentChange).toHaveBeenCalledWith(i);
        
        // Re-render with new count
        rerender(<ParameterPanel 
          components={Array.from({length: i}, (_, j) => ({
            mu: j, sigma: 1, pi: 1/i
          }))} 
          onComponentCountChange={mockOnComponentChange}
          numComponents={i}
        />);
        
        expect(screen.getAllByText(/Component \d+/)).toHaveLength(i);
      }
    });
  });

  describe('Cross-Component State Consistency', () => {
    it('should maintain state consistency when switching between views', async () => {
      const user = userEvent.setup();
      
      const mockDataLoad = jest.fn();
      const mockComponentChange = jest.fn();
      const mockStepForward = jest.fn();

      render(
        <div>
          <FileUpload onDataLoad={mockDataLoad} />
          <ParameterPanel
            components={[
              { mu: 1, sigma: 1, pi: 0.5 },
              { mu: 5, sigma: 1, pi: 0.5 }
            ]}
            onComponentCountChange={mockComponentChange}
            numComponents={2}
          />
          <EMControls
            currentStep={0}
            totalSteps={5}
            isRunning={false}
            converged={false}
            onStepForward={mockStepForward}
            onStepBackward={jest.fn()}
            onReset={jest.fn()}
            onRunToConvergence={jest.fn()}
            onStop={jest.fn()}
            logLikelihood={-50.123}
          />
        </div>
      );

      // Initial state
      expect(screen.getByText('-50.1230')).toBeInTheDocument();
      expect(screen.getAllByText(/Component \d+/)).toHaveLength(2);
      expect(screen.getByText('0 / 4')).toBeInTheDocument();

      // Generate sample data
      await user.click(screen.getByText('Generate Sample Data'));
      expect(mockDataLoad).toHaveBeenCalled();

      // Change component count
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '3');
      expect(mockComponentChange).toHaveBeenCalledWith(3);

      // Try EM step
      await user.click(screen.getByText('Next →'));
      expect(mockStepForward).toHaveBeenCalled();
    });

    it('should handle rapid state changes without inconsistency', async () => {
      const user = userEvent.setup();
      
      const mockOnChange = jest.fn();
      
      render(
        <ParameterPanel
          components={[{ mu: 1, sigma: 1, pi: 1 }]}
          onComponentCountChange={mockOnChange}
          numComponents={1}
        />
      );

      const select = screen.getByRole('combobox');
      
      // Rapid changes
      await user.selectOptions(select, '2');
      await user.selectOptions(select, '3');
      await user.selectOptions(select, '1');
      await user.selectOptions(select, '5');
      
      expect(mockOnChange).toHaveBeenCalledTimes(4);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 2);
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 3);
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 1);
      expect(mockOnChange).toHaveBeenNthCalledWith(4, 5);
    });
  });
});