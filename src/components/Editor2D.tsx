import { useRef, useCallback, useMemo } from 'react';
import { useStore, DesignElement } from '@/store/useStore';
import { Grid3X3, Trash2 } from 'lucide-react';

const CANVAS_W = 600;
const CANVAS_H = 400;

const Editor2D = () => {
  const {
    currentDesign,
    gridVisible,
    setGridVisible,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    removeElement,
    pushHistory,
  } = useStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    elX: number;
    elY: number;
    type: 'move' | 'resize';
  } | null>(null);

  const selectedElement = useMemo(
    () => currentDesign.elements.find((el) => el.id === selectedElementId),
    [currentDesign.elements, selectedElementId]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, el: DesignElement, type: 'move' | 'resize' = 'move') => {
      e.stopPropagation();
      setSelectedElementId(el.id);
      dragRef.current = {
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        elX: el.x,
        elY: el.y,
        type,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        if (dragRef.current.type === 'move') {
          updateElement(dragRef.current.id, {
            x: dragRef.current.elX + dx,
            y: dragRef.current.elY + dy,
          });
        } else {
          updateElement(dragRef.current.id, {
            width: Math.max(20, el.width + dx),
            height: Math.max(20, el.height + dy),
          });
        }
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        pushHistory();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [setSelectedElementId, updateElement, pushHistory]
  );

  const sortedElements = useMemo(
    () => [...currentDesign.elements].sort((a, b) => a.zIndex - b.zIndex),
    [currentDesign.elements]
  );

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Tab bar extras */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={`p-1.5 rounded transition-colors ${
            gridVisible ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:bg-secondary'
          }`}
          title="Grille"
        >
          <Grid3X3 size={14} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-secondary/30 overflow-hidden" data-tour="canvas">
        <div
          ref={canvasRef}
          className="relative bg-background rounded-xl border-thin overflow-hidden"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            backgroundColor: currentDesign.cupColor,
          }}
          onClick={() => setSelectedElementId(null)}
        >
          {/* Grid overlay */}
          {gridVisible && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
              <defs>
                <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
                  <path d="M 22 0 L 0 0 0 22" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Elements */}
          {sortedElements.map((el) => {
            const isSelected = el.id === selectedElementId;
            return (
              <div
                key={el.id}
                className="absolute cursor-move"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  transform: `rotate(${el.rotation}deg)`,
                  opacity: el.opacity / 100,
                  zIndex: el.zIndex,
                }}
                onMouseDown={(e) => handleMouseDown(e, el, 'move')}
              >
                {el.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center select-none"
                    style={{
                      color: el.color,
                      fontFamily: el.fontFamily || 'system-ui',
                      fontSize: el.fontSize || 16,
                      fontWeight: 600,
                    }}
                  >
                    {el.text}
                  </div>
                )}
                {el.type === 'image' && el.src && (
                  <img
                    src={el.src}
                    alt=""
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                )}
                {el.type === 'svg' && el.src && (
                  <img
                    src={el.src}
                    alt=""
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                )}

                {/* Selection handles */}
                {isSelected && (
                  <>
                    <div className="absolute inset-0 border-2 border-accent rounded pointer-events-none" />
                    {/* Corners */}
                    {[
                      { top: -4, left: -4 },
                      { top: -4, right: -4 },
                      { bottom: -4, left: -4 },
                      { bottom: -4, right: -4 },
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className="absolute w-2.5 h-2.5 bg-accent rounded-sm border border-accent-foreground cursor-se-resize"
                        style={pos as React.CSSProperties}
                        onMouseDown={(e) => handleMouseDown(e, el, 'resize')}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual panel */}
      {selectedElement && (
        <ContextualPanel element={selectedElement} />
      )}
    </div>
  );
};

const ContextualPanel = ({ element }: { element: DesignElement }) => {
  const { updateElement, removeElement, moveElementLayer, pushHistory } = useStore();

  const update = (updates: Partial<DesignElement>) => {
    updateElement(element.id, updates);
  };

  return (
    <div
      className="absolute bg-background border-thin rounded-xl shadow-sm p-3 z-20 min-w-[200px]"
      style={{
        left: Math.min(element.x + element.width + 16, 500),
        top: Math.max(element.y, 10),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
        <label>
          <span className="text-muted-foreground">Largeur</span>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => update({ width: Number(e.target.value) })}
            onBlur={pushHistory}
            className="w-full border-thin rounded px-1.5 py-1 bg-background"
          />
        </label>
        <label>
          <span className="text-muted-foreground">Hauteur</span>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => update({ height: Number(e.target.value) })}
            onBlur={pushHistory}
            className="w-full border-thin rounded px-1.5 py-1 bg-background"
          />
        </label>
        <label>
          <span className="text-muted-foreground">Rotation °</span>
          <input
            type="number"
            value={element.rotation}
            onChange={(e) => update({ rotation: Number(e.target.value) })}
            onBlur={pushHistory}
            className="w-full border-thin rounded px-1.5 py-1 bg-background"
          />
        </label>
        <label>
          <span className="text-muted-foreground">Opacité %</span>
          <input
            type="number"
            value={element.opacity}
            min={0}
            max={100}
            onChange={(e) => update({ opacity: Number(e.target.value) })}
            onBlur={pushHistory}
            className="w-full border-thin rounded px-1.5 py-1 bg-background"
          />
        </label>
      </div>
      {(element.type === 'text' || element.type === 'svg') && (
        <label className="block text-[10px] mb-2">
          <span className="text-muted-foreground">Couleur</span>
          <input
            type="color"
            value={element.color}
            onChange={(e) => update({ color: e.target.value })}
            onBlur={pushHistory}
            className="w-full h-6 rounded cursor-pointer"
          />
        </label>
      )}
      <div className="flex gap-1 text-[9px] mb-2">
        <button onClick={() => moveElementLayer(element.id, 'top')} className="flex-1 border-thin rounded py-1 hover:bg-secondary">↑↑</button>
        <button onClick={() => moveElementLayer(element.id, 'up')} className="flex-1 border-thin rounded py-1 hover:bg-secondary">↑</button>
        <button onClick={() => moveElementLayer(element.id, 'down')} className="flex-1 border-thin rounded py-1 hover:bg-secondary">↓</button>
        <button onClick={() => moveElementLayer(element.id, 'bottom')} className="flex-1 border-thin rounded py-1 hover:bg-secondary">↓↓</button>
      </div>
      <button
        onClick={() => removeElement(element.id)}
        className="flex items-center gap-1 text-[10px] text-destructive hover:underline"
      >
        <Trash2 size={10} /> Supprimer
      </button>
    </div>
  );
};

export default Editor2D;
