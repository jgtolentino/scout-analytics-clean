# Tableau Extensions Setup for Scout Dashboard

This guide explains how to set up and run the Scout Dashboard as a Tableau Extension.

## Prerequisites ✅

You already have:
- ✅ Node.js v20.19.2 
- ✅ npm v10.8.2
- ✅ Git
- ✅ Tableau Extensions API SDK (cloned)

## Development Environment Setup

### 1. Install Dependencies

```bash
# Install Scout Dashboard dependencies
npm install

# Install additional Tableau extensions dependencies
npm install @tableau/extensions-api-types --save-dev
```

### 2. Start Development Servers

You'll need TWO servers running:

#### Server 1: Scout Dashboard (Port 3000)
```bash
npm run dev
```

#### Server 2: Tableau Extensions Server (Port 8765)
```bash
# In a new terminal
cd tableau-extensions-api
npm install
npm start
```

### 3. Access the Extensions

Open your browser and navigate to:

- **Scout Dashboard**: http://localhost:3000
- **Tableau Extensions**: http://localhost:8765
- **Scout as Tableau Extension**: http://localhost:3000/tableau-extension

## Tableau Extension Configuration

### Create Scout Dashboard Extension Manifest

I'll create a `.trex` file for the Scout Dashboard:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest manifest-version="0.1" xmlns="http://www.tableau.com/xml/extension_manifest">
  <dashboard-extension id="com.scout.dashboard" extension-version="1.0.0">
    <default-locale>en_US</default-locale>
    <name resource-id="name"/>
    <description resource-id="description"/>
    <author name="Scout Platform" email="support@scout-platform.dev" organization="TBWA" website="https://scout-platform.dev"/>
    <min-api-version>1.0</min-api-version>
    <source-location>
      <url>http://localhost:3000/tableau-extension</url>
    </source-location>
    <icon>
      <small>http://localhost:3000/icons/scout-icon-small.png</small>
      <medium>http://localhost:3000/icons/scout-icon-medium.png</medium>
    </icon>
    <permissions>
      <permission>full data</permission>
    </permissions>
  </dashboard-extension>
  <resources>
    <resource id="name">
      <text locale="en_US">Scout Analytics Dashboard</text>
    </resource>
    <resource id="description">
      <text locale="en_US">AI-powered business intelligence dashboard with data storytelling features</text>
    </resource>
  </resources>
</manifest>
```

## Integration Steps

### 1. Test Scout Dashboard Locally

```bash
npm run dev
# Open http://localhost:3000
# Test Story Mode Toggle and AI Explain features
```

### 2. Test Tableau Extensions

```bash
cd tableau-extensions-api
npm start
# Open http://localhost:8765
# Try sample extensions
```

### 3. Create Scout Tableau Extension Page

Create a dedicated Tableau extension page that integrates Scout features:

```typescript
// pages/tableau-extension.tsx
import { useEffect } from 'react';
import { StoryModeProvider } from '../contexts/StoryModeContext';
import { DonutChart } from '../components/Charts/DonutChart';
import { HeatmapChart } from '../components/Charts/HeatmapChart';

declare global {
  interface Window {
    tableau: any;
  }
}

export default function TableauExtension() {
  useEffect(() => {
    // Initialize Tableau Extension
    if (typeof window !== 'undefined' && window.tableau) {
      window.tableau.extensions.initializeAsync().then(() => {
        console.log('Scout Dashboard Extension initialized');
        loadTableauData();
      });
    }
  }, []);

  const loadTableauData = async () => {
    // Get data from Tableau
    const dashboard = window.tableau.extensions.dashboardContent.dashboard;
    const worksheets = dashboard.worksheets;
    
    // Process Tableau data for Scout charts
    worksheets.forEach((worksheet: any) => {
      worksheet.getSummaryDataAsync().then((dataTable: any) => {
        console.log('Worksheet data:', dataTable);
        // Transform data for Scout charts
      });
    });
  };

  return (
    <StoryModeProvider>
      <div className="tableau-extension-container">
        <h1>Scout Analytics Extension</h1>
        {/* Your Scout Dashboard components */}
      </div>
    </StoryModeProvider>
  );
}
```

## Testing in Tableau

### Desktop Testing

1. **Open Tableau Desktop 2018.2+**
2. **Create a new dashboard**
3. **Add Extension object**
4. **Browse to Scout extension**:
   - File path: `/path/to/scout-dashboard-extension.trex`
   - Or URL: `http://localhost:3000/tableau-extension`

### Server/Cloud Testing

1. **Deploy Scout Dashboard** (see DEPLOYMENT_GUIDE.md)
2. **Update .trex file** with production URL
3. **Add to Tableau Server safelist**
4. **Test in Tableau Server/Cloud**

## Development Workflow

### 1. Daily Development

```bash
# Terminal 1: Scout Dashboard
npm run dev

# Terminal 2: Watch for changes
npm run build:watch

# Terminal 3: Tableau Extensions (if needed)
cd tableau-extensions-api && npm start
```

### 2. Testing Changes

1. Make changes to Scout components
2. Refresh Tableau extension
3. Test Story Mode and AI features
4. Verify data integration

### 3. Debugging

```bash
# Enable debug mode in Tableau Desktop
# Help > Settings and Performance > Enable Extension Debugging

# Or in Chrome DevTools
# Right-click extension > Inspect
```

## Production Deployment

### 1. Update Manifest for Production

```xml
<source-location>
  <url>https://your-domain.com/tableau-extension</url>
</source-location>
```

### 2. Deploy to Tableau Server

1. Upload `.trex` file to Tableau Server
2. Add to server safelist if needed
3. Test with real dashboards

### 3. Security Considerations

- Use HTTPS in production
- Validate all data inputs
- Follow Tableau security guidelines
- Test with restricted permissions

## Troubleshooting

### Common Issues

1. **Extension not loading**
   ```bash
   # Check if development server is running
   curl http://localhost:3000/tableau-extension
   ```

2. **CORS errors**
   ```javascript
   // Add to next.config.js
   headers: [
     {
       source: '/tableau-extension',
       headers: [
         { key: 'X-Frame-Options', value: 'ALLOWALL' }
       ]
     }
   ]
   ```

3. **Data not loading**
   ```javascript
   // Check Tableau API initialization
   console.log('Tableau API version:', tableau.extensions.api.version);
   ```

## Next Steps

1. **Run the setup commands below**
2. **Test Scout Dashboard features**
3. **Create Tableau extension page**
4. **Test in Tableau Desktop**
5. **Deploy to production**

## Quick Setup Commands

Run these commands to get started:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. In new terminal, test Tableau extensions
cd tableau-extensions-api
npm install
npm start

# 4. Open browser
# Scout Dashboard: http://localhost:3000
# Tableau Extensions: http://localhost:8765
```

You're ready to integrate Scout Dashboard with Tableau! 🚀