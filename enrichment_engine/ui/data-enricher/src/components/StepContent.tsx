import React from 'react';
import { WorkflowStep } from '../store/enrichmentStore';
import { DataInputStep } from './steps/DataInputStep';
import { EnrichmentConfigStep } from './steps/EnrichmentConfigStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { ResultsStep } from './steps/ResultsStep';

interface StepContentProps {
  step: WorkflowStep;
}

export const StepContent: React.FC<StepContentProps> = ({ step }) => {
  switch (step) {
    case 'data_input':
      return <DataInputStep />;
    case 'enrichment_config':
      return <EnrichmentConfigStep />;
    case 'processing':
      return <ProcessingStep />;
    case 'results':
      return <ResultsStep />;
    default:
      return null;
  }
};