# Pulser SDK 4.0 - DevTools Integration

## 🎯 Overview

The Pulser SDK 4.0 now includes comprehensive DevTools integration for both JavaScript/TypeScript and Python platforms. This provides developers with powerful debugging, logging, and monitoring capabilities for their AI agent orchestration workflows.

## ✨ Features

### JavaScript/TypeScript DevTools

1. **Browser DevTools Overlay**
   - Visual overlay panel with agent call logs
   - Real-time filtering and search
   - Export functionality
   - Keyboard shortcuts (Ctrl/Cmd + Shift + P)

2. **Automatic Logging**
   - Console logging with styled output
   - LocalStorage persistence
   - Mock vs Real call differentiation
   - Performance tracking

3. **React Integration**
   - `PulserDevToolsProvider` component
   - `usePulserDevTools` hook
   - `useAgentLogger` hook
   - `PulserDevToolsButton` component

4. **Middleware Support**
   - Next.js middleware with automatic token injection
   - Express middleware for Node.js apps
   - Request/response tracking
   - Error handling

### Python DevTools

1. **Rich Console Output**
   - Beautiful formatted output with Rich library
   - Fallback to simple console logging
   - Color-coded agent calls

2. **Performance Tracking**
   - Automatic duration measurement
   - Statistical analysis
   - Performance summaries

3. **Tracing Support**
   - Context manager for operation tracing
   - Nested operation tracking
   - Automatic timing

4. **Export Capabilities**
   - JSON export
   - JSONL export
   - Configurable output formats

## 📦 Installation

### JavaScript/TypeScript
```bash
npm install pulser-sdk
# or
yarn add pulser-sdk
```

### Python
```bash
pip install pulser-sdk
```

## 🚀 Usage Examples

### JavaScript/TypeScript

#### Basic DevTools Setup
```typescript
import { PulserClient, PulserDevTools } from 'pulser-sdk';

// Initialize DevTools
const devTools = new PulserDevTools({
  enabled: true,
  maxLogs: 100,
  consoleLogging: true,
  overlayEnabled: true
});

// Initialize client with DevTools
const client = new PulserClient({
  apiKey: 'your-api-key',
  devTools: devTools
});

// Agent calls are automatically logged
const agent = await client.createAgent({ name: 'my-agent' });
const result = await agent.execute({
  task: 'analyze_data',
  input: { data: [1, 2, 3] }
});
```

#### React Integration
```tsx
import { PulserDevToolsProvider, PulserDevToolsButton, useAgentLogger } from 'pulser-sdk';

function App() {
  return (
    <PulserDevToolsProvider>
      <YourApp />
      <PulserDevToolsButton />
    </PulserDevToolsProvider>
  );
}

function YourComponent() {
  const { logAgentCall } = useAgentLogger();
  
  const handleAgentCall = async () => {
    const start = Date.now();
    const result = await callAgent();
    
    logAgentCall({
      agent: 'my-agent',
      input: { task: 'process' },
      output: result,
      duration: Date.now() - start,
      mock: false
    });
  };
}
```

#### Next.js Middleware
```typescript
// middleware.ts
import { createNextJsMiddleware } from 'pulser-sdk';

export default createNextJsMiddleware({
  apiRoutes: ['/api/agent', '/api/pulser'],
  injectToken: true,
  enableLogging: true
});

export const config = {
  matcher: '/api/:path*'
};
```

### Python

#### Basic DevTools Usage
```python
from pulser_sdk import PulserAgent, log_agent_call, trace, print_summary

# Create agent
agent = PulserAgent(name="data-analyzer")

# Manual logging
result = agent.execute({"task": "analyze", "data": [1, 2, 3]})
log_agent_call(
    agent="data-analyzer",
    input_data={"task": "analyze", "data": [1, 2, 3]},
    output_data=result,
    duration=0.123,
    mock=False
)

# Using trace context manager
with trace("data_processing"):
    # Your code here
    processed = process_data(data)

# Print summary
print_summary()
```

#### Decorator Usage
```python
from pulser_sdk import PulserDevTools

devtools = PulserDevTools()

@devtools.decorator("sentiment-analyzer")
async def analyze_sentiment(text: str):
    # Your analysis code
    return {"sentiment": "positive", "score": 0.85}

# Calls are automatically logged
result = await analyze_sentiment("This is great!")
```

## 🔧 Configuration

### JavaScript/TypeScript Configuration
```typescript
const devToolsConfig = {
  enabled: true,              // Enable/disable DevTools
  maxLogs: 100,              // Maximum logs to keep
  persistToLocalStorage: true, // Save logs to localStorage
  consoleLogging: true,       // Log to browser console
  overlayEnabled: true        // Show visual overlay
};
```

### Python Configuration
```python
config = {
    'enabled': True,            # Enable/disable DevTools
    'max_logs': 1000,          # Maximum logs to keep
    'console_logging': True,    # Log to console
    'file_logging': False,      # Log to file
    'log_file': 'pulser.log',  # Log file path
    'use_rich': True,          # Use Rich for formatting
    'auto_trace': True,        # Auto-trace operations
    'performance_tracking': True # Track performance metrics
}
```

## 🎨 Visual DevTools Overlay

The JavaScript SDK includes a visual overlay that appears in the browser:

- **Toggle**: Press `Ctrl/Cmd + Shift + P`
- **Features**:
  - Real-time log streaming
  - Filter by text, mock/real status
  - Export logs as JSON
  - Clear logs
  - Performance metrics display

## 📊 Performance Tracking

Both SDKs automatically track performance metrics:

- Call duration
- Success/failure rates
- Agent-specific statistics
- Aggregated performance data

## 🔐 Security Considerations

- DevTools are automatically disabled in production by default
- Sensitive data can be filtered from logs
- Token injection happens server-side only
- Logs are stored locally (not sent to external services)

## 🚢 Platform Availability

The Pulser SDK 4.0 with DevTools integration is available on:

- **npm**: https://www.npmjs.com/package/pulser-sdk
- **PyPI**: https://pypi.org/project/pulser-sdk/
- **GitHub**: https://github.com/jgtolentino/pulser-sdk

## 📝 Memory System Update

This DevTools integration is now part of the Pulser 4.0 ecosystem and has been registered in the memory system:

- **Component**: Pulser SDK DevTools
- **Version**: 4.0.0
- **Platforms**: JavaScript/TypeScript (npm), Python (PyPI)
- **Features**: Browser overlay, middleware, logging, tracing, performance tracking
- **Status**: Implementation complete, ready for deployment

## 🎯 Integration with Agent Ecosystem

The DevTools work seamlessly with the Pulser agent ecosystem:

- **Claudia**: Primary orchestrator - all routing decisions logged
- **Maya**: Process architect - workflow steps tracked
- **Kalaw**: Research indexer - data operations monitored
- **Echo**: Multimodal analyzer - analysis results logged
- **Tide**: Data analyst - query performance tracked
- **Surf**: Engineering expert - code generation monitored
- **Basher**: Systems automator - command execution logged

All agent calls through the MCP (Model Context Protocol) are automatically captured and displayed in the DevTools.

---

**Last Updated**: January 2025
**Version**: 4.0.0
**Status**: Ready for deployment to PyPI and npm