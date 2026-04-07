import { useState } from 'react';
import { useStore, getUnitPrice, PRODUCT_CAPACITIES } from '@/store/useStore';
import { X, ShoppingCart, Check, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
import ToggleSwitch from '@/components/ToggleSwitch';
import { useIsMobile, useIsDesktop } from '@/hooks/use-mobile';

const QUANTITIES = [125, 250, 500, 1000, 2500, 5000, 10000];

const RightPanel = () => {
  const {
    currentDesign,
    cart,
    showGraduation,
    showGraduationMask,
    showRightPanel,
    setShowGraduation,
    setShowGraduationMask,
    setQuantity,
    setComment,
    setGraduation,
    setProductType,
    setCapacity,
    addToCart,
    setShowRightPanel,
    setShowCartPanel,
  } = useStore();

  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const unitPrice = getUnitPrice(currentDesign.quantity);
  const subtotal = unitPrice * currentDesign.quantity;

  const productInfo = PRODUCT_CAPACITIES[currentDesign.productType];
  const capacities = productInfo?.capacities ?? ['33cl'];

  if (!isDesktop && !showRightPanel) return null;

  const handleAddToCart = async () => {
    let thumbnail: string | undefined;
    try {
      const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
      if (canvasEl) {
        const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 0.5 });
        thumbnail = canvas.toDataURL('image/png');
      }
    } catch {}
    addToCart(thumbnail);
    if (!isDesktop) {
      setShowRightPanel(false);
    }
    setShowConfirmModal(true);
  };

  const panelContent = (
    <>
      {/* Close button for mobile/tablet overlay */}
      {!isDesktop && (
        <div className="flex items-center justify-between p-3 border-b border-thin">
          <h2 className="text-sm font-semibold">Paramètres du design</h2>
          <button onClick={() => setShowRightPanel(false)} className="p-1 hover:bg-secondary rounded">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Votre gobelet */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Votre gobelet</h3>
        <select
          value={currentDesign.productType}
          onChange={(e) => setProductType(e.target.value)}
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background mb-2"
        >
          {Object.entries(PRODUCT_CAPACITIES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={currentDesign.capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background"
        >
          {capacities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Graduation */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Graduation</h3>
        <div className="mb-1.5">
          <ToggleSwitch label="Afficher graduation" checked={showGraduation} onChange={setShowGraduation} />
        </div>
        <div className="mb-2">
          <ToggleSwitch label="Afficher masque" checked={showGraduationMask} onChange={setShowGraduationMask} />
        </div>
        <select
          value={currentDesign.graduation}
          onChange={(e) => setGraduation(e.target.value)}
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background mt-2"
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

      {/* Commentaire individuel */}
      <div className="p-3 border-b border-thin">
        <h3 className="text-xs font-semibold mb-2">Commentaire pour ce visuel</h3>
        <textarea
          value={currentDesign.comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ex : police plus légère, logo au dos…"
          className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background resize-none h-16"
        />
      </div>

      {/* Actions */}
      <div className="p-3">
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary text-primary-foreground text-xs py-2.5 rounded-md hover:opacity-90 transition-opacity mb-2"
        >
          <ShoppingCart size={12} className="inline mr-1.5" />
          Ajouter au panier
        </button>

        {cart.length > 0 && (
          <button
            onClick={() => { setShowRightPanel(false); setShowCartPanel(true); }}
            className="w-full text-xs border-thin rounded-md py-2 text-foreground hover:bg-secondary transition-colors"
          >
            Voir mon panier ({cart.length} {cart.length === 1 ? 'design' : 'designs'})
          </button>
        )}
      </div>
    </>
  );

  const confirmModal = showConfirmModal && (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}>
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Check size={24} className="text-primary" />
        </div>
        <h3 className="font-semibold text-sm mb-1">Design ajouté au panier ✓</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Vous pouvez maintenant créer un nouveau visuel ou consulter votre panier pour finaliser votre commande.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs py-2.5 rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            <Plus size={14} />
            Créer un nouveau design
          </button>
          <button
            onClick={() => { setShowConfirmModal(false); setShowCartPanel(true); }}
            className="w-full flex items-center justify-center gap-1.5 text-xs border-thin rounded-md py-2.5 text-foreground hover:bg-secondary transition-colors font-medium"
          >
            <ShoppingCart size={14} />
            Voir mon panier ({cart.length})
          </button>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <aside className="w-[248px] border-l border-thin bg-background overflow-y-auto shrink-0" data-tour="right-panel">
          {panelContent}
        </aside>
        {confirmModal}
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/30 z-40 animate-fade-in"
        onClick={() => setShowRightPanel(false)}
      />
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
      {confirmModal}
    </>
  );
};

export default RightPanel;
