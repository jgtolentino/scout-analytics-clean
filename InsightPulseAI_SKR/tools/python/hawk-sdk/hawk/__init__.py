"""
Hawk SDK - Real-time vision-language computer autopilot for Pulser 4.0

Example usage:
    from hawk import Session
    
    with Session(goal="Export June P&L from QuickBooks") as sess:
        sess.run()
"""

from .session import Session
from .schemas import TaskPlan, ActionTrace, ElementGraph, ScreenshotPayload
from .version import __version__

__all__ = [
    "Session",
    "TaskPlan", 
    "ActionTrace",
    "ElementGraph",
    "ScreenshotPayload",
    "__version__",
]