import { useIsMobile } from '@/hooks/use-mobile';

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
}

const WarningModal = ({ open, onClose }: WarningModalProps) => {
  const isMobile = useIsMobile();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className={`bg-background flex flex-col ${
          isMobile
            ? 'fixed bottom-0 left-0 right-0 rounded-t-xl max-h-[80vh] animate-slide-in-bottom'
            : 'rounded-xl max-w-[460px] w-full mx-4 max-h-[90vh]'
        }`}
        style={{ padding: '28px 24px' }}
      >
        <div className="overflow-y-auto flex-1">
          <div className="text-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-center font-medium" style={{ fontSize: '16px' }}>
            Important
          </h2>
          <div
            className="text-center text-muted-foreground mt-4"
            style={{ fontSize: '14px', lineHeight: 1.7 }}
          >
            <p className="mb-3">
              Votre design sera imprimé tel quel,
              sans relecture ni correction de notre part.
            </p>
            <p className="mb-3">
              Utilisez des images en haute résolution (300 DPI minimum)
              pour un rendu d'impression optimal.
            </p>
            <p className="mb-3">
              Évitez les textes trop petits (moins de 6pt)
              ou trop fins — ils peuvent mal passer à l'impression.
            </p>
            <p className="mb-3">
              Évitez de copier-coller du texte depuis Word,
              Excel ou PowerPoint — cela peut générer
              des caractères invisibles ou mal encodés.
            </p>
            <p className="mb-3">
              Seul l'alphabet latin est supporté.
              L'utilisation de caractères spéciaux,
              accents complexes ou alphabets non latins
              est déconseillée.
            </p>
            <p>
              Vous rencontrez une difficulté ?{' '}
              Contactez-nous :{' '}
              <a href="mailto:hello@ecocup.com" className="text-accent underline">
                hello@ecocup.com
              </a>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-foreground text-background mt-6 hover:opacity-90 transition-opacity"
          style={{ borderRadius: '6px', fontSize: '13px', padding: '12px' }}
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};

export default WarningModal;
