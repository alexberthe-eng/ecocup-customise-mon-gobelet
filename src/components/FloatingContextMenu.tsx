import { DesignElement } from '@/store/useStore';
import { X, Pencil, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface FloatingContextMenuProps {
  element: DesignElement;
  canvasScale: number;
  onClose: () => void;
  onModify: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const CtxBtn = ({ icon: Icon, label, onClick, danger = false }: {
  icon: any; label: string; onClick: () => void; danger?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      width: 50, minHeight: 40, borderRadius: 6,
      background: 'transparent', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 2,
      color: danger ? '#ff6b6b' : 'rgba(255,255,255,0.9)',
      padding: '4px 2px',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <Icon size={13} />
    <span style={{ fontSize: 8, lineHeight: 1.2, textAlign: 'center', whiteSpace: 'pre-line' }}>
      {label}
    </span>
  </button>
);

const Divider = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '1px 6px' }} />
);

const FloatingContextMenu = ({
  element, canvasScale, onClose, onModify, onMoveUp, onMoveDown, onDelete,
}: FloatingContextMenuProps) => {
  const scale = canvasScale;
  let menuLeft = element.x * scale - 60;
  let menuTop = element.y * scale + (element.height * scale / 2) - 80;

  if (menuLeft < 8) {
    menuLeft = element.x * scale + element.width * scale + 8;
  }
  if (menuTop < 8) menuTop = 8;

  return (
    <div
      style={{
        position: 'absolute', left: menuLeft, top: menuTop,
        background: '#1a1a1a', borderRadius: 10, padding: 4,
        display: 'flex', flexDirection: 'column', gap: 1,
        zIndex: 30, width: 58,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <CtxBtn icon={X} label="×" onClick={onClose} />
      <Divider />
      <CtxBtn icon={Pencil} label="Modifier" onClick={onModify} />
      <Divider />
      <CtxBtn icon={ChevronUp} label={"Vers\nl'avant"} onClick={onMoveUp} />
      <CtxBtn icon={ChevronDown} label={"Vers\nl'arrière"} onClick={onMoveDown} />
      <Divider />
      <CtxBtn icon={Trash2} label="Supprimer" onClick={onDelete} danger />
    </div>
  );
};

export default FloatingContextMenu;
