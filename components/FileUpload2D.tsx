'use client';

import React, { useRef, useState } from 'react';
import { parseCSV2D, generateSampleData2D, SampleData2DConfig } from '@/lib/csvParser';
import { Point2D } from '@/lib/gaussian2d';
import CollapsiblePanel from './ui/CollapsiblePanel';

interface FileUpload2DProps {
  onDataLoad: (data: Point2D[]) => void;
}

export default function FileUpload2D({ onDataLoad }: FileUpload2DProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sampleConfig, setSampleConfig] = useState<Partial<SampleData2DConfig>>({
    totalPoints: 100,
    preset: 'correlated'
  });
  const [customConfig, setCustomConfig] = useState({
    meanX: 0,
    meanY: 0,
    covarianceXX: 2,
    covarianceXY: 1.2,
    covarianceYY: 2
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const data = parseCSV2D(csvText);
        if (data.length === 0) {
          alert('No valid 2D numerical data found in the file. Expected format: x,y on each line.');
          return;
        }
        onDataLoad(data);
      } catch (error) {
        alert('Error parsing CSV file: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSample = () => {
    const config = { ...sampleConfig };
    if (sampleConfig.preset === 'custom') {
      config.mean = { x: customConfig.meanX, y: customConfig.meanY };
      config.covariance = {
        xx: customConfig.covarianceXX,
        xy: customConfig.covarianceXY,
        yy: customConfig.covarianceYY
      };
    }
    const data = generateSampleData2D(config);
    onDataLoad(data);
  };

  const presetDescriptions = {
    circular: 'Circular distribution (no correlation)',
    elliptical: 'Elliptical distribution (stretched along X)',
    correlated: 'Positively correlated X and Y',
    anticorrelated: 'Negatively correlated X and Y',
    stretched: 'Highly stretched distribution',
    custom: 'Configure your own mean and covariance'
  };

  return (
    <CollapsiblePanel 
      title="2D Data Input"
      className="mb-4"
    >
          <div className="flex gap-4 items-center mb-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                Upload 2D CSV File
              </button>
            </div>
            
            <span className="text-gray-500 dark:text-gray-400">or</span>
            
            <div className="flex gap-2">
              <button
                onClick={handleGenerateSample}
                className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
              >
                Generate 2D Sample Data
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-3 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
              >
                {showAdvanced ? '▲' : '▼'} Options
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="border-t dark:border-gray-600 pt-4 space-y-4 bg-gray-50 dark:bg-gray-800 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Data Points
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={sampleConfig.totalPoints}
                    onChange={(e) => setSampleConfig({...sampleConfig, totalPoints: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Distribution Preset
                  </label>
                  <select
                    value={sampleConfig.preset}
                    onChange={(e) => setSampleConfig({...sampleConfig, preset: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  >
                    {Object.entries(presetDescriptions).map(([key, desc]) => (
                      <option key={key} value={key}>{key} - {desc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {sampleConfig.preset === 'custom' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Custom 2D Gaussian Parameters
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Mean X (μₓ)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customConfig.meanX}
                        onChange={(e) => setCustomConfig({...customConfig, meanX: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Mean Y (μᵧ)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customConfig.meanY}
                        onChange={(e) => setCustomConfig({...customConfig, meanY: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Variance X (σₓₓ)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={customConfig.covarianceXX}
                        onChange={(e) => setCustomConfig({...customConfig, covarianceXX: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Covariance (σₓᵧ)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customConfig.covarianceXY}
                        onChange={(e) => setCustomConfig({...customConfig, covarianceXY: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Variance Y (σᵧᵧ)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={customConfig.covarianceYY}
                        onChange={(e) => setCustomConfig({...customConfig, covarianceYY: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Covariance matrix: [[σₓₓ, σₓᵧ], [σₓᵧ, σᵧᵧ]]. Positive σₓᵧ creates positive correlation, negative creates negative correlation.
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Selected:</strong> {presetDescriptions[sampleConfig.preset as keyof typeof presetDescriptions]} 
                ({sampleConfig.totalPoints} points)
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Upload a CSV file with 2D data (x,y format) or generate sample 2D data from various multivariate normal distributions.
          </p>
    </CollapsiblePanel>
  );
}