"""
Pulser SDK - Enterprise AI Agent Orchestration Platform
"""

__version__ = "4.0.0"
__author__ = "TBWA Data Collective"
__email__ = "tech@tbwa.com"

from .agents import PulserAgent, BaseAgent, CreativeAgent, MultiModalAgent
from .orchestrator import Orchestrator, Pipeline
from .monitoring import MetricsCollector, PerformanceMonitor
from .security import AuthManager, APIKeyManager
from .config import AgentConfig, PulserConfig
from .devtools import PulserDevTools, log_agent_call, trace, get_logs, print_summary

__all__ = [
    "PulserAgent",
    "BaseAgent", 
    "CreativeAgent",
    "MultiModalAgent",
    "Orchestrator",
    "Pipeline",
    "MetricsCollector",
    "PerformanceMonitor",
    "AuthManager",
    "APIKeyManager",
    "AgentConfig",
    "PulserConfig",
    "PulserDevTools",
    "log_agent_call",
    "trace",
    "get_logs",
    "print_summary",
]

# Version check
import sys
if sys.version_info < (3, 8):
    raise RuntimeError("Pulser SDK requires Python 3.8 or higher")