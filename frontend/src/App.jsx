import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import DeployModal from './components/DeployModal';
import CommandView from './views/CommandView';
import AgentsView from './views/AgentsView';
import AnalyticsView from './views/AnalyticsView';
import SecurityView from './views/SecurityView';
import VaultView from './views/VaultView';

function AppContent() {
  const { currentView, deployModalOpen, sidebarOpen } = useApp();

  const VIEW_MAP = {
    command: CommandView,
    agents: AgentsView,
    analytics: AnalyticsView,
    security: SecurityView,
    vault: VaultView,
  };

  const ActiveView = VIEW_MAP[currentView] ?? CommandView;
  const isCommand = currentView === 'command';

  return (
    <div className="dark min-h-screen flex">
      <TopAppBar mobileOnly />
      <Sidebar />

      <main className={`flex-1 pt-16 md:pt-0 h-screen overflow-hidden flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? 'md:ml-[260px]' : 'md:ml-0'}`}>
        <TopAppBar />
        <div className={`flex-1 ${isCommand ? 'overflow-hidden' : 'overflow-y-auto'} p-6 md:p-8 custom-scroll`}>
          <div className={`${isCommand ? 'h-full' : ''}`}>
            <ActiveView />
          </div>
        </div>
      </main>

      {deployModalOpen && <DeployModal />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
