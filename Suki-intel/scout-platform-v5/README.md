# Scout Platform v5 - Complete Edition

## Overview

Scout Platform v5 is TBWA's comprehensive retail intelligence platform combining:
- **Next.js Frontend**: Modern dashboard with real-time analytics
- **Express API Backend**: High-performance data processing
- **Supabase Integration**: Scalable database with RLS
- **WrenAI & RAG**: Advanced AI-powered insights
- **ETL Pipeline**: Bronze → Silver → Gold data processing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Scout Platform v5                         │
├─────────────────────┬───────────────────┬───────────────────┤
│   Next.js Frontend  │   Express API     │  Supabase Backend │
│   • Dashboard UI    │   • REST APIs     │  • PostgreSQL     │
│   • Real-time viz   │   • WebSockets    │  • Edge Functions │
│   • Export tools    │   • ETL Pipeline  │  • Vector Search  │
└─────────────────────┴───────────────────┴───────────────────┘
```

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/tbwa/scout-platform-v5.git
cd scout-platform-v5

# Run setup
./deploy-unified.sh setup
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret!)
- `JWT_SECRET`: Secure 32+ character secret

### 3. Start Development

```bash
# Start all services
./deploy-unified.sh dev

# Or start individually:
npm run dev          # Next.js frontend
npm run api:dev      # Express backend
npm run supabase:dev # Supabase local
```

## Deployment

### Deploy to Vercel

```bash
# Deploy to preview
./deploy-unified.sh deploy

# Deploy to production
./deploy-unified.sh deploy production
```

### Manual Deployment Steps

1. **Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import project from GitHub
   - Configure environment variables
   - Deploy

2. **Supabase**:
   ```bash
   # Link to project
   supabase link --project-ref cxzllzyxwpyptfretryc
   
   # Deploy functions
   supabase functions deploy --no-verify-jwt
   
   # Push migrations
   supabase db push
   ```

## Features

### 1. Real-Time Analytics Dashboard
- Market share tracking by region
- Brand performance metrics
- Competitive intelligence
- Geographic distribution maps

### 2. AI-Powered Insights
- RAG-based chat interface
- Automated anomaly detection
- Predictive analytics
- Natural language queries

### 3. ETL Pipeline
- **Bronze Layer**: Raw data ingestion
- **Silver Layer**: Cleaned and normalized
- **Gold Layer**: Business-ready aggregates

### 4. Export Capabilities
- CSV/JSON/Parquet exports
- Scheduled reports
- API access for integrations

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Analytics
```bash
GET /api/analytics/market-share
GET /api/analytics/brand-performance
GET /api/analytics/regional-trends
```

### AI Chat
```bash
POST /api/chat
{
  "message": "What's the market share trend for JTI in NCR?",
  "context": "market_analysis"
}
```

## Project Structure

```
scout-platform-v5/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── dashboard/         # Dashboard pages
├── backend/               # Express API server
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   └── models/           # Data models
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
├── database/             # SQL schemas and seeds
├── types/                # TypeScript definitions
└── deploy/               # Deployment scripts
```

## Development Commands

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run tests
npm test

# Build for production
npm run build

# Generate Supabase types
npm run db:types

# Deploy Edge Functions
npm run functions:deploy
```

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
1. Check Supabase URL and keys in `.env.local`
2. Verify RLS policies are configured
3. Test connection: `npm run health`

### Deployment Issues
1. Ensure all environment variables are set in Vercel
2. Check build logs: `vercel logs`
3. Verify Supabase functions: `supabase functions list`

## Support

- **Documentation**: [docs.scout.tbwa.com](https://docs.scout.tbwa.com)
- **Issues**: [GitHub Issues](https://github.com/tbwa/scout-platform-v5/issues)
- **Team**: data-intelligence@tbwa.com

## License

PROPRIETARY - TBWA Data Intelligence Team

---

**Current Deployment**: `mockify-creator.vercel.app`  
**Production Domain**: `scout.tbwa.com` (pending configuration)Scout Platform v5 - Deployed
