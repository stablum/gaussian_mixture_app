'use client';

import React from 'react';
import AlgorithmControlsBase from './ui/AlgorithmControlsBase';
import { LogLikelihoodState } from '@/hooks/useLogLikelihoodUpdater';
import { GMMHistoryStep } from '@/lib/gmm';
import { AlgorithmMode } from '@/lib/algorithmTypes';

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
  onNavigateToStep?: (step: number) => void;
  logLikelihood: number;
  logLikelihoodState?: LogLikelihoodState;
  gmmHistory?: GMMHistoryStep[];
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
  onNavigateToStep,
  logLikelihood,
  logLikelihoodState,
  gmmHistory = []
}: EMControlsProps) {
  // Prepare convergence data
  const convergenceData = gmmHistory.map(step => ({
    iteration: step.iteration,
    value: step.logLikelihood
  }));

  return (
    <AlgorithmControlsBase
      title="EM Algorithm Controls"
      mode={AlgorithmMode.GMM}
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
      logLikelihoodState={logLikelihoodState}
      convergenceData={convergenceData}
    />
  );
}