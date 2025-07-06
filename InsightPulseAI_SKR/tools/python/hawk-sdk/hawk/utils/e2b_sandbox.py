"""E2B Firecracker microVM sandbox for Hawk SDK."""

import os
import logging
from typing import Optional, Dict, Any, Tuple
import json

logger = logging.getLogger(__name__)


class E2BSandboxManager:
    """
    E2B Firecracker microVM sandbox manager for Hawk.
    Provides 150ms cold-start isolation with full OS capabilities.
    """
    
    def __init__(self, platform: str = "linux"):
        """
        Initialize E2B sandbox manager.
        
        Args:
            platform: Target platform (linux, macos, windows)
        """
        self.platform = platform.lower()
        self.vm_id: Optional[str] = None
        self.vm_info: Dict[str, Any] = {}
        
        # Import plugin dynamically
        try:
            from agents.plugins import e2b_sandbox
            self.e2b = e2b_sandbox
            self.e2b_available = True
        except ImportError:
            logger.warning("E2B plugin not available, falling back to local sandbox")
            self.e2b_available = False
            
    def start(self) -> Dict[str, Any]:
        """
        Start E2B microVM sandbox.
        
        Returns:
            Dict containing sandbox configuration
        """
        logger.info(f"Starting E2B sandbox for {self.platform}")
        
        if not self.e2b_available:
            # Fall back to original sandbox implementation
            from .sandbox import SandboxManager
            fallback = SandboxManager(self.platform)
            return fallback.start()
            
        try:
            # Select appropriate image
            if self.platform == "linux":
                image = "ubuntu-22-04-browser"  # For UI automation
            elif self.platform == "macos":
                image = "macos-14-browser"  # If available
            else:
                image = "windows-11-browser"  # If available
                
            # Spawn microVM
            self.vm_id = self.e2b.spawn_vm(
                image=image,
                ttl_hours=6,  # Longer TTL for complex tasks
                gpu=False,  # GPU not needed for UI automation
                metadata={
                    "purpose": "hawk_automation",
                    "platform": self.platform
                }
            )
            
            # Get VM info
            self.vm_info = {
                "vm_id": self.vm_id,
                "platform": self.platform,
                "image": image,
                "sandboxed": True,
                "backend": "e2b_firecracker"
            }
            
            # Set up display for UI automation
            if self.platform == "linux":
                self._setup_virtual_display()
                
            logger.info(f"Started E2B VM {self.vm_id} with {image}")
            return self.vm_info
            
        except Exception as e:
            logger.error(f"Failed to start E2B sandbox: {e}")
            # Fall back to local sandbox
            from .sandbox import SandboxManager
            fallback = SandboxManager(self.platform)
            return fallback.start()
            
    def _setup_virtual_display(self):
        """Set up virtual display in VM for UI automation."""
        if not self.vm_id:
            return
            
        # Install and start Xvfb
        setup_commands = [
            "apt-get update",
            "apt-get install -y xvfb x11vnc",
            "Xvfb :99 -screen 0 1920x1080x24 &",
            "export DISPLAY=:99"
        ]
        
        for cmd in setup_commands:
            result = self.e2b.exec_cmd(self.vm_id, cmd)
            if result["exit_code"] != 0:
                logger.warning(f"Display setup command failed: {cmd}")
                
        # Set display in VM info
        self.vm_info["display"] = ":99"
        
    def execute_in_sandbox(self, command: list) -> Tuple[str, str, int]:
        """
        Execute command in E2B sandbox.
        
        Args:
            command: Command and arguments
            
        Returns:
            Tuple of (stdout, stderr, exit_code)
        """
        if not self.vm_id or not self.e2b_available:
            # Fall back to local execution
            import subprocess
            result = subprocess.run(
                command,
                capture_output=True,
                text=True
            )
            return result.stdout, result.stderr, result.returncode
            
        # Convert command list to string
        cmd_str = " ".join(command)
        
        # Execute in VM
        result = self.e2b.exec_cmd(
            self.vm_id,
            cmd_str,
            timeout=300,
            stream_logs=True
        )
        
        return (
            result.get("stdout", ""),
            result.get("stderr", ""),
            result.get("exit_code", 0)
        )
        
    def upload_file(self, local_path: str, vm_path: str) -> bool:
        """
        Upload file to VM.
        
        Args:
            local_path: Local file path
            vm_path: Destination path in VM
            
        Returns:
            Success status
        """
        if not self.vm_id or not self.e2b_available:
            return False
            
        try:
            with open(local_path, 'rb') as f:
                content = f.read()
                
            import base64
            content_b64 = base64.b64encode(content).decode()
            
            return self.e2b.upload_file(self.vm_id, vm_path, content_b64)
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            return False
            
    def download_file(self, vm_path: str, local_path: str) -> bool:
        """
        Download file from VM.
        
        Args:
            vm_path: Source path in VM
            local_path: Local destination path
            
        Returns:
            Success status
        """
        if not self.vm_id or not self.e2b_available:
            return False
            
        try:
            content_b64 = self.e2b.download_file(self.vm_id, vm_path)
            if not content_b64:
                return False
                
            import base64
            content = base64.b64decode(content_b64)
            
            with open(local_path, 'wb') as f:
                f.write(content)
                
            return True
            
        except Exception as e:
            logger.error(f"File download failed: {e}")
            return False
            
    def stop(self):
        """Stop the E2B sandbox."""
        logger.info("Stopping E2B sandbox")
        
        if self.vm_id and self.e2b_available:
            try:
                self.e2b.kill_vm(self.vm_id)
                logger.info(f"Terminated E2B VM {self.vm_id}")
            except Exception as e:
                logger.error(f"Failed to stop E2B VM: {e}")
                
        self.vm_id = None
        self.vm_info = {}
        
    def get_cost_estimate(self) -> float:
        """Get estimated cost for current VM session."""
        if not self.vm_id or not self.e2b_available:
            return 0.0
            
        # Get VM runtime and calculate cost
        vms = self.e2b.sandbox.list_vms()
        for vm in vms:
            if vm["id"] == self.vm_id:
                return vm.get("estimated_cost", 0.0)
                
        return 0.0