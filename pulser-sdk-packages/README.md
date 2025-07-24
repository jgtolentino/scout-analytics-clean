# Pulser SDK - Multi-Platform Distribution

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/Platform-Enterprise-purple.svg" alt="Enterprise" />
</div>

## 🚀 Overview

This repository contains the official Pulser SDK packages for multiple platforms:

- **Python Package** (PyPI): `pulser-sdk`
- **JavaScript/TypeScript Package** (npm): `pulser-sdk`

## 📦 Package Locations

### Python (PyPI)
- **Package**: https://pypi.org/project/pulser-sdk/
- **Documentation**: https://pulser-sdk.readthedocs.io
- **Install**: `pip install pulser-sdk`

### JavaScript/TypeScript (npm)
- **Package**: https://www.npmjs.com/package/pulser-sdk
- **Documentation**: https://docs.pulser.ai/js
- **Install**: `npm install pulser-sdk`

## 🏗️ Repository Structure

```
pulser-sdk-packages/
├── python/                    # Python package source
│   ├── src/pulser_sdk/       # Python SDK implementation
│   ├── tests/                # Python tests
│   ├── setup.py             # Python package config
│   └── pyproject.toml       # Modern Python packaging
│
├── javascript/               # JavaScript/TypeScript package
│   ├── src/                 # TypeScript SDK implementation
│   ├── tests/               # JavaScript tests
│   ├── package.json         # npm package config
│   └── tsconfig.json        # TypeScript config
│
├── .github/workflows/       # CI/CD automation
│   ├── publish-pypi.yml    # Python publishing workflow
│   └── publish-npm.yml     # npm publishing workflow
│
├── docs/                    # Shared documentation
├── examples/                # Usage examples for both platforms
└── PUBLISHING_GUIDE.md     # How to publish packages
```

## 🚀 Quick Start

### Python
```python
from pulser_sdk import PulserAgent, AgentConfig

# Configure agent
config = AgentConfig(
    name="creative-optimizer",
    model="gpt-4",
    capabilities=["text_generation", "image_analysis"]
)

# Create and use agent
agent = PulserAgent(config)
result = await agent.execute({
    "task": "optimize_ad_copy",
    "input": {"brand": "Nike", "product": "Air Max"}
})
```

### JavaScript/TypeScript
```typescript
import { PulserClient, AgentConfig } from 'pulser-sdk';

// Initialize client
const client = new PulserClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create agent
const agent = await client.createAgent({
  name: 'creative-optimizer',
  model: 'gpt-4',
  capabilities: ['text_generation', 'image_analysis']
});

// Execute task
const result = await agent.execute({
  task: 'optimize_ad_copy',
  input: { brand: 'Nike', product: 'Air Max' }
});
```

## 📚 Documentation

- **Python SDK Docs**: [Read the Docs](https://pulser-sdk.readthedocs.io)
- **JavaScript SDK Docs**: [TypeDoc](https://docs.pulser.ai/js)
- **API Reference**: [API Documentation](https://api.pulser.ai/docs)
- **Examples**: [GitHub Examples](https://github.com/jgtolentino/pulser-sdk/tree/main/examples)

## 🛠️ Development

### Setting Up Development Environment

```bash
# Clone repository
git clone https://github.com/jgtolentino/pulser-sdk.git
cd pulser-sdk-packages

# Python development
cd python
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -e .[dev]

# JavaScript development
cd javascript
npm install
npm run dev
```

### Running Tests

```bash
# Python tests
cd python
pytest tests/

# JavaScript tests
cd javascript
npm test
```

## 📦 Publishing

See [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md) for detailed instructions on how to publish packages to PyPI and npm.

### Quick Publishing

```bash
# Automated publishing via GitHub Release
# 1. Create a new release on GitHub
# 2. Both packages will be automatically published

# Manual publishing
# Python
cd python && python -m build && twine upload dist/*

# JavaScript
cd javascript && npm publish
```

## 🔑 Required Secrets

For automated publishing, configure these GitHub repository secrets:

- `PYPI_API_TOKEN` - PyPI API token
- `TEST_PYPI_API_TOKEN` - Test PyPI API token
- `NPM_TOKEN` - npm automation token

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Features

- **🤖 Multi-Agent Orchestration**: Coordinate complex AI workflows
- **🎯 Creative Intelligence**: Built for advertising and marketing
- **📊 Real-time Analytics**: Performance monitoring built-in
- **🔒 Enterprise Security**: Production-ready security features
- **☁️ Cloud Native**: Deploy anywhere
- **🔄 Async First**: High-performance architecture
- **🧩 Extensible**: Plugin system for custom extensions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jgtolentino/pulser-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jgtolentino/pulser-sdk/discussions)
- **Email**: support@pulser.ai
- **Discord**: [Join our community](https://discord.gg/pulser)

## 🚀 Roadmap

- [ ] Rust SDK (crates.io)
- [ ] Go SDK (pkg.go.dev)
- [ ] Java SDK (Maven Central)
- [ ] GraphQL API support
- [ ] WebAssembly runtime
- [ ] Edge deployment support

---

<div align="center">
  <strong>Built with ❤️ by the TBWA Data Collective</strong>
  <br>
  <em>Empowering Creative Intelligence at Scale</em>
</div>