/**
 * ExplainThisChartButton Component
 * Provides AI-powered explanations for any chart using Suqi AI
 */

import React, { useState } from 'react';
import { Button } from '@radix-ui/themes';
import { Brain, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChartContext } from '../../contexts/ChartContext';
import { suqiAI } from '../../lib/ai/suqi-client';

interface ExplainThisChartButtonProps {
  className?: string;
  variant?: 'icon' | 'text' | 'full';
  position?: 'top-right' | 'bottom-right' | 'inline';
  audience?: 'executive' | 'manager' | 'analyst';
}

interface AIExplanation {
  headline: string;
  narrative: string;
  keyInsights: string[];
  recommendations: string[];
  confidence: number;
  generatedAt: Date;
}

export const ExplainThisChartButton: React.FC<ExplainThisChartButtonProps> = ({
  className = '',
  variant = 'icon',
  position = 'top-right',
  audience = 'manager'
}) => {
  const { chartId, chartType, data, title, filters, timeRange } = useChartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExplain = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare context for AI
      const context = {
        chartId,
        chartType,
        title,
        dataPoints: data.length,
        filters: Object.entries(filters || {}).map(([key, value]) => ({
          field: key,
          value: Array.isArray(value) ? value.join(', ') : value
        })),
        timeRange: timeRange ? {
          start: timeRange.start,
          end: timeRange.end
        } : null,
        audience,
        // Include data summary for better insights
        dataSummary: generateDataSummary(data)
      };

      // Call Suqi AI
      const response = await suqiAI.explainChart(context);
      
      setExplanation({
        headline: response.headline,
        narrative: response.narrative,
        keyInsights: response.insights || [],
        recommendations: response.recommendations || [],
        confidence: response.confidence || 0.85,
        generatedAt: new Date()
      });
      
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to get AI explanation:', err);
      setError('Unable to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDataSummary = (data: any[]): any => {
    if (!data || data.length === 0) return null;
    
    // Calculate basic statistics
    const numericFields = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );
    
    const summary: any = {};
    
    numericFields.forEach(field => {
      const values = data.map(d => d[field]).filter(v => v != null);
      summary[field] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        trend: calculateTrend(values)
      };
    });
    
    return summary;
  };

  const calculateTrend = (values: number[]): string => {
    if (values.length < 2) return 'stable';
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.1) return 'increasing';
    if (secondAvg < firstAvg * 0.9) return 'decreasing';
    return 'stable';
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <Button
            size="1"
            variant="soft"
            onClick={handleExplain}
            disabled={isLoading}
            className={`explain-chart-btn ${className}`}
            title="Explain this chart with AI"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
          </Button>
        );
      
      case 'text':
        return (
          <Button
            size="2"
            variant="soft"
            onClick={handleExplain}
            disabled={isLoading}
            className={`explain-chart-btn ${className}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2" size={16} />
                Explain This
              </>
            )}
          </Button>
        );
      
      case 'full':
        return (
          <Button
            size="3"
            variant="solid"
            onClick={handleExplain}
            disabled={isLoading}
            className={`explain-chart-btn ${className} w-full`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Generating AI Insights...
              </>
            ) : (
              <>
                <Brain className="mr-2" size={18} />
                Get AI Explanation
              </>
            )}
          </Button>
        );
    }
  };

  const positionClasses = {
    'top-right': 'absolute top-2 right-2 z-10',
    'bottom-right': 'absolute bottom-2 right-2 z-10',
    'inline': 'relative'
  };

  return (
    <>
      <div className={position !== 'inline' ? positionClasses[position] : ''}>
        {renderButton()}
      </div>

      <AnimatePresence>
        {isExpanded && explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-6 rounded-lg shadow-lg overflow-auto"
          >
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Chart Explanation</h3>
                    <p className="text-sm text-gray-500">
                      Generated for {audience} • Confidence: {(explanation.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Button
                  size="1"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Headline */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{explanation.headline}</h4>
                <p className="text-gray-700 leading-relaxed">{explanation.narrative}</p>
              </div>

              {/* Key Insights */}
              {explanation.keyInsights.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">💡</span> Key Insights
                  </h5>
                  <ul className="space-y-2">
                    {explanation.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {explanation.recommendations.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🎯</span> Recommended Actions
                  </h5>
                  <ul className="space-y-2">
                    {explanation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">→</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Generated at {explanation.generatedAt.toLocaleTimeString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="2"
                    variant="soft"
                    onClick={() => {
                      // Copy explanation to clipboard
                      const text = `${explanation.headline}\n\n${explanation.narrative}\n\nKey Insights:\n${explanation.keyInsights.join('\n')}\n\nRecommendations:\n${explanation.recommendations.join('\n')}`;
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button
                    size="2"
                    variant="solid"
                    onClick={() => {
                      // Export as PDF or send to Slack
                      console.log('Export explanation:', explanation);
                    }}
                  >
                    Share Insight
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full mt-2 right-0 bg-red-50 text-red-700 p-3 rounded-lg shadow-md z-20 max-w-xs"
        >
          <p className="text-sm">{error}</p>
        </motion.div>
      )}
    </>
  );
};