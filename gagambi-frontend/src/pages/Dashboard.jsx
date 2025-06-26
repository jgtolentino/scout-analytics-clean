import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  fetchEnrichments, 
  fetchScrapedPosts, 
  fetchJudgeResults,
  enrichPost 
} from '../api/gagambi';

// Date range options
const DATE_RANGES = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  'mtd': { label: 'Month to date', days: new Date().getDate() },
  'all': { label: 'All time', days: 365 }
};

// Skeleton loader component
function SkeletonLoader({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

// Trend chart component
function TrendChart({ data, color = '#3B82F6' }) {
  if (!data || data.length === 0) {
    return <div className="h-12 w-full bg-gray-50 rounded" />;
  }

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Tooltip 
          contentStyle={{ fontSize: '12px' }}
          labelFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Metric card component
function MetricCard({ 
  title, 
  value, 
  loading, 
  trendData, 
  icon, 
  color = 'blue',
  linkTo,
  onClick 
}) {
  const content = (
    <div className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow ${linkTo ? 'cursor-pointer' : ''}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 bg-${color}-100 rounded-lg`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                {loading ? (
                  <SkeletonLoader className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        {trendData && (
          <div className="mt-4">
            <TrendChart data={trendData} color={color === 'green' ? '#10B981' : '#3B82F6'} />
          </div>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} onClick={onClick}>{content}</Link>;
  }
  return content;
}

// Alert banner component
function AlertBanner({ type, message, onDismiss, onRetry }) {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-yellow-200';

  return (
    <div className={`${bgColor} border ${borderColor} rounded-md p-4 mb-6`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${textColor}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3 flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`text-sm font-medium ${textColor} hover:underline`}
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className={`text-sm font-medium ${textColor} hover:underline`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Recent activity item
function ActivityItem({ item, type }) {
  const typeColors = {
    enrichment: 'bg-blue-100 text-blue-800',
    scrape: 'bg-green-100 text-green-800',
    score: 'bg-purple-100 text-purple-800'
  };

  return (
    <li className="px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type]}`}>
          {type}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
          <p className="text-sm text-gray-500">{format(new Date(item.timestamp), 'MMM d, h:mm a')}</p>
        </div>
        <div className="text-sm text-gray-500">
          {item.score && `Score: ${item.score.toFixed(2)}`}
        </div>
      </div>
    </li>
  );
}

// Job details row
function JobRow({ job }) {
  const statusColors = {
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    queued: 'bg-gray-100 text-gray-800'
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {job.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(job.startedAt), 'MMM d, h:mm a')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{job.progress}%</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button className="text-indigo-600 hover:text-indigo-900">View</button>
      </td>
    </tr>
  );
}

function Dashboard() {
  // State management
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    enrichedPosts: 0,
    scrapedCampaigns: 0,
    averageCES: 0
  });
  
  // Trend data state
  const [trendData, setTrendData] = useState({
    enrichments: [],
    campaigns: [],
    cesScores: []
  });
  
  // Recent activity state
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Active jobs state
  const [activeJobs, setActiveJobs] = useState([]);
  
  // Mock job execution
  const [jobsRunning, setJobsRunning] = useState({
    scrape: false,
    enrichment: false,
    scoring: false
  });

  // Generate mock trend data based on date range
  const generateTrendData = useCallback((days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      data.push({
        date: subDays(new Date(), i).toISOString(),
        value: Math.floor(Math.random() * 100) + 20
      });
    }
    return data;
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data with error handling
      const [enrichments, scrapedPosts, judgeResults] = await Promise.all([
        fetchEnrichments().catch(() => []),
        fetchScrapedPosts().catch(() => []),
        fetchJudgeResults().catch(() => [])
      ]);

      // Calculate metrics
      const days = DATE_RANGES[dateRange].days;
      const cutoffDate = subDays(new Date(), days);

      const filteredEnrichments = Array.isArray(enrichments) 
        ? enrichments.filter(e => new Date(e.created_at) > cutoffDate)
        : [];
      const filteredPosts = Array.isArray(scrapedPosts)
        ? scrapedPosts.filter(p => new Date(p.created_at) > cutoffDate)
        : [];
      const filteredResults = Array.isArray(judgeResults)
        ? judgeResults.filter(r => new Date(r.created_at) > cutoffDate)
        : [];

      // Calculate average CES score
      const avgCES = filteredResults.length > 0
        ? filteredResults.reduce((sum, r) => sum + (r.ces_score || 0), 0) / filteredResults.length
        : 0;

      setMetrics({
        enrichedPosts: filteredEnrichments.length,
        scrapedCampaigns: filteredPosts.length,
        averageCES: avgCES
      });

      // Generate trend data (mock for now)
      setTrendData({
        enrichments: generateTrendData(days),
        campaigns: generateTrendData(days),
        cesScores: generateTrendData(days)
      });

      // Set recent activity (mock for now)
      setRecentActivity([
        { id: 1, title: 'Nike Campaign Enriched', timestamp: new Date().toISOString(), score: 8.5, type: 'enrichment' },
        { id: 2, title: 'Adidas Posts Scraped', timestamp: subDays(new Date(), 1).toISOString(), type: 'scrape' },
        { id: 3, title: 'Puma Campaign Scored', timestamp: subDays(new Date(), 2).toISOString(), score: 7.2, type: 'score' }
      ]);

      // Mock active jobs
      setActiveJobs([
        { id: 1, name: 'Instagram Scraper', startedAt: new Date().toISOString(), progress: 65, status: 'running' },
        { id: 2, name: 'Enrichment Pipeline', startedAt: subDays(new Date(), 1).toISOString(), progress: 100, status: 'completed' }
      ]);

      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, generateTrendData]);

  // Load data on mount and when date range changes
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Quick action handlers
  const handleStartScrape = () => {
    setJobsRunning(prev => ({ ...prev, scrape: true }));
    // Simulate job completion
    setTimeout(() => {
      setJobsRunning(prev => ({ ...prev, scrape: false }));
      loadDashboardData();
    }, 3000);
  };

  const handleRunEnrichment = () => {
    setJobsRunning(prev => ({ ...prev, enrichment: true }));
    setTimeout(() => {
      setJobsRunning(prev => ({ ...prev, enrichment: false }));
      loadDashboardData();
    }, 3000);
  };

  const handleReScore = () => {
    setJobsRunning(prev => ({ ...prev, scoring: true }));
    setTimeout(() => {
      setJobsRunning(prev => ({ ...prev, scoring: false }));
      loadDashboardData();
    }, 3000);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header with date filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="mt-4 sm:mt-0 flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            Last updated: {format(lastUpdate, 'h:mm:ss a')}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <AlertBanner
          type="error"
          message={error}
          onDismiss={() => setError(null)}
          onRetry={loadDashboardData}
        />
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Enriched Posts"
          value={metrics.enrichedPosts}
          loading={loading}
          trendData={trendData.enrichments}
          linkTo="/enrichments"
          color="blue"
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <MetricCard
          title="Scraped Campaigns"
          value={metrics.scrapedCampaigns}
          loading={loading}
          trendData={trendData.campaigns}
          linkTo="/scraped-posts"
          color="green"
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Average CES Score"
          value={metrics.averageCES.toFixed(1)}
          loading={loading}
          trendData={trendData.cesScores}
          linkTo="/judge-results"
          color="purple"
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStartScrape}
            disabled={jobsRunning.scrape}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {jobsRunning.scrape ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting...
              </>
            ) : (
              'Start New Scrape'
            )}
          </button>
          
          <button
            onClick={handleRunEnrichment}
            disabled={jobsRunning.enrichment}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {jobsRunning.enrichment ? 'Running...' : 'Run Enrichment'}
          </button>
          
          <button
            onClick={handleReScore}
            disabled={jobsRunning.scoring}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {jobsRunning.scoring ? 'Scoring...' : 'Re-score All'}
          </button>
        </div>
      </div>

      {/* Two column layout for activity and jobs */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <SkeletonLoader key={i} className="h-16" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentActivity.map(item => (
                  <ActivityItem key={item.id} item={item} type={item.type} />
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm text-gray-500">No recent activity</div>
              </div>
            )}
          </div>
        </div>

        {/* Active jobs */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Active Jobs</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2].map(i => (
                  <SkeletonLoader key={i} className="h-16" />
                ))}
              </div>
            ) : activeJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeJobs.map(job => (
                      <JobRow key={job.id} job={job} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm text-gray-500">No active scraping jobs</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;