/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

// Mock the chart component to avoid D3/SVG issues in tests
jest.mock('@/components/GMMChart', () => {
  return function MockGMMChart({ data, components, onHover }: any) {
    return (
      <div data-testid="gmm-chart">
        <div data-testid="chart-data-points">{data?.length || 0}</div>
        <div data-testid="chart-components">{components?.length || 0}</div>
        {data && data.length > 0 && (
          <div 
            data-testid="chart-interactive-area"
            onMouseMove={() => onHover?.(5, { total: 0.1, componentProbs: [0.06, 0.04], posteriors: [0.6, 0.4] })}
            onMouseLeave={() => onHover?.(null)}
          >
            Interactive Chart Area
          </div>
        )}
      </div>
    );
  };
});

describe('Full App Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('App Initialization', () => {
    it('should initialize with proper log-likelihood from sample data', async () => {
      render(<Home />);
      
      // Wait for initialization to complete
      await waitFor(() => {
        const logLikelihoodElement = screen.getByText(/Log-Likelihood:/);
        expect(logLikelihoodElement).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should not show placeholder values
      expect(screen.queryByText('--')).not.toBeInTheDocument();
      expect(screen.queryByText('0.0000')).not.toBeInTheDocument();
      
      // Should show a meaningful negative log-likelihood value
      await waitFor(() => {
        const llText = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
        const llMatch = llText?.match(/-?\d+\.\d{4}/);
        expect(llMatch).toBeTruthy();
        
        if (llMatch) {
          const llValue = parseFloat(llMatch[0]);
          expect(llValue).toBeLessThan(0); // Should be negative
          expect(llValue).toBeGreaterThan(-1000); // But not absurdly negative
          expect(llValue).toBeFinite(); // Should be a real number
        }
      });
    });

    it('should initialize with valid components and data', async () => {
      render(<Home />);
      
      await waitFor(() => {
        // Should have chart with data
        const chartDataPoints = screen.getByTestId('chart-data-points');
        expect(chartDataPoints.textContent).toBe('100'); // Sample data size
        
        // Should have 2 components by default
        const chartComponents = screen.getByTestId('chart-components');  
        expect(chartComponents.textContent).toBe('2');
      });

      // Should show parameters for both components
      expect(screen.getAllByText(/Component \d+/)).toHaveLength(2);
      expect(screen.getAllByText(/μ \(Mean\):/)).toHaveLength(2);
      expect(screen.getAllByText(/σ \(Std\):/)).toHaveLength(2);
      expect(screen.getAllByText(/π \(Weight\):/)).toHaveLength(2);
    });

    it('should handle empty initial state gracefully', () => {
      render(<Home />);
      
      // Initial render before useEffect should show placeholder or loading state
      // At minimum, should not crash
      expect(screen.getByText('Gaussian Mixture Model Explorer')).toBeInTheDocument();
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
    });
  });

  describe('State Lifecycle', () => {
    it('should properly transition from loading to initialized state', async () => {
      render(<Home />);
      
      // Initially might show placeholder
      const initialLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      
      // After initialization, should show real values
      await waitFor(() => {
        const currentLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
        expect(currentLL).not.toBe(initialLL);
        expect(currentLL).toMatch(/-?\d+\.\d{4}/);
      }, { timeout: 5000 });
    });

    it('should maintain consistency across re-renders', async () => {
      const { rerender } = render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      const firstLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      
      // Re-render shouldn't change the initialized state
      rerender(<Home />);
      
      await waitFor(() => {
        const secondLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
        expect(secondLL).toBe(firstLL);
      });
    });
  });

  describe('User Workflow Integration', () => {
    it('should complete full EM algorithm workflow', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Initial state
      expect(screen.getByText('0 /')).toBeInTheDocument();
      
      // Step forward multiple times
      await user.click(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next →'));  
      await waitFor(() => {
        expect(screen.getByText('2 /')).toBeInTheDocument();
      });

      // Log-likelihood should change (improve or at least change)
      const step0LL = await waitFor(() => {
        user.click(screen.getByText('← Previous'));
        return screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      });

      await user.click(screen.getByText('Next →'));
      const step1LL = await waitFor(() => {
        return screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      });

      expect(step1LL).not.toBe(step0LL);
    });

    it('should handle run to convergence workflow', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      const initialLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      
      // Start convergence run
      await user.click(screen.getByText('Run to Convergence'));
      
      // Should show running state
      await waitFor(() => {
        expect(screen.getByText('Running...')).toBeInTheDocument();
      });

      // Should eventually converge or reach max iterations
      await waitFor(() => {
        expect(screen.queryByText('Running...')).not.toBeInTheDocument();
        expect(screen.getByText(/Ready|Converged/)).toBeInTheDocument();
      }, { timeout: 30000 });

      // Final log-likelihood should be different (hopefully better)
      const finalLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      expect(finalLL).not.toBe(initialLL);
      
      // Should have run multiple iterations
      const iterationText = screen.getByText(/\d+ \/ \d+/).textContent;
      const currentIteration = parseInt(iterationText?.split(' ')[0] || '0');
      expect(currentIteration).toBeGreaterThan(0);
    });

    it('should handle data upload workflow', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Wait for initial state
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Upload new data
      const csvContent = Array.from({length: 50}, (_, i) => i < 25 ? (1 + Math.random()).toString() : (10 + Math.random()).toString()).join(',');
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      // Should update data points
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('50');
      });

      // Should reset to iteration 0
      expect(screen.getByText('0 /')).toBeInTheDocument();
      
      // Should show new log-likelihood
      const newLL = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      expect(newLL).toMatch(/-?\d+\.\d{4}/);
    });

    it('should handle component count changes', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-components').textContent).toBe('2');
      });

      // Change to 3 components
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '3');
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-components').textContent).toBe('3');
      });

      // Should show 3 component panels
      expect(screen.getAllByText(/Component \d+/)).toHaveLength(3);
      
      // Should reset to iteration 0
      expect(screen.getByText('0 /')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed CSV data gracefully', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Upload malformed data
      const malformedCSV = 'abc,def,ghi\n1,invalid,3\n,,,\n4,5,6';
      const file = new File([malformedCSV], 'bad.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      // Should handle gracefully - either reject or clean the data
      await waitFor(() => {
        const dataPoints = screen.getByTestId('chart-data-points').textContent;
        expect(parseInt(dataPoints)).toBeGreaterThan(0); // Should have some valid data
      });
    });

    it('should handle very small datasets', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Upload minimal data
      const minimalCSV = '1,2';
      const file = new File([minimalCSV], 'minimal.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      // Should handle gracefully
      await waitFor(() => {
        const dataPoints = screen.getByTestId('chart-data-points').textContent;
        expect(parseInt(dataPoints)).toBe(2);
      });

      // App should still function
      expect(screen.getByText('EM Algorithm Controls')).toBeInTheDocument();
      const llText = screen.getByText(/Log-Likelihood:/).parentElement?.textContent;
      expect(llText).toMatch(/Log-Likelihood:\s*(-?\d+\.\d{4}|--)/);
    });

    it('should handle extreme parameter values', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Upload data that might cause numerical issues
      const extremeData = Array.from({length: 100}, (_, i) => 
        i < 50 ? '0.0001' : '999999'
      ).join(',');
      const file = new File([extremeData], 'extreme.csv', { type: 'text/csv' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Should handle without crashing
      const llElement = screen.getByText(/Log-Likelihood:/).parentElement;
      expect(llElement).toBeInTheDocument();
      
      // Try to run EM - shouldn't crash
      await user.click(screen.getByText('Next →'));
      
      await waitFor(() => {
        expect(screen.getByText('1 /')).toBeInTheDocument();
      });
    });

    it('should handle chart interactions without errors', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-interactive-area')).toBeInTheDocument();
      });

      // Interact with chart
      const chartArea = screen.getByTestId('chart-interactive-area');
      
      await act(async () => {
        user.hover(chartArea);
      });
      
      // Should not crash and might show hover information
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
      
      await act(async () => {
        user.unhover(chartArea);
      });
      
      // Should still be functional
      expect(screen.getByTestId('gmm-chart')).toBeInTheDocument();
    });
  });

  describe('Performance and Stability', () => {
    it('should handle rapid user interactions without breaking', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Rapid interactions
      const nextButton = screen.getByText('Next →');
      const prevButton = screen.getByText('← Previous');
      
      // Click multiple times rapidly
      for (let i = 0; i < 5; i++) {
        await user.click(nextButton);
        await user.click(prevButton);
      }
      
      // Should still be functional
      expect(screen.getByText(/Log-Likelihood:/)).toBeInTheDocument();
      expect(screen.getByText(/\d+ \/ \d+/)).toBeInTheDocument();
    });

    it('should maintain state consistency during async operations', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-data-points').textContent).toBe('100');
      });

      // Start convergence run
      await user.click(screen.getByText('Run to Convergence'));
      
      // Immediately try to interact (should be disabled)
      const nextButton = screen.getByText('Next →');
      expect(nextButton).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Running...')).not.toBeInTheDocument();
      }, { timeout: 30000 });
      
      // Should be functional again
      expect(nextButton).not.toBeDisabled();
    });
  });
});