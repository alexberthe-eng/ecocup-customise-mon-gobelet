import { Palette, ImagePlus, Type, Shapes, BookOpen, HelpCircle } from 'lucide-react';
import { useStore, ActiveTool } from '@/store/useStore';

const tools: { id: ActiveTool; icon: React.ElementType; label: string }[] = [
  { id: 'color', icon: Palette, label: 'Couleur' },
  { id: 'image', icon: ImagePlus, label: 'Image' },
  { id: 'text', icon: Type, label: 'Texte' },
  { id: 'motif', icon: Shapes, label: 'Motif' },
  { id: 'collection', icon: BookOpen, label: 'Collection' },
];

const LeftSidebar = () => {
  const activeTool = useStore((s) => s.activeTool);
  const setActiveTool = useStore((s) => s.setActiveTool);
  const startTour = useStore((s) => s.startTour);

  return (
    <aside className="w-[68px] flex flex-col items-center py-3 border-r border-thin bg-background shrink-0">
      <div className="flex flex-col gap-1 flex-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined}
              onClick={() => setActiveTool(tool.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] transition-colors ${
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={18} />
              <span>{tool.label}</span>
            </button>
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
