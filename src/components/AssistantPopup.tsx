import { useState } from 'react';
import { MessageCircle, Phone, X, Headphones } from 'lucide-react';

const AssistantPopup = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      {open && (
        <div className="bg-card border border-border rounded-xl shadow-xl w-72 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-foreground" />
              <span className="text-sm font-semibold text-foreground">Besoin d'aide ?</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground">
              <X size={14} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Notre équipe est disponible pour vous accompagner dans la personnalisation de vos gobelets.
            </p>
            <a
              href="tel:+33123456789"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-foreground/10">
                <Phone size={16} className="text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Appelez-nous</p>
                <p className="text-xs text-muted-foreground">01 23 45 67 89</p>
              </div>
            </a>
            <button
              onClick={() => window.open('mailto:contact@ecocup.com?subject=Demande%20d%27assistance', '_blank')}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors group w-full text-left"
            >
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-foreground/10">
                <MessageCircle size={16} className="text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Chat / Email</p>
                <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
              </div>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
        title="Assistance"
      >
        {open ? <X size={20} /> : <Headphones size={20} />}
      </button>
    </div>
  );
};

export default AssistantPopup;
