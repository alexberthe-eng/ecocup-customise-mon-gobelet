import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, getUnitPrice, PRODUCT_CAPACITIES } from '@/store/useStore';
import { ArrowLeft, Pencil, Copy, Trash2, ShoppingCart, Tag, Truck, Phone } from 'lucide-react';
import { toast } from 'sonner';
import OrderConfirmModal from '@/components/OrderConfirmModal';

const QUANTITIES = [125, 250, 500, 1000, 2500, 5000, 10000];

/* ─── Cart Item ─────────────────────────────────────────── */

const CartItem = ({ design, index }: { design: any; index: number }) => {
  const {
    editCartDesign,
    removeFromCart,
    duplicateCartDesign,
    updateCartDesignName,
    updateCartDesignQuantity,
  } = useStore();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const unitPrice = getUnitPrice(design.quantity, design.productType);
  const itemTotal = unitPrice * design.quantity;
  const productInfo = PRODUCT_CAPACITIES[design.productType];

  const handleModify = () => {
    editCartDesign(design.id);
    navigate('/');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {/* Thumbnail */}
        <div className="w-full sm:w-[130px] h-[120px] sm:h-[130px] rounded-lg border border-border overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
          {design.thumbnail ? (
            <img
              src={design.thumbnail}
              alt={design.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xs text-muted-foreground"
              style={{ backgroundColor: design.cupColor }}
            >
              Aperçu
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          {/* Editable name */}
          <input
            value={design.name}
            onChange={(e) => updateCartDesignName(design.id, e.target.value)}
            className="text-[15px] font-semibold text-foreground w-full bg-transparent border-none outline-none mb-1 truncate"
          />

          {/* Product ref */}
          <p className="text-xs text-muted-foreground mb-3">
            {productInfo?.ref} — {productInfo?.label}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={design.quantity}
              onChange={(e) =>
                updateCartDesignQuantity(design.id, Number(e.target.value))
              }
              className="text-[13px] border border-border rounded-md px-2 py-1.5 bg-background cursor-pointer"
            >
              {QUANTITIES.map((q) => (
                <option key={q} value={q}>
                  {q} gobelets
                </option>
              ))}
            </select>
            <span className="text-[13px] text-muted-foreground">
              × {unitPrice.toFixed(2)} €
            </span>
          </div>

          {/* Comment */}
          {design.comment && (
            <p className="text-[11px] text-muted-foreground italic bg-secondary/50 rounded px-2 py-1 mb-3">
              💬 {design.comment}
            </p>
          )}

          {/* Actions + price on same row for mobile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleModify}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Pencil size={12} />
                Modifier
              </button>
              <button
                onClick={() => duplicateCartDesign(design.id)}
                className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
              >
                <Copy size={12} />
                Dupliquer
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-destructive hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} />
                Retirer
              </button>
            </div>
            <div className="text-right shrink-0 sm:hidden">
              <p className="text-base font-bold text-foreground">{itemTotal.toFixed(2)} €</p>
              <p className="text-[10px] text-muted-foreground">HT</p>
            </div>
          </div>
        </div>

        {/* Price — desktop only */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-lg font-bold text-foreground">{itemTotal.toFixed(2)} €</p>
          <p className="text-[11px] text-muted-foreground">HT</p>
        </div>
      </div>

      {/* Delete confirmation inline */}
      {confirmDelete && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Supprimer ce design du panier ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                removeFromCart(design.id);
                setConfirmDelete(false);
              }}
              className="px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Cart Summary ──────────────────────────────────────── */

const CartSummary = ({ onOrder }: { onOrder: () => void }) => {
  const { cart, globalComment, setGlobalComment } = useStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const cartTotal = cart.reduce(
    (sum, d) => sum + getUnitPrice(d.quantity, d.productType) * d.quantity,
    0
  );
  const shipping = cartTotal > 200 ? 0 : 9.9;
  const discount = promoApplied ? promoDiscount : 0;
  const total = cartTotal - discount + shipping;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'ECOCUP10') {
      setPromoApplied(promoCode.toUpperCase());
      setPromoDiscount(cartTotal * 0.1);
      toast.success('Code promo appliqué : -10%');
    } else {
      toast.error('Code promo invalide');
    }
  };

  const handleQuote = () => {
    const lines = cart
      .map(
        (d, i) => `Design ${i + 1}: ${d.name} — ${d.quantity} pcs`
      )
      .join('%0A');
    const comment = globalComment ? `%0ACommentaire: ${globalComment}` : '';
    window.open(
      `mailto:commandes@ecocup.com?subject=Demande de devis&body=Bonjour,%0A%0AJe souhaite un devis pour :%0A${lines}${comment}`,
      '_blank'
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
      {/* Promo code */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Tag size={13} />
          Code promo
        </h3>

        {promoApplied ? (
          <div className="flex items-center justify-between bg-accent/10 rounded-md px-3 py-2">
            <span className="text-xs font-medium text-accent-foreground flex items-center gap-1.5">
              ✓ {promoApplied}
            </span>
            <button
              onClick={() => {
                setPromoApplied(null);
                setPromoDiscount(0);
                setPromoCode('');
              }}
              className="text-xs text-muted-foreground hover:underline"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Votre code promo"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
              className="flex-1 h-9 border border-border rounded-md px-3 text-[13px] bg-background outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleApplyPromo}
              className="px-3 h-9 text-xs font-medium border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Appliquer
            </button>
          </div>
        )}
      </div>

      {/* Summary lines */}
      <div className="space-y-2.5 pb-4 border-b border-border mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="text-foreground font-medium">{cartTotal.toFixed(2)} €</span>
        </div>

        {promoApplied && (
          <div className="flex justify-between text-sm">
            <span className="text-accent-foreground">Réduction ({promoApplied})</span>
            <span className="text-accent-foreground font-medium">-{discount.toFixed(2)} €</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Truck size={13} />
            Livraison
          </span>
          <span className="text-foreground font-medium">
            {shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} €`}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Livraison offerte dès 200 € HT
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline mb-5">
        <span className="text-sm font-semibold text-foreground">Total HT</span>
        <span className="text-xl font-bold text-foreground">{total.toFixed(2)} €</span>
      </div>

      {/* Global comment */}
      <textarea
        value={globalComment}
        onChange={(e) => setGlobalComment(e.target.value)}
        placeholder="Commentaire pour la commande (délai, facturation...)"
        className="w-full h-16 border border-border rounded-md px-3 py-2 text-xs bg-background resize-none outline-none focus:ring-1 focus:ring-ring mb-4"
      />

      {/* Actions */}
      <button
        onClick={onOrder}
        className="w-full bg-primary text-primary-foreground text-sm py-3 rounded-md hover:opacity-90 transition-opacity font-medium mb-2"
      >
        Passer commande
      </button>
      <button
        onClick={handleQuote}
        className="w-full text-sm border border-border rounded-md py-3 text-foreground hover:bg-secondary transition-colors font-medium"
      >
        Demander un devis
      </button>

      {/* Reassurance */}
      <div className="mt-5 pt-4 border-t border-border space-y-2">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Truck size={12} /> Livraison offerte dès 200 € HT
        </p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Phone size={12} /> Service client : 02 41 93 00 44
        </p>
      </div>
    </div>
  );
};

/* ─── Cart Page ─────────────────────────────────────────── */

const CartPage = () => {
  const { cart, globalComment } = useStore();
  const navigate = useNavigate();
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

  const cartTotal = cart.reduce(
    (sum, d) => sum + getUnitPrice(d.quantity, d.productType) * d.quantity,
    0
  );

  const handleOrder = () => {
    const lines = cart
      .map(
        (d, i) =>
          `Design ${i + 1}: ${d.name} — ${d.quantity} pcs x ${getUnitPrice(d.quantity, d.productType).toFixed(2)}€`
      )
      .join('%0A');
    const total = cartTotal.toFixed(2);
    const comment = globalComment ? `%0ACommentaire: ${globalComment}` : '';
    window.open(
      `mailto:commandes@ecocup.com?subject=Commande configurateur&body=Bonjour,%0A%0AVoici ma commande :%0A${lines}%0A%0ATotal HT: ${total}€${comment}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Retour au configurateur</span>
          <span className="sm:hidden">Retour</span>
        </button>
        <span className="text-xs font-bold tracking-widest text-foreground shrink-0">ECOCUP®</span>
        <span className="text-xs text-muted-foreground items-center gap-1 hidden sm:flex">
          <Phone size={12} />
          02 41 93 00 44
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-5 sm:mb-6 flex items-center gap-2">
          <ShoppingCart size={20} />
          Votre panier
          {cart.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({cart.length} design{cart.length > 1 ? 's' : ''})
            </span>
          )}
        </h1>

        {cart.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 sm:py-20">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">Votre panier est vide</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ajoutez un design depuis le configurateur pour commencer.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Créer un design
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Left — items */}
            <div className="flex-1 min-w-0 w-full">
              {cart.map((design, index) => (
                <CartItem key={design.id} design={design} index={index} />
              ))}

              <button
                onClick={() => navigate('/')}
                className="text-sm text-primary hover:underline font-medium mt-2"
              >
                + Ajouter un autre design
              </button>
            </div>

            {/* Right — summary */}
            <div className="w-full lg:w-[340px] shrink-0">
              <CartSummary onOrder={() => setShowOrderConfirm(true)} />
            </div>
          </div>
        )}
      </main>

      {/* Footer reassurance */}
      <footer className="border-t border-border bg-card px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
          <span>🔒 Paiement sécurisé</span>
          <span>🚚 Livraison offerte dès 200 € HT</span>
          <span>♻️ Gobelets réutilisables</span>
          <span>📞 Service client disponible</span>
        </div>
      </footer>

      {/* Order confirmation modal */}
      {showOrderConfirm && (
        <OrderConfirmModal
          cart={cart}
          cartTotal={cartTotal}
          onConfirm={() => {
            setShowOrderConfirm(false);
            handleOrder();
          }}
          onCancel={() => setShowOrderConfirm(false)}
        />
      )}
    </div>
  );
};

export default CartPage;
