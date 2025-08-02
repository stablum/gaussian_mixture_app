/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { GaussianMixtureModel } from '@/lib/gmm';
import { generateSampleData, parseCSV } from '@/lib/csvParser';

// Mock chart component for consistent visual testing
jest.mock('@/components/GMMChart', () => {
  return function MockGMMChart({ data, components, responsibilities, onHover }: any) {
    return (
      <div data-testid="gmm-chart" className="w-full h-64 border">
        <div data-testid="chart-data-count">{data?.length || 0}</div>
        <div data-testid="chart-component-count">{components?.length || 0}</div>
        <div data-testid="chart-responsibilities-count">{responsibilities?.length || 0}</div>
        
        {/* Simulate chart elements */}
        {data && data.length > 0 && (
          <div data-testid="chart-data-points">
            {data.slice(0, 5).map((value: number, index: number) => (
              <div key={index} data-testid={`data-point-${index}`}>
                Point: {value.toFixed(2)}
              </div>
            ))}
          </div>
        )}
        
        {components && components.length > 0 && (
          <div data-testid="chart-components">
            {components.map((comp: any, index: number) => (
              <div key={index} data-testid={`component-${index}`}>
                μ: {comp.mu.toFixed(2)}, σ: {comp.sigma.toFixed(2)}, π: {comp.pi.toFixed(2)}
              </div>
            ))}
          </div>
        )}
        
        {/* Interactive hover area */}
        <div 
          data-testid="chart-hover-area"
          className="mt-4 p-2 bg-gray-100 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 10; // Simulate x-axis value
            onHover?.(x, {
              total: 0.1,
              componentProbs: components?.map(() => 0.05) || [],
              posteriors: components?.map(() => 0.5) || []
            });
          }}
          onMouseLeave={() => onHover?.(null)}
        >
          Hover for interaction
        </div>
      </div>
    );
  };
});

describe('Visual Regression and User Journey Tests', () => {
  describe('Complete User Workflows', () => {
    it('should complete the standard data analysis workflow', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Step 1: Wait for initial loading
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Step 2: Verify initial visual state
      expect(screen.getByText('Gaussian Mixture Model Explorer')).toBeInTheDocument();
      expect(screen.getByTestId('chart-component-count').textContent).toBe('2');
      expect(screen.getAllByText(/Component \d+/)).toHaveLength(2);
      
      // Step 3: Upload custom data
      const customData = Array.from({length: 80}, (_, i) => 
        i < 40 ? 2 + Math.random() : 8 + Math.random()
      ).join(',');
      const file = new File([customData], 'analysis.csv', { type: 'text/csv' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('80');
      });
      
      // Step 4: Adjust component count
      await user.selectOptions(screen.getByRole('combobox'), '3');
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-component-count').textContent).toBe('3');
        expect(screen.getAllByText(/Component \d+/)).toHaveLength(3);
      });
      
      // Step 5: Run EM algorithm step by step
      await user.click(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('2 /')).toBeInTheDocument();
      });
      
      // Step 6: Run to convergence
      await user.click(screen.getByText('Run to Convergence'));
      
      await waitFor(() => {
        expect(screen.getByText(/Running\.\.\.|Converged|Ready/)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Running...')).not.toBeInTheDocument();
      }, { timeout: 30000 });
      
      // Step 7: Verify final state
      const finalIterationText = screen.getByText(/\d+ \/ \d+/).textContent;
      const finalIteration = parseInt(finalIterationText?.split(' ')[0] || '0');
      expect(finalIteration).toBeGreaterThan(2);
      
      const finalLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      expect(finalLL).toMatch(/-?\d+\.\d{4}/);
    });

    it('should handle the comparative analysis workflow', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Record baseline state
      const baseline = {
        dataCount: screen.getByTestId('chart-data-count').textContent,
        componentCount: screen.getByTestId('chart-component-count').textContent,
        logLikelihood: screen.getByText(/Log-Likelihood:/).parentElement?.textContent
      };
      
      // Test with different component counts
      const componentResults: Array<{k: number, ll: string, iterations: number}> = [];
      
      for (let k = 1; k <= 4; k++) {
        await user.selectOptions(screen.getByRole('combobox'), k.toString());
        
        await waitFor(() => {
          expect(screen.getByTestId('chart-component-count').textContent).toBe(k.toString());
        });
        
        // Run to convergence for each k
        await user.click(screen.getByText('Run to Convergence'));
        
        await waitFor(() => {
          expect(screen.queryByText('Running...')).not.toBeInTheDocument();
        }, { timeout: 30000 });
        
        const ll = screen.getByText(/Log-Likelihood:/).parentElement?.textContent || '';
        const iterText = screen.getByText(/\d+ \/ \d+/).textContent;
        const iterations = parseInt(iterText?.split(' ')[0] || '0');
        
        componentResults.push({ k, ll, iterations });
        
        // Reset for next test
        await user.click(screen.getByText('Reset'));
        await waitFor(() => {
          expect(screen.getByText('0 /')).toBeInTheDocument();
        });
      }
      
      // Verify results make sense
      expect(componentResults).toHaveLength(4);
      componentResults.forEach(result => {
        expect(result.iterations).toBeGreaterThan(0);
        expect(result.ll).toMatch(/-?\d+\.\d{4}/);
      });
    });

    it('should handle the real-time exploration workflow', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-hover-area')).toBeInTheDocument();
      });
      
      // Interactive exploration
      const hoverArea = screen.getByTestId('chart-hover-area');
      
      // Simulate mouse movement across chart
      await act(async () => {
        user.hover(hoverArea);
      });
      
      // Should not crash during interaction
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
      
      await act(async () => {
        user.unhover(hoverArea);
      });
      
      // Step through algorithm while exploring
      await user.click(screen.getByText('Next →'));
      
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });
      
      // Interact with updated state
      await act(async () => {
        user.hover(hoverArea);
      });
      
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
      
      // Continue stepping
      await user.click(screen.getByText('Next →'));
      await user.click(screen.getByText('Next →'));
      
      // Final interaction
      await act(async () => {
        user.hover(hoverArea);
        user.unhover(hoverArea);
      });
      
      expect(screen.getByText(/Log-Likelihood:/)).toBeInTheDocument();
    });
  });

  describe('Visual State Consistency', () => {
    it('should maintain consistent visual states across operations', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Capture initial visual state
      const initialState = {
        title: screen.getByText('Gaussian Mixture Model Explorer'),
        controls: screen.getByText('EM Algorithm Controls'),
        parameters: screen.getByText('Parameters'),
        dataPoints: screen.getByTestId('chart-data-count').textContent,
        components: screen.getAllByText(/Component \d+/).length,
        buttons: {
          next: screen.getByText('Next →'),
          prev: screen.getByText('← Previous'),
          run: screen.getByText('Run to Convergence'),
          reset: screen.getByText('Reset')
        }
      };
      
      // Verify all elements are present and properly styled
      expect(initialState.title).toBeInTheDocument();
      expect(initialState.controls).toBeInTheDocument();
      expect(initialState.parameters).toBeInTheDocument();
      expect(initialState.dataPoints).toBe('100');
      expect(initialState.components).toBe(2);
      expect(initialState.buttons.prev).toBeDisabled();
      expect(initialState.buttons.next).not.toBeDisabled();
      
      // Perform operations and verify consistency
      await user.click(initialState.buttons.next);
      
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });
      
      // Visual elements should remain consistent
      expect(screen.getByText('Gaussian Mixture Model Explorer')).toBeInTheDocument();
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      expect(screen.getByText('Parameters')).toBeInTheDocument();
      expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      expect(screen.getAllByText(/Component \d+/)).toHaveLength(2);
      
      // Button states should update appropriately
      expect(screen.getByText('← Previous')).not.toBeDisabled();
      expect(screen.getByText('Next →')).not.toBeDisabled();
    });

    it('should handle responsive layout considerations', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
      });
      
      // Verify layout structure
      const chart = screen.getByTestId('gmm-chart');
      expect(chart).toHaveClass('w-full', 'h-64', 'border');
      
      // Test with different data sizes
      const smallData = '1,2,3,4,5';
      const file = new File([smallData], 'small.csv', { type: 'text/csv' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('5');
      });
      
      // Layout should remain consistent
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
      expect(screen.getByText('Parameters')).toBeInTheDocument();
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      
      // Upload larger dataset
      const largeData = Array.from({length: 500}, () => Math.random()).join(',');
      const largeFile = new File([largeData], 'large.csv', { type: 'text/csv' });
      
      await user.upload(fileInput, largeFile);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('500');
      });
      
      // Layout should still be consistent
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
      expect(screen.getByText('Parameters')).toBeInTheDocument();
    });

    it('should display parameter changes visually correctly', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(2);
      });
      
      // Capture initial parameter values
      const initialParams = screen.getAllByText(/\d+\.\d{3}/);
      expect(initialParams.length).toBeGreaterThan(0);
      
      // Step forward and verify parameter updates
      await user.click(screen.getByText('Next →'));
      
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });
      
      // Parameters should update visually
      const updatedParams = screen.getAllByText(/\d+\.\d{3}/);
      expect(updatedParams.length).toBe(initialParams.length);
      
      // Step forward again
      await user.click(screen.getByText('Next →'));
      
      await waitFor(() => {
        expect(screen.getByText('2 /')).toBeInTheDocument();
      });
      
      // Should show evolution of parameters
      expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(2);
      expect(screen.getAllByText(/σ \(Std\):/)).toHaveLength(2);
      expect(screen.getAllByText(/π \(Weight\):/)).toHaveLength(2);
    });
  });

  describe('Error State Visualization', () => {
    it('should handle and display error states gracefully', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Upload empty file
      const emptyFile = new File([''], 'empty.csv', { type: 'text/csv' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, emptyFile);
      
      // Should handle gracefully without breaking layout
      await waitFor(() => {
        expect(screen.getByText('Gaussian Mixture Model Explorer')).toBeInTheDocument();
      });
      
      // Upload invalid data
      const invalidFile = new File(['abc,def,ghi'], 'invalid.csv', { type: 'text/csv' });
      await user.upload(fileInput, invalidFile);
      
      // Should maintain visual consistency
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      expect(screen.getByText('Parameters')).toBeInTheDocument();
      
      // Try to run with potentially problematic state
      if (screen.getByText('Run to Convergence')) {
        await user.click(screen.getByText('Run to Convergence'));
        
        // Should either run successfully or handle gracefully
        await waitFor(() => {
          expect(screen.getByText(/Running\.\.\.|Converged|Ready/)).toBeInTheDocument();
        });
      }
    });

    it('should handle edge case parameter displays', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Upload data that might cause extreme parameters
      const extremeData = [
        ...Array(50).fill('0.000001'),
        ...Array(50).fill('999999')
      ].join(',');
      
      const extremeFile = new File([extremeData], 'extreme.csv', { type: 'text/csv' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, extremeFile);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Run algorithm
      await user.click(screen.getByText('Run to Convergence'));
      
      await waitFor(() => {
        expect(screen.queryByText('Running...')).not.toBeInTheDocument();
      }, { timeout: 30000 });
      
      // Should display parameters even if extreme
      expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(2);
      expect(screen.getAllByText(/σ \(Std\):/)).toHaveLength(2);
      expect(screen.getAllByText(/π \(Weight\):/)).toHaveLength(2);
      
      // Values should be displayed in some form
      const paramValues = screen.getAllByText(/\d+\.\d{3}/);
      expect(paramValues.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Visual Feedback', () => {
    it('should provide appropriate visual feedback during long operations', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Start long-running operation
      await user.click(screen.getByText('Run to Convergence'));
      
      // Should immediately show running state
      await waitFor(() => {
        expect(screen.getByText('Running...')).toBeInTheDocument();
      });
      
      // Should show progress or loading indication
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Running...')).not.toBeInTheDocument();
      }, { timeout: 30000 });
      
      // Should return to interactive state
      expect(screen.getByText(/Ready|Converged/)).toBeInTheDocument();
      expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
    });

    it('should handle stop operation gracefully', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-count').textContent).toBe('100');
      });
      
      // Start operation
      await user.click(screen.getByText('Run to Convergence'));
      
      await waitFor(() => {
        expect(screen.getByText('Running...')).toBeInTheDocument();
      });
      
      // Stop it quickly
      const stopButton = screen.getByText('Stop');
      await user.click(stopButton);
      
      // Should return to ready state
      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument();
        expect(screen.getByText('Run to Convergence')).toBeInTheDocument();
      });
      
      // Should maintain visual consistency
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      expect(screen.getByText('Parameters')).toBeInTheDocument();
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Usability', () => {
    it('should maintain proper tab order and keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      
      // Test tab navigation
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const select = screen.getByRole('combobox');
      const generateButton = screen.getByText('Generate Sample Data');
      const prevButton = screen.getByText('← Previous');
      const nextButton = screen.getByText('Next →');
      const runButton = screen.getByText('Run to Convergence');
      const resetButton = screen.getByText('Reset');
      
      // All interactive elements should be accessible
      expect(fileInput).toBeInTheDocument();
      expect(select).toBeInTheDocument();
      expect(generateButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(runButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
      
      // Test keyboard interaction with select
      await user.selectOptions(select, '3');
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-component-count').textContent).toBe('3');
      });
    });

    it('should provide clear visual feedback for user actions', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument();
      });
      
      // Button should provide hover/click feedback (tested through interaction)
      await user.click(screen.getByText('Next →'));
      
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });
      
      // Status should update
      expect(screen.getByText('Ready')).toBeInTheDocument();
      
      // Visual state should be clear
      expect(screen.getByText('← Previous')).not.toBeDisabled();
      expect(screen.getByText('Next →')).not.toBeDisabled();
      
      // Log-likelihood should be displayed clearly
      const llElement = screen.getByText(/Log-Likelihood:/);
      expect(llElement).toBeInTheDocument();
      expect(llElement.parentElement?.textContent).toMatch(/-?\d+\.\d{4}/);
    });
  });
});