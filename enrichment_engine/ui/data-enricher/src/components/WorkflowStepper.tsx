import React from 'react';
import {
  DocumentArrowUpIcon,
  SparklesIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useEnrichmentStore, WorkflowStep } from '../store/enrichmentStore';

const steps = [
  {
    id: 'data_input' as WorkflowStep,
    name: 'Data Input',
    description: 'Upload campaign metrics or connect data source',
    icon: DocumentArrowUpIcon,
  },
  {
    id: 'enrichment_config' as WorkflowStep,
    name: 'Enrichment Configuration',
    description: 'Select enrichment sources and parameters',
    icon: SparklesIcon,
  },
  {
    id: 'processing' as WorkflowStep,
    name: 'Processing',
    description: 'Run enrichment pipeline',
    icon: CpuChipIcon,
  },
  {
    id: 'results' as WorkflowStep,
    name: 'Results & Export',
    description: 'Review enriched data and export',
    icon: DocumentCheckIcon,
  },
];

export const WorkflowStepper: React.FC = () => {
  const { currentStep, completedSteps, setCurrentStep } = useEnrichmentStore();

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Workflow Steps</h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = index === 0 || completedSteps.includes(steps[index - 1].id);

          return (
            <div key={step.id}>
              <button
                onClick={() => isClickable && setCurrentStep(step.id)}
                disabled={!isClickable}
                className={clsx(
                  'w-full text-left transition-all duration-200',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={clsx(
                    'step-card',
                    isActive && 'active',
                    isCompleted && 'completed'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive && 'bg-primary-100',
                        isCompleted && 'bg-success-100',
                        !isActive && !isCompleted && 'bg-gray-100'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircleSolid className="w-6 h-6 text-success-600" />
                      ) : (
                        <step.icon
                          className={clsx(
                            'w-6 h-6',
                            isActive ? 'text-primary-600' : 'text-gray-600'
                          )}
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {index + 1}. {step.name}
                        </h3>
                        {isCompleted && (
                          <CheckCircleIcon className="w-4 h-4 text-success-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="ml-5 my-2">
                  <div
                    className={clsx(
                      'w-0.5 h-8 transition-colors duration-200',
                      isCompleted ? 'bg-success-500' : 'bg-gray-300'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Runs Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Runs</h3>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <p className="text-sm font-medium text-gray-900">DITO Campaign Q2</p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <p className="text-sm font-medium text-gray-900">Globe Independence Day</p>
            <p className="text-xs text-gray-500">Yesterday</p>
          </div>
        </div>
      </div>
    </div>
  );
};