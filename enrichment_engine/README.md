# 🧠 Open Enrichment Engine

A fully **open-source intelligence pipeline** designed to replicate Meltwater, SimilarWeb, and Statista-style insights for marketing campaign reporting — **without using any proprietary APIs or services**.

## 🎯 Purpose

Replace expensive proprietary tools with custom-built intelligence gathering that provides:
- **Share of Voice** analysis
- **Competitive intelligence** 
- **Sentiment analysis**
- **Engagement benchmarking**
- **ROI assessment**
- **Market positioning**

## 🏗️ Architecture

```
enrichment_engine/
├── 🕷️ open_mcp_scraper.py        # Custom web intelligence scraper
├── 📊 benchmarks.yaml            # Industry KPI benchmarks  
├── 🤖 agent_gagambi_enrich.yaml # Pulser agent configuration
├── 📄 format_perplexity_refs.py  # Reference formatter
├── 📑 export_insights_to_pdf_simple.py # PDF generator
├── 🎨 ui/                        # User interfaces
│   ├── data-enricher/           # Main enrichment UI
│   │   ├── src/                 # React application
│   │   └── docs/                # Documentation
│   └── pointer-clone/           # Pointer workspace UI
├── 📁 results/                   # Output directory
└── 📖 README.md                  # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Python dependencies for core scripts
pip install aiohttp beautifulsoup4 pyyaml reportlab fpdf2

# Node.js dependencies for web UIs
cd ui/data-enricher && npm install
cd ../pointer-clone && npm install
```

### 2. Launch Web UI

```bash
# Start the Data Enricher interface
cd ui/data-enricher
npm start  # Opens at http://localhost:3000
```

### 3. Run Intelligence Gathering

```bash
# Basic scraping
python open_mcp_scraper.py \
  --query "DITO Telecom share of voice Philippines 2024" \
  --fields sov mentions engagement_rate sentiment

# JSON output
python open_mcp_scraper.py \
  --query "Globe vs Smart market share" \
  --fields sov roi hashtags \
  --output json
```

### 4. Pulser Integration

```bash
# Run full enrichment pipeline
:clodrep run agent_gagambi_enrich.yaml

# Or use the shell script
./run_enrichment_pipeline.sh "DITO Philippines campaign June 2024"
```

## 🛠️ Core Components

### 🎨 Web User Interfaces

#### Data Enricher UI
**Purpose:** Professional web interface for the enrichment pipeline.

**Features:**
- 4-step guided workflow
- Drag-and-drop file upload
- Real-time processing logs
- Perplexity-style references
- Export to PDF/Markdown/JSON

**Access:** http://localhost:3000

#### Pointer Clone UI
**Purpose:** Workspace management interface (Pointer.app clone).

**Features:**
- Light-themed modern design
- Command palette (Cmd+K)
- File tree navigation
- Settings management

**Access:** http://localhost:3001

### 🕷️ Open MCP Scraper

**Purpose:** Replaces Bright Data's proprietary MCP server with open-source web intelligence.

**Features:**
- DuckDuckGo search integration
- Pattern-based metric extraction
- Concurrent processing
- Multiple output formats

**Usage:**
```bash
python open_mcp_scraper.py --query "DITO independence day campaign" --fields sov sentiment engagement_rate
```

**Extractable Metrics:**
- `sov` - Share of Voice percentages
- `mentions` - Social media mentions count
- `engagement_rate` - Engagement rate percentages  
- `sentiment` - Positive sentiment scores
- `roi` - Return on investment percentages
- `hashtags` - Trending hashtags

### 📊 Benchmarks Store

**Purpose:** Replaces Statista and industry reports with curated benchmark data.

**Coverage:**
- **Social Media:** Facebook, Instagram, TikTok, Twitter benchmarks
- **Industry-Specific:** Telecom, QSR, Retail performance standards
- **Campaign Types:** Awareness, Engagement, Conversion targets
- **Seasonal Adjustments:** Holiday and monthly trend multipliers
- **Competitive Intelligence:** Market leader positioning

**Example:**
```yaml
telecommunications:
  roi_avg: 3.8
  roi_top_quartile: 6.5
  share_of_voice:
    globe: 45.2
    smart: 42.8
    dito: 12.0
```

### 📄 Reference Formatter

**Purpose:** Converts raw insights to Perplexity-style format with inline citations.

**Features:**
- Inline [1][2] citation style
- Source-to-metric mapping
- Clean markdown output
- Reference deduplication

**Usage:**
```bash
python format_perplexity_refs.py
```

### 📑 PDF Export

**Purpose:** Professional report generation with proper formatting.

**Features:**
- ReportLab-based generation
- Metrics tables with trends
- Numbered reference section
- Professional typography

**Usage:**
```bash
python export_insights_to_pdf_simple.py
```

### 🤖 Gagambi Agent

**Purpose:** Orchestrates intelligence gathering and report generation.

**Workflow:**
1. Extract base campaign metrics
2. Gather web intelligence via scraper
3. Load relevant benchmarks
4. Perform comparative analysis
5. Generate enhanced insights
6. Format with references
7. Export to PDF/Markdown

## 📈 Sample Output

```markdown
# 📊 Enhanced Campaign Intelligence Report

## 🎯 Executive Summary
**Campaign:** DITO Independence Day 2024
**Enhanced Intelligence:** Web-scraped competitive data shows DITO's SOV increased 7% vs competitors' 2-5%.

## 📈 Share of Voice Analysis
**Market Position:** 21.7% (vs Industry Avg: 15.2%)
**Competitive Landscape:**
- Globe: 44.1% (-1.2% vs last period)
- Smart: 42.3% (+2.1% vs last period)  
- DITO: 21.7% (+7.0% vs last period)

## 🎪 Engagement Performance
**Overall Engagement Rate:** 116.95%
- vs Facebook Average (0.9%): **129.9x above benchmark**
- vs Telecom Industry (2.8%): **41.8x above benchmark**

## 💰 ROI Assessment
**Campaign ROI:** 6.6%
**Industry Benchmark:** 3.8%
**Performance Rating:** ⭐⭐⭐⭐ Excellent (74% above industry average)
```

## 🔧 Advanced Usage

### Custom Query Patterns

```bash
# Brand-specific intelligence
python open_mcp_scraper.py \
  --query "Jollibee vs McDonald's Philippines social engagement 2024" \
  --fields engagement_rate mentions sentiment

# Industry analysis  
python open_mcp_scraper.py \
  --query "Philippine telecom social media ROI analysis" \
  --fields roi sov competitive_intelligence

# Campaign-specific insights
python open_mcp_scraper.py \
  --query "Globe Independence Day campaign performance vs competitors" \
  --fields engagement_rate sentiment hashtags
```

### Integration with Existing Tools

```bash
# Export to JSON for further processing
python open_mcp_scraper.py --query "..." --fields "..." --output json > intelligence.json

# Chain with analysis tools
python open_mcp_scraper.py --query "..." --fields "..." | python analyze_trends.py

# Scheduled intelligence gathering
crontab -e
# 0 9 * * 1 cd /path/to/enrichment_engine && python open_mcp_scraper.py --query "weekly brand intelligence" --fields sov mentions > weekly_report.txt
```

## 🎨 Customization

### Adding New Metrics

Edit `open_mcp_scraper.py` to add new extraction patterns:

```python
# Add new metric extraction
if 'your_metric' in fields:
    your_patterns = [
        r'your.{0,10}pattern.{0,10}(\d+\.?\d*)%',
        r'another.{0,10}pattern.{0,10}(\d+\.?\d*)'
    ]
    for pattern in your_patterns:
        match = re.search(pattern, text_lower)
        if match:
            metrics['your_metric'] = f"{match.group(1)}%"
            break
```

### Expanding Benchmarks

Add new industry or platform benchmarks to `benchmarks.yaml`:

```yaml
your_industry:
  metric_name:
    average: 5.2
    good: 8.0
    excellent: 12.0
```

### Custom Agent Workflows

Modify `agent_gagambi_enrich.yaml` to add new processing steps:

```yaml
- step: your_custom_step
  description: Your custom processing
  script: ./your_script.py
  params:
    custom_param: value
  output: your_output.json
```

## 🛡️ Ethical Usage

This tool is designed for **legitimate competitive intelligence** and **market research** purposes:

✅ **Allowed:**
- Public data aggregation
- Industry benchmark comparison
- Competitive analysis from public sources
- Market trend identification

❌ **Not Allowed:**
- Scraping private/protected data
- Violating website terms of service
- Accessing proprietary databases
- Bypassing authentication systems

## 🔄 Maintenance

### Updating Search Patterns

Regularly review and update extraction patterns in `open_mcp_scraper.py` as web content formats change.

### Benchmark Refresh

Update `benchmarks.yaml` quarterly with new industry data:

```bash
# Backup current benchmarks
cp benchmarks.yaml benchmarks_backup_$(date +%Y%m%d).yaml

# Update with new data
vim benchmarks.yaml
```

### Performance Monitoring

Monitor scraping success rates:

```bash
# Test scraper health
python open_mcp_scraper.py --query "test query" --fields sov --max-results 3
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Add** new metrics, patterns, or benchmarks
4. **Test** with real queries
5. **Submit** a pull request

## 📞 Support

For issues or questions:
- Check existing patterns in `open_mcp_scraper.py`
- Review benchmark structure in `benchmarks.yaml`
- Verify agent configuration in `agent_gagambi_enrich.yaml`

---

## 🏆 Advantages Over Proprietary Tools

| Feature | Proprietary Tools | Open Enrichment Engine |
|---------|------------------|----------------------|
| **Cost** | $500-2000/month | Free |
| **Customization** | Limited | Fully customizable |
| **Data Control** | Vendor-dependent | Full ownership |
| **Integration** | API restrictions | Native Pulser integration |
| **Transparency** | Black box | Open source |
| **Scalability** | Usage limits | Unlimited |

---

*Built for the modern marketing team that values independence, transparency, and cost-effectiveness in competitive intelligence.*