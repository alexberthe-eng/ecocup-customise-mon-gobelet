import { useEffect, useState } from 'react';
import { DesignElement, useStore } from '@/store/useStore';
import { X, Sparkles } from 'lucide-react';

interface ElementEditModalProps {
  open: boolean;
  element: DesignElement | null;
  onClose: () => void;
  onEditWithAI?: (id: string) => void;
}

const ElementEditModal = ({ open, element, onClose, onEditWithAI }: ElementEditModalProps) => {
  const { updateElement, pushHistory } = useStore();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [color, setColor] = useState('#111111');

  useEffect(() => {
    if (element && open) {
      setWidth(Math.round(element.width));
      setHeight(Math.round(element.height));
      setRotation(element.rotation);
      setOpacity(element.opacity);
      setColor(element.color);
    }
  }, [element, open]);

  if (!open || !element) return null;

  const apply = (updates: Partial<DesignElement>) => {
    updateElement(element.id, updates);
  };

  const title = element.type === 'image' ? "Modifier l'image" : "Modifier le sticker";

  const handleClose = () => {
    pushHistory();
    onClose();
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} onClick={handleClose} />
      <div
        style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)',
          background: 'white', borderRadius: 10, width: 320, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 51,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5', paddingBottom: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Width / Height */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 11 }}>
            <span style={{ color: '#888' }}>Largeur (px)</span>
            <input type="number" value={width} onChange={(e) => { const v = Number(e.target.value); setWidth(v); apply({ width: v }); }}
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', marginTop: 4, fontSize: 12 }} />
          </label>
          <label style={{ fontSize: 11 }}>
            <span style={{ color: '#888' }}>Hauteur (px)</span>
            <input type="number" value={height} onChange={(e) => { const v = Number(e.target.value); setHeight(v); apply({ height: v }); }}
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', marginTop: 4, fontSize: 12 }} />
          </label>
        </div>

        {/* Rotation */}
        <label style={{ display: 'block', fontSize: 11, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
            <span>Rotation</span><span>{rotation}°</span>
          </div>
          <input type="range" min={-180} max={180} step={1} value={rotation}
            onChange={(e) => { const v = Number(e.target.value); setRotation(v); apply({ rotation: v }); }}
            style={{ width: '100%', marginTop: 4 }} />
        </label>

        {/* Opacity */}
        <label style={{ display: 'block', fontSize: 11, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
            <span>Opacité</span><span>{opacity}%</span>
          </div>
          <input type="range" min={0} max={100} step={1} value={opacity}
            onChange={(e) => { const v = Number(e.target.value); setOpacity(v); apply({ opacity: v }); }}
            style={{ width: '100%', marginTop: 4 }} />
        </label>

        {/* Color for SVG */}
        {element.type === 'svg' && (
          <label style={{ display: 'block', fontSize: 11, marginBottom: 12 }}>
            <span style={{ color: '#888' }}>Couleur</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input type="color" value={color} onChange={(e) => { setColor(e.target.value); apply({ color: e.target.value }); }}
                style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer' }} />
              <span style={{ fontSize: 10, color: '#888', fontFamily: 'monospace' }}>{color}</span>
            </div>
          </label>
        )}

        {/* Edit with AI */}
        {onEditWithAI && (
          <button
            onClick={() => { onEditWithAI(element.id); handleClose(); }}
            style={{
              width: '100%', padding: '8px 0', background: 'none', border: '1px solid #ddd',
              borderRadius: 6, fontSize: 13, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10,
            }}
          >
            <Sparkles size={14} /> Modifier avec l'IA
          </button>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            width: '100%', height: 40, background: '#0f0f0f', color: 'white',
            border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Fermer
        </button>
      </div>
    </>
  );
};

export default ElementEditModal;
