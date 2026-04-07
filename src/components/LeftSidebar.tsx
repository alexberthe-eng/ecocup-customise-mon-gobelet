import { useEffect, useRef } from 'react';
import { Palette, ImagePlus, Type, Shapes, BookOpen, HelpCircle } from 'lucide-react';
import { useStore, ActiveTool } from '@/store/useStore';

const tools: { id: ActiveTool; icon: React.ElementType; label: string }[] = [
  { id: 'color', icon: Palette, label: 'Couleur' },
  { id: 'image', icon: ImagePlus, label: 'Image' },
  { id: 'text', icon: Type, label: 'Texte' },
  { id: 'motif', icon: Shapes, label: 'Motif' },
  { id: 'collection', icon: BookOpen, label: 'Collection' },
];

const ColorPopover = () => {
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

  return (
    <div
      ref={ref}
      className="absolute left-[72px] top-0 w-[180px] bg-background border-thin rounded-xl shadow-lg p-3 z-50 animate-scale-in"
    >
      <h4 className="text-xs font-semibold mb-2">Couleur du gobelet</h4>
      <div className="flex gap-2">
        <button
          onClick={() => setCupColor('#FFFFFF')}
          className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
            currentDesign.cupColor === '#FFFFFF'
              ? 'border-accent bg-accent/5'
              : 'border-transparent hover:bg-secondary'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-background border-thin" />
          <span className="text-[10px]">Blanc</span>
        </button>
        <button
          onClick={() => setCupColor('#E8E4DF')}
          className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
            currentDesign.cupColor === '#E8E4DF'
              ? 'border-accent bg-accent/5'
              : 'border-transparent hover:bg-secondary'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full border-thin"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(220,216,210,0.8))',
            }}
          />
          <span className="text-[10px] text-center leading-tight">Translucide givré</span>
        </button>
      </div>
    </div>
  );
};

const LeftSidebar = () => {
  const activeTool = useStore((s) => s.activeTool);
  const showColorPopover = useStore((s) => s.showColorPopover);
  const handleToolClick = useStore((s) => s.handleToolClick);
  const startTour = useStore((s) => s.startTour);

  return (
    <aside className="w-[68px] flex flex-col items-center py-3 border-r border-thin bg-background shrink-0 relative">
      <div className="flex flex-col gap-1 flex-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative">
              <button
                data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined}
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] transition-colors w-full ${
                  isActive
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={18} />
                <span>{tool.label}</span>
              </button>
              {tool.id === 'color' && showColorPopover && <ColorPopover />}
            </div>
          );
        })}
      </div>
      <button
        data-tour="aide"
        onClick={startTour}
        className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
      >
        <HelpCircle size={18} />
        <span>Aide</span>
      </button>
    </aside>
  );
};

export default LeftSidebar;
