import { useState, useEffect } from 'react';
import { PenLine, FolderOpen, ArrowLeft, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import type { User } from '@supabase/supabase-js';

interface SavedDesign {
  id: string;
  design_name: string;
  design_data: any;
  cup_color: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface StartModalProps {
  open: boolean;
  onClose: () => void;
  onLoadDesign: (design: SavedDesign) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const StartModal = ({ open, onClose, onLoadDesign }: StartModalProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'choice' | 'designs'>('choice');

  useEffect(() => {
    if (!open) return;
    setView('choice');
    setLoading(true);
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('saved_designs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(12);
        setDesigns((data as SavedDesign[]) || []);
      } else {
        setDesigns([]);
      }
      setLoading(false);
    })();
  }, [open]);

  if (!open) return null;

  const handleResumeClick = () => {
    if (user && designs.length > 0) {
      setView('designs');
    } else if (user && designs.length === 0) {
      toast("Vous n'avez pas encore de design sauvegardé");
    } else {
      navigate('/auth?redirect=/');
    }
  };

  const modalWidth = view === 'choice' ? 560 : 720;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="bg-background flex flex-col overflow-hidden"
        style={{
          borderRadius: 14,
          width: isMobile ? '95vw' : modalWidth,
          maxWidth: '95vw',
          maxHeight: '90vh',
          transition: 'width 300ms ease',
        }}
      >
        {view === 'choice' ? (
          <>
            {/* Header */}
            <div className="text-center" style={{ padding: '28px 28px 0' }}>
              <div className="text-xs font-bold tracking-widest text-muted-foreground mb-2">ECOCUP®</div>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Que souhaitez-vous faire ?</h2>
            </div>

            {/* Cards */}
            <div
              className="flex gap-3"
              style={{ padding: '24px 28px 28px', flexDirection: isMobile ? 'column' : 'row' }}
            >
              {/* New design */}
              <button
                onClick={onClose}
                className="flex-1 flex flex-col items-center text-center border rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  borderWidth: 1.5,
                  borderColor: 'hsl(var(--border))',
                  padding: '24px 20px',
                  gap: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                  e.currentTarget.style.background = 'hsl(var(--secondary))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--border))';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <PenLine size={28} className="text-foreground" />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Créer un nouveau design</div>
                <div className="text-muted-foreground" style={{ fontSize: 12 }}>
                  Partir d'une page blanche et laisser libre cours à votre créativité
                </div>
              </button>

              {/* Resume */}
              <button
                onClick={handleResumeClick}
                className="flex-1 flex flex-col items-center text-center border rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  borderWidth: 1.5,
                  borderColor: 'hsl(var(--border))',
                  padding: '24px 20px',
                  gap: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                  e.currentTarget.style.background = 'hsl(var(--secondary))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--border))';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <FolderOpen size={28} className="text-foreground" />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Reprendre une création</div>
                <div style={{ fontSize: 12 }}>
                  {user && designs.length > 0 ? (
                    <span style={{ color: '#059669' }}>{designs.length} design(s) sauvegardé(s)</span>
                  ) : user && designs.length === 0 ? (
                    <span className="text-muted-foreground">Aucun design sauvegardé pour l'instant</span>
                  ) : (
                    <span className="text-muted-foreground">Connectez-vous pour accéder à vos créations</span>
                  )}
                </div>
              </button>
            </div>

            {/* Bottom link */}
            {!user && (
              <div className="text-center pb-5 text-muted-foreground" style={{ fontSize: 12 }}>
                Vous avez déjà un compte ?{' '}
                <a href="/auth" className="text-primary underline">Se connecter</a>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Designs view header */}
            <div
              className="flex items-center border-b border-border shrink-0"
              style={{ padding: '20px 20px 16px' }}
            >
              <button onClick={() => setView('choice')} className="p-1 rounded hover:bg-secondary mr-2">
                <ArrowLeft size={16} />
              </button>
              <h2 className="flex-1 text-center" style={{ fontSize: 18, fontWeight: 600 }}>Mes créations</h2>
              <button onClick={onClose} className="p-1 rounded hover:bg-secondary ml-2">
                <X size={16} />
              </button>
            </div>

            {/* Designs grid */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px 20px', maxHeight: '60vh' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : designs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" style={{ fontSize: 13 }}>
                  Aucun design sauvegardé
                </div>
              ) : (
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)' }}
                >
                  {designs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onLoadDesign(d)}
                      className="border rounded-lg overflow-hidden cursor-pointer transition-all hover:-translate-y-px text-left"
                      style={{ borderColor: 'hsl(var(--border))' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--foreground))'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                    >
                      <div style={{ height: 100, overflow: 'hidden' }}>
                        {d.thumbnail_url ? (
                          <img src={d.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="w-full h-full" style={{ backgroundColor: d.cup_color || '#f2f2f2' }} />
                        )}
                      </div>
                      <div style={{ padding: '10px 10px 8px' }}>
                        <div className="truncate" style={{ fontSize: 12, fontWeight: 500 }}>{d.design_name}</div>
                        <div className="text-muted-foreground" style={{ fontSize: 10 }}>{timeAgo(d.created_at)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pb-4">
              <a href="/account" className="text-primary hover:underline" style={{ fontSize: 12 }}>
                Voir tous mes designs →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StartModal;
