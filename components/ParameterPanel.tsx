'use client';

import React, { useState } from 'react';
import { GaussianComponent } from '@/lib/gmm';
import { getComponentColor } from '@/lib/colors';

interface ParameterPanelProps {
  components: GaussianComponent[];
  hoverInfo?: {
    x: number;
    probabilities: {
      total: number;
      componentProbs: number[];
      posteriors: number[];
    };
  } | null;
  onComponentCountChange: (newCount: number) => void;
  onParameterChange: (index: number, parameter: 'mu' | 'sigma' | 'pi', value: number) => void;
}

export default function ParameterPanel({ 
  components, 
  hoverInfo, 
  onComponentCountChange,
  onParameterChange
}: ParameterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors" style={{ padding: isCollapsed ? '8px 16px' : '16px' }}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parameters</h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Components:</label>
            <select
              value={components.length}
              onChange={(e) => onComponentCountChange(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
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
          <div className="space-y-4">
            {components.map((component, index) => (
              <div 
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700 transition-colors"
                style={{ borderLeftColor: getComponentColor(index), borderLeftWidth: '4px' }}
              >
                <h4 className="font-medium mb-2" style={{ color: getComponentColor(index) }}>
                  Component {index + 1}
                </h4>
                
                <div className="grid grid-cols-3 gap-3 text-sm text-gray-900 dark:text-gray-100">
                  <div>
                    <label className="font-medium block mb-1">μ (Mean):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={component.mu.toFixed(3)}
                      onChange={(e) => onParameterChange(index, 'mu', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="font-medium block mb-1">σ (Std):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={component.sigma.toFixed(3)}
                      onChange={(e) => onParameterChange(index, 'sigma', Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="font-medium block mb-1">π (Weight):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="0.99"
                      value={component.pi.toFixed(3)}
                      onChange={(e) => onParameterChange(index, 'pi', Math.max(0.01, Math.min(0.99, parseFloat(e.target.value) || 0.01)))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hoverInfo && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Query at x = {hoverInfo.x.toFixed(3)}</h4>
              
              <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
                <div>
                  <span className="font-medium">Total Probability:</span>
                  <span className="ml-2 font-mono">{hoverInfo.probabilities.total.toFixed(4)}</span>
                </div>
                
                <div>
                  <span className="font-medium">Component Probabilities:</span>
                  <div className="mt-1 space-y-1">
                    {hoverInfo.probabilities.componentProbs.map((prob, index) => (
                      <div key={index} className="flex justify-between">
                        <span style={{ color: getComponentColor(index) }}>Component {index + 1}:</span>
                        <span className="font-mono">{prob.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Posterior Probabilities:</span>
                  <div className="mt-1 space-y-1">
                    {hoverInfo.probabilities.posteriors.map((posterior, index) => (
                      <div key={index} className="flex justify-between">
                        <span style={{ color: getComponentColor(index) }}>P(Component {index + 1} | x):</span>
                        <span className="font-mono">{posterior.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Posterior probabilities sum to: {hoverInfo.probabilities.posteriors.reduce((sum, p) => sum + p, 0).toFixed(4)}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
            <p><strong>Interactive Tips:</strong></p>
            <p>• Drag the rectangular handles (μ) to adjust means horizontally</p>
            <p>• Drag the colored circles to adjust both μ and π parameters</p>
          </div>
        </>
      )}
    </div>
  );
}