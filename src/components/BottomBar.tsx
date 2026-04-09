import { Save, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRef, useEffect, useState, useCallback } from 'react';

const BottomBar = () => {
  const { activeTab, setActiveTab, showRightPanel, setShowRightPanel } = useStore();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <footer className="h-12 flex items-center justify-between px-4 border-t border-thin bg-background shrink-0">
      {/* Left: Tab buttons */}
      <div className="flex items-center rounded-full border border-border overflow-hidden">
        <button
          onClick={() => setActiveTab('3d')}
          className={`px-4 py-1.5 text-xs font-medium transition-all ${
            activeTab === '3d'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          Édition 3D
        </button>
        <button
          onClick={() => setActiveTab('2d')}
          className={`px-4 py-1.5 text-xs font-medium border-x border-border transition-all ${
            activeTab === '2d'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          Édition 2D
        </button>
        <button
          onClick={() => setActiveTab('bat')}
          className={`px-4 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'bat'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          Aperçu BAT
        </button>
      </div>

      {/* Center: Save & Share */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            // Trigger save from TopBar's handler via a custom event
            document.dispatchEvent(new CustomEvent('ecocup-save'));
          }}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Sauvegarder"
        >
          <Save size={18} />
          <span className="text-[10px]">Sauvegarder</span>
        </button>
        <button
          onClick={() => {
            document.dispatchEvent(new CustomEvent('ecocup-share'));
          }}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Partager"
        >
          <Share2 size={18} />
          <span className="text-[10px]">Partager</span>
        </button>
      </div>

      {/* Right: Récapitulatif */}
      <button
        onClick={() => setShowRightPanel(!showRightPanel)}
        className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
      >
        Récapitulatif
        {showRightPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </footer>
  );
};

export default BottomBar;
