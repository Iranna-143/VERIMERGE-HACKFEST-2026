import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  ExternalLink, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { api, WorkspaceItem } from '../../lib/api';
import { EvidenceViewerModal } from '../../components/EvidenceViewerModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    claimId: string;
    documentTitle: string;
    location: string;
    excerpt: string;
    status: string;
  }>;
  conflictsWarning?: string;
  mode?: string;
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Verimerge Evidence Assistant. Ask any question about your authorized documents, and I will answer with verifiable source citations and verbatim excerpts.',
      citations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/workspaces').then(res => {
      setWorkspaces(res.data);
      if (res.data.length > 0) setActiveWorkspaceId(res.data[0].id);
    });

    // Load recent history
    api.get('/chat/history').then(res => {
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map((m: any) => ({
          role: m.role,
          content: m.content,
          citations: m.citationsJson ? JSON.parse(m.citationsJson) : []
        }));
        setMessages(prev => [...prev, ...mapped]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: userText,
        workspaceId: activeWorkspaceId
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          citations: res.data.citations,
          conflictsWarning: res.data.conflictsWarning,
          mode: res.data.mode
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred while searching your authorized evidence.',
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col glass-card rounded-3xl overflow-hidden border border-border/80 animate-in fade-in duration-300">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-border/60 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Evidence-Grounded Assistant</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grounded Mode
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Strict zero-hallucination answers backed by citations</p>
          </div>
        </div>

        <select
          value={activeWorkspaceId}
          onChange={(e) => setActiveWorkspaceId(e.target.value)}
          className="py-1.5 px-2.5 text-xs rounded-xl bg-slate-900 border border-border/70 text-slate-200 focus:outline-none focus:border-indigo-400"
        >
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-3 ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-900/90 border border-border/60 text-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Conflict warning if detected */}
              {msg.conflictsWarning && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{msg.conflictsWarning}</span>
                </div>
              )}

              {/* Citations Attached */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                    Grounded Evidence Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => setSelectedCitation({
                          documentTitle: cite.documentTitle,
                          location: cite.location,
                          excerpt: cite.excerpt,
                          status: cite.status
                        })}
                        className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-mono text-indigo-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{cite.documentTitle} ({cite.location})</span>
                        <ExternalLink size={10} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-muted-foreground animate-pulse">
            <Bot size={16} className="text-indigo-400" />
            <span>Searching authorized document index and verifying excerpts...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-border/60 bg-slate-900/60 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your ingested documents (e.g., 'What is the budget for Project Orion?')..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-border/70 text-slate-100 placeholder:text-muted-foreground focus:outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          <Send size={14} /> Send
        </button>
      </form>

      <EvidenceViewerModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
