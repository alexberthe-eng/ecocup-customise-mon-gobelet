import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SharePage = () => {
  const { id } = useParams<{ id: string }>();
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDesign = async () => {
      const { data, error } = await supabase
        .from('shared_designs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setExpired(true);
      } else {
        setDesign(data);
      }
      setLoading(false);
    };
    fetchDesign();
  }, [id]);

  // Set og:image meta tag dynamically
  useEffect(() => {
    if (!design?.image_url) return;
    let meta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      document.head.appendChild(meta);
    }
    meta.content = design.image_url;

    let metaTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (!metaTitle) {
      metaTitle = document.createElement('meta');
      metaTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaTitle);
    }
    metaTitle.content = `${design.design_name} — ECOCUP®`;

    document.title = `${design.design_name} — ECOCUP®`;
  }, [design]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (expired || !design) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 p-6">
        <div className="text-5xl">⏰</div>
        <h1 className="text-xl font-bold">Lien expiré</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Ce lien de partage a expiré ou n'existe pas. Les liens sont valides pendant 7 jours après leur création.
        </p>
        <a href="/" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity">
          Créer mon design
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <header className="w-full h-12 flex items-center px-4 border-b border-border shrink-0">
        <a href="/" className="font-bold text-sm tracking-wide">ECOCUP®</a>
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">Aperçu partagé</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-2xl w-full">
        <h1 className="text-lg font-semibold text-center">{design.design_name}</h1>

        {design.image_url && (
          <div className="w-full" style={{ maxWidth: 600 }}>
            <img
              src={design.image_url}
              alt={design.design_name}
              className="w-full h-auto rounded-xl border border-border shadow-md"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ backgroundColor: design.cup_color }}
          />
          <span>Couleur du gobelet</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Partagé le {new Date(design.created_at).toLocaleDateString('fr-FR')} · Expire le{' '}
          {new Date(design.expires_at).toLocaleDateString('fr-FR')}
        </div>

        <a
          href="/"
          className="px-6 py-3 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Créez votre propre design →
        </a>
      </main>
    </div>
  );
};

export default SharePage;
