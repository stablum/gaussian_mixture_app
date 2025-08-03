'use client';

import React from 'react';

interface CurveVisibilityControlsProps {
  visibility: {
    mixture: boolean;
    components: boolean;
    posteriors: boolean;
    dataPoints: boolean;
  };
  onVisibilityChange: (key: keyof CurveVisibilityControlsProps['visibility'], value: boolean) => void;
}

export default function CurveVisibilityControls({ visibility, onVisibilityChange }: CurveVisibilityControlsProps) {
  const controls = [
    { key: 'mixture' as const, label: 'Mixture Distribution', color: 'text-gray-900 dark:text-gray-100' },
    { key: 'components' as const, label: 'Component Densities', color: 'text-blue-600 dark:text-blue-400' },
    { key: 'posteriors' as const, label: 'Posteriors (scaled)', color: 'text-green-600 dark:text-green-400' },
    { key: 'dataPoints' as const, label: 'Data Points', color: 'text-indigo-600 dark:text-indigo-400' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chart Display</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Toggle curve visibility
        </div>
      </div>
      
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
        <p><strong>Teaching Tip:</strong> Hide curves to focus on specific aspects during explanations</p>
      </div>
    </div>
  );
}