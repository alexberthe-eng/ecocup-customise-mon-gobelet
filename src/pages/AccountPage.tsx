import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { User, Package, Image, Share2, Settings, LogOut, ShoppingCart, Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'orders' | 'designs' | 'shares' | 'profile';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
};

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('designs');
  const [loading, setLoading] = useState(true);

  // Data
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '', company: '', phone: '', address: '', city: '', postal_code: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await loadData(session.user.id);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/auth');
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    const [profileRes, ordersRes, designsRes, sharesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('saved_designs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('shared_designs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setProfileForm({
        full_name: profileRes.data.full_name || '',
        company: profileRes.data.company || '',
        phone: profileRes.data.phone || '',
        address: profileRes.data.address || '',
        city: profileRes.data.city || '',
        postal_code: profileRes.data.postal_code || '',
      });
    }
    setOrders(ordersRes.data || []);
    setDesigns(designsRes.data || []);
    setShares(sharesRes.data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ ...profileForm, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) toast.error('Erreur lors de la sauvegarde');
    else toast.success('Profil mis à jour');
  };

  const handleDeleteDesign = async (id: string) => {
    const { error } = await supabase.from('saved_designs').delete().eq('id', id);
    if (error) toast.error('Erreur');
    else {
      setDesigns((d) => d.filter((x) => x.id !== id));
      toast.success('Design supprimé');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'designs', label: 'Mes designs', icon: Image },
    { id: 'orders', label: 'Mes commandes', icon: Package },
    { id: 'shares', label: 'Mes partages', icon: Share2 },
    { id: 'profile', label: 'Mon profil', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-sm tracking-wide">ECOCUP®</Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">Mon espace client</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Créer un design</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar / tabs */}
        <nav className="md:w-[200px] md:border-r border-b md:border-b-0 border-border bg-secondary/20 shrink-0">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === t.id
                      ? 'bg-background text-foreground border-b-2 md:border-b-0 md:border-r-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
          {/* User info */}
          <div className="hidden md:block p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{profileForm.full_name || user?.email}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Designs tab */}
          {tab === 'designs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Mes designs ({designs.length})</h2>
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} />
                  Nouveau design
                </Link>
              </div>
              {designs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Image size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun design sauvegardé</p>
                  <p className="text-xs mt-1">Créez un design et sauvegardez-le depuis l'éditeur.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designs.map((d) => (
                    <div key={d.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      {d.thumbnail_url ? (
                        <img src={d.thumbnail_url} alt={d.design_name} className="w-full h-36 object-cover bg-secondary" />
                      ) : (
                        <div className="w-full h-36 flex items-center justify-center" style={{ backgroundColor: d.cup_color }}>
                          <Image size={24} className="text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-medium truncate">{d.design_name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(d.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              const designData = d.design_data as any;
                              if (designData && designData.elements) {
                                useStore.getState().loadSavedDesign(designData);
                                navigate('/');
                              } else {
                                toast.error('Données du design invalides');
                              }
                            }}
                            className="flex-1 text-[10px] py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                          >
                            <Pencil size={10} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteDesign(d.id)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders tab */}
          {tab === 'orders' && (
            <div>
              <h2 className="text-sm font-semibold mb-4">Mes commandes ({orders.length})</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune commande</p>
                  <p className="text-xs mt-1">Vos commandes apparaîtront ici.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => {
                    const status = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                    const designCount = Array.isArray(o.designs) ? o.designs.length : 0;
                    return (
                      <div key={o.id} className="border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium">Commande du {new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{designCount} design{designCount > 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-sm font-semibold">{Number(o.total_amount).toFixed(2)} €</span>
                          </div>
                        </div>
                        {o.notes && (
                          <p className="text-[10px] text-muted-foreground mt-2 italic">{o.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Shares tab */}
          {tab === 'shares' && (
            <div>
              <h2 className="text-sm font-semibold mb-4">Mes partages ({shares.length})</h2>
              {shares.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Share2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun partage</p>
                  <p className="text-xs mt-1">Vos liens de partage apparaîtront ici.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shares.map((s) => {
                    const isExpired = new Date(s.expires_at) < new Date();
                    return (
                      <div key={s.id} className="border border-border rounded-xl p-4 flex items-center gap-3">
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.design_name} className="w-14 h-14 rounded-lg object-cover bg-secondary shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-secondary shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{s.design_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Partagé le {new Date(s.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                            isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isExpired ? 'Expiré' : 'Actif'}
                          </span>
                        </div>
                        {!isExpired && (
                          <a
                            href={`/share/${s.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-secondary rounded-md"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile tab */}
          {tab === 'profile' && (
            <div>
              <h2 className="text-sm font-semibold mb-4">Mon profil</h2>
              <div className="max-w-md space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Entreprise</label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Adresse</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Ville</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Code postal</label>
                    <input
                      type="text"
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-secondary text-muted-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">L'email ne peut pas être modifié ici.</p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity mt-2"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountPage;
