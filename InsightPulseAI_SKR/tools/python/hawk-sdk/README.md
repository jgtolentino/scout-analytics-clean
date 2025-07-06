# Hawk SDK - Real-time Vision-Language Computer Autopilot

Hawk is a self-hosted, real-time vision-language computer autopilot that provides Ace-class control while remaining fully open, auditable, and deployable inside Pulser's sandbox regime.

## Features

- **Real-time Screen Capture**: 30-60 fps screen monitoring
- **AI-Powered Element Detection**: ViT-L + LSTM model for UI element recognition
- **Natural Language Task Planning**: Convert goals to executable action sequences
- **Cross-Platform Support**: Windows, macOS, and Linux
- **Security Sandboxing**: Firejail/Xvfb isolation on Linux
- **Audit Trail**: Complete action logging and replay capability

## Installation

```bash
pip install pulser-hawk
```

## Quick Start

```python
from hawk import Session

# Execute a task
with Session(goal="Export June P&L from QuickBooks") as sess:
    sess.run()
```

## Pulser Integration

Register the Hawk agents with Pulser:

```bash
# Add Hawk plugin
pulser plugin add hawk

# Register agents
pulser agent register agents/vision_driver.yaml
pulser agent register agents/task_planner.yaml

# Run a task
pulser run --agent task_planner --goal "Resize 50 images to 1080p and save as WebP"
```

## API Reference

### Session

The main entry point for automation tasks.

```python
Session(goal: str, vm_profile: str = "linux", sandbox: bool = True, debug: bool = False)
```

**Parameters:**
- `goal`: Natural language description of the task
- `vm_profile`: Target platform (linux, macos, windows)
- `sandbox`: Enable security sandboxing
- `debug`: Enable debug logging

**Methods:**
- `run()`: Execute the task and return success status
- `plan(goal: str)`: Generate a task plan without execution
- `replay(trace_id: str)`: Replay a previously recorded session

### Schemas

#### TaskPlan
```python
{
    "plan_id": "tp_20250706_XYZ",
    "goal": "Export June P&L from QuickBooks",
    "steps": [
        {
            "step_id": "s1",
            "action": "click",
            "target": "elm_42",
            "confidence": 0.92
        }
    ]
}
```

#### ElementGraph
```python
{
    "elements": [
        {
            "id": "elm_42",
            "bbox": [640, 350, 780, 390],
            "text": "Export",
            "role": "button"
        }
    ],
    "relationships": [
        ["elm_12", "contains", "elm_42"]
    ]
}
```

## Architecture

```
User Goal → TaskPlanner Agent → VisionDriver Agent → Motor Layer
                     ↓                    ↑
                TaskPlan JSON      Feedback Loop
```

## Security

Hawk implements multiple security layers:

1. **Sandboxing**: Firejail isolation on Linux
2. **Read-only Filesystem**: Prevents unauthorized modifications
3. **Network Isolation**: No network access in sandbox
4. **Audit Logging**: All actions are logged for compliance

## Development

### Running Tests
```bash
pytest tests/
```

### Building from Source
```bash
git clone https://github.com/insightpulseai/hawk-sdk
cd hawk-sdk
pip install -e .[dev]
```

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://hawk.insightpulseai.com
- Issues: https://github.com/insightpulseai/hawk-sdk/issues
- Community: https://discord.gg/insightpulseai