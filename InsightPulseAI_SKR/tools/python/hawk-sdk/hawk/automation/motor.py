"""Cross-platform motor control for UI automation."""

import sys
import time
import logging
from typing import List, Union, Optional, Tuple

import pyautogui

from ..schemas import BoundingBox

logger = logging.getLogger(__name__)

# Safety settings
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.1


class MotorController:
    """
    OS-agnostic motor control layer for mouse and keyboard actions.
    """
    
    def __init__(self, sandbox=None, platform: str = "linux"):
        """
        Initialize motor controller.
        
        Args:
            sandbox: Sandbox manager instance
            platform: Target platform (linux, macos, windows)
        """
        self.sandbox = sandbox
        self.platform = platform.lower()
        
        # Platform-specific configuration
        self._configure_platform()
        
    def _configure_platform(self):
        """Configure platform-specific settings."""
        if self.platform == "linux":
            # Linux-specific configuration
            pyautogui.PAUSE = 0.05
        elif self.platform == "macos":
            # macOS requires accessibility permissions
            pyautogui.PAUSE = 0.1
        elif self.platform == "windows":
            # Windows configuration
            pyautogui.PAUSE = 0.05
            
    def click(self, bbox: Union[BoundingBox, Tuple[int, int]], button: str = "left") -> None:
        """
        Click at the center of a bounding box or specific coordinates.
        
        Args:
            bbox: BoundingBox object or (x, y) coordinates
            button: Mouse button to click (left, right, middle)
        """
        if isinstance(bbox, BoundingBox):
            # Calculate center of bounding box
            x = (bbox.x1 + bbox.x2) // 2
            y = (bbox.y1 + bbox.y2) // 2
        else:
            x, y = bbox
            
        logger.debug(f"Clicking at ({x}, {y}) with {button} button")
        
        # Move to position first for better reliability
        pyautogui.moveTo(x, y, duration=0.2)
        time.sleep(0.05)
        
        # Perform click
        pyautogui.click(x, y, button=button)
        
    def double_click(self, bbox: Union[BoundingBox, Tuple[int, int]]) -> None:
        """
        Double-click at the center of a bounding box or specific coordinates.
        
        Args:
            bbox: BoundingBox object or (x, y) coordinates
        """
        if isinstance(bbox, BoundingBox):
            x = (bbox.x1 + bbox.x2) // 2
            y = (bbox.y1 + bbox.y2) // 2
        else:
            x, y = bbox
            
        logger.debug(f"Double-clicking at ({x}, {y})")
        pyautogui.doubleClick(x, y)
        
    def right_click(self, bbox: Union[BoundingBox, Tuple[int, int]]) -> None:
        """
        Right-click at the center of a bounding box or specific coordinates.
        
        Args:
            bbox: BoundingBox object or (x, y) coordinates
        """
        self.click(bbox, button="right")
        
    def type_text(self, text: str, interval: float = 0.05) -> None:
        """
        Type text with realistic typing speed.
        
        Args:
            text: Text to type
            interval: Interval between keystrokes
        """
        logger.debug(f"Typing text: {text[:20]}...")
        pyautogui.typewrite(text, interval=interval)
        
    def press_keys(self, keys: Union[str, List[str]]) -> None:
        """
        Press one or more keys.
        
        Args:
            keys: Single key or list of keys to press
        """
        if isinstance(keys, str):
            keys = [keys]
            
        for key in keys:
            logger.debug(f"Pressing key: {key}")
            
            # Handle special key combinations
            if "+" in key and not key in ["+"]:  # Key combination
                pyautogui.hotkey(*key.split("+"))
            else:
                # Map common key names
                key_map = {
                    "ENTER": "enter",
                    "RETURN": "enter", 
                    "TAB": "tab",
                    "ESC": "esc",
                    "ESCAPE": "esc",
                    "SPACE": "space",
                    "BACKSPACE": "backspace",
                    "DELETE": "delete",
                    "UP": "up",
                    "DOWN": "down",
                    "LEFT": "left",
                    "RIGHT": "right",
                    "HOME": "home",
                    "END": "end",
                    "PAGEUP": "pageup",
                    "PAGEDOWN": "pagedown",
                    "CTRL": "ctrl",
                    "CONTROL": "ctrl",
                    "ALT": "alt",
                    "SHIFT": "shift",
                    "CMD": "cmd",
                    "COMMAND": "cmd",
                    "WIN": "win",
                    "WINDOWS": "win",
                }
                
                key_lower = key.upper()
                if key_lower in key_map:
                    key = key_map[key_lower]
                else:
                    key = key.lower()
                    
                pyautogui.press(key)
                
    def hotkey(self, *keys) -> None:
        """
        Press a keyboard shortcut.
        
        Args:
            *keys: Keys to press together (e.g., 'ctrl', 'c')
        """
        logger.debug(f"Pressing hotkey: {'+'.join(keys)}")
        pyautogui.hotkey(*keys)
        
    def drag(self, start: BoundingBox, end: BoundingBox, duration: float = 0.5) -> None:
        """
        Drag from start to end position.
        
        Args:
            start: Starting position
            end: Ending position  
            duration: Duration of drag operation
        """
        start_x = (start.x1 + start.x2) // 2
        start_y = (start.y1 + start.y2) // 2
        end_x = (end.x1 + end.x2) // 2
        end_y = (end.y1 + end.y2) // 2
        
        logger.debug(f"Dragging from ({start_x}, {start_y}) to ({end_x}, {end_y})")
        pyautogui.dragTo(end_x, end_y, duration=duration, button='left')
        
    def scroll(self, clicks: int, x: Optional[int] = None, y: Optional[int] = None) -> None:
        """
        Scroll the mouse wheel.
        
        Args:
            clicks: Number of clicks to scroll (positive=up, negative=down)
            x: Optional x coordinate
            y: Optional y coordinate
        """
        if x is not None and y is not None:
            pyautogui.moveTo(x, y)
            
        logger.debug(f"Scrolling {clicks} clicks")
        pyautogui.scroll(clicks)
        
    def move_to(self, x: int, y: int, duration: float = 0.2) -> None:
        """
        Move mouse to specific coordinates.
        
        Args:
            x: X coordinate
            y: Y coordinate
            duration: Duration of movement
        """
        logger.debug(f"Moving mouse to ({x}, {y})")
        pyautogui.moveTo(x, y, duration=duration)
        
    def get_position(self) -> Tuple[int, int]:
        """Get current mouse position."""
        return pyautogui.position()
        
    def wait(self, seconds: float) -> None:
        """
        Wait for specified duration.
        
        Args:
            seconds: Seconds to wait
        """
        logger.debug(f"Waiting {seconds} seconds")
        time.sleep(seconds)