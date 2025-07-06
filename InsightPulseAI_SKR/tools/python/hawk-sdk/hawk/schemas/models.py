"""Pydantic models for Hawk SDK data structures."""

from typing import List, Tuple, Optional, Literal, Union
from pydantic import BaseModel, Field
from datetime import datetime


class Resolution(BaseModel):
    """Screen resolution."""
    w: int = Field(..., description="Width in pixels")
    h: int = Field(..., description="Height in pixels")


class ScreenshotPayload(BaseModel):
    """Screenshot data structure."""
    session_id: str = Field(..., description="Unique session identifier")
    timestamp: int = Field(..., description="Unix timestamp")
    frame: str = Field(..., description="Base64-encoded PNG image")
    resolution: Resolution = Field(..., description="Screen resolution")


class BoundingBox(BaseModel):
    """Bounding box coordinates [x1, y1, x2, y2]."""
    x1: int
    y1: int
    x2: int
    y2: int
    
    def to_list(self) -> List[int]:
        return [self.x1, self.y1, self.x2, self.y2]
    
    @classmethod
    def from_list(cls, coords: List[int]) -> "BoundingBox":
        return cls(x1=coords[0], y1=coords[1], x2=coords[2], y2=coords[3])


class Element(BaseModel):
    """UI element detected in the screen."""
    id: str = Field(..., description="Unique element identifier")
    bbox: List[int] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    text: str = Field("", description="Text content of the element")
    role: str = Field(..., description="Element role (button, input, etc.)")
    
    @property
    def bounding_box(self) -> BoundingBox:
        return BoundingBox.from_list(self.bbox)


class ElementGraph(BaseModel):
    """Graph representation of UI elements."""
    elements: List[Element] = Field(default_factory=list)
    relationships: List[Tuple[str, str, str]] = Field(
        default_factory=list,
        description="List of (source_id, relation, target_id) tuples"
    )


class TaskStep(BaseModel):
    """Individual step in a task plan."""
    step_id: str = Field(..., description="Unique step identifier")
    action: Literal["click", "type", "keypress", "wait", "screenshot"] = Field(...)
    target: Optional[str] = Field(None, description="Element ID for click actions")
    keys: Optional[Union[str, List[str]]] = Field(None, description="Keys for type/keypress")
    delay: Optional[float] = Field(0.1, description="Delay after action in seconds")
    confidence: Optional[float] = Field(None, description="Confidence score [0-1]")


class TaskPlan(BaseModel):
    """Complete task execution plan."""
    plan_id: str = Field(..., description="Unique plan identifier")
    goal: str = Field(..., description="Natural language goal")
    steps: List[TaskStep] = Field(default_factory=list)
    
    def add_step(self, step: TaskStep) -> None:
        """Add a step to the plan."""
        self.steps.append(step)


class ActionEvent(BaseModel):
    """Individual action event in the trace."""
    event_id: int = Field(..., description="Sequential event ID")
    step_id: str = Field(..., description="Reference to TaskPlan step")
    timestamp: float = Field(..., description="Unix timestamp with milliseconds")
    status: Literal["success", "failure", "retry"] = Field(...)
    latency_ms: int = Field(..., description="Action latency in milliseconds")
    error: Optional[str] = Field(None, description="Error message if failed")


class ActionTrace(BaseModel):
    """Complete action execution trace for auditing."""
    trace_id: str = Field(..., description="Unique trace identifier")
    session_id: str = Field(..., description="Reference to session")
    events: List[ActionEvent] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = Field(None)
    
    def add_event(self, event: ActionEvent) -> None:
        """Add an event to the trace."""
        self.events.append(event)
    
    def mark_complete(self) -> None:
        """Mark the trace as complete."""
        self.completed_at = datetime.now()