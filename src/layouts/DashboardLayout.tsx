import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Files, 
  Upload, 
  ShieldCheck, 
  GitMerge, 
  FileCheck, 
  Settings,
  LogOut,
  MessageSquare,
  Layers,
  Download,
  Activity,
  Sparkles,
  ChevronRight,
  Shield
} from 'lucide-react';
import { api } from '../lib/api';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workspaces', path: '/dashboard/workspaces', icon: Layers },
    { name: 'Multi-Upload', path: '/dashboard/upload', icon: Upload },
    { name: 'My Documents', path: '/dashboard/documents', icon: Files },
    { name: 'Verification Engine', path: '/dashboard/analysis', icon: ShieldCheck },
    { name: 'Contradictions', path: '/dashboard/conflicts', icon: GitMerge },
    { name: 'Combined Document', path: '/dashboard/final', icon: FileCheck },
    { name: 'Evidence Chatbot', path: '/dashboard/chat', icon: MessageSquare },
    { name: 'Reports & Export', path: '/dashboard/reports', icon: Download },
    { name: 'System Status & Audit', path: '/dashboard/admin', icon: Activity },
  ];

  const handleQuickDemo = async () => {
    setLoadingDemo(true);
    try {
      await api.post('/demo/load');
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      console.error('Demo loading failed:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F19] text-[#F3F4F6]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-[#0F172A]/90 backdrop-blur-xl flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">VERIMERGE</span>
              <span className="text-[9px] font-mono font-semibold tracking-wider text-indigo-400 uppercase">Verification Engine</span>
            </div>
          </Link>
        </div>

        {/* Quick Demo Trigger for HackFest Judges */}
        <div className="px-4 pt-4">
          <button
            onClick={handleQuickDemo}
            disabled={loadingDemo}
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600/30 to-violet-600/30 hover:from-indigo-600/50 hover:to-violet-600/50 border border-indigo-500/40 text-indigo-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles size={13} className="text-indigo-400 animate-spin" />
            {loadingDemo ? 'Loading...' : 'Load HackFest Demo'}
          </button>
        </div>
        
        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-border/40 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-1 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-semibold"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0B0F19]">
        <div className="p-6 sm:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating Chat Button */}
      <Link 
        to="/dashboard/chat"
        title="Open Evidence Assistant"
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-indigo-400/30"
      >
        <MessageSquare size={20} />
      </Link>
    </div>
  );
}
