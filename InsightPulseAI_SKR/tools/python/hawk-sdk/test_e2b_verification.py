#!/usr/bin/env python3
"""
E2B API Key Verification Script for Hawk SDK
"""

import os
import sys
import json
from typing import Dict, Any

def test_e2b_credentials():
    """
    Test E2B credentials and verify sandbox creation capability.
    
    Usage:
        export E2B_API_KEY="your_actual_api_key_here"
        export E2B_TEAM_ID="insightpulseai"  # Optional
        python test_e2b_verification.py
    """
    
    print("🦅 Hawk SDK - E2B Verification")
    print("=" * 50)
    
    # Check environment variables
    api_key = os.getenv('E2B_API_KEY')
    team_id = os.getenv('E2B_TEAM_ID', '267ebdd5-a572-4d14-92e6-ee1de3ddc9b3')
    
    if not api_key:
        print("❌ E2B_API_KEY environment variable not set")
        print("Please run: export E2B_API_KEY='your_actual_api_key'")
        return False
    
    if api_key.count('x') > 5:  # Likely masked
        print("❌ API key appears to be masked with 'x' characters")
        print("Please provide your actual E2B API key")
        return False
    
    print(f"🔑 API Key: {api_key[:12]}...")
    if team_id:
        print(f"👥 Team ID: {team_id}")
    
    try:
        from e2b import Sandbox
        print("✅ E2B SDK imported successfully")
    except ImportError:
        print("❌ E2B SDK not installed")
        print("Install with: pip install e2b")
        return False
    
    # Test 1: Basic sandbox creation
    print("\n🧪 Test 1: Basic Sandbox Creation")
    try:
        with Sandbox(api_key=api_key, timeout=60) as sandbox:
            print(f"✅ Sandbox created: {sandbox.sandbox_id}")
            print(f"🌐 Hostname: {sandbox.get_hostname()}")
            
            # Test 2: Command execution
            print("\n🧪 Test 2: Command Execution")
            result = sandbox.run_command('echo "Hello from Hawk SDK!"')
            print(f"📤 Command: echo 'Hello from Hawk SDK!'")
            print(f"📥 Output: {result.stdout.strip()}")
            print(f"🔢 Exit Code: {result.exit_code}")
            
            if result.exit_code == 0:
                print("✅ Command execution successful")
            else:
                print("❌ Command execution failed")
                return False
            
            # Test 3: File operations
            print("\n🧪 Test 3: File Operations")
            sandbox.run_command('echo "Hawk SDK Test" > /tmp/hawk_test.txt')
            cat_result = sandbox.run_command('cat /tmp/hawk_test.txt')
            print(f"📄 File content: {cat_result.stdout.strip()}")
            
            # Test 4: Python availability
            print("\n🧪 Test 4: Python Environment")
            python_result = sandbox.run_command('python3 --version')
            print(f"🐍 Python: {python_result.stdout.strip()}")
            
            # Test 5: Network connectivity
            print("\n🧪 Test 5: Network Test")
            ping_result = sandbox.run_command('ping -c 1 google.com')
            if ping_result.exit_code == 0:
                print("✅ Network connectivity available")
            else:
                print("⚠️  Network might be restricted (expected for security)")
        
        print("\n✅ All E2B tests passed!")
        print("🎯 Your E2B configuration is ready for Hawk SDK")
        return True
        
    except Exception as e:
        print(f"\n❌ E2B test failed: {e}")
        
        # Provide helpful error messages
        if "401" in str(e):
            print("\n💡 Troubleshooting 401 Error:")
            print("1. Verify your API key is correct (not masked)")
            print("2. Check if the key has expired")
            print("3. Ensure your E2B account has sandbox creation permissions")
            print("4. Visit https://e2b.dev/docs/quickstart/api-key")
        
        elif "403" in str(e):
            print("\n💡 Troubleshooting 403 Error:")
            print("1. Check if your account has sufficient credits")
            print("2. Verify team permissions if using team account")
            print("3. Check rate limits")
        
        return False

def generate_hawk_config():
    """Generate Hawk SDK configuration with verified E2B settings."""
    
    api_key = os.getenv('E2B_API_KEY')
    team_id = os.getenv('E2B_TEAM_ID')
    
    if not api_key or api_key.count('x') > 5:
        print("⚠️  Cannot generate config without valid API key")
        return
    
    config = {
        "hawk_sdk": {
            "version": "1.0.0",
            "sandbox": {
                "provider": "e2b",
                "e2b": {
                    "api_key": api_key,
                    "team_id": team_id,
                    "default_timeout": 300,
                    "max_concurrent_sessions": 5,
                    "cost_limit_per_hour": 5.0,
                    "fallback_enabled": True
                }
            },
            "fallback_chain": [
                "e2b",
                "qemu", 
                "docker",
                "firejail"
            ]
        }
    }
    
    config_path = "hawk_config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"\n📁 Hawk SDK config saved to: {config_path}")
    print("🚀 You can now use this with Hawk SDK:")
    print(f"   from hawk import Session")
    print(f"   Session(goal='test', config_file='{config_path}')")

if __name__ == "__main__":
    success = test_e2b_credentials()
    
    if success:
        generate_hawk_config()
    else:
        print("\n❌ E2B verification failed")
        print("Please fix the issues above before using Hawk SDK with E2B")
        sys.exit(1)