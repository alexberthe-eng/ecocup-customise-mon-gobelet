import { ShoppingCart, Save, Share2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

const TopBar = () => {
  const cart = useStore((s) => s.cart);
  const designName = useStore((s) => s.currentDesign.name);

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-thin">
      <div className="flex items-center gap-4">
        <span className="font-bold text-sm tracking-wide">ECOCUP®</span>
        <span className="text-xs text-muted-foreground">— {designName}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors">
          <Save size={14} />
          Sauvegarder
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors">
          <Share2 size={14} />
          Partager
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
          <ShoppingCart size={14} />
          Mon panier
          {cart.length > 0 && (
            <span className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
