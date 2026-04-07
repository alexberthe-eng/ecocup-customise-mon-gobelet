import { Undo2, Redo2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

const BottomBar = () => {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const historyIndex = useStore((s) => s.historyIndex);
  const historyLength = useStore((s) => s.history.length);
  const cupColor = useStore((s) => s.currentDesign.cupColor);

  return (
    <footer className="h-10 flex items-center justify-between px-4 border-t border-thin bg-background">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-8 rounded border-thin"
          style={{ backgroundColor: cupColor }}
          title="Aperçu miniature"
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
          title="Annuler"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= historyLength - 1}
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
          title="Rétablir"
        >
          <Redo2 size={14} />
        </button>
      </div>
      <span className="text-[10px] text-muted-foreground">
        Cliquez sur un élément pour le modifier
      </span>
    </footer>
  );
};

export default BottomBar;
