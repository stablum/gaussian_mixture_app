import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollapsiblePanel from '../../components/ui/CollapsiblePanel';

describe('CollapsiblePanel', () => {
  it('renders with title and children when expanded', () => {
    render(
      <CollapsiblePanel title="Test Panel">
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows subtitle when provided', () => {
    render(
      <CollapsiblePanel title="Test Panel" subtitle="Test Subtitle">
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders headerExtra content when provided', () => {
    const headerExtra = <button>Extra Button</button>;
    render(
      <CollapsiblePanel title="Test Panel" headerExtra={headerExtra}>
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    expect(screen.getByText('Extra Button')).toBeInTheDocument();
  });

  it('toggles collapsed state when button is clicked', () => {
    render(
      <CollapsiblePanel title="Test Panel">
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    const collapseButton = screen.getByTitle('Collapse panel');
    
    // Initially expanded
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    expect(screen.getByTitle('Expand panel')).toBeInTheDocument();

    // Click to expand again
    fireEvent.click(screen.getByTitle('Expand panel'));
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    render(
      <CollapsiblePanel title="Test Panel" defaultCollapsed={true}>
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    expect(screen.getByTitle('Expand panel')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CollapsiblePanel title="Test Panel" className="custom-class">
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});