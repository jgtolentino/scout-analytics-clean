#!/usr/bin/env python3
import sys, json
from fpdf import FPDF

def load_insights(path):
    with open(path) as f:
        return json.load(f)

def generate_pdf(insights, output):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", 'B', 16)
    pdf.cell(0, 10, "Campaign Enrichment Insights", ln=True, align="C")
    pdf.ln(5)
    pdf.set_font("Helvetica", size=12)
    
    # Handle nested structure from scraper output
    if isinstance(insights, dict):
        # Add timestamp if available
        if 'timestamp' in insights:
            pdf.set_font("Helvetica", 'I', 10)
            pdf.cell(0, 8, f"Generated: {insights['timestamp']}", ln=True)
            pdf.ln(3)
        
        # Add query information
        if 'query' in insights:
            pdf.set_font("Helvetica", 'B', 14)
            pdf.cell(0, 8, "Search Query", ln=True)
            pdf.set_font("Helvetica", size=11)
            pdf.multi_cell(0, 6, str(insights['query']))
            pdf.ln(4)
        
        # Add metrics if available
        if 'metrics' in insights and insights['metrics']:
            pdf.set_font("Helvetica", 'B', 14)
            pdf.cell(0, 8, "Extracted Metrics", ln=True)
            pdf.set_font("Helvetica", size=11)
            for metric, value in insights['metrics'].items():
                pdf.cell(0, 6, f"- {metric}: {value}", ln=True)
            pdf.ln(4)
        
        # Add insights if available
        if 'insights' in insights and insights['insights']:
            pdf.set_font("Helvetica", 'B', 14)
            pdf.cell(0, 8, "Key Insights", ln=True)
            pdf.set_font("Helvetica", size=11)
            for insight in insights['insights']:
                pdf.multi_cell(0, 6, f"- {insight}")
            pdf.ln(4)
        
        # Add sources if available
        if 'sources' in insights and insights['sources']:
            pdf.set_font("Helvetica", 'B', 14)
            pdf.cell(0, 8, "Data Sources", ln=True)
            pdf.set_font("Helvetica", size=11)
            for source in insights['sources']:
                pdf.multi_cell(0, 6, f"- {source['title']}")
            pdf.ln(4)
    
    pdf.output(output)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: export_insights_to_pdf.py <input_json> <output_pdf>")
        sys.exit(1)
    insights = load_insights(sys.argv[1])
    generate_pdf(insights, sys.argv[2])