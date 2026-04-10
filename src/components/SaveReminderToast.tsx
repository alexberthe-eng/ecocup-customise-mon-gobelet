import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

const SaveReminderToast = () => {
  const isDirty = useStore((s) => s.isDirty);
  const [visible, setVisible] = useState(false);
  const [dismissed] = useState(
    () => localStorage.getItem('ecocup_save_reminder_dismissed') === 'true'
  );

  useEffect(() => {
    if (dismissed || !isDirty) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      if (useStore.getState().isDirty) {
        setVisible(true);
      }
    }, 3 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [isDirty, dismissed]);

  useEffect(() => {
    if (!isDirty) setVisible(false);
  }, [isDirty]);

  if (!visible) return null;

  const handleSave = () => {
    document.dispatchEvent(new CustomEvent('ecocup-save'));
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('ecocup_save_reminder_dismissed', 'true');
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-card border border-border rounded-xl shadow-lg p-4 max-w-xs"
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-base leading-none bg-transparent border-none cursor-pointer"
      >
        ×
      </button>

      <p className="text-xs font-semibold text-foreground mb-1">💾 Enregistrer</p>

      <p className="text-xs text-muted-foreground mb-3">
        Petit rappel : vous n'avez pas sauvegardé votre gobelet depuis un certain temps. Pensez à l'enregistrer dès maintenant !
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Sauvegarder maintenant
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground underline bg-transparent border-none cursor-pointer hover:text-foreground"
        >
          Ne plus afficher
        </button>
      </div>
    </div>
  );
};

export default SaveReminderToast;
