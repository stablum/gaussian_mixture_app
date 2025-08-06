'use client';

import React, { useState } from 'react';
import { AlgorithmMode, ALGORITHM_LABELS, ALGORITHM_DESCRIPTIONS } from '@/lib/algorithmTypes';

interface AlgorithmModeSwitchProps {
  currentMode: AlgorithmMode;
  onModeChange: (mode: AlgorithmMode) => void;
}

export default function AlgorithmModeSwitch({ currentMode, onModeChange }: AlgorithmModeSwitchProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg mb-4 transition-colors" style={{ padding: isCollapsed ? '8px 16px' : '16px' }}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-3'}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Algorithm Mode</h3>
        <div className="flex items-center gap-3">
          {isCollapsed && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {ALGORITHM_LABELS[currentMode]}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="flex gap-3">
            {Object.values(AlgorithmMode).map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  currentMode === mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-sm mb-1">
                    {ALGORITHM_LABELS[mode]}
                  </div>
                  <div className="text-xs opacity-80">
                    {ALGORITHM_DESCRIPTIONS[mode]}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <strong>Current:</strong> {ALGORITHM_LABELS[currentMode]}
          </div>
        </>
      )}
    </div>
  );
}