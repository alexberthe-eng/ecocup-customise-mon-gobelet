import { useStore, DesignElement } from '@/store/useStore';
import { Trash2, Copy, X, Check } from 'lucide-react';

/** Shared fields for contextual panel (used in 2D editor, 3D preview, etc.) */
export const ElementPanelFields = ({
  element,
  update,
  pushHistory,
  moveElementLayer,
  removeElement,
  onDuplicate,
  onValidate,
}: {
  element: DesignElement;
  update: (u: Partial<DesignElement>) => void;
  pushHistory: () => void;
  moveElementLayer: (id: string, dir: 'top' | 'up' | 'down' | 'bottom') => void;
  removeElement: (id: string) => void;
  onDuplicate: () => void;
  onValidate: () => void;
}) => (
  <>
    {element.type === 'text' && (
      <>
        <label className="block text-[10px] mb-2">
          <span className="text-muted-foreground">Contenu</span>
          <input type="text" value={element.text || ''} onChange={(e) => update({ text: e.target.value })} onBlur={pushHistory} className="w-full border-thin rounded px-1.5 py-1 bg-background text-xs mt-0.5" />
        </label>
        <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
          <label>
            <span className="text-muted-foreground">Police</span>
            <select value={element.fontFamily || 'system-ui'} onChange={(e) => update({ fontFamily: e.target.value })} className="w-full border-thin rounded px-1.5 py-1 bg-background mt-0.5">
              <option value="system-ui">System</option>
              <option value="serif">Serif</option>
              <option value="monospace">Mono</option>
              <option value="cursive">Cursive</option>
            </select>
          </label>
          <label>
            <span className="text-muted-foreground">Taille</span>
            <input type="number" value={element.fontSize || 16} onChange={(e) => update({ fontSize: Number(e.target.value) })} onBlur={pushHistory} className="w-full border-thin rounded px-1.5 py-1 bg-background mt-0.5" />
          </label>
        </div>
      </>
    )}
    <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
      <label>
        <span className="text-muted-foreground">Largeur (px)</span>
        <input type="number" value={Math.round(element.width)} onChange={(e) => update({ width: Number(e.target.value) })} onBlur={pushHistory} className="w-full border-thin rounded px-1.5 py-1 bg-background mt-0.5" />
      </label>
      <label>
        <span className="text-muted-foreground">Hauteur (px)</span>
        <input type="number" value={Math.round(element.height)} onChange={(e) => update({ height: Number(e.target.value) })} onBlur={pushHistory} className="w-full border-thin rounded px-1.5 py-1 bg-background mt-0.5" />
      </label>
    </div>
    <label className="block text-[10px] mb-2">
      <span className="text-muted-foreground">Rotation (°)</span>
      <input type="number" value={element.rotation} onChange={(e) => update({ rotation: Number(e.target.value) })} onBlur={pushHistory} className="w-full border-thin rounded px-1.5 py-1 bg-background mt-0.5" />
    </label>
    <label className="block text-[10px] mb-2">
      <div className="flex justify-between text-muted-foreground"><span>Opacité</span><span>{element.opacity}%</span></div>
      <input type="range" min={0} max={100} value={element.opacity} onChange={(e) => update({ opacity: Number(e.target.value) })} onMouseUp={pushHistory} className="w-full h-1.5 accent-accent cursor-pointer mt-1" />
    </label>
    {(element.type === 'text' || element.type === 'svg') && (
      <label className="block text-[10px] mb-2">
        <span className="text-muted-foreground">Couleur</span>
        <div className="flex gap-2 items-center mt-0.5">
          <input type="color" value={element.color} onChange={(e) => update({ color: e.target.value })} onBlur={pushHistory} className="w-6 h-6 rounded cursor-pointer border-thin" />
          <span className="text-[9px] text-muted-foreground font-mono">{element.color}</span>
        </div>
      </label>
    )}
    <div className="grid grid-cols-2 gap-1 text-[9px] mb-2">
      <button onClick={() => moveElementLayer(element.id, 'top')} className="border-thin rounded py-1.5 hover:bg-secondary transition-colors text-center">↑↑ Premier</button>
      <button onClick={() => moveElementLayer(element.id, 'up')} className="border-thin rounded py-1.5 hover:bg-secondary transition-colors text-center">↑ Avant</button>
      <button onClick={() => moveElementLayer(element.id, 'down')} className="border-thin rounded py-1.5 hover:bg-secondary transition-colors text-center">↓ Arrière</button>
      <button onClick={() => moveElementLayer(element.id, 'bottom')} className="border-thin rounded py-1.5 hover:bg-secondary transition-colors text-center">↓↓ Fond</button>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={onDuplicate} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground hover:underline">
        <Copy size={10} /> Dupliquer
      </button>
      <button onClick={() => removeElement(element.id)} className="flex items-center gap-1 text-[10px] text-destructive hover:underline">
        <Trash2 size={10} /> Supprimer
      </button>
    </div>
    <button
      onClick={onValidate}
      className="w-full mt-3 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-[11px] py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
    >
      <Check size={12} />
      Valider
    </button>
  </>
);

/** Floating / sheet element panel — reusable across views */
export const ElementPanel = ({
  element,
  isMobile,
  anchor,
}: {
  element: DesignElement;
  isMobile: boolean;
  anchor?: { left: number; top: number };
}) => {
  const { updateElement, removeElement, moveElementLayer, pushHistory, addElement, setSelectedElementId } = useStore();

  const update = (updates: Partial<DesignElement>) => updateElement(element.id, updates, false);

  const handleDuplicate = () => {
    const newId = crypto.randomUUID();
    const newEl: DesignElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: newId,
      x: element.x + 20,
      y: element.y + 20,
    };
    addElement(newEl);
    setSelectedElementId(newId);
  };

  const elementName =
    element.type === 'text'
      ? `Texte : "${(element.text || '').slice(0, 15)}"`
      : element.type === 'image'
      ? 'Image'
      : 'SVG';

  if (isMobile) {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 bg-background border-t border-thin shadow-lg p-3 z-20 max-h-[50%] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => setSelectedElementId(null)} className="absolute top-2 right-2 p-0.5 rounded hover:bg-secondary">
          <X size={12} className="text-muted-foreground" />
        </button>
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 truncate pr-5">{elementName}</p>
        <ElementPanelFields element={element} update={update} pushHistory={pushHistory} moveElementLayer={moveElementLayer} removeElement={removeElement} onDuplicate={handleDuplicate} onValidate={() => setSelectedElementId(null)} />
      </div>
    );
  }

  const left = anchor?.left ?? 10;
  const top = anchor?.top ?? 10;

  return (
    <div className="absolute z-20" style={{ left, top }}>
      <div
        className="relative bg-background border-thin rounded-xl shadow-lg p-3 min-w-[220px] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => setSelectedElementId(null)} className="absolute top-2 right-2 p-0.5 rounded hover:bg-secondary">
          <X size={12} className="text-muted-foreground" />
        </button>
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 truncate pr-5">{elementName}</p>
        <ElementPanelFields element={element} update={update} pushHistory={pushHistory} moveElementLayer={moveElementLayer} removeElement={removeElement} onDuplicate={handleDuplicate} onValidate={() => setSelectedElementId(null)} />
      </div>
    </div>
  );
};
