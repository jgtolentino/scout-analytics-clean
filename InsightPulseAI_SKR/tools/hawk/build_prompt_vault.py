#!/usr/bin/env python3
"""
Build PromptVault from leaked system prompts repositories.
Filters, deduplicates, and structures prompts for Hawk TaskPlanner.
"""

import os
import re
import json
import yaml
import hashlib
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple
from collections import defaultdict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PromptVaultBuilder:
    """Builds structured prompt library from raw sources."""
    
    def __init__(self, min_tokens: int = 30):
        self.min_tokens = min_tokens
        self.prompts: List[Dict] = []
        self.seen_hashes: Set[str] = set()
        
        # Quality filters
        self.blocklist_patterns = [
            r'api[_\s-]?key',
            r'password',
            r'secret',
            r'token',
            r'bearer',
            r'private[_\s-]?key',
            r'BEGIN RSA',
            r'BEGIN PRIVATE',
            # PII patterns
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'\b\d{16}\b',  # Credit card
        ]
        
        # Category classifiers
        self.categories = {
            'task_planning': ['plan', 'task', 'step', 'action', 'workflow'],
            'ui_automation': ['click', 'button', 'element', 'screen', 'interface'],
            'code_generation': ['code', 'function', 'implement', 'program'],
            'data_analysis': ['analyze', 'data', 'metrics', 'report'],
            'safety': ['refuse', 'cannot', 'unsafe', 'harmful'],
            'general': []  # Fallback
        }
        
    def process_directory(self, path: Path, source_tag: str) -> int:
        """Process all prompt files in directory."""
        count = 0
        
        for file_path in path.rglob('*'):
            if file_path.suffix in ['.txt', '.md', '.json', '.yaml', '.yml']:
                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore')
                    
                    if file_path.suffix == '.json':
                        data = json.loads(content)
                        prompts = self._extract_prompts_from_json(data)
                    elif file_path.suffix in ['.yaml', '.yml']:
                        data = yaml.safe_load(content)
                        prompts = self._extract_prompts_from_yaml(data)
                    else:
                        prompts = self._extract_prompts_from_text(content)
                    
                    for prompt in prompts:
                        if self._validate_prompt(prompt):
                            self._add_prompt(prompt, source_tag, file_path)
                            count += 1
                            
                except Exception as e:
                    logger.warning(f"Failed to process {file_path}: {e}")
                    
        return count
    
    def _extract_prompts_from_json(self, data: Dict) -> List[str]:
        """Extract prompts from JSON structure."""
        prompts = []
        
        def extract_recursive(obj):
            if isinstance(obj, str) and len(obj) > 50:
                prompts.append(obj)
            elif isinstance(obj, dict):
                for key, value in obj.items():
                    if 'prompt' in key.lower() or 'system' in key.lower():
                        if isinstance(value, str):
                            prompts.append(value)
                    extract_recursive(value)
            elif isinstance(obj, list):
                for item in obj:
                    extract_recursive(item)
                    
        extract_recursive(data)
        return prompts
    
    def _extract_prompts_from_yaml(self, data: Dict) -> List[str]:
        """Extract prompts from YAML structure."""
        return self._extract_prompts_from_json(data)  # Same logic
    
    def _extract_prompts_from_text(self, content: str) -> List[str]:
        """Extract prompts from text files."""
        prompts = []
        
        # Split by common delimiters
        sections = re.split(r'\n---+\n|\n===+\n|\n\*\*\*+\n', content)
        
        for section in sections:
            section = section.strip()
            if len(section) > 100:  # Minimum prompt length
                prompts.append(section)
                
        return prompts
    
    def _validate_prompt(self, prompt: str) -> bool:
        """Validate prompt quality and safety."""
        # Check minimum length
        tokens = len(prompt.split())
        if tokens < self.min_tokens:
            return False
            
        # Check for blocked patterns
        for pattern in self.blocklist_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                logger.debug(f"Blocked prompt matching pattern: {pattern}")
                return False
                
        # Check for duplicate
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()
        if prompt_hash in self.seen_hashes:
            return False
        self.seen_hashes.add(prompt_hash)
        
        return True
    
    def _categorize_prompt(self, prompt: str) -> str:
        """Categorize prompt based on content."""
        prompt_lower = prompt.lower()
        scores = {}
        
        for category, keywords in self.categories.items():
            if category == 'general':
                scores[category] = 0
            else:
                score = sum(1 for kw in keywords if kw in prompt_lower)
                scores[category] = score
                
        # Return category with highest score
        best_category = max(scores, key=scores.get)
        return best_category if scores[best_category] > 0 else 'general'
    
    def _add_prompt(self, prompt: str, source: str, file_path: Path):
        """Add validated prompt to vault."""
        category = self._categorize_prompt(prompt)
        
        self.prompts.append({
            'id': f"prompt_{len(self.prompts) + 1}",
            'content': prompt,
            'category': category,
            'source': source,
            'file': str(file_path.name),
            'tokens': len(prompt.split()),
            'hash': hashlib.sha256(prompt.encode()).hexdigest()[:16]
        })
    
    def build_vault(self, output_path: Path, dedupe: bool = True):
        """Build final PromptVault YAML."""
        vault = {
            'name': 'PromptVault',
            'version': '1.0.0',
            'description': 'Curated prompt library for Hawk TaskPlanner',
            'metadata': {
                'total_prompts': len(self.prompts),
                'categories': defaultdict(int),
                'sources': defaultdict(int)
            },
            'prompts': []
        }
        
        # Group by category
        by_category = defaultdict(list)
        for prompt in self.prompts:
            by_category[prompt['category']].append(prompt)
            vault['metadata']['categories'][prompt['category']] += 1
            vault['metadata']['sources'][prompt['source']] += 1
        
        # Structure vault
        for category, prompts in by_category.items():
            vault['prompts'].append({
                'category': category,
                'count': len(prompts),
                'items': prompts
            })
        
        # Write YAML
        with open(output_path, 'w') as f:
            yaml.dump(vault, f, default_flow_style=False, sort_keys=False)
            
        logger.info(f"Built PromptVault with {len(self.prompts)} prompts")
        logger.info(f"Categories: {dict(vault['metadata']['categories'])}")
        

def main():
    parser = argparse.ArgumentParser(description='Build PromptVault from prompt sources')
    parser.add_argument('sources', nargs='+', help='Source directories')
    parser.add_argument('--out', default='prompt_vault.yaml', help='Output file')
    parser.add_argument('--dedupe', action='store_true', help='Deduplicate prompts')
    parser.add_argument('--tag-source', action='store_true', help='Tag prompts with source')
    parser.add_argument('--min-tokens', type=int, default=30, help='Minimum prompt tokens')
    
    args = parser.parse_args()
    
    builder = PromptVaultBuilder(min_tokens=args.min_tokens)
    
    # Process each source
    for i, source_path in enumerate(args.sources):
        path = Path(source_path)
        if not path.exists():
            logger.error(f"Source not found: {source_path}")
            continue
            
        source_tag = path.name if args.tag_source else f"source_{i+1}"
        count = builder.process_directory(path, source_tag)
        logger.info(f"Processed {count} prompts from {source_path}")
    
    # Build vault
    output_path = Path(args.out)
    builder.build_vault(output_path, dedupe=args.dedupe)
    
    # Generate integrity manifest
    manifest_path = output_path.with_suffix('.manifest')
    with open(manifest_path, 'w') as f:
        f.write(f"# PromptVault Integrity Manifest\n")
        f.write(f"vault_file: {output_path.name}\n")
        f.write(f"vault_hash: {hashlib.sha256(output_path.read_bytes()).hexdigest()}\n")
        f.write(f"total_prompts: {len(builder.prompts)}\n")
        f.write(f"build_timestamp: {import_datetime.now().isoformat()}\n")
    
    logger.info(f"Wrote integrity manifest to {manifest_path}")


if __name__ == "__main__":
    from datetime import datetime as import_datetime
    main()