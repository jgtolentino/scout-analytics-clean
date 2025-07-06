import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  MapPin,
  Package,
  Star,
  Activity,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

// Import AI-Agency components
import LearnBotTooltip from './LearnBotTooltip';
import InsightCard from './InsightCard';
import PhilippineRegionMap from './maps/PhilippineRegionMap';

interface DashboardProps {
  apiBaseUrl?: string;
}

interface KPIData {
  totalRevenue: number;
  totalTransactions: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  transactionGrowth: number;
}

interface RegionData {
  region: string;
  revenue: number;
  transactions: number;
  growth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ apiBaseUrl = 'http://localhost:3001' }) => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Demo authentication - in production this would come from auth context
  useEffect(() => {
    const demoLogin = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@tbwa.com',
            password: 'admin123'
          })
        });
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
        }
      } catch (error) {
        console.log('Auth failed, using mock data');
      }
    };
    demoLogin();
  }, [apiBaseUrl]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        // Fetch KPI data
        const kpiResponse = await fetch(`${apiBaseUrl}/api/kpi/dashboard-summary`, { headers });
        const kpiResult = await kpiResponse.json();
        
        // Fetch location data
        const locationResponse = await fetch(`${apiBaseUrl}/api/kpi/location-distribution`, { headers });
        const locationResult = await locationResponse.json();

        setKpiData(kpiResult.data || {
          totalRevenue: 1285420.50,
          totalTransactions: 1247,
          uniqueCustomers: 342,
          avgOrderValue: 1030.75,
          revenueGrowth: 12.5,
          transactionGrowth: 8.3
        });

        setRegionData(locationResult.data?.map((item: any) => ({
          region: item.region,
          revenue: item.total_revenue,
          transactions: item.transaction_count,
          growth: Math.random() * 20 - 5 // Mock growth for demo
        })) || [
          { region: 'Metro Manila', revenue: 780000, transactions: 654, growth: 15.2 },
          { region: 'Central Luzon', revenue: 245000, transactions: 198, growth: 8.7 },
          { region: 'Southern Luzon', revenue: 180000, transactions: 156, growth: -2.1 },
          { region: 'Visayas', revenue: 80420, transactions: 89, growth: 22.4 }
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use mock data on error
        setKpiData({
          totalRevenue: 1285420.50,
          totalTransactions: 1247,
          uniqueCustomers: 342,
          avgOrderValue: 1030.75,
          revenueGrowth: 12.5,
          transactionGrowth: 8.3
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authToken, apiBaseUrl, selectedTimeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PH').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading Scout Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Scout Analytics</h1>
                  <p className="text-xs text-slate-500 font-medium">FMCG Intelligence Platform</p>
                </div>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-72 bg-white/70 backdrop-blur-sm shadow-sm transition-all duration-200"
                />
              </div>
              
              <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/60 transition-all duration-200">
                <Bell className="h-5 w-5" />
              </button>
              
              <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/60 transition-all duration-200">
                <Settings className="h-5 w-5" />
              </button>

              {/* AI Help - LearnBot Integration */}
              <LearnBotTooltip 
                context="dashboard" 
                userAction="viewing-overview"
                position="bottom"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">Dashboard Overview</h2>
              <p className="text-slate-600 font-medium">Real-time FMCG performance insights for the Philippines market 🇵🇭</p>
            </div>
            
            <div className="mt-6 sm:mt-0 flex items-center space-x-3">
              {/* Time Period Selector */}
              <div className="relative">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all duration-200"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              <button className="inline-flex items-center px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>

              <button className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500/20 shadow-lg shadow-blue-500/25 transition-all duration-200">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid - AI-Enhanced with RetailBot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card with AI Validation */}
          <InsightCard
            title="Total Revenue"
            data={{
              value: kpiData?.totalRevenue || 0,
              change: kpiData?.revenueGrowth || 0,
              unit: "PHP"
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="revenue"
            threshold={{ warning: 1000000, critical: 500000 }}
          />

          {/* Total Transactions Card with AI Validation */}
          <InsightCard
            title="Transactions"
            data={{
              value: kpiData?.totalTransactions || 0,
              change: kpiData?.transactionGrowth || 0
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="transactions"
            threshold={{ warning: 1000, critical: 500 }}
          />

          {/* Unique Customers Card with AI Validation */}
          <InsightCard
            title="Unique Customers"
            data={{
              value: kpiData?.uniqueCustomers || 0,
              change: 5.2 // Mock growth data
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="customers"
            threshold={{ warning: 200, critical: 100 }}
          />

          {/* Average Order Value Card */}
          <InsightCard
            title="Avg Order Value"
            data={{
              value: kpiData?.avgOrderValue || 0,
              change: 3.8, // Mock growth data
              unit: "PHP"
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="revenue"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-8 mb-8">
          {/* Philippine Regional Performance Map */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-xl shadow-slate-900/5">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Philippine Regional Performance</h3>
              <p className="text-slate-600">Geographic distribution of FMCG sales across key regions</p>
            </div>
            <PhilippineRegionMap
              data={regionData.map(region => ({
                region: region.region,
                code: region.region === 'Metro Manila' ? 'NCR' : 
                      region.region === 'Central Luzon' ? 'III' :
                      region.region === 'Southern Luzon' ? 'IV-A' :
                      region.region === 'Visayas' ? 'VII' : 'VI',
                revenue: region.revenue,
                transactions: region.transactions,
                growth: region.growth,
                cities: [] // Would be populated with actual city data
              }))}
              onRegionClick={(region) => {
                console.log('Selected region:', region);
                // Handle region selection for detailed view
              }}
              selectedRegion={undefined}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Insights - Enhanced Design */}
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl border border-slate-200/60 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">AI Insights</h3>
                  <p className="text-slate-600 font-medium mt-1">Powered by RetailBot analytics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">Live</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200/60 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Strong Metro Manila Growth</p>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Revenue in Metro Manila increased 15.2% this week, driven by premium FMCG categories.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/60 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">Customer Behavior Shift</p>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Average order value increased 8% as customers prefer bulk purchases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50/80 border border-emerald-200/60 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900 mb-1">TBWA Brands Outperforming</p>
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        TBWA portfolio shows 22% growth vs 8% market average this period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg shadow-slate-900/5">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Last updated: {format(new Date(), 'MMM d, yyyy • h:mm a')}</span>
              </div>
              <span className="text-slate-400">•</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${authToken ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <span>Data source: {authToken ? 'Express API (Mock)' : 'Mock data'}</span>
              </div>
              <span className="text-slate-400">•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>AI insights: Active</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Powered by Scout Analytics Platform • Built with ❤️ for TBWA Philippines
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;