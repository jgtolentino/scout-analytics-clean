# 🎨 Hawk SDK UI/UX Suite

Complete user interface collection for Hawk SDK - making desktop automation accessible through visual tools.

## 📦 Components Overview

### 1. 📊 React Dashboard (`/dashboard/`)
**Real-time monitoring and control interface**

- **Live session monitoring** with WebSocket updates
- **Metrics visualization** (latency, success rate, costs)
- **Task queue management** and execution control
- **Screen viewer** for real-time automation viewing
- **Cost tracking** with E2B VM usage analytics
- **Log viewer** with searchable execution traces

**Features:**
- Next.js 14 with TypeScript
- Recharts for data visualization
- Tailwind CSS for styling
- Socket.io for real-time updates

**Usage:**
```bash
cd dashboard/
npm install
npm run dev
# Opens at http://localhost:3000
```

### 2. 🛠️ Visual Task Builder (`/task-builder/`)
**Drag-and-drop workflow designer**

- **Visual canvas** with grid-based action placement
- **Action palette** with drag-and-drop support
- **Properties panel** for configuring action parameters
- **Flow connections** to define execution order
- **Live preview** with step-by-step validation
- **Export options** (JSON, Python, direct execution)

**Features:**
- React Flow for visual workflow design
- DnD Kit for drag-and-drop interactions
- Monaco Editor for code editing
- Form validation with Zod schemas

**Usage:**
```bash
cd task-builder/
npm install
npm run dev
# Opens at http://localhost:3001
```

### 3. 🌐 Chrome Extension (`/chrome-extension/`)
**Browser interaction recorder**

- **One-click recording** of user interactions
- **Smart element detection** with CSS selectors
- **Action categorization** (click, type, scroll, navigate)
- **Real-time preview** of recorded steps
- **Export formats** (Hawk JSON, Python code)
- **Direct integration** with Task Builder

**Features:**
- Manifest V3 for modern Chrome compatibility
- Content script injection for page interaction
- Background service worker for persistence
- Local storage for session management

**Installation:**
1. Open Chrome → Extensions → Developer mode
2. Click "Load unpacked" → Select `/chrome-extension/`
3. Pin the Hawk Recorder extension
4. Visit any website and start recording

### 4. 💻 Electron Desktop App (`/electron-app/`)
**Professional desktop studio**

- **Native desktop experience** with system integration
- **Integrated task builder** with advanced features
- **Built-in Hawk SDK** for local execution
- **Project management** with file operations
- **Terminal integration** for debugging
- **Plugin system** for extensibility

**Features:**
- Electron 27 with security best practices
- Express.js API server for SDK communication
- WebSocket support for real-time updates
- Native file dialogs and menu integration
- Auto-updater for seamless releases

**Usage:**
```bash
cd electron-app/
npm install
npm start
# Launches Hawk Studio desktop app
```

## 🚀 Quick Start Guide

### 1. Record a Task (Chrome Extension)
```bash
1. Install Chrome extension
2. Navigate to target website
3. Click "Start Recording"
4. Perform desired actions
5. Click "Stop Recording"
6. Export or send to Task Builder
```

### 2. Build a Task (Visual Builder)
```bash
1. Open Task Builder
2. Drag actions from palette
3. Configure properties
4. Connect action flow
5. Preview and validate
6. Export or execute
```

### 3. Monitor Execution (Dashboard)
```bash
1. Open Dashboard
2. Start new session
3. Watch real-time metrics
4. View execution logs
5. Monitor costs and performance
```

### 4. Professional Development (Desktop App)
```bash
1. Launch Hawk Studio
2. Create new project
3. Build complex workflows
4. Test and debug locally
5. Deploy to production
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+ (for Hawk SDK)
- Chrome/Chromium (for extension)

### Installation
```bash
# Clone repository
git clone https://github.com/insightpulseai/hawk-ui
cd hawk-ui

# Install all components
npm run install:all

# Start development servers
npm run dev:all
```

### Component Scripts
```bash
# Dashboard
npm run dev:dashboard    # Start dashboard dev server
npm run build:dashboard  # Build for production

# Task Builder  
npm run dev:builder      # Start builder dev server
npm run build:builder    # Build for production

# Electron App
npm run dev:desktop      # Start desktop app in dev mode
npm run build:desktop    # Build desktop app packages

# Chrome Extension
npm run build:extension  # Build extension for distribution
npm run package:extension # Package as .crx file
```

## 🎯 Use Cases

### For Developers
- **SDK Integration**: Embed Task Builder in applications
- **Custom Workflows**: Build complex automation pipelines
- **Testing**: Record and replay user interactions
- **Debugging**: Monitor execution with detailed logs

### For Business Users  
- **RPA Solutions**: Automate repetitive business processes
- **Data Entry**: Bulk data processing and validation
- **Report Generation**: Automated report creation and distribution
- **Quality Assurance**: Automated testing workflows

### For DevOps Teams
- **Deployment Automation**: Automated deployment pipelines
- **Infrastructure Testing**: System health checks and monitoring
- **Data Migration**: Automated data transfer and validation
- **Compliance Reporting**: Automated audit and compliance tasks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Hawk UI/UX Suite                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Dashboard  │  │   Builder   │  │  Extension  │         │
│  │  (Monitor)  │  │  (Design)   │  │  (Record)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Desktop Studio                         │   │
│  │           (Professional IDE)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     Hawk SDK Core                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Vision    │  │  Planning   │  │   Motor     │         │
│  │   Driver    │  │   Engine    │  │  Control    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     E2B     │  │ PromptVault │  │  OpenManus  │         │
│  │ Sandboxing  │  │   (AI)      │  │    (RL)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security Features

- **Sandboxed Execution**: All automation runs in E2B microVMs
- **Input Validation**: Comprehensive validation of user inputs
- **CSP Headers**: Content Security Policy for web components
- **Secure Communication**: HTTPS/WSS for all network traffic
- **Permission Model**: Granular permissions for each component

## 📈 Performance

- **Sub-second Latency**: < 700ms average action execution
- **High Throughput**: 30-60 fps screen monitoring
- **Efficient Resource Usage**: Optimized memory and CPU usage
- **Scalable Architecture**: Handles multiple concurrent sessions

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and contribution process.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**🦅 Hawk UI/UX Suite** - Making desktop automation accessible to everyone through powerful visual tools.