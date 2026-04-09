import { useState, useEffect, useRef } from 'react';
import { Plus, Save, Share2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import html2canvas from 'html2canvas';

const BottomBar = () => {
  const { cart, currentDesign, addToCart, editCartDesign, setShowCartPanel } = useStore();
  const isMobile = useIsMobile();
  const [currentDesignThumb, setCurrentDesignThumb] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
        if (!canvasEl) return;
        const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 0.3 });
        setCurrentDesignThumb(canvas.toDataURL('image/png'));
      } catch {}
    }, 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [currentDesign.elements, currentDesign.cupColor]);

  if (isMobile) return null;

  return (
    <footer className="h-24 flex items-center px-4 gap-2.5 border-t border-thin bg-secondary/50 shrink-0 overflow-x-auto">
      <div className="text-[10px] text-muted-foreground shrink-0 mr-1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        Mes designs
      </div>

      <div className="relative shrink-0 pb-5">
        <div className="w-16 h-16 rounded-lg border-2 border-foreground overflow-hidden" style={{ backgroundColor: currentDesign.cupColor }}>
          {currentDesignThumb ? (
            <img src={currentDesignThumb} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">En cours</div>
          )}
        </div>
        <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-medium text-foreground whitespace-nowrap">En cours</div>
      </div>

      {cart.map((design) => (
        <div key={design.id} className="relative shrink-0 cursor-pointer pb-5" onClick={() => { editCartDesign(design.id); setShowCartPanel(false); }}>
          <div className="w-16 h-16 rounded-lg border border-border overflow-hidden hover:border-foreground/50 transition-colors" style={{ backgroundColor: design.cupColor }}>
            {design.thumbnail ? (
              <img src={design.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: design.cupColor }} />
            )}
          </div>
          <div className="absolute -bottom-0 left-0 right-0 text-[9px] text-center text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{design.name}</div>
        </div>
      ))}

      <button
        onClick={() => addToCart()}
        className="w-12 h-16 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 shrink-0 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors"
        title="Créer un nouveau design"
      >
        <Plus size={16} />
        <span className="text-[9px]">Nouveau</span>
      </button>

      <div className="flex-1" />

      <button onClick={() => document.dispatchEvent(new CustomEvent('ecocup-save'))} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Sauvegarder">
        <Save size={16} />
        <span className="text-[10px]">Sauvegarder</span>
      </button>
      <button onClick={() => document.dispatchEvent(new CustomEvent('ecocup-share'))} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Partager">
        <Share2 size={16} />
        <span className="text-[10px]">Partager</span>
      </button>
    </footer>
  );
};

export default BottomBar;
