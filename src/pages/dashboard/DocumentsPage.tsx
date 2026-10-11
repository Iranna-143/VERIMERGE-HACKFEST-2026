import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Files, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Hash,
  Lock
} from 'lucide-react';
import { api, DocumentItem } from '../../lib/api';
import { DocumentDetailsModal } from './DocumentDetailsModal';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = '/documents?';
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (classificationFilter) url += `classification=${encodeURIComponent(classificationFilter)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const res = await api.get(url);
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, classificationFilter, statusFilter]);

  const [retrying, setRetrying] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleReExtract = async (id: string) => {
    setRetrying(true);
    try {
      await api.post(`/documents/${id}/extract`);
      await fetchDocuments();
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setRetrying(false);
    }
  };

  const handleRetryAllFailed = async () => {
    setRetrying(true);
    try {
      await api.post('/documents/retry-failed');
      await fetchDocuments();
    } catch (err) {
      console.error('Retry all failed:', err);
    } finally {
      setRetrying(false);
    }
  };

  const hasFailedDocs = documents.some(d => d.status === 'Failed' || d.extractionStatus === 'Failed');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Document Ingestion Library</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse stored sources, review extracted text layers, checksums, and extraction integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasFailedDocs && (
            <button
              onClick={handleRetryAllFailed}
              disabled={retrying}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Retrying Failed...' : 'Retry Failed Documents'}
            </button>
          )}
          <Link
            to="/dashboard/upload"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Upload size={14} /> Upload Documents
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file title, extension, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 placeholder:text-muted-foreground focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="">All Classifications</option>
            <option value="Internal">Internal</option>
            <option value="Restricted">Restricted</option>
            <option value="Public">Public</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-3xl glass-card overflow-hidden border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-border/60 text-muted-foreground uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">SHA-256 Checksum</th>
                <th className="py-3.5 px-4">Words / Size</th>
                <th className="py-3.5 px-4">Extraction Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No documents found matching current filters.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 max-w-xs sm:max-w-md">
                        <FileText size={16} className="text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-white block truncate">{doc.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{doc.mimeType}</span>
                        </div>
                      </div>
                      {doc.limitationNotes && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                          <AlertTriangle size={11} className="shrink-0" />
                          <span className="truncate max-w-xs">{doc.limitationNotes}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                        doc.classification === 'Restricted' 
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}>
                        <Lock size={10} /> {doc.classification}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {doc.fileHash ? `${doc.fileHash.slice(0, 10)}...` : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{doc.wordCount} words</div>
                      <div className="text-[10px] text-muted-foreground">{Math.round(doc.size / 1024)} KB</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        doc.extractionStatus === 'Extracted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : doc.extractionStatus === 'OCR_Fallback'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : doc.extractionStatus === 'Partial'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {doc.extractionStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          title="View Extracted Text"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleReExtract(doc.id)}
                          title={doc.status === 'Failed' || doc.extractionStatus === 'Failed' ? 'Retry Extraction' : 'Re-extract'}
                          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                            doc.status === 'Failed' || doc.extractionStatus === 'Failed'
                              ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 bg-amber-500/10 border border-amber-500/30 font-semibold'
                              : 'text-slate-300 hover:text-indigo-300 hover:bg-white/10'
                          }`}
                        >
                          <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
                          {(doc.status === 'Failed' || doc.extractionStatus === 'Failed') && <span className="text-[10px]">Retry</span>}
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentDetailsModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
