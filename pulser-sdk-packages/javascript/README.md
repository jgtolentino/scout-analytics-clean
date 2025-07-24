# Pulser SDK for JavaScript/TypeScript

[![npm version](https://badge.fury.io/js/pulser-sdk.svg)](https://badge.fury.io/js/pulser-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/pulser-sdk.svg)](https://www.npmjs.com/package/pulser-sdk)

Enterprise AI Agent Orchestration Platform for Creative Intelligence - JavaScript/TypeScript SDK

## 🚀 Overview

Pulser SDK is a production-ready framework for building, deploying, and managing autonomous AI agents at scale. This TypeScript SDK provides a type-safe, async-first interface for integrating Pulser into your JavaScript applications.

## ✨ Features

- **🎯 Type-Safe**: Full TypeScript support with comprehensive type definitions
- **⚡ Async/Await**: Modern promise-based API
- **🔄 Real-time**: WebSocket support for live agent communication
- **🎨 React Ready**: Optional React hooks for UI integration
- **📦 Tree-Shakeable**: Optimized bundle size with ES modules
- **🔒 Secure**: Built-in authentication and API key management
- **📊 Observable**: Event-driven architecture with EventEmitter

## 📦 Installation

```bash
# npm
npm install pulser-sdk

# yarn
yarn add pulser-sdk

# pnpm
pnpm add pulser-sdk
```

## 🚀 Quick Start

```typescript
import { PulserClient, AgentConfig } from 'pulser-sdk';

// Initialize client
const client = new PulserClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Configure an agent
const config: AgentConfig = {
  name: 'creative-optimizer',
  model: 'gpt-4',
  temperature: 0.7,
  capabilities: ['text_generation', 'image_analysis']
};

// Create and use agent
async function optimizeCampaign() {
  const agent = await client.createAgent(config);
  
  const result = await agent.execute({
    task: 'optimize_ad_copy',
    input: {
      brand: 'Nike',
      product: 'Air Max',
      targetAudience: 'Young Athletes'
    }
  });
  
  console.log(result);
}

optimizeCampaign();
```

## 📚 API Reference

### Client Initialization

```typescript
import { PulserClient } from 'pulser-sdk';

const client = new PulserClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.pulser.ai', // optional
  timeout: 30000, // optional, in ms
  retries: 3, // optional
  environment: 'production' // optional
});
```

### Agent Management

```typescript
// Create an agent
const agent = await client.createAgent({
  name: 'my-agent',
  model: 'claude-3',
  capabilities: ['text', 'vision']
});

// List agents
const agents = await client.listAgents();

// Get specific agent
const agent = await client.getAgent('agent-id');

// Update agent
await agent.update({
  temperature: 0.8,
  maxTokens: 4000
});

// Delete agent
await agent.delete();
```

### Task Execution

```typescript
// Simple execution
const result = await agent.execute({
  task: 'analyze_sentiment',
  input: { text: 'I love this product!' }
});

// Streaming execution
const stream = await agent.stream({
  task: 'generate_content',
  input: { prompt: 'Write a story' }
});

for await (const chunk of stream) {
  console.log(chunk);
}

// Batch execution
const results = await agent.batch([
  { task: 'task1', input: { /* ... */ } },
  { task: 'task2', input: { /* ... */ } },
  { task: 'task3', input: { /* ... */ } }
]);
```

### Real-time Communication

```typescript
// Connect to agent via WebSocket
const connection = await agent.connect();

// Send messages
connection.send({
  type: 'message',
  content: 'Hello, agent!'
});

// Listen for responses
connection.on('message', (data) => {
  console.log('Agent says:', data);
});

// Handle events
connection.on('error', (error) => {
  console.error('Connection error:', error);
});

// Close connection
connection.close();
```

### Orchestration

```typescript
import { Orchestrator } from 'pulser-sdk';

// Create orchestrator
const orchestrator = new Orchestrator(client);

// Define workflow
const workflow = orchestrator.createWorkflow({
  name: 'campaign-creation',
  steps: [
    { agent: 'copywriter', task: 'generate_headlines' },
    { agent: 'designer', task: 'create_visuals' },
    { agent: 'analyst', task: 'predict_performance' }
  ]
});

// Execute workflow
const results = await workflow.execute({
  context: {
    campaign: 'Summer Sale',
    budget: 50000
  }
});
```

## 🎣 React Hooks (Optional)

```tsx
import { usePulserAgent, PulserProvider } from 'pulser-sdk/react';

// Wrap your app
function App() {
  return (
    <PulserProvider apiKey="your-api-key">
      <YourComponents />
    </PulserProvider>
  );
}

// Use in components
function CreativeGenerator() {
  const { agent, loading, error } = usePulserAgent('creative-agent');
  const [result, setResult] = useState(null);

  const generate = async () => {
    const output = await agent.execute({
      task: 'generate_ad',
      input: { theme: 'innovation' }
    });
    setResult(output);
  };

  if (loading) return <div>Loading agent...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={generate}>Generate Creative</button>
      {result && <div>{result.content}</div>}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```bash
# .env
PULSER_API_KEY=your-api-key
PULSER_BASE_URL=https://api.pulser.ai
PULSER_ENVIRONMENT=production
```

### Advanced Configuration

```typescript
const client = new PulserClient({
  apiKey: process.env.PULSER_API_KEY,
  
  // Request configuration
  timeout: 60000,
  retries: 3,
  retryDelay: 1000,
  
  // Authentication
  authType: 'bearer', // or 'apikey'
  
  // Monitoring
  telemetry: {
    enabled: true,
    endpoint: 'https://telemetry.pulser.ai'
  },
  
  // Error handling
  onError: (error) => {
    console.error('Pulser error:', error);
    // Custom error handling
  }
});
```

## 🧪 Testing

```typescript
import { PulserClient, MockAgent } from 'pulser-sdk/testing';

describe('Campaign Optimizer', () => {
  let client: PulserClient;
  let agent: MockAgent;

  beforeEach(() => {
    client = new PulserClient({ mock: true });
    agent = new MockAgent({
      name: 'test-agent',
      responses: {
        'optimize_campaign': { success: true, score: 0.95 }
      }
    });
  });

  test('should optimize campaign', async () => {
    const result = await agent.execute({
      task: 'optimize_campaign',
      input: { budget: 10000 }
    });
    
    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThan(0.9);
  });
});
```

## 📊 Monitoring

```typescript
// Enable monitoring
client.monitoring.enable();

// Track custom metrics
client.monitoring.track('custom_metric', {
  value: 123,
  tags: { feature: 'optimization' }
});

// Get metrics
const metrics = await client.monitoring.getMetrics();
console.log(metrics);
```

## 🔒 Security

```typescript
// API Key rotation
await client.auth.rotateApiKey();

// Set custom headers
client.setHeaders({
  'X-Custom-Header': 'value'
});

// Use with proxy
const client = new PulserClient({
  apiKey: 'your-key',
  proxy: {
    host: 'proxy.company.com',
    port: 8080,
    auth: { username: 'user', password: 'pass' }
  }
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Examples

Check out our [examples directory](https://github.com/jgtolentino/pulser-sdk/tree/main/examples) for more usage examples:

- Basic usage
- React integration
- Vue.js integration
- Next.js integration
- Express.js middleware
- Real-time chat application
- Multi-agent orchestration

## 📞 Support

- **Documentation**: [https://docs.pulser.ai](https://docs.pulser.ai)
- **npm Package**: [https://www.npmjs.com/package/pulser-sdk](https://www.npmjs.com/package/pulser-sdk)
- **Issues**: [GitHub Issues](https://github.com/jgtolentino/pulser-sdk/issues)
- **Discord**: [Join our community](https://discord.gg/pulser)

---

<div align="center">
  <strong>Built with ❤️ by the TBWA Data Collective</strong>
  <br>
  <em>Empowering Creative Intelligence at Scale</em>
</div>