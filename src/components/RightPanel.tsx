import { useState } from 'react';
import { useStore, getUnitPrice } from '@/store/useStore';
import { X, ShoppingCart, Check, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
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
    setQuantity,
    setComment,
    addToCart,
    setShowRightPanel,
    setShowCartPanel,
  } = useStore();

  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  const unitPrice = getUnitPrice(currentDesign.quantity);
  const subtotal = unitPrice * currentDesign.quantity;

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
    toast.success('Design ajouté au panier ✓', {
      description: 'Vous pouvez créer un nouveau visuel.',
    });
    if (!isDesktop) {
      setShowRightPanel(false);
    }
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

  if (isDesktop) {
    return (
      <aside className="w-[248px] border-l border-thin bg-background overflow-y-auto shrink-0" data-tour="right-panel">
        {panelContent}
      </aside>
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
    </>
  );
};

export default RightPanel;
