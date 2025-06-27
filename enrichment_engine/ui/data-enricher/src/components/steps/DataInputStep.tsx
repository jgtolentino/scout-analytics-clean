import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEnrichmentStore } from '../../store/enrichmentStore';

export const DataInputStep: React.FC = () => {
  const { uploadedFile, setUploadedFile, setCampaignData, setCurrentStep, markStepCompleted } = useEnrichmentStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      
      // Mock parsing the file
      setCampaignData({
        name: 'DITO Independence Day Campaign',
        dateRange: 'June 1-15, 2024',
        metrics: {
          reach: 1500000,
          engagement: 85000,
          sentiment: 75,
        },
      });
    }
  }, [setUploadedFile, setCampaignData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const handleContinue = () => {
    if (uploadedFile) {
      markStepCompleted('data_input');
      setCurrentStep('enrichment_config');
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setCampaignData(null);
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Campaign Data</h2>
        <p className="text-gray-600 mb-8">
          Upload your campaign metrics file or connect to a data source to begin the enrichment process.
        </p>

        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-2">
              {isDragActive ? 'Drop the file here...' : 'Drag and drop your file here, or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, CSV, JSON, XLSX (max 10MB)
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <DocumentIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{uploadedFile.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detected Data:</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• Campaign: DITO Independence Day Campaign</p>
                        <p>• Period: June 1-15, 2024</p>
                        <p>• Metrics: Reach, Engagement, Sentiment</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Alternative Input Methods */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left">
            <h4 className="font-medium text-gray-900 mb-1">Connect API</h4>
            <p className="text-sm text-gray-500">Google Analytics, Facebook Ads</p>
          </button>
          <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left">
            <h4 className="font-medium text-gray-900 mb-1">Manual Input</h4>
            <p className="text-sm text-gray-500">Enter metrics manually</p>
          </button>
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!uploadedFile}
            className="btn-primary"
          >
            Continue to Configuration
          </button>
        </div>
      </div>
    </div>
  );
};