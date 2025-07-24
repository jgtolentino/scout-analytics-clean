# Pulser SDK

[![PyPI version](https://badge.fury.io/py/pulser-sdk.svg)](https://badge.fury.io/py/pulser-sdk)
[![Python Support](https://img.shields.io/pypi/pyversions/pulser-sdk.svg)](https://pypi.org/project/pulser-sdk/)
[![Documentation Status](https://readthedocs.org/projects/pulser-sdk/badge/?version=latest)](https://pulser-sdk.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Enterprise AI Agent Orchestration Platform for Creative Intelligence

## 🚀 Overview

Pulser SDK is a production-ready framework for building, deploying, and managing autonomous AI agents at scale. Designed for enterprise creative intelligence applications, it provides a robust foundation for multi-agent systems with built-in monitoring, security, and scalability features.

## ✨ Key Features

- **🤖 Multi-Agent Orchestration**: Coordinate complex workflows across specialized AI agents
- **🎯 Creative Intelligence**: Purpose-built for advertising, marketing, and creative optimization
- **📊 Real-time Analytics**: Built-in performance monitoring and metrics collection
- **🔒 Enterprise Security**: Role-based access control, API key management, audit trails
- **☁️ Cloud Native**: Deploy on AWS, Azure, GCP, or on-premises infrastructure
- **🔄 Async First**: High-performance asynchronous architecture
- **🧩 Extensible**: Plugin system for custom agents and integrations

## 📦 Installation

```bash
# Basic installation
pip install pulser-sdk

# With ML capabilities
pip install pulser-sdk[ml]

# With cloud integrations
pip install pulser-sdk[cloud]

# Full installation
pip install pulser-sdk[all]
```

## 🚀 Quick Start

```python
from pulser_sdk import PulserAgent, AgentConfig
import asyncio

# Configure your agent
config = AgentConfig(
    name="creative-optimizer",
    model="gpt-4",
    temperature=0.7,
    capabilities=["text_generation", "image_analysis"]
)

# Create an agent
agent = PulserAgent(config)

# Run a task
async def optimize_campaign():
    result = await agent.execute({
        "task": "optimize_ad_copy",
        "input": {
            "brand": "Nike",
            "product": "Air Max",
            "target_audience": "Young Athletes"
        }
    })
    return result

# Execute
result = asyncio.run(optimize_campaign())
print(result)
```

## 🏗️ Architecture

```
pulser-sdk/
├── agents/          # Agent definitions and configs
├── orchestrator/    # Multi-agent coordination
├── pipelines/       # Data processing pipelines
├── monitoring/      # Metrics and observability
├── security/        # Auth and access control
└── integrations/    # External service connectors
```

## 🎯 Use Cases

### Creative Campaign Optimization
```python
from pulser_sdk.agents import CreativeAgent
from pulser_sdk.orchestrator import Orchestrator

# Create specialized agents
copywriter = CreativeAgent(role="copywriter")
designer = CreativeAgent(role="designer")
analyst = CreativeAgent(role="analyst")

# Orchestrate campaign creation
orchestrator = Orchestrator([copywriter, designer, analyst])
campaign = await orchestrator.create_campaign({
    "objective": "increase_brand_awareness",
    "budget": 50000,
    "duration": "30_days"
})
```

### Multi-Modal Analysis
```python
from pulser_sdk.agents import MultiModalAgent

agent = MultiModalAgent()
insights = await agent.analyze({
    "image": "campaign_visual.jpg",
    "text": "Campaign headline",
    "video": "advertisement.mp4"
})
```

### Real-time Performance Monitoring
```python
from pulser_sdk.monitoring import MetricsCollector

collector = MetricsCollector()
collector.track_agent_performance(agent_id="creative-1")
metrics = collector.get_metrics(period="last_hour")
```

## 🔧 Configuration

Create a `.pulserrc` file in your project root:

```yaml
project:
  name: "my-creative-ai"
  version: "1.0.0"

agents:
  - name: "content-creator"
    model: "claude-3"
    max_tokens: 4000
  
  - name: "performance-analyzer"
    model: "gpt-4"
    temperature: 0.3

monitoring:
  prometheus:
    enabled: true
    port: 9090
  
  sentry:
    enabled: true
    dsn: "${SENTRY_DSN}"

security:
  api_keys:
    enabled: true
    rotation_days: 90
```

## 🛠️ CLI Usage

```bash
# Initialize a new project
pulser init my-project

# Create a new agent
pulser create agent creative-optimizer

# Deploy agents
pulser deploy --environment production

# Monitor agent performance
pulser monitor --agent all --metrics

# Run tests
pulser test
```

## 📚 Advanced Features

### Custom Agent Development
```python
from pulser_sdk import BaseAgent

class CustomCreativeAgent(BaseAgent):
    async def process(self, task):
        # Your custom logic here
        result = await self.generate_creative(task)
        return self.format_response(result)
```

### Pipeline Creation
```python
from pulser_sdk.pipelines import Pipeline

pipeline = Pipeline()
pipeline.add_stage("data_collection", collect_fn)
pipeline.add_stage("preprocessing", preprocess_fn)
pipeline.add_stage("analysis", analyze_fn)
pipeline.add_stage("optimization", optimize_fn)

result = await pipeline.run(input_data)
```

### Distributed Deployment
```python
from pulser_sdk.distributed import ClusterManager

cluster = ClusterManager(
    nodes=["node1.example.com", "node2.example.com"],
    replication=3
)
cluster.deploy_agents(agents)
```

## 🔍 Monitoring & Observability

- **Prometheus Integration**: Built-in metrics exporter
- **OpenTelemetry Support**: Distributed tracing
- **Custom Dashboards**: Grafana templates included
- **Real-time Logs**: Structured logging with context

## 🔒 Security Features

- **OAuth2/JWT**: Standard authentication flows
- **Rate Limiting**: Configurable per-agent limits
- **Audit Trails**: Complete activity logging
- **Encryption**: Data at rest and in transit

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repository
git clone https://github.com/jgtolentino/pulser-sdk
cd pulser-sdk

# Install development dependencies
pip install -e .[dev]

# Run tests
pytest

# Run linters
black . && ruff . && mypy .
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Showcase

Companies using Pulser SDK:
- **TBWA Worldwide**: Creative campaign optimization
- **Omnicom**: Multi-brand content generation
- **WPP**: Audience insights and targeting

## 📞 Support

- **Documentation**: [https://pulser-sdk.readthedocs.io](https://pulser-sdk.readthedocs.io)
- **Issues**: [GitHub Issues](https://github.com/jgtolentino/pulser-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jgtolentino/pulser-sdk/discussions)
- **Email**: support@pulser.ai

## 🚀 Roadmap

- [ ] GPU acceleration for ML workloads
- [ ] Kubernetes operator for agent deployment
- [ ] WebAssembly runtime for edge deployment
- [ ] GraphQL API support
- [ ] More pre-built agent templates

---

<div align="center">
  <strong>Built with ❤️ by the TBWA Data Collective</strong>
  <br>
  <em>Empowering Creative Intelligence at Scale</em>
</div>