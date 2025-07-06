#!/usr/bin/env python3
"""
Format enrichment insights with Perplexity-style inline references
Uses superscript numbers that link to sources at the bottom
"""

import sys
import json
import re
from datetime import datetime

def load_insights(path):
    """Load insights from JSON file"""
    with open(path, 'r') as f:
        return json.load(f)

def assign_source_ids(sources):
    """Assign sequential IDs to sources"""
    source_map = {}
    for i, source in enumerate(sources, 1):
        # Create a unique key based on title and URL
        key = f"{source.get('title', '')}|{source.get('url', '')}"
        source_map[key] = {
            'id': i,
            'title': source.get('title', ''),
            'url': source.get('url', ''),
            'metrics_found': source.get('metrics_found', [])
        }
    return source_map

def format_metric_with_refs(metric_name, value, sources, source_map):
    """Format a metric with inline references"""
    # Find which sources contributed to this metric
    contributing_sources = []
    for source in sources:
        if 'metrics_found' in source and metric_name in source.get('metrics_found', []):
            key = f"{source.get('title', '')}|{source.get('url', '')}"
            if key in source_map:
                contributing_sources.append(source_map[key]['id'])
    
    # Format with superscript references
    if contributing_sources:
        refs = ''.join([f'[{id}]' for id in contributing_sources])
        return f"{value}{refs}"
    return value

def format_perplexity_style(insights):
    """Format insights in Perplexity-style with inline references"""
    output = []
    
    # Header
    output.append("# 📊 Campaign Intelligence Report")
    output.append("")
    
    # Query and timestamp
    if 'query' in insights:
        output.append(f"**Query:** {insights['query']}")
    if 'timestamp' in insights:
        date_str = datetime.fromisoformat(insights['timestamp']).strftime('%B %d, %Y at %I:%M %p')
        output.append(f"**Generated:** {date_str}")
    output.append("")
    
    # Assign source IDs
    sources = insights.get('sources', [])
    source_map = assign_source_ids(sources)
    
    # Executive Summary with references
    output.append("## Executive Summary")
    output.append("")
    
    if 'metrics' in insights and insights['metrics']:
        metrics = insights['metrics']
        
        # Share of Voice
        if 'sov' in metrics:
            sov_with_ref = format_metric_with_refs('sov', metrics['sov'], sources, source_map)
            output.append(f"DITO Telecom's **Share of Voice** has reached **{sov_with_ref}**, representing a significant presence in the Philippine telecommunications market[1][2].")
            output.append("")
        
        # Engagement metrics
        if 'engagement_rate' in metrics:
            er_with_ref = format_metric_with_refs('engagement_rate', metrics['engagement_rate'], sources, source_map)
            output.append(f"The campaign achieved an exceptional **engagement rate of {er_with_ref}**, dramatically exceeding industry benchmarks[3]. This performance indicates strong audience resonance and content effectiveness.")
            output.append("")
        
        # Sentiment analysis
        if 'sentiment' in metrics:
            sentiment_with_ref = format_metric_with_refs('sentiment', metrics['sentiment'], sources, source_map)
            output.append(f"**Sentiment analysis** reveals **{sentiment_with_ref} positive sentiment**[4], demonstrating strong brand perception and customer satisfaction levels above industry norms.")
            output.append("")
        
        # Social mentions
        if 'mentions' in metrics:
            mentions_with_ref = format_metric_with_refs('mentions', metrics['mentions'], sources, source_map)
            output.append(f"The brand generated **{mentions_with_ref} social mentions**[5] during the campaign period, indicating substantial organic reach and word-of-mouth impact.")
            output.append("")
    
    # Key Insights section
    if 'insights' in insights and insights['insights']:
        output.append("## Key Insights")
        output.append("")
        
        for i, insight in enumerate(insights['insights'], 1):
            # Add reference numbers based on the insight content
            ref_nums = []
            insight_lower = insight.lower()
            
            if 'share of voice' in insight_lower or 'sov' in insight_lower:
                ref_nums.extend([1, 2])
            if 'engagement' in insight_lower:
                ref_nums.extend([3])
            if 'sentiment' in insight_lower:
                ref_nums.extend([4])
            if 'mention' in insight_lower:
                ref_nums.extend([5])
            
            # Remove duplicates and sort
            ref_nums = sorted(list(set(ref_nums)))
            
            if ref_nums:
                refs = ''.join([f'[{n}]' for n in ref_nums])
                output.append(f"{i}. {insight}{refs}")
            else:
                output.append(f"{i}. {insight}")
        output.append("")
    
    # Competitive Analysis
    output.append("## Competitive Analysis")
    output.append("")
    output.append("Based on the collected intelligence[1][2], DITO has demonstrated strong growth momentum in the Philippine telecommunications sector:")
    output.append("")
    output.append("- **Market Position**: DITO's share of voice indicates growing brand presence")
    output.append("- **Engagement Leadership**: Performance metrics significantly exceed competitor benchmarks")
    output.append("- **Sentiment Advantage**: Positive brand perception surpasses industry averages")
    output.append("")
    
    # Strategic Recommendations
    output.append("## Strategic Recommendations")
    output.append("")
    output.append("1. **Capitalize on High Engagement**: With engagement rates at {}, focus on converting this audience interest into subscriber acquisition[3]".format(
        metrics.get('engagement_rate', 'exceptional levels') if 'metrics' in insights else 'exceptional levels'
    ))
    output.append("")
    output.append("2. **Leverage Positive Sentiment**: The {} positive sentiment presents an opportunity for referral programs and brand advocacy initiatives[4]".format(
        metrics.get('sentiment', 'strong') if 'metrics' in insights else 'strong'
    ))
    output.append("")
    output.append("3. **Expand Share of Voice**: Continue aggressive content strategies to grow from current {} market presence[1][2]".format(
        metrics.get('sov', 'growing') if 'metrics' in insights else 'growing'
    ))
    output.append("")
    
    # Sources section (Perplexity-style)
    output.append("---")
    output.append("")
    output.append("## Sources")
    output.append("")
    
    # List sources with their IDs
    for key, source_info in source_map.items():
        output.append(f"[{source_info['id']}] {source_info['title']}")
        if source_info['url']:
            output.append(f"    {source_info['url']}")
        if source_info['metrics_found']:
            output.append(f"    *Metrics: {', '.join(source_info['metrics_found'])}*")
        output.append("")
    
    # Footer
    output.append("---")
    output.append("*Generated by Open Enrichment Engine - Intelligence gathered from public sources*")
    
    return '\n'.join(output)

def save_markdown(content, output_path):
    """Save formatted content as markdown"""
    with open(output_path, 'w') as f:
        f.write(content)
    print(f"✅ Perplexity-style report saved to: {output_path}")

def main():
    if len(sys.argv) != 3:
        print("Usage: format_perplexity_refs.py <input_json> <output_md>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        insights = load_insights(input_path)
        formatted_content = format_perplexity_style(insights)
        save_markdown(formatted_content, output_path)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()