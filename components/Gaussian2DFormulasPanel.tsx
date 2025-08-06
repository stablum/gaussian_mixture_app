'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import TabbedFormulaPanel from './ui/TabbedFormulaPanel';
import type { FormulaSection } from './ui/TabbedFormulaPanel';

export default function Gaussian2DFormulasPanel() {

  const renderDistributionFormulas = () => (
    <div className="space-y-4">
      {/* Multivariate Gaussian PDF */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Multivariate Gaussian Probability Density Function
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="f(\mathbf{x}) = \frac{1}{(2\pi)^{k/2} |\mathbf{\Sigma}|^{1/2}} \exp\left(-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^T \mathbf{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})\right)" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          where <InlineMath math="k = 2" /> (dimensionality), <InlineMath math="\mathbf{x} = [x_1, x_2]^T" />, <InlineMath math="\boldsymbol{\mu} = [\mu_1, \mu_2]^T" />
        </p>
      </div>

      {/* Mahalanobis Distance */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Mahalanobis Distance
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="d^2(\mathbf{x}, \boldsymbol{\mu}) = (\mathbf{x} - \boldsymbol{\mu})^T \mathbf{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Measures distance accounting for correlation and variance
        </p>
      </div>

      {/* Confidence Ellipses */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Confidence Ellipses
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="(\mathbf{x} - \boldsymbol{\mu})^T \mathbf{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu}) = c^2" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
          <div><InlineMath math="c = 1" />: ~39% of data (1σ)</div>
          <div><InlineMath math="c = 2" />: ~86% of data (2σ)</div>
          <div><InlineMath math="c = 3" />: ~99% of data (3σ)</div>
        </p>
      </div>

      {/* Matrix Operations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          2×2 Matrix Operations
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Determinant:</p>
              <div className="min-w-max">
                <InlineMath math="|\mathbf{\Sigma}| = \sigma_{11}\sigma_{22} - \sigma_{12}^2" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Inverse:</p>
              <div className="min-w-max">
                <BlockMath math="\mathbf{\Sigma}^{-1} = \frac{1}{|\mathbf{\Sigma}|} \begin{bmatrix} \sigma_{22} & -\sigma_{12} \\ -\sigma_{12} & \sigma_{11} \end{bmatrix}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMLEFormulas = () => (
    <div className="space-y-4">
      {/* Mean Vector */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Mean Vector (Maximum Likelihood Estimate)
        </h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\hat{\boldsymbol{\mu}} = [\hat{\mu}_1, \hat{\mu}_2]^T = \frac{1}{N} \sum_{i=1}^{N} \mathbf{x}_i" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          <InlineMath math="\hat{\mu}_1 = \frac{1}{N} \sum_{i=1}^{N} x_{1i}" />, <InlineMath math="\hat{\mu}_2 = \frac{1}{N} \sum_{i=1}^{N} x_{2i}" />
        </p>
      </div>

      {/* Covariance Matrix */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Covariance Matrix (Maximum Likelihood Estimate)
        </h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\hat{\mathbf{\Sigma}} = \begin{bmatrix} \hat{\sigma}_{11} & \hat{\sigma}_{12} \\ \hat{\sigma}_{21} & \hat{\sigma}_{22} \end{bmatrix} = \frac{1}{N-1} \sum_{i=1}^{N} (\mathbf{x}_i - \hat{\boldsymbol{\mu}})(\mathbf{x}_i - \hat{\boldsymbol{\mu}})^T" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
          <div><InlineMath math="\hat{\sigma}_{11} = \frac{1}{N-1} \sum_{i=1}^{N} (x_{1i} - \hat{\mu}_1)^2" /></div>
          <div><InlineMath math="\hat{\sigma}_{12} = \hat{\sigma}_{21} = \frac{1}{N-1} \sum_{i=1}^{N} (x_{1i} - \hat{\mu}_1)(x_{2i} - \hat{\mu}_2)" /></div>
          <div><InlineMath math="\hat{\sigma}_{22} = \frac{1}{N-1} \sum_{i=1}^{N} (x_{2i} - \hat{\mu}_2)^2" /></div>
        </p>
      </div>

      {/* Log-Likelihood */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Log-Likelihood
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\ell(\boldsymbol{\mu}, \mathbf{\Sigma}) = \sum_{i=1}^{N} \log f(\mathbf{x}_i)" />
            <BlockMath math="= -\frac{N}{2} \log(2\pi) - \frac{1}{2} \log|\mathbf{\Sigma}| - \frac{1}{2} \sum_{i=1}^{N} d^2(\mathbf{x}_i, \boldsymbol{\mu})" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Maximized to find optimal parameters
        </p>
      </div>

      {/* Correlation Coefficient */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Correlation Coefficient
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\rho = \frac{\sigma_{12}}{\sqrt{\sigma_{11} \sigma_{22}}}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          <InlineMath math="\rho \in [-1, 1]" />: measures linear relationship strength
        </p>
      </div>
    </div>
  );

  const renderGradientFormulas = () => (
    <div className="space-y-4">
      {/* Gradient Descent Overview */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Gradient Descent for MLE
        </h4>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max space-y-2">
            <BlockMath math="\boldsymbol{\mu}^{(t+1)} = \boldsymbol{\mu}^{(t)} + \alpha \nabla_{\boldsymbol{\mu}} \ell" />
            <BlockMath math="\mathbf{\Sigma}^{(t+1)} = \mathbf{\Sigma}^{(t)} + \alpha \nabla_{\mathbf{\Sigma}} \ell" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          where <InlineMath math="\alpha" /> is the learning rate
        </p>
      </div>

      {/* Mean Gradients */}
      <div>
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">🔵 Mean Parameter Gradients</h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\frac{\partial \ell}{\partial \boldsymbol{\mu}} = \sum_{i=1}^{N} \mathbf{\Sigma}^{-1}(\mathbf{x}_i - \boldsymbol{\mu})" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Gradient points toward sample mean
        </p>
      </div>

      {/* Covariance Gradients */}
      <div>
        <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">🟠 Covariance Parameter Gradients</h4>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max space-y-2">
            <BlockMath math="\frac{\partial \ell}{\partial \mathbf{\Sigma}} = -\frac{N}{2} \mathbf{\Sigma}^{-1} + \frac{1}{2} \sum_{i=1}^{N} \mathbf{\Sigma}^{-1}(\mathbf{x}_i - \boldsymbol{\mu})(\mathbf{x}_i - \boldsymbol{\mu})^T\mathbf{\Sigma}^{-1}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Matrix gradient balances regularization and data fit
        </p>
      </div>

      {/* Symmetry Constraint */}
      <div>
        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ Symmetry Constraint</h4>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="text-xs space-y-2">
            <p className="font-medium text-gray-900 dark:text-gray-100">For off-diagonal elements:</p>
            <div className="min-w-max">
              <BlockMath math="\frac{\partial \ell}{\partial \sigma_{12}} = 2 \times \left(\frac{\partial \ell}{\partial \mathbf{\Sigma}}\right)_{12}" />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Factor of 2 needed because <InlineMath math="\sigma_{12} = \sigma_{21}" /> in symmetric matrices
        </p>
      </div>

      {/* Regularization */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Positive Definiteness
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="text-xs space-y-2">
            <div><strong>Constraint:</strong> <InlineMath math="|\mathbf{\Sigma}| > 0" /></div>
            <div><strong>Correlation bound:</strong> <InlineMath math="|\rho| < 1" /></div>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Ensures valid covariance matrix during optimization
        </p>
      </div>
    </div>
  );

  const sections: FormulaSection[] = [
    { id: 'distribution', label: 'Distribution', icon: '📊', content: renderDistributionFormulas() },
    { id: 'mle', label: 'MLE & Stats', icon: '🎯', content: renderMLEFormulas() },
    { id: 'gradients', label: 'Optimization', icon: '📈', content: renderGradientFormulas() }
  ];

  return (
    <TabbedFormulaPanel
      title="2D Gaussian Mathematical Formulas"
      subtitle="Multivariate normal distribution theory"
      sections={sections}
      defaultSection="distribution"
      tabStyle="pills"
      footer={
        <div>
          <p><strong>Interactive:</strong> Hover over the chart to see probability density and distance values!</p>
          <div className="mt-2">
            Mathematical notation follows Bishop's "Pattern Recognition and Machine Learning" (2006)
          </div>
        </div>
      }
    />
  );
}