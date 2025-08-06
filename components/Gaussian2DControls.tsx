'use client';

import React from 'react';
import { Gaussian2D } from '@/lib/gaussian2d';
import LogLikelihoodIndicator from './LogLikelihoodIndicator';
import { LogLikelihoodState } from '@/hooks/useLogLikelihoodUpdater';
import CollapsiblePanel from './ui/CollapsiblePanel';

interface Gaussian2DControlsProps {
  gaussian?: Gaussian2D | null;
  isRunning: boolean;
  onFit: () => void;
  onReset: () => void;
  onStartGradientDescent: () => void;
  showGradientDescent?: boolean;
  logLikelihoodState?: LogLikelihoodState;
}

export default function Gaussian2DControls({ 
  gaussian,
  isRunning, 
  onFit, 
  onReset,
  onStartGradientDescent,
  showGradientDescent = true,
  logLikelihoodState
}: Gaussian2DControlsProps) {
  return (
    <CollapsiblePanel 
      title="2D Gaussian Controls"
      className="mb-4"
    >
        <div className="space-y-4">
          {/* Fitting methods */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Fitting Methods</h4>
            <div className="flex gap-2">
              <button
                onClick={onFit}
                disabled={isRunning}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {isRunning ? 'Fitting...' : 'Fit Gaussian (MLE)'}
              </button>
              
              {showGradientDescent && (
                <button
                  onClick={onStartGradientDescent}
                  disabled={isRunning}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Gradient Descent
                </button>
              )}
              
              <button
                onClick={onReset}
                disabled={isRunning}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Statistics display */}
          {gaussian && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fitted Parameters</h4>
              
              <div className="space-y-2 text-sm">
                {/* Mean vector */}
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Mean (μ):</span>
                  <div className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                    x = {gaussian.mu.x.toFixed(3)}, y = {gaussian.mu.y.toFixed(3)}
                  </div>
                </div>
                
                {/* Covariance matrix */}
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Covariance (Σ):</span>
                  <div className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                    <div>σ₁₁ = {gaussian.sigma.xx.toFixed(3)}, σ₁₂ = {gaussian.sigma.xy.toFixed(3)}</div>
                    <div>σ₂₁ = {gaussian.sigma.xy.toFixed(3)}, σ₂₂ = {gaussian.sigma.yy.toFixed(3)}</div>
                  </div>
                </div>
                
                {/* Derived statistics */}
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Statistics:</span>
                  <div className="ml-2 text-gray-600 dark:text-gray-400">
                    <div>Det(Σ) = {(gaussian.sigma.xx * gaussian.sigma.yy - gaussian.sigma.xy * gaussian.sigma.xy).toFixed(6)}</div>
                    {logLikelihoodState ? (
                      <LogLikelihoodIndicator 
                        value={gaussian.logLikelihood}
                        state={logLikelihoodState}
                        label="Log-likelihood"
                        className="mb-2"
                      />
                    ) : (
                      <div>Log-likelihood = {gaussian.logLikelihood.toFixed(2)}</div>
                    )}
                    <div>Correlation = {(gaussian.sigma.xy / Math.sqrt(gaussian.sigma.xx * gaussian.sigma.yy)).toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <p className="font-medium mb-1">Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Fit Gaussian (MLE):</strong> Instant analytical solution</li>
              <li><strong>Gradient Descent:</strong> Iterative optimization with step-by-step controls</li>
              <li>Drag the mean point (μ) in the chart to adjust manually</li>
              <li>Hover over the chart to see probability density values</li>
              <li>Confidence ellipses show 1σ, 2σ, and 3σ regions</li>
            </ul>
          </div>
        </div>
    </CollapsiblePanel>
  );
}