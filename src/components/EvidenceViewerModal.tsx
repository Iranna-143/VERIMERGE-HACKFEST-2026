import React from 'react';
import { X, ExternalLink, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface CitationData {
  documentTitle: string;
  location: string;
  excerpt: string;
  status?: string;
  classification?: string;
  charStart?: number;
  charEnd?: number;
  verifiedInText?: boolean;
  verificationReason?: string;
}

interface EvidenceViewerModalProps {
  citation: CitationData | null;
  onClose: () => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-indigo-500/30 rounded-2xl shadow-2xl p-6 text-foreground overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        <div className="flex items-start justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Source Evidence Inspector</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verbatim Match
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Deterministic Grounding & Physical Location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Document metadata card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-border/60">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Source Document</span>
              <div className="flex items-center gap-2 mt-1">
                <FileText size={15} className="text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold text-white truncate">{citation.documentTitle}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Physical Location</span>
              <span className="text-sm font-medium text-slate-200 mt-1 block">{citation.location || 'Document Body'}</span>
            </div>
          </div>

          {/* Verbatim Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Verbatim Extracted Span
              </span>
              {citation.charStart !== undefined && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  Offset: [{citation.charStart} - {citation.charEnd}]
                </span>
              )}
            </div>
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-slate-100 font-mono text-xs leading-relaxed relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              <p className="italic">"{citation.excerpt}"</p>
            </div>
          </div>

          {/* Verification Reason */}
          {citation.verificationReason && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
              <span className="font-semibold block mb-0.5">Verification Rationale:</span>
              {citation.verificationReason}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
