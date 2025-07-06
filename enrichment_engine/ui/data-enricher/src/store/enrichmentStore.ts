import { create } from 'zustand';

export type WorkflowStep = 'data_input' | 'enrichment_config' | 'processing' | 'results';

interface EnrichmentConfig {
  sources: {
    webScraping: boolean;
    benchmarks: boolean;
    competitive: boolean;
  };
  fields: string[];
  query: string;
  competitors: string[];
  industry: string;
}

interface ProcessingState {
  isRunning: boolean;
  currentStage: string;
  progress: number;
  logs: string[];
}

interface EnrichmentResults {
  metrics: Array<{
    name: string;
    originalValue: string | number;
    enrichedValue: string | number;
    change: number;
    sources: string[];
  }>;
  insights: string[];
  references: Array<{
    id: number;
    title: string;
    url: string;
    metricsFound: string[];
  }>;
}

interface EnrichmentStore {
  // Workflow State
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  setCurrentStep: (step: WorkflowStep) => void;
  markStepCompleted: (step: WorkflowStep) => void;

  // Data Input
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  campaignData: any;
  setCampaignData: (data: any) => void;

  // Enrichment Config
  config: EnrichmentConfig;
  updateConfig: (config: Partial<EnrichmentConfig>) => void;

  // Processing
  processing: ProcessingState;
  startProcessing: () => void;
  updateProcessingState: (state: Partial<ProcessingState>) => void;
  addLog: (log: string) => void;

  // Results
  results: EnrichmentResults | null;
  setResults: (results: EnrichmentResults) => void;
  exportFormat: 'pdf' | 'markdown' | 'json';
  setExportFormat: (format: 'pdf' | 'markdown' | 'json') => void;

  // Actions
  resetWorkflow: () => void;
  runEnrichmentPipeline: () => Promise<void>;
}

export const useEnrichmentStore = create<EnrichmentStore>((set, get) => ({
  // Workflow State
  currentStep: 'data_input',
  completedSteps: [],
  setCurrentStep: (step) => set({ currentStep: step }),
  markStepCompleted: (step) =>
    set((state) => ({
      completedSteps: Array.from(new Set([...state.completedSteps, step])),
    })),

  // Data Input
  uploadedFile: null,
  setUploadedFile: (file) => set({ uploadedFile: file }),
  campaignData: null,
  setCampaignData: (data) => set({ campaignData: data }),

  // Enrichment Config
  config: {
    sources: {
      webScraping: true,
      benchmarks: true,
      competitive: false,
    },
    fields: ['sov', 'sentiment', 'engagement_rate', 'roi'],
    query: '',
    competitors: [],
    industry: 'telecommunications',
  },
  updateConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  // Processing
  processing: {
    isRunning: false,
    currentStage: '',
    progress: 0,
    logs: [],
  },
  startProcessing: () =>
    set({
      processing: {
        isRunning: true,
        currentStage: 'Initializing...',
        progress: 0,
        logs: [],
      },
    }),
  updateProcessingState: (state) =>
    set((prev) => ({
      processing: { ...prev.processing, ...state },
    })),
  addLog: (log) =>
    set((state) => ({
      processing: {
        ...state.processing,
        logs: [...state.processing.logs, `[${new Date().toISOString()}] ${log}`],
      },
    })),

  // Results
  results: null,
  setResults: (results) => set({ results }),
  exportFormat: 'pdf',
  setExportFormat: (format) => set({ exportFormat: format }),

  // Actions
  resetWorkflow: () =>
    set({
      currentStep: 'data_input',
      completedSteps: [],
      uploadedFile: null,
      campaignData: null,
      results: null,
      processing: {
        isRunning: false,
        currentStage: '',
        progress: 0,
        logs: [],
      },
    }),

  runEnrichmentPipeline: async () => {
    const { config, addLog, updateProcessingState, setResults, campaignData } = get();
    
    try {
      // Start processing
      set({ 
        currentStep: 'processing',
        processing: {
          isRunning: true,
          currentStage: 'Initializing pipeline',
          progress: 5,
          logs: ['Starting enrichment pipeline...'],
        }
      });

      const jobId = campaignData?.executingJobId;
      if (!jobId) {
        throw new Error('No job ID found. Please upload and analyze a file first.');
      }

      addLog(`Starting enrichment for job: ${jobId}`);
      updateProcessingState({ currentStage: 'Executing scraping tasks', progress: 10 });

      // Monitor the executing job
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8000/status/${jobId}`);
          const job = await response.json();

          if (job.status === 'executing') {
            addLog('Scraping competitive intelligence data...');
            updateProcessingState({ progress: Math.min(get().processing.progress + 5, 80) });
          } else if (job.status === 'completed') {
            clearInterval(pollInterval);
            
            addLog('✅ Data collection completed!');
            updateProcessingState({ 
              currentStage: 'Processing results',
              progress: 90 
            });

            // Transform job results to our format
            const results: EnrichmentResults = {
              metrics: Object.entries(job.results?.data_collected || {}).map(([scraper, count]) => ({
                name: scraper.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                originalValue: 'N/A',
                enrichedValue: `${count} data points`,
                change: 0,
                sources: [scraper]
              })),
              insights: [
                `Scrapers executed: ${job.results?.scrapers_run?.join(', ') || 'None'}`,
                `Total data points collected: ${Object.values(job.results?.data_collected || {}).reduce((a: any, b: any) => a + b, 0)}`,
                `Output directory: ${job.results?.output_directory || 'N/A'}`,
                `Completed at: ${new Date().toLocaleString()}`
              ],
              references: (job.results?.scrapers_run || []).map((scraper: string, index: number) => ({
                id: index + 1,
                title: `${scraper.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Data`,
                url: job.results?.output_directory || '#',
                metricsFound: campaignData?.missingFields || []
              }))
            };
            
            setResults(results);
            updateProcessingState({ progress: 100 });
            set({ 
              currentStep: 'results',
              completedSteps: ['data_input', 'enrichment_config', 'processing', 'results'],
            });
            addLog('✅ Enrichment pipeline completed successfully!');
            
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            throw new Error(`Job failed: ${job.error}`);
          }
        } catch (error: any) {
          clearInterval(pollInterval);
          throw error;
        }
      }, 3000);

      // Fallback to clear interval after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (get().processing.isRunning) {
          addLog('⚠️ Job monitoring timed out');
          updateProcessingState({ isRunning: false });
        }
      }, 300000);

      return; // Early return since we're using polling
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      updateProcessingState({
        isRunning: false,
        currentStage: 'Error occurred',
      });
    }
  },
}));