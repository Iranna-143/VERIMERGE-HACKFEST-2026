import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Download, 
  Calendar, 
  Eye, 
  Clock, 
  Sparkles,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { api, ReportItem, WorkspaceItem } from '../../lib/api';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/workspaces').then(res => {
      setWorkspaces(res.data);
      if (res.data.length > 0) setActiveWorkspaceId(res.data[0].id);
    });
  }, []);

  const fetchReports = async (wsId: string) => {
    if (!wsId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/workspace/${wsId}`);
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspaceId) fetchReports(activeWorkspaceId);
  }, [activeWorkspaceId]);

  const handleDownload = async (reportId: string, title: string, format: string) => {
    setDownloadingId(`${reportId}-${format}`);
    try {
      const res = await api.get(`/reports/${reportId}/export/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.${format === 'md' ? 'md' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Synthesized Reports & Ledger History</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access previous verified syntheses, reopen full documents, and export to PDF, Word, CSV, or Markdown.
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

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card text-muted-foreground text-xs space-y-3">
            <FileCheck size={36} className="mx-auto text-indigo-400/40" />
            <h3 className="text-base font-bold text-white">No Previous Reports</h3>
            <p>Generate a verifiable document from the Final Docs tab to save reports here.</p>
            <Link
              to="/dashboard/final"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Go to Final Document Page
            </Link>
          </div>
        ) : (
          reports.map((r) => {
            let summaryStats = null;
            if (r.verificationSummaryJson) {
              try { summaryStats = JSON.parse(r.verificationSummaryJson); } catch (e) {}
            }

            return (
              <div key={r.id} className="p-6 rounded-3xl glass-card border border-border/60 hover:border-indigo-500/30 transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{r.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <Clock size={12} />
                        <span>Generated on {new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/dashboard/final"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Eye size={14} /> Open in Document Viewer
                  </Link>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-border/40">
                  {r.executiveSummary || 'Synthesis document with verified citations and provenance tracking.'}
                </p>

                {summaryStats && (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Sources: <strong className="text-white">{summaryStats.totalDocuments}</strong></span>
                    <span>Verified Claims: <strong className="text-emerald-400">{summaryStats.verifiedCount}</strong></span>
                    <span>Conflicts: <strong className="text-rose-400">{summaryStats.conflictsCount}</strong></span>
                    <span>Review: <strong className="text-amber-400">{summaryStats.reviewCount}</strong></span>
                  </div>
                )}

                {/* 1-Click Export Buttons */}
                <div className="pt-3 border-t border-border/40 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-2">Download:</span>
                  <button
                    onClick={() => handleDownload(r.id, r.title, 'pdf')}
                    disabled={downloadingId === `${r.id}-pdf`}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                  >
                    PDF Report
                  </button>
                  <button
                    onClick={() => handleDownload(r.id, r.title, 'docx')}
                    disabled={downloadingId === `${r.id}-docx`}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
                  >
                    Word (.docx)
                  </button>
                  <button
                    onClick={() => handleDownload(r.id, r.title, 'csv')}
                    disabled={downloadingId === `${r.id}-csv`}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                  >
                    CSV Ledger
                  </button>
                  <button
                    onClick={() => handleDownload(r.id, r.title, 'md')}
                    disabled={downloadingId === `${r.id}-md`}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleDownload(r.id, r.title, 'json')}
                    disabled={downloadingId === `${r.id}-json`}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
                  >
                    JSON Ledger
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
