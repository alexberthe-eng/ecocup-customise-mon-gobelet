import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIWizardModalProps {
  open: boolean;
  onClose: () => void;
}

const AIWizardModal = ({ open, onClose }: AIWizardModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const addElement = useStore((s) => s.addElement);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error('Aucune image reçue');

      setGeneratedImage(data.imageUrl);
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e.message || 'Impossible de générer l\'image',
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
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setPrompt('');
    setGeneratedImage(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            Wizard IA – Générer une image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Décrivez l'image souhaitée</label>
            <Textarea
              placeholder="Ex : Un logo de fête avec des confettis colorés et un texte 'Joyeux Anniversaire'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Générer l'image
              </>
            )}
          </Button>

          {generatedImage && (
            <div className="space-y-3">
              <div className="border border-border rounded-lg overflow-hidden bg-secondary/30">
                <img
                  src={generatedImage}
                  alt="Image générée par IA"
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddToCanvas} className="flex-1">
                  <Plus size={16} />
                  Ajouter au design
                </Button>
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
