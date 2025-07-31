#!/usr/bin/env ts-node

/**
 * Scout Platform v5 - Component Patcher
 * Analyzes dashboard schema and generates missing components
 */

import * as fs from 'fs';
import * as path from 'path';

interface Component {
  type: string;
  id: string;
  label?: string;
  config?: any;
  actions?: any[];
}

interface Section {
  key: string;
  components?: Component[];
}

interface DashboardSchema {
  sections: Section[];
  design_tokens: any;
}

class ComponentPatcher {
  private schemaPath: string;
  private componentsDir: string;
  private schema: DashboardSchema;

  constructor() {
    this.schemaPath = path.join(__dirname, '../ui-contracts/dashboard-schema.json');
    this.componentsDir = path.join(__dirname, '../app/components/dashboard');
    this.schema = this.loadSchema();
  }

  private loadSchema(): DashboardSchema {
    const schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
    return JSON.parse(schemaContent);
  }

  private getComponentPath(componentType: string): string {
    const componentName = this.toPascalCase(componentType);
    return path.join(this.componentsDir, `${componentName}.tsx`);
  }

  private toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private componentExists(componentType: string): boolean {
    const componentPath = this.getComponentPath(componentType);
    return fs.existsSync(componentPath);
  }

  private generateComponentTemplate(component: Component): string {
    const componentName = this.toPascalCase(component.type);
    
    return `'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
${this.getChartImports(component.type)}

interface ${componentName}Props {
  id: string;
  label?: string;
  config?: ${this.getConfigInterface(component)};
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  id,
  label,
  config,
  actions,
  className
}) => {
  // TODO: Fetch data based on config.data_source
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch data from Supabase
    fetchData();
  }, [config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual data fetching
      // const response = await supabase
      //   .from(config?.data_source || '')
      //   .select('*');
      setData([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {label && (
          <h3 className="text-lg font-semibold mb-4">{label}</h3>
        )}
        
        ${this.getComponentBody(component)}
        
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={() => console.log('Action:', action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ${componentName};
`;
  }

  private getChartImports(type: string): string {
    const chartTypes: Record<string, string> = {
      'line_chart': "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
      'bar_chart': "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
      'pie_chart': "import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
      'doughnut': "import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
      'geo_map': "import dynamic from 'next/dynamic';\nconst Map = dynamic(() => import('@/components/ui/map'), { ssr: false });",
      'data_table': "import { DataTable } from '@/components/ui/data-table';"
    };
    
    return chartTypes[type] || '';
  }

  private getConfigInterface(component: Component): string {
    if (!component.config) return 'any';
    
    const configKeys = Object.keys(component.config);
    const configTypes = configKeys.map(key => {
      const value = component.config[key];
      const type = Array.isArray(value) ? 'string[]' : typeof value;
      return `    ${key}?: ${type};`;
    }).join('\n');
    
    return `{\n${configTypes}\n  }`;
  }

  private getComponentBody(component: Component): string {
    const bodies: Record<string, string> = {
      'kpi_card': `
        <div className="text-center">
          <div className="text-3xl font-bold">{config?.value || '0'}</div>
          {config?.trend && (
            <div className={\`text-sm \${config.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}\`}>
              {config.trend}
            </div>
          )}
        </div>`,
      
      'line_chart': `
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {config?.series?.map((serie: any, index: number) => (
              <Line
                key={index}
                type="monotone"
                dataKey={serie.name.toLowerCase()}
                stroke={serie.color}
                name={serie.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>`,
      
      'bar_chart': `
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3563E9" />
          </BarChart>
        </ResponsiveContainer>`,
      
      'geo_map': `
        <div className="h-96">
          <Map data={data} config={config} />
        </div>`,
      
      'data_table': `
        <DataTable
          columns={config?.columns || []}
          data={data}
          pagination={config?.pagination}
          pageSize={config?.page_size || 10}
        />`,
      
      'insight_card': `
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={\`inline-block w-2 h-2 rounded-full bg-\${
              config?.severity === 'high' ? 'red' : 
              config?.severity === 'medium' ? 'yellow' : 'green'
            }-500\`}></span>
            <h4 className="font-semibold">{config?.title}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">{config?.description}</p>
          {config?.confidence && (
            <div className="text-xs text-gray-500">
              Confidence: {(config.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>`,
      
      'rag_chat': `
        <div className="space-y-4">
          <div className="border rounded-lg p-4 h-64 overflow-y-auto">
            {/* Chat messages would go here */}
            <p className="text-gray-500 text-center">AI Assistant Ready</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Scout AI..."
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <Button>Send</Button>
          </div>
          {config?.suggested_queries && (
            <div className="flex flex-wrap gap-2">
              {config.suggested_queries.map((query: string, index: number) => (
                <button
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
        </div>`
    };
    
    return bodies[component.type] || '<div>Component template for ' + component.type + '</div>';
  }

  public analyze(): void {
    console.log('🔍 Analyzing dashboard schema for missing components...\n');
    
    const allComponents: Component[] = [];
    const missingComponents: Component[] = [];
    const existingComponents: Component[] = [];
    
    // Extract all components from schema
    this.schema.sections.forEach(section => {
      if (section.components) {
        section.components.forEach(component => {
          allComponents.push(component);
          
          if (this.componentExists(component.type)) {
            existingComponents.push(component);
          } else {
            missingComponents.push(component);
          }
        });
      }
    });
    
    console.log(`📊 Total components in schema: ${allComponents.length}`);
    console.log(`✅ Existing components: ${existingComponents.length}`);
    console.log(`❌ Missing components: ${missingComponents.length}\n`);
    
    if (missingComponents.length > 0) {
      console.log('Missing components:');
      missingComponents.forEach(comp => {
        console.log(`  - ${comp.type} (${comp.id})`);
      });
    }
  }

  public patch(): void {
    console.log('🔧 Patching missing components...\n');
    
    // Ensure components directory exists
    if (!fs.existsSync(this.componentsDir)) {
      fs.mkdirSync(this.componentsDir, { recursive: true });
    }
    
    const missingComponents: Component[] = [];
    
    // Find missing components
    this.schema.sections.forEach(section => {
      if (section.components) {
        section.components.forEach(component => {
          if (!this.componentExists(component.type)) {
            missingComponents.push(component);
          }
        });
      }
    });
    
    // Generate missing components
    missingComponents.forEach(component => {
      const componentPath = this.getComponentPath(component.type);
      const componentCode = this.generateComponentTemplate(component);
      
      fs.writeFileSync(componentPath, componentCode);
      console.log(`✅ Generated: ${path.basename(componentPath)}`);
    });
    
    if (missingComponents.length === 0) {
      console.log('✅ All components are already implemented!');
    } else {
      console.log(`\n✅ Generated ${missingComponents.length} missing components`);
    }
  }

  public validate(): void {
    console.log('🔍 Validating component implementation...\n');
    
    const results: { component: Component; status: string; issues: string[] }[] = [];
    
    this.schema.sections.forEach(section => {
      if (section.components) {
        section.components.forEach(component => {
          const issues: string[] = [];
          let status = 'valid';
          
          if (!this.componentExists(component.type)) {
            status = 'missing';
            issues.push('Component file does not exist');
          } else {
            // TODO: Add more validation checks
            // - Check if component exports match interface
            // - Validate prop types
            // - Check data source bindings
          }
          
          results.push({ component, status, issues });
        });
      }
    });
    
    // Display results
    const missing = results.filter(r => r.status === 'missing').length;
    const valid = results.filter(r => r.status === 'valid').length;
    
    console.log(`📊 Validation Results:`);
    console.log(`  ✅ Valid: ${valid}`);
    console.log(`  ❌ Missing: ${missing}`);
    
    if (missing > 0) {
      console.log('\nRun "npm run patch:components" to generate missing components');
    }
  }
}

// CLI Interface
const command = process.argv[2];
const patcher = new ComponentPatcher();

switch (command) {
  case 'analyze':
    patcher.analyze();
    break;
  case 'patch':
    patcher.patch();
    break;
  case 'validate':
    patcher.validate();
    break;
  default:
    console.log('Scout Platform Component Patcher');
    console.log('\nUsage: ts-node patch-components.ts [command]');
    console.log('\nCommands:');
    console.log('  analyze   - Analyze schema for missing components');
    console.log('  patch     - Generate missing components');
    console.log('  validate  - Validate component implementation');
}