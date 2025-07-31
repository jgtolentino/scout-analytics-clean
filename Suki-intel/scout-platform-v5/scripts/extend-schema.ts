#!/usr/bin/env ts-node

/**
 * Schema Extension Tool
 * Helps extend dashboard schema with new components
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtensionConfig {
  section: string;
  component: {
    type: string;
    id: string;
    label: string;
    config?: any;
    actions?: any[];
  };
}

class SchemaExtender {
  private schemaPath: string;

  constructor() {
    this.schemaPath = path.join(__dirname, '../ui-contracts/dashboard-schema.json');
  }

  public addComponent(config: ExtensionConfig): void {
    const schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf-8'));
    
    // Find the section
    const section = schema.sections.find((s: any) => s.key === config.section);
    
    if (!section) {
      console.error(`❌ Section "${config.section}" not found`);
      return;
    }
    
    // Initialize components array if it doesn't exist
    if (!section.components) {
      section.components = [];
    }
    
    // Check if component ID already exists
    const exists = section.components.some((c: any) => c.id === config.component.id);
    
    if (exists) {
      console.error(`❌ Component with ID "${config.component.id}" already exists`);
      return;
    }
    
    // Add the component
    section.components.push(config.component);
    
    // Save the schema
    fs.writeFileSync(this.schemaPath, JSON.stringify(schema, null, 2));
    
    console.log(`✅ Added component "${config.component.type}" to section "${config.section}"`);
  }

  public addSection(sectionConfig: any): void {
    const schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf-8'));
    
    // Check if section already exists
    const exists = schema.sections.some((s: any) => s.key === sectionConfig.key);
    
    if (exists) {
      console.error(`❌ Section "${sectionConfig.key}" already exists`);
      return;
    }
    
    schema.sections.push(sectionConfig);
    
    fs.writeFileSync(this.schemaPath, JSON.stringify(schema, null, 2));
    
    console.log(`✅ Added section "${sectionConfig.key}"`);
  }

  public listComponents(): void {
    const schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf-8'));
    
    console.log('📋 Current Dashboard Components:\n');
    
    schema.sections.forEach((section: any) => {
      console.log(`📁 Section: ${section.key}`);
      
      if (section.components) {
        section.components.forEach((component: any) => {
          console.log(`  └─ ${component.type} (${component.id})`);
        });
      } else {
        console.log('  └─ No components');
      }
      
      console.log('');
    });
  }
}

// Example usage patterns
const examples = {
  'add-heatmap': {
    section: 'store_analytics',
    component: {
      type: 'heatmap',
      id: 'store_heatmap',
      label: 'Store Performance Heatmap',
      config: {
        data_source: 'stores',
        metrics: ['revenue', 'foot_traffic'],
        dimensions: ['hour', 'day_of_week'],
        color_scale: 'sequential'
      },
      actions: [
        { label: 'Export Image', variant: 'secondary' },
        { label: 'Configure View', variant: 'primary' }
      ]
    }
  },
  
  'add-forecast': {
    section: 'ai_insights',
    component: {
      type: 'forecast_chart',
      id: 'revenue_forecast',
      label: 'Revenue Forecast (AI-Powered)',
      config: {
        data_source: 'forecasts',
        prediction_horizon: '90d',
        confidence_intervals: true,
        model_type: 'prophet'
      }
    }
  },
  
  'add-alert-center': {
    section: 'ai_insights',
    component: {
      type: 'alert_center',
      id: 'system_alerts',
      label: 'System Alerts & Notifications',
      config: {
        data_source: 'alerts',
        severity_filter: ['high', 'medium'],
        auto_refresh: 30000
      }
    }
  }
};

// CLI Interface
const extender = new SchemaExtender();
const command = process.argv[2];
const exampleName = process.argv[3];

switch (command) {
  case 'list':
    extender.listComponents();
    break;
    
  case 'add-example':
    if (!exampleName || !examples[exampleName as keyof typeof examples]) {
      console.log('Available examples:');
      Object.keys(examples).forEach(name => {
        console.log(`  - ${name}`);
      });
      break;
    }
    
    extender.addComponent(examples[exampleName as keyof typeof examples]);
    break;
    
  case 'add-section':
    const newSection = {
      key: process.argv[3] || 'new_section',
      title: process.argv[4] || 'New Section',
      components: []
    };
    extender.addSection(newSection);
    break;
    
  default:
    console.log('Schema Extension Tool');
    console.log('\nUsage: ts-node extend-schema.ts [command] [options]');
    console.log('\nCommands:');
    console.log('  list                    - List all components in schema');
    console.log('  add-example [name]      - Add example component');
    console.log('  add-section [key] [title] - Add new section');
    console.log('\nExamples:');
    console.log('  ts-node extend-schema.ts add-example add-heatmap');
    console.log('  ts-node extend-schema.ts add-section marketing "Marketing Analytics"');
}