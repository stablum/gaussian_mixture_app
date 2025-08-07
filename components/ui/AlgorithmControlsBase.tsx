'use client';

import React, { ReactNode } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import Button from './Button';
import ConvergenceChart from '../ConvergenceChart';
import LogLikelihoodIndicator from '../LogLikelihoodIndicator';
import { LogLikelihoodState } from '@/hooks/useLogLikelihoodUpdater';
import { AlgorithmMode } from '@/lib/algorithmTypes';

interface AlgorithmControlsBaseProps {
  title: string;
  mode: AlgorithmMode;
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  converged: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onRunToConvergence: () => void;
  onStop: () => void;
  onNavigateToStep?: (step: number) => void;
  
  // Metric display
  metricValue: number;
  metricLabel: string;
  logLikelihoodState?: LogLikelihoodState;
  
  // Convergence data
  convergenceData?: Array<{ iteration: number; value: number }>;
  
  // Additional controls (mode-specific)
  additionalControls?: ReactNode;
  
  className?: string;
}

export default function AlgorithmControlsBase({
  title,
  mode,
  currentStep,
  totalSteps,
  isRunning,
  converged,
  onStepForward,
  onStepBackward,
  onReset,
  onRunToConvergence,
  onStop,
  onNavigateToStep,
  metricValue,
  metricLabel,
  logLikelihoodState,
  convergenceData = [],
  additionalControls,
  className = "mb-4"
}: AlgorithmControlsBaseProps) {
  return (
    <CollapsiblePanel title={title} className={className}>
      {/* Additional Controls (e.g., learning rate for gradient descent) */}
      {additionalControls}
      
      {/* Main Control Buttons */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={onStepBackward}
          disabled={currentStep <= 0 || isRunning}
          variant="secondary"
        >
          ← Previous
        </Button>
        
        <Button
          onClick={onStepForward}
          disabled={(currentStep >= totalSteps - 1 && converged) || isRunning}
          variant="primary"
        >
          Next →
        </Button>
        
        <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
          {!isRunning ? (
            <Button
              onClick={onRunToConvergence}
              disabled={converged}
              variant="success"
              size="lg"
            >
              Run to Convergence
            </Button>
          ) : (
            <Button
              onClick={onStop}
              variant="danger"
              size="lg"
            >
              Stop
            </Button>
          )}
        </div>
        
        <Button
          onClick={onReset}
          disabled={isRunning}
          variant="warning"
          size="lg"
        >
          Reset
        </Button>
      </div>
      
      {/* Status Grid */}
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-900 dark:text-gray-100">
        <div>
          <span className="font-medium">Iteration:</span>
          <span className="ml-2">{currentStep} / {Math.max(totalSteps - 1, 0)}</span>
        </div>
        
        {logLikelihoodState ? (
          <LogLikelihoodIndicator 
            value={metricValue}
            state={logLikelihoodState}
            label={metricLabel}
          />
        ) : (
          <div>
            <span className="font-medium">{metricLabel}:</span>
            <span className="ml-2">{
              isFinite(metricValue) && metricValue !== -Infinity && metricValue !== Infinity
                ? metricValue.toFixed(4) 
                : (metricValue === -Infinity || metricValue === Infinity)
                  ? '--' 
                  : metricValue.toString()
            }</span>
          </div>
        )}
        
        <div>
          <span className="font-medium">Status:</span>
          <span className={`ml-2 ${converged ? 'text-green-600 dark:text-green-400' : isRunning ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isRunning ? 'Running...' : converged ? 'Converged' : 'Ready'}
          </span>
        </div>
      </div>
      
      {/* Progress Bar (when running) */}
      {isRunning && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentStep / (totalSteps || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Convergence Chart */}
      {convergenceData.length > 1 && (
        <div className="mt-4">
          <ConvergenceChart
            data={convergenceData}
            mode={mode}
            currentIteration={currentStep}
            height={180}
            onIterationClick={onNavigateToStep}
          />
        </div>
      )}
    </CollapsiblePanel>
  );
}