import { useStore, getUnitPrice } from '@/store/useStore';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import ToggleSwitch from '@/components/ToggleSwitch';
import { useIsMobile, useIsDesktop } from '@/hooks/use-mobile';

const QUANTITIES = [125, 250, 500, 1000, 2500, 5000];

const RightPanel = () => {
  const {
    currentDesign,
    cart,
    showGraduation,
    showGraduationMask,
    showRightPanel,
    setShowGraduation,
    setShowGraduationMask,
    setGraduation,
    setQuantity,
    setComment,
    addToCart,
    removeFromCart,
    editCartDesign,
    updateCartDesignName,
    setShowRightPanel,
  } = useStore();

  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  const unitPrice = getUnitPrice(currentDesign.quantity);
  const subtotal = unitPrice * currentDesign.quantity;
  const cartTotal = cart.reduce(
    (sum, d) => sum + getUnitPrice(d.quantity) * d.quantity,
    0
  );

  // On desktop, always visible. On mobile/tablet, shown as overlay when showRightPanel is true.
  if (!isDesktop && !showRightPanel) return null;

  const panelContent = (
    <>
      {/* Close button for mobile/tablet overlay */}
      {!isDesktop && (
        <div className="flex items-center justify-between p-3 border-b border-thin">
          <h2 className="text-sm font-semibold">Paramètres</h2>
          <button onClick={() => setShowRightPanel(false)} className="p-1 hover:bg-secondary rounded">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Graduation */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Graduation</h3>
        <div className="mb-1.5">
          <ToggleSwitch label="Afficher graduation" checked={showGraduation} onChange={setShowGraduation} />
        </div>
        <div className="mb-2">
          <ToggleSwitch label="Afficher masque" checked={showGraduationMask} onChange={setShowGraduationMask} />
        </div>
      </div>

      {/* Ce design */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Ce design</h3>
        <select
          value={currentDesign.quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background mb-2"
        >
          {QUANTITIES.map((q) => (
            <option key={q} value={q}>{q} gobelets</option>
          ))}
        </select>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Prix unitaire</span>
          <span>{unitPrice.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span>Sous-total HT</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
      </div>

      {/* Panier */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Panier commande</h3>
        {cart.length === 0 && (
          <p className="text-[10px] text-muted-foreground mb-2">Aucun design ajouté</p>
        )}
        {cart.map((d) => (
          <div key={d.id} className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-secondary/50">
            <div className="w-8 h-8 rounded border-thin shrink-0" style={{ backgroundColor: d.cupColor }} />
            <div className="flex-1 min-w-0">
              <input
                value={d.name}
                onChange={(e) => updateCartDesignName(d.id, e.target.value)}
                className="text-[10px] font-medium bg-transparent w-full outline-none"
              />
              <span className="text-[9px] text-muted-foreground">
                {d.quantity} × {getUnitPrice(d.quantity).toFixed(2)} €
              </span>
            </div>
            <button onClick={() => editCartDesign(d.id)} className="p-1 hover:bg-secondary rounded" title="Éditer">
              <Pencil size={10} />
            </button>
            <button onClick={() => removeFromCart(d.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive" title="Supprimer">
              <Trash2 size={10} />
            </button>
          </div>
        ))}
        <button className="w-full text-xs border border-dashed rounded-md py-2 text-muted-foreground hover:bg-secondary/50 transition-colors">
          <Plus size={12} className="inline mr-1" />
          Créer un 2e design
        </button>
        {cart.length > 0 && (
          <div className="flex justify-between text-xs font-semibold mt-2 pt-2 border-t border-thin">
            <span>Total commande HT</span>
            <span>{(cartTotal + subtotal).toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <textarea
          value={currentDesign.comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ex : police plus légère, logo au dos…"
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background resize-none h-16 mb-2"
        />
        <button
          onClick={addToCart}
          className="w-full bg-primary text-primary-foreground text-xs py-2.5 rounded-md hover:opacity-90 transition-opacity mb-1.5"
        >
          Ajouter ce design au panier
        </button>
        <button className="w-full text-xs border-thin rounded-md py-2 text-foreground hover:bg-secondary transition-colors">
          Demander un devis
        </button>
      </div>
    </>
  );

  // Desktop: inline panel
  if (isDesktop) {
    return (
      <aside className="w-[248px] border-l border-thin bg-background overflow-y-auto shrink-0" data-tour="right-panel">
        {panelContent}
      </aside>
    );
  }

  // Mobile / Tablet: overlay sheet
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 z-40 animate-fade-in"
        onClick={() => setShowRightPanel(false)}
      />
      {/* Sheet */}
      <div
        className={`fixed z-50 bg-background overflow-y-auto animate-slide-in-right ${
          isMobile
            ? 'inset-y-0 right-0 w-full max-w-[340px] border-l border-thin'
            : 'inset-y-0 right-0 w-[320px] border-l border-thin'
        }`}
        data-tour="right-panel"
      >
        {panelContent}
      </div>
    </>
  );
};

export default RightPanel;
