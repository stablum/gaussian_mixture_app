'use client';

import React from 'react';
import { GMMHistoryStep } from '@/lib/gmm';

interface EMControlsProps {
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  converged: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onRunToConvergence: () => void;
  onStop: () => void;
  logLikelihood: number;
}

export default function EMControls({
  currentStep,
  totalSteps,
  isRunning,
  converged,
  onStepForward,
  onStepBackward,
  onReset,
  onRunToConvergence,
  onStop,
  logLikelihood
}: EMControlsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 transition-colors">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">EM Algorithm Controls</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onStepBackward}
          disabled={currentStep <= 0 || isRunning}
          className="px-3 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        
        <button
          onClick={onStepForward}
          disabled={(currentStep >= totalSteps - 1 && converged) || isRunning}
          className="px-3 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
        
        <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
          {!isRunning ? (
            <button
              onClick={onRunToConvergence}
              disabled={converged}
              className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Run to Convergence
            </button>
          ) : (
            <button
              onClick={onStop}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          )}
        </div>
        
        <button
          onClick={onReset}
          disabled={isRunning}
          className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded hover:bg-orange-600 dark:hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-900 dark:text-gray-100">
        <div>
          <span className="font-medium">Iteration:</span>
          <span className="ml-2">{currentStep} / {Math.max(totalSteps - 1, 0)}</span>
        </div>
        
        <div>
          <span className="font-medium">Log-Likelihood:</span>
          <span className="ml-2">{
            isFinite(logLikelihood) && logLikelihood !== -Infinity 
              ? logLikelihood.toFixed(4) 
              : logLikelihood === -Infinity 
                ? '--' 
                : logLikelihood.toString()
          }</span>
        </div>
        
        <div>
          <span className="font-medium">Status:</span>
          <span className={`ml-2 ${converged ? 'text-green-600 dark:text-green-400' : isRunning ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isRunning ? 'Running...' : converged ? 'Converged' : 'Ready'}
          </span>
        </div>
      </div>
      
      {isRunning && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentStep / (totalSteps || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}