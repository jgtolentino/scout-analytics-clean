# Product Requirements Document (PRD)
## Data Enricher UI - Campaign Intelligence Pipeline

### Executive Summary
Data Enricher is a web-based interface for the marketing campaign enrichment pipeline. It provides a user-friendly workflow to upload campaign data, configure enrichment parameters, process data through open-source intelligence gathering methods, and export enriched results with Perplexity-style referencing.

### Problem Statement
Marketing teams need to enrich their campaign performance data with external intelligence (market share, competitive analysis, industry benchmarks) but lack an integrated interface to:
- Upload and process campaign data
- Configure enrichment parameters using open-source methods
- Monitor processing in real-time
- View and export enriched results with proper source attribution

**Note:** This system uses only open-source web scraping and static benchmark data. No proprietary APIs (Meltwater, SimilarWeb, Statista) are included in the current implementation.

### Solution Overview
A React-based web application that wraps the enrichment engine scripts in an intuitive 4-step workflow:
1. **Data Input** - Upload campaign metrics
2. **Configuration** - Select enrichment sources and fields
3. **Processing** - Run the pipeline with live monitoring
4. **Results** - View and export enriched data

### Target Users
- **Marketing Analysts** - Primary users who upload campaign data and configure enrichment
- **Campaign Managers** - Review enriched results and insights
- **Data Scientists** - Configure advanced parameters and analyze results

### Core Features - MVP Scope

#### 1. Data Input Module
- **File Upload**: Drag-and-drop support for PDF, CSV, JSON, XLSX
- **File Size Limit**: Maximum 10MB per file
- **Validation**: File type and structure checking with error messages
- **Preview**: Show detected campaign data
- **Manual Entry**: Form-based metric input (Phase 2)

**Acceptance Criteria:**
- User can upload files via drag-and-drop or file selection
- System validates file type and displays clear error for unsupported formats
- File size validation shows error for files > 10MB
- Successfully uploaded files display name, size, and type

#### 2. Enrichment Configuration
- **Source Selection**:
  - Web Intelligence (open-source scraping)
  - Industry Benchmarks (static YAML data)
  - Competitive Analysis (based on web search)
- **Field Selection**: Choose which metrics to enrich
- **Query Builder**: Natural language query construction
- **Competitor Management**: Add/remove competitors for analysis

**Acceptance Criteria:**
- User can select/deselect enrichment sources
- Query field accepts natural language input
- Competitor list is editable with add/remove functionality
- Configuration can be reset to defaults

#### 3. Processing Pipeline
- **Real-time Progress**: Visual progress tracking with percentage
- **Stage Monitoring**: Show current pipeline stage (1/4, 2/4, etc.)
- **Live Logs**: Streaming log output in terminal view
- **Cancel Support**: Stop processing if needed
- **Error Handling**: Clear error messages with recovery suggestions

**Acceptance Criteria:**
- Progress bar updates in real-time during processing
- Current stage is clearly indicated
- Logs stream without delay (<100ms)
- Cancel button immediately stops processing
- Errors display with actionable messages

#### 4. Results & Export
- **Metrics Table**: Before/after comparison
- **Change Indicators**: Visual up/down trends with colors
- **Source Attribution**: Perplexity-style [1][2] references
- **Export Options**: PDF, Markdown, JSON
- **Insights Summary**: Key findings highlighted

**Acceptance Criteria:**
- Results table shows all enriched metrics
- Positive changes show green, negative show red
- Each metric links to its source references
- Export generates valid files in selected format
- PDF export completes in <5 seconds

### Technical Architecture

#### Frontend Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **UI Components**: Radix UI + Tailwind CSS
- **Icons**: Heroicons
- **Data Viz**: Recharts
- **File Handling**: react-dropzone
- **Form Validation**: React Hook Form with Zod

#### Backend Integration (Current Implementation)
- **Enrichment Scripts**:
  - `open_mcp_scraper.py` - Web intelligence gathering
  - `format_perplexity_refs.py` - Reference formatting
  - `export_insights_to_pdf_simple.py` - PDF generation
  - `benchmarks.yaml` - Static industry KPI data
- **No External APIs**: All data from web scraping or static files

#### Data Flow
1. User uploads file → Parse and extract metrics
2. Configure enrichment → Build query parameters
3. Call enrichment pipeline → Stream logs to UI
4. Process results → Format with references
5. Export results → Generate PDF/Markdown

### Error Handling & Edge Cases

#### File Upload Errors
- **Unsupported Format**: "Please upload a PDF, CSV, JSON, or XLSX file"
- **File Too Large**: "File size must be under 10MB"
- **Empty File**: "The uploaded file appears to be empty"
- **Parsing Error**: "Unable to extract data from file. Please check the format"

#### Processing Errors
- **Network Issues**: "Connection error. Please check your internet and try again"
- **Timeout**: "Processing took too long. Try with a smaller dataset"
- **Script Error**: "Enrichment failed. Error details: [specific error]"
- **No Results**: "No enrichment data found for your query. Try different search terms"

#### Export Errors
- **PDF Generation Failed**: "Unable to create PDF. Try Markdown export instead"
- **Download Failed**: "Download failed. Please try again"

### Authentication & Data Management
- **Current MVP**: No authentication required
- **Data Storage**: Session-based only, no persistent storage
- **Privacy**: All uploaded data is processed in-memory and discarded after export
- **Future Enhancement**: User accounts with saved configurations

### Accessibility Requirements
- **WCAG 2.1 AA Compliance**:
  - All interactive elements keyboard accessible
  - Proper ARIA labels on all controls
  - Color contrast ratio ≥ 4.5:1 for normal text
  - Focus indicators visible on all interactive elements
- **Keyboard Shortcuts**:
  - Tab navigation through workflow steps
  - Enter to submit forms
  - Escape to close modals
  - Ctrl/Cmd + S to trigger export

### Performance Requirements
- **File Upload**: < 3s for 10MB file
- **Processing Start**: < 1s response time
- **Log Streaming**: Real-time with < 100ms delay
- **Results Render**: < 2s for 100 metrics
- **Export Generation**: < 5s for PDF
- **Bundle Size**: < 2MB gzipped
- **Time to Interactive**: < 3s on 3G connection
- **Memory Usage**: < 200MB for typical session

### Testing Strategy

#### Unit Tests
- Component rendering tests for all UI components
- Store action tests for state management
- Utility function tests for data parsing

#### Integration Tests
- File upload flow with various file types
- Configuration to processing workflow
- Export functionality with different formats

#### E2E Tests
- Complete workflow from upload to export
- Error scenarios and recovery
- Browser compatibility (Chrome, Firefox, Safari, Edge)

#### Acceptance Test Checklist
- [ ] File upload accepts valid formats
- [ ] File validation shows appropriate errors
- [ ] Configuration saves user selections
- [ ] Processing shows real-time progress
- [ ] Logs stream without freezing UI
- [ ] Results display with correct formatting
- [ ] References link to sources
- [ ] Export generates valid files
- [ ] Keyboard navigation works throughout
- [ ] Screen readers can navigate app

### Security Considerations
- **File Validation**: Strict type checking before processing
- **Script Injection**: Sanitize all user inputs
- **PDF Generation**: Use safe PDF library (reportlab)
- **No External Data**: All processing done locally
- **Session Isolation**: Each session independent
- **HTTPS Only**: Enforce secure connections in production

### Metrics & Analytics

#### Usage Metrics (Future)
- File upload success/failure rate
- Average processing time by file size
- Most used enrichment sources
- Export format preferences
- Error occurrence rates

#### Success Metrics
- **Adoption**: 50+ enrichments per week
- **Completion Rate**: > 80% of started workflows
- **Export Rate**: > 60% of completed enrichments
- **User Satisfaction**: > 4.5/5 rating
- **Error Rate**: < 5% of sessions encounter errors

### MVP Scope (6-8 weeks)

#### In Scope
- ✅ 4-step workflow UI with mock data
- ✅ File upload with validation
- ✅ Configuration interface
- ✅ Processing simulation with progress
- ✅ Results display with references
- ✅ Export to PDF/Markdown/JSON
- ✅ Responsive design (desktop/tablet)
- ✅ Error handling with user feedback
- ✅ Accessibility (WCAG 2.1 AA)

#### Out of Scope (Future Phases)
- ❌ User authentication system
- ❌ Saved configurations
- ❌ API integrations (Google Analytics, Facebook Ads)
- ❌ Batch processing multiple files
- ❌ Real backend integration (using mock data)
- ❌ Mobile app version
- ❌ Collaborative features
- ❌ Scheduled enrichments
- ❌ Custom benchmark uploads

### Development Timeline

#### Phase 1: UI Foundation (Weeks 1-2)
- Set up project structure
- Implement component library
- Create workflow navigation
- Build file upload with validation

#### Phase 2: Core Features (Weeks 3-4)
- Configuration interface
- Mock processing pipeline
- Results display
- Basic export functionality

#### Phase 3: Polish & Testing (Weeks 5-6)
- Error handling throughout
- Accessibility improvements
- Cross-browser testing
- Performance optimization

#### Phase 4: Integration Prep (Weeks 7-8)
- Document API requirements
- Create integration guides
- Prepare for backend connection
- Final testing and bug fixes

### Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend integration complexity | High | High | Use mock data for MVP, document API spec clearly |
| Large file processing | Medium | Medium | Implement file size limits, add chunking in Phase 2 |
| Browser compatibility | Low | Medium | Test on major browsers, use polyfills |
| Performance with large datasets | Medium | Low | Paginate results, virtualize long lists |
| Security vulnerabilities | High | Low | Security audit before production |

### API Specification (For Future Integration)

```typescript
// File Upload
POST /api/upload
Request: FormData with file
Response: { fileId: string, metrics: Metric[] }

// Start Enrichment
POST /api/enrich
Request: { fileId: string, config: EnrichmentConfig }
Response: { jobId: string }

// Get Progress (SSE)
GET /api/progress/:jobId
Response: EventStream with progress updates

// Get Results
GET /api/results/:jobId
Response: { metrics: EnrichedMetric[], references: Reference[] }

// Export
POST /api/export
Request: { jobId: string, format: 'pdf' | 'md' | 'json' }
Response: File download
```

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Week 1 | Use React over Vue | Team expertise, component ecosystem |
| Week 1 | Zustand over Redux | Simpler API, less boilerplate |
| Week 2 | Mock data for MVP | Faster delivery, cleaner API design |
| Week 2 | No authentication in MVP | Reduce scope, focus on core features |
| Week 3 | Tailwind CSS | Rapid prototyping, consistent design |

### Success Criteria for MVP Launch

1. **Functional Requirements**
   - [ ] Complete 4-step workflow functions with mock data
   - [ ] File upload accepts all specified formats
   - [ ] Export generates valid PDF/MD/JSON files
   - [ ] All error states handled gracefully

2. **Non-Functional Requirements**
   - [ ] Loads in <3s on 3G connection
   - [ ] No console errors in production
   - [ ] Works on Chrome, Firefox, Safari, Edge
   - [ ] Passes WCAG 2.1 AA audit

3. **Documentation**
   - [ ] User guide complete
   - [ ] API specification documented
   - [ ] Deployment guide ready
   - [ ] Known limitations listed

### Next Steps
1. Complete UI implementation with mock data
2. Conduct user testing with target audience
3. Document backend API requirements
4. Plan Phase 2 features based on user feedback
5. Prepare security audit checklist

---

**Document Version:** 2.0  
**Last Updated:** December 2024  
**Status:** Revised based on feedback  
**Owner:** Data Enricher Team