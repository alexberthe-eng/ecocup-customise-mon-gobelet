import { useState } from 'react';
import { useStore, getUnitPrice } from '@/store/useStore';
import { X, Pencil, Trash2, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const QUANTITIES = [125, 250, 500, 1000, 2500, 5000, 10000];

const CartPanel = () => {
  const {
    cart,
    showCartPanel,
    globalComment,
    setShowCartPanel,
    removeFromCart,
    editCartDesign,
    updateCartDesignName,
    updateCartDesignQuantity,
    setGlobalComment,
  } = useStore();

  const isMobile = useIsMobile();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!showCartPanel) return null;

  const cartTotal = cart.reduce(
    (sum, d) => sum + getUnitPrice(d.quantity) * d.quantity,
    0
  );

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      removeFromCart(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleOrder = () => {
    toast.info('Fonctionnalité bientôt disponible', {
      description: 'La commande en ligne sera disponible prochainement.',
    });
  };

  const handleQuote = () => {
    toast.info('Fonctionnalité bientôt disponible', {
      description: 'La demande de devis sera disponible prochainement.',
    });
  };

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
                  {/* Thumbnail or color fallback */}
                  {d.thumbnail ? (
                    <img
                      src={d.thumbnail}
                      alt={d.name}
                      className="w-14 h-14 rounded-lg border-thin shrink-0 object-cover bg-secondary"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-lg border-thin shrink-0"
                      style={{ backgroundColor: d.cupColor }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground shrink-0">#{index + 1}</span>
                      <input
                        value={d.name}
                        onChange={(e) => updateCartDesignName(d.id, e.target.value)}
                        className="text-xs font-medium bg-transparent w-full outline-none truncate"
                      />
                    </div>
                    <div className="mb-1">
                      <select
                        value={d.quantity}
                        onChange={(e) => updateCartDesignQuantity(d.id, Number(e.target.value))}
                        className="text-[11px] border-thin rounded px-1.5 py-0.5 bg-background"
                      >
                        {QUANTITIES.map((q) => (
                          <option key={q} value={q}>{q} gobelets</option>
                        ))}
                      </select>
                      <span className="text-[11px] text-muted-foreground ml-1">× {unitPrice.toFixed(2)} €</span>
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
                      onClick={() => handleDelete(d.id)}
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

        {/* Global comment */}
        {cart.length > 0 && (
          <div className="p-4 border-b border-thin">
            <h3 className="text-xs font-semibold mb-2">Commentaire global pour toute la commande</h3>
            <textarea
              value={globalComment}
              onChange={(e) => setGlobalComment(e.target.value)}
              placeholder="Ex : livraison impérative avant le 15, facturation au nom de..."
              className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background resize-none h-16"
            />
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-thin bg-secondary/20">
            <div className="flex justify-between text-sm font-semibold mb-4">
              <span>Total commande HT</span>
              <span>{cartTotal.toFixed(2)} €</span>
            </div>
            <button
              onClick={handleOrder}
              className="w-full bg-primary text-primary-foreground text-xs py-3 rounded-md hover:opacity-90 transition-opacity font-medium mb-2"
            >
              Passer commande
            </button>
            <button
              onClick={handleQuote}
              className="w-full text-xs border-thin rounded-md py-3 text-foreground hover:bg-secondary transition-colors font-medium"
            >
              <FileText size={14} className="inline mr-1.5" />
              Demander un devis
            </button>
          </div>
        )}
      </div>

      {/* Confirmation de suppression */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-sm mb-2">Supprimer ce design ?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Cette action est irréversible. Le design sera supprimé du panier.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-xs border-thin rounded-md hover:bg-secondary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPanel;
