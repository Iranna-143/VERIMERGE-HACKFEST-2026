import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Layers, 
  Shield, 
  ArrowRight,
  FileCheck2,
  Lock,
  Sparkles
} from 'lucide-react';
import { api, WorkspaceItem } from '../../lib/api';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [classification, setClassification] = useState<'Internal' | 'Restricted' | 'Public'>('Internal');
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/workspaces').then(res => {
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setWorkspaceId(res.data[0].id);
      }
    });
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...dropped]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const picked = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...picked]);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(20);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });
      formData.append('classification', classification);
      if (workspaceId) formData.append('workspaceId', workspaceId);

      setUploadProgress(60);
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadProgress(100);
      setStatusMessage({
        type: 'success',
        text: res.data.message || 'Files successfully uploaded and processed into verification index!'
      });
      setSelectedFiles([]);
      setTimeout(() => {
        navigate('/dashboard/documents');
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to upload documents'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-white">Multi-Source Document Ingestion</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Upload multiple overlapping, conflicting, or partial documents to extract evidence and cross-verify facts.
        </p>
      </div>

      {/* Supported Formats Pills */}
      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-300 mr-2 flex items-center gap-1.5">
          <Layers size={14} className="text-indigo-400" /> Supported Formats:
        </span>
        {[
          'PDF (Searchable & Scan)',
          'DOCX Word',
          'XLSX Sheets',
          'CSV / TSV',
          'Markdown (.md)',
          'Plain Text (.txt, .log)',
          'Images (OCR: PNG, JPG, WebP)',
          'JSON & XML',
          'HTML'
        ].map((fmt, i) => (
          <span key={i} className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-900/80 border border-indigo-500/20 text-slate-300">
            {fmt}
          </span>
        ))}
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-4 ${
          isDragging 
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' 
            : 'border-indigo-500/30 bg-slate-950/40 hover:border-indigo-400 hover:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.log,.json,.xml,.html,.png,.jpg,.jpeg,.webp,.tiff"
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Upload size={32} />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Drag & drop your files here, or click to browse</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Supports multi-file selection &bull; Up to 20 files per batch &bull; Max 25MB each
          </p>
        </div>
      </div>

      {/* Classification & Workspace Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl glass-card space-y-3">
          <label className="text-xs font-semibold text-slate-200 block flex items-center gap-2">
            <Lock size={14} className="text-indigo-400" /> Security Classification
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Internal', 'Restricted', 'Public'] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setClassification(cls)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  classification === cls
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/60 border-border/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Restricted documents are subject to strict per-user authorization checks.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-3">
          <label className="text-xs font-semibold text-slate-200 block">
            Target Collection / Workspace
          </label>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-900/80 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name} {ws.isDemo ? '[DEMO]' : ''}</option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            All uploaded files will be cross-referenced against documents in this collection.
          </p>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck2 size={16} className="text-indigo-400" />
              Files Queued for Ingestion ({selectedFiles.length})
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-border/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText size={18} className="text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.round(file.size / 1024)} KB &bull; Type: {file.type || 'Document'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span>Ingesting, hashing, and extracting text...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {statusMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-medium ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/30 border border-rose-500/30 text-rose-300'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? 'Processing Documents...' : `Ingest ${selectedFiles.length} File(s)`}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
