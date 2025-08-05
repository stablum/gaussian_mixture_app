'use client';

import React from 'react';
import { LogLikelihoodState } from '@/hooks/useLogLikelihoodUpdater';

interface LogLikelihoodIndicatorProps {
  value: number;
  state: LogLikelihoodState;
  label?: string;
  className?: string;
}

export default function LogLikelihoodIndicator({ 
  value, 
  state, 
  label = "Log-likelihood",
  className = "" 
}: LogLikelihoodIndicatorProps) {
  const getStatusIcon = () => {
    if (state.isCalculating) {
      return (
        <div className="inline-block animate-spin ml-2">
          <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      );
    }

    if (state.isStale) {
      return (
        <div className="inline-block ml-2" title="Value is outdated - parameters changed">
          <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    return (
      <div className="inline-block ml-2" title="Value is up to date">
        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const getValueClass = () => {
    let baseClass = "font-mono";
    
    if (state.isCalculating) {
      baseClass += " text-blue-600 dark:text-blue-400";
    } else if (state.isStale) {
      baseClass += " text-orange-600 dark:text-orange-400";
    } else {
      baseClass += " text-gray-900 dark:text-gray-100";
    }

    return baseClass;
  };

  const getStatusText = () => {
    if (state.isCalculating) {
      return "Calculating...";
    }
    if (state.isStale) {
      return "Outdated";
    }
    return "Current";
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {label}:
        </span>
        <span className={getValueClass()}>
          {state.isCalculating ? (
            <span className="ml-2">Calculating...</span>
          ) : (
            <span className="ml-2">
              {Number.isFinite(value) ? value.toFixed(4) : 'N/A'}
            </span>
          )}
        </span>
        {getStatusIcon()}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {getStatusText()}
      </div>
    </div>
  );
}