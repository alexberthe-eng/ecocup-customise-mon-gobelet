import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TOUR_STEPS = [
  {
    target: '[data-tour="color"]',
    title: 'Couleur du gobelet',
    description:
      'Commencez par choisir la couleur de base de votre gobelet : Blanc ou Translucide givré.',
  },
  {
    target: '[data-tour="image"]',
    title: 'Importez votre visuel',
    description:
      'Ajoutez votre logo ou photo en PNG, JPG ou SVG (max 10 Mo, 300 DPI recommandé). Choisissez un masque pour cadrer votre image automatiquement.',
  },
  {
    target: '[data-tour="tabs-2d-3d"]',
    title: '2D ou 3D — travaillez comme vous préférez',
    description:
      'Passez librement entre la vue à plat (2D) et la vue 3D 360°. Vous pouvez éditer vos éléments dans l\'une ou l\'autre vue — les modifications sont synchronisées en temps réel.',
  },
  {
    target: '[data-tour="tab-bat"]',
    title: 'Vérifiez avant d\'imprimer',
    description:
      'L\'aperçu BAT (Bon à Tirer) vous montre exactement ce qui sera imprimé, avec les zones de sécurité et de fond perdu. Vérifiez les alertes en bas, puis imprimez ou téléchargez votre BAT pour validation.',
  },
  {
    target: '[data-tour="right-panel"]',
    title: 'Finalisez et commandez',
    description:
      'Vous pouvez créer plusieurs designs pour une même commande. Ajoutez un commentaire si besoin, puis ajoutez chaque design au panier.',
  },
];

const OnboardingTour = () => {
  const { showTour, tourStep, nextTourStep, prevTourStep, endTour } = useStore();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!showTour) return;
    const step = TOUR_STEPS[tourStep];
    const el = document.querySelector(step.target);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [showTour, tourStep]);

  if (!showTour || !rect) return null;

  const step = TOUR_STEPS[tourStep];

  // Position tooltip: on mobile below the spotlight, on desktop to the right
  const tooltipLeft = isMobile
    ? Math.max(10, Math.min(rect.left, window.innerWidth - 280))
    : Math.min(rect.right + 12, window.innerWidth - 280);
  const tooltipTop = isMobile
    ? Math.min(rect.bottom + 12, window.innerHeight - 220)
    : Math.max(rect.top, 10);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={endTour} />

      {/* Spotlight */}
      <div
        className="absolute border-2 border-foreground rounded-lg z-10"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-xl p-4 shadow-xl z-20 w-[260px] border border-neutral-200"
        style={{ left: tooltipLeft, top: tooltipTop }}
      >
        <h4 className="text-sm font-semibold mb-1 text-neutral-900">{step.title}</h4>
        <p className="text-xs text-neutral-500 mb-3">{step.description}</p>

        {/* Progress */}
        <div className="flex gap-1 mb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= tourStep ? 'bg-neutral-900' : 'bg-neutral-200'}`}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs">
          <button onClick={endTour} className="text-neutral-400 hover:text-neutral-600 hover:underline">
            Passer
          </button>
          <div className="flex gap-2">
            {tourStep > 0 && (
              <button onClick={prevTourStep} className="text-neutral-400 hover:text-neutral-600 hover:underline">
                ← Retour
              </button>
            )}
            <button
              onClick={nextTourStep}
              className="bg-neutral-900 text-white px-3 py-1 rounded-md hover:bg-neutral-800 transition-colors"
            >
              {tourStep < TOUR_STEPS.length - 1 ? 'Suivant →' : 'Commencer !'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
