import { useStore, getUnitPrice } from '@/store/useStore';
import { X, Pencil, Trash2, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CartPanel = () => {
  const {
    cart,
    showCartPanel,
    setShowCartPanel,
    removeFromCart,
    editCartDesign,
    updateCartDesignName,
  } = useStore();

  const isMobile = useIsMobile();

  if (!showCartPanel) return null;

  const cartTotal = cart.reduce(
    (sum, d) => sum + getUnitPrice(d.quantity) * d.quantity,
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 z-[1000] animate-fade-in"
        onClick={() => setShowCartPanel(false)}
      />
      {/* Panel */}
      <div
        className={`fixed z-[1001] bg-background overflow-y-auto animate-slide-in-right ${
          isMobile
            ? 'inset-y-0 right-0 w-full max-w-[380px] border-l border-thin'
            : 'inset-y-0 right-0 w-[400px] border-l border-thin'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-thin">
          <h2 className="text-sm font-semibold">Mon panier ({cart.length})</h2>
          <button onClick={() => setShowCartPanel(false)} className="p-1 hover:bg-secondary rounded">
            <X size={16} />
          </button>
        </div>

        {/* Empty state */}
        {cart.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoutez un design depuis l'éditeur pour commencer.</p>
          </div>
        )}

        {/* Cart items */}
        <div className="flex-1">
          {cart.map((d, index) => {
            const unitPrice = getUnitPrice(d.quantity);
            const itemTotal = unitPrice * d.quantity;
            return (
              <div key={d.id} className="p-4 border-b border-thin">
                <div className="flex items-start gap-3">
                  {/* Color preview */}
                  <div
                    className="w-12 h-12 rounded-lg border-thin shrink-0"
                    style={{ backgroundColor: d.cupColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground shrink-0">#{index + 1}</span>
                      <input
                        value={d.name}
                        onChange={(e) => updateCartDesignName(d.id, e.target.value)}
                        className="text-xs font-medium bg-transparent w-full outline-none truncate"
                      />
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-1">
                      {d.quantity} gobelets × {unitPrice.toFixed(2)} €
                    </div>
                    <div className="text-xs font-medium">
                      {itemTotal.toFixed(2)} € HT
                    </div>
                    {d.comment && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 italic bg-secondary/50 rounded px-2 py-1">
                        {d.comment}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { editCartDesign(d.id); setShowCartPanel(false); }}
                      className="p-1.5 hover:bg-secondary rounded"
                      title="Modifier ce design"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(d.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-thin bg-secondary/20">
            <div className="flex justify-between text-sm font-semibold mb-4">
              <span>Total commande HT</span>
              <span>{cartTotal.toFixed(2)} €</span>
            </div>
            <button className="w-full bg-primary text-primary-foreground text-xs py-3 rounded-md hover:opacity-90 transition-opacity font-medium">
              <FileText size={14} className="inline mr-1.5" />
              Demander un devis
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
