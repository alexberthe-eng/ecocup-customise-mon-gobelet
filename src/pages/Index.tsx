import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
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
import AIWizardModal from '@/components/AIWizardModal';
import { useIsMobile, useIsDesktop } from '@/hooks/use-mobile';

const Index = () => {
  const { activeTab, tourCompleted, startTour, gridVisible, setGridVisible, currentDesign } = useStore();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [showWarning, setShowWarning] = useState(true);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [aiEditElementId, setAiEditElementId] = useState<string | null>(null);

  const handleExportPNG = async () => {
    const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
    if (!canvasEl) return;
    const canvas = await html2canvas(canvasEl, {
      backgroundColor: currentDesign.cupColor,
      useCORS: true,
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = `design_${currentDesign.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWarningClose = () => {
    setShowWarning(false);
    setTimeout(startTour, 400);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar (hidden on mobile — toolbar is at bottom) */}
        {!isMobile && <LeftSidebar onOpenAIWizard={() => setShowAIWizard(true)} />}

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top toolbar for 2D mode */}
          {activeTab === '2d' && (
            <div className="flex items-center justify-end border-b border-thin px-2 md:px-4 bg-background shrink-0 py-1.5 gap-2">
              <button
                onClick={handleExportPNG}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <Download size={12} />
                PNG
              </button>
              <ToggleSwitch label="Grille" checked={gridVisible} onChange={setGridVisible} />
            </div>
          )}

          {/* Canvas area */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === '2d' && <Editor2D onEditWithAI={(id) => { setAiEditElementId(id); setShowAIWizard(true); }} />}
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
      {isMobile && <LeftSidebar onOpenAIWizard={() => setShowAIWizard(true)} />}

      <WarningModal open={showWarning} onClose={handleWarningClose} />
      <OnboardingTour />
      <CartPanel />
      <AIWizardModal open={showAIWizard} onClose={() => { setShowAIWizard(false); setAiEditElementId(null); }} editElementId={aiEditElementId} />
    </div>
  );
};

export default Index;
