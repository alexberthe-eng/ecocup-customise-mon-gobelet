import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Save, Share2, Menu, Check, X, LogOut, Loader2, Copy, User, Download } from 'lucide-react';
import { useStore, PRODUCT_CAPACITIES } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const TopBar = () => {
  const cart = useStore((s) => s.cart);
  const designName = useStore((s) => s.currentDesign.name);
  const cupColor = useStore((s) => s.currentDesign.cupColor);
  const productType = useStore((s) => s.currentDesign.productType);
  const capacity = useStore((s) => s.currentDesign.capacity);
  const isDirty = useStore((s) => s.isDirty);
  const setIsDirty = useStore((s) => s.setIsDirty);
  const setDesignName = useStore((s) => s.setDesignName);
  const showRightPanel = useStore((s) => s.showRightPanel);
  const setShowRightPanel = useStore((s) => s.setShowRightPanel);
  const setShowCartPanel = useStore((s) => s.setShowCartPanel);
  const isMobile = useIsMobile();

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(designName);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const productLabel = PRODUCT_CAPACITIES[productType]?.label ?? 'Gobelet';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Listen for bottom bar save/share events
  useEffect(() => {
    const onSave = () => handleSaveClick();
    const onShare = () => handleShare();
    document.addEventListener('ecocup-save', onSave);
    document.addEventListener('ecocup-share', onShare);
    return () => {
      document.removeEventListener('ecocup-save', onSave);
      document.removeEventListener('ecocup-share', onShare);
    };
  });

  useEffect(() => {
    if (editing) {
      setEditValue(designName);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, designName]);

  const handleSaveClick = async () => {
    try {
      // Demander un nom au design
      const currentDesign = useStore.getState().currentDesign;
      const promptName = window.prompt('Nom du design :', currentDesign.name);
      if (promptName === null) return; // annulé
      const saveName = promptName.trim() || currentDesign.name;
      useStore.getState().setDesignName(saveName);

      if (user) {
        // Sauvegarde en base de données pour les utilisateurs connectés
        let thumbnailUrl: string | undefined;
        const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
        if (canvasEl) {
          const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 0.5 });
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
          const fileName = `${user.id}/${crypto.randomUUID()}.png`;
          await supabase.storage.from('design-thumbnails').upload(fileName, blob, { contentType: 'image/png' });
          const { data: urlData } = supabase.storage.from('design-thumbnails').getPublicUrl(fileName);
          thumbnailUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from('saved_designs').insert({
          user_id: user.id,
          design_name: saveName,
          cup_color: currentDesign.cupColor,
          design_data: currentDesign as any,
          thumbnail_url: thumbnailUrl,
        });

        if (error) throw error;
        setIsDirty(false);
        toast.success('Design sauvegardé !', { description: 'Retrouvez-le dans votre espace client.' });
      } else {
        // Sauvegarde locale pour les utilisateurs non connectés
        const savedDesigns = JSON.parse(localStorage.getItem('ecocup_saved_designs') || '[]');
        const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
        let thumbnailDataUrl: string | undefined;
        if (canvasEl) {
          const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 0.5 });
          thumbnailDataUrl = canvas.toDataURL('image/png');
        }
        savedDesigns.push({
          id: crypto.randomUUID(),
          design_name: saveName,
          cup_color: currentDesign.cupColor,
          design_data: currentDesign,
          thumbnail_url: thumbnailDataUrl,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('ecocup_saved_designs', JSON.stringify(savedDesigns));
        setIsDirty(false);
        toast.success('Design sauvegardé localement !', { description: 'Connectez-vous pour le retrouver partout.' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) setDesignName(trimmed);
    setEditing(false);
  };

  const handleCancel = () => setEditing(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleShare = async () => {
    setSharing(true);
    setShareUrl(null);
    try {
      const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
      if (!canvasEl) {
        toast.error('Impossible de capturer le design');
        setSharing(false);
        return;
      }

      const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 2 });
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const fileName = `${crypto.randomUUID()}.png`;
      const { error: uploadError } = await supabase.storage.from('shared-designs').upload(fileName, blob, { contentType: 'image/png' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('shared-designs').getPublicUrl(fileName);

      const insertData: any = { design_name: designName, cup_color: cupColor, image_url: urlData.publicUrl };
      if (user) insertData.user_id = user.id;

      const { data, error } = await supabase.from('shared_designs').insert(insertData).select('id').single();
      if (error) throw error;

      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);
      toast.success('Lien de partage créé !', { description: 'Valide pendant 7 jours.' });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du partage');
    }
    setSharing(false);
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Lien copié !');
    }
  };

  return (
    <>
      <header className="h-12 flex items-center justify-between px-3 md:px-4 border-b border-thin shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <span className="font-bold text-sm tracking-wide shrink-0">ECOCUP®</span>
          {!isMobile && !editing && (
            <span className="text-[11px] text-muted-foreground truncate">
              — {productLabel} {capacity}
            </span>
          )}
          {!isMobile && editing && (
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="text-sm font-medium border-thin rounded-md px-2 py-1 bg-background w-[320px] outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
              <button onClick={handleSave} className="p-1 rounded hover:bg-secondary text-success">
                <Check size={14} />
              </button>
              <button onClick={handleCancel} className="p-1 rounded hover:bg-secondary text-muted-foreground">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={handleSaveClick}
            className="relative flex items-center justify-center p-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
            title="Sauvegarder"
          >
            <Save size={14} />
            {isDirty && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-500 -translate-y-0.5 translate-x-0.5" />}
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center justify-center p-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            title="Partager"
          >
            {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
          </button>
          {!isMobile && user && (
            <>
              <a
                href="/account"
                className="flex items-center justify-center p-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
                title="Mon compte"
              >
                <User size={14} />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
                title="Déconnexion"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
          {!isMobile && !user && (
            <a
              href="/auth"
              className="flex items-center justify-center p-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
              title="Connexion"
            >
              <User size={14} />
            </a>
          )}
          <button
            onClick={() => setShowCartPanel(true)}
            className="relative flex items-center justify-center p-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            title="Mon panier"
          >
            <ShoppingCart size={14} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                {cart.length}
              </span>
            )}
          </button>
          {isMobile && (
            <button className="p-1.5 border-thin rounded-md hover:bg-secondary" onClick={() => setShowRightPanel(!showRightPanel)}>
              <Menu size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Share URL modal */}
      {shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShareUrl(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Lien de partage</h3>
              <button onClick={() => setShareUrl(null)} className="p-1 rounded hover:bg-secondary">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Partagez ce lien avec votre famille ou vos amis. Il est valide pendant 7 jours.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 text-xs border-thin rounded-md px-3 py-2 bg-background truncate"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity shrink-0"
              >
                <Copy size={12} />
                Copier
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default TopBar;
