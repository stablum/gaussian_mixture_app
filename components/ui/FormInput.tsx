'use client';

import React from 'react';

type FormInputSize = 'sm' | 'md' | 'lg';

interface FormInputProps {
  type?: 'number' | 'text' | 'select';
  value: string | number;
  onChange: (value: string) => void;
  step?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  size?: FormInputSize;
  children?: React.ReactNode; // For select options
}

export default function FormInput({
  type = 'number',
  value,
  onChange,
  step,
  min,
  max,
  disabled = false,
  className = '',
  placeholder,
  size = 'sm',
  children
}: FormInputProps) {
  // Size-based classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm', 
    lg: 'px-3 py-2'
  };
  
  // Base styling that matches the existing patterns
  const baseClasses = `w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${sizeClasses[size]}`;
  const disabledClasses = disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "";
  
  const finalClasses = `${baseClasses} ${disabledClasses} ${className}`;
  
  if (type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={finalClasses}
      >
        {children}
      </select>
    );
  }
  
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      step={step}
      min={min}
      max={max}
      disabled={disabled}
      placeholder={placeholder}
      className={finalClasses}
    />
  );
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm';
}

export function FormLabel({ children, className = '', size = 'sm' }: FormLabelProps) {
  const sizeClasses = {
    xs: 'text-xs text-gray-600 dark:text-gray-400',
    sm: 'text-sm font-medium text-gray-700 dark:text-gray-300'
  };
  
  return (
    <label className={`block ${sizeClasses[size]} mb-1 ${className}`}>
      {children}
    </label>
  );
}

interface ReadOnlyDisplayProps {
  value: string | number;
  className?: string;
}

export function ReadOnlyDisplay({ value, className = '' }: ReadOnlyDisplayProps) {
  return (
    <div className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-mono ${className}`}>
      {value}
    </div>
  );
}