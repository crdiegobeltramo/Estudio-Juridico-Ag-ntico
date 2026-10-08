import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';

// Top-Level Views (Landing & Dedicated Auth Screen)
import { LandingView } from './views/LandingView.tsx';
import { AuthScreen } from './views/AuthScreen.tsx';

// Platform Views
import { DashboardView } from './views/DashboardView.tsx';
import { MultiAgentStudioView } from './views/MultiAgentStudioView.tsx';
import { AgentsGalleryView } from './views/AgentsGalleryView.tsx';
import { LegalAssistantView } from './views/LegalAssistantView.tsx';
import { RAGView } from './views/RAGView.tsx';
import { LibraryView } from './views/LibraryView.tsx';
import { LegislationView } from './views/LegislationView.tsx';
import { JurisprudenceView } from './views/JurisprudenceView.tsx';
import { CampusView } from './views/CampusView.tsx';
import { LawFirmView } from './views/LawFirmView.tsx';
import { ExpedienteView } from './views/ExpedienteView.tsx';
import { DebateView } from './views/DebateView.tsx';
import { TutorView } from './views/TutorView.tsx';
import { ResearchView } from './views/ResearchView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { SubscriptionView } from './views/SubscriptionView.tsx';

import { LegalCaseFile } from './types/index.ts';

function AppContent() {
  const { isAuthModalOpen, closeAuthModal, isFirebaseUser } = useAuth();
  
  // 3-Stage Navigation: Landing Page -> Dedicated Login/Register Screen -> Main Application
  const [appStage, setAppStage] = useState<'landing' | 'auth' | 'app'>(() => {
    const saved = localStorage.getItem('avd_stage');
    if (saved === 'app' || saved === 'auth' || saved === 'landing') {
      return saved as 'landing' | 'auth' | 'app';
    }
    return 'landing';
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCaseFile | null>(null);

  // Sync stage to localStorage
  const handleSetStage = (stage: 'landing' | 'auth' | 'app') => {
    setAppStage(stage);
    localStorage.setItem('avd_stage', stage);
  };

  const handleNavigate = (tab: NavTab) => {
    setCurrentTab(tab);
  };

  const handleAskAIAboutDoc = (docTitle: string) => {
    setCurrentTab('assistant');
  };

  const handleAskAIAboutArticle = (lawName: string, artNum: string, artText: string) => {
    setCurrentTab('assistant');
  };

  const handleAskAIAboutCase = (caseCaratula: string) => {
    setCurrentTab('assistant');
  };

  const handleSelectCase = (caseFile: LegalCaseFile) => {
    setSelectedCase(caseFile);
    setCurrentTab('expediente');
  };

  // 1. Stage: Landing Page
  if (appStage === 'landing') {
    return (
      <LandingView
        onGoToAuth={(mode = 'login') => {
          setAuthMode(mode);
          handleSetStage('auth');
        }}
        onGoToApp={() => handleSetStage('app')}
      />
    );
  }

  // 2. Stage: Dedicated Login & Register Screen (between Landing and App)
  if (appStage === 'auth') {
    return (
      <AuthScreen
        initialMode={authMode}
        onBackToLanding={() => handleSetStage('landing')}
        onEnterApp={() => handleSetStage('app')}
      />
    );
  }

  // 3. Stage: Main Legal Platform & App
  return (
    <div className="flex h-screen overflow-hidden bg-[#070d18] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onGoToLanding={() => handleSetStage('landing')}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenGlobalSearch={() => setIsSearchModalOpen(true)}
          onGoToLanding={() => handleSetStage('landing')}
        />

        {/* View Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0b1325]/70">
          {currentTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {currentTab === 'multiagent' && (
            <MultiAgentStudioView
              onOpenAgentsGallery={() => setCurrentTab('agents_catalog')}
              onConvertToCase={(newCase) => {
                setSelectedCase(newCase);
                setCurrentTab('expediente');
              }}
            />
          )}
          {currentTab === 'agents_catalog' && (
            <AgentsGalleryView
              onLaunchWithTeam={() => setCurrentTab('multiagent')}
            />
          )}
          {currentTab === 'assistant' && <LegalAssistantView />}
          {currentTab === 'rag' && <RAGView />}
          {currentTab === 'library' && <LibraryView onAskAIAboutDoc={handleAskAIAboutDoc} />}
          {currentTab === 'legislation' && <LegislationView onAskAIAboutArticle={handleAskAIAboutArticle} />}
          {currentTab === 'jurisprudence' && <JurisprudenceView onAskAIAboutCase={handleAskAIAboutCase} />}
          {currentTab === 'campus' && <CampusView />}
          {currentTab === 'lawfirm' && (
            <LawFirmView
              onSelectCase={handleSelectCase}
              onOpenMultiAgentStudio={() => setCurrentTab('multiagent')}
            />
          )}
          {currentTab === 'expediente' && <ExpedienteView initialCase={selectedCase} />}
          {currentTab === 'debate' && <DebateView />}
          {currentTab === 'tutor' && <TutorView />}
          {currentTab === 'research' && <ResearchView />}
          {currentTab === 'admin' && <AdminView />}
          {currentTab === 'subscription' && <SubscriptionView />}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Firebase Authentication Modal (Quick Profile access inside the app) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
