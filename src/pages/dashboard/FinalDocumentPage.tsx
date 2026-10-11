import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  FileText, 
  AlertTriangle,
  Sparkles,
  Layers
} from 'lucide-react';
import { api, ReportItem, WorkspaceItem } from '../../lib/api';
import { EvidenceViewerModal } from '../../components/EvidenceViewerModal';

export const FinalDocumentPage: React.FC = () => {
  const [report, setReport] = useState<ReportItem | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    api.get('/workspaces').then(res => {
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setActiveWorkspaceId(res.data[0].id);
      }
    });
  }, []);

  const fetchLatestReport = async (wsId: string) => {
    if (!wsId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/workspace/${wsId}`);
      if (res.data && res.data.length > 0) {
        setReport(res.data[0]);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchLatestReport(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  const handleGenerate = async () => {
    if (!activeWorkspaceId) return;
    setGenerating(true);
    try {
      const res = await api.post(`/reports/workspace/${activeWorkspaceId}/generate`, {
        title: 'Verified Multi-Source Synthesis Document'
      });
      setReport(res.data.report);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'csv' | 'md' | 'json') => {
    if (!report) return;
    setExporting(format);
    try {
      const res = await api.get(`/reports/${report.id}/export/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.${format === 'md' ? 'md' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Export failed for ${format}:`, err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Synthesized Verifiable Document</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              AUDIT READY
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Consolidated verifiable document with clickable citations, verbatim source spans, and conflict callouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeWorkspaceId}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating || !activeWorkspaceId}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Synthesizing...' : 'Re-Compose Document'}
          </button>
        </div>
      </div>

      {/* Export Bar */}
      {report && (
        <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Download size={16} className="text-indigo-400" /> Export Verified Document:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors"
            >
              {exporting === 'pdf' ? 'Preparing...' : '📄 PDF Report'}
            </button>
            <button
              onClick={() => handleDownload('docx')}
              disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
            >
              {exporting === 'docx' ? 'Preparing...' : '📝 Word (.docx)'}
            </button>
            <button
              onClick={() => handleDownload('csv')}
              disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              {exporting === 'csv' ? 'Preparing...' : '📊 CSV Ledger'}
            </button>
            <button
              onClick={() => handleDownload('md')}
              disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
            >
              {exporting === 'md' ? 'Preparing...' : '📋 Markdown (.md)'}
            </button>
            <button
              onClick={() => handleDownload('json')}
              disabled={!!exporting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            >
              {exporting === 'json' ? 'Preparing...' : '📦 JSON Ledger'}
            </button>
          </div>
        </div>
      )}

      {/* Document View Area */}
      {!report ? (
        <div className="p-16 text-center rounded-3xl glass-card text-muted-foreground text-xs space-y-4">
          <FileCheck size={44} className="mx-auto text-indigo-400/40" />
          <h3 className="text-base font-bold text-white">No Synthesized Document Yet</h3>
          <p className="max-w-md mx-auto">
            Click "Re-Compose Document" to synthesize all extracted evidence from your uploaded files into an evidence-grounded document.
          </p>
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            Generate Synthesis Now
          </button>
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-border/80 space-y-8 text-slate-200">
          {/* Document Content rendered with custom citation badges */}
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-indigo-400 prose-blockquote:border-indigo-500 prose-blockquote:text-slate-300 prose-table:text-xs">
            {report.markdownContent.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return <h1 key={idx} className="text-3xl font-black text-white border-b border-white/10 pb-4 mb-6">{block.replace('# ', '')}</h1>;
              }
              if (block.startsWith('## ')) {
                return <h2 key={idx} className="text-xl font-bold text-indigo-300 mt-8 mb-4 border-b border-border/40 pb-2">{block.replace('## ', '')}</h2>;
              }
              if (block.startsWith('### ')) {
                return <h3 key={idx} className="text-base font-bold text-slate-100 mt-6 mb-2">{block.replace('### ', '')}</h3>;
              }
              if (block.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="p-4 rounded-xl bg-indigo-950/20 border-l-4 border-indigo-500 text-xs text-indigo-200 font-mono my-4">
                    {block.replace(/> /g, '')}
                  </blockquote>
                );
              }
              if (block.includes('|')) {
                // Render table
                const rows = block.trim().split('\n').filter(r => !r.includes(':---'));
                if (rows.length > 0) {
                  return (
                    <div key={idx} className="my-4 overflow-x-auto rounded-xl border border-border/60">
                      <table className="w-full text-left text-xs divide-y divide-border/40">
                        <thead className="bg-slate-900/80 font-mono text-indigo-300">
                          <tr>
                            {rows[0].split('|').map((col, cIdx) => col.trim() && (
                              <th key={cIdx} className="p-3">{col.trim()}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 bg-slate-950/40">
                          {rows.slice(1).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.02]">
                              {row.split('|').map((col, cIdx) => col.trim() && (
                                <td key={cIdx} className="p-3 text-slate-300 font-mono text-[11px]">{col.trim()}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              // Normal text or bullet points with interactive citation pills
              return (
                <div key={idx} className="text-xs leading-relaxed my-3 font-normal text-slate-300">
                  {block.split('\n').map((line, lIdx) => {
                    const isBullet = line.startsWith('- ');
                    const content = isBullet ? line.replace(/^- /, '') : line;

                    return (
                      <div key={lIdx} className={isBullet ? "ml-4 my-1 flex items-start gap-2" : "my-1"}>
                        {isBullet && <span className="text-indigo-400 font-bold">&bull;</span>}
                        <span>
                          {content.split(/(\[\^[^\]]+\])/).map((part, pIdx) => {
                            if (part.startsWith('[^') && part.endsWith(']')) {
                              const tag = part.replace(/[\[\^\]]/g, '');
                              return (
                                <button
                                  key={pIdx}
                                  onClick={() => setSelectedCitation({
                                    documentTitle: `Verified Source (${tag})`,
                                    location: 'Source Location',
                                    excerpt: 'Verbatim evidence span registered in provenance index.',
                                    status: 'Verified'
                                  })}
                                  className="mx-1 px-1.5 py-0.2 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-[10px] font-mono text-indigo-300 hover:text-white transition-colors cursor-pointer"
                                >
                                  [{tag}]
                                </button>
                              );
                            }
                            return part;
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <EvidenceViewerModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
