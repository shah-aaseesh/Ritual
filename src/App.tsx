import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { DemoBar } from './components/demo/DemoBar';
import { InstallPrompt } from './components/common/InstallPrompt';
import { HomeDashboardView } from './components/home/HomeDashboardView';
import { DocumentStoreAIView } from './components/documents/DocumentStoreAIView';
import { TodayView } from './components/today/TodayView';
import { LabelLensView } from './components/labellens/LabelLensView';
import { GymTrackerView } from './components/gym/GymTrackerView';
import { CalorieTrackerView } from './components/calories/CalorieTrackerView';
import { SmartShelfView } from './components/smartshelf/SmartShelfView';
import { RoutineView } from './components/routine/RoutineView';
import { ProgressView } from './components/progress/ProgressView';
import { RoutineRescueModal } from './components/rescue/RoutineRescueModal';

const MainLayout: React.FC = () => {
  const { profile, activeTab } = useApp();

  if (!profile.isOnboarded) {
    return (
      <div className="min-h-screen bg-[#09090D] text-white">
        <ToastContainer />
        <DemoBar />
        <InstallPrompt />
        <OnboardingFlow />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090D] flex flex-col text-white font-sans">
      <ToastContainer />
      
      {/* Reviewer Top Bar */}
      <DemoBar />

      {/* Top Header & Desktop Navigation */}
      <Header />

      {/* Main Content Area: Responsive Full Desktop Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && <HomeDashboardView />}
        {(activeTab === 'workout' || activeTab === 'gym') && <GymTrackerView />}
        {activeTab === 'calories' && <CalorieTrackerView />}
        {(activeTab === 'mythbuster' || activeTab === 'labellens') && <LabelLensView />}
        {activeTab === 'documents' && <DocumentStoreAIView />}
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'smartshelf' && <SmartShelfView />}
        {activeTab === 'routine' && <RoutineView />}
        {activeTab === 'progress' && <ProgressView />}
      </main>

      {/* Mobile-only Bottom Navigation */}
      <BottomNav />
      <InstallPrompt />
      <RoutineRescueModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
