import React, { useState } from 'react';
import { DocumentTextIcon, ChartBarIcon, MapIcon } from '@heroicons/react/24/outline';
import { useEnrichmentStore } from '../store/enrichmentStore';
import clsx from 'clsx';

type TabType = 'logs' | 'preview' | 'mapping';

export const ResultsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const { processing, results } = useEnrichmentStore();

  const tabs = [
    { id: 'logs' as TabType, name: 'Logs', icon: DocumentTextIcon },
    { id: 'preview' as TabType, name: 'Preview', icon: ChartBarIcon },
    { id: 'mapping' as TabType, name: 'Source Mapping', icon: MapIcon },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'logs' && (
          <div className="h-full bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-2 font-mono text-xs">
              {processing.logs.length === 0 ? (
                <p className="text-gray-500 text-center mt-8">No logs yet</p>
              ) : (
                processing.logs.map((log, index) => (
                  <div key={index} className="text-gray-700">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full p-4 overflow-y-auto">
            {results ? (
              <div className="prose prose-sm max-w-none">
                <h3>Campaign Intelligence Report</h3>
                <p>
                  <strong>Query:</strong> {processing.logs[0]?.split('...')[0] || 'DITO Telecom Philippines'}
                </p>
                
                <h4>Key Findings:</h4>
                <ul>
                  {results.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>

                <h4>Metrics Overview:</h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Metric</th>
                      <th className="text-left">Value</th>
                      <th className="text-left">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.metrics.map((metric) => (
                      <tr key={metric.name}>
                        <td>{metric.name}</td>
                        <td>{metric.enrichedValue}</td>
                        <td className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-8">
                Run enrichment to see preview
              </p>
            )}
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="h-full p-4 overflow-y-auto">
            {results ? (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Source to Metric Mapping</h3>
                {results.references.map((ref) => (
                  <div key={ref.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="reference-badge">{ref.id}</span>
                      <span className="text-sm font-medium text-gray-900">{ref.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ref.metricsFound.map((metric) => (
                        <span
                          key={metric}
                          className="text-xs px-2 py-1 bg-white rounded border border-gray-200"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-8">
                No source mapping available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};