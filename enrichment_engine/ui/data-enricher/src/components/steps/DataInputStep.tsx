import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CogIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useEnrichmentStore } from '../../store/enrichmentStore';

const API_BASE_URL = 'http://localhost:8000';

export const DataInputStep: React.FC = () => {
  const { uploadedFile, setUploadedFile, setCampaignData, setCurrentStep, markStepCompleted } = useEnrichmentStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      
      // Automatically analyze the file with our enrichment API
      await analyzeFile(file);
    }
  }, [setUploadedFile, setCampaignData]);

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaign_id', `campaign_${Date.now()}`);
      formData.append('connectors', JSON.stringify(['facebook_ads', 'google_serp', 'social_media']));

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setJobId(result.job_id);
        // Poll for analysis results
        pollAnalysisResults(result.job_id);
      } else {
        console.error('Analysis failed:', result.detail);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pollAnalysisResults = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        const job = await response.json();

        if (job.status === 'ready') {
          clearInterval(interval);
          setAnalysisResult(job);
          
          // Extract campaign data from analysis
          setCampaignData({
            name: job.plan?.campaign_id || 'Analyzed Campaign',
            dateRange: new Date().toLocaleDateString(),
            metrics: extractMetricsFromPlan(job.plan),
            jobId: jobId,
            missingFields: job.plan?.missing_fields || [],
            scrapePlan: job.plan?.scrape_plan || [],
          });
        } else if (job.status === 'failed') {
          clearInterval(interval);
          console.error('Analysis failed:', job.error);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling results:', error);
      }
    }, 2000);
  };

  const extractMetricsFromPlan = (plan: any) => {
    // Extract existing metrics from the enrichment plan
    const metrics: any = {};
    if (plan?.enrichment_preview?.enriched_metrics) {
      Object.entries(plan.enrichment_preview.enriched_metrics).forEach(([key, value]: [string, any]) => {
        metrics[key] = value.value;
      });
    }
    return metrics;
  };

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
    if (uploadedFile && analysisResult) {
      markStepCompleted('data_input');
      setCurrentStep('enrichment_config');
    }
  };

  const executeEnrichment = async () => {
    if (!jobId) return;
    
    try {
      // Move to processing step first
      markStepCompleted('data_input');
      markStepCompleted('enrichment_config');
      setCurrentStep('processing');
      
      // Store job ID for live monitoring
      setCampaignData((prev: any) => prev ? {...prev, executingJobId: jobId, liveMode: true} : null);
      
      // Start live scraping with Server-Sent Events
      const eventSource = new EventSource(`${API_BASE_URL}/execute-live/${jobId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Live scraping update:', data);
          
          // Send log to processing step (this will be handled by the processing component)
          window.dispatchEvent(new CustomEvent('scrapingLog', { detail: data }));
          
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
      };
      
      // Store event source reference for cleanup
      setCampaignData((prev: any) => prev ? {...prev, eventSource} : null);
      
    } catch (error) {
      console.error('Error executing enrichment:', error);
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

        {/* Enrichment Pipeline Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            onClick={() => analysisResult && executeEnrichment()}
            disabled={!analysisResult || isAnalyzing}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <PlayIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Run Enrichment Pipeline</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {analysisResult 
                ? `Execute ${analysisResult.plan?.scrape_plan?.length || 0} scraping tasks`
                : 'Upload file first to enable pipeline'
              }
            </p>
          </button>
          <button 
            onClick={() => setCurrentStep('enrichment_config')}
            disabled={!analysisResult}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <CogIcon className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Configure Enrichment</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Customize sources and parameters
            </p>
          </button>
        </div>

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 font-medium">Analyzing campaign data...</p>
            </div>
            <p className="text-blue-600 text-sm mt-1">Our AI is identifying missing metrics and generating an enrichment plan.</p>
          </div>
        )}

        {/* Analysis Results Preview */}
        {analysisResult && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">✅ Analysis Complete</h4>
            <div className="space-y-2 text-sm text-green-700">
              <p>• Found {analysisResult.plan?.missing_fields?.length || 0} missing metrics</p>
              <p>• Generated {analysisResult.plan?.scrape_plan?.length || 0} enrichment tasks</p>
              <p>• Confidence score: {Math.round((analysisResult.plan?.confidence || 0) * 100)}%</p>
            </div>
            {analysisResult.plan?.missing_fields?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-green-800">Missing metrics to enrich:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysisResult.plan.missing_fields.map((field: string) => (
                    <span key={field} className="px-2 py-1 bg-white text-green-700 text-xs rounded border border-green-300">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!uploadedFile || !analysisResult}
            className="btn-primary"
          >
            {analysisResult ? 'Continue to Configuration' : 'Upload and analyze file first'}
          </button>
        </div>
      </div>
    </div>
  );
};