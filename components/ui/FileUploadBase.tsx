'use client';

import React, { useRef, useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import Button from './Button';

export interface FileUploadBaseProps<TData, TConfig, TCustomConfig> {
  title: string;
  uploadButtonText: string;
  generateButtonText: string;
  acceptedFileTypes: string;
  description: string;
  onDataLoad: (data: TData[]) => void;
  parseCSV: (csvText: string) => TData[];
  generateSampleData: (config: Partial<TConfig>) => TData[];
  initialConfig: Partial<TConfig>;
  initialCustomConfig: TCustomConfig;
  presetDescriptions: Record<string, string>;
  customConfigFields?: React.ReactNode;
  invalidDataMessage: string;
}

export default function FileUploadBase<TData, TConfig extends { totalPoints?: number; preset?: string }, TCustomConfig>({
  title,
  uploadButtonText,
  generateButtonText,
  acceptedFileTypes,
  description,
  onDataLoad,
  parseCSV,
  generateSampleData,
  initialConfig,
  initialCustomConfig,
  presetDescriptions,
  customConfigFields,
  invalidDataMessage
}: FileUploadBaseProps<TData, TConfig, TCustomConfig>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sampleConfig, setSampleConfig] = useState<Partial<TConfig>>(initialConfig);
  const [customConfig, setCustomConfig] = useState<TCustomConfig>(initialCustomConfig);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const data = parseCSV(csvText);
        if (data.length === 0) {
          alert(invalidDataMessage);
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
    const data = generateSampleData(config);
    onDataLoad(data);
  };

  return (
    <CollapsiblePanel 
      title={title}
      className="mb-4"
    >
      <div className="flex gap-4 items-center mb-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            size="lg"
          >
            {uploadButtonText}
          </Button>
        </div>
        
        <span className="text-gray-500 dark:text-gray-400">or</span>
        
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateSample}
            variant="success"
            size="lg"
          >
            {generateButtonText}
          </Button>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="gray"
            size="sm"
          >
            {showAdvanced ? '▲' : '▼'} Options
          </Button>
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
                value={sampleConfig.totalPoints || 100}
                onChange={(e) => setSampleConfig({...sampleConfig, totalPoints: parseInt(e.target.value) as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Distribution Preset
              </label>
              <select
                value={sampleConfig.preset || Object.keys(presetDescriptions)[0]}
                onChange={(e) => setSampleConfig({...sampleConfig, preset: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
              >
                {Object.entries(presetDescriptions).map(([key, desc]) => (
                  <option key={key} value={key}>{key} - {desc}</option>
                ))}
              </select>
            </div>
          </div>

          {sampleConfig.preset === 'custom' && customConfigFields && (
            <div>
              {React.cloneElement(customConfigFields as React.ReactElement, {
                customConfig,
                setCustomConfig
              })}
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Selected:</strong> {presetDescriptions[sampleConfig.preset as keyof typeof presetDescriptions] || 'Unknown preset'} 
            ({sampleConfig.totalPoints || 100} points)
          </div>
        </div>
      )}
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {description}
      </p>
    </CollapsiblePanel>
  );
}