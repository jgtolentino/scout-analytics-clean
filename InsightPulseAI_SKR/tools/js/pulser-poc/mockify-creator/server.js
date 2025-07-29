// server.js - Production server for MockifyCreator
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Try to load API routes based on common patterns
const apiPaths = [
  './server/brands.js',
  './api/brands.js',
  './api/brands/index.js',
  './api/brands-lightweight/index.js'
];

const loadedAPIs = [];

// Brands API
for (const apiPath of apiPaths) {
  try {
    const fullPath = path.join(__dirname, apiPath);
    if (fs.existsSync(fullPath)) {
      const module = await import(fullPath);
      const router = module.default || module;
      app.use('/api/brands', router);
      loadedAPIs.push('brands');
      console.log(`✅ Loaded brands API from ${apiPath}`);
      break;
    }
  } catch (error) {
    // Continue trying other paths
  }
}

// Insights API
try {
  const insightsPath = path.join(__dirname, './server/insights.js');
  if (fs.existsSync(insightsPath)) {
    const insightsRouter = await import(insightsPath);
    app.use('/api/insights', insightsRouter.default || insightsRouter);
    loadedAPIs.push('insights');
    console.log('✅ Loaded insights API');
  }
} catch (error) {
  console.log('ℹ️  No insights API found');
}

// Transactions API
try {
  const transactionsPath = path.join(__dirname, './server/transactions.js');
  if (fs.existsSync(transactionsPath)) {
    const transactionsRouter = await import(transactionsPath);
    app.use('/api/transactions', transactionsRouter.default || transactionsRouter);
    loadedAPIs.push('transactions');
    console.log('✅ Loaded transactions API');
  }
} catch (error) {
  console.log('ℹ️  No transactions API found');
}

// Health check endpoint
app.get("/health", (_, res) => res.send({ 
  status: "ok", 
  uptime: process.uptime(),
  apis: loadedAPIs,
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
}));

// Serve static assets from client/dist
const clientDistPath = path.join(__dirname, "client/dist");
const alternativeDistPath = path.join(__dirname, "dist");

let distPath = null;
if (fs.existsSync(clientDistPath)) {
  distPath = clientDistPath;
  console.log(`✅ Serving static files from: ${clientDistPath}`);
} else if (fs.existsSync(alternativeDistPath)) {
  distPath = alternativeDistPath;
  console.log(`✅ Serving static files from: ${alternativeDistPath}`);
} else {
  console.warn('⚠️  No dist directory found. Run "npm run build" to create production files');
}

if (distPath) {
  app.use(express.static(distPath));
}

// Fallback to index.html for client-side routing
app.get("*", (_, res) => {
  const indexPaths = [
    path.join(__dirname, "client/dist/index.html"),
    path.join(__dirname, "dist/index.html"),
    path.join(__dirname, "index.html")
  ];

  for (const indexPath of indexPaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }

  res.status(404).send(`
    <h1>Dashboard Not Built</h1>
    <p>Please run <code>npm run build</code> to build the production files.</p>
    <p>API health check: <a href="/health">/health</a></p>
    <p>Loaded APIs: ${loadedAPIs.join(', ') || 'none'}</p>
  `);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 MockifyCreator Production Server
====================================
Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}

URLs:
- Dashboard: http://localhost:${PORT}
- Health Check: http://localhost:${PORT}/health
${loadedAPIs.includes('brands') ? '- Brands API: http://localhost:' + PORT + '/api/brands/*\n' : ''}${loadedAPIs.includes('insights') ? '- Insights API: http://localhost:' + PORT + '/api/insights/*\n' : ''}${loadedAPIs.includes('transactions') ? '- Transactions API: http://localhost:' + PORT + '/api/transactions/*\n' : ''}
${!distPath ? '⚠️  Warning: Run "npm run build" to create production files\n' : ''}
  `);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\nSIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});