"""VisionDriver agent entry point for Pulser integration."""

import sys
import json
import logging
from typing import Dict, Any

from hawk.vision import VisionDriver
from hawk.schemas import ElementGraph

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Main entry point for VisionDriver agent."""
    logger.info("Starting VisionDriver agent")
    
    # Parse input from Pulser
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = json.loads(sys.stdin.read())
    
    # Extract parameters
    session_id = input_data.get("session_id", "default")
    action = input_data.get("action", "detect")
    params = input_data.get("params", {})
    
    # Initialize driver
    driver = VisionDriver(session_id=session_id)
    driver.start()
    
    try:
        result = process_action(driver, action, params)
        
        # Return result to Pulser
        output = {
            "success": True,
            "action": action,
            "result": result
        }
        
    except Exception as e:
        logger.error(f"VisionDriver error: {e}")
        output = {
            "success": False,
            "action": action,
            "error": str(e)
        }
    
    finally:
        driver.stop()
    
    # Output result
    print(json.dumps(output))
    

def process_action(driver: VisionDriver, action: str, params: Dict[str, Any]) -> Any:
    """Process a specific action."""
    
    if action == "capture":
        # Capture screen
        screenshot = driver.capture_screen()
        return {
            "session_id": screenshot.session_id,
            "timestamp": screenshot.timestamp,
            "resolution": screenshot.resolution.model_dump()
        }
        
    elif action == "detect":
        # Detect elements
        elements = driver.detect_elements()
        return elements.model_dump()
        
    elif action == "find_text":
        # Find elements by text
        text = params.get("text", "")
        matches = driver.find_elements_by_text(text)
        return {"matches": matches}
        
    elif action == "find_role":
        # Find elements by role
        role = params.get("role", "button")
        matches = driver.find_elements_by_role(role)
        return {"matches": matches}
        
    elif action == "track":
        # Track specific element
        element_id = params.get("element_id")
        result = driver.track_element(element_id)
        return {"element": result}
        
    elif action == "wait_for":
        # Wait for element
        element_id = params.get("element_id")
        timeout = params.get("timeout", 10.0)
        found = driver.wait_for_element(element_id, timeout)
        return {"found": found}
        
    else:
        raise ValueError(f"Unknown action: {action}")


if __name__ == "__main__":
    main()