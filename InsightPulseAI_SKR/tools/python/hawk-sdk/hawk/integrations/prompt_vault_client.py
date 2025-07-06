"""Client for interacting with PromptVault service."""

import os
import yaml
import logging
from typing import List, Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class PromptVaultClient:
    """Client for retrieving and managing prompts from PromptVault."""
    
    def __init__(self, vault_path: Optional[str] = None):
        """
        Initialize PromptVault client.
        
        Args:
            vault_path: Path to prompt vault YAML file
        """
        if vault_path is None:
            vault_path = os.environ.get(
                "PROMPT_VAULT_PATH",
                "agents/prompt_vault.yaml"
            )
            
        self.vault_path = Path(vault_path)
        self.vault_data: Optional[Dict] = None
        self.prompts_by_category: Dict[str, List[Dict]] = {}
        
        # Load vault
        self._load_vault()
        
    def _load_vault(self):
        """Load prompt vault from file."""
        if not self.vault_path.exists():
            logger.warning(f"PromptVault not found at {self.vault_path}")
            return
            
        try:
            with open(self.vault_path, 'r') as f:
                self.vault_data = yaml.safe_load(f)
                
            # Index prompts by category
            if 'prompts' in self.vault_data:
                for category_group in self.vault_data['prompts']:
                    category = category_group['category']
                    self.prompts_by_category[category] = category_group['items']
                    
            logger.info(f"Loaded {self._count_prompts()} prompts from PromptVault")
            
        except Exception as e:
            logger.error(f"Failed to load PromptVault: {e}")
            
    def _count_prompts(self) -> int:
        """Count total prompts in vault."""
        return sum(len(prompts) for prompts in self.prompts_by_category.values())
        
    def get_relevant_prompts(
        self,
        category: str = "general",
        context: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict]:
        """
        Retrieve relevant prompts for a given context.
        
        Args:
            category: Prompt category to search
            context: Current task context for relevance filtering
            limit: Maximum number of prompts to return
            
        Returns:
            List of relevant prompt dictionaries
        """
        if category not in self.prompts_by_category:
            logger.warning(f"Category '{category}' not found, using 'general'")
            category = "general"
            
        prompts = self.prompts_by_category.get(category, [])
        
        if not prompts:
            return []
            
        # If no context, return first N prompts
        if not context:
            return prompts[:limit]
            
        # Simple keyword-based relevance scoring
        context_lower = context.lower()
        scored_prompts = []
        
        for prompt in prompts:
            content_lower = prompt['content'].lower()
            
            # Count keyword matches
            score = 0
            for word in context_lower.split():
                if len(word) > 3 and word in content_lower:
                    score += 1
                    
            scored_prompts.append((score, prompt))
            
        # Sort by relevance score
        scored_prompts.sort(key=lambda x: x[0], reverse=True)
        
        # Return top prompts
        return [prompt for _, prompt in scored_prompts[:limit]]
        
    def get_prompt_by_id(self, prompt_id: str) -> Optional[Dict]:
        """
        Retrieve a specific prompt by ID.
        
        Args:
            prompt_id: Unique prompt identifier
            
        Returns:
            Prompt dictionary if found, None otherwise
        """
        for prompts in self.prompts_by_category.values():
            for prompt in prompts:
                if prompt.get('id') == prompt_id:
                    return prompt
        return None
        
    def search_prompts(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search prompts across all categories.
        
        Args:
            query: Search query
            limit: Maximum results
            
        Returns:
            List of matching prompts
        """
        query_lower = query.lower()
        matches = []
        
        for prompts in self.prompts_by_category.values():
            for prompt in prompts:
                if query_lower in prompt['content'].lower():
                    matches.append(prompt)
                    if len(matches) >= limit:
                        return matches
                        
        return matches
        
    def get_categories(self) -> List[str]:
        """Get list of available prompt categories."""
        return list(self.prompts_by_category.keys())
        
    def get_category_stats(self) -> Dict[str, int]:
        """Get prompt count statistics by category."""
        return {
            category: len(prompts)
            for category, prompts in self.prompts_by_category.items()
        }