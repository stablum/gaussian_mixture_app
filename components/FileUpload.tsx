'use client';

import React, { useRef } from 'react';
import { parseCSV, generateSampleData } from '@/lib/csvParser';

interface FileUploadProps {
  onDataLoad: (data: number[]) => void;
}

export default function FileUpload({ onDataLoad }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const data = parseCSV(csvText);
        if (data.length === 0) {
          alert('No valid numerical data found in the file');
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
    const sampleData = generateSampleData(100);
    onDataLoad(sampleData);
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Data Input</h3>
      
      <div className="flex gap-4 items-center">
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Upload CSV File
          </button>
        </div>
        
        <span className="text-gray-500">or</span>
        
        <button
          onClick={handleGenerateSample}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Generate Sample Data
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        Upload a CSV file with numerical data (with or without headers) or generate sample data to get started.
      </p>
    </div>
  );
}