#!/usr/bin/env python3
"""
Open MCP Scraper - Custom Web Intelligence Engine
Replaces proprietary tools like Meltwater, SimilarWeb, Statista with open-source scraping
"""

import sys
import asyncio
import argparse
import json
import re
from urllib.parse import quote_plus
from bs4 import BeautifulSoup
import aiohttp
from datetime import datetime

class OpenMCPScraper:
    def __init__(self):
        self.user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_duckduckgo(self, query, max_results=10):
        """Search DuckDuckGo for open intelligence"""
        search_url = f"https://duckduckgo.com/html/?q={quote_plus(query)}"
        headers = {"User-Agent": self.user_agent}
        
        try:
            async with self.session.get(search_url, headers=headers) as response:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                results = []
                for result in soup.select('.result__body')[:max_results]:
                    title_elem = result.select_one('.result__title a')
                    snippet_elem = result.select_one('.result__snippet')
                    
                    if title_elem and snippet_elem:
                        results.append({
                            'title': title_elem.get_text(strip=True),
                            'url': title_elem.get('href', ''),
                            'snippet': snippet_elem.get_text(strip=True)
                        })
                
                return results
        except Exception as e:
            print(f"DuckDuckGo search error: {e}")
            return []
    
    async def extract_metrics(self, text, fields):
        """Extract specific metrics from text using pattern matching"""
        metrics = {}
        text_lower = text.lower()
        
        # SOV (Share of Voice) patterns
        if 'sov' in fields or 'share of voice' in fields:
            sov_patterns = [
                r'share.{0,10}voice.{0,10}(\d+\.?\d*)%',
                r'sov.{0,10}(\d+\.?\d*)%',
                r'market.{0,10}share.{0,10}(\d+\.?\d*)%'
            ]
            for pattern in sov_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    metrics['sov'] = f"{match.group(1)}%"
                    break
        
        # Mentions patterns
        if 'mentions' in fields:
            mention_patterns = [
                r'(\d+(?:,\d+)*)\s*mentions',
                r'mentioned\s*(\d+(?:,\d+)*)\s*times',
                r'(\d+(?:,\d+)*)\s*social\s*mentions'
            ]
            for pattern in mention_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    metrics['mentions'] = match.group(1)
                    break
        
        # Engagement Rate patterns
        if 'engagement_rate' in fields or 'er' in fields:
            er_patterns = [
                r'engagement.{0,10}rate.{0,10}(\d+\.?\d*)%',
                r'er.{0,10}(\d+\.?\d*)%',
                r'(\d+\.?\d*)%.{0,10}engagement'
            ]
            for pattern in er_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    metrics['engagement_rate'] = f"{match.group(1)}%"
                    break
        
        # Sentiment patterns
        if 'sentiment' in fields:
            sentiment_patterns = [
                r'positive.{0,10}sentiment.{0,10}(\d+\.?\d*)%',
                r'(\d+\.?\d*)%.{0,10}positive',
                r'sentiment.{0,10}score.{0,10}(\d+\.?\d*)'
            ]
            for pattern in sentiment_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    metrics['sentiment'] = f"{match.group(1)}%"
                    break
        
        # ROI patterns
        if 'roi' in fields:
            roi_patterns = [
                r'roi.{0,10}(\d+\.?\d*)%',
                r'return.{0,10}investment.{0,10}(\d+\.?\d*)%',
                r'(\d+\.?\d*)%.{0,10}roi'
            ]
            for pattern in roi_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    metrics['roi'] = f"{match.group(1)}%"
                    break
        
        # Hashtags
        if 'hashtags' in fields:
            hashtag_pattern = r'#\w+'
            hashtags = re.findall(hashtag_pattern, text)
            if hashtags:
                metrics['hashtags'] = list(set(hashtags[:10]))  # Top 10 unique
        
        return metrics
    
    async def scrape_intelligence(self, query, fields, max_results=5, verbose=True):
        """Main scraping function"""
        if verbose:
            print(f"🔍 Searching for: {query}")
            print(f"📊 Fields: {fields}")
        
        search_results = await self.search_duckduckgo(query, max_results)
        
        if not search_results:
            return {"error": "No search results found", "query": query}
        
        all_metrics = {}
        enriched_data = {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "sources": [],
            "metrics": {},
            "insights": []
        }
        
        for i, result in enumerate(search_results):
            if verbose:
                print(f"📄 Processing result {i+1}: {result['title'][:60]}...")
            
            # Extract metrics from title and snippet
            combined_text = f"{result['title']} {result['snippet']}"
            metrics = await self.extract_metrics(combined_text, fields)
            
            if metrics:
                enriched_data["sources"].append({
                    "title": result['title'],
                    "url": result['url'],
                    "metrics_found": list(metrics.keys())
                })
                
                # Merge metrics
                for key, value in metrics.items():
                    if key not in all_metrics:
                        all_metrics[key] = []
                    all_metrics[key].append(value)
        
        # Consolidate metrics
        for field, values in all_metrics.items():
            if values:
                enriched_data["metrics"][field] = values[0] if len(values) == 1 else values
        
        # Generate insights
        if enriched_data["metrics"]:
            enriched_data["insights"] = self.generate_insights(enriched_data["metrics"], query)
        
        return enriched_data
    
    def generate_insights(self, metrics, query):
        """Generate human-readable insights from extracted metrics"""
        insights = []
        
        # Extract brand/company from query
        brand = query.split()[0] if query else "Brand"
        
        if 'sov' in metrics:
            insights.append(f"📈 {brand}'s Share of Voice: {metrics['sov']}")
        
        if 'mentions' in metrics:
            insights.append(f"💬 Social Mentions: {metrics['mentions']} detected")
        
        if 'engagement_rate' in metrics:
            insights.append(f"🎯 Engagement Rate: {metrics['engagement_rate']}")
        
        if 'sentiment' in metrics:
            insights.append(f"😊 Positive Sentiment: {metrics['sentiment']}")
        
        if 'roi' in metrics:
            insights.append(f"💰 ROI Performance: {metrics['roi']}")
        
        if 'hashtags' in metrics:
            top_hashtags = metrics['hashtags'][:5] if isinstance(metrics['hashtags'], list) else []
            if top_hashtags:
                insights.append(f"🏷️ Top Hashtags: {', '.join(top_hashtags)}")
        
        return insights

async def main():
    parser = argparse.ArgumentParser(description="Open MCP Scraper - Custom Web Intelligence")
    parser.add_argument("--query", required=True, help="Search query for intelligence gathering")
    parser.add_argument("--fields", nargs="+", required=True, 
                       help="Fields to extract: sov, mentions, engagement_rate, sentiment, roi, hashtags")
    parser.add_argument("--max-results", type=int, default=5, help="Maximum search results to process")
    parser.add_argument("--output", choices=['json', 'text'], default='text', help="Output format")
    
    args = parser.parse_args()
    
    async with OpenMCPScraper() as scraper:
        results = await scraper.scrape_intelligence(
            args.query, 
            [field.lower() for field in args.fields], 
            args.max_results,
            verbose=(args.output != 'json')
        )
        
        if args.output == 'json':
            print(json.dumps(results, indent=2))
        else:
            print("\n" + "="*60)
            print(f"🧠 OPEN INTELLIGENCE REPORT")
            print("="*60)
            print(f"Query: {results['query']}")
            print(f"Timestamp: {results['timestamp']}")
            print(f"Sources Processed: {len(results.get('sources', []))}")
            
            if results.get('insights'):
                print("\n📊 KEY INSIGHTS:")
                for insight in results['insights']:
                    print(f"  • {insight}")
            
            if results.get('metrics'):
                print(f"\n📈 RAW METRICS:")
                for field, value in results['metrics'].items():
                    print(f"  • {field.upper()}: {value}")
            
            print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(main())