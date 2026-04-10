import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TOUR_STEPS = [
  {
    target: '[data-tour="color"]',
    title: 'Couleur du gobelet',
    description:
      'Commencez par choisir la couleur de votre gobelet : Blanc ou Translucide givré. ' +
      'Le rendu se met à jour en temps réel en 2D et en 3D.',
    tooltipSide: 'right',
  },
  {
    target: '[data-tour="image"]',
    title: 'Importez votre visuel',
    description:
      'Cliquez sur "Image" pour ajouter votre logo ou photo. ' +
      "Choisissez d'abord une forme de masque (rectangle, cercle, polaroïd…) " +
      'puis importez votre fichier PNG, JPG ou SVG (max 10 Mo, 300 DPI recommandé).',
    tooltipSide: 'right',
  },
  {
    target: '[data-tour="text-tool"]',
    title: 'Ajoutez du texte',
    description:
      "Cliquez sur \"Texte\" pour ouvrir l'éditeur de texte. " +
      'Choisissez votre police, taille, couleur et mise en forme, ' +
      'puis cliquez "Terminé" pour placer votre texte sur le gobelet.',
    tooltipSide: 'right',
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Modifiez vos éléments',
    description:
      "Cliquez sur n'importe quel élément du canvas pour afficher " +
      "le menu d'actions : Modifier, Vers l'avant, Vers l'arrière, Supprimer. " +
      'Vous pouvez aussi déplacer et redimensionner les éléments en les faisant glisser.',
    tooltipSide: 'top',
  },
  {
    target: '[data-tour="toggle-2d-3d"]',
    title: '2D ou 3D — à vous de choisir',
    description:
      'Basculez librement entre la vue à plat (2D) pour éditer ' +
      'et la vue 3D 360° pour visualiser votre gobelet sous tous les angles. ' +
      'Vos modifications sont synchronisées dans les deux vues.',
    tooltipSide: 'bottom',
  },
  {
    target: '[data-tour="tab-bat"]',
    title: 'Vérifiez votre Bon à Tirer',
    description:
      "L'aperçu BAT vous montre exactement ce qui sera imprimé, " +
      'avec les zones de sécurité (vert) et de fond perdu (bleu). ' +
      'Vérifiez les alertes avant de valider, puis exportez en PDF ou PNG.',
    tooltipSide: 'bottom',
  },
  {
    target: '[data-tour="right-panel"]',
    title: 'Finalisez et commandez',
    description:
      'Choisissez votre quantité — le prix unitaire se calcule automatiquement. ' +
      'Vous pouvez créer plusieurs designs pour une même commande. ' +
      'Ajoutez un commentaire si besoin, puis cliquez "Ajouter au panier".',
    tooltipSide: 'left',
  },
];

const getTooltipPosition = (
  rect: DOMRect,
  side: string,
  isMobile: boolean
) => {
  const TOOLTIP_W = 270;
  const TOOLTIP_H = 200;
  const MARGIN = 12;

  if (isMobile) {
    return {
      left: Math.max(10, Math.min(rect.left, window.innerWidth - TOOLTIP_W - 10)),
      top: Math.min(rect.bottom + MARGIN, window.innerHeight - TOOLTIP_H - 10),
    };
  }

  switch (side) {
    case 'right':
      return {
        left: Math.min(rect.right + MARGIN, window.innerWidth - TOOLTIP_W - 10),
        top: Math.max(10, rect.top),
      };
    case 'left':
      return {
        left: Math.max(10, rect.left - TOOLTIP_W - MARGIN),
        top: Math.max(10, rect.top),
      };
    case 'bottom':
      return {
        left: Math.max(10, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 10)),
        top: rect.bottom + MARGIN,
      };
    case 'top':
      return {
        left: Math.max(10, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 10)),
        top: Math.max(10, rect.top - TOOLTIP_H - MARGIN),
      };
    default:
      return {
        left: Math.min(rect.right + MARGIN, window.innerWidth - TOOLTIP_W - 10),
        top: Math.max(10, rect.top),
      };
  }
};

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
  const { left: tooltipLeft, top: tooltipTop } = getTooltipPosition(rect, step.tooltipSide, isMobile);

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
        className="absolute bg-white rounded-xl shadow-xl z-20 border border-neutral-100"
        style={{
          left: tooltipLeft,
          top: tooltipTop,
          width: '270px',
          padding: '16px',
        }}
      >
        {/* Step number + close */}
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Étape {tourStep + 1} sur {TOUR_STEPS.length}
          </span>
          <button
            onClick={endTour}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

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
