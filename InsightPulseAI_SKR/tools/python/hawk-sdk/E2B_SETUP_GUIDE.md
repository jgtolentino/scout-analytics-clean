# 🦅 Hawk SDK - E2B Setup Guide

## Team Configuration
- **Team ID**: `267ebdd5-a572-4d14-92e6-ee1de3ddc9b3`
- **Team Name**: InsightPulseAI

## 🚀 Quick Setup

### 1. Set Environment Variables
```bash
export E2B_TEAM_ID="267ebdd5-a572-4d14-92e6-ee1de3ddc9b3"
export E2B_API_KEY="your_actual_e2b_api_key_here"
```

### 2. Verify Configuration
```bash
cd /Users/tbwa/Documents/GitHub/InsightPulseAI_SKR/tools/python/hawk-sdk
python3 test_e2b_verification.py
```

### 3. Expected Success Output
```
🦅 Hawk SDK - E2B Verification
==================================================
🔑 API Key: tk_e2b_abc123...
👥 Team ID: 267ebdd5-a572-4d14-92e6-ee1de3ddc9b3
✅ E2B SDK imported successfully

🧪 Test 1: Basic Sandbox Creation
✅ Sandbox created: sb_xyz789
🌐 Hostname: sb_xyz789.e2b.dev

🧪 Test 2: Command Execution
📥 Output: Hello from Hawk SDK!
✅ Command execution successful

✅ All E2B tests passed!
🎯 Your E2B configuration is ready for Hawk SDK
```

## 🔧 Integration Points

### Hawk Session Usage
```python
from hawk import Session

# Automatic E2B integration with team
with Session(goal="automate browser task", use_e2b=True) as sess:
    # Your automation code here
    pass
```

### Manual E2B Configuration
```python
from agents.plugins.e2b_sandbox import E2BSandbox

sandbox = E2BSandbox()
vm_id = sandbox.spawn_vm(
    image="ubuntu-22-04-python",
    ttl_hours=2,
    metadata={"purpose": "hawk-automation"}
)
```

## 📊 Cost Management

The Hawk SDK includes automatic cost tracking:
- **Baseline**: $0.08/hour per VM
- **GPU**: $0.60/hour (Linux-only beta)
- **Default Limit**: $5.00/hour across all VMs
- **Auto-cleanup**: VMs terminated when idle >30min

## 🔒 Security Features

- **Egress Lockdown**: Network restrictions applied by default
- **Image Verification**: SHA256 checksums for VM images
- **Timeout Management**: Automatic VM cleanup
- **Cost Limits**: Prevents runaway billing

## 🛠️ Troubleshooting

### Common Issues

1. **401 Authentication Error**
   - Verify API key is correct (not masked)
   - Check if key has expired
   - Ensure team membership is active

2. **403 Permission Error**
   - Check account credits/billing
   - Verify team permissions
   - Check rate limits

3. **Timeout Errors**
   - Increase timeout in Session config
   - Check VM availability in your region
   - Monitor cost limits

### Debug Mode
```python
from hawk import Session

with Session(goal="test", use_e2b=True, debug=True) as sess:
    # Verbose logging enabled
    pass
```

## 📈 Performance Expectations

- **Cold Start**: ~150ms (Firecracker advantage)
- **Command Latency**: <100ms typical
- **Max Concurrent VMs**: 5 (configurable)
- **VM Lifetime**: Up to 14 days (paid tiers)

## 🔄 Fallback Chain

If E2B fails, Hawk SDK automatically falls back to:
1. **E2B Firecracker** (primary)
2. **QEMU/KVM** (local virtualization)
3. **Docker** (containerization)
4. **Firejail** (process isolation)

This ensures automation continues even with E2B issues.

---

**Next Steps**: Replace the masked API key with your actual E2B API key and run the verification script to confirm everything works!