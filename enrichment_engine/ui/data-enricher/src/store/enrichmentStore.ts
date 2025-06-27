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
      completedSteps: [...new Set([...state.completedSteps, step])],
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
    const { config, campaignData, addLog, updateProcessingState, setResults } = get();
    
    try {
      // Start processing
      set({ 
        currentStep: 'processing',
        processing: {
          isRunning: true,
          currentStage: 'Extracting base metrics',
          progress: 10,
          logs: ['Starting enrichment pipeline...'],
        }
      });

      // Simulate pipeline stages
      const stages = [
        { name: 'Extracting base metrics', progress: 20 },
        { name: 'Gathering web intelligence', progress: 40 },
        { name: 'Loading benchmarks', progress: 60 },
        { name: 'Analyzing data', progress: 80 },
        { name: 'Generating insights', progress: 100 },
      ];

      for (const stage of stages) {
        updateProcessingState({
          currentStage: stage.name,
          progress: stage.progress,
        });
        addLog(`${stage.name}...`);
        
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Mock results
      const mockResults: EnrichmentResults = {
        metrics: [
          {
            name: 'Share of Voice',
            originalValue: '15%',
            enrichedValue: '21.7%',
            change: 44.7,
            sources: ['1', '2'],
          },
          {
            name: 'Engagement Rate',
            originalValue: '85%',
            enrichedValue: '116.95%',
            change: 37.6,
            sources: ['3'],
          },
          {
            name: 'Sentiment Score',
            originalValue: '75%',
            enrichedValue: '86.7%',
            change: 15.6,
            sources: ['4'],
          },
        ],
        insights: [
          "Campaign outperformed industry benchmarks by 41.8x",
          "Share of Voice increased 7% quarter-over-quarter",
          "Positive sentiment exceeds competitor average by 18%",
        ],
        references: [
          {
            id: 1,
            title: 'Industry Market Analysis Q2 2024',
            url: 'https://example.com/analysis',
            metricsFound: ['sov', 'roi'],
          },
          {
            id: 2,
            title: 'Competitive Intelligence Report',
            url: 'https://example.com/competitive',
            metricsFound: ['sov', 'mentions'],
          },
          {
            id: 3,
            title: 'Social Media Engagement Study',
            url: 'https://example.com/engagement',
            metricsFound: ['engagement_rate'],
          },
          {
            id: 4,
            title: 'Brand Sentiment Analysis',
            url: 'https://example.com/sentiment',
            metricsFound: ['sentiment'],
          },
        ],
      };

      setResults(mockResults);
      set({ 
        currentStep: 'results',
        completedSteps: ['data_input', 'enrichment_config', 'processing', 'results'],
      });
      addLog('✅ Enrichment pipeline completed successfully!');
      
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      updateProcessingState({
        isRunning: false,
        currentStage: 'Error occurred',
      });
    }
  },
}));