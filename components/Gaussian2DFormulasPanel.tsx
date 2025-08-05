'use client';

import React, { useState } from 'react';

export default function Gaussian2DFormulasPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
        <button
          onClick={toggleCollapse}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            2D Gaussian Mathematical Formulas
          </h3>
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
      <button
        onClick={toggleCollapse}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-600"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          2D Gaussian Mathematical Formulas
        </h3>
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
      
      <div className="p-4 space-y-6">
        {/* Multivariate Gaussian PDF */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Multivariate Gaussian Probability Density Function
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-2">
                f(<strong>x</strong>) = (2π)<sup>-k/2</sup> |<strong>Σ</strong>|<sup>-1/2</sup> exp(-½(<strong>x</strong> - <strong>μ</strong>)<sup>T</sup> <strong>Σ</strong><sup>-1</sup> (<strong>x</strong> - <strong>μ</strong>))
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                where k = 2 (dimensionality), <strong>x</strong> = [x₁, x₂]<sup>T</sup>, <strong>μ</strong> = [μ₁, μ₂]<sup>T</sup>
              </div>
            </div>
          </div>
        </div>

        {/* Mean Vector */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Mean Vector (Maximum Likelihood Estimate)
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-2">
                <strong>μ̂</strong> = [μ̂₁, μ̂₂]<sup>T</sup> = (1/N) Σᵢ<strong>xᵢ</strong>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                μ̂₁ = (1/N) Σᵢx₁ᵢ, μ̂₂ = (1/N) Σᵢx₂ᵢ
              </div>
            </div>
          </div>
        </div>

        {/* Covariance Matrix */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Covariance Matrix (Maximum Likelihood Estimate)
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-3">
                <strong>Σ̂</strong> = [σ̂₁₁  σ̂₁₂] = (1/(N-1)) Σᵢ(<strong>xᵢ</strong> - <strong>μ̂</strong>)(<strong>xᵢ</strong> - <strong>μ̂</strong>)<sup>T</sup>
              </div>
              <div className="mb-2">
                [σ̂₂₁  σ̂₂₂]
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>σ̂₁₁ = (1/(N-1)) Σᵢ(x₁ᵢ - μ̂₁)²</div>
                <div>σ̂₁₂ = σ̂₂₁ = (1/(N-1)) Σᵢ(x₁ᵢ - μ̂₁)(x₂ᵢ - μ̂₂)</div>
                <div>σ̂₂₂ = (1/(N-1)) Σᵢ(x₂ᵢ - μ̂₂)²</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mahalanobis Distance */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Mahalanobis Distance
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-2">
                d²(<strong>x</strong>, <strong>μ</strong>) = (<strong>x</strong> - <strong>μ</strong>)<sup>T</sup> <strong>Σ</strong><sup>-1</sup> (<strong>x</strong> - <strong>μ</strong>)
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Measures distance accounting for correlation and variance
              </div>
            </div>
          </div>
        </div>

        {/* Log-Likelihood */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Log-Likelihood
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-2">
                ℓ(<strong>μ</strong>, <strong>Σ</strong>) = Σᵢ log f(<strong>xᵢ</strong>)
              </div>
              <div className="mb-2">
                = -½N log(2π) - ½ log|<strong>Σ</strong>| - ½ Σᵢ d²(<strong>xᵢ</strong>, <strong>μ</strong>)
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Maximized to find optimal parameters
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Ellipses */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Confidence Ellipses
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-2">
                (<strong>x</strong> - <strong>μ</strong>)<sup>T</sup> <strong>Σ</strong><sup>-1</sup> (<strong>x</strong> - <strong>μ</strong>) = c²
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>c = 1: ~39% of data (1σ)</div>
                <div>c = 2: ~86% of data (2σ)</div>
                <div>c = 3: ~99% of data (3σ)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Correlation Coefficient */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Correlation Coefficient
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-center">
              <div className="mb-2">
                ρ = σ₁₂ / √(σ₁₁ σ₂₂)
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                ρ ∈ [-1, 1]: measures linear relationship strength
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Operations */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            2×2 Matrix Operations
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="space-y-2">
              <div>
                <strong>Determinant:</strong> |<strong>Σ</strong>| = σ₁₁σ₂₂ - σ₁₂²
              </div>
              <div>
                <strong>Inverse:</strong> <strong>Σ</strong><sup>-1</sup> = (1/|<strong>Σ</strong>|) [σ₂₂  -σ₁₂]
              </div>
              <div className="ml-20">
                [-σ₁₂  σ₁₁]
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          Mathematical notation follows Bishop's "Pattern Recognition and Machine Learning" (2006)
        </div>
      </div>
    </div>
  );
}