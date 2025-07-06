import React from 'react';
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { useEnrichmentStore } from '../../store/enrichmentStore';

export const ResultsStep: React.FC = () => {
  const { results, exportFormat, setExportFormat } = useEnrichmentStore();

  if (!results) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-gray-500">No results available</p>
      </div>
    );
  }

  const handleExport = () => {
    // Mock export functionality
    console.log(`Exporting as ${exportFormat}`);
    alert(`Exporting results as ${exportFormat.toUpperCase()}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Enrichment Results</h2>
            <p className="text-gray-600 mt-1">
              Your campaign data has been enriched with {results.references.length} sources
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="input-base"
            >
              <option value="pdf">PDF Report</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON Data</option>
            </select>
            <button onClick={handleExport} className="btn-primary">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Metrics Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Enriched Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enriched Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sources
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.metrics.map((metric) => (
                  <tr key={metric.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.originalValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.enrichedValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        {metric.change > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-success-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                        )}
                        <span className={metric.change > 0 ? 'text-success-600' : 'text-red-600'}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-1">
                        {metric.sources.map((source) => (
                          <span key={source} className="reference-badge">
                            {source}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="font-medium text-gray-900 mb-4">Key Insights</h3>
          <ul className="space-y-2">
            {results.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sources */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Data Sources</h3>
          <div className="space-y-3">
            {results.references.map((ref) => (
              <div key={ref.id} className="source-card">
                <div className="flex items-start gap-3">
                  <span className="reference-badge flex-shrink-0">{ref.id}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{ref.title}</h4>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {ref.url}
                    </a>
                    <div className="flex gap-2 mt-2">
                      {ref.metricsFound.map((metric) => (
                        <span
                          key={metric}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button className="btn-secondary">
            Start New Enrichment
          </button>
          <div className="flex gap-3">
            <button className="btn-secondary">
              Save Results
            </button>
            <button className="btn-primary">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};