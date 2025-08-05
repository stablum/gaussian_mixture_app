'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="f(\mathbf{x}) = (2\pi)^{-k/2} |\mathbf{\Sigma}|^{-1/2} \exp\left(-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^T \mathbf{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})\right)" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            where <InlineMath math="k = 2" /> (dimensionality), <InlineMath math="\mathbf{x} = [x_1, x_2]^T" />, <InlineMath math="\boldsymbol{\mu} = [\mu_1, \mu_2]^T" />
          </p>
        </div>

        {/* Mean Vector */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Mean Vector (Maximum Likelihood Estimate)
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="\hat{\boldsymbol{\mu}} = [\hat{\mu}_1, \hat{\mu}_2]^T = \frac{1}{N} \sum_{i=1}^{N} \mathbf{x}_i" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            <InlineMath math="\hat{\mu}_1 = \frac{1}{N} \sum_{i=1}^{N} x_{1i}" />, <InlineMath math="\hat{\mu}_2 = \frac{1}{N} \sum_{i=1}^{N} x_{2i}" />
          </p>
        </div>

        {/* Covariance Matrix */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Covariance Matrix (Maximum Likelihood Estimate)
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="\hat{\mathbf{\Sigma}} = \begin{bmatrix} \hat{\sigma}_{11} & \hat{\sigma}_{12} \\ \hat{\sigma}_{21} & \hat{\sigma}_{22} \end{bmatrix} = \frac{1}{N-1} \sum_{i=1}^{N} (\mathbf{x}_i - \hat{\boldsymbol{\mu}})(\mathbf{x}_i - \hat{\boldsymbol{\mu}})^T" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1">
            <div><InlineMath math="\hat{\sigma}_{11} = \frac{1}{N-1} \sum_{i=1}^{N} (x_{1i} - \hat{\mu}_1)^2" /></div>
            <div><InlineMath math="\hat{\sigma}_{12} = \hat{\sigma}_{21} = \frac{1}{N-1} \sum_{i=1}^{N} (x_{1i} - \hat{\mu}_1)(x_{2i} - \hat{\mu}_2)" /></div>
            <div><InlineMath math="\hat{\sigma}_{22} = \frac{1}{N-1} \sum_{i=1}^{N} (x_{2i} - \hat{\mu}_2)^2" /></div>
          </p>
        </div>

        {/* Mahalanobis Distance */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Mahalanobis Distance
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="d^2(\mathbf{x}, \boldsymbol{\mu}) = (\mathbf{x} - \boldsymbol{\mu})^T \mathbf{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Measures distance accounting for correlation and variance
          </p>
        </div>

        {/* Log-Likelihood */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Log-Likelihood
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="\ell(\boldsymbol{\mu}, \mathbf{\Sigma}) = \sum_{i=1}^{N} \log f(\mathbf{x}_i)" />
              <BlockMath math="= -\frac{N}{2} \log(2\pi) - \frac{1}{2} \log|\mathbf{\Sigma}| - \frac{1}{2} \sum_{i=1}^{N} d^2(\mathbf{x}_i, \boldsymbol{\mu})" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Maximized to find optimal parameters
          </p>
        </div>

        {/* Confidence Ellipses */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Confidence Ellipses
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="(\mathbf{x} - \boldsymbol{\mu})^T \mathbf{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu}) = c^2" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1">
            <div><InlineMath math="c = 1" />: ~39% of data (1σ)</div>
            <div><InlineMath math="c = 2" />: ~86% of data (2σ)</div>
            <div><InlineMath math="c = 3" />: ~99% of data (3σ)</div>
          </p>
        </div>

        {/* Correlation Coefficient */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Correlation Coefficient
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="min-w-max">
              <BlockMath math="\rho = \frac{\sigma_{12}}{\sqrt{\sigma_{11} \sigma_{22}}}" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            <InlineMath math="\rho \in [-1, 1]" />: measures linear relationship strength
          </p>
        </div>

        {/* Matrix Operations */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            2×2 Matrix Operations
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
            <div className="space-y-3">
              <div>
                <strong className="text-gray-800 dark:text-gray-200">Determinant:</strong>
                <div className="min-w-max">
                  <InlineMath math="|\mathbf{\Sigma}| = \sigma_{11}\sigma_{22} - \sigma_{12}^2" />
                </div>
              </div>
              <div>
                <strong className="text-gray-800 dark:text-gray-200">Inverse:</strong>
                <div className="min-w-max">
                  <BlockMath math="\mathbf{\Sigma}^{-1} = \frac{1}{|\mathbf{\Sigma}|} \begin{bmatrix} \sigma_{22} & -\sigma_{12} \\ -\sigma_{12} & \sigma_{11} \end{bmatrix}" />
                </div>
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