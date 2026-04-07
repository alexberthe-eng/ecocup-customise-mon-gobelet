import { useRef, useState } from 'react';
import { useStore, MaskType } from '@/store/useStore';

const CUP_COLORS = [
  '#FFFFFF', '#111111', '#378ADD', '#1D9E75', '#EF9F27',
  '#E24B4A', '#FF69B4', '#9B59B6', '#F5F5DC', '#C0C0C0',
];

const MASKS: { id: MaskType; label: string; path: string }[] = [
  { id: 'rectangle', label: 'Rectangle', path: 'M 5 5 H 95 V 95 H 5 Z' },
  { id: 'circle', label: 'Cercle', path: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5' },
  { id: 'polaroid', label: 'Polaroïd', path: 'M 10 5 H 90 V 80 H 10 Z M 10 80 H 90 V 95 H 10 Z' },
  { id: 'star', label: 'Étoile', path: 'M 50 5 L 61 35 L 95 38 L 70 58 L 78 92 L 50 75 L 22 92 L 30 58 L 5 38 L 39 35 Z' },
  { id: 'badge', label: 'Badge', path: 'M 50 5 L 63 20 L 82 10 L 78 32 L 95 42 L 80 55 L 88 75 L 68 72 L 55 92 L 45 72 L 25 80 L 30 60 L 10 48 L 28 38 L 20 18 L 40 25 Z' },
  { id: 'drop', label: 'Goutte', path: 'M 50 5 C 50 5 85 55 85 70 A 35 35 0 1 1 15 70 C 15 55 50 5 50 5' },
];

const ColorPanel = () => {
  const { setCupColor, currentDesign } = useStore();
  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold mb-2">Couleur du gobelet</h3>
      <div className="grid grid-cols-5 gap-2">
        {CUP_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setCupColor(c)}
            className={`w-8 h-8 rounded-lg border-2 transition-all ${
              currentDesign.cupColor === c ? 'border-accent scale-110' : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
};

const ImagePanel = () => {
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
      addElement({
        id: crypto.randomUUID(),
        type: 'image',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        rotation: 0,
        opacity: 100,
        color: '#000000',
        zIndex: currentDesign.elements.length,
        src: e.target?.result as string,
        maskType: selectedMask,
      });
      setStep('mask');
      setSelectedMask(null);
    };
    reader.readAsDataURL(file);
  };

  if (step === 'mask') {
    return (
      <div className="p-3">
        <h3 className="text-xs font-semibold mb-2">Forme du masque</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {MASKS.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelectedMask(m.id); setStep('upload'); }}
              className={`aspect-square border-thin rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-secondary/50 transition-colors ${
                selectedMask === m.id ? 'border-accent bg-accent/10' : ''
              }`}
            >
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-foreground">
                <path d={m.path} fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-[9px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
          <div className="aspect-square border border-dashed rounded-lg flex items-center justify-center text-[9px] text-muted-foreground opacity-50">
            Admin
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold mb-2">Importer une image</h3>
      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <p className="text-xs text-muted-foreground mb-2">Glissez votre photo ici</p>
        <button className="text-xs border-thin rounded-md px-3 py-1.5 hover:bg-secondary">
          Importer votre image
        </button>
        <p className="text-[9px] text-muted-foreground mt-2">PNG, JPG, SVG — max 10 Mo</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button onClick={() => setStep('mask')} className="text-[10px] text-muted-foreground mt-2 hover:underline">
        ← Changer le masque
      </button>
    </div>
  );
};

const TextPanel = () => {
  const [text, setText] = useState('Votre texte');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#111111');
  const { addElement, currentDesign } = useStore();

  const handleAdd = () => {
    addElement({
      id: crypto.randomUUID(),
      type: 'text',
      x: 150,
      y: 150,
      width: 200,
      height: 60,
      rotation: 0,
      opacity: 100,
      color,
      zIndex: currentDesign.elements.length,
      text,
      fontFamily: 'system-ui',
      fontSize,
    });
  };

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold mb-2">Ajouter du texte</h3>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background mb-2"
        placeholder="Saisissez votre texte"
      />
      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-[10px]">
          <span className="text-muted-foreground">Taille</span>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full border-thin rounded px-1.5 py-1 bg-background"
          />
        </label>
        <label className="text-[10px]">
          <span className="text-muted-foreground">Couleur</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-7 rounded cursor-pointer"
          />
        </label>
      </div>
      <button
        onClick={handleAdd}
        className="w-full bg-primary text-primary-foreground text-xs py-1.5 rounded-md hover:opacity-90 transition-opacity"
      >
        Ajouter au canvas
      </button>
    </div>
  );
};

const MotifPanel = () => {
  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold mb-2">Motifs</h3>
      <p className="text-[10px] text-muted-foreground">Bibliothèque de motifs à venir. Utilisez l'espace admin pour ajouter des pictos.</p>
    </div>
  );
};

const CollectionPanel = () => {
  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold mb-2">Collection</h3>
      <p className="text-[10px] text-muted-foreground">Designs pré-configurés à venir.</p>
    </div>
  );
};

export const ToolPanel = () => {
  const activeTool = useStore((s) => s.activeTool);

  if (!activeTool || activeTool === 'aide') return null;

  return (
    <div className="w-[220px] border-r border-thin bg-background overflow-y-auto shrink-0">
      {activeTool === 'color' && <ColorPanel />}
      {activeTool === 'image' && <ImagePanel />}
      {activeTool === 'text' && <TextPanel />}
      {activeTool === 'motif' && <MotifPanel />}
      {activeTool === 'collection' && <CollectionPanel />}
    </div>
  );
};
