"""Sandbox management for secure UI automation."""

import os
import sys
import subprocess
import logging
import tempfile
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class SandboxManager:
    """
    Manages sandboxed environments for UI automation.
    Supports Firejail/Xvfb on Linux, VMs on other platforms.
    """
    
    def __init__(self, platform: str = "linux"):
        """
        Initialize sandbox manager.
        
        Args:
            platform: Target platform (linux, macos, windows)
        """
        self.platform = platform.lower()
        self.sandbox_process: Optional[subprocess.Popen] = None
        self.display: Optional[str] = None
        self.sandbox_dir: Optional[str] = None
        
    def start(self) -> Dict[str, Any]:
        """
        Start the sandbox environment.
        
        Returns:
            Dict containing sandbox configuration
        """
        logger.info(f"Starting sandbox for {self.platform}")
        
        if self.platform == "linux":
            return self._start_linux_sandbox()
        elif self.platform == "macos":
            return self._start_macos_sandbox()
        elif self.platform == "windows":
            return self._start_windows_sandbox()
        else:
            raise ValueError(f"Unsupported platform: {self.platform}")
            
    def _start_linux_sandbox(self) -> Dict[str, Any]:
        """Start Linux sandbox using Firejail and Xvfb."""
        # Create temporary directory for sandbox
        self.sandbox_dir = tempfile.mkdtemp(prefix="hawk_sandbox_")
        
        # Find available display
        display_num = self._find_free_display()
        self.display = f":{display_num}"
        
        # Start Xvfb (virtual display)
        xvfb_cmd = [
            "Xvfb",
            self.display,
            "-screen", "0", "1920x1080x24",
            "-ac",  # Disable access control
            "+extension", "GLX",
            "+render"
        ]
        
        try:
            self.xvfb_process = subprocess.Popen(
                xvfb_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            logger.info(f"Started Xvfb on display {self.display}")
            
            # Set environment variable
            os.environ["DISPLAY"] = self.display
            
            # Create Firejail profile
            firejail_profile = self._create_firejail_profile()
            
            return {
                "platform": "linux",
                "display": self.display,
                "sandbox_dir": self.sandbox_dir,
                "firejail_profile": firejail_profile,
                "resolution": "1920x1080"
            }
            
        except FileNotFoundError:
            logger.warning("Xvfb not found, running without display isolation")
            return {
                "platform": "linux",
                "display": os.environ.get("DISPLAY", ":0"),
                "sandbox_dir": self.sandbox_dir,
                "sandboxed": False
            }
            
    def _start_macos_sandbox(self) -> Dict[str, Any]:
        """Start macOS sandbox (limited sandboxing available)."""
        # macOS doesn't have Firejail equivalent
        # We rely on system permissions and app sandboxing
        logger.warning("macOS sandboxing is limited to system permissions")
        
        return {
            "platform": "macos",
            "sandboxed": False,
            "note": "Ensure Accessibility permissions are granted"
        }
        
    def _start_windows_sandbox(self) -> Dict[str, Any]:
        """Start Windows sandbox using Windows Sandbox if available."""
        # Check if Windows Sandbox is available
        try:
            result = subprocess.run(
                ["powershell", "-Command", "Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM'"],
                capture_output=True,
                text=True
            )
            
            if "Enabled" in result.stdout:
                logger.info("Windows Sandbox is available")
                # Would implement Windows Sandbox integration here
                return {
                    "platform": "windows",
                    "sandbox_available": True,
                    "sandboxed": False,
                    "note": "Windows Sandbox integration not yet implemented"
                }
        except:
            pass
            
        logger.warning("Windows Sandbox not available, running without isolation")
        return {
            "platform": "windows", 
            "sandboxed": False
        }
        
    def _find_free_display(self) -> int:
        """Find a free X display number."""
        for i in range(100, 200):
            if not os.path.exists(f"/tmp/.X{i}-lock"):
                return i
        raise RuntimeError("No free display found")
        
    def _create_firejail_profile(self) -> str:
        """Create a Firejail security profile."""
        profile_content = """
# Hawk SDK Firejail Profile
include default.profile

# Filesystem
private
private-dev
private-tmp
read-only ${HOME}

# Network
net none

# Security
caps.drop all
nonewprivs
noroot
nosound
notv
novideo
seccomp
x11 xvfb

# Whitelisting
mkdir ${HOME}/.hawk
whitelist ${HOME}/.hawk
"""
        
        profile_path = os.path.join(self.sandbox_dir, "hawk.profile")
        with open(profile_path, "w") as f:
            f.write(profile_content)
            
        return profile_path
        
    def execute_in_sandbox(self, command: list) -> subprocess.Popen:
        """
        Execute a command in the sandbox.
        
        Args:
            command: Command and arguments to execute
            
        Returns:
            subprocess.Popen: Process handle
        """
        if self.platform == "linux" and os.path.exists("/usr/bin/firejail"):
            # Wrap command with Firejail
            profile_path = os.path.join(self.sandbox_dir, "hawk.profile")
            if os.path.exists(profile_path):
                command = ["firejail", f"--profile={profile_path}"] + command
                
        env = os.environ.copy()
        if self.display:
            env["DISPLAY"] = self.display
            
        return subprocess.Popen(command, env=env)
        
    def stop(self):
        """Stop the sandbox environment."""
        logger.info("Stopping sandbox")
        
        if hasattr(self, 'xvfb_process') and self.xvfb_process:
            self.xvfb_process.terminate()
            self.xvfb_process.wait()
            
        if self.sandbox_process:
            self.sandbox_process.terminate()
            self.sandbox_process.wait()
            
        # Clean up temporary directory
        if self.sandbox_dir and os.path.exists(self.sandbox_dir):
            import shutil
            shutil.rmtree(self.sandbox_dir)
            
        logger.info("Sandbox stopped")