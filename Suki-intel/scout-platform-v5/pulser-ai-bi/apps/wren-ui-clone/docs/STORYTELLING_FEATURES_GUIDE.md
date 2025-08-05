# Scout Dashboard Storytelling Features Guide

## Overview

The Scout Dashboard now includes powerful data storytelling capabilities that transform raw analytics into compelling narratives. This guide covers the three main storytelling features:

1. **Story Mode Toggle** - Switch between Focus and Explore modes
2. **AI Explain Button** - Get instant AI-powered chart explanations
3. **Data Storytelling Guidelines** - Best practices for effective visualization

## Features

### 1. Story Mode Toggle

The Story Mode Toggle allows users to switch between two viewing modes:

#### Focus Mode
- Shows only key insights and AI-generated narratives
- Hides complex controls and detailed data
- Emphasizes important metrics with visual highlights
- Perfect for presentations and executive reviews

#### Explore Mode
- Full interactive dashboard with all features
- Complete access to filters, drill-downs, and raw data
- Ideal for analysts and detailed investigation

#### Implementation

```tsx
import { StoryModeProvider, StoryModeToggle } from '@/components/Dashboard/StoryModeToggle';

// Wrap your app with the provider
function App() {
  return (
    <StoryModeProvider defaultMode="explore">
      <Dashboard />
    </StoryModeProvider>
  );
}

// Add the toggle to your UI
function Dashboard() {
  return (
    <div>
      <StoryModeToggle position="fixed" />
      {/* Your dashboard content */}
    </div>
  );
}
```

#### Conditional Rendering

Use the `useStoryModeVisibility` hook to show/hide content based on mode:

```tsx
import { useStoryModeVisibility } from '@/contexts/StoryModeContext';

function DetailedAnalysis() {
  const { className } = useStoryModeVisibility({
    showInFocus: false,    // Hidden in Focus mode
    showInExplore: true    // Visible in Explore mode
  });

  return (
    <div className={className}>
      {/* This content only shows in Explore mode */}
    </div>
  );
}
```

### 2. AI Explain Button

Every chart now includes an AI-powered "Explain This" button that provides:

- **Headline**: A concise summary of the main insight
- **Narrative**: Detailed explanation of what the data shows
- **Key Insights**: Bullet points of important findings
- **Recommendations**: Actionable next steps

#### Usage in Charts

The ExplainThisChartButton is automatically integrated into chart components:

```tsx
<DonutChart
  id="revenue-chart"
  data={revenueData}
  title="Revenue by Region"
  showExplainButton={true}      // Enable AI explain
  audience="executive"           // Tailor explanations
/>
```

#### Audience Types

Explanations are tailored to three audience types:

- **`executive`**: High-level, business-focused insights
- **`manager`**: Balanced operational insights
- **`analyst`**: Detailed technical analysis

#### Custom Implementation

For custom charts, wrap with ChartProvider:

```tsx
import { ChartProvider } from '@/contexts/ChartContext';
import { ExplainThisChartButton } from '@/components/Charts/ExplainThisChartButton';

function CustomChart({ data, title }) {
  const chartContext = {
    chartId: 'custom-chart-1',
    chartType: 'custom',
    data,
    title
  };

  return (
    <ChartProvider value={chartContext}>
      <div className="relative">
        {/* Your chart implementation */}
        <ExplainThisChartButton 
          position="top-right"
          audience="manager"
        />
      </div>
    </ChartProvider>
  );
}
```

### 3. Data Storytelling Guidelines

Follow the comprehensive guidelines in `data_storytelling_guidelines.md`:

#### Core Principles

1. **Start with the "So What?"** - Every chart should answer a specific business question
2. **Context → Insight → Action** - Structure your narrative arc
3. **The 10-Second Rule** - Main message must be clear within 10 seconds

#### Chart Selection

| Question | Best Chart | Example |
|----------|-----------|---------|
| What's the trend? | Line chart | Monthly revenue |
| How do parts compare? | Bar chart | Sales by region |
| What's the distribution? | Histogram | Customer ages |
| How are things related? | Scatter plot | Price vs. demand |

## Complete Example

Here's a full implementation example:

```tsx
import React from 'react';
import { StoryModeProvider, StoryModeToggle } from '@/components/Dashboard/StoryModeToggle';
import { DonutChart } from '@/components/Charts/DonutChart';
import { HeatmapChart } from '@/components/Charts/HeatmapChart';
import { useStoryModeVisibility } from '@/contexts/StoryModeContext';

// Import the story mode styles
import '@/styles/story-mode.css';

function ExecutiveDashboard() {
  // Show insights only in Focus mode
  const insightsVisibility = useStoryModeVisibility({
    showInFocus: true,
    showInExplore: false,
    emphasizeInFocus: true
  });

  // Show details only in Explore mode
  const detailsVisibility = useStoryModeVisibility({
    showInFocus: false,
    showInExplore: true
  });

  return (
    <StoryModeProvider defaultMode="explore">
      <div className="dashboard">
        {/* Header with Toggle */}
        <header className="dashboard-header">
          <h1>Executive Dashboard</h1>
          <StoryModeToggle />
        </header>

        {/* AI Insights (Focus Mode) */}
        <div className={insightsVisibility.className}>
          <div className="insight-card">
            <h2>Key Insights</h2>
            <ul>
              <li>Revenue up 23% YoY</li>
              <li>Asia Pacific fastest growing region</li>
              <li>Customer satisfaction at all-time high</li>
            </ul>
          </div>
        </div>

        {/* Charts with AI Explain */}
        <div className="dashboard-grid">
          <DonutChart
            id="revenue-by-region"
            data={revenueData}
            title="Revenue Distribution"
            showExplainButton={true}
            audience="executive"
          />

          <HeatmapChart
            id="activity-patterns"
            data={activityData}
            title="Weekly Activity"
            showExplainButton={true}
            audience="executive"
          />
        </div>

        {/* Detailed Tables (Explore Mode) */}
        <div className={detailsVisibility.className}>
          <DataTable data={detailedData} />
        </div>
      </div>
    </StoryModeProvider>
  );
}
```

## Best Practices

### 1. Story Mode Design

- **Focus Mode**: Prioritize insights over data
- **Explore Mode**: Provide full analytical capabilities
- Use smooth transitions between modes
- Ensure mobile responsiveness

### 2. AI Explanations

- Always provide chart context (title, filters, time range)
- Choose appropriate audience type
- Allow users to copy/share insights
- Include confidence scores when available

### 3. Visual Hierarchy

- Use color purposefully (not decoratively)
- Maintain consistent scales across charts
- Start bar charts at zero
- Round numbers for readability

### 4. Performance

- Lazy load AI explanations
- Cache generated insights
- Debounce mode toggles
- Optimize chart rendering

## Troubleshooting

### Common Issues

1. **Story Mode not switching**
   - Ensure StoryModeProvider wraps your app
   - Check localStorage permissions
   - Verify CSS is imported

2. **AI Explain not working**
   - Confirm ChartProvider is implemented
   - Check Suqi AI client configuration
   - Verify chart data structure

3. **Styling issues**
   - Import story-mode.css
   - Check for CSS conflicts
   - Ensure proper class names

## API Reference

### StoryModeProvider

```tsx
interface StoryModeProviderProps {
  children: ReactNode;
  defaultMode?: 'focus' | 'explore';
  onModeChange?: (mode: StoryMode) => void;
}
```

### useStoryMode Hook

```tsx
interface StoryModeContextValue {
  mode: StoryMode;
  setMode: (mode: StoryMode) => void;
  toggleMode: () => void;
  isFocusMode: boolean;
  isExploreMode: boolean;
}
```

### ExplainThisChartButton

```tsx
interface ExplainThisChartButtonProps {
  className?: string;
  variant?: 'icon' | 'text' | 'full';
  position?: 'top-right' | 'bottom-right' | 'inline';
  audience?: 'executive' | 'manager' | 'analyst';
}
```

## Future Enhancements

- [ ] Natural language querying
- [ ] Automated insight scheduling
- [ ] Custom story templates
- [ ] Multi-language support
- [ ] Export to presentation formats
- [ ] Voice-over narration
- [ ] Collaborative annotations

## Support

For questions or issues:
- Check the [Data Storytelling Guidelines](./data_storytelling_guidelines.md)
- Review example implementations
- Contact the Scout Platform team

---

*Transform data into decisions, not decorations.*