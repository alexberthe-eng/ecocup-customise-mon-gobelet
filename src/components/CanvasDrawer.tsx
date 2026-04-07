import { useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useStore, MaskType, OpenDrawer } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';

/* ─── Shared drawer shell ─── */
const DrawerShell = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className="absolute inset-0 bg-foreground/10 z-30 animate-fade-in"
        style={{ animationDuration: '200ms' }}
        onClick={onClose}
      />
      <div
        className={`absolute top-0 right-0 bottom-0 bg-background border-l border-thin z-40 flex flex-col animate-slide-in-right ${
          isMobile ? 'w-full' : 'w-[320px]'
        }`}
        style={{ animationDuration: '200ms' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-secondary z-10"
        >
          <X size={14} />
        </button>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
};

/* ─── MASKS data ─── */
const MASKS: { id: MaskType; label: string; path: string }[] = [
  { id: 'rectangle', label: 'Rectangle', path: 'M 5 5 H 95 V 95 H 5 Z' },
  { id: 'circle', label: 'Cercle', path: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5' },
  { id: 'polaroid', label: 'Polaroïd', path: 'M 10 5 H 90 V 80 H 10 Z M 10 80 H 90 V 95 H 10 Z' },
  { id: 'star', label: 'Étoile', path: 'M 50 5 L 61 35 L 95 38 L 70 58 L 78 92 L 50 75 L 22 92 L 30 58 L 5 38 L 39 35 Z' },
  { id: 'badge', label: 'Badge', path: 'M 50 5 L 63 20 L 82 10 L 78 32 L 95 42 L 80 55 L 88 75 L 68 72 L 55 92 L 45 72 L 25 80 L 30 60 L 10 48 L 28 38 L 20 18 L 40 25 Z' },
  { id: 'drop', label: 'Goutte', path: 'M 50 5 C 50 5 85 55 85 70 A 35 35 0 1 1 15 70 C 15 55 50 5 50 5' },
];

/* ─── Image Drawer ─── */
const ImageDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<'mask' | 'upload'>('mask');
  const [selectedMask, setSelectedMask] = useState<MaskType>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addElement, currentDesign } = useStore();

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const count = currentDesign.elements.length;
      const offset = count * 30;
      addElement({
        id: crypto.randomUUID(),
        type: 'image',
        x: 80 + (offset % 300), y: 50 + (offset % 200), width: 150, height: 150,
        rotation: 0, opacity: 100, color: '#000000',
        zIndex: count,
        src: e.target?.result as string,
        maskType: selectedMask,
      });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (step === 'mask') {
    return (
      <div className="p-4 pt-10">
        <h3 className="text-sm font-semibold mb-1">Importer une image</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Choisissez une forme de masque pour votre image</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {MASKS.map((m) => (
            <button key={m.id} onClick={() => { setSelectedMask(m.id); setStep('upload'); }}
              className="aspect-square border-thin rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-secondary/50 transition-colors">
              <svg viewBox="0 0 100 100" className="w-10 h-10 text-foreground"><path d={m.path} fill="none" stroke="currentColor" strokeWidth="2" /></svg>
              <span className="text-[9px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
          <div className="aspect-square border border-dashed rounded-lg flex items-center justify-center text-[9px] text-muted-foreground opacity-50">Admin</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-10">
      <h3 className="text-sm font-semibold mb-3">Importer votre image</h3>
      <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}>
        <p className="text-xs text-muted-foreground mb-2">Glissez votre photo ici</p>
        <button className="text-xs border-thin rounded-md px-4 py-2 hover:bg-secondary">Importer votre image</button>
        <p className="text-[9px] text-muted-foreground mt-3">PNG, JPG, SVG — max 10 Mo — max 4000px</p>
      </div>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
      <button onClick={() => setStep('mask')} className="text-[10px] text-muted-foreground mt-3 hover:underline">← Changer le masque</button>
    </div>
  );
};

/* ─── Motif Drawer ─── */
const CATEGORIES = ['Tous', 'Animaux', 'Fête', 'Mariage', 'Sport', 'Vacances', 'Drôle'];

const DEMO_MOTIFS = [
  { id: '1', name: 'Étoile', category: 'Fête', path: 'M 50 5 L 61 35 L 95 38 L 70 58 L 78 92 L 50 75 L 22 92 L 30 58 L 5 38 L 39 35 Z' },
  { id: '2', name: 'Cœur', category: 'Mariage', path: 'M 50 85 C 20 60 5 40 5 25 A 20 20 0 0 1 50 20 A 20 20 0 0 1 95 25 C 95 40 80 60 50 85' },
  { id: '3', name: 'Soleil', category: 'Vacances', path: 'M 50 10 L 55 30 L 75 15 L 65 35 L 85 35 L 70 45 L 90 55 L 70 55 L 80 75 L 60 60 L 55 80 L 50 60 L 45 80 L 40 60 L 20 75 L 30 55 L 10 55 L 30 45 L 15 35 L 35 35 L 25 15 L 45 30 Z' },
  { id: '4', name: 'Patte', category: 'Animaux', path: 'M 35 60 A 8 8 0 1 1 35 60.1 M 55 55 A 7 7 0 1 1 55 55.1 M 25 45 A 6 6 0 1 1 25 45.1 M 60 40 A 6 6 0 1 1 60 40.1 M 45 75 C 35 65 30 55 40 50 C 45 48 50 48 55 50 C 65 55 60 65 50 75 Z' },
  { id: '5', name: 'Ballon', category: 'Sport', path: 'M 50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 M 30 20 Q 50 50 30 80 M 70 20 Q 50 50 70 80 M 10 50 H 90' },
  { id: '6', name: 'Rire', category: 'Drôle', path: 'M 50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 M 35 40 A 3 3 0 1 0 35 40.1 M 65 40 A 3 3 0 1 0 65 40.1 M 30 60 Q 50 80 70 60' },
];

const MotifDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const { addElement, currentDesign, setSelectedElementId } = useStore();

  const filtered = DEMO_MOTIFS.filter((m) => {
    if (category !== 'Tous' && m.category !== category) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSelect = (motif: (typeof DEMO_MOTIFS)[0]) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${motif.path}" fill="#111111" stroke="none"/></svg>`;
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
    <div className="p-4 pt-10">
      <h3 className="text-sm font-semibold mb-3">Ajouter un motif</h3>
      <div className="relative mb-3">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Trouver un motif" className="w-full text-xs border-thin rounded-md pl-7 pr-2 py-1.5 bg-background" />
      </div>
      <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m)}
            draggable
            onDragStart={(e) => {
              const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${m.path}" fill="#111111" stroke="none"/></svg>`;
              const blob = new Blob([svgString], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              e.dataTransfer.setData('application/x-motif', JSON.stringify({ type: 'svg', src: url, name: m.name }));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            className="aspect-square border-thin rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-secondary/50 transition-colors cursor-grab active:cursor-grabbing"
            title={m.name}
          >
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-foreground"><path d={m.path} fill="currentColor" stroke="none" /></svg>
            <span className="text-[8px] text-muted-foreground truncate w-full text-center px-1">{m.name}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="col-span-3 text-[10px] text-muted-foreground text-center py-6">Aucun motif trouvé</p>}
      </div>
    </div>
  );
};

/* ─── Collection Drawer ─── */
const OCCASIONS = ['Mariage', 'Festival', 'Anniversaire', 'Corporate', 'Soirée', 'Noël'];
const DEMO_TEMPLATES = [
  { id: 't1', name: 'Mariage élégant', occasion: 'Mariage', color: '#FAF0E6' },
  { id: 't2', name: 'Festival néon', occasion: 'Festival', color: '#1A1A2E' },
  { id: 't3', name: 'Corporate clean', occasion: 'Corporate', color: '#FFFFFF' },
  { id: 't4', name: 'Anniversaire fun', occasion: 'Anniversaire', color: '#FFE4E1' },
];

const CollectionDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const [occasion, setOccasion] = useState('');
  const { setCupColor } = useStore();

  const filtered = occasion ? DEMO_TEMPLATES.filter((t) => t.occasion === occasion) : DEMO_TEMPLATES;

  const handleSelect = (tpl: (typeof DEMO_TEMPLATES)[0]) => {
    if (window.confirm('Voulez-vous remplacer votre design actuel ?')) {
      setCupColor(tpl.color);
      onClose();
    }
  };

  return (
    <div className="p-4 pt-10">
      <h3 className="text-sm font-semibold mb-3">Collection</h3>
      <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background mb-4">
        <option value="">Toutes les occasions</option>
        {OCCASIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((tpl) => (
          <button key={tpl.id} onClick={() => handleSelect(tpl)} className="border-thin rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] flex items-center justify-center" style={{ backgroundColor: tpl.color }}>
              <svg viewBox="0 0 60 80" className="w-10 h-14 opacity-20"><path d="M 10 5 L 5 70 Q 5 75 10 75 L 50 75 Q 55 75 55 70 L 50 5 Z" fill="currentColor" /></svg>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-medium truncate">{tpl.name}</p>
              <p className="text-[8px] text-muted-foreground">{tpl.occasion}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Drawer component ─── */
const CanvasDrawer = () => {
  const openDrawer = useStore((s) => s.openDrawer);
  const setOpenDrawer = useStore((s) => s.setOpenDrawer);

  if (!openDrawer) return null;

  const close = () => setOpenDrawer(null);

  return (
    <DrawerShell onClose={close}>
      {openDrawer === 'image' && <ImageDrawerContent onClose={close} />}
      {openDrawer === 'motif' && <MotifDrawerContent onClose={close} />}
      {openDrawer === 'collection' && <CollectionDrawerContent onClose={close} />}
    </DrawerShell>
  );
};

export default CanvasDrawer;
