"""Screen capture implementation for Hawk SDK."""

import base64
import time
import logging
from typing import Optional, Tuple
from io import BytesIO

import mss
import numpy as np
from PIL import Image

from ..schemas import ScreenshotPayload, Resolution

logger = logging.getLogger(__name__)


class ScreenCapture:
    """High-performance screen capture with 30-60 fps support."""
    
    def __init__(self, monitor: int = 0, fps_target: int = 30):
        """
        Initialize screen capture.
        
        Args:
            monitor: Monitor index (0 for primary)
            fps_target: Target frames per second
        """
        self.sct = mss.mss()
        self.monitor = monitor
        self.fps_target = fps_target
        self.frame_interval = 1.0 / fps_target
        self.last_frame_time = 0
        
    def capture(self, session_id: str, region: Optional[Tuple[int, int, int, int]] = None) -> ScreenshotPayload:
        """
        Capture a screenshot.
        
        Args:
            session_id: Current session ID
            region: Optional (x, y, width, height) region to capture
            
        Returns:
            ScreenshotPayload: Captured screenshot data
        """
        # Rate limiting for target FPS
        current_time = time.time()
        elapsed = current_time - self.last_frame_time
        if elapsed < self.frame_interval:
            time.sleep(self.frame_interval - elapsed)
        
        # Get monitor info
        if self.monitor == 0:
            monitor_info = self.sct.monitors[1]  # Primary monitor
        else:
            monitor_info = self.sct.monitors[self.monitor]
        
        # Apply region if specified
        if region:
            x, y, w, h = region
            monitor_info = {
                "left": monitor_info["left"] + x,
                "top": monitor_info["top"] + y,
                "width": w,
                "height": h
            }
        
        # Capture screenshot
        screenshot = self.sct.grab(monitor_info)
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", screenshot.size, screenshot.rgb)
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format="PNG", optimize=True)
        frame_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        # Update timing
        self.last_frame_time = time.time()
        
        # Create payload
        return ScreenshotPayload(
            session_id=session_id,
            timestamp=int(current_time),
            frame=frame_base64,
            resolution=Resolution(w=screenshot.width, h=screenshot.height)
        )
    
    def capture_numpy(self, region: Optional[Tuple[int, int, int, int]] = None) -> np.ndarray:
        """
        Capture screenshot as numpy array for processing.
        
        Args:
            region: Optional (x, y, width, height) region
            
        Returns:
            np.ndarray: RGB image array
        """
        # Get monitor info
        if self.monitor == 0:
            monitor_info = self.sct.monitors[1]
        else:
            monitor_info = self.sct.monitors[self.monitor]
        
        # Apply region if specified
        if region:
            x, y, w, h = region
            monitor_info = {
                "left": monitor_info["left"] + x,
                "top": monitor_info["top"] + y,
                "width": w,
                "height": h
            }
        
        # Capture and convert to numpy
        screenshot = self.sct.grab(monitor_info)
        return np.array(screenshot)[:, :, :3]  # Remove alpha channel
    
    def get_monitor_info(self) -> dict:
        """Get information about the current monitor."""
        if self.monitor == 0:
            return self.sct.monitors[1]
        return self.sct.monitors[self.monitor]
    
    def close(self):
        """Clean up resources."""
        if hasattr(self, 'sct'):
            self.sct.close()