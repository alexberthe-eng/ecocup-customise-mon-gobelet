import { useState, useRef, useEffect } from 'react';
import { Palette, ImagePlus, Type, Shapes, BookOpen, Frame, Ruler, Sparkles, HelpCircle, Headphones, Plus, X, Search, MessageCircle } from 'lucide-react';
import { useStore, ActiveTool, MaskType } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import ToggleSwitch from '@/components/ToggleSwitch';

/* ─── Tab definitions ─── */
const TABS = [
  { id: 'color', icon: Palette, label: 'Gobelet', title: 'Couleur du gobelet' },
  { id: 'image', icon: ImagePlus, label: 'Image', title: 'Importer une image' },
  { id: 'text', icon: Type, label: 'Texte', title: 'Ajouter du texte' },
  { id: 'sticker', icon: Shapes, label: 'Pictos', title: 'Pictos & motifs' },
  { id: 'collection', icon: BookOpen, label: 'Collections', title: 'Collections de designs' },
  { id: 'mask', icon: Frame, label: 'Masques', title: 'Masques photo' },
  { id: 'graduation', icon: Ruler, label: 'Graduation', title: 'Graduation du gobelet' },
  { id: 'ai-wizard', icon: Sparkles, label: 'IA', title: "Créer avec l'IA" },
] as const;

type PanelId = typeof TABS[number]['id'] | null;

/* ─── Data ─── */
const DEMO_STICKERS = [
  { id: '1', name: 'Étoile', category: 'Fête', path: 'M 50 5 L 61 35 L 95 38 L 70 58 L 78 92 L 50 75 L 22 92 L 30 58 L 5 38 L 39 35 Z' },
  { id: '2', name: 'Cœur', category: 'Mariage', path: 'M 50 85 C 20 60 5 40 5 25 A 20 20 0 0 1 50 20 A 20 20 0 0 1 95 25 C 95 40 80 60 50 85' },
  { id: '3', name: 'Soleil', category: 'Vacances', path: 'M 50 10 L 55 30 L 75 15 L 65 35 L 85 35 L 70 45 L 90 55 L 70 55 L 80 75 L 60 60 L 55 80 L 50 60 L 45 80 L 40 60 L 20 75 L 30 55 L 10 55 L 30 45 L 15 35 L 35 35 L 25 15 L 45 30 Z' },
  { id: '4', name: 'Patte', category: 'Animaux', path: 'M 35 60 A 8 8 0 1 1 35 60.1 M 55 55 A 7 7 0 1 1 55 55.1 M 25 45 A 6 6 0 1 1 25 45.1 M 60 40 A 6 6 0 1 1 60 40.1 M 45 75 C 35 65 30 55 40 50 C 45 48 50 48 55 50 C 65 55 60 65 50 75 Z' },
  { id: '5', name: 'Ballon', category: 'Sport', path: 'M 50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 M 30 20 Q 50 50 30 80 M 70 20 Q 50 50 70 80 M 10 50 H 90' },
  { id: '6', name: 'Rire', category: 'Drôle', path: 'M 50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 M 35 40 A 3 3 0 1 0 35 40.1 M 65 40 A 3 3 0 1 0 65 40.1 M 30 60 Q 50 80 70 60' },
];
const STICKER_CATEGORIES = ['Tous', 'Animaux', 'Fête', 'Mariage', 'Sport', 'Vacances', 'Drôle'];
const OCCASIONS = ['Mariage', 'Festival', 'Anniversaire', 'Corporate', 'Soirée', 'Noël'];
const DEMO_TEMPLATES = [
  { id: 't1', name: 'Mariage élégant', occasion: 'Mariage', color: '#FAF0E6' },
  { id: 't2', name: 'Festival néon', occasion: 'Festival', color: '#1A1A2E' },
  { id: 't3', name: 'Corporate clean', occasion: 'Corporate', color: '#FFFFFF' },
  { id: 't4', name: 'Anniversaire fun', occasion: 'Anniversaire', color: '#FFE4E1' },
];
const MASKS_DATA: { id: MaskType; label: string; path: string }[] = [
  { id: 'rectangle', label: 'Rectangle', path: 'M 5 5 H 95 V 95 H 5 Z' },
  { id: 'circle', label: 'Cercle', path: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5' },
  { id: 'polaroid', label: 'Polaroïd', path: 'M 10 5 H 90 V 80 H 10 Z M 10 80 H 90 V 95 H 10 Z' },
  { id: 'star', label: 'Étoile', path: 'M 50 5 L 61 35 L 95 38 L 70 58 L 78 92 L 50 75 L 22 92 L 30 58 L 5 38 L 39 35 Z' },
  { id: 'badge', label: 'Badge', path: 'M 50 5 L 63 20 L 82 10 L 78 32 L 95 42 L 80 55 L 88 75 L 68 72 L 55 92 L 45 72 L 25 80 L 30 60 L 10 48 L 28 38 L 20 18 L 40 25 Z' },
  { id: 'drop', label: 'Goutte', path: 'M 50 5 C 50 5 85 55 85 70 A 35 35 0 1 1 15 70 C 15 55 50 5 50 5' },
];
const FRAMES = [
  { id: 'frame-simple', label: 'Cadre simple', border: 4, radius: 0, double: false },
  { id: 'frame-rounded', label: 'Cadre arrondi', border: 4, radius: 12, double: false },
  { id: 'frame-thick', label: 'Cadre épais', border: 8, radius: 0, double: false },
  { id: 'frame-double', label: 'Double cadre', border: 3, radius: 0, double: true },
];

/* ─── Assistance Popover ─── */
const AssistancePopoverContent = () => (
  <>
    <div className="px-4 py-3 border-b border-border bg-secondary/50">
      <div className="flex items-center gap-2">
        <Headphones size={16} className="text-foreground" />
        <span className="text-sm font-semibold text-foreground">Besoin d'aide ?</span>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <p className="text-xs text-muted-foreground">Notre équipe vous accompagne.</p>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-xs text-muted-foreground">
        <span>🕐</span><span>Lun – Ven : 9h00 – 18h00</span>
      </div>
      <button onClick={() => window.open('mailto:contact@ecocup.com?subject=Demande%20d%27assistance', '_blank')} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors w-full text-left">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0"><MessageCircle size={16} className="text-foreground" /></div>
        <div><p className="text-sm font-medium text-foreground">Chat / Email</p><p className="text-xs text-muted-foreground">Réponse sous 24h</p></div>
      </button>
    </div>
  </>
);

/* ─── Panel Contents ─── */
const ColorPanel = () => {
  const { currentDesign, setCupColor } = useStore();
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Sélectionnez la couleur de votre gobelet.</p>
      <div className="flex gap-3">
        {[
          { color: '#f2f2f2', label: 'Blanc', style: { backgroundColor: '#f2f2f2' } as React.CSSProperties },
          { color: '#e8f0f5', label: 'Translucide givré', style: { background: 'linear-gradient(135deg, rgba(232,240,245,0.9), rgba(200,220,235,0.7))' } as React.CSSProperties },
        ].map(({ color, label, style }) => (
          <button key={color} onClick={() => setCupColor(color)} className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${currentDesign.cupColor === color ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-secondary'}`}>
            <div className="w-12 h-12 rounded-full border-thin" style={style} />
            <span className="text-[10px] text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ImagePanel = ({ onClose }: { onClose: () => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ dataUrl: string; name: string } | null>(null);
  const [selectedMask, setSelectedMask] = useState<MaskType>(null);
  const { addElement, currentDesign, setSelectedElementId } = useStore();
  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('Fichier trop volumineux (max 10 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setSelectedFile({ dataUrl: e.target?.result as string, name: file.name });
    reader.readAsDataURL(file);
  };
  const handleAdd = () => {
    if (!selectedFile) return;
    const count = currentDesign.elements.length;
    const offset = count * 30;
    const newId = crypto.randomUUID();
    addElement({ id: newId, type: 'image', x: 80 + (offset % 300), y: 50 + (offset % 200), width: 150, height: 150, rotation: 0, opacity: 100, color: '#000000', zIndex: count, src: selectedFile.dataUrl, maskType: selectedMask });
    setSelectedElementId(newId);
    onClose();
  };
  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}>
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <img src={selectedFile.dataUrl} alt="" className="max-h-20 object-contain rounded" />
            <p className="text-[10px] text-muted-foreground truncate max-w-full">{selectedFile.name}</p>
            <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-[10px] text-destructive hover:underline">Supprimer</button>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium mb-1">Glisser-déposer</p>
            <p className="text-[10px] text-muted-foreground mb-2">ou</p>
            <button className="text-[10px] bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:opacity-90">Importer une image</button>
          </>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground">PNG, JPG — 10 Mo max.</div>
      <button onClick={handleAdd} disabled={!selectedFile} className="w-full py-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90">Ajouter au design</button>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
    </div>
  );
};

const TextPanel = () => {
  const handleToolClick = useStore(s => s.handleToolClick);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Ajoutez et personnalisez vos textes.</p>
      <button onClick={() => handleToolClick('text')} className="w-full py-2.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90">+ Ajouter un texte</button>
      <p className="text-[10px] text-muted-foreground">Sélectionnez un texte sur le canvas pour modifier sa police, taille et couleur.</p>
    </div>
  );
};

const StickerPanel = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const { addElement, currentDesign, setSelectedElementId } = useStore();
  const filtered = DEMO_STICKERS.filter((m) => {
    if (category !== 'Tous' && m.category !== category) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const handleSelect = (sticker: typeof DEMO_STICKERS[0]) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${sticker.path}" fill="#111111" stroke="none"/></svg>`;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const newId = crypto.randomUUID();
    const count = currentDesign.elements.length;
    const offset = count * 30;
    addElement({ id: newId, type: 'svg', x: 120 + (offset % 300), y: 60 + (offset % 200), width: 80, height: 80, rotation: 0, opacity: 100, color: '#111111', zIndex: count, src: url });
    setSelectedElementId(newId);
    onClose();
  };
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Trouver un sticker" className="w-full text-xs border-thin rounded-md pl-7 pr-2 py-1.5 bg-background" />
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {STICKER_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={`text-[9px] px-2 py-1 rounded-full whitespace-nowrap ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{cat}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {filtered.map((m) => (
          <button key={m.id} onClick={() => handleSelect(m)} draggable onDragStart={(e) => {
            const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${m.path}" fill="#111111" stroke="none"/></svg>`;
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            e.dataTransfer.setData('application/x-sticker', JSON.stringify({ type: 'svg', src: url, name: m.name }));
            e.dataTransfer.effectAllowed = 'copy';
          }} className="aspect-square border-thin rounded-lg flex flex-col items-center justify-center gap-0.5 hover:bg-secondary/50 cursor-grab">
            <svg viewBox="0 0 100 100" className="w-8 h-8"><path d={m.path} fill="currentColor" /></svg>
            <span className="text-[7px] text-muted-foreground truncate w-full text-center px-0.5">{m.name}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="col-span-3 text-[10px] text-muted-foreground text-center py-4">Aucun sticker</p>}
      </div>
    </div>
  );
};

const CollectionPanel = ({ onClose }: { onClose: () => void }) => {
  const [occasion, setOccasion] = useState('');
  const { setCupColor } = useStore();
  const filtered = occasion ? DEMO_TEMPLATES.filter((t) => t.occasion === occasion) : DEMO_TEMPLATES;
  return (
    <div className="space-y-3">
      <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background">
        <option value="">Toutes les occasions</option>
        {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-1.5">
        {filtered.map((tpl) => (
          <button key={tpl.id} onClick={() => { if (window.confirm('Remplacer le design actuel ?')) { setCupColor(tpl.color); onClose(); } }} className="border-thin rounded-lg overflow-hidden hover:shadow-md">
            <div className="aspect-[3/4] flex items-center justify-center" style={{ backgroundColor: tpl.color }}>
              <svg viewBox="0 0 60 80" className="w-8 h-10 opacity-20"><path d="M 10 5 L 5 70 Q 5 75 10 75 L 50 75 Q 55 75 55 70 L 50 5 Z" fill="currentColor" /></svg>
            </div>
            <div className="p-1.5">
              <p className="text-[9px] font-medium truncate">{tpl.name}</p>
              <p className="text-[7px] text-muted-foreground">{tpl.occasion}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const MaskPanel = ({ onClose }: { onClose: () => void }) => {
  const { addElement, currentDesign, setSelectedElementId } = useStore();
  const [tab, setTab] = useState<'masks' | 'frames'>('masks');
  const handleMaskSelect = (mask: typeof MASKS_DATA[0]) => {
    const count = currentDesign.elements.length;
    const offset = count * 30;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${mask.path}" fill="#111111" stroke="none"/></svg>`;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const newId = crypto.randomUUID();
    addElement({ id: newId, type: 'svg', x: 100 + (offset % 300), y: 60 + (offset % 200), width: 100, height: 100, rotation: 0, opacity: 100, color: '#111111', zIndex: count, src: url });
    setSelectedElementId(newId);
    onClose();
  };
  const handleFrameSelect = (frame: typeof FRAMES[0]) => {
    const count = currentDesign.elements.length;
    const offset = count * 30;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="${frame.border}" y="${frame.border}" width="${100 - frame.border * 2}" height="${100 - frame.border * 2}" rx="${frame.radius}" fill="none" stroke="#111111" stroke-width="${frame.border}"/>${frame.double ? `<rect x="${frame.border * 3}" y="${frame.border * 3}" width="${100 - frame.border * 6}" height="${100 - frame.border * 6}" rx="${frame.radius}" fill="none" stroke="#111111" stroke-width="${frame.border - 1}"/>` : ''}</svg>`;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const newId = crypto.randomUUID();
    addElement({ id: newId, type: 'svg', x: 100 + (offset % 300), y: 60 + (offset % 200), width: 120, height: 120, rotation: 0, opacity: 100, color: '#111111', zIndex: count, src: url });
    setSelectedElementId(newId);
    onClose();
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Choisissez une forme pour recadrer votre photo.</p>
      <div className="flex gap-1">
        <button onClick={() => setTab('masks')} className={`text-[10px] px-2.5 py-1 rounded-full ${tab === 'masks' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>Masques</button>
        <button onClick={() => setTab('frames')} className={`text-[10px] px-2.5 py-1 rounded-full ${tab === 'frames' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>Cadres</button>
      </div>
      {tab === 'masks' && (
        <div className="grid grid-cols-3 gap-1.5">
          {MASKS_DATA.map((m) => (
            <button key={m.id} onClick={() => handleMaskSelect(m)} className="aspect-square border-thin rounded-lg flex flex-col items-center justify-center gap-0.5 hover:bg-secondary/50">
              <svg viewBox="0 0 100 100" className="w-8 h-8"><path d={m.path} fill="currentColor" /></svg>
              <span className="text-[7px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'frames' && (
        <div className="grid grid-cols-2 gap-1.5">
          {FRAMES.map((f) => (
            <button key={f.id} onClick={() => handleFrameSelect(f)} className="aspect-square border-thin rounded-lg flex flex-col items-center justify-center gap-0.5 hover:bg-secondary/50">
              <svg viewBox="0 0 100 100" className="w-8 h-8">
                <rect x={f.border} y={f.border} width={100 - f.border * 2} height={100 - f.border * 2} rx={f.radius} fill="none" stroke="currentColor" strokeWidth={f.border} />
                {f.double && <rect x={f.border * 3} y={f.border * 3} width={100 - f.border * 6} height={100 - f.border * 6} rx={f.radius} fill="none" stroke="currentColor" strokeWidth={f.border - 1} />}
              </svg>
              <span className="text-[7px] text-muted-foreground">{f.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GraduationPanel = () => {
  const { showGraduation, showGraduationMask, currentDesign, setShowGraduation, setShowGraduationMask, setGraduation } = useStore();
  return (
    <div className="space-y-3">
      <ToggleSwitch label="Afficher graduation" checked={showGraduation} onChange={setShowGraduation} />
      <ToggleSwitch label="Afficher masque" checked={showGraduationMask} onChange={setShowGraduationMask} />
    </div>
  );
};

/* ─── Mobile Color Popover ─── */
const MobileColorPopover = () => {
  const { currentDesign, setCupColor, setShowColorPopover } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowColorPopover(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setShowColorPopover]);
  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 w-[180px] bg-background border-thin rounded-xl shadow-lg p-3 z-50 animate-scale-in">
      <h4 className="text-xs font-semibold mb-2">Couleur du gobelet</h4>
      <div className="flex gap-2">
        <button onClick={() => setCupColor('#f2f2f2')} className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 ${currentDesign.cupColor === '#f2f2f2' ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-secondary'}`}>
          <div className="w-10 h-10 rounded-full border-thin" style={{ backgroundColor: '#f2f2f2' }} /><span className="text-[10px]">Blanc</span>
        </button>
        <button onClick={() => setCupColor('#e8f0f5')} className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 ${currentDesign.cupColor === '#e8f0f5' ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-secondary'}`}>
          <div className="w-10 h-10 rounded-full border-thin" style={{ background: 'linear-gradient(135deg, rgba(232,240,245,0.9), rgba(200,220,235,0.7))' }} /><span className="text-[10px] text-center leading-tight">Translucide givré</span>
        </button>
      </div>
    </div>
  );
};

/* ─── Mobile tools ─── */
const MOBILE_TOOLS: { id: ActiveTool | 'ai-wizard'; icon: React.ElementType; label: string; showPlus?: boolean }[] = [
  { id: 'color', icon: Palette, label: 'Gobelet' },
  { id: 'image', icon: ImagePlus, label: 'Image' },
  { id: 'text', icon: Type, label: 'Texte', showPlus: true },
  { id: 'sticker', icon: Shapes, label: 'Sticker', showPlus: true },
  { id: 'collection', icon: BookOpen, label: 'Collection', showPlus: true },
  { id: 'mask', icon: Frame, label: 'Masque', showPlus: true },
  { id: 'ai-wizard', icon: Sparkles, label: 'IA' },
];

/* ─── Main Component ─── */
const LeftSidebar = ({ onOpenAIWizard }: { onOpenAIWizard?: () => void }) => {
  const activeTool = useStore((s) => s.activeTool);
  const showColorPopover = useStore((s) => s.showColorPopover);
  const handleToolClick = useStore((s) => s.handleToolClick);
  const startTour = useStore((s) => s.startTour);
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<PanelId>(null);

  const handleTabClick = (id: string) => {
    if (id === 'ai-wizard') { onOpenAIWizard?.(); return; }
    if (activePanel === id) { setActivePanel(null); }
    else {
      setActivePanel(id as PanelId);
      if (id === 'text') handleToolClick('text');
    }
  };

  /* ── Mobile ── */
  if (isMobile) {
    const onToolClick = (id: string) => {
      if (id === 'ai-wizard') onOpenAIWizard?.();
      else handleToolClick(id as ActiveTool);
    };
    return (
      <nav className="h-14 flex items-center justify-around border-t border-thin bg-background shrink-0 relative">
        {MOBILE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative">
              <button data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined} onClick={() => onToolClick(tool.id)} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] transition-colors ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground'}`}>
                <div className="relative"><Icon size={18} />{tool.showPlus && <Plus size={9} strokeWidth={3} className="absolute -top-0.5 -right-1.5" />}</div>
                <span className="truncate max-w-[56px]">{tool.label}</span>
              </button>
              {tool.id === 'color' && showColorPopover && <MobileColorPopover />}
            </div>
          );
        })}
        <button data-tour="aide" onClick={startTour} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] text-muted-foreground"><HelpCircle size={18} /><span>Aide</span></button>
        <Popover>
          <PopoverTrigger asChild><button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] text-muted-foreground"><Headphones size={18} /><span>Assistance</span></button></PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-72 p-0"><AssistancePopoverContent /></PopoverContent>
        </Popover>
      </nav>
    );
  }

  /* ── Desktop ── */
  const currentTab = TABS.find(t => t.id === activePanel);
  const renderPanelContent = () => {
    const close = () => setActivePanel(null);
    switch (activePanel) {
      case 'color': return <ColorPanel />;
      case 'image': return <ImagePanel onClose={close} />;
      case 'text': return <TextPanel />;
      case 'sticker': return <StickerPanel onClose={close} />;
      case 'collection': return <CollectionPanel onClose={close} />;
      case 'mask': return <MaskPanel onClose={close} />;
      case 'graduation': return <GraduationPanel />;
      case 'ai-wizard': return (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Générez un visuel unique grâce à l'intelligence artificielle.</p>
          <button onClick={onOpenAIWizard} className="w-full py-2.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1.5"><Sparkles size={14} /> Générer un visuel</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <aside className="flex h-full shrink-0">
      <div className="w-14 border-r border-thin bg-background flex flex-col items-center py-2 gap-0.5 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePanel === tab.id;
          return (
            <button key={tab.id} data-tour={tab.id === 'color' ? 'color' : tab.id === 'image' ? 'image' : tab.id === 'text' ? 'text-tool' : tab.id === 'sticker' ? 'sticker-tool' : undefined} onClick={() => handleTabClick(tab.id)}
              className={`w-12 h-[52px] flex flex-col items-center justify-center gap-0.5 text-[9px] transition-all ${isActive ? 'bg-secondary text-foreground border-r-2 border-foreground rounded-l-lg rounded-r-none' : 'text-muted-foreground hover:bg-secondary rounded-lg'}`}>
              <Icon size={18} /><span>{tab.label}</span>
            </button>
          );
        })}
        <div className="flex-1" />
        <button data-tour="aide" onClick={startTour} className="w-12 h-[52px] flex flex-col items-center justify-center gap-0.5 text-[9px] text-muted-foreground hover:bg-secondary rounded-lg"><HelpCircle size={18} /><span>Aide</span></button>
        <Popover>
          <PopoverTrigger asChild><button className="w-12 h-[52px] flex flex-col items-center justify-center gap-0.5 text-[9px] text-muted-foreground hover:bg-secondary rounded-lg"><Headphones size={18} /><span className="text-[8px]">Assistance</span></button></PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-72 p-0"><AssistancePopoverContent /></PopoverContent>
        </Popover>
      </div>
      {activePanel && (
        <div className="w-[260px] border-r border-thin bg-background flex flex-col overflow-hidden" data-tour="sidebar-panel">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-thin shrink-0">
            <span className="text-[13px] font-medium">{currentTab?.title}</span>
            <button onClick={() => setActivePanel(null)} className="p-1 rounded hover:bg-secondary"><X size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">{renderPanelContent()}</div>
        </div>
      )}
    </aside>
  );
};

export default LeftSidebar;
