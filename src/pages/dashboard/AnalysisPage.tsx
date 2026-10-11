import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { api, ClaimItem, WorkspaceItem } from '../../lib/api';
import { EvidenceViewerModal } from '../../components/EvidenceViewerModal';

export const AnalysisPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);

  useEffect(() => {
    api.get('/workspaces').then(res => {
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setActiveWorkspaceId(res.data[0].id);
      }
    });
  }, []);

  const fetchClaims = async (wsId: string) => {
    if (!wsId) return;
    setLoading(true);
    try {
      let url = `/verification/workspace/${wsId}/claims?`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;

      const res = await api.get(url);
      setClaims(res.data);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchClaims(activeWorkspaceId);
    }
  }, [activeWorkspaceId, statusFilter, searchQuery]);

  const handleRunVerification = async () => {
    if (!activeWorkspaceId) return;
    setVerifying(true);
    try {
      await api.post(`/verification/workspace/${activeWorkspaceId}/verify`);
      await fetchClaims(activeWorkspaceId);
    } catch (err) {
      console.error('Verification run failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Verification Engine Workspace</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Deterministic claim-level extraction, verbatim text matching, and multi-source cross-verification.
          </p>
        </div>

        <button
          onClick={handleRunVerification}
          disabled={verifying || !activeWorkspaceId}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
          {verifying ? 'Verifying Claims...' : 'Run Verification Engine'}
        </button>
      </div>

      {/* Filter and Workspace Selector */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims by entity, attribute, or value..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 placeholder:text-muted-foreground focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={activeWorkspaceId}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="">Active Claims (All)</option>
            <option value="Corroborated">Corroborated (Multi-Source)</option>
            <option value="Source Match">Source Match (Single-Source)</option>
            <option value="Conflicting">Conflicting Discrepancies</option>
            <option value="Unverified">Unverified (Missing Evidence)</option>
            <option value="Needs Review">Needs Review (OCR / Partial)</option>
            <option value="Invalidated">Invalidated (Audit Trail)</option>
          </select>
        </div>
      </div>

      {/* Claims Grid / List */}
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card text-muted-foreground text-xs space-y-3">
            <ShieldCheck size={36} className="mx-auto text-indigo-400/40" />
            <p>No claims extracted yet for this workspace.</p>
            <button
              onClick={handleRunVerification}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Trigger Verification Now
            </button>
          </div>
        ) : (
          claims.map((claim) => {
            const firstCite = claim.citations[0];
            const isConflicting = claim.status === 'Conflicting';
            const isCorroborated = claim.status === 'Corroborated' || claim.status === 'Verified';
            const isSourceMatch = claim.status === 'Source Match';
            const isUnverified = claim.status === 'Unverified';
            const isReview = claim.status === 'Needs Review';
            const isInvalidated = claim.status === 'Invalidated';

            return (
              <div 
                key={claim.id}
                className={`p-5 rounded-2xl glass-card border transition-all ${
                  isConflicting 
                    ? 'border-rose-500/40 bg-rose-950/10' 
                    : isCorroborated 
                    ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-950/5' 
                    : isSourceMatch
                    ? 'border-sky-500/30 hover:border-sky-500/50 bg-sky-950/5'
                    : isUnverified
                    ? 'border-purple-500/30 bg-purple-950/5'
                    : isInvalidated
                    ? 'border-slate-700/40 bg-slate-900/40 opacity-70'
                    : 'border-amber-500/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCorroborated
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isSourceMatch
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : isConflicting
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isUnverified
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : isInvalidated
                        ? 'bg-slate-700/40 text-slate-400 border border-slate-600/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {claim.status}
                    </span>

                    {claim.isDuplicate && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Multi-Source Consensus
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-muted-foreground">
                      Entity: <strong className="text-slate-200">{claim.entity}</strong> &bull; Attribute: <strong className="text-slate-200">{claim.attribute}</strong>
                    </span>
                  </div>

                  {firstCite && (
                    <button
                      onClick={() => setSelectedCitation({
                        documentTitle: firstCite.document.title,
                        location: firstCite.location,
                        excerpt: firstCite.excerpt,
                        status: claim.status,
                        verificationReason: claim.verificationReason,
                        charStart: firstCite.charStart,
                        charEnd: firstCite.charEnd
                      })}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Inspect Source Evidence <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <div className="text-sm font-semibold text-white my-2">
                  {claim.claimText}
                </div>

                {/* Excerpt Snippet */}
                {firstCite && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-border/50 text-xs text-slate-300 font-mono relative mt-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Source: {firstCite.document.title} ({firstCite.location})</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Verbatim Verified
                      </span>
                    </div>
                    <p className="italic">"{firstCite.excerpt}"</p>
                  </div>
                )}

                {/* Verification Rationale */}
                {claim.verificationReason && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-slate-300">Rationale: </span>
                    {claim.verificationReason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <EvidenceViewerModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
