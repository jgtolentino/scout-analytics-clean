import React, { useEffect, useState } from 'react';
import { useEnrichmentStore } from '../../store/enrichmentStore';

export const ProcessingStep: React.FC = () => {
  const { processing, campaignData, addLog, updateProcessingState } = useEnrichmentStore();
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [scrapersEnabled, setScrapersEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Auto-scroll logs to bottom
    const logsContainer = document.getElementById('logs-container');
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }, [processing.logs, liveLogs]);

  useEffect(() => {
    // Listen for live scraping logs
    const handleScrapingLog = (event: any) => {
      const data = event.detail;
      
      if (data.type === 'status') {
        setScrapersEnabled(data.scrapers_enabled);
        addLog(`🔧 ${data.message}`);
        if (data.scrapers_enabled) {
          updateProcessingState({ currentStage: 'Starting live scrapers' });
        } else {
          updateProcessingState({ currentStage: 'Running in mock mode' });
        }
      } else if (data.type === 'log') {
        const logMessage = `${data.message}`;
        setLiveLogs(prev => [...prev, logMessage]);
        addLog(logMessage);
        
        // Update progress based on log content
        if (data.message.includes('Connecting')) {
          updateProcessingState({ progress: Math.min(processing.progress + 5, 90) });
        } else if (data.message.includes('Found') || data.message.includes('Saved')) {
          updateProcessingState({ progress: Math.min(processing.progress + 10, 95) });
        }
      } else if (data.type === 'complete') {
        addLog('🎉 Live scraping completed!');
        updateProcessingState({ 
          progress: 100, 
          currentStage: 'Enrichment completed',
          isRunning: false 
        });
      } else if (data.type === 'error') {
        addLog(`❌ ${data.message}`);
        updateProcessingState({ 
          isRunning: false,
          currentStage: 'Error occurred' 
        });
      }
    };

    window.addEventListener('scrapingLog', handleScrapingLog);
    
    return () => {
      window.removeEventListener('scrapingLog', handleScrapingLog);
    };
  }, [addLog, updateProcessingState, processing.progress]);

  const stages = [
    'Extracting base metrics',
    'Gathering web intelligence',
    'Loading benchmarks',
    'Analyzing data',
    'Generating insights',
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Processing Enrichment</h2>
          {scrapersEnabled !== null && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              scrapersEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {scrapersEnabled ? '🟢 Live Mode' : '🧪 Mock Mode'}
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-8">
          {scrapersEnabled 
            ? 'Your campaign data is being enriched with live web scraping from real sources.' 
            : 'Your campaign data is being enriched with simulated data (set ENABLE_SCRAPERS=true for live mode).'
          }
        </p>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Overall Progress</h3>
            <span className="text-sm font-medium text-primary-600">{processing.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${processing.progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">{processing.currentStage}</p>
        </div>

        {/* Stage Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Pipeline Stages</h3>
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const stageProgress = (index + 1) * 20;
              const isActive = processing.currentStage === stage;
              const isCompleted = processing.progress > stageProgress;
              
              return (
                <div key={stage} className="progress-step">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? 'bg-success-100 text-success-700'
                          : isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span
                      className={`text-sm ${
                        isActive ? 'font-medium text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                  {isActive && (
                    <div className="ml-11">
                      <div className="flex gap-1 mt-2">
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-100" />
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-200" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Live Logs</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Running</span>
            </div>
          </div>
          <div
            id="logs-container"
            className="h-64 overflow-y-auto font-mono text-xs text-gray-300 space-y-1"
          >
            {processing.logs.map((log, index) => (
              <div key={index} className="break-all">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center">
          {processing.isRunning ? (
            <button className="btn-secondary" disabled>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Processing...
            </button>
          ) : (
            <button className="btn-primary">
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};