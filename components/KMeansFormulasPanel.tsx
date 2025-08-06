'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import TabbedFormulaPanel from './ui/TabbedFormulaPanel';
import type { FormulaSection } from './ui/TabbedFormulaPanel';

interface KMeansFormulasPanelProps {
  clusterCount: number;
}

export default function KMeansFormulasPanel({ clusterCount }: KMeansFormulasPanelProps) {

  const renderAlgorithmFormulas = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">K-Means Algorithm</h4>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto transition-colors">
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

  const sections: FormulaSection[] = [
    { id: 'algorithm', label: 'Algorithm', icon: '🔄', content: renderAlgorithmFormulas() },
    { id: 'objective', label: 'Objective Function', icon: '🎯', content: renderObjectiveFormulas() },
    { id: 'metrics', label: 'Evaluation Metrics', icon: '📊', content: renderMetricsFormulas() }
  ];

  return (
    <TabbedFormulaPanel
      title="K-Means Formulation"
      subtitle={`k = ${clusterCount} clusters`}
      sections={sections}
      defaultSection="algorithm"
      tabStyle="underline"
      maxHeight="24rem"
    />
  );
}