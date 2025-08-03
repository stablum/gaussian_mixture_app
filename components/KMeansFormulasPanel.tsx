'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface KMeansFormulasPanelProps {
  clusterCount: number;
}

export default function KMeansFormulasPanel({ clusterCount }: KMeansFormulasPanelProps) {
  const [activeSection, setActiveSection] = useState<'algorithm' | 'objective' | 'metrics'>('algorithm');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    { id: 'algorithm', label: 'Algorithm', icon: '🔄' },
    { id: 'objective', label: 'Objective Function', icon: '🎯' },
    { id: 'metrics', label: 'Evaluation Metrics', icon: '📊' }
  ] as const;

  const renderAlgorithmFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">K-Means Algorithm</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="C = \{C_1, C_2, \ldots, C_k\}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Where <InlineMath math="C_j" /> is the set of data points assigned to cluster <InlineMath math="j" />, and <InlineMath math="k = {clusterCount}" />.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Assignment Step</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="C_j^{(t+1)} = \{x_i : \|x_i - \mu_j^{(t)}\| \leq \|x_i - \mu_l^{(t)}\| \text{ for all } l\}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Assign each data point <InlineMath math="x_i" /> to the nearest centroid <InlineMath math="\mu_j^{(t)}" /> at iteration <InlineMath math="t" />.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Update Step</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="\mu_j^{(t+1)} = \frac{1}{|C_j^{(t+1)}|} \sum_{x_i \in C_j^{(t+1)}} x_i" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Update each centroid <InlineMath math="\mu_j" /> to the mean of points assigned to cluster <InlineMath math="j" />.
        </p>
      </div>
    </div>
  );

  const renderObjectiveFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Within-Cluster Sum of Squares (WCSS)</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="J = \sum_{j=1}^{k} \sum_{x_i \in C_j} \|x_i - \mu_j\|^2" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          The objective function that K-means minimizes. Also known as inertia.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">1D Simplified Form</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="J = \sum_{j=1}^{k} \sum_{x_i \in C_j} (x_i - \mu_j)^2" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          For 1D data, the squared Euclidean distance simplifies to squared difference.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Convergence Condition</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max space-y-2">
            <BlockMath math="\|\mu_j^{(t+1)} - \mu_j^{(t)}\| < \epsilon \quad \forall j" />
            <div className="text-center text-xs text-gray-600 dark:text-gray-400">or</div>
            <BlockMath math="|J^{(t+1)} - J^{(t)}| < \epsilon" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Algorithm converges when centroids stop moving or objective function change is below threshold <InlineMath math="\epsilon" />.
        </p>
      </div>
    </div>
  );

  const renderMetricsFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Cluster Assignment</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="c_i = \arg\min_j \|x_i - \mu_j\|" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Point <InlineMath math="x_i" /> is assigned to cluster <InlineMath math="c_i" /> with the nearest centroid.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Cluster Size</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="n_j = |C_j| = \sum_{i=1}^{n} \mathbb{I}(c_i = j)" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Number of points assigned to cluster <InlineMath math="j" />, where <InlineMath math="\mathbb{I}" /> is the indicator function.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Distance to Centroid</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max">
            <BlockMath math="d_{ij} = |x_i - \mu_j|" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Distance from data point <InlineMath math="x_i" /> to centroid <InlineMath math="\mu_j" /> in 1D space.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Properties</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
          <div className="min-w-max space-y-2">
            <BlockMath math="\sum_{j=1}^{k} n_j = n" />
            <BlockMath math="C_i \cap C_j = \emptyset \quad \text{for } i \neq j" />
            <BlockMath math="\bigcup_{j=1}^{k} C_j = \{x_1, x_2, \ldots, x_n\}" />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Clusters partition the data: they are disjoint and collectively exhaustive.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors" style={{ padding: isCollapsed ? '8px 16px' : '16px' }}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">K-Means Formulation</h3>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            k = {clusterCount} clusters
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
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
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <nav className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-1">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>

          <div className="overflow-y-auto max-h-96">
            {activeSection === 'algorithm' && renderAlgorithmFormulas()}
            {activeSection === 'objective' && renderObjectiveFormulas()}
            {activeSection === 'metrics' && renderMetricsFormulas()}
          </div>
        </>
      )}
    </div>
  );
}