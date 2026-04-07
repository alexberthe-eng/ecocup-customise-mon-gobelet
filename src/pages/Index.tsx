import { useState } from 'react';
import { useStore } from '@/store/useStore';
import TopBar from '@/components/TopBar';
import LeftSidebar from '@/components/LeftSidebar';
import BottomBar from '@/components/BottomBar';
import RightPanel from '@/components/RightPanel';
import Editor2D from '@/components/Editor2D';
import Preview3D from '@/components/Preview3D';
import PreviewBAT from '@/components/PreviewBAT';
import CartPanel from '@/components/CartPanel';
import OnboardingTour from '@/components/OnboardingTour';
import ToggleSwitch from '@/components/ToggleSwitch';
import WarningModal from '@/components/WarningModal';
import AssistantPopup from '@/components/AssistantPopup';
import { useIsMobile, useIsDesktop } from '@/hooks/use-mobile';

const Index = () => {
  const { activeTab, setActiveTab, tourCompleted, startTour, gridVisible, setGridVisible } = useStore();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [showWarning, setShowWarning] = useState(true);

  const handleWarningClose = () => {
    setShowWarning(false);
    setTimeout(startTour, 400);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar (hidden on mobile — toolbar is at bottom) */}
        {!isMobile && <LeftSidebar />}

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tab bar */}
          <div className="flex items-center border-b border-thin px-2 md:px-4 bg-background overflow-x-auto shrink-0 gap-3">
            {/* 2D/3D toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5 border border-border" data-tour="tabs-2d-3d">
              <button
                onClick={() => setActiveTab('2d')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === '2d'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isMobile ? '2D' : 'Édition 2D'}
              </button>
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === '3d'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isMobile ? '3D' : 'Vue 3D 360°'}
              </button>
            </div>

            {/* BAT tab */}
            <button
              data-tour="tab-bat"
              onClick={() => setActiveTab('bat')}
              className={`px-3 md:px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'bat'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {isMobile ? 'BAT' : 'Aperçu BAT'}
            </button>

            {activeTab === '2d' && (
              <div className="ml-auto shrink-0">
                <ToggleSwitch label="Grille" checked={gridVisible} onChange={setGridVisible} />
              </div>
            )}
          </div>

          {/* Canvas area */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === '2d' && <Editor2D />}
            {activeTab === '3d' && <Preview3D />}
            {activeTab === 'bat' && <PreviewBAT />}
          </div>
        </div>

        {/* Desktop right panel (on mobile/tablet it's an overlay triggered by cart button) */}
        <RightPanel />
      </div>

      {/* Desktop bottom bar */}
      <BottomBar />

      {/* Mobile bottom toolbar */}
      {isMobile && <LeftSidebar />}

      <WarningModal open={showWarning} onClose={handleWarningClose} />
      <OnboardingTour />
      <CartPanel />
    </div>
  );
};

export default Index;
