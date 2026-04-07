import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage('Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-[1100] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-xl w-full max-w-[380px] p-6 relative animate-scale-in">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-secondary">
            <X size={16} />
          </button>

          <h2 className="text-lg font-semibold mb-1">
            {mode === 'login' ? 'Connectez-vous' : 'Créez votre compte'}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {mode === 'login'
              ? 'Pour sauvegarder et retrouver vos designs.'
              : 'Créez un compte pour sauvegarder vos personnalisations.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm border-thin rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-accent"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full text-sm border-thin rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-accent"
                placeholder="6 caractères minimum"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {message && <p className="text-xs text-success">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
            >
              {loading
                ? '...'
                : mode === 'login'
                ? 'Se connecter'
                : "S'inscrire"}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-accent hover:underline font-medium">
                  S'inscrire
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-accent hover:underline font-medium">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
