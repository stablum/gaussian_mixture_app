'use client';

import React from 'react';

interface FormInputProps {
  type?: 'number' | 'text';
  value: string | number;
  onChange: (value: string) => void;
  step?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
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
  placeholder
}: FormInputProps) {
  const baseClasses = "w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
  const disabledClasses = disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "";
  
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
      className={`${baseClasses} ${disabledClasses} ${className}`}
    />
  );
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({ children, className = '' }: FormLabelProps) {
  return (
    <label className={`text-xs text-gray-600 dark:text-gray-400 block mb-1 ${className}`}>
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