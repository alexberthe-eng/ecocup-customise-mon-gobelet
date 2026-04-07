import { ShoppingCart, Save, Share2, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';

const TopBar = () => {
  const cart = useStore((s) => s.cart);
  const designName = useStore((s) => s.currentDesign.name);
  const showRightPanel = useStore((s) => s.showRightPanel);
  const setShowRightPanel = useStore((s) => s.setShowRightPanel);
  const isMobile = useIsMobile();

  return (
    <header className="h-12 flex items-center justify-between px-3 md:px-4 border-b border-thin shrink-0">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <span className="font-bold text-sm tracking-wide shrink-0">ECOCUP®</span>
        {!isMobile && (
          <span className="text-xs text-muted-foreground truncate">— Gobelet personnalisé par vos soins – ECO 30 Digital</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 md:gap-2">
        {!isMobile && (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors">
              <Save size={14} />
              <span className="hidden md:inline">Sauvegarder</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors">
              <Share2 size={14} />
              <span className="hidden md:inline">Partager</span>
            </button>
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
  );
};

export default TopBar;
