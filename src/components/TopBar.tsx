import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Save, Share2, Menu, Check, X, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';

const TopBar = () => {
  const cart = useStore((s) => s.cart);
  const designName = useStore((s) => s.currentDesign.name);
  const setDesignName = useStore((s) => s.setDesignName);
  const showRightPanel = useStore((s) => s.showRightPanel);
  const setShowRightPanel = useStore((s) => s.setShowRightPanel);
  const isMobile = useIsMobile();

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(designName);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (editing) {
      setEditValue(designName);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, designName]);

  const handleSaveClick = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setEditing(true);
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

  return (
    <>
      <header className="h-12 flex items-center justify-between px-3 md:px-4 border-b border-thin shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <span className="font-bold text-sm tracking-wide shrink-0">ECOCUP®</span>
          {!isMobile && !editing && (
            <span className="text-sm font-medium text-foreground truncate">
              {designName}
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
          {!isMobile && (
            <>
              <button
                onClick={handleSaveClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
              >
                <Save size={14} />
                <span className="hidden md:inline">Sauvegarder</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors">
                <Share2 size={14} />
                <span className="hidden md:inline">Partager</span>
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={14} />
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <ShoppingCart size={14} />
            {!isMobile && <span>Mon panier</span>}
            {cart.length > 0 && (
              <span className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
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

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default TopBar;
