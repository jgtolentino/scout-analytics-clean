"""TaskPlanner agent entry point for Pulser integration."""

import sys
import json
import logging
from typing import Dict, Any

from hawk.automation import TaskPlanner
from hawk.schemas import TaskPlan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Main entry point for TaskPlanner agent."""
    logger.info("Starting TaskPlanner agent")
    
    # Parse input from Pulser
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = json.loads(sys.stdin.read())
    
    # Extract parameters
    goal = input_data.get("goal", "")
    action = input_data.get("action", "plan")
    params = input_data.get("params", {})
    
    # Initialize planner
    llm_backend = params.get("llm_backend", "openai:gpt-4o")
    planner = TaskPlanner(llm_backend=llm_backend)
    
    try:
        result = process_action(planner, action, goal, params)
        
        # Return result to Pulser
        output = {
            "success": True,
            "action": action,
            "result": result
        }
        
    except Exception as e:
        logger.error(f"TaskPlanner error: {e}")
        output = {
            "success": False,
            "action": action,
            "error": str(e)
        }
    
    # Output result
    print(json.dumps(output))
    

def process_action(planner: TaskPlanner, action: str, goal: str, params: Dict[str, Any]) -> Any:
    """Process a specific action."""
    
    if action == "plan":
        # Generate task plan
        plan = planner.plan(goal)
        return plan.model_dump()
        
    elif action == "validate":
        # Validate a plan
        plan_data = params.get("plan", {})
        plan = TaskPlan(**plan_data)
        errors = planner.validate_plan(plan)
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
        
    elif action == "templates":
        # List available templates
        return {
            "templates": [
                {
                    "name": t["name"],
                    "pattern": t["pattern"]
                }
                for t in planner.templates
            ]
        }
        
    else:
        raise ValueError(f"Unknown action: {action}")


if __name__ == "__main__":
    main()