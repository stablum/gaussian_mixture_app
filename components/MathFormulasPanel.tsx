'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathFormulasPanelProps {
  componentCount: number;
}

export default function MathFormulasPanel({ componentCount }: MathFormulasPanelProps) {
  const [activeSection, setActiveSection] = useState<'mixture' | 'em' | 'posteriors'>('mixture');

  const sections = [
    { id: 'mixture', label: 'Mixture Model', icon: '🎯' },
    { id: 'em', label: 'EM Algorithm', icon: '🔄' },
    { id: 'posteriors', label: 'Posteriors', icon: '📊' }
  ] as const;

  const renderMixtureFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Gaussian Mixture Model</h4>
        <div className="bg-gray-50 p-3 rounded border">
          <BlockMath math="p(x) = \sum_{k=1}^{K} \pi_k \mathcal{N}(x | \mu_k, \sigma_k^2)" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Where <InlineMath math="\pi_k" /> are mixture weights, <InlineMath math="\mu_k" /> are means, and <InlineMath math="\sigma_k^2" /> are variances.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Gaussian Component</h4>
        <div className="bg-gray-50 p-3 rounded border">
          <BlockMath math="\mathcal{N}(x | \mu, \sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)" />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Constraints</h4>
        <div className="bg-gray-50 p-3 rounded border space-y-2">
          <BlockMath math="\sum_{k=1}^{K} \pi_k = 1" />
          <BlockMath math="\pi_k \geq 0 \quad \forall k" />
        </div>
      </div>
    </div>
  );

  const renderEMFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Log-Likelihood</h4>
        <div className="bg-gray-50 p-3 rounded border">
          <BlockMath math="\mathcal{L}(\theta) = \sum_{i=1}^{N} \log p(x_i | \theta)" />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-blue-600 mb-2">🔵 E-Step: Expectation</h4>
        <div className="bg-blue-50 p-3 rounded border">
          <BlockMath math="\gamma_{ik} = \frac{\pi_k \mathcal{N}(x_i | \mu_k, \sigma_k^2)}{\sum_{j=1}^{K} \pi_j \mathcal{N}(x_i | \mu_j, \sigma_j^2)}" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          <InlineMath math="\gamma_{ik}" /> = responsibility of component <InlineMath math="k" /> for data point <InlineMath math="x_i" />
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-600 mb-2">🟢 M-Step: Maximization</h4>
        <div className="bg-green-50 p-3 rounded border space-y-3">
          <div>
            <p className="text-xs font-medium mb-1">Effective sample size:</p>
            <BlockMath math="N_k = \sum_{i=1}^{N} \gamma_{ik}" />
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1">Update mixture weights:</p>
            <BlockMath math="\pi_k^{new} = \frac{N_k}{N}" />
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1">Update means:</p>
            <BlockMath math="\mu_k^{new} = \frac{1}{N_k} \sum_{i=1}^{N} \gamma_{ik} x_i" />
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1">Update variances:</p>
            <BlockMath math="\sigma_k^{2,new} = \frac{1}{N_k} \sum_{i=1}^{N} \gamma_{ik} (x_i - \mu_k^{new})^2" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPosteriorsFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Posterior Probability</h4>
        <div className="bg-gray-50 p-3 rounded border">
          <BlockMath math="P(k | x) = \frac{P(x | k) P(k)}{P(x)} = \frac{\pi_k \mathcal{N}(x | \mu_k, \sigma_k^2)}{\sum_{j=1}^{K} \pi_j \mathcal{N}(x | \mu_j, \sigma_j^2)}" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Probability that data point <InlineMath math="x" /> belongs to component <InlineMath math="k" />
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Bayes' Theorem Components</h4>
        <div className="bg-gray-50 p-3 rounded border space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Prior:</p>
              <InlineMath math="P(k) = \pi_k" />
            </div>
            <div>
              <p className="font-medium">Likelihood:</p>
              <InlineMath math="P(x | k) = \mathcal{N}(x | \mu_k, \sigma_k^2)" />
            </div>
          </div>
          <div>
            <p className="font-medium">Evidence:</p>
            <InlineMath math="P(x) = \sum_{j=1}^{K} \pi_j \mathcal{N}(x | \mu_j, \sigma_j^2)" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Properties</h4>
        <div className="bg-gray-50 p-3 rounded border space-y-2">
          <BlockMath math="\sum_{k=1}^{K} P(k | x) = 1" />
          <BlockMath math="0 \leq P(k | x) \leq 1 \quad \forall k" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Mathematical Formulation</h3>
        <div className="text-xs text-gray-500">
          K = {componentCount} components
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeSection === section.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-1">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeSection === 'mixture' && renderMixtureFormulas()}
        {activeSection === 'em' && renderEMFormulas()}
        {activeSection === 'posteriors' && renderPosteriorsFormulas()}
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-600">
        <p><strong>Interactive:</strong> Hover over the chart to see posterior probabilities in action!</p>
      </div>
    </div>
  );
}