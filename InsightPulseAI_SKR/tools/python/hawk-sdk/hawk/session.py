"""Core Session class for Hawk SDK."""

import uuid
import time
import logging
from typing import Optional, Dict, Any
from contextlib import contextmanager
from datetime import datetime

from .schemas import TaskPlan, ActionTrace, ActionEvent
from .vision import VisionDriver
from .automation import TaskPlanner, MotorController
from .utils.sandbox import SandboxManager
from .utils.e2b_sandbox import E2BSandboxManager
from .utils.monitoring import ActionLogger

logger = logging.getLogger(__name__)


class Session:
    """
    Main entry point for Hawk SDK automation sessions.
    
    Example:
        with Session(goal="Export June P&L from QuickBooks") as sess:
            sess.run()
    """
    
    def __init__(
        self,
        goal: str,
        vm_profile: str = "linux",
        sandbox: bool = True,
        use_e2b: bool = True,
        debug: bool = False
    ):
        """
        Initialize a new Hawk session.
        
        Args:
            goal: Natural language goal to accomplish
            vm_profile: VM profile to use (linux, macos, windows)
            sandbox: Whether to run in sandboxed environment
            use_e2b: Use E2B Firecracker microVMs (150ms cold-start)
            debug: Enable debug logging
        """
        self.session_id = f"hawk-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}"
        self.goal = goal
        self.vm_profile = vm_profile
        self.use_sandbox = sandbox
        self.use_e2b = use_e2b
        self.debug = debug
        
        # Core components
        self.sandbox_manager: Optional[SandboxManager] = None
        self.vision_driver: Optional[VisionDriver] = None
        self.task_planner: Optional[TaskPlanner] = None
        self.motor_controller: Optional[MotorController] = None
        self.action_logger: Optional[ActionLogger] = None
        
        # State tracking
        self.task_plan: Optional[TaskPlan] = None
        self.action_trace: Optional[ActionTrace] = None
        self._started = False
        self._completed = False
        
        if debug:
            logging.basicConfig(level=logging.DEBUG)
    
    def __enter__(self):
        """Context manager entry."""
        self._setup()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self._cleanup()
    
    def _setup(self):
        """Initialize all components."""
        logger.info(f"Starting Hawk session {self.session_id}")
        
        # Initialize sandbox if requested
        if self.use_sandbox:
            if self.use_e2b:
                # Prefer E2B for 150ms cold-start isolation
                try:
                    self.sandbox_manager = E2BSandboxManager(self.vm_profile)
                    sandbox_info = self.sandbox_manager.start()
                    logger.info(f"Using E2B sandbox: {sandbox_info}")
                except Exception as e:
                    logger.warning(f"E2B unavailable, falling back: {e}")
                    self.sandbox_manager = SandboxManager(self.vm_profile)
                    self.sandbox_manager.start()
            else:
                self.sandbox_manager = SandboxManager(self.vm_profile)
                self.sandbox_manager.start()
        
        # Initialize core components
        self.vision_driver = VisionDriver(
            session_id=self.session_id,
            sandbox=self.sandbox_manager
        )
        self.task_planner = TaskPlanner()
        self.motor_controller = MotorController(
            sandbox=self.sandbox_manager,
            platform=self.vm_profile
        )
        self.action_logger = ActionLogger(self.session_id)
        
        # Initialize action trace
        self.action_trace = ActionTrace(
            trace_id=f"trace_{uuid.uuid4().hex}",
            session_id=self.session_id
        )
        
        self._started = True
    
    def _cleanup(self):
        """Clean up all components."""
        logger.info(f"Cleaning up Hawk session {self.session_id}")
        
        if self.action_trace and not self._completed:
            self.action_trace.mark_complete()
            
        if self.action_logger:
            self.action_logger.save_trace(self.action_trace)
        
        if self.vision_driver:
            self.vision_driver.stop()
        
        if self.sandbox_manager:
            self.sandbox_manager.stop()
    
    def run(self) -> bool:
        """
        Execute the goal and return success status.
        
        Returns:
            bool: True if goal was successfully completed
        """
        if not self._started:
            raise RuntimeError("Session not started. Use 'with Session(...) as sess:'")
        
        try:
            # Generate task plan
            logger.info(f"Planning task for goal: {self.goal}")
            self.task_plan = self.task_planner.plan(self.goal)
            
            # Execute each step
            for step in self.task_plan.steps:
                success = self._execute_step(step)
                if not success:
                    logger.error(f"Step {step.step_id} failed")
                    return False
            
            self._completed = True
            self.action_trace.mark_complete()
            logger.info("Task completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Session failed: {e}")
            return False
    
    def _execute_step(self, step) -> bool:
        """Execute a single task step with retry logic."""
        logger.debug(f"Executing step {step.step_id}: {step.action}")
        
        max_retries = 3
        for attempt in range(max_retries):
            start_time = time.time()
            
            try:
                # Capture current screen state
                screenshot = self.vision_driver.capture_screen()
                element_graph = self.vision_driver.detect_elements(screenshot)
                
                # Execute the action
                if step.action == "click":
                    element = self._find_element(element_graph, step.target)
                    if element:
                        self.motor_controller.click(element.bounding_box)
                    else:
                        raise ValueError(f"Element {step.target} not found")
                        
                elif step.action == "type":
                    self.motor_controller.type_text(step.keys)
                    
                elif step.action == "keypress":
                    self.motor_controller.press_keys(step.keys)
                    
                elif step.action == "wait":
                    time.sleep(step.delay or 1.0)
                
                # Record success
                latency_ms = int((time.time() - start_time) * 1000)
                event = ActionEvent(
                    event_id=len(self.action_trace.events) + 1,
                    step_id=step.step_id,
                    timestamp=time.time(),
                    status="success",
                    latency_ms=latency_ms
                )
                self.action_trace.add_event(event)
                
                # Wait for UI to settle
                time.sleep(step.delay or 0.1)
                
                return True
                
            except Exception as e:
                logger.warning(f"Step {step.step_id} attempt {attempt + 1} failed: {e}")
                
                # Record failure
                event = ActionEvent(
                    event_id=len(self.action_trace.events) + 1,
                    step_id=step.step_id,
                    timestamp=time.time(),
                    status="retry" if attempt < max_retries - 1 else "failure",
                    latency_ms=int((time.time() - start_time) * 1000),
                    error=str(e)
                )
                self.action_trace.add_event(event)
                
                if attempt < max_retries - 1:
                    time.sleep(1.0)  # Wait before retry
        
        return False
    
    def _find_element(self, element_graph, element_id):
        """Find element by ID in the element graph."""
        for element in element_graph.elements:
            if element.id == element_id:
                return element
        return None
    
    def plan(self, goal: str) -> TaskPlan:
        """
        Generate a task plan without executing it.
        
        Args:
            goal: Natural language goal
            
        Returns:
            TaskPlan: Generated execution plan
        """
        if not self.task_planner:
            self.task_planner = TaskPlanner()
        
        return self.task_planner.plan(goal)
    
    def replay(self, trace_id: str) -> bool:
        """
        Replay a previously recorded action trace.
        
        Args:
            trace_id: ID of the trace to replay
            
        Returns:
            bool: True if replay was successful
        """
        if not self._started:
            raise RuntimeError("Session not started")
        
        # Load the trace
        trace = self.action_logger.load_trace(trace_id)
        if not trace:
            logger.error(f"Trace {trace_id} not found")
            return False
        
        # Extract the task plan from the trace
        # (Implementation would reconstruct plan from trace events)
        logger.info(f"Replaying trace {trace_id}")
        
        # For now, return not implemented
        raise NotImplementedError("Trace replay not yet implemented")