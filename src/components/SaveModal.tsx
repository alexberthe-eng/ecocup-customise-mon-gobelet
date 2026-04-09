import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

const DEFAULT_NAME = 'Gobelet personnalisé par vos soins – ECO 30 Digital';

interface SaveModalProps {
  open: boolean;
  onClose: () => void;
}

const SaveModal = ({ open, onClose }: SaveModalProps) => {
  const currentDesign = useStore(s => s.currentDesign);
  const setDesignName = useStore(s => s.setDesignName);

  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentDesign.name !== DEFAULT_NAME ? currentDesign.name : '');
      setError(false);
      setSaving(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, currentDesign.name]);

  if (!open) return null;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    setDesignName(trimmed);
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('ecocup-do-save'));
      onClose();
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg max-w-[520px] w-[90vw] shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-thin">
          <h2 className="text-[17px] font-semibold">Sauvegarder votre gobelet</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X size={16} /></button>
        </div>
        <div className="px-5 py-5">
          {error && (
            <div className="bg-destructive text-destructive-foreground rounded px-3.5 py-2.5 text-[13px] mb-4">
              Donnez un nom à votre gobelet avant de sauvegarder
            </div>
          )}
          <label className="block text-[13px] text-muted-foreground mb-2">
            Donnez un nom à votre gobelet personnalisé
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={e => { setName(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Ex : Gobelet mariage Julie & Thomas"
            className="w-full h-11 border border-border rounded px-3 text-sm bg-background focus:border-foreground focus:ring-2 focus:ring-foreground/10 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-thin">
          <button onClick={onClose} className="flex-1 h-[42px] rounded border-[1.5px] border-foreground text-foreground text-[13px] font-medium hover:bg-secondary transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] h-[42px] rounded bg-foreground text-background text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde…</> : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
