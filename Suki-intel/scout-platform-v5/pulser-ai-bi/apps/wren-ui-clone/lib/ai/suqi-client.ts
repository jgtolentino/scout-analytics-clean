/**
 * Suqi AI Client
 * Provides AI-powered insights and explanations for charts
 */

interface ChartContext {
  chartId: string;
  chartType: string;
  title?: string;
  dataPoints: number;
  filters?: Array<{ field: string; value: string }>;
  timeRange?: { start: Date; end: Date } | null;
  audience: 'executive' | 'manager' | 'analyst';
  dataSummary?: any;
}

interface AIResponse {
  headline: string;
  narrative: string;
  insights?: string[];
  recommendations?: string[];
  confidence?: number;
}

class SuqiAIClient {
  private apiEndpoint: string;
  private apiKey?: string;

  constructor(apiEndpoint?: string, apiKey?: string) {
    this.apiEndpoint = apiEndpoint || process.env.NEXT_PUBLIC_SUQI_API_URL || '/api/ai/insights';
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_SUQI_API_KEY;
  }

  async explainChart(context: ChartContext): Promise<AIResponse> {
    try {
      // For now, we'll use a mock implementation
      // In production, this would call the actual AI service
      return this.generateMockExplanation(context);
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
      throw error;
    }
  }

  private generateMockExplanation(context: ChartContext): AIResponse {
    const { chartType, title, dataPoints, audience, dataSummary } = context;

    // Generate audience-appropriate content
    const audienceContext = {
      executive: {
        focus: 'business impact',
        tone: 'concise and strategic',
        depth: 'high-level'
      },
      manager: {
        focus: 'operational insights',
        tone: 'actionable and clear',
        depth: 'balanced'
      },
      analyst: {
        focus: 'technical details',
        tone: 'detailed and precise',
        depth: 'comprehensive'
      }
    };

    const selectedAudience = audienceContext[audience];

    // Chart-specific insights
    const chartInsights = {
      donut: {
        headline: `${title || 'Distribution Analysis'} Reveals Clear Market Leaders`,
        narrative: `The data shows a concentrated distribution where the top 3 categories account for over 70% of the total. This concentration suggests market consolidation and presents both opportunities and risks for strategic planning.`,
        insights: [
          'Top category dominates with 45% market share',
          'Long tail of smaller categories indicates fragmentation',
          'Year-over-year comparison shows increasing concentration'
        ],
        recommendations: [
          'Focus resources on top 3 performing categories',
          'Investigate opportunities in underperforming segments',
          'Monitor concentration risk in portfolio'
        ]
      },
      heatmap: {
        headline: `${title || 'Pattern Analysis'} Identifies Peak Activity Zones`,
        narrative: `The heatmap reveals clear temporal patterns with peak activity concentrated during weekday afternoons. This pattern aligns with typical business hours and suggests optimization opportunities for resource allocation.`,
        insights: [
          'Peak activity occurs between 2-4 PM on weekdays',
          'Weekend activity is 65% lower than weekdays',
          'Monthly trends show consistent patterns'
        ],
        recommendations: [
          'Align staffing with identified peak periods',
          'Explore weekend engagement strategies',
          'Automate low-activity period operations'
        ]
      },
      line: {
        headline: `${title || 'Trend Analysis'} Shows Positive Growth Trajectory`,
        narrative: `The trend line indicates steady growth with seasonal variations. Recent data points suggest acceleration in growth rate, potentially driven by market expansion or successful initiatives.`,
        insights: [
          'Overall growth rate of 15% quarter-over-quarter',
          'Seasonal dips occur in Q1 and Q3',
          'Recent uptick exceeds historical patterns'
        ],
        recommendations: [
          'Capitalize on current growth momentum',
          'Prepare for anticipated seasonal variations',
          'Investigate drivers of recent acceleration'
        ]
      },
      bar: {
        headline: `${title || 'Comparative Analysis'} Highlights Performance Gaps`,
        narrative: `The comparison reveals significant variations in performance across categories. Top performers exceed the average by 40%, while bottom quartile shows opportunities for improvement.`,
        insights: [
          'Top performer exceeds average by 40%',
          'Bottom 25% significantly underperform',
          'Mid-tier shows consistent results'
        ],
        recommendations: [
          'Study and replicate top performer strategies',
          'Develop improvement plans for bottom quartile',
          'Maintain stability in mid-tier segments'
        ]
      }
    };

    // Default to generic insights if chart type not found
    const defaultInsights = {
      headline: `${title || 'Data Analysis'} Provides Strategic Insights`,
      narrative: `Analysis of ${dataPoints} data points reveals important patterns and trends that inform strategic decision-making. The data suggests opportunities for optimization and growth.`,
      insights: [
        'Data shows clear patterns requiring attention',
        'Multiple opportunities identified for improvement',
        'Current performance aligns with expectations'
      ],
      recommendations: [
        'Continue monitoring identified trends',
        'Implement targeted improvements',
        'Share insights with relevant stakeholders'
      ]
    };

    const selectedInsights = chartInsights[chartType as keyof typeof chartInsights] || defaultInsights;

    // Adjust based on audience
    if (audience === 'executive') {
      selectedInsights.narrative = selectedInsights.narrative.split('.')[0] + '. ' +
        'Impact on bottom line estimated at $2.5M annually.';
      selectedInsights.recommendations = selectedInsights.recommendations.slice(0, 2);
    } else if (audience === 'analyst') {
      selectedInsights.insights.push('Statistical significance: p < 0.05');
      selectedInsights.insights.push('R-squared value: 0.87');
    }

    return {
      ...selectedInsights,
      confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
    };
  }

  async generateNarrative(data: any, context: any): Promise<string> {
    // Generate a narrative summary of the data
    return `Based on the analysis of ${data.length} data points, we observe significant patterns that warrant attention. The data suggests strategic opportunities for optimization and growth.`;
  }
}

// Export singleton instance
export const suqiAI = new SuqiAIClient();