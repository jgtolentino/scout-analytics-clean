# Scout Dashboard Deployment Guide

This guide covers deploying the Scout Dashboard with the new data storytelling features.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- Supabase account (for database)
- Deployment platform account (Vercel, Netlify, or similar)

## Local Development

### 1. Install Dependencies

```bash
cd apps/wren-ui-clone
npm install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the `apps/wren-ui-clone` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration (Optional - uses mock if not provided)
NEXT_PUBLIC_SUQI_API_URL=https://your-ai-endpoint.com/api
NEXT_PUBLIC_SUQI_API_KEY=your_ai_api_key

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_KEY=your_analytics_key
```

### 3. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

## Production Build

### 1. Build the Application

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle and optimize assets
- Generate static pages where possible
- Create production-ready build in `.next` folder

### 2. Test Production Build Locally

```bash
npm run start
# Open http://localhost:3000
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts**:
   - Link to existing project or create new
   - Configure environment variables
   - Deploy to production

4. **Environment Variables in Vercel**:
   - Go to your project settings
   - Add all variables from `.env.local`
   - Redeploy to apply changes

### Option 2: Netlify

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Deploy with Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   netlify deploy
   netlify deploy --prod
   ```

3. **Or use Git integration**:
   - Connect GitHub repo to Netlify
   - Auto-deploy on push to main

### Option 3: Docker Deployment

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and run**:
   ```bash
   docker build -t scout-dashboard .
   docker run -p 3000:3000 scout-dashboard
   ```

### Option 4: Traditional VPS

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Copy files to server**:
   ```bash
   scp -r .next package.json public your-server:/var/www/scout-dashboard/
   ```

3. **On server**:
   ```bash
   cd /var/www/scout-dashboard
   npm install --production
   npm install pm2 -g
   pm2 start npm --name "scout-dashboard" -- start
   ```

4. **Configure Nginx**:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Supabase Configuration

### 1. Create Required Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create schema for Scout Dashboard
CREATE SCHEMA IF NOT EXISTS scout_dash;

-- User preferences table
CREATE TABLE scout_dash.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  story_mode TEXT DEFAULT 'explore',
  dashboard_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI insights cache
CREATE TABLE scout_dash.ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_id TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  context_hash TEXT NOT NULL,
  insights JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(chart_id, context_hash)
);

-- Enable RLS
ALTER TABLE scout_dash.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_dash.ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own preferences" ON scout_dash.user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read AI insights cache" ON scout_dash.ai_insights_cache
  FOR SELECT USING (true);
```

### 2. Create Edge Functions (Optional)

If using real AI integration instead of mock:

```typescript
// supabase/functions/generate-chart-insights/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { chartContext } = await req.json()
  
  // Call your AI service here
  const insights = await generateInsights(chartContext)
  
  return new Response(
    JSON.stringify(insights),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

Deploy function:
```bash
supabase functions deploy generate-chart-insights
```

## Environment-Specific Configuration

### Production Environment

1. **Update `next.config.js`**:
   ```javascript
   module.exports = {
     // Enable React strict mode for better error detection
     reactStrictMode: true,
     
     // Image optimization
     images: {
       domains: ['your-cdn.com'],
     },
     
     // Environment variables
     env: {
       NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
     },
     
     // Production optimizations
     swcMinify: true,
     compress: true,
   }
   ```

2. **Add security headers**:
   ```javascript
   // next.config.js
   async headers() {
     return [
       {
         source: '/:path*',
         headers: [
           {
             key: 'X-Frame-Options',
             value: 'DENY',
           },
           {
             key: 'X-Content-Type-Options',
             value: 'nosniff',
           },
           {
             key: 'X-XSS-Protection',
             value: '1; mode=block',
           },
         ],
       },
     ]
   }
   ```

## Post-Deployment Checklist

- [ ] **Verify environment variables** are set correctly
- [ ] **Test story mode toggle** - switches between Focus/Explore
- [ ] **Test AI Explain buttons** on charts
- [ ] **Check Supabase connection** - data loads properly
- [ ] **Verify responsive design** on mobile devices
- [ ] **Test export functionality** (PNG, SVG, CSV)
- [ ] **Monitor console** for any errors
- [ ] **Check performance** - Lighthouse score > 90
- [ ] **Test authentication** if implemented
- [ ] **Verify CORS settings** for API calls

## Monitoring & Analytics

### 1. Add Error Tracking

```bash
npm install @sentry/nextjs
```

Configure Sentry:
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Performance Monitoring

Add to `_app.tsx`:
```typescript
export function reportWebVitals(metric) {
  // Send to analytics
  console.log(metric)
}
```

### 3. Usage Analytics

The Story Mode toggle already includes analytics tracking:
```typescript
// Automatically tracked events:
// - Story Mode Changed
// - AI Explanation Requested
// - Chart Interaction
```

## Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   ```bash
   # Check TypeScript errors
   npx tsc --noEmit
   ```

2. **Module not found errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules .next
   npm install
   npm run build
   ```

3. **Environment variables not loading**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Restart dev server after changing `.env.local`
   - Check deployment platform environment settings

4. **Supabase connection issues**
   - Verify URL and anon key are correct
   - Check RLS policies
   - Ensure tables exist

5. **AI explanations not working**
   - The system uses mock AI by default
   - To use real AI, provide `NEXT_PUBLIC_SUQI_API_URL`
   - Check network tab for API errors

## Performance Optimization

1. **Enable ISR (Incremental Static Regeneration)**:
   ```typescript
   export async function getStaticProps() {
     return {
       props: { data },
       revalidate: 60, // Revalidate every 60 seconds
     }
   }
   ```

2. **Optimize bundle size**:
   ```bash
   # Analyze bundle
   npm install @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

3. **Lazy load heavy components**:
   ```typescript
   const HeavyChart = dynamic(() => import('./HeavyChart'), {
     loading: () => <ChartSkeleton />,
     ssr: false,
   });
   ```

## Scaling Considerations

1. **CDN Setup**
   - Static assets automatically served via CDN on Vercel/Netlify
   - For custom CDN, update asset prefix in `next.config.js`

2. **Database Connection Pooling**
   - Supabase handles this automatically
   - For high traffic, consider Supabase Pro plan

3. **Caching Strategy**
   - AI insights cached for 24 hours
   - Chart data can be cached with React Query
   - Use Redis for session storage if needed

## Support

For deployment issues:
1. Check the [Next.js deployment docs](https://nextjs.org/docs/deployment)
2. Review platform-specific guides (Vercel, Netlify, etc.)
3. Check Supabase status page
4. Open an issue in the repository

---

Happy deploying! 🚀