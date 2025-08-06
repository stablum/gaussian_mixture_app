/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabbedFormulaPanel from '../../components/ui/TabbedFormulaPanel';
import type { FormulaSection } from '../../components/ui/TabbedFormulaPanel';

// Mock KaTeX
jest.mock('katex/dist/katex.min.css', () => ({}));

describe('TabbedFormulaPanel', () => {
  const mockSections: FormulaSection[] = [
    {
      id: 'section1',
      label: 'Section 1',
      icon: '🔥',
      content: <div data-testid="section1-content">Section 1 Content</div>
    },
    {
      id: 'section2',
      label: 'Section 2',
      icon: '⚡',
      content: <div data-testid="section2-content">Section 2 Content</div>
    },
    {
      id: 'section3',
      label: 'Section 3',
      icon: '🚀',
      content: <div data-testid="section3-content">Section 3 Content</div>
    }
  ];

  const defaultProps = {
    title: 'Test Formula Panel',
    sections: mockSections
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      expect(screen.getByText('Test Formula Panel')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          subtitle="Test Subtitle" 
        />
      );
      
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          footer={<div data-testid="footer">Footer Content</div>} 
        />
      );
      
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('displays first section by default', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('section2-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('section3-content')).not.toBeInTheDocument();
    });

    it('displays specified default section', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          defaultSection="section2" 
        />
      );
      
      expect(screen.queryByTestId('section1-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('section2-content')).toBeInTheDocument();
      expect(screen.queryByTestId('section3-content')).not.toBeInTheDocument();
    });
  });

  describe('Tab Styles', () => {
    it('renders pills style tabs by default', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      // Pills style uses specific background classes
      const tabContainer = screen.getByText('Section 1').closest('.bg-gray-100');
      expect(tabContainer).toBeInTheDocument();
    });

    it('renders underline style tabs when specified', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          tabStyle="underline" 
        />
      );
      
      // Underline style uses border-bottom classes
      const tab = screen.getByText('Section 1');
      expect(tab.className).toContain('border-b-2');
    });

    it('displays icons in tabs', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches content when tab is clicked', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      // Initially shows section 1
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('section2-content')).not.toBeInTheDocument();
      
      // Click section 2 tab
      fireEvent.click(screen.getByText('Section 2'));
      
      // Now shows section 2
      expect(screen.queryByTestId('section1-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('section2-content')).toBeInTheDocument();
    });

    it('applies active styles to current tab (pills style)', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      const section1Tab = screen.getByText('Section 1').closest('button');
      const section2Tab = screen.getByText('Section 2').closest('button');
      
      // Section 1 should be active initially
      expect(section1Tab?.className).toContain('bg-white');
      expect(section1Tab?.className).toContain('text-blue-600');
      expect(section2Tab?.className).toContain('text-gray-600');
      
      // Click section 2
      fireEvent.click(screen.getByText('Section 2'));
      
      // Section 2 should now be active
      expect(section2Tab?.className).toContain('bg-white');
      expect(section2Tab?.className).toContain('text-blue-600');
      expect(section1Tab?.className).toContain('text-gray-600');
    });

    it('applies active styles to current tab (underline style)', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          tabStyle="underline" 
        />
      );
      
      const section1Tab = screen.getByText('Section 1').closest('button');
      const section2Tab = screen.getByText('Section 2').closest('button');
      
      // Section 1 should be active initially
      expect(section1Tab?.className).toContain('border-blue-500');
      expect(section1Tab?.className).toContain('text-blue-600');
      expect(section2Tab?.className).toContain('border-transparent');
      expect(section2Tab?.className).toContain('text-gray-500');
      
      // Click section 2
      fireEvent.click(screen.getByText('Section 2'));
      
      // Section 2 should now be active
      expect(section2Tab?.className).toContain('border-blue-500');
      expect(section2Tab?.className).toContain('text-blue-600');
      expect(section1Tab?.className).toContain('border-transparent');
      expect(section1Tab?.className).toContain('text-gray-500');
    });
  });

  describe('Content Rendering', () => {
    it('applies minimum height to content area', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      const contentArea = screen.getByTestId('section1-content').parentElement;
      expect(contentArea?.style.minHeight).toBe('400px');
    });

    it('applies custom minimum height', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          minHeight="500px" 
        />
      );
      
      const contentArea = screen.getByTestId('section1-content').parentElement;
      expect(contentArea?.style.minHeight).toBe('500px');
    });

    it('applies maximum height and scroll when specified', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          maxHeight="300px" 
        />
      );
      
      const contentArea = screen.getByTestId('section1-content').parentElement;
      expect(contentArea?.style.maxHeight).toBe('300px');
      expect(contentArea?.className).toContain('overflow-y-auto');
    });
  });

  describe('Collapsible Behavior', () => {
    it('is expanded by default', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      // Content should be visible
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
      
      // Collapse button should show collapse icon
      const collapseButton = screen.getByTitle('Collapse panel');
      expect(collapseButton).toBeInTheDocument();
    });

    it('can be collapsed and expanded', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      // Initially expanded
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(screen.getByTitle('Collapse panel'));
      
      // Content should be hidden
      expect(screen.queryByTestId('section1-content')).not.toBeInTheDocument();
      
      // Expand button should be available
      const expandButton = screen.getByTitle('Expand panel');
      expect(expandButton).toBeInTheDocument();
      
      // Expand again
      fireEvent.click(expandButton);
      
      // Content should be visible again
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty sections array', () => {
      render(
        <TabbedFormulaPanel 
          title="Empty Panel"
          sections={[]} 
        />
      );
      
      expect(screen.getByText('Empty Panel')).toBeInTheDocument();
      // No tabs should be rendered
      expect(screen.queryByRole('button', { name: /Section/ })).not.toBeInTheDocument();
    });

    it('handles single section', () => {
      const singleSection = [mockSections[0]];
      
      render(
        <TabbedFormulaPanel 
          title="Single Section Panel"
          sections={singleSection} 
        />
      );
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
    });

    it('fallbacks to first section if defaultSection not found', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          defaultSection="nonexistent" 
        />
      );
      
      // Should show first section
      expect(screen.getByTestId('section1-content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TabbedFormulaPanel 
          {...defaultProps} 
          className="custom-class" 
        />
      );
      
      const panel = screen.getByText('Test Formula Panel').closest('.custom-class');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for tabs', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
      
      // Tab buttons should be accessible
      expect(screen.getByRole('button', { name: /🔥 Section 1/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /⚡ Section 2/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🚀 Section 3/ })).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      render(<TabbedFormulaPanel {...defaultProps} />);
      
      const section2Tab = screen.getByRole('button', { name: /⚡ Section 2/ });
      
      // Focus and click tab
      section2Tab.focus();
      fireEvent.click(section2Tab);
      
      expect(section2Tab).toHaveFocus();
    });
  });
});