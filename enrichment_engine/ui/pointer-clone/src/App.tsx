import React, { useState } from 'react';
import { PointerHeader } from './components/PointerHeader';
import { PointerSidebar } from './components/PointerSidebar';
import { WorkspaceView } from './components/WorkspaceView';

function App() {
  const [activeView, setActiveView] = useState('settings');

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PointerHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <PointerSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 arrow-pattern overflow-auto">
          {activeView === 'settings' && <WorkspaceView />}
          {activeView === 'home' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Home View</p>
            </div>
          )}
          {activeView === 'explore' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Explore View</p>
            </div>
          )}
          {/* Other views can be added here */}
        </main>
      </div>
    </div>
  );
}

export default App;