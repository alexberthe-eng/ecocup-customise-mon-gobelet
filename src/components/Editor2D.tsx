import { useRef, useCallback, useMemo, useState } from 'react';
import { useStore, DesignElement } from '@/store/useStore';
import { Trash2, Undo2, Redo2, RotateCw } from 'lucide-react';
import CanvasDrawer from '@/components/CanvasDrawer';
import { useIsMobile } from '@/hooks/use-mobile';

const GRID_SIZE = 22;

const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

const Editor2D = () => {
  const {
    currentDesign,
    gridVisible,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    removeElement,
    pushHistory,
    undo,
    redo,
    historyIndex,
    history,
  } = useStore();

  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    elX: number;
    elY: number;
    type: 'move' | 'resize' | 'rotate';
    startAngle?: number;
    startRotation?: number;
    centerX?: number;
    centerY?: number;
  } | null>(null);

  const selectedElement = useMemo(
    () => currentDesign.elements.find((el) => el.id === selectedElementId),
    [currentDesign.elements, selectedElementId]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, el: DesignElement, type: 'move' | 'resize' = 'move') => {
      e.stopPropagation();
      setSelectedElementId(el.id);
      const grid = useStore.getState().gridVisible;
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
          let newX = dragRef.current.elX + dx;
          let newY = dragRef.current.elY + dy;
          if (grid) { newX = snapToGrid(newX); newY = snapToGrid(newY); }
          updateElement(dragRef.current.id, { x: newX, y: newY });
        } else if (dragRef.current.type === 'resize') {
          let newW = Math.max(20, el.width + dx);
          let newH = Math.max(20, el.height + dy);
          if (grid) { newW = Math.max(GRID_SIZE, snapToGrid(newW)); newH = Math.max(GRID_SIZE, snapToGrid(newH)); }
          updateElement(dragRef.current.id, { width: newW, height: newH });
        } else if (dragRef.current.type === 'rotate') {
          const angle = Math.atan2(
            ev.clientY - dragRef.current.centerY!,
            ev.clientX - dragRef.current.centerX!
          );
          const angleDeg = angle * (180 / Math.PI);
          const delta = angleDeg - dragRef.current.startAngle!;
          const newRotation = Math.round(dragRef.current.startRotation! + delta);
          updateElement(dragRef.current.id, { rotation: newRotation });
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

  const handleRotateStart = useCallback(
    (e: React.MouseEvent, el: DesignElement) => {
      e.stopPropagation();
      e.preventDefault();
      const scale = useStore.getState().gridVisible ? 1 : 1; // just to enter callback
      const elDiv = (e.target as HTMLElement).closest('[data-element-id]') as HTMLElement;
      const rect = elDiv?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

      dragRef.current = {
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        elX: el.x,
        elY: el.y,
        type: 'rotate',
        startAngle,
        startRotation: el.rotation,
        centerX,
        centerY,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current || dragRef.current.type !== 'rotate') return;
        const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * (180 / Math.PI);
        const delta = angle - dragRef.current.startAngle!;
        const newRotation = Math.round(dragRef.current.startRotation! + delta);
        updateElement(dragRef.current.id, { rotation: newRotation });
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
    [updateElement, pushHistory]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, el: DesignElement) => {
      e.stopPropagation();
      setSelectedElementId(el.id);
      const touch = e.touches[0];
      const grid = useStore.getState().gridVisible;
      dragRef.current = {
        id: el.id,
        startX: touch.clientX,
        startY: touch.clientY,
        elX: el.x,
        elY: el.y,
        type: 'move',
      };

      const handleTouchMove = (ev: TouchEvent) => {
        ev.preventDefault();
        if (!dragRef.current) return;
        const t = ev.touches[0];
        const dx = t.clientX - dragRef.current.startX;
        const dy = t.clientY - dragRef.current.startY;
        let newX = dragRef.current.elX + dx;
        let newY = dragRef.current.elY + dy;
        if (grid) { newX = snapToGrid(newX); newY = snapToGrid(newY); }
        updateElement(dragRef.current.id, { x: newX, y: newY });
      };

      const handleTouchEnd = () => {
        dragRef.current = null;
        pushHistory();
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    },
    [setSelectedElementId, updateElement, pushHistory]
  );

  const sortedElements = useMemo(
    () => [...currentDesign.elements].sort((a, b) => a.zIndex - b.zIndex),
    [currentDesign.elements]
  );

  const gridBg = gridVisible
    ? {
        backgroundImage:
          `linear-gradient(to right, hsl(var(--foreground) / 0.08) 1px, transparent 1px),
           linear-gradient(to bottom, hsl(var(--foreground) / 0.08) 1px, transparent 1px)`,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }
    : {};

  return (
    <div className="flex-1 flex flex-col relative" ref={wrapperRef}>
      {/* Mobile undo/redo bar */}
      {isMobile && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-thin bg-background">
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30">
              <Undo2 size={14} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30">
              <Redo2 size={14} />
            </button>
          </div>
          <span className="text-[9px] text-muted-foreground">Touchez un élément pour le modifier</span>
        </div>
      )}

      {/* Canvas - scales on mobile */}
      <div className="flex-1 flex items-center justify-center bg-secondary/30 overflow-auto p-2 md:p-0" data-tour="canvas">
        <div
          ref={canvasRef}
          className="relative bg-background rounded-xl border-thin overflow-hidden shrink-0"
          style={{
            width: isMobile ? 340 : 600,
            height: isMobile ? 227 : 400,
            backgroundColor: currentDesign.cupColor,
            ...gridBg,
          }}
          onClick={() => setSelectedElementId(null)}
          onTouchStart={() => setSelectedElementId(null)}
        >
          {sortedElements.map((el) => {
            const scale = isMobile ? 340 / 600 : 1;
            const isSelected = el.id === selectedElementId;
            return (
              <div
                key={el.id}
                data-element-id={el.id}
                className="absolute cursor-move"
                style={{
                  left: el.x * scale,
                  top: el.y * scale,
                  width: el.width * scale,
                  height: el.height * scale,
                  transform: `rotate(${el.rotation}deg)`,
                  opacity: el.opacity / 100,
                  zIndex: el.zIndex,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => handleMouseDown(e, el, 'move')}
                onTouchStart={(e) => handleTouchStart(e, el)}
              >
                {el.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center select-none"
                    style={{
                      color: el.color,
                      fontFamily: el.fontFamily || 'system-ui',
                      fontSize: (el.fontSize || 16) * scale,
                      fontWeight: 600,
                    }}
                  >
                    {el.text}
                  </div>
                )}
                {el.type === 'image' && el.src && (
                  <img src={el.src} alt="" className="w-full h-full object-contain pointer-events-none" draggable={false} />
                )}
                {el.type === 'svg' && el.src && (
                  <img src={el.src} alt="" className="w-full h-full object-contain pointer-events-none" draggable={false} />
                )}

                {isSelected && (
                  <>
                    <div className="absolute inset-0 border-2 border-accent rounded pointer-events-none" />
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
                    {/* Rotation handle */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                      style={{ top: -32 }}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-accent border border-accent-foreground flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm"
                        onMouseDown={(e) => handleRotateStart(e, el)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RotateCw size={10} className="text-accent-foreground" />
                      </div>
                      <div className="w-px h-2 bg-accent" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual panel */}
      {selectedElement && <ContextualPanel element={selectedElement} canvasRef={canvasRef} isMobile={isMobile} />}

      <CanvasDrawer />
    </div>
  );
};

const ContextualPanel = ({
  element,
  canvasRef,
  isMobile,
}: {
  element: DesignElement;
  canvasRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
}) => {
  const { updateElement, removeElement, moveElementLayer, pushHistory } = useStore();

  const update = (updates: Partial<DesignElement>) => {
    updateElement(element.id, updates);
  };

  const elementName =
    element.type === 'text'
      ? `Texte : "${(element.text || '').slice(0, 15)}"`
      : element.type === 'image'
      ? 'Image'
      : 'SVG';

  // On mobile: fixed bottom sheet. On desktop: floating next to element.
  if (isMobile) {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 bg-background border-t border-thin shadow-lg p-3 z-20 max-h-[50%] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 truncate">{elementName}</p>
        <ContextualPanelFields element={element} update={update} pushHistory={pushHistory} moveElementLayer={moveElementLayer} removeElement={removeElement} />
      </div>
    );
  }

  const panelLeft = Math.min(element.x + element.width + 24, 420);
  const panelTop = Math.max(element.y - 10, 10);
  const arrowTop = Math.max(20, Math.min(element.y + element.height / 2 - panelTop, 60));

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: canvasRef.current ? canvasRef.current.offsetLeft + panelLeft : panelLeft,
        top: canvasRef.current ? canvasRef.current.offsetTop + panelTop : panelTop,
      }}
    >
      <div
        className="absolute -left-[6px] w-3 h-3 bg-background border-l border-b border-thin rotate-45 z-10"
        style={{ top: arrowTop }}
      />
      <div
        className="bg-background border-thin rounded-xl shadow-lg p-3 min-w-[220px] pointer-events-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 truncate">{elementName}</p>
        <ContextualPanelFields element={element} update={update} pushHistory={pushHistory} moveElementLayer={moveElementLayer} removeElement={removeElement} />
      </div>
    </div>
  );
};

/** Shared fields for contextual panel (used in both mobile sheet and desktop floating) */
const ContextualPanelFields = ({
  element,
  update,
  pushHistory,
  moveElementLayer,
  removeElement,
}: {
  element: DesignElement;
  update: (u: Partial<DesignElement>) => void;
  pushHistory: () => void;
  moveElementLayer: (id: string, dir: 'top' | 'up' | 'down' | 'bottom') => void;
  removeElement: (id: string) => void;
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
    <button onClick={() => removeElement(element.id)} className="flex items-center gap-1 text-[10px] text-destructive hover:underline">
      <Trash2 size={10} /> Supprimer
    </button>
  </>
);

export default Editor2D;
