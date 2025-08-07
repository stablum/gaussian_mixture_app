'use client';

import React from 'react';
import { parseCSV2D, generateSampleData2D, SampleData2DConfig } from '@/lib/csvParser';
import { Point2D } from '@/lib/gaussian2d';
import FileUploadBase from './ui/FileUploadBase';

interface FileUpload2DProps {
  onDataLoad: (data: Point2D[]) => void;
}

interface CustomConfig2D {
  meanX: number;
  meanY: number;
  covarianceXX: number;
  covarianceXY: number;
  covarianceYY: number;
}

export default function FileUpload2D({ onDataLoad }: FileUpload2DProps) {
  const presetDescriptions = {
    circular: 'Circular distribution (no correlation)',
    elliptical: 'Elliptical distribution (stretched along X)',
    correlated: 'Positively correlated X and Y',
    anticorrelated: 'Negatively correlated X and Y',
    stretched: 'Highly stretched distribution',
    custom: 'Configure your own mean and covariance'
  };

  const initialCustomConfig: CustomConfig2D = {
    meanX: 0,
    meanY: 0,
    covarianceXX: 2,
    covarianceXY: 1.2,
    covarianceYY: 2
  };

  const handleGenerateSampleData = (config: Partial<SampleData2DConfig>) => {
    const fullConfig = { ...config };
    if (config.preset === 'custom') {
      // The custom configuration will be handled by the custom fields
      fullConfig.mean = { x: initialCustomConfig.meanX, y: initialCustomConfig.meanY };
      fullConfig.covariance = {
        xx: initialCustomConfig.covarianceXX,
        xy: initialCustomConfig.covarianceXY,
        yy: initialCustomConfig.covarianceYY
      };
    }
    return generateSampleData2D(fullConfig);
  };

  const customConfigFields = (
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
            defaultValue={initialCustomConfig.meanX}
            onChange={(e) => {
              initialCustomConfig.meanX = parseFloat(e.target.value);
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Mean Y (μᵧ)</label>
          <input
            type="number"
            step="0.1"
            defaultValue={initialCustomConfig.meanY}
            onChange={(e) => {
              initialCustomConfig.meanY = parseFloat(e.target.value);
            }}
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
            defaultValue={initialCustomConfig.covarianceXX}
            onChange={(e) => {
              initialCustomConfig.covarianceXX = parseFloat(e.target.value);
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Covariance (σₓᵧ)</label>
          <input
            type="number"
            step="0.1"
            defaultValue={initialCustomConfig.covarianceXY}
            onChange={(e) => {
              initialCustomConfig.covarianceXY = parseFloat(e.target.value);
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Variance Y (σᵧᵧ)</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            defaultValue={initialCustomConfig.covarianceYY}
            onChange={(e) => {
              initialCustomConfig.covarianceYY = parseFloat(e.target.value);
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Covariance matrix: [[σₓₓ, σₓᵧ], [σₓᵧ, σᵧᵧ]]. Positive σₓᵧ creates positive correlation, negative creates negative correlation.
      </p>
    </div>
  );

  return (
    <FileUploadBase<Point2D, SampleData2DConfig, CustomConfig2D>
      title="2D Data Input"
      uploadButtonText="Upload 2D CSV File"
      generateButtonText="Generate 2D Sample Data"
      acceptedFileTypes=".csv,.txt"
      description="Upload a CSV file with 2D data (x,y format) or generate sample 2D data from various multivariate normal distributions."
      onDataLoad={onDataLoad}
      parseCSV={parseCSV2D}
      generateSampleData={handleGenerateSampleData}
      initialConfig={{
        totalPoints: 100,
        preset: 'correlated'
      }}
      initialCustomConfig={initialCustomConfig}
      presetDescriptions={presetDescriptions}
      customConfigFields={customConfigFields}
      invalidDataMessage="No valid 2D numerical data found in the file. Expected format: x,y on each line."
    />
  );
}