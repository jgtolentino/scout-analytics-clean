import { create } from 'zustand';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  apiEndpoint?: string;
  status: 'active' | 'inactive' | 'training';
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  agentId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
}

interface AppState {
  // UI State
  activeView: 'chat' | 'agents' | 'code';
  setActiveView: (view: 'chat' | 'agents' | 'code') => void;
  
  // Agents
  agents: Agent[];
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;
  addAgent: (agent: Agent) => void;
  
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  
  // Code Editor
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
  openFiles: string[];
  addOpenFile: (file: string) => void;
  removeOpenFile: (file: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // UI State
  activeView: 'chat',
  setActiveView: (view) => set({ activeView: view }),
  
  // Agents
  agents: [
    {
      id: '1',
      name: 'Code Assistant',
      description: 'General purpose coding assistant',
      capabilities: ['code-generation', 'debugging', 'refactoring'],
      status: 'active',
    },
    {
      id: '2',
      name: 'API Builder',
      description: 'Specialized in building REST APIs',
      capabilities: ['api-design', 'database-schema', 'authentication'],
      status: 'active',
    },
  ],
  activeAgent: null,
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  
  // Conversations
  conversations: [],
  activeConversation: null,
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      ),
    })),
  
  // Code Editor
  activeFile: null,
  setActiveFile: (file) => set({ activeFile: file }),
  openFiles: [],
  addOpenFile: (file) =>
    set((state) => ({
      openFiles: state.openFiles.includes(file)
        ? state.openFiles
        : [...state.openFiles, file],
    })),
  removeOpenFile: (file) =>
    set((state) => ({
      openFiles: state.openFiles.filter((f) => f !== file),
    })),
}));