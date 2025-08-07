'use client';

import React, { useState } from 'react';
import { parseCSV, generateSampleDataWithInfo, SampleDataConfig, GeneratedDataInfo } from '@/lib/csvParser';
import FileUploadBase from './ui/FileUploadBase';
import Button from './ui/Button';
import FormInput, { FormLabel } from './ui/FormInput';

interface FileUploadProps {
  onDataLoad: (data: number[]) => void;
}

interface CustomComponents {
  components: Array<{ mean: number; stdDev: number; weight: number }>;
}

export default function FileUpload({ onDataLoad }: FileUploadProps) {
  const [generatedInfo, setGeneratedInfo] = useState<GeneratedDataInfo | null>(null);
  const [customComponents, setCustomComponents] = useState([
    { mean: 3, stdDev: 1, weight: 0.6 },
    { mean: 8, stdDev: 1.2, weight: 0.4 }
  ]);

  const presetDescriptions = {
    bimodal: 'Two well-separated peaks (classic mixture)',
    trimodal: 'Three distinct components',
    overlapping: 'Two overlapping distributions', 
    separated: 'Two widely separated narrow peaks',
    uniform: 'Single broad distribution',
    custom: 'Configure your own mixture components'
  };

  const updateCustomComponent = (index: number, field: keyof typeof customComponents[0], value: number) => {
    const updated = [...customComponents];
    updated[index] = { ...updated[index], [field]: value };
    setCustomComponents(updated);
  };

  const addCustomComponent = () => {
    setCustomComponents([...customComponents, { mean: 5, stdDev: 1, weight: 0.3 }]);
  };

  const removeCustomComponent = (index: number) => {
    if (customComponents.length > 1) {
      setCustomComponents(customComponents.filter((_, i) => i !== index));
    }
  };

  const handleGenerateSampleData = (config: Partial<SampleDataConfig>) => {
    const fullConfig = { ...config };
    if (config.preset === 'custom') {
      fullConfig.components = customComponents;
    }
    const dataInfo = generateSampleDataWithInfo(fullConfig);
    setGeneratedInfo(dataInfo);
    return dataInfo.data;
  };

  const customConfigFields = (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom Components
        </label>
        <Button
          onClick={addCustomComponent}
          variant="primary"
          size="sm"
          className="text-xs"
        >
          + Add Component
        </Button>
      </div>
      
      <div className="space-y-2">
        {customComponents.map((comp, index) => (
          <div key={index} className="flex gap-2 items-center p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 transition-colors">
            <div className="flex-1">
              <FormLabel size="xs">Mean</FormLabel>
              <FormInput
                type="number"
                step="0.1"
                value={comp.mean}
                onChange={(value) => updateCustomComponent(index, 'mean', parseFloat(value))}
                size="sm"
              />
            </div>
            <div className="flex-1">
              <FormLabel size="xs">Std Dev</FormLabel>
              <FormInput
                type="number"
                step="0.1"
                min="0.1"
                value={comp.stdDev}
                onChange={(value) => updateCustomComponent(index, 'stdDev', parseFloat(value))}
                size="sm"
              />
            </div>
            <div className="flex-1">
              <FormLabel size="xs">Weight</FormLabel>
              <FormInput
                type="number"
                step="0.1"
                min="0.1"
                value={comp.weight}
                onChange={(value) => updateCustomComponent(index, 'weight', parseFloat(value))}
                size="sm"
              />
            </div>
            {customComponents.length > 1 && (
              <Button
                onClick={() => removeCustomComponent(index)}
                variant="danger"
                size="sm"
                className="text-xs"
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Weights will be automatically normalized. Mean and standard deviation control the position and spread of each component.
      </p>
    </div>
  );

  return (
    <>
      <FileUploadBase<number, SampleDataConfig, CustomComponents>
        title="Data Input"
        uploadButtonText="Upload CSV File"
        generateButtonText="Generate Sample Data"
        acceptedFileTypes=".csv,.txt"
        description="Upload a CSV file with numerical data or generate mathematically precise sample data with configurable distributions."
        onDataLoad={onDataLoad}
        parseCSV={(csvText) => {
          const data = parseCSV(csvText);
          setGeneratedInfo(null); // Clear any previous generation info
          return data;
        }}
        generateSampleData={handleGenerateSampleData}
        initialConfig={{
          totalPoints: 100,
          preset: 'bimodal'
        }}
        initialCustomConfig={{ components: customComponents }}
        presetDescriptions={presetDescriptions}
        customConfigFields={customConfigFields}
        invalidDataMessage="No valid numerical data found in the file"
      />
      
      {generatedInfo && (
        <div className="mb-4 pt-4 border-t dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg transition-colors">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">Generated Distribution Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-600 transition-colors">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Data Statistics</h5>
              <div className="space-y-1 text-xs text-gray-900 dark:text-gray-100">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <span className="font-mono">{generatedInfo.statistics.count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mean:</span>
                  <span className="font-mono">{generatedInfo.statistics.mean.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Std Dev:</span>
                  <span className="font-mono">{generatedInfo.statistics.stdDev.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="font-mono">{generatedInfo.statistics.min.toFixed(2)} - {generatedInfo.statistics.max.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-600 transition-colors">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Distribution Configuration</h5>
              <div className="space-y-1 text-xs text-gray-900 dark:text-gray-100">
                <div className="flex justify-between">
                  <span>Preset:</span>
                  <span className="font-mono">{generatedInfo.actualConfig.preset || 'custom'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Components:</span>
                  <span className="font-mono">{generatedInfo.actualConfig.components.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-600 transition-colors">
            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Component Details</h5>
            <div className="space-y-2">
              {generatedInfo.actualConfig.components.map((comp, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs transition-colors">
                  <div className="flex gap-4 text-gray-900 dark:text-gray-100">
                    <span><strong>Component {index + 1}:</strong></span>
                    <span>μ = {comp.mean.toFixed(2)}</span>
                    <span>σ = {comp.stdDev.toFixed(2)}</span>
                    <span>π = {comp.weight.toFixed(3)}</span>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                    {generatedInfo.statistics.componentCounts[index]} points
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            <strong>Note:</strong> These are the exact parameters used to generate your data. The EM algorithm will attempt to recover these values.
          </div>
        </div>
      )}
    </>
  );
}