"""Task planning using LLM for natural language goal decomposition."""

import os
import json
import uuid
import logging
from typing import Optional, Dict, Any, List

from ..schemas import TaskPlan, TaskStep

logger = logging.getLogger(__name__)


class TaskPlanner:
    """
    LLM-based task planner that converts natural language goals to TaskPlan JSON.
    """
    
    def __init__(self, llm_backend: str = "openai:gpt-4o"):
        """
        Initialize task planner.
        
        Args:
            llm_backend: LLM backend to use
        """
        self.llm_backend = llm_backend
        self.system_prompt = self._load_system_prompt()
        self.templates = self._load_templates()
        
    def _load_system_prompt(self) -> str:
        """Load the system prompt for the LLM."""
        return """You are a task planning agent for the Hawk UI automation system.
Your role is to convert natural language goals into precise, executable TaskPlan JSON.

Guidelines:
1. Break down complex tasks into atomic UI actions (click, type, keypress)
2. Identify specific UI elements by their visual characteristics
3. Include appropriate delays between actions for UI responsiveness
4. Add confidence scores based on action complexity
5. Prefer keyboard shortcuts when available for efficiency

Output only valid TaskPlan JSON matching this schema:
{
  "plan_id": "string",
  "goal": "string", 
  "steps": [
    {
      "step_id": "string",
      "action": "click|type|keypress|wait|screenshot",
      "target": "element_id (for clicks)",
      "keys": "string or array (for type/keypress)",
      "delay": 0.1,
      "confidence": 0.0-1.0
    }
  ]
}"""

    def _load_templates(self) -> List[Dict[str, Any]]:
        """Load task templates."""
        return [
            {
                "name": "export_document",
                "pattern": r"export .* from .*",
                "steps": [
                    {"action": "click", "target": "file_menu"},
                    {"action": "click", "target": "export_option"},
                    {"action": "type", "keys": "{filename}"},
                    {"action": "keypress", "keys": ["ENTER"]}
                ]
            },
            {
                "name": "fill_form",
                "pattern": r"fill .* form",
                "steps": [
                    {"action": "click", "target": "first_input_field"},
                    {"action": "type", "keys": "{field_value}"},
                    {"action": "keypress", "keys": ["TAB"]}
                ]
            }
        ]
        
    def plan(self, goal: str) -> TaskPlan:
        """
        Generate a task plan from natural language goal.
        
        Args:
            goal: Natural language goal
            
        Returns:
            TaskPlan: Generated execution plan
        """
        logger.info(f"Planning task for goal: {goal}")
        
        # Check if goal matches any template
        template_plan = self._check_templates(goal)
        if template_plan:
            return template_plan
            
        # Use LLM to generate plan
        if self.llm_backend.startswith("openai:"):
            return self._plan_with_openai(goal)
        else:
            # Fallback to simple planning
            return self._plan_simple(goal)
            
    def _check_templates(self, goal: str) -> Optional[TaskPlan]:
        """Check if goal matches any template."""
        import re
        
        for template in self.templates:
            if re.search(template["pattern"], goal, re.IGNORECASE):
                logger.info(f"Using template: {template['name']}")
                
                # Create plan from template
                plan = TaskPlan(
                    plan_id=f"tp_{uuid.uuid4().hex[:8]}",
                    goal=goal,
                    steps=[]
                )
                
                # Add steps from template
                for i, step_template in enumerate(template["steps"]):
                    step = TaskStep(
                        step_id=f"s{i+1}",
                        action=step_template["action"],
                        target=step_template.get("target"),
                        keys=step_template.get("keys"),
                        delay=step_template.get("delay", 0.1),
                        confidence=0.9
                    )
                    plan.add_step(step)
                    
                return plan
                
        return None
        
    def _plan_with_openai(self, goal: str) -> TaskPlan:
        """Generate plan using OpenAI GPT."""
        try:
            import openai
            
            # Get API key
            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OpenAI API key not found, using simple planner")
                return self._plan_simple(goal)
                
            # Create client
            client = openai.OpenAI(api_key=api_key)
            
            # Generate plan
            response = client.chat.completions.create(
                model=self.llm_backend.split(":")[1],
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"Create a task plan for: {goal}"}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse response
            plan_json = response.choices[0].message.content
            plan_data = json.loads(plan_json)
            
            # Convert to TaskPlan
            return TaskPlan(**plan_data)
            
        except Exception as e:
            logger.error(f"OpenAI planning failed: {e}")
            return self._plan_simple(goal)
            
    def _plan_simple(self, goal: str) -> TaskPlan:
        """
        Simple rule-based planning fallback.
        """
        plan = TaskPlan(
            plan_id=f"tp_{uuid.uuid4().hex[:8]}",
            goal=goal,
            steps=[]
        )
        
        # Very basic keyword-based planning
        goal_lower = goal.lower()
        
        if "export" in goal_lower:
            # Export workflow
            plan.add_step(TaskStep(
                step_id="s1",
                action="click",
                target="elm_file_menu",
                confidence=0.7
            ))
            plan.add_step(TaskStep(
                step_id="s2", 
                action="click",
                target="elm_export",
                confidence=0.7
            ))
            plan.add_step(TaskStep(
                step_id="s3",
                action="wait",
                delay=1.0
            ))
            
        elif "click" in goal_lower:
            # Direct click action
            plan.add_step(TaskStep(
                step_id="s1",
                action="click",
                target="elm_target",
                confidence=0.8
            ))
            
        elif "type" in goal_lower or "enter" in goal_lower:
            # Typing action
            plan.add_step(TaskStep(
                step_id="s1",
                action="type",
                keys="user input",
                confidence=0.8
            ))
            
        else:
            # Generic action
            plan.add_step(TaskStep(
                step_id="s1",
                action="wait",
                delay=1.0,
                confidence=0.5
            ))
            
        return plan
        
    def validate_plan(self, plan: TaskPlan) -> List[str]:
        """
        Validate a task plan.
        
        Args:
            plan: TaskPlan to validate
            
        Returns:
            List of validation errors (empty if valid)
        """
        errors = []
        
        # Check plan has steps
        if not plan.steps:
            errors.append("Plan has no steps")
            
        # Validate each step
        for i, step in enumerate(plan.steps):
            if step.action == "click" and not step.target:
                errors.append(f"Step {i+1}: Click action missing target")
                
            if step.action in ["type", "keypress"] and not step.keys:
                errors.append(f"Step {i+1}: {step.action} action missing keys")
                
            if step.delay and step.delay < 0:
                errors.append(f"Step {i+1}: Invalid delay value")
                
        return errors