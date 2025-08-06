'use client';

import React from 'react';
import AlgorithmControlsBase from './ui/AlgorithmControlsBase';
import { LogLikelihoodState } from '@/hooks/useLogLikelihoodUpdater';
import { KMeansHistoryStep } from '@/lib/kmeans';
import { AlgorithmMode } from '@/lib/algorithmTypes';

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
    <AlgorithmControlsBase
      title="K-Means Algorithm Controls"
      mode={AlgorithmMode.KMEANS}
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
      metricValue={inertia}
      metricLabel="Inertia (WCSS)"
      logLikelihoodState={logLikelihoodState}
      convergenceData={convergenceData}
    />
  );
}