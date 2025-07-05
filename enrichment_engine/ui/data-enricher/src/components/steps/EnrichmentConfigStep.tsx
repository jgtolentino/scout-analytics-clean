import React, { useState } from 'react';
import {
  GlobeAltIcon,
  ChartBarIcon,
  UsersIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useEnrichmentStore } from '../../store/enrichmentStore';
import { autoConfigService } from '../../services/autoConfigService';

export const EnrichmentConfigStep: React.FC = () => {
  const { config, updateConfig, runEnrichmentPipeline, markStepCompleted } = useEnrichmentStore();
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
  const [autoConfigError, setAutoConfigError] = useState<string | null>(null);

  const handleSourceToggle = (source: keyof typeof config.sources) => {
    updateConfig({
      sources: {
        ...config.sources,
        [source]: !config.sources[source],
      },
    });
  };

  const handleFieldToggle = (field: string) => {
    const fields = config.fields.includes(field)
      ? config.fields.filter((f) => f !== field)
      : [...config.fields, field];
    updateConfig({ fields });
  };

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      updateConfig({
        competitors: [...config.competitors, newCompetitor.trim()],
      });
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (index: number) => {
    updateConfig({
      competitors: config.competitors.filter((_, i) => i !== index),
    });
  };

  const handleStartEnrichment = () => {
    markStepCompleted('enrichment_config');
    runEnrichmentPipeline();
  };

  const handleAutoConfig = async () => {
    setIsAutoConfiguring(true);
    setAutoConfigError(null);
    
    try {
      const autoConfig = await autoConfigService.runAutoConfig();
      
      // Update the form with the generated config
      updateConfig({
        query: autoConfig.query,
        fields: autoConfig.fields
      });
      
      console.log('Auto-configuration applied:', autoConfig);
    } catch (error) {
      console.error('Auto-configuration failed:', error);
      setAutoConfigError(error instanceof Error ? error.message : 'Auto-configuration failed');
    } finally {
      setIsAutoConfiguring(false);
    }
  };

  const enrichmentSources = [
    {
      id: 'webScraping',
      name: 'Web Intelligence',
      description: 'Gather data from public web sources',
      icon: GlobeAltIcon,
    },
    {
      id: 'benchmarks',
      name: 'Industry Benchmarks',
      description: 'Compare against industry standards',
      icon: ChartBarIcon,
    },
    {
      id: 'competitive',
      name: 'Competitive Analysis',
      description: 'Analyze competitor performance',
      icon: UsersIcon,
    },
  ];

  const enrichmentFields = [
    { id: 'sov', name: 'Share of Voice', description: 'Market presence' },
    { id: 'sentiment', name: 'Sentiment Analysis', description: 'Brand perception' },
    { id: 'engagement_rate', name: 'Engagement Rate', description: 'Audience interaction' },
    { id: 'roi', name: 'ROI Analysis', description: 'Return on investment' },
    { id: 'mentions', name: 'Brand Mentions', description: 'Social mentions' },
    { id: 'hashtags', name: 'Trending Hashtags', description: 'Popular tags' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configure Enrichment</h2>
            <p className="text-gray-600">
              Select data sources and fields to enrich your campaign metrics.
            </p>
          </div>
          <button
            onClick={handleAutoConfig}
            disabled={isAutoConfiguring}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              isAutoConfiguring 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            {isAutoConfiguring ? 'Analyzing...' : 'Auto-Configure from Report'}
          </button>
        </div>

        {autoConfigError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {autoConfigError}
          </div>
        )}

        {/* Enrichment Sources */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrichment Sources</h3>
          <div className="grid grid-cols-3 gap-4">
            {enrichmentSources.map((source) => {
              const isActive = config.sources[source.id as keyof typeof config.sources];
              return (
                <button
                  key={source.id}
                  onClick={() => handleSourceToggle(source.id as keyof typeof config.sources)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <source.icon className={`w-8 h-8 mb-3 ${
                    isActive ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fields to Enrich */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fields to Enrich</h3>
          <div className="grid grid-cols-2 gap-3">
            {enrichmentFields.map((field) => {
              const isActive = config.fields.includes(field.id);
              return (
                <label
                  key={field.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleFieldToggle(field.id)}
                    className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{field.name}</p>
                    <p className="text-sm text-gray-500">{field.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Query Configuration */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Query</h3>
          <textarea
            value={config.query}
            onChange={(e) => updateConfig({ query: e.target.value })}
            placeholder="E.g., DITO Telecom Philippines market share 2024"
            className="w-full input-base h-24 resize-none"
          />
        </div>

        {/* Competitors */}
        {config.sources.competitive && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Competitors</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                placeholder="Add competitor name"
                className="flex-1 input-base"
              />
              <button onClick={addCompetitor} className="btn-secondary">
                <PlusIcon className="w-5 h-5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.competitors.map((competitor, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {competitor}
                  <button
                    onClick={() => removeCompetitor(index)}
                    className="p-0.5 hover:bg-gray-200 rounded-full"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button className="btn-secondary">
            Save Configuration
          </button>
          <button
            onClick={handleStartEnrichment}
            className="btn-primary"
          >
            Start Enrichment
          </button>
        </div>
      </div>
    </div>
  );
};