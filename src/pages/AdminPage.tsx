import { useState } from 'react';
import { Plus, Upload, Pencil, Trash2, Eye } from 'lucide-react';

interface AdminItem {
  id: string;
  name: string;
  tags: string[];
  format: string;
  status: 'actif' | 'brouillon';
  src?: string;
}

const DEMO_ITEMS: AdminItem[] = [
  { id: '1', name: 'Logo étoile', tags: ['logo', 'étoile'], format: 'SVG', status: 'actif' },
  { id: '2', name: 'Motif vagues', tags: ['motif', 'nature'], format: 'SVG', status: 'brouillon' },
];

type AdminTab = 'visuels' | 'graduations' | 'tags' | 'masques';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('visuels');
  const [items, setItems] = useState<AdminItem[]>(DEMO_ITEMS);
  const [showUpload, setShowUpload] = useState(false);

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'visuels', label: 'Visuels / pictos' },
    { id: 'graduations', label: 'Graduations' },
    { id: 'tags', label: 'Tags & catégories' },
    { id: 'masques', label: 'Masques' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 flex items-center px-4 border-b border-thin">
        <span className="font-bold text-sm tracking-wide">ECOCUP®</span>
        <span className="text-xs text-muted-foreground ml-3">— Administration</span>
        <a href="/" className="ml-auto text-xs text-accent hover:underline">← Retour au configurateur</a>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'visuels' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold">Visuels & pictos</h2>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:opacity-90"
              >
                <Plus size={12} /> Ajouter un picto
              </button>
            </div>

            <div className="border-thin rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left px-3 py-2 font-medium">Aperçu</th>
                    <th className="text-left px-3 py-2 font-medium">Nom</th>
                    <th className="text-left px-3 py-2 font-medium">Tags</th>
                    <th className="text-left px-3 py-2 font-medium">Format</th>
                    <th className="text-left px-3 py-2 font-medium">Statut</th>
                    <th className="text-right px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-thin">
                      <td className="px-3 py-2">
                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                          <Eye size={12} className="text-muted-foreground" />
                        </div>
                      </td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 flex-wrap">
                          {item.tags.map((t) => (
                            <span key={t} className="bg-secondary px-1.5 py-0.5 rounded text-[9px]">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">{item.format}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                          item.status === 'actif' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {item.status === 'actif' ? 'Actif' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="p-1 hover:bg-secondary rounded" title="Modifier">
                            <Pencil size={10} />
                          </button>
                          <button className="p-1 hover:bg-secondary rounded" title="Re-upload">
                            <Upload size={10} />
                          </button>
                          <button className="p-1 hover:bg-destructive/10 rounded text-destructive" title="Retirer">
                            <Trash2 size={10} />
                          </button>
                          {item.status === 'brouillon' && (
                            <button
                              onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, status: 'actif' } : i))}
                              className="text-[9px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded hover:opacity-90"
                            >
                              Publier
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'graduations' && (
          <p className="text-xs text-muted-foreground">Gestion des fichiers SVG de graduation à venir.</p>
        )}
        {activeTab === 'tags' && (
          <p className="text-xs text-muted-foreground">Gestion de la taxonomie de tags à venir.</p>
        )}
        {activeTab === 'masques' && (
          <p className="text-xs text-muted-foreground">Upload de masques SVG pour le recadrage à venir.</p>
        )}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50" onClick={() => setShowUpload(false)}>
          <div className="bg-background rounded-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-4">Ajouter un picto</h3>
            <div className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload size={20} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">SVG uniquement</p>
              </div>
              <input placeholder="Nom" className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background" />
              <input placeholder="Tags (séparés par des virgules)" className="w-full text-xs border-thin rounded-md px-2 py-1.5 bg-background" />
              <div className="flex items-center justify-between text-xs">
                <span>Statut</span>
                <select className="border-thin rounded-md px-2 py-1 bg-background text-xs">
                  <option>Actif</option>
                  <option>Brouillon</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowUpload(false)} className="text-xs border-thin rounded-md px-3 py-1.5 hover:bg-secondary">Annuler</button>
              <button className="text-xs bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
