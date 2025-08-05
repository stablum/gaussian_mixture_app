'use client';

import React, { useState } from 'react';
import { AlgorithmMode } from '@/lib/algorithmTypes';

interface CurveVisibilityControlsProps {
  mode?: AlgorithmMode;
  visibility: {
    mixture: boolean;
    components: boolean;
    posteriors: boolean;
    dataPoints: boolean;
  };
  onVisibilityChange: (key: keyof CurveVisibilityControlsProps['visibility'], value: boolean) => void;
}

export default function CurveVisibilityControls({ 
  mode = AlgorithmMode.GMM, 
  visibility, 
  onVisibilityChange 
}: CurveVisibilityControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isKMeans = mode === AlgorithmMode.KMEANS;
  const isGaussian2D = mode === AlgorithmMode.GAUSSIAN_2D;
  
  // Define controls based on algorithm mode
  const controls = isKMeans ? [
    { key: 'mixture' as const, label: 'Cluster Centroids', color: 'text-gray-900 dark:text-gray-100' },
    { key: 'components' as const, label: 'Cluster Boundaries', color: 'text-blue-600 dark:text-blue-400' },
    { key: 'dataPoints' as const, label: 'Data Points (Colored)', color: 'text-indigo-600 dark:text-indigo-400' }
  ] : isGaussian2D ? [
    { key: 'mixture' as const, label: 'Probability Density Heatmap', color: 'text-gray-900 dark:text-gray-100' },
    { key: 'components' as const, label: 'Confidence Ellipses', color: 'text-blue-600 dark:text-blue-400' },
    { key: 'posteriors' as const, label: 'Mean Point (μ)', color: 'text-green-600 dark:text-green-400' },
    { key: 'dataPoints' as const, label: 'Data Points', color: 'text-indigo-600 dark:text-indigo-400' }
  ] : [
    { key: 'mixture' as const, label: 'Mixture Distribution', color: 'text-gray-900 dark:text-gray-100' },
    { key: 'components' as const, label: 'Component Densities', color: 'text-blue-600 dark:text-blue-400' },
    { key: 'posteriors' as const, label: 'Posteriors (scaled)', color: 'text-green-600 dark:text-green-400' },
    { key: 'dataPoints' as const, label: 'Data Points', color: 'text-indigo-600 dark:text-indigo-400' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors" style={{ padding: isCollapsed ? '8px 16px' : '16px' }}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-3'}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isKMeans ? 'Visualization Options' : isGaussian2D ? '2D Chart Display' : 'Chart Display'}
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isKMeans ? 'Toggle visualization elements' : isGaussian2D ? 'Toggle 2D display elements' : 'Toggle curve visibility'}
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
          <div className="space-y-2">
            {controls.map((control) => (
              <label key={control.key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibility[control.key]}
                  onChange={(e) => onVisibilityChange(control.key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className={`text-sm font-medium ${control.color}`}>
                  {control.label}
                </span>
              </label>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
            <p>
              <strong>Teaching Tip:</strong> {
                isKMeans 
                  ? 'Hide elements to focus on specific aspects of clustering during explanations'
                  : isGaussian2D
                    ? 'Hide elements to focus on specific aspects of 2D Gaussian fitting during explanations'
                    : 'Hide curves to focus on specific aspects during explanations'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}