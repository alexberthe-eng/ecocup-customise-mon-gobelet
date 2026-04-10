import { useState, useEffect, useCallback } from 'react';
import { Save, Undo2, Redo2, Copy, ClipboardPaste, Trash2, PenLine, Box, FileCheck, Grid3x3, Download, Sparkles } from 'lucide-react';
import { useStore as useGlobalStore } from '@/store/useStore';
import { useStore, DesignElement } from '@/store/useStore';

interface ToolBarProps {
  onExportPNG: () => void;
  onOpenAIWizard: () => void;
}

const ToolBar = ({ onExportPNG, onOpenAIWizard }: ToolBarProps) => {
  const { undo, redo, historyIndex, history, selectedElementId, removeElement, gridVisible, setGridVisible, activeTab, setActiveTab, currentDesign, addElement, setSelectedElementId } = useStore();
  const isDirty = useGlobalStore((s) => s.isDirty);

  const SaveBtn = () => (
    <div className="relative shrink-0">
      <Btn icon={Save} title="Sauvegarder" onClick={() => document.dispatchEvent(new CustomEvent('ecocup-save'))} data-tour="toolbar-save" />
      {isDirty && (
        <div className="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full bg-orange-500 border-[1.5px] border-background pointer-events-none" />
      )}
    </div>
  );
  const [clipboardElement, setClipboardElement] = useState<DesignElement | null>(null);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedElementId !== null;

  const handleCopy = useCallback(() => {
    if (!selectedElementId) return;
    const el = currentDesign.elements.find(e => e.id === selectedElementId);
    if (el) setClipboardElement({ ...el });
  }, [selectedElementId, currentDesign.elements]);

  const handlePaste = useCallback(() => {
    if (!clipboardElement) return;
    const newId = crypto.randomUUID();
    addElement({ ...clipboardElement, id: newId, x: clipboardElement.x + 20, y: clipboardElement.y + 20, zIndex: currentDesign.elements.length });
    setSelectedElementId(newId);
  }, [clipboardElement, addElement, currentDesign.elements.length, setSelectedElementId]);

  const handleDelete = useCallback(() => {
    if (!selectedElementId) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return;
    removeElement(selectedElementId);
  }, [selectedElementId, removeElement]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && hasSelection) { e.preventDefault(); handleDelete(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isInput) { e.preventDefault(); handleCopy(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isInput) { e.preventDefault(); handlePaste(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, hasSelection, handleDelete, handleCopy, handlePaste]);

  const Sep = () => <div className="w-px h-5 bg-border mx-1 shrink-0" />;

  const Btn = ({ icon: Icon, title, onClick, disabled, active, 'data-tour': dataTour }: { icon: any; title: string; onClick: () => void; disabled?: boolean; active?: boolean; 'data-tour'?: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-tour={dataTour}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150 shrink-0 ${active ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:bg-secondary'} ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Icon size={15} />
    </button>
  );

  return (
    <div className="h-11 flex items-center justify-center px-3 gap-1 border-b border-thin bg-background shrink-0">
      <SaveBtn />
      <Sep />
      <Btn icon={Undo2} title="Annuler (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
      <Btn icon={Redo2} title="Rétablir (Ctrl+Y)" onClick={redo} disabled={!canRedo} />
      <Sep />
      {activeTab === '2d' && (
        <>
          <Btn icon={Copy} title="Copier l'élément" onClick={handleCopy} disabled={!hasSelection} />
          <Btn icon={ClipboardPaste} title="Coller" onClick={handlePaste} disabled={!clipboardElement} />
          <Btn icon={Trash2} title="Supprimer l'élément sélectionné" onClick={handleDelete} disabled={!hasSelection} />
          <Sep />
        </>
      )}
      <div className="flex items-center gap-0.5 bg-secondary rounded-full p-0.5 shrink-0" data-tour="toggle-2d-3d">
        <span className="text-[10px] font-medium px-1.5 text-muted-foreground select-none">2D</span>
        <button
          onClick={() => setActiveTab(activeTab === '2d' ? '3d' : '2d')}
          title={activeTab === '2d' ? 'Passer en 3D' : 'Passer en 2D'}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${activeTab === '3d' ? 'bg-foreground' : 'bg-border'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-200 ${activeTab === '3d' ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
        <span className="text-[10px] font-medium px-1.5 text-muted-foreground select-none">3D</span>
      </div>
      <Btn icon={FileCheck} title="Aperçu Bon à Tirer" onClick={() => setActiveTab('bat')} active={activeTab === 'bat'} data-tour="tab-bat" />
      <Sep />
      {activeTab === '2d' && (
        <Btn icon={Grid3x3} title="Afficher/masquer la grille" onClick={() => setGridVisible(!gridVisible)} active={gridVisible} />
      )}
      <Btn icon={Download} title="Télécharger le design en PNG" onClick={onExportPNG} />
      <Btn icon={Sparkles} title="Générer un visuel par IA" onClick={onOpenAIWizard} />
    </div>
  );
};

export default ToolBar;
