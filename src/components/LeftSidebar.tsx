import { useEffect, useRef, useState } from 'react';
import { Palette, ImagePlus, Type, Shapes, BookOpen, HelpCircle, Plus, Headphones, Phone, MessageCircle, Save, Share2, User, Loader2, Copy, X } from 'lucide-react';
import { useStore, ActiveTool } from '@/store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const tools: { id: ActiveTool; icon: React.ElementType; label: string; showPlus?: boolean; tooltip: string }[] = [
  { id: 'color', icon: Palette, label: 'Gobelet', tooltip: 'Changer la couleur du gobelet' },
  { id: 'image', icon: ImagePlus, label: 'Image', tooltip: 'Ajouter une image' },
  { id: 'text', icon: Type, label: 'Texte', showPlus: true, tooltip: 'Ajouter du texte' },
  { id: 'motif', icon: Shapes, label: 'Motif', showPlus: true, tooltip: 'Ajouter un motif' },
  { id: 'collection', icon: BookOpen, label: 'Collection', showPlus: true, tooltip: 'Choisir une collection' },
];

const ColorPopover = ({ position }: { position: 'side' | 'above' }) => {
  const { currentDesign, setCupColor, setShowColorPopover } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowColorPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setShowColorPopover]);

  const posClass = position === 'above'
    ? 'bottom-full left-0 mb-2'
    : 'left-[72px] top-0';

  return (
    <div
      ref={ref}
      className={`absolute ${posClass} w-[180px] bg-background border-thin rounded-xl shadow-lg p-3 z-50 animate-scale-in`}
    >
      <h4 className="text-xs font-semibold mb-2">Couleur du gobelet</h4>
      <div className="flex gap-2">
        <button
          onClick={() => setCupColor('#f2f2f2')}
          className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
            currentDesign.cupColor === '#f2f2f2'
              ? 'border-accent bg-accent/5'
              : 'border-transparent hover:bg-secondary'
          }`}
        >
          <div className="w-10 h-10 rounded-full border-thin" style={{ backgroundColor: '#f2f2f2' }} />
          <span className="text-[10px]">Blanc</span>
        </button>
        <button
          onClick={() => setCupColor('#e8f0f5')}
          className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
            currentDesign.cupColor === '#e8f0f5'
              ? 'border-accent bg-accent/5'
              : 'border-transparent hover:bg-secondary'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full border-thin"
            style={{
              background: 'linear-gradient(135deg, rgba(232,240,245,0.9), rgba(200,220,235,0.7))',
            }}
          />
          <span className="text-[10px] text-center leading-tight">Translucide givré</span>
        </button>
      </div>
    </div>
  );
};

/** Desktop: vertical sidebar. Mobile: horizontal bottom toolbar */
const LeftSidebar = () => {
  const activeTool = useStore((s) => s.activeTool);
  const showColorPopover = useStore((s) => s.showColorPopover);
  const handleToolClick = useStore((s) => s.handleToolClick);
  const startTour = useStore((s) => s.startTour);
  const designName = useStore((s) => s.currentDesign.name);
  const cupColor = useStore((s) => s.currentDesign.cupColor);
  const isMobile = useIsMobile();

  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSaveClick = async () => {
    if (!user) { setShowAuth(true); return; }
    try {
      let thumbnailUrl: string | undefined;
      const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
      if (canvasEl) {
        const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 0.5 });
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        const fileName = `${user.id}/${crypto.randomUUID()}.png`;
        await supabase.storage.from('design-thumbnails').upload(fileName, blob, { contentType: 'image/png' });
        const { data: urlData } = supabase.storage.from('design-thumbnails').getPublicUrl(fileName);
        thumbnailUrl = urlData.publicUrl;
      }
      const currentDesign = useStore.getState().currentDesign;
      const { error } = await supabase.from('saved_designs').insert({
        user_id: user.id, design_name: currentDesign.name, cup_color: currentDesign.cupColor,
        design_data: currentDesign as any, thumbnail_url: thumbnailUrl,
      });
      if (error) throw error;
      toast.success('Design sauvegardé !', { description: 'Retrouvez-le dans votre espace client.' });
    } catch (err) { console.error(err); toast.error('Erreur lors de la sauvegarde'); }
  };

  const handleShare = async () => {
    setSharing(true); setShareUrl(null);
    try {
      const canvasEl = document.querySelector('[data-editor-canvas]') as HTMLElement;
      if (!canvasEl) { toast.error('Impossible de capturer le design'); setSharing(false); return; }
      const canvas = await html2canvas(canvasEl, { backgroundColor: null, useCORS: true, scale: 2 });
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const fileName = `${crypto.randomUUID()}.png`;
      const { error: uploadError } = await supabase.storage.from('shared-designs').upload(fileName, blob, { contentType: 'image/png' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('shared-designs').getPublicUrl(fileName);
      const insertData: any = { design_name: designName, cup_color: cupColor, image_url: urlData.publicUrl };
      if (user) insertData.user_id = user.id;
      const { data, error } = await supabase.from('shared_designs').insert(insertData).select('id').single();
      if (error) throw error;
      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);
      toast.success('Lien de partage créé !', { description: 'Valide pendant 7 jours.' });
    } catch (err) { console.error(err); toast.error('Erreur lors du partage'); }
    setSharing(false);
  };

  if (isMobile) {
    return (
      <>
      <nav className="h-14 flex items-center justify-around border-t border-thin bg-background shrink-0 relative">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative">
              <button
                data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined}
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {tool.showPlus && <Plus size={9} strokeWidth={3} className="absolute -top-0.5 -right-1.5" />}
                </div>
                <span className="truncate max-w-[56px]">{tool.label}</span>
              </button>
              {tool.id === 'color' && showColorPopover && <ColorPopover position="above" />}
            </div>
          );
        })}
        <button
          data-tour="aide"
          onClick={startTour}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] text-muted-foreground"
        >
          <HelpCircle size={18} />
          <span>Aide</span>
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[9px] text-muted-foreground">
              <Headphones size={18} />
              <span>Assistance</span>
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
              <p className="text-xs text-muted-foreground">Notre équipe vous accompagne.</p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-xs text-muted-foreground">
                <span>🕐</span>
                <span>Lun – Ven : 9h00 – 18h00</span>
              </div>
              <a href="tel:+33123456789" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
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
      </nav>
    );
  }

  // Desktop / tablet: vertical sidebar
  return (
    <TooltipProvider delayDuration={300}>
    <aside className="w-[68px] flex flex-col items-center py-3 border-r border-thin bg-background shrink-0 relative">
      <div className="flex flex-col gap-1 flex-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    data-tour={tool.id === 'color' ? 'color' : tool.id === 'image' ? 'image' : undefined}
                    onClick={() => handleToolClick(tool.id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] transition-colors w-full ${
                      isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="relative">
                      <Icon size={18} />
                      {tool.showPlus && <Plus size={9} strokeWidth={3} className="absolute -top-0.5 -right-1.5" />}
                    </div>
                    <span className="truncate max-w-[56px]">{tool.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {tool.tooltip}
                </TooltipContent>
              </Tooltip>
              {tool.id === 'color' && showColorPopover && <ColorPopover position="side" />}
            </div>
          );
        })}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-tour="aide"
            onClick={startTour}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
          >
            <HelpCircle size={18} />
            <span>Aide</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Lancer le tutoriel
        </TooltipContent>
      </Tooltip>
    </aside>
    </TooltipProvider>
  );
};

export default LeftSidebar;
