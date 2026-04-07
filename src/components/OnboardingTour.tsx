import { useStore } from '@/store/useStore';
import { useEffect, useRef, useState } from 'react';

const TOUR_STEPS = [
  {
    target: '[data-tour="color"]',
    title: 'Couleur du gobelet',
    description: 'Choisissez la couleur de base de votre gobelet',
  },
  {
    target: '[data-tour="image"]',
    title: 'Importer une image',
    description: 'Importez votre logo ou visuel (PNG, JPG, SVG — max 10 Mo)',
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Zone d\'édition',
    description: 'Cliquez sur un élément pour modifier ses propriétés et gérer sa position dans les calques',
  },
  {
    target: '[data-tour="right-panel"]',
    title: 'Panier & commentaires',
    description: 'Ajoutez un commentaire si besoin, puis ajoutez au panier',
  },
];

const OnboardingTour = () => {
  const { showTour, tourStep, nextTourStep, prevTourStep, endTour } = useStore();
  const [rect, setRect] = useState<DOMRect | null>(null);

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
  const tooltipLeft = Math.min(rect.right + 12, window.innerWidth - 280);
  const tooltipTop = Math.max(rect.top, 10);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40" onClick={endTour} />
      
      {/* Spotlight */}
      <div
        className="absolute border-2 border-accent rounded-lg z-10"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-background rounded-xl p-4 shadow-lg z-20 w-[260px]"
        style={{ left: tooltipLeft, top: tooltipTop }}
      >
        <h4 className="text-sm font-semibold mb-1">{step.title}</h4>
        <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
        
        {/* Progress */}
        <div className="flex gap-1 mb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= tourStep ? 'bg-accent' : 'bg-secondary'}`}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs">
          <button onClick={endTour} className="text-muted-foreground hover:underline">
            Passer
          </button>
          <div className="flex gap-2">
            {tourStep > 0 && (
              <button onClick={prevTourStep} className="text-muted-foreground hover:underline">
                ← Retour
              </button>
            )}
            <button
              onClick={nextTourStep}
              className="bg-accent text-accent-foreground px-3 py-1 rounded-md hover:opacity-90"
            >
              {tourStep < TOUR_STEPS.length - 1 ? 'Suivant →' : 'Terminer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
