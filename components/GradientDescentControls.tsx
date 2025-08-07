'use client';

import React from 'react';
import AlgorithmControlsBase from './ui/AlgorithmControlsBase';
import Button from './ui/Button';
import { Gaussian2DHistoryStep } from '@/lib/gaussian2d';
import { AlgorithmMode } from '@/lib/algorithmTypes';

interface GradientDescentControlsProps {
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  converged: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onRunToConvergence: () => void;
  onStop: () => void;
  onExit?: () => void;
  onNavigateToStep?: (step: number) => void;
  logLikelihood: number;
  learningRate: number;
  onLearningRateChange: (rate: number) => void;
  gradientDescentHistory?: Gaussian2DHistoryStep[];
}

export default function GradientDescentControls({
  currentStep,
  totalSteps,
  isRunning,
  converged,
  onStepForward,
  onStepBackward,
  onReset,
  onRunToConvergence,
  onStop,
  onExit,
  onNavigateToStep,
  logLikelihood,
  learningRate,
  onLearningRateChange,
  gradientDescentHistory = []
}: GradientDescentControlsProps) {
  // Prepare convergence data
  const convergenceData = gradientDescentHistory.map(step => ({
    iteration: step.iteration,
    value: step.logLikelihood
  }));

  const additionalControls = (
    <>
      {/* Learning Rate Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Learning Rate: {learningRate.toFixed(4)}
        </label>
        <input
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          value={learningRate}
          onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
          disabled={isRunning}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0.001</span>
          <span>Slow ← → Fast</span>
          <span>0.1</span>
        </div>
      </div>

      {/* Exit Mode Button */}
      {onExit && (
        <div className="mb-4">
          <Button
            onClick={onExit}
            disabled={isRunning}
            variant="secondary"
            size="lg"
          >
            Exit Mode
          </Button>
        </div>
      )}
    </>
  );

  return (
    <AlgorithmControlsBase
      title="Gradient Descent Controls"
      mode={AlgorithmMode.GAUSSIAN_2D}
      currentStep={currentStep}
      totalSteps={totalSteps}
      isRunning={isRunning}
      converged={converged}
      onStepForward={onStepForward}
      onStepBackward={onStepBackward}
      onReset={onReset}
      onRunToConvergence={onRunToConvergence}
      onStop={onStop}
      onNavigateToStep={onNavigateToStep}
      metricValue={logLikelihood}
      metricLabel="Log-Likelihood"
      convergenceData={convergenceData}
      additionalControls={additionalControls}
    />
  );
}