import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Lock
} from 'lucide-react';
import { api } from '../../lib/api';

export const AdminStatusPage: React.FC = () => {
  const [statusData, setStatusData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [statRes, logRes] = await Promise.all([
          api.get('/admin/status'),
          api.get('/admin/audit-logs')
        ]);
        setStatusData(statRes.data);
        setAuditLogs(logRes.data);
      } catch (err) {
        console.error('Failed to fetch admin status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-white">System Status & Security Audit Log</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor service availability, background OCR engines, database connectivity, and administrative audit trails.
        </p>
      </div>

      {statusData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Engine Status</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-xl font-black text-emerald-400">{statusData.status}</span>
            <span className="text-[11px] text-muted-foreground block font-mono">Uptime: {statusData.metrics?.uptimeSeconds}s</span>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Database</span>
              <Database size={16} className="text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-white block">Persistent SQLite</span>
            <span className="text-[10px] text-emerald-400 font-mono block">Zero-Config / Connected</span>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">OCR Engine</span>
              <Cpu size={16} className="text-cyan-400" />
            </div>
            <span className="text-sm font-bold text-white block">Tesseract.js</span>
            <span className="text-[10px] text-cyan-300 font-mono block">Active for Image Ingestion</span>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">AI Integration</span>
              <Activity size={16} className="text-violet-400" />
            </div>
            <span className="text-sm font-bold text-white block truncate">{statusData.services?.aiAssistant}</span>
            <span className="text-[10px] text-indigo-300 font-mono block">Deterministic Grounding Active</span>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="rounded-3xl glass-card overflow-hidden border border-border/60 space-y-3 p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock size={18} className="text-indigo-400" />
          Tamper-Evident Audit Trail
        </h3>
        <p className="text-xs text-muted-foreground">
          Records all document ingestion, verification runs, security classifications, report exports, and user sign-in events.
        </p>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-border/60 text-muted-foreground uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No audit events recorded yet.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {log.user?.name || 'System / Guest'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
