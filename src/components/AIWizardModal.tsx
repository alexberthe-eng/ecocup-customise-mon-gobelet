import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Plus, Replace } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIWizardModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the wizard operates in "edit" mode on this element */
  editElementId?: string | null;
}

const AIWizardModal = ({ open, onClose, editElementId }: AIWizardModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const addElement = useStore((s) => s.addElement);
  const updateElement = useStore((s) => s.updateElement);
  const pushHistory = useStore((s) => s.pushHistory);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const elements = useStore((s) => s.currentDesign.elements);

  const editElement = editElementId ? elements.find((e) => e.id === editElementId) : null;
  const isEditMode = !!editElement && (editElement.type === 'image' || editElement.type === 'svg');

  useEffect(() => {
    if (!open) {
      setPrompt('');
      setGeneratedImage(null);
      setLoading(false);
    }
  }, [open]);

  const getImageAsBase64 = async (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedImage(null);

    try {
      let body: Record<string, string> = { prompt: prompt.trim() };

      if (isEditMode && editElement.src) {
        try {
          const base64 = await getImageAsBase64(editElement.src);
          body.imageBase64 = base64;
        } catch {
          // If we can't convert, proceed without the image
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-image', { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error('Aucune image reçue');

      setGeneratedImage(data.imageUrl);
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e.message || "Impossible de générer l'image",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCanvas = () => {
    if (!generatedImage) return;

    addElement({
      id: crypto.randomUUID(),
      type: 'image',
      x: 100,
      y: 80,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 100,
      color: '#000000',
      zIndex: Date.now(),
      src: generatedImage,
    });

    setActiveTab('2d');
    toast({ title: 'Image ajoutée au canvas !' });
    onClose();
  };

  const handleReplaceElement = () => {
    if (!generatedImage || !editElementId) return;

    updateElement(editElementId, { src: generatedImage }, false);
    pushHistory();
    toast({ title: 'Image modifiée avec succès !' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            {isEditMode ? 'Modifier l\'image avec l\'IA' : 'Wizard IA – Générer une image'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show source image in edit mode */}
          {isEditMode && editElement.src && (
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Image actuelle</label>
              <div className="border border-border rounded-lg overflow-hidden bg-secondary/30 max-h-[150px]">
                <img src={editElement.src} alt="Image source" className="w-full h-auto max-h-[150px] object-contain" />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {isEditMode ? 'Décrivez les modifications souhaitées' : "Décrivez l'image souhaitée"}
            </label>
            <Textarea
              placeholder={
                isEditMode
                  ? 'Ex : Ajoute des confettis, change les couleurs en bleu, enlève le texte...'
                  : "Ex : Un logo de fête avec des confettis colorés et un texte 'Joyeux Anniversaire'..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <Button onClick={handleGenerate} disabled={!prompt.trim() || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? 'Modification en cours…' : 'Génération en cours…'}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {isEditMode ? "Modifier l'image" : "Générer l'image"}
              </>
            )}
          </Button>

          {generatedImage && (
            <div className="space-y-3">
              <div className="border border-border rounded-lg overflow-hidden bg-secondary/30">
                <img src={generatedImage} alt="Image générée par IA" className="w-full h-auto max-h-[300px] object-contain" />
              </div>
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button onClick={handleReplaceElement} className="flex-1">
                      <Replace size={16} />
                      Remplacer l'image
                    </Button>
                    <Button variant="outline" onClick={handleAddToCanvas}>
                      <Plus size={16} />
                      Ajouter comme nouveau
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddToCanvas} className="flex-1">
                    <Plus size={16} />
                    Ajouter au design
                  </Button>
                )}
                <Button variant="outline" onClick={handleGenerate} disabled={loading}>
                  Régénérer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIWizardModal;
