import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import html2canvas from 'html2canvas';
import TopBar from '@/components/TopBar';
import ToolBar from '@/components/ToolBar';
import LeftSidebar from '@/components/LeftSidebar';
import BottomBar from '@/components/BottomBar';
import RightPanel from '@/components/RightPanel';
import Editor2D from '@/components/Editor2D';
import Preview3D from '@/components/Preview3D';
import PreviewBAT from '@/components/PreviewBAT';
import CartPanel from '@/components/CartPanel';
import OnboardingTour from '@/components/OnboardingTour';
import WarningModal from '@/components/WarningModal';
import SaveModal from '@/components/SaveModal';
import AIWizardModal from '@/components/AIWizardModal';
import { useIsMobile } from '@/hooks/use-mobile';

const DEFAULT_NAME = 'Gobelet personnalisé par vos soins – ECO 30 Digital';

const Index = () => {
  const { activeTab, startTour, currentDesign } = useStore();
  const isMobile = useIsMobile();
  const [showWarning, setShowWarning] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  // Intercept save events — show modal if name is default, else save directly
  useEffect(() => {
    const handler = () => {
      const design = useStore.getState().currentDesign;
      if (design.name === DEFAULT_NAME || !design.name.trim()) {
        setShowSaveModal(true);
      } else {
        document.dispatchEvent(new CustomEvent('ecocup-do-save'));
      }
    };
    document.addEventListener('ecocup-save', handler);
    return () => document.removeEventListener('ecocup-save', handler);
  }, []);

  const handleWarningClose = () => {
    setShowWarning(false);
    setTimeout(startTour, 400);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <ToolBar onExportPNG={handleExportPNG} onOpenAIWizard={() => setShowAIWizard(true)} />

      <div className="flex-1 flex overflow-hidden">
        {!isMobile && <LeftSidebar onOpenAIWizard={() => setShowAIWizard(true)} />}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex overflow-hidden">
            {activeTab === '2d' && <Editor2D onEditWithAI={(id) => { setAiEditElementId(id); setShowAIWizard(true); }} />}
            {activeTab === '3d' && <Preview3D />}
            {activeTab === 'bat' && <PreviewBAT />}
          </div>
        </div>

        <RightPanel />
      </div>

      <BottomBar />

      {isMobile && <LeftSidebar onOpenAIWizard={() => setShowAIWizard(true)} />}

      <WarningModal open={showWarning} onClose={handleWarningClose} />
      <OnboardingTour />
      <CartPanel />
      <SaveModal open={showSaveModal} onClose={() => setShowSaveModal(false)} />
      <AIWizardModal open={showAIWizard} onClose={() => { setShowAIWizard(false); setAiEditElementId(null); }} editElementId={aiEditElementId} />
    </div>
  );
};

export default Index;
