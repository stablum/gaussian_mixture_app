'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { AlgorithmMode } from '@/lib/algorithmTypes';
import KMeansFormulasPanel from './KMeansFormulasPanel';
import TabbedFormulaPanel from './ui/TabbedFormulaPanel';
import type { FormulaSection } from './ui/TabbedFormulaPanel';

interface MathFormulasPanelProps {
  componentCount: number;
  mode?: AlgorithmMode;
}

export default function MathFormulasPanel({ componentCount, mode = AlgorithmMode.GMM }: MathFormulasPanelProps) {
  // If K-means mode, render the K-means formulas panel instead
  if (mode === AlgorithmMode.KMEANS) {
    return <KMeansFormulasPanel clusterCount={componentCount} />;
  }

  const renderMixtureFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Gaussian Mixture Model</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="p(x) = \sum_{k=1}^{K} \pi_k \mathcal{N}(x | \mu_k, \sigma_k^2)" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Where <InlineMath math="\pi_k" /> are mixing coefficients, <InlineMath math="\mu_k" /> are component means, and <InlineMath math="\sigma_k^2" /> are component variances for component <InlineMath math="k" />.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Gaussian Component</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\mathcal{N}(x | \mu_k, \sigma_k^2) = \frac{1}{\sqrt{2\pi\sigma_k^2}} \exp\left(-\frac{(x-\mu_k)^2}{2\sigma_k^2}\right)" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Individual Gaussian component <InlineMath math="k" /> with parameters <InlineMath math="\mu_k" /> and <InlineMath math="\sigma_k^2" />
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Constraints</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max space-y-2">
            <BlockMath math="\sum_{k=1}^{K} \pi_k = 1" />
            <BlockMath math="\pi_k \geq 0 \quad \forall k \in \{1, 2, \ldots, K\}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Mixing coefficients must be non-negative and sum to unity
        </p>
      </div>
    </div>
  );

  const renderEMFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Log-Likelihood</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\mathcal{L}(\theta) = \sum_{i=1}^{N} \log p(x_i | \theta)" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">🔵 E-Step: Expectation</h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\gamma(z_{nk}) = \frac{\pi_k \mathcal{N}(x_n | \mu_k, \sigma_k^2)}{\sum_{j=1}^{K} \pi_j \mathcal{N}(x_n | \mu_j, \sigma_j^2)}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Responsibility that component <InlineMath math="k" /> takes for explaining observation <InlineMath math="x_n" /> (Bishop's notation)
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">🟢 M-Step: Maximization</h4>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-gray-200 dark:border-gray-600 space-y-3 transition-colors">
          <div>
            <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Effective sample size:</p>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <BlockMath math="N_k = \sum_{n=1}^{N} \gamma(z_{nk})" />
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Update mixing coefficients:</p>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <BlockMath math="\pi_k^{new} = \frac{N_k}{N}" />
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Update means:</p>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <BlockMath math="\mu_k^{new} = \frac{1}{N_k} \sum_{n=1}^{N} \gamma(z_{nk}) x_n" />
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Update variances:</p>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <BlockMath math="\sigma_k^{2,new} = \frac{1}{N_k} \sum_{n=1}^{N} \gamma(z_{nk}) (x_n - \mu_k^{new})^2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPosteriorsFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Posterior Probability</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="p(z_k = 1 | x) = \frac{p(x | z_k = 1) p(z_k = 1)}{p(x)} = \frac{\pi_k \mathcal{N}(x | \mu_k, \sigma_k^2)}{\sum_{j=1}^{K} \pi_j \mathcal{N}(x | \mu_j, \sigma_j^2)}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Posterior probability that latent variable <InlineMath math="z_k = 1" /> (i.e., component <InlineMath math="k" /> generated observation <InlineMath math="x" />)
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Bayes' Theorem Components</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 space-y-2 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Prior:</p>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <InlineMath math="p(z_k = 1) = \pi_k" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Likelihood:</p>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <InlineMath math="p(x | z_k = 1) = \mathcal{N}(x | \mu_k, \sigma_k^2)" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Evidence:</p>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <InlineMath math="p(x) = \sum_{j=1}^{K} \pi_j \mathcal{N}(x | \mu_j, \sigma_j^2)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Properties</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max space-y-2">
            <BlockMath math="\sum_{k=1}^{K} p(z_k = 1 | x) = 1" />
            <BlockMath math="0 \leq p(z_k = 1 | x) \leq 1 \quad \forall k \in \{1, 2, \ldots, K\}" />
          </div>
        </div>
      </div>
    </div>
  );

  const sections: FormulaSection[] = [
    { id: 'mixture', label: 'Mixture Model', icon: '🎯', content: renderMixtureFormulas() },
    { id: 'em', label: 'EM Algorithm', icon: '🔄', content: renderEMFormulas() },
    { id: 'posteriors', label: 'Posteriors', icon: '📊', content: renderPosteriorsFormulas() }
  ];

  return (
    <TabbedFormulaPanel
      title="Mathematical Formulation"
      subtitle={`K = ${componentCount} components`}
      sections={sections}
      defaultSection="mixture"
      tabStyle="pills"
      footer={
        <p><strong>Interactive:</strong> Hover over the chart to see posterior probabilities in action!</p>
      }
    />
  );
}