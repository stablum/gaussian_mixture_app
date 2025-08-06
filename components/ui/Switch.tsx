'use client';

import React from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red';
  label?: string;
  description?: string;
}

export default function Switch({
  id,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  label,
  description
}: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  // Color configurations
  const colorConfig = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-green-600 dark:bg-green-500', 
    purple: 'bg-purple-600 dark:bg-purple-500',
    red: 'bg-red-600 dark:bg-red-500'
  };

  const config = sizeConfig[size];
  const activeColor = colorConfig[color];

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {/* Switch Track */}
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`
            relative inline-flex items-center ${config.track} rounded-full
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            dark:focus:ring-offset-gray-800
            ${checked ? activeColor : 'bg-gray-200 dark:bg-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Switch Thumb */}
          <span
            className={`
              ${config.thumb} rounded-full bg-white shadow-lg
              transform transition-transform duration-200 ease-in-out
              ${checked ? config.translate : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>
      
      {/* Label and Description */}
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className={`
                text-sm font-medium text-gray-900 dark:text-white
                ${disabled ? 'opacity-50' : 'cursor-pointer'}
              `}
              onClick={!disabled ? handleToggle : undefined}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={`${id}-description`} className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}