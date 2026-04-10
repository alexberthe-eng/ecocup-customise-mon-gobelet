import { useState, useEffect } from 'react';
import { DesignElement } from '@/store/useStore';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export interface TextData {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
}

interface TextEditModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  element?: DesignElement;
  onClose: () => void;
  onConfirm: (data: TextData) => void;
}

const FONT_OPTIONS = [
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'system-ui', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Dancing Script, cursive', label: 'Dancing Script' },
  { value: 'Oswald, sans-serif', label: 'Oswald' },
];

const SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

const TextEditModal = ({ open, mode, element, onClose, onConfirm }: TextEditModalProps) => {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Open Sans, sans-serif');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && element) {
      setText(element.text || '');
      setFontFamily(element.fontFamily || 'Open Sans, sans-serif');
      setFontSize(element.fontSize || 24);
      setColor(element.color || '#000000');
      setBold(element.bold || false);
      setItalic(element.italic || false);
      setUnderline(element.underline || false);
      setAlign(element.align || 'left');
    } else {
      setText('');
      setFontFamily('Open Sans, sans-serif');
      setFontSize(24);
      setColor('#000000');
      setBold(false);
      setItalic(false);
      setUnderline(false);
      setAlign('left');
    }
  }, [open, mode, element]);

  if (!open) return null;

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: 28, height: 28, borderRadius: 4,
    background: active ? '#3a3a3a' : 'transparent',
    border: active ? '1px solid #555' : 'none',
    color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  const sep = <div style={{ width: 1, height: 20, background: '#3a3a3a' }} />;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} onClick={onClose} />
      <div
        style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          background: 'white', borderRadius: 8, width: 480, maxWidth: '95vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 51, overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Saisissez votre texte"
          style={{
            width: '100%', minHeight: 100, padding: '14px 16px',
            border: 'none', borderBottom: '1px solid #e5e5e5',
            resize: 'vertical',
            fontSize: `${fontSize}px`, fontFamily,
            fontWeight: bold ? 700 : 400,
            fontStyle: italic ? 'italic' : 'normal',
            textDecoration: underline ? 'underline' : 'none',
            textAlign: align, color, outline: 'none',
            borderRadius: '8px 8px 0 0', boxSizing: 'border-box',
          }}
        />

        {/* Formatting bar */}
        <div
          style={{
            height: 44, background: '#1a1a1a', borderRadius: '0 0 8px 8px',
            display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
          }}
        >
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{
              background: '#2a2a2a', color: 'white', border: '1px solid #3a3a3a',
              borderRadius: 4, padding: '4px 8px', fontSize: 12, width: 130,
            }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              background: '#2a2a2a', color: 'white', border: '1px solid #3a3a3a',
              borderRadius: 4, padding: '4px 8px', fontSize: 12, width: 58,
            }}
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {sep}

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              width: 28, height: 28, border: 'none', borderRadius: '50%',
              cursor: 'pointer', padding: 0, background: 'none',
            }}
          />

          {sep}

          <button onClick={() => setBold(!bold)} style={btnStyle(bold)}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>B</span>
          </button>
          <button onClick={() => setItalic(!italic)} style={btnStyle(italic)}>
            <span style={{ fontStyle: 'italic', fontSize: 14 }}>I</span>
          </button>
          <button onClick={() => setUnderline(!underline)} style={btnStyle(underline)}>
            <span style={{ textDecoration: 'underline', fontSize: 14 }}>U</span>
          </button>

          {sep}

          <button onClick={() => setAlign('left')} style={btnStyle(align === 'left')}>
            <AlignLeft size={14} />
          </button>
          <button onClick={() => setAlign('center')} style={btnStyle(align === 'center')}>
            <AlignCenter size={14} />
          </button>
          <button onClick={() => setAlign('right')} style={btnStyle(align === 'right')}>
            <AlignRight size={14} />
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => onConfirm({ text, fontFamily, fontSize, color, bold, italic, underline, align })}
            disabled={text.trim() === ''}
            style={{
              background: '#2563eb', color: 'white', border: 'none', borderRadius: 5,
              padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: text.trim() === '' ? 0.5 : 1,
            }}
          >
            Terminé
          </button>
        </div>
      </div>
    </>
  );
};

export default TextEditModal;
