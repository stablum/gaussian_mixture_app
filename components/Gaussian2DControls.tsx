'use client';

import React from 'react';
import { Gaussian2D } from '@/lib/gaussian2d';

interface Gaussian2DControlsProps {
  gaussian?: Gaussian2D | null;
  isRunning: boolean;
  onFit: () => void;
  onReset: () => void;
}

export default function Gaussian2DControls({ 
  gaussian,
  isRunning, 
  onFit, 
  onReset 
}: Gaussian2DControlsProps) {

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        2D Gaussian Controls
      </h3>
      
      <div className="space-y-4">
        {/* Fit button */}
        <div className="flex gap-2">
          <button
            onClick={onFit}
            disabled={isRunning}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            {isRunning ? 'Fitting...' : 'Fit Gaussian'}
          </button>
          
          <button
            onClick={onReset}
            disabled={isRunning}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Statistics display */}
        {gaussian && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
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
                  <div>Log-likelihood = {gaussian.logLikelihood.toFixed(2)}</div>
                  <div>Correlation = {(gaussian.sigma.xy / Math.sqrt(gaussian.sigma.xx * gaussian.sigma.yy)).toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <p className="font-medium mb-1">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Fit Gaussian" to estimate parameters from data</li>
            <li>Drag the mean point (μ) in the chart to adjust manually</li>
            <li>Hover over the chart to see probability density values</li>
            <li>Confidence ellipses show 1σ, 2σ, and 3σ regions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}