import { useRef, useCallback, useMemo, useState } from 'react';
import { useStore, DesignElement } from '@/store/useStore';
import { Trash2, Undo2, Redo2, RotateCw, Copy, X } from 'lucide-react';
import CanvasDrawer from '@/components/CanvasDrawer';
import { ElementPanel } from '@/components/ElementPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { getGraduationMarks } from '@/components/GraduationMarks';

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
    showGraduation,
    showGraduationMask,
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
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
          onDrop={(e) => {
            e.preventDefault();
            const motifData = e.dataTransfer.getData('application/x-motif');
            if (!motifData) return;
            try {
              const data = JSON.parse(motifData);
              const rect = canvasRef.current?.getBoundingClientRect();
              const scale = isMobile ? 600 / 340 : 1;
              const dropX = rect ? (e.clientX - rect.left) * scale - 40 : 100;
              const dropY = rect ? (e.clientY - rect.top) * scale - 40 : 60;
              const newId = crypto.randomUUID();
              const { addElement, setSelectedElementId: selectEl } = useStore.getState();
              addElement({
                id: newId,
                type: data.type || 'svg',
                x: Math.max(0, dropX),
                y: Math.max(0, dropY),
                width: 80,
                height: 80,
                rotation: 0,
                opacity: 100,
                color: '#111111',
                zIndex: currentDesign.elements.length,
                src: data.src,
              });
              selectEl(newId);
            } catch {}
          }}
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
                    {/* Delete handle */}
                    <div
                      className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-destructive flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform"
                      onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <X size={10} className="text-destructive-foreground" />
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Graduation marks overlay — draggable as a single block */}
          {showGraduation && (() => {
            const marks = getGraduationMarks(currentDesign.graduation);
            const scale = isMobile ? 340 / 600 : 1;
            const canvasW = (isMobile ? 340 : 600);
            const canvasH = (isMobile ? 227 : 400);
            const off = currentDesign.graduationOffset;
            return (
              <div
                className="absolute cursor-move select-none"
                style={{
                  left: off.dx * scale,
                  top: off.dy * scale,
                  width: canvasW,
                  height: canvasH,
                  zIndex: 999,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startDx = off.dx;
                  const startDy = off.dy;
                  const onMove = (ev: MouseEvent) => {
                    const dx = (ev.clientX - startX) / scale;
                    const dy = (ev.clientY - startY) / scale;
                    useStore.setState((s) => ({
                      currentDesign: { ...s.currentDesign, graduationOffset: { dx: startDx + dx, dy: startDy + dy } },
                    }));
                  };
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                    pushHistory();
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
              >
                {marks.map((mark) => {
                  const y = mark.defaultY * canvasH;
                  const x = mark.defaultX * canvasW;
                  const lineW = canvasW * 0.08;
                  return (
                    <div key={mark.id} className="absolute pointer-events-none" style={{ left: x - lineW / 2 - 10, top: y - 4 }}>
                      <div className="flex items-center justify-center">
                        <div className="h-px bg-foreground/40" style={{ width: lineW }} />
                      </div>
                      <p className="text-center text-foreground/60 font-medium whitespace-nowrap" style={{ fontSize: 10 * scale }}>
                        {mark.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Graduation mask overlay */}
          {showGraduationMask && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, hsl(var(--foreground) / 0.04) 8px, hsl(var(--foreground) / 0.04) 16px)',
              borderRadius: 'inherit',
            }} />
          )}
        </div>
      </div>

      {/* Contextual panel */}
      {selectedElement && (
        <ElementPanel
          element={selectedElement}
          isMobile={isMobile}
          anchor={
            !isMobile && canvasRef.current
              ? {
                  left: canvasRef.current.offsetLeft + Math.min(selectedElement.x + selectedElement.width + 24, 420),
                  top: canvasRef.current.offsetTop + Math.max(selectedElement.y - 10, 10),
                }
              : undefined
          }
        />
      )}

      <CanvasDrawer />
    </div>
  );
};

export default Editor2D;
