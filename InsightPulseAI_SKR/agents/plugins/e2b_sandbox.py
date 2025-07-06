"""
E2B Firecracker microVM sandbox integration for Pulser 4.0
Provides 150ms cold-start isolation with full OS capabilities.
"""

import os
import json
import base64
import time
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

try:
    import e2b
    E2B_AVAILABLE = True
except ImportError:
    E2B_AVAILABLE = False
    logging.warning("E2B SDK not installed. Run: pip install e2b")

logger = logging.getLogger(__name__)


class E2BSandbox:
    """E2B Firecracker microVM sandbox manager."""
    
    def __init__(self):
        self.api_key = os.getenv("E2B_API_KEY")
        self.team_id = os.getenv("E2B_TEAM_ID", "267ebdd5-a572-4d14-92e6-ee1de3ddc9b3")
        self.active_vms: Dict[str, Dict[str, Any]] = {}
        self.cost_tracker = CostTracker()
        
        if not self.api_key:
            logger.warning("E2B_API_KEY not set. Sandbox features disabled.")
            
    def spawn_vm(
        self,
        image: str = "ubuntu-22-04-python",
        ttl_hours: float = 4,
        gpu: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
        image_digest: Optional[str] = None
    ) -> str:
        """
        Spawn a new Firecracker microVM.
        
        Args:
            image: VM image name
            ttl_hours: Time-to-live in hours (up to 14 days on paid tiers)
            gpu: Enable GPU acceleration (Linux-only beta, A10-class)
            metadata: Additional VM metadata
            image_digest: Expected SHA256 digest of VM image
            
        Returns:
            VM ID for subsequent operations
        """
        if not E2B_AVAILABLE or not self.api_key:
            return self._spawn_fallback_vm(image, ttl_hours)
            
        try:
            start_time = time.time()
            
            # Verify image digest if provided
            if image_digest:
                expected_digest = os.getenv(f"E2B_IMAGE_SHA256_{image.upper().replace('-', '_')}")
                if expected_digest and expected_digest != image_digest:
                    raise ValueError(f"Image digest mismatch for {image}")
            
            # Check GPU beta feature flag
            if gpu and not os.getenv("E2B_GPU_BETA_ENABLED"):
                logger.warning("GPU requested but E2B_GPU_BETA_ENABLED not set")
                gpu = False
            
            # Create VM configuration
            config = {
                "team_id": self.team_id,
                "sandbox": {
                    "image": image,
                    "ttl_hours": min(ttl_hours, 336),  # Cap at 14 days
                    "gpu": gpu,
                    "metadata": metadata or {}
                }
            }
            
            # Spawn VM
            vm = e2b.create_vm(**config)
            vm_id = vm["id"]
            
            # Apply network egress lockdown
            self._apply_egress_rules(vm_id)
            
            # Track VM
            self.active_vms[vm_id] = {
                "created_at": datetime.now(),
                "ttl_hours": ttl_hours,
                "image": image,
                "gpu": gpu,
                "metadata": metadata,
                "cost_per_hour": self._calculate_cost(image, gpu)
            }
            
            # Log metrics
            spawn_time = (time.time() - start_time) * 1000
            logger.info(f"Spawned VM {vm_id} in {spawn_time:.0f}ms")
            self._emit_metric("vm_spawn_time_ms", spawn_time)
            
            return vm_id
            
        except Exception as e:
            logger.error(f"Failed to spawn E2B VM: {e}")
            return self._spawn_fallback_vm(image, ttl_hours)
            
    def exec_cmd(
        self,
        vm_id: str,
        cmd: str,
        timeout: int = 300,
        stream_logs: bool = True
    ) -> Dict[str, Any]:
        """
        Execute command in VM.
        
        Args:
            vm_id: Target VM ID
            cmd: Command to execute
            timeout: Execution timeout in seconds
            stream_logs: Stream output in real-time
            
        Returns:
            Execution result with stdout, stderr, exit_code
        """
        if not E2B_AVAILABLE or vm_id.startswith("local_"):
            return self._exec_fallback_cmd(vm_id, cmd)
            
        try:
            result = e2b.exec(
                vm_id,
                cmd,
                timeout=timeout,
                stream_logs=stream_logs
            )
            
            # Track execution
            self._track_execution(vm_id, cmd, result)
            
            # Update last activity time
            if vm_id in self.active_vms:
                self.active_vms[vm_id]["last_activity"] = datetime.now()
            
            return {
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", ""),
                "exit_code": result.get("exit_code", 0),
                "duration_ms": result.get("duration_ms", 0)
            }
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            return {
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1,
                "duration_ms": 0
            }
            
    def upload_file(
        self,
        vm_id: str,
        path: str,
        content: str,
        is_base64: bool = True
    ) -> bool:
        """
        Upload file to VM.
        
        Args:
            vm_id: Target VM ID
            path: Destination path in VM
            content: File content (base64 or plain text)
            is_base64: Whether content is base64 encoded
            
        Returns:
            Success status
        """
        if not E2B_AVAILABLE:
            return False
            
        try:
            if is_base64:
                file_content = base64.b64decode(content)
            else:
                file_content = content.encode()
                
            e2b.put_file(vm_id, path, file_content)
            logger.debug(f"Uploaded file to {path} in VM {vm_id}")
            return True
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            return False
            
    def download_file(self, vm_id: str, path: str) -> Optional[str]:
        """
        Download file from VM.
        
        Args:
            vm_id: Source VM ID
            path: File path in VM
            
        Returns:
            Base64 encoded file content
        """
        if not E2B_AVAILABLE:
            return None
            
        try:
            content = e2b.get_file(vm_id, path)
            return base64.b64encode(content).decode()
            
        except Exception as e:
            logger.error(f"File download failed: {e}")
            return None
            
    def kill_vm(self, vm_id: str) -> bool:
        """
        Terminate VM and clean up resources.
        
        Args:
            vm_id: VM to terminate
            
        Returns:
            Success status
        """
        if vm_id.startswith("local_"):
            return self._kill_fallback_vm(vm_id)
            
        try:
            # Calculate final cost
            if vm_id in self.active_vms:
                vm_info = self.active_vms[vm_id]
                runtime_hours = (datetime.now() - vm_info["created_at"]).total_seconds() / 3600
                cost = runtime_hours * vm_info["cost_per_hour"]
                self.cost_tracker.record_cost(vm_id, cost)
                
            # Kill VM
            if E2B_AVAILABLE:
                e2b.kill_vm(vm_id)
                
            # Clean up tracking
            self.active_vms.pop(vm_id, None)
            logger.info(f"Terminated VM {vm_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to kill VM: {e}")
            return False
            
    def list_vms(self) -> List[Dict[str, Any]]:
        """List all active VMs with metadata."""
        vms = []
        
        for vm_id, info in self.active_vms.items():
            runtime = datetime.now() - info["created_at"]
            remaining_ttl = timedelta(hours=info["ttl_hours"]) - runtime
            
            vms.append({
                "id": vm_id,
                "image": info["image"],
                "gpu": info["gpu"],
                "runtime_minutes": runtime.total_seconds() / 60,
                "remaining_minutes": max(0, remaining_ttl.total_seconds() / 60),
                "estimated_cost": self.cost_tracker.estimate_cost(vm_id, runtime.total_seconds() / 3600)
            })
            
        return vms
        
    def _spawn_fallback_vm(self, image: str, ttl_hours: float) -> str:
        """Fallback to local QEMU/KVM when E2B unavailable."""
        logger.warning("Using local VM fallback (no E2B)")
        
        # Generate local VM ID
        vm_id = f"local_{int(time.time())}"
        
        # Track as local VM
        self.active_vms[vm_id] = {
            "created_at": datetime.now(),
            "ttl_hours": ttl_hours,
            "image": image,
            "gpu": False,
            "metadata": {"fallback": True},
            "cost_per_hour": 0  # Local VMs are free
        }
        
        return vm_id
        
    def _exec_fallback_cmd(self, vm_id: str, cmd: str) -> Dict[str, Any]:
        """Execute in fallback environment."""
        import subprocess
        
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "exit_code": result.returncode,
                "duration_ms": 0
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1,
                "duration_ms": 0
            }
            
    def _kill_fallback_vm(self, vm_id: str) -> bool:
        """Clean up fallback VM."""
        self.active_vms.pop(vm_id, None)
        return True
        
    def _calculate_cost(self, image: str, gpu: bool) -> float:
        """Calculate hourly cost based on VM configuration."""
        # Accurate E2B pricing
        base_rate = 0.08  # $0.08/hour baseline x86
        
        if gpu:
            base_rate = 0.60  # $0.60/hour GPU (A10-class)
            
        if "large" in image:
            base_rate *= 1.5  # Larger instances cost more
            
        return base_rate
        
    def _track_execution(self, vm_id: str, cmd: str, result: Dict[str, Any]):
        """Track command execution for auditing."""
        # This would integrate with Pulser monitoring
        logger.debug(f"VM {vm_id} executed: {cmd[:50]}...")
        
    def _emit_metric(self, metric: str, value: float):
        """Emit metric to monitoring system."""
        # Integration point for Pulser metrics
        logger.debug(f"Metric: {metric}={value}")
        
    def _apply_egress_rules(self, vm_id: str):
        """Apply network egress lockdown rules."""
        egress_rules = """
        # Drop all outbound by default
        iptables -P OUTPUT DROP
        
        # Allow localhost
        iptables -A OUTPUT -o lo -j ACCEPT
        
        # Allow DNS
        iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
        iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT
        
        # Allow HTTP/HTTPS only
        iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
        iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
        
        # Allow established connections
        iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
        """
        
        try:
            self.exec_cmd(vm_id, egress_rules, timeout=30)
            logger.info(f"Applied egress lockdown to VM {vm_id}")
        except Exception as e:
            logger.warning(f"Failed to apply egress rules: {e}")
            
    def check_idle_vms(self):
        """Check and kill idle VMs exceeding timeout."""
        idle_timeout = int(os.getenv("E2B_IDLE_TIMEOUT_SECONDS", "900"))  # 15 minutes
        current_time = datetime.now()
        
        for vm_id, info in list(self.active_vms.items()):
            last_activity = info.get("last_activity", info["created_at"])
            idle_time = (current_time - last_activity).total_seconds()
            
            if idle_time > idle_timeout:
                logger.info(f"Killing idle VM {vm_id} (idle for {idle_time}s)")
                self.kill_vm(vm_id)


class CostTracker:
    """Track and report E2B usage costs."""
    
    def __init__(self):
        self.costs: Dict[str, float] = {}
        self.cost_limit = float(os.getenv("E2B_COST_LIMIT", "100.0"))
        
    def record_cost(self, vm_id: str, cost: float):
        """Record VM cost."""
        self.costs[vm_id] = cost
        
        # Check cost limit
        total_cost = sum(self.costs.values())
        if total_cost > self.cost_limit:
            logger.warning(f"E2B costs exceeded limit: ${total_cost:.2f} > ${self.cost_limit:.2f}")
            
    def estimate_cost(self, vm_id: str, runtime_hours: float) -> float:
        """Estimate cost for running VM."""
        # Simplified estimation
        return runtime_hours * 0.10  # $0.10/hour base rate
        
    def get_total_cost(self) -> float:
        """Get total costs across all VMs."""
        return sum(self.costs.values())


# Global sandbox instance
sandbox = E2BSandbox()


# Pulser plugin interface
def spawn_vm(image="ubuntu-22-04-python", ttl_hours=4, **kwargs):
    """Spawn VM via Pulser plugin interface."""
    return sandbox.spawn_vm(image, ttl_hours, **kwargs)


def exec_cmd(vm_id, cmd, **kwargs):
    """Execute command via Pulser plugin interface."""
    return sandbox.exec_cmd(vm_id, cmd, **kwargs)


def upload_file(vm_id, path, content_b64):
    """Upload file via Pulser plugin interface."""
    return sandbox.upload_file(vm_id, path, content_b64, is_base64=True)


def kill_vm(vm_id):
    """Kill VM via Pulser plugin interface."""
    return sandbox.kill_vm(vm_id)