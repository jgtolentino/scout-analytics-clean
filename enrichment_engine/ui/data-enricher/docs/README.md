# Data Enricher UI - Setup & Integration Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for enrichment scripts)
- Access to enrichment_engine directory

### Installation

1. Navigate to the UI directory:
```bash
cd enrichment_engine/ui/data-enricher
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## 📁 Project Structure

```
enrichment_engine/
├── ui/
│   └── data-enricher/        # React application
│       ├── src/
│       │   ├── components/   # UI components
│       │   │   └── steps/    # Workflow step components
│       │   ├── store/        # Zustand state management
│       │   ├── hooks/        # Custom React hooks
│       │   └── utils/        # Utility functions
│       ├── public/           # Static assets
│       └── docs/             # Documentation
│           ├── PRD.md        # Product requirements
│           └── README.md     # This file
├── open_mcp_scraper.py       # Web scraping engine
├── benchmarks.yaml           # Static KPI data
├── format_perplexity_refs.py # Reference formatter
└── export_insights_to_pdf_simple.py # PDF generator
```

## 🎯 Key Features

### 1. **4-Step Workflow**
- **Step 1**: Data Input - Upload campaign files
- **Step 2**: Configuration - Select enrichment parameters
- **Step 3**: Processing - Monitor pipeline execution
- **Step 4**: Results - View and export enriched data

### 2. **Real-time Processing**
- Live progress tracking
- Streaming logs
- Stage-by-stage monitoring

### 3. **Flexible Export**
- PDF reports with Perplexity-style references
- Markdown for documentation
- JSON for further processing

## 🔧 Development Guide

### Running the Application

```bash
# Development mode
npm start

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Key Technologies

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Radix UI** for accessible components
- **React Hook Form** for form handling
- **Recharts** for data visualization
- **React Dropzone** for file uploads

### Component Architecture

```
components/
├── Header.tsx              # App header with branding
├── WorkflowStepper.tsx    # Left sidebar workflow steps
├── StepContent.tsx        # Main content router
├── ResultsPanel.tsx       # Right panel tabs
└── steps/                 # Individual step components
    ├── DataInputStep.tsx
    ├── EnrichmentConfigStep.tsx
    ├── ProcessingStep.tsx
    └── ResultsStep.tsx
```

### State Management

The app uses Zustand for global state:

```typescript
// Key state slices
- currentStep: Active workflow step
- completedSteps: Array of completed steps
- uploadedFile: User's uploaded file
- config: Enrichment configuration
- processing: Pipeline execution state
- results: Enrichment results
```

## 🔌 Integration with Enrichment Engine

### Current Status
The UI currently uses **mock data** for demonstration. To integrate with real enrichment scripts:

### 1. API Endpoint Setup

Create an Express/FastAPI server to wrap the Python scripts:

```javascript
// server.js example
app.post('/api/enrich', async (req, res) => {
  const { file, config } = req.body;
  
  // Execute Python scripts
  const result = await exec(`python3 open_mcp_scraper.py --query "${config.query}"`);
  
  res.json(result);
});
```

### 2. Update Store Actions

Modify `enrichmentStore.ts` to call real API:

```typescript
runEnrichmentPipeline: async () => {
  const response = await fetch('/api/enrich', {
    method: 'POST',
    body: formData,
  });
  
  const results = await response.json();
  setResults(results);
}
```

### 3. Script Integration

Link to enrichment scripts:

```bash
# From the data-enricher directory
cd ../..  # Go to enrichment_engine root

# Install Python dependencies
pip install aiohttp beautifulsoup4 pyyaml reportlab

# Test scripts work
python3 open_mcp_scraper.py --query "test query"
```

### 4. Environment Variables

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENRICHMENT_PATH=../../
```

## 🎨 Customization

### Adding New Enrichment Sources

1. Update `EnrichmentConfigStep.tsx`:
```typescript
const enrichmentSources = [
  // ... existing sources
  {
    id: 'newSource',
    name: 'New Source',
    description: 'Description',
    icon: IconComponent,
  },
];
```

2. Update store configuration:
```typescript
sources: {
  webScraping: true,
  benchmarks: true,
  competitive: false,
  newSource: false, // Add new source
}
```

### Modifying the Workflow

Add new steps in `WorkflowStepper.tsx`:
```typescript
const steps = [
  // ... existing steps
  {
    id: 'validation',
    name: 'Data Validation',
    description: 'Validate enriched data',
    icon: CheckIcon,
  },
];
```

## 📊 Mock Data Structure

### Input Format
```json
{
  "campaign": "DITO Independence Day",
  "dateRange": "June 1-15, 2024",
  "metrics": {
    "reach": 1500000,
    "engagement": 85000,
    "sentiment": 75
  }
}
```

### Output Format
```json
{
  "metrics": [
    {
      "name": "Share of Voice",
      "originalValue": "15%",
      "enrichedValue": "21.7%",
      "change": 44.7,
      "sources": ["1", "2"]
    }
  ],
  "references": [
    {
      "id": 1,
      "title": "Industry Report",
      "url": "https://example.com",
      "metricsFound": ["sov", "roi"]
    }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **File upload not working**
   - Check file size (max 10MB)
   - Verify file format (PDF, CSV, JSON, XLSX)

2. **Processing stuck**
   - Check browser console for errors
   - Verify mock data is loading

3. **Export not generating**
   - Ensure results are available
   - Check export format selection

## 🚦 Deployment

### Production Build

```bash
# Build the app
npm run build

# Test the build locally
npm run preview

# The build output will be in the 'dist' folder
```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist"]
```

## 📈 Future Enhancements

- [ ] Real-time WebSocket for log streaming
- [ ] Batch file processing
- [ ] User authentication
- [ ] Saved configurations
- [ ] API key management
- [ ] Advanced visualizations
- [ ] Mobile responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for demonstration purposes.

---

**Need Help?** Check the PRD.md for detailed requirements or open an issue.