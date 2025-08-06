'use client';

import React, { useState, useEffect, useRef } from 'react';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  decimalPlaces?: number;
}

export default function NumericInput({
  value,
  onChange,
  step = 0.1,
  min,
  max,
  disabled = false,
  className = '',
  placeholder,
  decimalPlaces = 3
}: NumericInputProps) {
  // Local state for the input string value
  const [localValue, setLocalValue] = useState(value.toFixed(decimalPlaces));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop value changes (but only if not focused)
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toFixed(decimalPlaces));
    }
  }, [value, isFocused, decimalPlaces]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    
    // Only update parent if the value is a valid number
    // This allows typing intermediate states like "-", "-1", "1.", etc.
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed) && isFinite(parsed)) {
      let constrainedValue = parsed;
      
      // Apply constraints if specified
      if (min !== undefined) {
        constrainedValue = Math.max(min, constrainedValue);
      }
      if (max !== undefined) {
        constrainedValue = Math.min(max, constrainedValue);
      }
      
      // Only call onChange if the value actually changed
      if (constrainedValue !== value) {
        onChange(constrainedValue);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // On blur, validate and format the value
    const parsed = parseFloat(localValue);
    
    if (isNaN(parsed) || !isFinite(parsed)) {
      // Invalid value, reset to the prop value
      setLocalValue(value.toFixed(decimalPlaces));
    } else {
      let constrainedValue = parsed;
      
      // Apply constraints
      if (min !== undefined) {
        constrainedValue = Math.max(min, constrainedValue);
      }
      if (max !== undefined) {
        constrainedValue = Math.min(max, constrainedValue);
      }
      
      // Update both local and parent value
      const formattedValue = constrainedValue.toFixed(decimalPlaces);
      setLocalValue(formattedValue);
      
      if (constrainedValue !== value) {
        onChange(constrainedValue);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    
    // Reset on Escape
    if (e.key === 'Escape') {
      setLocalValue(value.toFixed(decimalPlaces));
      inputRef.current?.blur();
    }
  };

  const baseClasses = "w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
  const disabledClasses = disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "";
  
  return (
    <input
      ref={inputRef}
      type="text"  // Use text to allow intermediate states
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      title={`Min: ${min ?? 'none'}, Max: ${max ?? 'none'}, Step: ${step}`}
    />
  );
}