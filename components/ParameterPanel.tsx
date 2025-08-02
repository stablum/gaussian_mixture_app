'use client';

import React from 'react';
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
}

export default function ParameterPanel({ 
  components, 
  hoverInfo, 
  onComponentCountChange 
}: ParameterPanelProps) {

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Parameters</h3>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Components:</label>
          <select
            value={components.length}
            onChange={(e) => onComponentCountChange(parseInt(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {components.map((component, index) => (
          <div 
            key={index}
            className="border rounded p-3"
            style={{ borderLeftColor: getComponentColor(index), borderLeftWidth: '4px' }}
          >
            <h4 className="font-medium mb-2" style={{ color: getComponentColor(index) }}>
              Component {index + 1}
            </h4>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium">μ (Mean):</span>
                <div className="font-mono">{component.mu.toFixed(3)}</div>
              </div>
              
              <div>
                <span className="font-medium">σ (Std):</span>
                <div className="font-mono">{component.sigma.toFixed(3)}</div>
              </div>
              
              <div>
                <span className="font-medium">π (Weight):</span>
                <div className="font-mono">{component.pi.toFixed(3)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hoverInfo && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Query at x = {hoverInfo.x.toFixed(3)}</h4>
          
          <div className="space-y-2 text-sm">
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
            
            <div className="text-xs text-gray-600 mt-2">
              Posterior probabilities sum to: {hoverInfo.probabilities.posteriors.reduce((sum, p) => sum + p, 0).toFixed(4)}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t text-xs text-gray-600">
        <p><strong>Tip:</strong> Drag the colored circles to adjust μ (horizontally) and π (vertically)</p>
      </div>
    </div>
  );
}