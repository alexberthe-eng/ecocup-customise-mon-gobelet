import { useStore, getUnitPrice } from '@/store/useStore';
import { Pencil, Trash2, Plus } from 'lucide-react';

const QUANTITIES = [125, 250, 500, 1000, 2500, 5000];

const RightPanel = () => {
  const {
    currentDesign,
    cart,
    showGraduation,
    showGraduationMask,
    setShowGraduation,
    setShowGraduationMask,
    setGraduation,
    setQuantity,
    setComment,
    addToCart,
    removeFromCart,
    editCartDesign,
    updateCartDesignName,
  } = useStore();

  const unitPrice = getUnitPrice(currentDesign.quantity);
  const subtotal = unitPrice * currentDesign.quantity;
  const cartTotal = cart.reduce(
    (sum, d) => sum + getUnitPrice(d.quantity) * d.quantity,
    0
  );

  return (
    <aside className="w-[248px] border-l border-thin bg-background overflow-y-auto shrink-0" data-tour="right-panel">
      {/* Graduation */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Graduation</h3>
        <label className="flex items-center justify-between text-xs mb-1.5">
          <span>Afficher graduation</span>
          <input
            type="checkbox"
            checked={showGraduation}
            onChange={(e) => setShowGraduation(e.target.checked)}
            className="accent-accent"
          />
        </label>
        <label className="flex items-center justify-between text-xs mb-2">
          <span>Afficher masque</span>
          <input
            type="checkbox"
            checked={showGraduationMask}
            onChange={(e) => setShowGraduationMask(e.target.checked)}
            className="accent-accent"
          />
        </label>
        <select
          value={currentDesign.graduation}
          onChange={(e) => setGraduation(e.target.value)}
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background"
        >
          <option value="standard-33cl">Standard 33cl</option>
          <option value="standard-25cl">Standard 25cl</option>
          <option value="pinte-50cl">Pinte 50cl</option>
        </select>
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
            <option key={q} value={q}>
              {q} gobelets
            </option>
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
            <div
              className="w-8 h-8 rounded border-thin shrink-0"
              style={{ backgroundColor: d.cupColor }}
            />
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
            <button
              onClick={() => editCartDesign(d.id)}
              className="p-1 hover:bg-secondary rounded"
              title="Éditer"
            >
              <Pencil size={10} />
            </button>
            <button
              onClick={() => removeFromCart(d.id)}
              className="p-1 hover:bg-destructive/10 rounded text-destructive"
              title="Supprimer"
            >
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
          className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:opacity-90 transition-opacity mb-1.5"
        >
          Ajouter ce design au panier
        </button>
        <button className="w-full text-xs border-thin rounded-md py-2 text-foreground hover:bg-secondary transition-colors">
          Demander un devis
        </button>
      </div>
    </aside>
  );
};

export default RightPanel;
