import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MathFormulasPanel from '@/components/MathFormulasPanel';

// Mock react-katex to avoid issues with DOM in tests
jest.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => <span data-testid="inline-math">{math}</span>,
  BlockMath: ({ math }: { math: string }) => <div data-testid="block-math">{math}</div>
}));

describe('MathFormulasPanel', () => {
  describe('Component Rendering', () => {
    it('should render with correct title and component count', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      expect(screen.getByText('Mathematical Formulation')).toBeInTheDocument();
      expect(screen.getByText('K = 2 components')).toBeInTheDocument();
    });

    it('should display all three tab sections', () => {
      render(<MathFormulasPanel componentCount={3} />);
      
      expect(screen.getByText('🎯')).toBeInTheDocument(); // Mixture Model icon
      expect(screen.getByText('🔄')).toBeInTheDocument(); // EM Algorithm icon  
      expect(screen.getByText('📊')).toBeInTheDocument(); // Posteriors icon
      
      expect(screen.getByText('Mixture Model')).toBeInTheDocument();
      expect(screen.getByText('EM Algorithm')).toBeInTheDocument();
      expect(screen.getByText('Posteriors')).toBeInTheDocument();
    });

    it('should start with mixture model section active', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      // Mixture Model tab should have active styling
      const mixtureFit = screen.getByText('Mixture Model').closest('button');
      expect(mixtureFit).toHaveClass('bg-white', 'text-blue-600');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between sections when tabs are clicked', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      // Initially shows mixture content
      expect(screen.getByText('Gaussian Mixture Model')).toBeInTheDocument();
      
      // Click EM Algorithm tab
      fireEvent.click(screen.getByText('EM Algorithm'));
      expect(screen.getByText('Log-Likelihood')).toBeInTheDocument();
      expect(screen.getByText('🔵 E-Step: Expectation')).toBeInTheDocument();
      expect(screen.getByText('🟢 M-Step: Maximization')).toBeInTheDocument();
      
      // Click Posteriors tab
      fireEvent.click(screen.getByText('Posteriors'));
      expect(screen.getByText('Posterior Probability')).toBeInTheDocument();
      expect(screen.getByText('Bayes\' Theorem Components')).toBeInTheDocument();
    });

    it('should apply correct styling to active tab', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      const emTab = screen.getByText('EM Algorithm').closest('button');
      const posteriorTab = screen.getByText('Posteriors').closest('button');
      
      // Initially EM tab should not be active
      expect(emTab).not.toHaveClass('bg-white', 'text-blue-600');
      
      // Click EM tab
      fireEvent.click(screen.getByText('EM Algorithm'));
      expect(emTab).toHaveClass('bg-white', 'text-blue-600');
      expect(posteriorTab).not.toHaveClass('bg-white', 'text-blue-600');
    });
  });

  describe('Mathematical Content', () => {
    it('should render mathematical formulas in mixture section', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      // Check for key mathematical expressions
      expect(screen.getByTestId('block-math')).toBeInTheDocument();
      
      // Look for specific formula content
      const blockMaths = screen.getAllByTestId('block-math');
      const mathTexts = blockMaths.map(el => el.textContent);
      
      expect(mathTexts.some(text => text?.includes('\\sum_{k=1}^{K}'))).toBe(true);
      expect(mathTexts.some(text => text?.includes('\\pi_k'))).toBe(true);
      expect(mathTexts.some(text => text?.includes('\\mathcal{N}'))).toBe(true);
    });

    it('should show EM algorithm formulas in EM section', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      fireEvent.click(screen.getByText('EM Algorithm'));
      
      // Check for E-step and M-step content
      expect(screen.getByText('🔵 E-Step: Expectation')).toBeInTheDocument();
      expect(screen.getByText('🟢 M-Step: Maximization')).toBeInTheDocument();
      
      // Check for specific formula sections
      expect(screen.getByText('Effective sample size:')).toBeInTheDocument();
      expect(screen.getByText('Update mixture weights:')).toBeInTheDocument();
      expect(screen.getByText('Update means:')).toBeInTheDocument();
      expect(screen.getByText('Update variances:')).toBeInTheDocument();
    });

    it('should display posterior probability formulas in posteriors section', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      fireEvent.click(screen.getByText('Posteriors'));
      
      expect(screen.getByText('Posterior Probability')).toBeInTheDocument();
      expect(screen.getByText('Bayes\' Theorem Components')).toBeInTheDocument();
      expect(screen.getByText('Properties')).toBeInTheDocument();
      
      // Check for Bayes theorem components
      expect(screen.getByText('Prior:')).toBeInTheDocument();
      expect(screen.getByText('Likelihood:')).toBeInTheDocument();
      expect(screen.getByText('Evidence:')).toBeInTheDocument();
    });
  });

  describe('Dynamic Component Count', () => {
    it('should display correct component count for different values', () => {
      const { rerender } = render(<MathFormulasPanel componentCount={1} />);
      expect(screen.getByText('K = 1 components')).toBeInTheDocument();
      
      rerender(<MathFormulasPanel componentCount={5} />);
      expect(screen.getByText('K = 5 components')).toBeInTheDocument();
    });
  });

  describe('Educational Content', () => {
    it('should include helpful explanatory text', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      expect(screen.getByText(/mixture weights.*means.*variances/)).toBeInTheDocument();
      expect(screen.getByText(/Interactive.*hover over the chart/)).toBeInTheDocument();
    });

    it('should provide context for mathematical symbols', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      fireEvent.click(screen.getByText('EM Algorithm'));
      
      expect(screen.getByText(/responsibility of component/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles and labels', () => {
      render(<MathFormulasPanel componentCount={2} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // Three tab buttons
      
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/Mixture Model|EM Algorithm|Posteriors/);
      });
    });
  });
});