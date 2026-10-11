import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Layers, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api, WorkspaceItem } from '../../lib/api';

export const WorkspacesPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/workspaces', { name, description });
      setName('');
      setDescription('');
      fetchWorkspaces();
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, wsName: string) => {
    if (!window.confirm(`Delete workspace "${wsName}" and all associated documents?`)) return;
    try {
      await api.delete(`/workspaces/${id}`);
      fetchWorkspaces();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      await api.post('/demo/load');
      fetchWorkspaces();
    } catch (err) {
      console.error('Failed to load demo:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Document Collections & Workspaces</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize documents into isolated collections for cross-referencing and verification.
          </p>
        </div>

        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Sparkles size={14} />
          {loadingDemo ? 'Populating Demo...' : 'Load HackFest Demo Workspace'}
        </button>
      </div>

      {/* Create New Workspace */}
      <form onSubmit={handleCreate} className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FolderPlus size={16} className="text-indigo-400" /> Create New Workspace
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workspace Name (e.g., 'Project Apollo Investigation')"
            required
            className="px-4 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-100 placeholder:text-muted-foreground focus:outline-none focus:border-indigo-400"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description or context notes..."
            className="px-4 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-100 placeholder:text-muted-foreground focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>

      {/* Workspace List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((ws) => (
          <div key={ws.id} className="p-6 rounded-3xl glass-card border border-border/60 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  Collection
                </span>
                {ws.isDemo && (
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    DEMO DATASET
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-1">{ws.name}</h3>
              {ws.description && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ws.description}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/40 text-center text-xs">
              <div>
                <span className="block font-black text-white">{ws._count?.documents || 0}</span>
                <span className="text-[10px] text-muted-foreground">Files</span>
              </div>
              <div>
                <span className="block font-black text-emerald-400">{ws._count?.claims || 0}</span>
                <span className="text-[10px] text-muted-foreground">Claims</span>
              </div>
              <div>
                <span className="block font-black text-rose-400">{ws._count?.conflicts || 0}</span>
                <span className="text-[10px] text-muted-foreground">Conflicts</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground">
                Created {new Date(ws.createdAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => handleDelete(ws.id, ws.name)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Workspace"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
