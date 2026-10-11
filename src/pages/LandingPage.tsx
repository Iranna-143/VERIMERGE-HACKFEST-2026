import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Layers, 
  GitMerge, 
  FileCheck, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Download,
  Sparkles,
  Lock,
  Cpu
} from 'lucide-react';
import { DocumentLayers3D } from '../components/3d/DocumentLayers3D';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    try {
      if (!user) {
        // Sign in or register demo user
        try {
          const res = await api.post('/auth/login', {
            email: 'demo@verimerge.io',
            password: 'demopassword123'
          });
          login(res.data.token, res.data.user);
        } catch {
          const res = await api.post('/auth/signup', {
            name: 'HackFest Judge',
            email: 'demo@verimerge.io',
            password: 'demopassword123'
          });
          login(res.data.token, res.data.user);
        }
      }
      // Load demo workspace
      await api.post('/demo/load');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to load demo:', err);
      navigate('/auth');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">VERIMERGE</span>
              <span className="block text-[10px] font-mono tracking-wider text-indigo-400 uppercase">Verifiable Multi-Source Ingestion</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLaunchDemo}
              disabled={loadingDemo}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105"
            >
              <Sparkles size={14} className="text-indigo-400" />
              {loadingDemo ? 'Initializing Demo...' : 'Load Demo Workspace'}
            </button>
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                Sign In / Get Started <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Document Layers */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HackFest 2026 Engine Ready &bull; Zero Hallucination Guarantee
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Multi-Source Ingestion into a <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">Single Verifiable Document</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Upload multiple overlapping, conflicting, or incomplete documents. Verimerge extracts evidence, detects contradictions, matches exact source spans, and generates one unified document where every single claim is traceable to its original page and row.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunchDemo}
                disabled={loadingDemo}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2.5 active:scale-95"
              >
                <Sparkles size={16} />
                {loadingDemo ? 'Loading Demo Workspace...' : 'Launch Interactive Demo'}
              </button>

              <Link
                to={user ? "/dashboard" : "/auth"}
                className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
              >
                Open Workspace <ArrowRight size={16} />
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
              <div>
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="text-xs text-muted-foreground">Verbatim Grounded</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-emerald-400">0%</span>
                <span className="text-xs text-muted-foreground">Fake Citations</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-indigo-400">11+</span>
                <span className="text-xs text-muted-foreground">Formats Supported</span>
              </div>
            </div>
          </div>

          {/* Hero Right 3D Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-2 glass-card">
              <div className="absolute -top-3 -right-3 z-20 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-mono font-bold backdrop-blur-md">
                3D Interactive Layer Stack
              </div>
              <DocumentLayers3D />
              <p className="text-center text-[11px] text-muted-foreground mt-2 pb-1 font-mono">
                Tilt with mouse &bull; Floating Document Layers & Evidence Nodes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Section: INGEST → EXTRACT → NORMALIZE → RESOLVE → VERIFY → SECURE → COMPOSE → EXPORT */}
      <section className="py-20 bg-slate-950/60 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Deterministic Engine Architecture</span>
            <h2 className="text-3xl font-extrabold text-white">End-to-End Evidence Pipeline</h2>
            <p className="text-sm text-slate-400">
              Unlike generic AI summarizers that hallucinate facts, Verimerge uses an 8-stage verifiable pipeline to guarantee provenance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Ingest', desc: 'Drag-and-drop 11+ formats with SHA-256 hash deduplication', icon: Layers, color: 'text-blue-400' },
              { step: '02', title: 'Extract', desc: 'PDF, DOCX, XLSX rows, CSV, JSON, XML, Image OCR', icon: Cpu, color: 'text-indigo-400' },
              { step: '03', title: 'Normalize', desc: 'Standardize entities, currencies ($4.2M), dates (Q4 2026)', icon: Database, color: 'text-violet-400' },
              { step: '04', title: 'Resolve', desc: 'Cluster entities and statements without destructive merging', icon: GitMerge, color: 'text-purple-400' },
              { step: '05', title: 'Verify', desc: 'Check that every cited excerpt exists verbatim in extracted text', icon: ShieldCheck, color: 'text-emerald-400' },
              { step: '06', title: 'Secure', desc: 'Enforce per-user ownership and Internal/Restricted labels', icon: Lock, color: 'text-amber-400' },
              { step: '07', title: 'Compose', desc: 'Synthesize document with clickable citations & conflict boxes', icon: FileCheck, color: 'text-cyan-400' },
              { step: '08', title: 'Export', desc: 'Generate real PDF, DOCX, Markdown, and CSV evidence ledgers', icon: Download, color: 'text-emerald-400' },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl glass-card hover:border-indigo-500/40 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{p.step}</span>
                    <Icon className={`w-5 h-5 ${p.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison: Generic AI Summary vs Verimerge */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Why Verimerge Wins</h2>
            <p className="text-sm text-slate-400">The critical difference between arbitrary AI summaries and audit-ready verification.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Generic AI */}
            <div className="p-8 rounded-3xl bg-red-950/20 border border-red-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-red-200">Standard AI Summarizer</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">&times;</span>
                  Arbitrarily invents or blends conflicting statements.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">&times;</span>
                  Fabricates citations and non-existent page numbers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">&times;</span>
                  Conceals disagreements when two departments submit differing budgets.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">&times;</span>
                  Fails completely if API key is invalid or quota runs out.
                </li>
              </ul>
            </div>

            {/* Verimerge */}
            <div className="p-8 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 glow-violet space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Verimerge Verification Engine</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">&check;</span>
                  Deterministic verification matches excerpts verbatim in source text.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">&check;</span>
                  Every claim has a clickable citation opening exact physical location.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">&check;</span>
                  Highlights contradictions side-by-side without arbitrarily choosing a winner.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">&check;</span>
                  Fully functional offline without requiring paid external AI keys!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">VERIMERGE</span> &bull; HackFest 2026 Production Edition
          </div>
          <div>
            Built with React 19, TypeScript, Express, SQLite persistent storage, and Three.js
          </div>
        </div>
      </footer>
    </div>
  );
};
