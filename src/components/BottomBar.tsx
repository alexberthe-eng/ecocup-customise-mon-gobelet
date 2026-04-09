import { Save, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRef, useEffect, useState, useCallback } from 'react';

const BottomBar = () => {
  const { activeTab, setActiveTab, showRightPanel, setShowRightPanel } = useStore();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  const tabs = ['3d', '2d', 'bat'] as const;
  const labels = { '3d': 'Édition 3D', '2d': 'Édition 2D', 'bat': 'Aperçu BAT' };

  const updatePill = useCallback(() => {
    if (!containerRef.current) return;
    const idx = tabs.indexOf(activeTab as typeof tabs[number]);
    const btns = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-tab-btn]');
    if (btns[idx]) {
      setPillStyle({ left: btns[idx].offsetLeft, width: btns[idx].offsetWidth });
    }
  }, [activeTab]);

  useEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [updatePill]);

  if (isMobile) return null;

  return (
    <footer className="h-12 flex items-center justify-between px-4 border-t border-thin bg-background shrink-0">
      {/* Left: Tab toggle */}
      <div ref={containerRef} className="relative flex items-center rounded-full border border-border overflow-hidden">
        {/* Sliding pill */}
        <div
          className="absolute top-0 h-full bg-foreground rounded-full transition-all duration-300 ease-out"
          style={{ left: pillStyle.left, width: pillStyle.width }}
        />
        {tabs.map((tab) => (
          <button
            key={tab}
            data-tab-btn
            onClick={() => setActiveTab(tab)}
            className={`relative z-10 px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
              activeTab === tab
                ? 'text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {labels[tab]}
          </button>
        ))}
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
