import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormInput, { FormLabel, ReadOnlyDisplay } from '../../components/ui/FormInput';

describe('FormInput', () => {
  it('renders number input with correct value', () => {
    const mockOnChange = jest.fn();
    render(
      <FormInput
        type="number"
        value={42}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue('42');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    render(
      <FormInput
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '123' } });

    expect(mockOnChange).toHaveBeenCalledWith('123');
  });

  it('applies step, min, max attributes', () => {
    const mockOnChange = jest.fn();
    render(
      <FormInput
        value={5}
        onChange={mockOnChange}
        step="0.1"
        min="0"
        max="10"
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('step', '0.1');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '10');
  });

  it('handles disabled state', () => {
    const mockOnChange = jest.fn();
    render(
      <FormInput
        value={5}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    const mockOnChange = jest.fn();
    render(
      <FormInput
        value={5}
        onChange={mockOnChange}
        className="custom-input"
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveClass('custom-input');
  });
});

describe('FormLabel', () => {
  it('renders label text', () => {
    render(<FormLabel>Test Label</FormLabel>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<FormLabel className="custom-label">Test Label</FormLabel>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('custom-label');
  });
});

describe('ReadOnlyDisplay', () => {
  it('renders value as text', () => {
    render(<ReadOnlyDisplay value={42.123} />);
    expect(screen.getByText('42.123')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<ReadOnlyDisplay value="test string" />);
    expect(screen.getByText('test string')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ReadOnlyDisplay value="test" className="custom-display" />);
    const display = screen.getByText('test');
    expect(display).toHaveClass('custom-display');
  });
});