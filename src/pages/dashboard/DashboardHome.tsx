import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Files, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Upload, 
  FileCheck, 
  RefreshCw,
  GitMerge,
  Eye
} from 'lucide-react';
import { api, DocumentItem, WorkspaceItem } from '../../lib/api';
import { VerificationVisual3D } from '../../components/3d/VerificationVisual3D';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalClaims: 0,
    verifiedClaims: 0,
    conflictingClaims: 0,
    needsReviewClaims: 0,
    activeConflicts: 0,
    trustScore: 100
  });
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch workspaces
      const wsRes = await api.get('/workspaces');
      setWorkspaces(wsRes.data);

      const activeWs = wsRes.data[0] || null;
      setCurrentWorkspace(activeWs);

      if (activeWs) {
        // Fetch stats
        const statsRes = await api.get(`/verification/workspace/${activeWs.id}/stats`);
        setStats(statsRes.data);

        // Fetch recent documents
        const docsRes = await api.get(`/documents?workspaceId=${activeWs.id}`);
        setRecentDocs(docsRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLoadDemo = async () => {
    setActionLoading(true);
    try {
      await api.post('/demo/load');
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to load demo workspace:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunVerify = async () => {
    if (!currentWorkspace) return;
    setActionLoading(true);
    try {
      await api.post(`/verification/workspace/${currentWorkspace.id}/verify`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Verification Command Center</h1>
            {currentWorkspace?.isDemo && (
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO WORKSPACE
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active Collection: <span className="font-semibold text-slate-200">{currentWorkspace?.name || 'Default Workspace'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemo}
            disabled={actionLoading}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Sparkles size={14} />
            {actionLoading ? 'Loading...' : 'Load HackFest Demo'}
          </button>

          <button
            onClick={handleRunVerify}
            disabled={actionLoading || !currentWorkspace}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} className={actionLoading ? 'animate-spin' : ''} />
            Run Verification
          </button>
        </div>
      </div>

      {/* Grid: 3D Trust Score & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* 3D Trust Score Card */}
        <div className="md:col-span-4 p-6 rounded-3xl glass-card flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Deterministic Engine</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stats.activeConflicts > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {stats.activeConflicts > 0 ? `${stats.activeConflicts} Conflicts Active` : 'Fully Synchronized'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Evidence Integrity</h3>
          </div>

          <VerificationVisual3D 
            status={stats.activeConflicts > 0 ? 'conflicts' : 'verified'} 
            score={stats.trustScore} 
          />

          <div className="pt-2 border-t border-border/40 text-center">
            <p className="text-[11px] text-muted-foreground">
              Based on {stats.totalClaims} extracted claims across {stats.totalDocuments} ingested source files.
            </p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="md:col-span-8 grid grid-cols-2 gap-4">
          {/* Card 1: Total Docs */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Ingested Documents</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Files size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white">{stats.totalDocuments}</span>
              <Link to="/dashboard/documents" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-2">
                Browse file library <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 2: Verified Claims */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Verified Claims</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-emerald-400">{stats.verifiedClaims}</span>
              <Link to="/dashboard/analysis" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 mt-2">
                Inspect evidence spans <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 3: Detected Contradictions */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Contradictions</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-rose-400">{stats.activeConflicts}</span>
              <Link to="/dashboard/conflicts" className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 mt-2">
                Review opposing evidence <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 4: Items Under Review */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Needs Review</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <HelpCircle size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-amber-400">{stats.needsReviewClaims}</span>
              <Link to="/dashboard/analysis" className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 mt-2">
                Evaluate limitations <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Ingested Files */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Files size={18} className="text-indigo-400" />
              Recent Ingested Sources
            </h3>
            <Link to="/dashboard/documents" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <p>No documents uploaded in this workspace yet.</p>
              <Link to="/dashboard/upload" className="inline-flex items-center gap-1 text-indigo-400 font-semibold hover:underline">
                Upload files now <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-border/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {doc.mimeType.split('/')[1]?.slice(0, 4) || 'FILE'}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {Math.round(doc.size / 1024)} KB &bull; {doc.wordCount} words &bull; Class: {doc.classification}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      doc.extractionStatus === 'Extracted' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {doc.extractionStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white">Verification Actions</h3>
          
          <div className="space-y-3">
            <Link
              to="/dashboard/upload"
              className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Upload size={18} className="text-indigo-400" />
                <span className="text-xs font-semibold">Upload Documents</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard/final"
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-semibold">Generate Verifiable Document</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard/conflicts"
              className="flex items-center justify-between p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 hover:border-rose-500/50 text-rose-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <GitMerge size={18} className="text-rose-400" />
                <span className="text-xs font-semibold">Resolve Contradictions ({stats.activeConflicts})</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/50 text-[11px] text-muted-foreground">
            <span className="font-semibold text-slate-300 block mb-1">HackFest Demonstration Tip:</span>
            Click "Load HackFest Demo" to instantly populate 5 realistic documents containing a $4.2M vs $5.8M budget contradiction, multi-source consensus, and OCR image limitation!
          </div>
        </div>
      </div>
    </div>
  );
};
