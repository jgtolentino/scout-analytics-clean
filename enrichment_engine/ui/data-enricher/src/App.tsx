import React from 'react';
import { Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
import { StepContent } from './components/StepContent';
import { ResultsPanel } from './components/ResultsPanel';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { useEnrichmentStore } from './store/enrichmentStore';

function App() {
  const { currentStep } = useEnrichmentStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Workflow Steps */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <WorkflowStepper />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          <div className="flex-1 overflow-y-auto">
            <StepContent step={currentStep} />
          </div>

          {/* Right Panel - Results/Logs */}
          <div className="w-96 bg-white border-l border-gray-200">
            <ResultsPanel />
          </div>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}

export default App;