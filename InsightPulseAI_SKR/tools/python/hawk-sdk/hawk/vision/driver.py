"""Vision driver for element detection and tracking."""

import logging
from typing import Optional, List

from .capture import ScreenCapture
from .detector import ElementDetector
from ..schemas import ScreenshotPayload, ElementGraph
from ..utils.sandbox import SandboxManager

logger = logging.getLogger(__name__)


class VisionDriver:
    """
    Main vision driver that coordinates screen capture and element detection.
    """
    
    def __init__(
        self,
        session_id: str,
        sandbox: Optional[SandboxManager] = None,
        fps_target: int = 30,
        model_path: Optional[str] = None
    ):
        """
        Initialize vision driver.
        
        Args:
            session_id: Current session ID
            sandbox: Sandbox manager instance
            fps_target: Target frames per second
            model_path: Path to vision model checkpoint
        """
        self.session_id = session_id
        self.sandbox = sandbox
        self.fps_target = fps_target
        
        # Initialize components
        self.capture = ScreenCapture(fps_target=fps_target)
        self.detector = ElementDetector(model_path=model_path)
        
        # State tracking
        self.last_screenshot: Optional[ScreenshotPayload] = None
        self.last_element_graph: Optional[ElementGraph] = None
        self._running = False
        
    def start(self):
        """Start the vision driver."""
        logger.info("Starting vision driver")
        self._running = True
        
    def stop(self):
        """Stop the vision driver."""
        logger.info("Stopping vision driver")
        self._running = False
        self.capture.close()
        
    def capture_screen(self) -> ScreenshotPayload:
        """
        Capture current screen state.
        
        Returns:
            ScreenshotPayload: Current screenshot
        """
        if not self._running:
            self.start()
            
        self.last_screenshot = self.capture.capture(self.session_id)
        return self.last_screenshot
        
    def detect_elements(self, screenshot: Optional[ScreenshotPayload] = None) -> ElementGraph:
        """
        Detect UI elements in screenshot.
        
        Args:
            screenshot: Screenshot to analyze (uses last if not provided)
            
        Returns:
            ElementGraph: Detected elements and relationships
        """
        if screenshot is None:
            screenshot = self.last_screenshot
            
        if screenshot is None:
            raise ValueError("No screenshot available for element detection")
            
        # Get numpy array for detection
        img_array = self.capture.capture_numpy()
        
        # Run detection
        self.last_element_graph = self.detector.detect(img_array)
        
        return self.last_element_graph
        
    def track_element(self, element_id: str) -> Optional[dict]:
        """
        Track a specific element across frames.
        
        Args:
            element_id: Element to track
            
        Returns:
            Updated element info if found
        """
        if not self.last_element_graph:
            return None
            
        # Find element in last graph
        for element in self.last_element_graph.elements:
            if element.id == element_id:
                # In a real implementation, this would use visual tracking
                # For now, just return the element
                return element.model_dump()
                
        return None
        
    def find_elements_by_text(self, text: str) -> List[dict]:
        """
        Find elements containing specific text.
        
        Args:
            text: Text to search for
            
        Returns:
            List of matching elements
        """
        if not self.last_element_graph:
            return []
            
        matches = []
        text_lower = text.lower()
        
        for element in self.last_element_graph.elements:
            if text_lower in element.text.lower():
                matches.append(element.model_dump())
                
        return matches
        
    def find_elements_by_role(self, role: str) -> List[dict]:
        """
        Find elements by their role.
        
        Args:
            role: Role to search for (button, input, etc)
            
        Returns:
            List of matching elements
        """
        if not self.last_element_graph:
            return []
            
        matches = []
        for element in self.last_element_graph.elements:
            if element.role == role:
                matches.append(element.model_dump())
                
        return matches
        
    def wait_for_element(self, element_id: str, timeout: float = 10.0) -> bool:
        """
        Wait for an element to appear.
        
        Args:
            element_id: Element to wait for
            timeout: Maximum wait time
            
        Returns:
            True if element found, False if timeout
        """
        import time
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Capture and detect
            self.capture_screen()
            self.detect_elements()
            
            # Check if element exists
            if self.track_element(element_id):
                return True
                
            time.sleep(0.5)
            
        return False