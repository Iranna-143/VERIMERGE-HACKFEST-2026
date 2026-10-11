import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  GitMerge, 
  FileText, 
  Check, 
  X, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { api, ConflictItem, WorkspaceItem } from '../../lib/api';
import { EvidenceViewerModal } from '../../components/EvidenceViewerModal';

export const ConflictsPage: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Open' | 'Invalid' | 'Resolved' | 'All'>('Open');

  useEffect(() => {
    api.get('/workspaces').then(res => {
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setActiveWorkspaceId(res.data[0].id);
      }
    });
  }, []);

  const fetchConflicts = async (wsId: string) => {
    if (!wsId) return;
    setLoading(true);
    try {
      const res = await api.get(`/verification/workspace/${wsId}/conflicts`);
      setConflicts(res.data);
    } catch (err) {
      console.error('Failed to fetch conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchConflicts(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  const handleResolveConflict = async (id: string, status: 'Resolved' | 'Dismissed') => {
    try {
      await api.patch(`/verification/conflict/${id}/resolve`, {
        status,
        resolution: resolutionText
      });
      setResolvingId(null);
      setResolutionText('');
      fetchConflicts(activeWorkspaceId);
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
    }
  };

  const openCount = conflicts.filter(c => c.status === 'Open').length;
  const invalidCount = conflicts.filter(c => c.status === 'Invalid').length;
  const resolvedCount = conflicts.filter(c => c.status === 'Resolved' || c.status === 'Dismissed').length;

  const filteredConflicts = conflicts.filter(c => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Resolved') return c.status === 'Resolved' || c.status === 'Dismissed';
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Contradictions & Conflict Discrepancies</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Opposing factual statements discovered across multiple documents. Verimerge highlights both sides for audit review.
          </p>
        </div>

        <select
          value={activeWorkspaceId}
          onChange={(e) => setActiveWorkspaceId(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
        >
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-border/60">
        <button
          onClick={() => setStatusFilter('Open')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'Open'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Active Conflicts ({openCount})
        </button>
        <button
          onClick={() => setStatusFilter('Invalid')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'Invalid'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Audit Trail / Invalidated ({invalidCount})
        </button>
        <button
          onClick={() => setStatusFilter('Resolved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'All'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          All Records ({conflicts.length})
        </button>
      </div>

      {filteredConflicts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card text-muted-foreground text-xs space-y-3">
          <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            {statusFilter === 'Open' ? 'Zero Active Contradictions' : `No ${statusFilter} records found`}
          </h3>
          <p className="max-w-md mx-auto">
            {statusFilter === 'Open'
              ? 'All active evidence claims in this collection are either verified or single-source.'
              : 'There are no conflict records matching this status category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredConflicts.map((con, idx) => {
            const cite1 = con.claim1?.citations?.[0];
            const cite2 = con.claim2?.citations?.[0];
            const isInvalid = con.status === 'Invalid';
            const isResolved = con.status === 'Resolved';

            return (
              <div
                key={con.id}
                className={`p-6 rounded-3xl glass-card border space-y-5 transition-all ${
                  isInvalid
                    ? 'border-slate-700/60 bg-slate-950/40 opacity-80'
                    : isResolved
                    ? 'border-emerald-500/30 glow-emerald'
                    : 'border-rose-500/30 glow-rose'
                }`}
              >
                {/* Header */}
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b ${
                  isInvalid ? 'border-slate-800' : isResolved ? 'border-emerald-500/20' : 'border-rose-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isInvalid
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {isInvalid ? <HelpCircle size={20} /> : isResolved ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${
                          isInvalid ? 'text-slate-400' : isResolved ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isInvalid ? 'AUDIT RECORD' : 'CONFLICT'} #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isInvalid
                            ? 'bg-slate-700/50 text-slate-300'
                            : isResolved
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {isInvalid ? 'Invalidated (False Positive)' : con.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">{con.description}</h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-muted-foreground">
                    Target: <strong className="text-slate-200">{con.entity || 'General'}</strong> &bull; Attribute: <strong className="text-slate-200">{con.attribute}</strong>
                  </span>
                </div>

                {isInvalid && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                    <span>
                      <strong>Audit Trail Notice:</strong> This historical record compared non-factual structural headings, attendee roles, or missing evidence labels. It has been audited and superseded by the deterministic verification engine and is excluded from active conflict metrics.
                    </span>
                  </div>
                )}

                {/* Side-by-Side Opposing Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source A */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">Evidence Source A</span>
                      {cite1 && (
                        <button
                          onClick={() => setSelectedCitation({
                            documentTitle: cite1.document.title,
                            location: cite1.location,
                            excerpt: cite1.excerpt,
                            status: 'Conflicting'
                          })}
                          className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          Inspect <ExternalLink size={10} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-indigo-400 shrink-0" />
                      <span className="text-xs font-semibold text-white truncate">{cite1?.document?.title || 'Source Document'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                      <span className="text-[10px] text-muted-foreground uppercase block font-mono">Reported Value</span>
                      <span className="text-sm font-bold text-indigo-300">{con.claim1?.value}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono italic bg-slate-950/60 p-2.5 rounded-lg border border-border/40">
                      "{cite1?.excerpt || con.claim1?.claimText}" ({cite1?.location})
                    </div>
                  </div>

                  {/* Source B */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-rose-400 uppercase">Evidence Source B</span>
                      {cite2 && (
                        <button
                          onClick={() => setSelectedCitation({
                            documentTitle: cite2.document.title,
                            location: cite2.location,
                            excerpt: cite2.excerpt,
                            status: 'Conflicting'
                          })}
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                        >
                          Inspect <ExternalLink size={10} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-rose-400 shrink-0" />
                      <span className="text-xs font-semibold text-white truncate">{cite2?.document?.title || 'Source Document'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                      <span className="text-[10px] text-muted-foreground uppercase block font-mono">Reported Value</span>
                      <span className="text-sm font-bold text-rose-300">{con.claim2?.value}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono italic bg-slate-950/60 p-2.5 rounded-lg border border-border/40">
                      "{cite2?.excerpt || con.claim2?.claimText}" ({cite2?.location})
                    </div>
                  </div>
                </div>

                {/* Resolution action */}
                {con.status === 'Open' && (
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground">
                      Auditor Note: In the final combined report, both values are shown side-by-side with an explicit warning.
                    </span>

                    <div className="flex items-center gap-2">
                      {resolvingId === con.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                            placeholder="Resolution rationale..."
                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-border/70 text-slate-200"
                          />
                          <button
                            onClick={() => handleResolveConflict(con.id, 'Resolved')}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setResolvingId(null)}
                            className="px-2 py-1.5 text-xs rounded-lg text-muted-foreground hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingId(con.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors"
                        >
                          Add Audit Resolution
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <EvidenceViewerModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
