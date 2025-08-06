/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NumericInput from '../../components/ui/NumericInput';

describe('NumericInput', () => {
  const defaultProps = {
    value: 1.5,
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<NumericInput {...defaultProps} />);
      
      const input = screen.getByDisplayValue('1.500');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with custom decimal places', () => {
      render(<NumericInput {...defaultProps} decimalPlaces={2} />);
      
      expect(screen.getByDisplayValue('1.50')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(
        <NumericInput 
          {...defaultProps} 
          placeholder="Enter value" 
        />
      );
      
      const input = screen.getByPlaceholderText('Enter value');
      expect(input).toBeInTheDocument();
    });

    it('renders as disabled when disabled prop is true', () => {
      render(<NumericInput {...defaultProps} disabled={true} />);
      
      const input = screen.getByDisplayValue('1.500');
      expect(input).toBeDisabled();
    });

    it('applies custom className', () => {
      render(
        <NumericInput 
          {...defaultProps} 
          className="custom-class" 
        />
      );
      
      const input = screen.getByDisplayValue('1.500');
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('Value Updates', () => {
    it('updates display value when prop value changes (while not focused)', () => {
      const { rerender } = render(<NumericInput {...defaultProps} />);
      
      expect(screen.getByDisplayValue('1.500')).toBeInTheDocument();
      
      rerender(<NumericInput {...defaultProps} value={2.75} />);
      expect(screen.getByDisplayValue('2.750')).toBeInTheDocument();
    });

    it('does not update display value when prop value changes while focused', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<NumericInput {...defaultProps} />);
      
      const input = screen.getByDisplayValue('1.500');
      await user.click(input);
      
      // Change the input value while focused
      await user.clear(input);
      await user.type(input, '3.14');
      
      // Change the prop value - should not override the focused input
      rerender(<NumericInput {...defaultProps} value={5.67} />);
      
      expect(input).toHaveValue('3.14');
      expect(input).toHaveFocus();
    });
  });

  describe('Typing Behavior', () => {
    it('allows typing intermediate values like negative sign', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={0} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('0.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '-');
      
      // Should show the minus sign in the input
      expect(input).toHaveValue('-');
      
      // Should not call onChange for incomplete value
      expect(onChange).not.toHaveBeenCalled();
    });

    it('allows typing decimal points and intermediate decimal values', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={0} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('0.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '1.');
      
      // Should show "1." in the input
      expect(input).toHaveValue('1.');
      
      // Should call onChange with 1 (valid number)
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('allows typing negative decimals step by step', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={0} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('0.000');
      await user.click(input);
      await user.clear(input);
      
      // Type "-1.5" character by character
      await user.type(input, '-');
      expect(input).toHaveValue('-');
      expect(onChange).not.toHaveBeenCalled();
      
      await user.type(input, '1');
      expect(input).toHaveValue('-1');
      expect(onChange).toHaveBeenCalledWith(-1);
      
      await user.type(input, '.');
      expect(input).toHaveValue('-1.');
      expect(onChange).toHaveBeenCalledWith(-1);
      
      await user.type(input, '5');
      expect(input).toHaveValue('-1.5');
      expect(onChange).toHaveBeenCalledWith(-1.5);
    });

    it('calls onChange with valid numbers during typing', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={0} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('0.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '3.14159');
      
      expect(onChange).toHaveBeenCalledWith(3.14159);
    });
  });

  describe('Constraints', () => {
    it('applies minimum constraint', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={5} onChange={onChange} min={0} />);
      
      const input = screen.getByDisplayValue('5.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '-2.5');
      
      // Should call onChange with the constrained value
      expect(onChange).toHaveBeenCalledWith(0); // min constraint applied
    });

    it('applies maximum constraint', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={5} onChange={onChange} max={10} />);
      
      const input = screen.getByDisplayValue('5.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '15.7');
      
      // Should call onChange with the constrained value
      expect(onChange).toHaveBeenCalledWith(10); // max constraint applied
    });

    it('applies both min and max constraints', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={5} onChange={onChange} min={1} max={10} />);
      
      const input = screen.getByDisplayValue('5.000');
      
      // Test below minimum
      await user.click(input);
      await user.clear(input);
      await user.type(input, '0.5');
      expect(onChange).toHaveBeenCalledWith(1);
      
      // Test above maximum
      onChange.mockClear();
      await user.clear(input);
      await user.type(input, '12');
      expect(onChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Blur Behavior', () => {
    it('formats value on blur', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={1.5} onChange={onChange} decimalPlaces={2} />);
      
      const input = screen.getByDisplayValue('1.50');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '3.14159');
      
      // Before blur, shows the typed value
      expect(input).toHaveValue('3.14159');
      
      await user.tab(); // Blur the input
      
      // After blur, should be formatted to specified decimal places
      await waitFor(() => {
        expect(input).toHaveValue('3.14');
      });
    });

    it('resets to prop value on blur with invalid input', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={1.5} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('1.500');
      await user.click(input);
      await user.clear(input);
      await user.type(input, 'invalid');
      
      await user.tab(); // Blur the input
      
      // Should reset to the original prop value
      await waitFor(() => {
        expect(input).toHaveValue('1.500');
      });
      
      // Should not have called onChange for invalid value
      expect(onChange).not.toHaveBeenCalled();
    });

    it('applies constraints on blur', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={5} onChange={onChange} min={0} max={10} />);
      
      const input = screen.getByDisplayValue('5.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '-3.7');
      
      await user.tab(); // Blur the input
      
      // Should be constrained to minimum and formatted
      await waitFor(() => {
        expect(input).toHaveValue('0.000');
      });
      
      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('submits on Enter key', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={1.5} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('1.500');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '2.75');
      
      // Press Enter
      await user.keyboard('{Enter}');
      
      // Should blur the input (lose focus)
      expect(input).not.toHaveFocus();
      expect(onChange).toHaveBeenCalledWith(2.75);
    });

    it('resets value on Escape key', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={1.5} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('1.500');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '9.99');
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      // Should reset to original value and blur
      expect(input).toHaveValue('1.500');
      expect(input).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('includes helpful title attribute', () => {
      render(
        <NumericInput 
          {...defaultProps} 
          min={0} 
          max={100} 
          step={0.5} 
        />
      );
      
      const input = screen.getByDisplayValue('1.500');
      expect(input).toHaveAttribute('title', 'Min: 0, Max: 100, Step: 0.5');
    });

    it('shows "none" for undefined constraints in title', () => {
      render(<NumericInput {...defaultProps} />);
      
      const input = screen.getByDisplayValue('1.500');
      expect(input).toHaveAttribute('title', 'Min: none, Max: none, Step: 0.1');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero value correctly', () => {
      render(<NumericInput value={0} onChange={jest.fn()} />);
      
      expect(screen.getByDisplayValue('0.000')).toBeInTheDocument();
    });

    it('handles very small numbers', () => {
      render(<NumericInput value={0.001} onChange={jest.fn()} />);
      
      expect(screen.getByDisplayValue('0.001')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(<NumericInput value={999999.999} onChange={jest.fn()} />);
      
      expect(screen.getByDisplayValue('999999.999')).toBeInTheDocument();
    });

    it('handles negative numbers', () => {
      render(<NumericInput value={-42.5} onChange={jest.fn()} />);
      
      expect(screen.getByDisplayValue('-42.500')).toBeInTheDocument();
    });

    it('does not call onChange for same value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<NumericInput value={5} onChange={onChange} />);
      
      const input = screen.getByDisplayValue('5.000');
      await user.click(input);
      await user.clear(input);
      await user.type(input, '5.000');
      
      // Should not call onChange since value hasn't actually changed
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});