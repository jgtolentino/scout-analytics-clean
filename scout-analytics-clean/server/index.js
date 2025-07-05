import express from 'express';
import cors from 'cors';
const app = express();

// Enable CORS for local development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Sample API routes for Scout Analytics

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Mock authentication - in production, validate against real auth system
  if (email === 'admin@tbwa.com' && password === 'admin123') {
    res.json({
      token: 'mock-jwt-token-' + Date.now(),
      user: { name: 'Admin User', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Dashboard KPI endpoints
app.get('/api/kpi/dashboard-summary', (req, res) => {
  res.json({
    data: {
      totalRevenue: 1285420.50,
      totalTransactions: 1247,
      uniqueCustomers: 342,
      avgOrderValue: 1030.75,
      revenueGrowth: 12.5,
      transactionGrowth: 8.3
    }
  });
});

app.get('/api/kpi/location-distribution', (req, res) => {
  res.json({
    data: [
      { region: 'Metro Manila', total_revenue: 780000, transaction_count: 654 },
      { region: 'Central Luzon', total_revenue: 245000, transaction_count: 198 },
      { region: 'Southern Luzon', total_revenue: 180000, transaction_count: 156 },
      { region: 'Visayas', total_revenue: 80420, transaction_count: 89 }
    ]
  });
});

// Legacy endpoints for compatibility
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    totalRevenue: 1250000,
    totalTransactions: 15420,
    averageBasketSize: 185.50,
    customerCount: 8945
  });
});

app.get('/api/dashboard/charts', (req, res) => {
  res.json({
    salesTrend: [
      { date: '2024-01', sales: 850000 },
      { date: '2024-02', sales: 920000 },
      { date: '2024-03', sales: 1100000 },
      { date: '2024-04', sales: 1250000 }
    ],
    topProducts: [
      { name: 'Product A', sales: 350000 },
      { name: 'Product B', sales: 280000 },
      { name: 'Product C', sales: 220000 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Scout Analytics API server running on port ${PORT}`);
});