#!/usr/bin/env python3
"""
Verify that source IDs from original campaign files match with scraped sources
Ensures data integrity in the enrichment pipeline
"""

import sys
import json
import yaml
from pathlib import Path

def load_agent_config(path):
    """Load agent configuration YAML"""
    with open(path, 'r') as f:
        return yaml.safe_load(f)

def load_insights(path):
    """Load insights JSON"""
    with open(path, 'r') as f:
        return json.load(f)

def extract_source_files(agent_config):
    """Extract all source files mentioned in agent config"""
    source_files = []
    
    # Look for source files in tasks
    if 'tasks' in agent_config:
        for task in agent_config['tasks']:
            if 'inputs' in task:
                for input_item in task['inputs']:
                    if 'source_file' in input_item:
                        source_files.append(input_item['source_file'])
            
            # Also check workflow steps
            if 'workflow' in task:
                for step in task['workflow']:
                    if 'source' in step:
                        source_files.append(step['source'])
    
    return source_files

def verify_source_mapping(agent_config_path, insights_path):
    """Verify that sources in insights match expected sources from config"""
    print("🔍 Verifying Source ID Mapping")
    print("=" * 60)
    
    # Load configurations
    agent_config = load_agent_config(agent_config_path)
    insights = load_insights(insights_path)
    
    # Extract expected sources
    expected_sources = extract_source_files(agent_config)
    print(f"\n📋 Expected source files from agent config:")
    for i, source in enumerate(expected_sources, 1):
        print(f"   {i}. {source}")
    
    # Get actual sources from insights
    actual_sources = insights.get('sources', [])
    print(f"\n📊 Actual sources found in insights: {len(actual_sources)}")
    
    # Create verification report
    verification_results = {
        'expected_count': len(expected_sources),
        'actual_count': len(actual_sources),
        'matches': [],
        'missing': [],
        'extra': []
    }
    
    # Map sources by ID
    if actual_sources:
        print("\n🔗 Source Mapping:")
        for i, source in enumerate(actual_sources, 1):
            print(f"\n   [{i}] {source.get('title', 'Unknown')}")
            print(f"       URL: {source.get('url', 'N/A')}")
            if 'metrics_found' in source:
                print(f"       Metrics: {', '.join(source['metrics_found'])}")
            
            # Try to match with expected sources
            matched = False
            for expected in expected_sources:
                # Simple matching - you can make this more sophisticated
                expected_name = Path(expected).stem.lower()
                if expected_name in source.get('title', '').lower():
                    verification_results['matches'].append({
                        'id': i,
                        'expected': expected,
                        'actual': source.get('title', '')
                    })
                    matched = True
                    print(f"       ✅ Matched to: {expected}")
                    break
            
            if not matched:
                verification_results['extra'].append({
                    'id': i,
                    'source': source.get('title', '')
                })
                print(f"       ⚠️  No match found")
    
    # Check for missing expected sources
    matched_expected = [m['expected'] for m in verification_results['matches']]
    for expected in expected_sources:
        if expected not in matched_expected:
            verification_results['missing'].append(expected)
    
    # Summary
    print("\n" + "=" * 60)
    print("📈 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"✅ Matched sources: {len(verification_results['matches'])}")
    print(f"❌ Missing expected sources: {len(verification_results['missing'])}")
    print(f"➕ Extra sources found: {len(verification_results['extra'])}")
    
    if verification_results['missing']:
        print("\n⚠️  Missing Sources:")
        for missing in verification_results['missing']:
            print(f"   - {missing}")
    
    if verification_results['extra']:
        print("\n📌 Additional Sources (not in config):")
        for extra in verification_results['extra']:
            print(f"   - [{extra['id']}] {extra['source']}")
    
    # Save verification report
    report_path = Path(insights_path).parent / 'source_verification_report.json'
    with open(report_path, 'w') as f:
        json.dump(verification_results, f, indent=2)
    print(f"\n💾 Verification report saved to: {report_path}")
    
    # Return success/failure
    return len(verification_results['missing']) == 0

def main():
    if len(sys.argv) != 3:
        print("Usage: verify_source_ids.py <agent_config.yaml> <insights.json>")
        sys.exit(1)
    
    agent_config_path = sys.argv[1]
    insights_path = sys.argv[2]
    
    try:
        success = verify_source_mapping(agent_config_path, insights_path)
        if success:
            print("\n✅ Source verification PASSED")
            sys.exit(0)
        else:
            print("\n❌ Source verification FAILED - missing expected sources")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()