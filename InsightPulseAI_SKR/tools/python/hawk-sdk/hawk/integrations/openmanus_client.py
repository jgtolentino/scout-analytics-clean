"""Client for OpenManus RL integration."""

import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class OpenManusRLClient:
    """Client for OpenManus reinforcement learning integration."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize OpenManus RL client.
        
        Args:
            config: RL configuration dictionary
        """
        self.config = config or self._default_config()
        self.trajectory_buffer = []
        self.session_id = f"hawk_rl_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize connection to OpenManus
        self._init_connection()
        
    def _default_config(self) -> Dict[str, Any]:
        """Default RL configuration."""
        return {
            "algorithm": "grpo",
            "learning_rate": 1e-5,
            "batch_size": 32,
            "update_frequency": 100,
            "reward_discount": 0.95,
            "endpoint": os.environ.get("OPENMANUS_ENDPOINT", "localhost:8765")
        }
        
    def _init_connection(self):
        """Initialize connection to OpenManus server."""
        try:
            # In production, this would establish actual connection
            # For now, we'll use a mock connection
            logger.info(f"Connecting to OpenManus at {self.config['endpoint']}")
            self.connected = True
        except Exception as e:
            logger.error(f"Failed to connect to OpenManus: {e}")
            self.connected = False
            
    def log_trajectory(
        self,
        agent_id: str,
        plan_id: str,
        reward: float,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Log a trajectory for RL training.
        
        Args:
            agent_id: ID of the agent (e.g., "task_planner")
            plan_id: ID of the executed plan
            reward: Calculated reward value
            metadata: Additional trajectory metadata
        """
        trajectory = {
            "session_id": self.session_id,
            "agent_id": agent_id,
            "plan_id": plan_id,
            "reward": reward,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.trajectory_buffer.append(trajectory)
        
        # Send to OpenManus if buffer is full
        if len(self.trajectory_buffer) >= self.config["batch_size"]:
            self._flush_trajectories()
            
    def _flush_trajectories(self):
        """Send buffered trajectories to OpenManus."""
        if not self.trajectory_buffer:
            return
            
        if not self.connected:
            logger.warning("Not connected to OpenManus, dropping trajectories")
            self.trajectory_buffer.clear()
            return
            
        try:
            # In production, this would send to OpenManus server
            logger.info(f"Sending {len(self.trajectory_buffer)} trajectories to OpenManus")
            
            # Mock sending trajectories
            payload = {
                "trajectories": self.trajectory_buffer,
                "config": {
                    "algorithm": self.config["algorithm"],
                    "learning_rate": self.config["learning_rate"]
                }
            }
            
            # Clear buffer after sending
            self.trajectory_buffer.clear()
            
        except Exception as e:
            logger.error(f"Failed to send trajectories: {e}")
            
    def request_policy_update(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Request updated policy from OpenManus.
        
        Args:
            agent_id: Agent requesting the update
            
        Returns:
            Updated policy parameters if available
        """
        if not self.connected:
            return None
            
        try:
            # In production, this would fetch from OpenManus
            logger.info(f"Requesting policy update for {agent_id}")
            
            # Mock policy update
            return {
                "agent_id": agent_id,
                "version": "1.0.1",
                "parameters": {
                    "temperature": 0.28,  # Slightly reduced from 0.3
                    "top_p": 0.95,
                    "improvements": ["faster_ui_detection", "better_error_recovery"]
                },
                "metrics": {
                    "avg_reward": 0.85,
                    "success_rate": 0.98,
                    "avg_latency_ms": 580  # Improved from 700ms
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get policy update: {e}")
            return None
            
    def get_training_stats(self) -> Dict[str, Any]:
        """Get current RL training statistics."""
        return {
            "session_id": self.session_id,
            "trajectories_logged": len(self.trajectory_buffer),
            "connected": self.connected,
            "config": self.config
        }
        
    def close(self):
        """Close connection and flush remaining trajectories."""
        if self.trajectory_buffer:
            self._flush_trajectories()
            
        self.connected = False
        logger.info("Closed OpenManus connection")