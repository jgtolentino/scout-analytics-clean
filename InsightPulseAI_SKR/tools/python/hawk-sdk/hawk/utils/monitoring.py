"""Action monitoring and logging for audit trails."""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from ..schemas import ActionTrace, ActionEvent

logger = logging.getLogger(__name__)


class ActionLogger:
    """
    Logs and persists action traces for auditing and replay.
    """
    
    def __init__(self, session_id: str, log_dir: Optional[str] = None):
        """
        Initialize action logger.
        
        Args:
            session_id: Current session ID
            log_dir: Directory to store logs (defaults to ~/.hawk/logs)
        """
        self.session_id = session_id
        
        if log_dir is None:
            log_dir = os.path.expanduser("~/.hawk/logs")
        
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create session directory
        self.session_dir = self.log_dir / session_id
        self.session_dir.mkdir(exist_ok=True)
        
    def save_trace(self, trace: ActionTrace) -> str:
        """
        Save an action trace to disk.
        
        Args:
            trace: ActionTrace to save
            
        Returns:
            str: Path to saved trace file
        """
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"trace_{trace.trace_id}_{timestamp}.json"
        filepath = self.session_dir / filename
        
        # Convert to dict
        trace_data = trace.model_dump(mode="json")
        
        # Add metadata
        trace_data["_metadata"] = {
            "version": "1.0.0",
            "session_id": self.session_id,
            "saved_at": datetime.now().isoformat()
        }
        
        # Save to file
        with open(filepath, "w") as f:
            json.dump(trace_data, f, indent=2)
            
        logger.info(f"Saved action trace to {filepath}")
        
        # Also save to central database if configured
        self._save_to_database(trace_data)
        
        return str(filepath)
        
    def load_trace(self, trace_id: str) -> Optional[ActionTrace]:
        """
        Load an action trace by ID.
        
        Args:
            trace_id: Trace ID to load
            
        Returns:
            ActionTrace if found, None otherwise
        """
        # Search for trace file
        for filepath in self.log_dir.rglob(f"trace_{trace_id}_*.json"):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                    
                # Remove metadata before parsing
                data.pop("_metadata", None)
                
                return ActionTrace(**data)
            except Exception as e:
                logger.error(f"Failed to load trace from {filepath}: {e}")
                
        # Try loading from database
        return self._load_from_database(trace_id)
        
    def list_traces(self, session_id: Optional[str] = None) -> List[dict]:
        """
        List all available traces.
        
        Args:
            session_id: Optional session ID filter
            
        Returns:
            List of trace summaries
        """
        traces = []
        
        search_dir = self.log_dir
        if session_id:
            search_dir = self.log_dir / session_id
            if not search_dir.exists():
                return []
                
        for filepath in search_dir.rglob("trace_*.json"):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                    
                metadata = data.get("_metadata", {})
                
                traces.append({
                    "trace_id": data.get("trace_id"),
                    "session_id": data.get("session_id"),
                    "event_count": len(data.get("events", [])),
                    "started_at": data.get("started_at"),
                    "completed_at": data.get("completed_at"),
                    "saved_at": metadata.get("saved_at"),
                    "filepath": str(filepath)
                })
            except Exception as e:
                logger.error(f"Failed to read trace {filepath}: {e}")
                
        return sorted(traces, key=lambda x: x.get("saved_at", ""), reverse=True)
        
    def log_event(self, event: ActionEvent):
        """
        Log a single action event.
        
        Args:
            event: ActionEvent to log
        """
        # Log to standard logger
        level = logging.INFO if event.status == "success" else logging.WARNING
        logger.log(
            level,
            f"Action {event.step_id}: {event.status} "
            f"(latency: {event.latency_ms}ms)"
        )
        
        # Also save event immediately for real-time monitoring
        event_file = self.session_dir / "events.jsonl"
        with open(event_file, "a") as f:
            f.write(json.dumps(event.model_dump(mode="json")) + "\n")
            
    def save_screenshot(self, screenshot_data: str, step_id: str) -> str:
        """
        Save a screenshot for a specific step.
        
        Args:
            screenshot_data: Base64 encoded screenshot
            step_id: Associated step ID
            
        Returns:
            str: Path to saved screenshot
        """
        screenshots_dir = self.session_dir / "screenshots"
        screenshots_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"screenshot_{step_id}_{timestamp}.png"
        filepath = screenshots_dir / filename
        
        # Decode and save
        import base64
        img_data = base64.b64decode(screenshot_data)
        with open(filepath, "wb") as f:
            f.write(img_data)
            
        return str(filepath)
        
    def _save_to_database(self, trace_data: dict):
        """Save trace to central database if configured."""
        # This would integrate with the Pulser monitoring system
        # For now, just log that we would save it
        if os.environ.get("PULSER_MONITORING_ENABLED"):
            logger.info(f"Would save trace {trace_data['trace_id']} to pulser_monitoring.actions")
            
    def _load_from_database(self, trace_id: str) -> Optional[ActionTrace]:
        """Load trace from central database if available."""
        # This would query the Pulser monitoring database
        # For now, return None
        if os.environ.get("PULSER_MONITORING_ENABLED"):
            logger.info(f"Would load trace {trace_id} from pulser_monitoring.actions")
        return None