# 📐 Scout Dashboard Visual Layout Grid

## Grid System Specifications

- **Total Columns**: 12
- **Row Height**: 80px (base unit)
- **Gap**: 16px
- **Responsive Breakpoints**:
  - Desktop: 1920px (12 columns)
  - Laptop: 1366px (12 columns)
  - Tablet: 768px (8 columns)
  - Mobile: 375px (4 columns)

---

## 🧭 Executive Overview Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXECUTIVE OVERVIEW DASHBOARD                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ [0,0,3,2]          [3,0,3,2]          [6,0,6,2]                            │
│ ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────────┐ │
│ │  REVENUE    │    │   REGIONS   │    │      PERSONA MIX              │ │
│ │  ₱1.25M     │    │   DONUT     │    │   Male/Female by Age          │ │
│ │  ▲ 12.5%    │    │   CHART     │    │   [Stacked Bar Chart]         │ │
│ │ [Sparkline] │    │             │    │                               │ │
│ └─────────────┘    └─────────────┘    └─────────────────────────────────┘ │
│                                                                             │
│ [0,2,6,3]                              [6,2,6,3]                           │
│ ┌─────────────────────────────────┐    ┌─────────────────────────────────┐ │
│ │   PRODUCT CATEGORIES            │    │   CAMPAIGN EFFECTIVENESS      │ │
│ │   [Horizontal Bar Chart]        │    │   [Timeline Bar + Line]       │ │
│ │   ├─ Electronics    ████████    │    │   📊 Daily uplift vs baseline │ │
│ │   ├─ Food & Bev    ██████       │    │   ── Baseline ┃┃ Uplift      │ │
│ │   └─ Personal Care ████         │    │                               │ │
│ └─────────────────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

Legend: [x,y,width,height] in grid units
```

### Executive Overview Zone Specifications

| Zone ID | Type | Position | Size | Priority |
|---------|------|----------|------|----------|
| `exec-revenue-kpi` | KPI Card | [0,0] | 3x2 | High |
| `exec-region-performance` | Donut Chart | [3,0] | 3x2 | High |
| `exec-persona-demographics` | Stacked Bar | [6,0] | 6x2 | Medium |
| `exec-category-performance` | H-Bar Chart | [0,2] | 6x3 | High |
| `exec-campaign-timeline` | Bar+Line | [6,2] | 6x3 | Medium |

---

## 📊 Analytics Deep Dive Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS DEEP DIVE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [0,0,8,4]                                      [8,0,4,4]                     │
│ ┌───────────────────────────────────────┐     ┌─────────────────────────┐ │
│ │   REVENUE TRENDS (Multi-Line)         │     │  BASKET DISTRIBUTION    │ │
│ │   ╱╲    ╱╲    Region 1               │     │  ┬     (Box Plot)       │ │
│ │  ╱  ╲  ╱  ╲   Region 2               │     │  │ ┌─┐                  │ │
│ │ ╱    ╲╱    ╲  Region 3               │     │  ├─┤ │                  │ │
│ │                                       │     │  │ └─┘                  │ │
│ │ [Brush Selection] [Export] [Forecast] │     │  ┴                      │ │
│ └───────────────────────────────────────┘     └─────────────────────────┘ │
│                                                                             │
│ [0,4,6,4]                              [6,4,6,4]                           │
│ ┌─────────────────────────────────┐    ┌─────────────────────────────────┐ │
│ │  TRANSACTION HEATMAP            │    │  REVENUE FORECAST             │ │
│ │  Hour  0  6  12  18  24         │    │  Historical ─── Forecast ┅┅┅  │ │
│ │  Mon  ▓▓░░▓▓▓▓░░               │    │      ╱╲        ╱┅┅┅┅┅┅       │ │
│ │  Tue  ▓░░░▓▓▓▓▓░               │    │     ╱  ╲    ╱┅┅┅┅┅┅┅┅       │ │
│ │  Wed  ▓▓░░▓▓▓▓░░               │    │    ╱    ╲  ╱┅┅┅┅┅┅┅┅┅       │ │
│ └─────────────────────────────────┘    └─────────────────────────────────┘ │
│                                                                             │
│ [0,8,12,4]                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                    BRAND SUBSTITUTION FLOW (Sankey)                      │ │
│ │   Brand A ═══════╗                                                       │ │
│ │   Brand B ══════╗╚═══════ Substitute X                                   │ │
│ │   Brand C ═════╗╚════════ Substitute Y                                   │ │
│ │                ╚═════════ Substitute Z                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Analytics Deep Dive Zone Specifications

| Zone ID | Type | Position | Size | Priority |
|---------|------|----------|------|----------|
| `analytics-revenue-trends` | Multi-Line | [0,0] | 8x4 | High |
| `analytics-basket-distribution` | Box Plot | [8,0] | 4x4 | Medium |
| `analytics-transaction-heatmap` | Heatmap | [0,4] | 6x4 | High |
| `analytics-revenue-forecast` | Area+Forecast | [6,4] | 6x4 | High |
| `analytics-brand-flow` | Sankey | [0,8] | 12x4 | Medium |

---

## 🧠 Consumer Insights Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONSUMER INSIGHTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [0,0,6,3]               [6,0,3,3]           [9,0,3,3]                      │
│ ┌───────────────────┐   ┌─────────────┐     ┌─────────────────────────┐  │
│ │ REQUEST MODES     │   │ ACCEPTANCE  │     │ SPEND SEGMENTS          │  │
│ │ ██████████ 45%    │   │    GAUGE    │     │ ₱0-500    ████████     │  │
│ │ ██████████ 55%    │   │    75%      │     │ ₱500-1K   ██████       │  │
│ │ Branded/Unbranded │   │   ◐         │     │ ₱1K-5K    ████         │  │
│ └───────────────────┘   └─────────────┘     └─────────────────────────┘  │
│                                                                             │
│ [0,3,6,4]                              [6,3,6,4]                           │
│ ┌─────────────────────────────────┐    ┌─────────────────────────────────┐ │
│ │   UNBRANDED REQUESTS            │    │   CONSUMER JOURNEY FUNNEL     │ │
│ │        shampoo                  │    │     Browse     100% ▼         │ │
│ │    soap    conditioner          │    │     Inquire     75% ▼         │ │
│ │  detergent    toothpaste       │    │     Add Cart    45% ▼         │ │
│ │      milk     rice              │    │     Purchase    30% ▼         │ │
│ │         [Word Cloud]            │    │     Repeat      15%           │ │
│ └─────────────────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Consumer Insights Zone Specifications

| Zone ID | Type | Position | Size | Priority |
|---------|------|----------|------|----------|
| `insights-request-mode` | 100% Stacked Bar | [0,0] | 6x3 | High |
| `insights-suggestion-acceptance` | Gauge | [6,0] | 3x3 | Medium |
| `insights-spend-segments` | H-Bar Grouped | [9,0] | 3x3 | Medium |
| `insights-unbranded-requests` | Word Cloud | [0,3] | 6x4 | High |
| `insights-consumer-journey` | Funnel | [6,3] | 6x4 | High |

---

## 🌍 Geographic Intelligence Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GEOGRAPHIC INTELLIGENCE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ [0,0,8,6]                                      [8,0,4,6]                     │
│ ┌───────────────────────────────────────┐     ┌─────────────────────────┐ │
│ │                                       │     │ REGION COMPARISON       │ │
│ │         PHILIPPINES MAP               │     │ ┌─────────────────────┐ │ │
│ │      [Choropleth + Bubbles]          │     │ │NCR    ₱1.2M  ▲12% ～│ │ │
│ │                                       │     │ │Luzon  ₱890K  ▲8%  ～│ │ │
│ │    🔵 = Store Location                │     │ │Visaya ₱650K  ▼2%  ～│ │ │
│ │    Color = Revenue Intensity          │     │ │Mindan ₱445K  ▲5%  ～│ │ │
│ │                                       │     │ └─────────────────────┘ │ │
│ │ [🔍 Zoom] [📍 Select] [📊 Filter]    │     │ [Sort ▼] [Export]       │ │
│ └───────────────────────────────────────┘     └─────────────────────────┘ │
│                                                                             │
│ [0,6,12,4]                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                    GEOGRAPHIC ANOMALY HEATMAP                            │ │
│ │  ⚠️ High anomaly zones    🟡 Medium alerts    ✓ Normal activity        │ │
│ │  [Interactive heat overlay on map with time scrubber]                   │ │
│ │  ◀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Geographic Intelligence Zone Specifications

| Zone ID | Type | Position | Size | Priority |
|---------|------|----------|------|----------|
| `geo-revenue-map` | Choropleth Map | [0,0] | 8x6 | High |
| `geo-demographic-bubbles` | Bubble Overlay | [0,0] | 8x6 | High |
| `geo-comparison-table` | Table+Sparkline | [8,0] | 4x6 | Medium |
| `geo-anomaly-heat` | Heat Overlay | [0,6] | 12x4 | High |

---

## 📁 Reports & Export Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REPORTS & EXPORT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ [0,0,4,6]               [4,0,4,2]              [4,2,8,4]                    │
│ ┌───────────────────┐   ┌─────────────────┐    ┌────────────────────────┐ │
│ │ SAVED QUERIES     │   │ ACTIVE FILTERS  │    │   REPORT PREVIEW       │ │
│ │ ┌───────────────┐ │   │ Region: NCR [x] │    │                        │ │
│ │ │ Daily Revenue │ │   │ Date: 30d   [x] │    │   [Selected Chart      │ │
│ │ │ by Jake       │ │   │ Brand: All  [x] │    │    Renders Here]       │ │
│ │ └───────────────┘ │   └─────────────────┘    │                        │ │
│ │ ┌───────────────┐ │                           │   📊 📈 📉            │ │
│ │ │ Weekly KPIs   │ │                           │                        │ │
│ │ │ by Sarah      │ │                           │ [Configure] [Export]   │ │
│ │ └───────────────┘ │                           └────────────────────────┘ │
│ │ [+ New] [Search] │                                                       │
│ └───────────────────┘                                                       │
│                                                                             │
│ [0,6,12,4]                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                          EXPORT HISTORY                                  │ │
│ │  📅 Today                                                                │ │
│ │  • 14:32 - Revenue Report.xlsx - Jake T. - [NCR, Last 30d]             │ │
│ │  • 11:15 - KPI_Dashboard.pdf - Sarah M. - [All Regions, Q3]            │ │
│ │  📅 Yesterday                                                            │ │
│ │  • 16:45 - Category_Analysis.csv - Mike R. - [Electronics, YTD]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Reports & Export Zone Specifications

| Zone ID | Type | Position | Size | Priority |
|---------|------|----------|------|----------|
| `reports-saved-queries` | List/Cards | [0,0] | 4x6 | High |
| `reports-filter-summary` | Filter Pills | [4,0] | 4x2 | Medium |
| `reports-preview` | Dynamic Chart | [4,2] | 8x4 | High |
| `reports-export-log` | Timeline | [0,6] | 12x4 | Low |

---

## 🤖 AI Assistant Panel (Suqi) - Floating Overlay

```
┌─────────────────────────┐
│ 🤖 Suqi AI Assistant    │
├─────────────────────────┤
│ Context: Revenue Chart  │
│                         │
│ Suggestions:            │
│ • Why spike on Jan 15?  │
│ • Forecast next week    │
│ • Compare to last year  │
│                         │
│ ┌─────────────────────┐ │
│ │ Type your question  │ │
│ └─────────────────────┘ │
│         [Send]          │
└─────────────────────────┘

Position: Floating right panel
Width: 350px
Height: Auto (max 80vh)
Trigger: AI button or Cmd+K
```

---

## 📱 Responsive Behavior

### Tablet (768px - 1365px)
- Grid reduces to 8 columns
- Side-by-side zones stack vertically
- Maps take full width
- Tables become scrollable

### Mobile (< 768px)
- Grid reduces to 4 columns
- All zones stack vertically
- Simplified chart views
- Swipeable between zones
- Bottom sheet for filters

---

## 🎨 Design Tokens

```css
:root {
  /* Grid System */
  --grid-columns: 12;
  --grid-gap: 16px;
  --grid-row-height: 80px;
  
  /* Zone Styling */
  --zone-border-radius: 8px;
  --zone-shadow: 0 2px 8px rgba(0,0,0,0.1);
  --zone-padding: 20px;
  --zone-header-height: 48px;
  
  /* Breakpoints */
  --breakpoint-mobile: 375px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1366px;
  --breakpoint-wide: 1920px;
  
  /* Z-indexes */
  --z-zone: 1;
  --z-zone-hover: 10;
  --z-modal: 100;
  --z-ai-panel: 90;
  --z-toast: 110;
}
```

---

## 🔧 Implementation Notes

1. **Zone Positioning**:
   ```typescript
   // Position format: [x, y, width, height]
   position: { x: 0, y: 0, w: 3, h: 2 }
   ```

2. **Responsive Handling**:
   ```typescript
   const getResponsivePosition = (zone, breakpoint) => {
     if (breakpoint < 768) {
       return { x: 0, y: zone.y, w: 4, h: zone.h };
     }
     return zone.position;
   };
   ```

3. **Zone Stacking Order**:
   - High priority zones render first
   - User can reorder via drag-and-drop
   - AI suggestions respect zone priority

4. **Performance Considerations**:
   - Lazy load zones outside viewport
   - Virtual scrolling for large tables
   - Debounce resize events
   - Cache rendered charts

This visual layout grid provides precise positioning for all dashboard zones while maintaining flexibility for user customization and responsive behavior.