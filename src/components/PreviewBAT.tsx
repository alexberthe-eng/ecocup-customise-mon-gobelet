import { useMemo } from 'react';
import { useStore } from '@/store/useStore';

const CANVAS_W = 600;
const CANVAS_H = 400;
const BLEED = 4;
const SAFE = 12;

const PreviewBAT = () => {
  const { currentDesign } = useStore();

  const warnings = useMemo(() => {
    const result: { type: 'success' | 'warning' | 'error'; text: string }[] = [];
    let allInSafe = true;
    let anyNearEdge = false;
    let anyOutside = false;

    currentDesign.elements.forEach((el) => {
      if (el.x < BLEED || el.y < BLEED || el.x + el.width > CANVAS_W - BLEED || el.y + el.height > CANVAS_H - BLEED) {
        anyOutside = true;
      } else if (el.x < SAFE || el.y < SAFE || el.x + el.width > CANVAS_W - SAFE || el.y + el.height > CANVAS_H - SAFE) {
        anyNearEdge = true;
        allInSafe = false;
      }
    });

    result.push({ type: 'success', text: '✓ Résolution correcte' });
    if (currentDesign.elements.length === 0 || allInSafe) {
      result.push({ type: 'success', text: '✓ Dans la zone sécurité' });
    }
    if (anyNearEdge) {
      result.push({ type: 'warning', text: '⚠ Élément proche du bord' });
    }
    if (anyOutside) {
      result.push({ type: 'error', text: '✗ Élément hors zone' });
    }

    return result;
  }, [currentDesign.elements]);

  const sortedElements = useMemo(
    () => [...currentDesign.elements].sort((a, b) => a.zIndex - b.zIndex),
    [currentDesign.elements]
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 gap-4 p-6">
      <div
        className="relative rounded-xl border-thin overflow-hidden"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundColor: currentDesign.cupColor,
        }}
      >
        {/* Bleed zone */}
        <div
          className="absolute border-2 border-dashed pointer-events-none"
          style={{
            borderColor: '#378ADD',
            top: BLEED,
            left: BLEED,
            right: BLEED,
            bottom: BLEED,
          }}
        />
        {/* Safe zone */}
        <div
          className="absolute border-2 border-dashed pointer-events-none"
          style={{
            borderColor: '#1D9E75',
            top: SAFE,
            left: SAFE,
            right: SAFE,
            bottom: SAFE,
          }}
        />

        {/* Elements */}
        {sortedElements.map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.opacity / 100,
              zIndex: el.zIndex,
            }}
          >
            {el.type === 'text' && (
              <div
                className="w-full h-full flex items-center justify-center"
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
            {(el.type === 'image' || el.type === 'svg') && el.src && (
              <img src={el.src} alt="" className="w-full h-full object-contain" draggable={false} />
            )}
          </div>
        ))}
      </div>

      {/* Validation pills */}
      <div className="flex flex-wrap gap-2">
        {warnings.map((w, i) => (
          <span
            key={i}
            className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
              w.type === 'success'
                ? 'bg-success/10 text-success'
                : w.type === 'warning'
                ? 'bg-warning/10 text-warning'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PreviewBAT;
