import { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import ToggleSwitch from '@/components/ToggleSwitch';

/* ─── Categories (static for now) ─── */
const CATEGORIES = [
  { id: 'all', label: 'Toutes' },
  { id: 'mariage', label: 'Mariage' },
  { id: 'festival', label: 'Festival' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'anniversaire', label: 'Anniversaire' },
  { id: 'sport', label: 'Sport' },
];

interface GraduationItem {
  id: string;
  name: string;
  svg_url: string;
  status: string;
}

const GraduationPanel = () => {
  const {
    showGraduation,
    showGraduationMask,
    setShowGraduation,
    setShowGraduationMask,
    currentDesign,
    setGraduation,
  } = useStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [graduations, setGraduations] = useState<GraduationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGradId, setSelectedGradId] = useState<string | null>(null);

  /* ─── Fetch graduations from DB ─── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('graduations')
        .select('id, name, svg_url, status')
        .eq('status', 'active')
        .order('name');
      if (!error && data) setGraduations(data);
      setLoading(false);
    })();
  }, []);

  /* ─── Filter ─── */
  const filtered = useMemo(() => {
    let list = graduations;
    if (category !== 'all') {
      list = list.filter((g) =>
        g.name.toLowerCase().includes(category.toLowerCase())
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    return list;
  }, [graduations, category, search]);

  const handleValidate = () => {
    if (!selectedGradId) return;
    const grad = graduations.find((g) => g.id === selectedGradId);
    if (grad) {
      setGraduation(grad.id);
      setShowGraduation(true);
    }
  };

  return (
    <div className="flex flex-col h-full -m-3">
      {/* Toggles */}
      <div className="px-4 py-3 space-y-3 shrink-0">
        <ToggleSwitch
          label="Afficher graduation"
          checked={showGraduation}
          onChange={setShowGraduation}
        />
        <ToggleSwitch
          label="Afficher masque"
          checked={showGraduationMask}
          onChange={setShowGraduationMask}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-4 shrink-0" />

      {/* Search */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TROUVER UNE GRADUATION"
            className="w-full h-[38px] bg-secondary border-none rounded-md pl-8 pr-8 text-[11px] font-semibold tracking-wide text-muted-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-secondary/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-2 shrink-0">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">
          Les plus recherchés
        </p>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                category === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-8">
            Aucune graduation trouvée.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((g) => (
              <button
                key={g.id}
                onClick={() =>
                  setSelectedGradId(selectedGradId === g.id ? null : g.id)
                }
                className={`aspect-[3/4] rounded-lg border-2 overflow-hidden flex items-center justify-center transition-all ${
                  selectedGradId === g.id
                    ? 'border-accent ring-2 ring-accent/30'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <img
                  src={g.svg_url}
                  alt={g.name}
                  className="w-full h-full object-contain p-2"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border shrink-0 space-y-2">
        <p className="text-[10px] text-muted-foreground text-center">
          Sélectionnez une graduation et ajoutez-la à votre design
        </p>
        <button
          onClick={handleValidate}
          disabled={!selectedGradId}
          className="w-full py-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Valider la graduation
        </button>
      </div>
    </div>
  );
};

export default GraduationPanel;
