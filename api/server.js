const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import configurations
const keyVaultConfig = require('./config/keyVault');
const database = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const kpiRoutes = require('./routes/kpi');
const scoutRoutes = require('./routes/scout');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scout Analytics API',
      version: '1.0.0',
      description: 'Scout Analytics API with Azure Key Vault integration',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Scout Analytics API Documentation'
}));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await database.testConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbTest.success ? 'connected' : 'disconnected',
        keyVault: keyVaultConfig.isInitialized ? 'initialized' : 'not initialized'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/scout', scoutRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: {
      auth: [
        'POST /api/auth/login',
        'GET /api/auth/verify',
        'POST /api/auth/logout',
        'GET /api/auth/profile'
      ],
      kpi: [
        'GET /api/kpi/summary',
        'GET /api/kpi/transactions',
        'GET /api/kpi/categories',
        'GET /api/kpi/regions',
        'GET /api/kpi/brands'
      ],
      scout: [
        'GET /api/scout/analytics - Unified Scout Analytics endpoint',
        'GET /api/scout/health - Scout system health check'
      ],
      docs: [
        'GET /api-docs - Swagger documentation',
        'GET /api/health - Health check'
      ]
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Starting Scout Analytics API...');
    
    // Initialize Key Vault configuration
    await keyVaultConfig.initialize();
    
    // Initialize database connection
    await database.connect();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Demo Credentials:`);
      console.log(`   Admin: admin@scout.com / admin123`);
      console.log(`   Analyst: analyst@scout.com / analyst123`);
      console.log(`   Demo: demo@scout.com / demo123`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
