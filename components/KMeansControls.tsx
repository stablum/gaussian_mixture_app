'use client';

import React from 'react';
import LogLikelihoodIndicator from './LogLikelihoodIndicator';
import ConvergenceChart from './ConvergenceChart';
import { LogLikelihoodState } from '@/hooks/useLogLikelihoodUpdater';
import { KMeansHistoryStep } from '@/lib/kmeans';
import { AlgorithmMode } from '@/lib/algorithmTypes';
import CollapsiblePanel from './ui/CollapsiblePanel';
import Button from './ui/Button';

interface KMeansControlsProps {
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
  inertia: number;
  logLikelihoodState?: LogLikelihoodState;
  kmeansHistory?: KMeansHistoryStep[];
}

export default function KMeansControls({
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
  inertia,
  logLikelihoodState,
  kmeansHistory = []
}: KMeansControlsProps) {
  // Prepare convergence data
  const convergenceData = kmeansHistory.map(step => ({
    iteration: step.iteration,
    value: step.inertia || 0
  }));

  return (
    <CollapsiblePanel title="K-Means Algorithm Controls" className="mb-4">
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
          
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-900 dark:text-gray-100">
            <div>
              <span className="font-medium">Iteration:</span>
              <span className="ml-2">{currentStep} / {Math.max(totalSteps - 1, 0)}</span>
            </div>
            
            {logLikelihoodState ? (
              <LogLikelihoodIndicator 
                value={inertia}
                state={logLikelihoodState}
                label="Inertia (WCSS)"
              />
            ) : (
              <div>
                <span className="font-medium">Inertia (WCSS):</span>
                <span className="ml-2">{
                  isFinite(inertia) && inertia !== Infinity 
                    ? inertia.toFixed(4) 
                    : inertia === Infinity 
                      ? '--' 
                      : inertia.toString()
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
      
      {convergenceData.length > 1 && (
        <div className="mt-4">
          <ConvergenceChart
            data={convergenceData}
            mode={AlgorithmMode.KMEANS}
            currentIteration={currentStep}
            width={400}
            height={180}
            onIterationClick={onNavigateToStep}
          />
        </div>
      )}
    </CollapsiblePanel>
  );
}