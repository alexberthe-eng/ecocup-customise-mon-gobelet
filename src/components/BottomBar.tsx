import { useState } from 'react';
import { Undo2, Redo2, Headphones, Phone, MessageCircle, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const BottomBar = () => {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const historyIndex = useStore((s) => s.historyIndex);
  const historyLength = useStore((s) => s.history.length);
  const cupColor = useStore((s) => s.currentDesign.cupColor);
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <footer className="h-10 flex items-center justify-between px-4 border-t border-thin bg-background shrink-0">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-8 rounded border-thin"
          style={{ backgroundColor: cupColor }}
          title="Aperçu miniature"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
            title="Annuler"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= historyLength - 1}
            className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
            title="Rétablir"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity"
              title="Assistance"
            >
              <Headphones size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-72 p-0">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2">
                <Headphones size={16} className="text-foreground" />
                <span className="text-sm font-semibold text-foreground">Besoin d'aide ?</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Notre équipe vous accompagne dans la personnalisation de vos gobelets.
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-xs text-muted-foreground">
                <span>🕐</span>
                <span>Lun – Ven : 9h00 – 18h00</span>
              </div>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Appelez-nous</p>
                  <p className="text-xs text-muted-foreground">01 23 45 67 89</p>
                </div>
              </a>
              <button
                onClick={() => window.open('mailto:contact@ecocup.com?subject=Demande%20d%27assistance', '_blank')}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors w-full text-left"
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Chat / Email</p>
                  <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <span className="text-[10px] text-muted-foreground hidden lg:block">
        Cliquez sur un élément pour le modifier
      </span>
    </footer>
  );
};

export default BottomBar;
