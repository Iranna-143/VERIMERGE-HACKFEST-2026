import React from 'react';
import { X, FileText, Hash, Calendar, Layers, Shield, AlertTriangle } from 'lucide-react';
import { DocumentItem } from '../../lib/api';

interface DocumentDetailsModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#0F172A] border border-indigo-500/30 rounded-2xl shadow-2xl text-foreground overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex items-start justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white truncate max-w-xl">{document.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{document.mimeType}</span>
                <span>&bull;</span>
                <span>{Math.round(document.size / 1024)} KB</span>
                <span>&bull;</span>
                <span>{document.wordCount} words</span>
                <span>&bull;</span>
                <span className="text-indigo-400 font-semibold">{document.classification}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* SHA-256 Checksum banner */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-border/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Hash size={13} className="text-indigo-400" /> SHA-256 Checksum:
          </span>
          <span className="text-indigo-300 select-all truncate max-w-md">{document.fileHash || 'N/A'}</span>
        </div>

        {/* Limitation Notes if any */}
        {document.limitationNotes && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{document.limitationNotes}</span>
          </div>
        )}

        {/* Extracted Text Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Stored Extracted Text Layer
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Status: <strong className="text-emerald-400">{document.extractionStatus}</strong>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-border/60 font-mono text-xs text-slate-200 leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap select-text">
            {document.extractedText || '(No text layer extracted for this document)'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
