import { useEffect, useRef } from 'react';
import { Palette, ImagePlus, Type, Shapes, BookOpen, HelpCircle, Plus } from 'lucide-react';
import { useStore, ActiveTool } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const tools: { id: ActiveTool; icon: React.ElementType; label: string; showPlus?: boolean; tooltip: string }[] = [
  { id: 'color', icon: Palette, label: 'Couleur du gobelet', tooltip: 'Changer la couleur du gobelet' },
  { id: 'image', icon: ImagePlus, label: 'Image', tooltip: 'Ajouter une image' },
  { id: 'text', icon: Type, label: 'Texte', showPlus: true, tooltip: 'Ajouter du texte' },
  { id: 'motif', icon: Shapes, label: 'Motif', showPlus: true, tooltip: 'Ajouter un motif' },
  { id: 'collection', icon: BookOpen, label: 'Collection', showPlus: true, tooltip: 'Choisir une collection' },
];

const ColorPopover = ({ position }: { position: 'side' | 'above' }) => {
  const { currentDesign, setCupColor, setShowColorPopover } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowColorPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setShowColorPopover]);

  const posClass = position === 'above'
    ? 'bottom-full left-0 mb-2'
    : 'left-[72px] top-0';

  return (
    <div
      ref={ref}
      className={`absolute ${posClass} w-[180px] bg-background border-thin rounded-xl shadow-lg p-3 z-50 animate-scale-in`}
    >
      <h4 className="text-xs font-semibold mb-2">Couleur du gobelet</h4>
      <div className="flex gap-2">
        <button
          onClick={() => setCupColor('#f2f2f2')}
          className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
            currentDesign.cupColor === '#f2f2f2'
              ? 'border-accent bg-accent/5'
              : 'border-transparent hover:bg-secondary'
          }`}
        >
          <div className="w-10 h-10 rounded-full border-thin" style={{ backgroundColor: '#f2f2f2' }} />
          <span className="text-[10px]">Blanc</span>
        </button>
        <button
          onClick={() => setCupColor('#e8f0f5')}
          className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
            currentDesign.cupColor === '#e8f0f5'
              ? 'border-accent bg-accent/5'
              : 'border-transparent hover:bg-secondary'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full border-thin"
            style={{
              background: 'linear-gradient(135deg, rgba(232,240,245,0.9), rgba(200,220,235,0.7))',
            }}
          />
          <span className="text-[10px] text-center leading-tight">Translucide givré</span>
        </button>
      </div>
    </div>
  );
};

/** Desktop: vertical sidebar. Mobile: horizontal bottom toolbar */
const LeftSidebar = () => {
  const activeTool = useStore((s) => s.activeTool);
  const showColorPopover = useStore((s) => s.showColorPopover);
  const handleToolClick = useStore((s) => s.handleToolClick);
  const startTour = useStore((s) => s.startTour);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <nav className="h-14 flex items-center justify-around border-t border-thin bg-background shrink-0 relative">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative">
              <button
                data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined}
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {tool.showPlus && <Plus size={9} strokeWidth={3} className="absolute -top-0.5 -right-1.5" />}
                </div>
                <span className="truncate max-w-[56px]">{tool.label}</span>
              </button>
              {tool.id === 'color' && showColorPopover && <ColorPopover position="above" />}
            </div>
          );
        })}
        <button
          data-tour="aide"
          onClick={startTour}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] text-muted-foreground"
        >
          <HelpCircle size={18} />
          <span>Aide</span>
        </button>
      </nav>
    );
  }

  // Desktop / tablet: vertical sidebar
  return (
    <TooltipProvider delayDuration={300}>
    <aside className="w-[68px] flex flex-col items-center py-3 border-r border-thin bg-background shrink-0 relative">
      <div className="flex flex-col gap-1 flex-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined}
                    onClick={() => handleToolClick(tool.id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] transition-colors w-full ${
                      isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="relative">
                      <Icon size={18} />
                      {tool.showPlus && <Plus size={9} strokeWidth={3} className="absolute -top-0.5 -right-1.5" />}
                    </div>
                    <span className="truncate max-w-[56px]">{tool.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {tool.tooltip}
                </TooltipContent>
              </Tooltip>
              {tool.id === 'color' && showColorPopover && <ColorPopover position="side" />}
            </div>
          );
        })}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-tour="aide"
            onClick={startTour}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
          >
            <HelpCircle size={18} />
            <span>Aide</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Lancer le tutoriel
        </TooltipContent>
      </Tooltip>
    </aside>
    </TooltipProvider>
  );
};

export default LeftSidebar;
