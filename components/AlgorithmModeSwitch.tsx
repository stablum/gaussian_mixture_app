'use client';

import React from 'react';
import { AlgorithmMode, ALGORITHM_LABELS, ALGORITHM_DESCRIPTIONS } from '@/lib/algorithmTypes';

interface AlgorithmModeSwitchProps {
  currentMode: AlgorithmMode;
  onModeChange: (mode: AlgorithmMode) => void;
}

export default function AlgorithmModeSwitch({ currentMode, onModeChange }: AlgorithmModeSwitchProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Algorithm Mode</h3>
      
      <div className="flex gap-3">
        {Object.values(AlgorithmMode).map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              currentMode === mode
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
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
    </div>
  );
}