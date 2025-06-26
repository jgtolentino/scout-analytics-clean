#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agent grading criteria
const CRITERIA = {
  hasCodeGeneration: { weight: 0.35, required: true },
  hasDeployment: { weight: 0.25, required: true },
  hasAgentIntegration: { weight: 0.20, required: true },
  hasMemory: { weight: 0.10, required: false },
  hasTracing: { weight: 0.10, required: false }
};

// Grade a single agent
async function gradeAgent(agentPath) {
  const agentFile = await fs.readFile(agentPath, 'utf-8');
  const agentDir = path.dirname(agentPath);
  
  const scores = {
    hasCodeGeneration: false,
    hasDeployment: false,
    hasAgentIntegration: false,
    hasMemory: false,
    hasTracing: false
  };

  // Check for code generation capabilities
  if (agentFile.includes('template') || agentFile.includes('scaffold') || agentFile.includes('generate')) {
    const templatesExist = await fs.access(path.join(agentDir, 'templates')).then(() => true).catch(() => false);
    const scaffoldsExist = await fs.access(path.join(agentDir, 'scaffolds')).then(() => true).catch(() => false);
    scores.hasCodeGeneration = templatesExist || scaffoldsExist;
  }

  // Check for deployment capabilities
  scores.hasDeployment = agentFile.includes('deploy') || agentFile.includes('vercel') || agentFile.includes('azure');

  // Check for agent integration
  scores.hasAgentIntegration = agentFile.includes('next_step') || agentFile.includes('hooks') || agentFile.includes('agent:');

  // Check for memory/RAG capabilities
  scores.hasMemory = agentFile.includes('memory') || agentFile.includes('remember') || agentFile.includes('recall');

  // Check for tracing/logging
  scores.hasTracing = agentFile.includes('trace') || agentFile.includes('devstral') || agentFile.includes('log');

  // Calculate final score
  let totalScore = 0;
  let passedRequired = true;

  for (const [criterion, value] of Object.entries(scores)) {
    if (value) {
      totalScore += CRITERIA[criterion].weight;
    } else if (CRITERIA[criterion].required) {
      passedRequired = false;
    }
  }

  return {
    path: agentPath,
    scores,
    totalScore,
    passedRequired,
    grade: passedRequired && totalScore >= 0.7 ? 'PRODUCTION' : 'TOY'
  };
}

// Find all agent YAML files
async function findAgentFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      return findAgentFiles(res);
    } else if (entry.isFile() && (entry.name === 'agent.yaml' || entry.name.endsWith('-agent.yaml'))) {
      return res;
    }
    return null;
  }));
  return files.flat().filter(Boolean);
}

// Main execution
async function main() {
  console.log('= Scanning for agents...\n');
  
  const rootDir = path.resolve(__dirname, '..');
  const agentFiles = await findAgentFiles(rootDir);
  
  console.log(`Found ${agentFiles.length} agents to grade\n`);
  
  const results = [];
  
  for (const agentFile of agentFiles) {
    const result = await gradeAgent(agentFile);
    results.push(result);
    
    const relPath = path.relative(rootDir, agentFile);
    console.log(`${result.grade === 'PRODUCTION' ? '' : 'L'} ${relPath}`);
    console.log(`   Score: ${(result.totalScore * 100).toFixed(0)}%`);
    console.log(`   Code Gen: ${result.scores.hasCodeGeneration ? '' : ''}`);
    console.log(`   Deploy: ${result.scores.hasDeployment ? '' : ''}`);
    console.log(`   Integration: ${result.scores.hasAgentIntegration ? '' : ''}`);
    console.log(`   Memory: ${result.scores.hasMemory ? '' : ''}`);
    console.log(`   Tracing: ${result.scores.hasTracing ? '' : ''}\n`);
  }
  
  // Summary
  const productionReady = results.filter(r => r.grade === 'PRODUCTION').length;
  const toys = results.filter(r => r.grade === 'TOY').length;
  
  console.log('=Ê Summary:');
  console.log(`   Production-ready: ${productionReady}`);
  console.log(`   Toys: ${toys}`);
  console.log(`   Total: ${results.length}\n`);
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      productionReady,
      toys
    },
    agents: results.map(r => ({
      path: path.relative(rootDir, r.path),
      grade: r.grade,
      score: r.totalScore,
      criteria: r.scores
    }))
  };
  
  await fs.writeFile(
    path.join(__dirname, '..', 'agent-grade-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('=Ý Report saved to agent-grade-report.json');
}

main().catch(console.error);