import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import TopBar from '@/components/TopBar';
import LeftSidebar from '@/components/LeftSidebar';
import BottomBar from '@/components/BottomBar';
import RightPanel from '@/components/RightPanel';
import Editor2D from '@/components/Editor2D';
import Preview3D from '@/components/Preview3D';
import PreviewBAT from '@/components/PreviewBAT';
import { ToolPanel } from '@/components/ToolPanels';
import OnboardingTour from '@/components/OnboardingTour';

const Index = () => {
  const { activeTab, setActiveTab, tourCompleted, startTour } = useStore();

  useEffect(() => {
    if (!tourCompleted) {
      const timer = setTimeout(startTour, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <ToolPanel />
        
        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-thin px-4 bg-background">
            {([
              { id: '2d' as const, label: 'Édition 2D' },
              { id: '3d' as const, label: 'Vue 3D 360°' },
              { id: 'bat' as const, label: 'Aperçu BAT' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Canvas area */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === '2d' && <Editor2D />}
            {activeTab === '3d' && <Preview3D />}
            {activeTab === 'bat' && <PreviewBAT />}
          </div>
        </div>

        <RightPanel />
      </div>
      <BottomBar />
      <OnboardingTour />
    </div>
  );
};

export default Index;
