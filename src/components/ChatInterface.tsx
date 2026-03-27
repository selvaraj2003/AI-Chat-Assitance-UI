'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiPlus, FiTrash2, FiLogOut, FiMic, FiSend, 
  FiMenu, FiX, FiMessageSquare, FiUser, FiCpu 
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { toast } from 'react-toastify';
import api from '@/lib/api/axios';
import { useModels } from '@/hooks/useModels';
import { useAuthStore } from '@/hooks/useAuthStore';
import AIBackground from '@/components/AIBackground';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';
import '@/styles/chat.css';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ChatSession {
  session_id: string;
  title: string;
}

const CodeBlock: React.FC<any> = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={vscDarkPlus as any}
      language={match[1]}
      PreTag="div"
      customStyle={{ borderRadius: '8px', fontSize: '0.85rem' }}
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const MD_COMPONENTS = { code: CodeBlock };

const TypewriterMarkdown = ({ text, speed = 8, bottomRef }: { text: string; speed?: number; bottomRef?: React.RefObject<HTMLDivElement | null> }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText(''); 
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (bottomRef?.current) {
        bottomRef.current.scrollIntoView({ behavior: 'auto' });
      }
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, bottomRef]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={MD_COMPONENTS as any}
    >
      {displayedText}
    </ReactMarkdown>
  );
};

const getErrorMessage = (err: any, fallback = 'Something went wrong') => {
  return err?.response?.data?.detail || err?.message || fallback;
};

export default function ChatInterface() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const bottomRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);

  const { cloudModels, selectedModel, setSelectedModel, isLoading: modelsLoading } = useModels();
  const logout = useAuthStore((state: any) => state.logout);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    (async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get('/api/ai/history');
        const map: Record<string, ChatSession> = {};
        res.data.forEach((c: any) => {
          if (!map[c.session_id]) {
            map[c.session_id] = {
              session_id: c.session_id,
              title: c.prompt.slice(0, 32) + (c.prompt.length > 32 ? '...' : ''),
            };
          }
        });
        setChats(Object.values(map));
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load sessions'));
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    setActiveSessionId(sessionId);
    setIsTransitioning(true);
    setStreamingMessageIndex(null); // No streaming for history load
    (async () => {
      try {
        const res = await api.get('/api/ai/history', {
          params: { session_id: sessionId, limit: 50 },
        });
        const msgs: Message[] = [];
        res.data.reverse().forEach((c: any) => {
          msgs.push({ role: 'user', text: c.prompt });
          msgs.push({ role: 'ai', text: c.response });
        });
        setMessages(msgs);
        setTimeout(() => setIsTransitioning(false), 300);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load chat history'));
        setIsTransitioning(false);
      }
    })();
  }, [sessionId]);

  const createChat = () => {
    const id = crypto.randomUUID();
    setChats((p) => [{ session_id: id, title: 'New chat' }, ...p]);
    setMessages([]);
    setActiveSessionId(id);
    router.push(`/${id}`);
    setSidebarOpen(false);
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/ai/history/${id}`);
      setChats((p) => p.filter((c) => c.session_id !== id));
      if (id === activeSessionId) {
        setActiveSessionId(null);
        setMessages([]);
        router.push('/'); 
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete session'));
    }
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    router.push(`/${id}`);
    setSidebarOpen(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeSessionId || loading) return;
    setInput('');
    setLoading(true);
    setMessages((p) => [...p, { role: 'user', text }]);
    try {
      const res = await api.post('/api/ai/generate/cloud', {
        session_id: activeSessionId,
        prompt: text,
        model: selectedModel,
      });
      const aiMsgIndex = messages.length + 1; // User msg is at messages.length
      setMessages((p) => [...p, { role: 'ai', text: res.data.response }]);
      setStreamingMessageIndex(aiMsgIndex);

      setChats((p) =>
        p.map((c) =>
          c.session_id === activeSessionId && c.title === 'New chat'
            ? { ...c, title: text.slice(0, 32) + (text.length > 32 ? '...' : '') }
            : c
        )
      );
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to generate response');
      toast.error(msg);
      setMessages((p) => [...p, { role: 'ai', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) send();
    }
  };


  return (
    <div className="chat-root">
      <AIBackground theme={theme} intensity="medium" />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-top">
          <div className="sidebar-logo">Tech<span>Assistance</span></div>
          <button className="new-chat-btn" onClick={createChat}>
            <FiPlus /> New chat
          </button>
        </div>

        <div className="chat-list">
          {historyLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="chat-item skeleton">
                <div className="skeleton-title" />
              </div>
            ))
          ) : (
            <>
              {chats.length > 0 && (
                <div className="chat-list-label">Recent</div>
              )}
              {chats.map((c) => (
                <div
                  key={c.session_id}
                  className={`chat-item ${activeSessionId === c.session_id ? 'active' : ''}`}
                  onClick={() => selectSession(c.session_id)}
                >
                  <span className="chat-item-title">{c.title}</span>
                  <button
                    className="chat-item-del"
                    onClick={(e) => deleteChat(c.session_id, e)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="sidebar-foot">
          <button className="logout-btn" onClick={onLogout}>
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="chat-main">
        <header className="chat-header">
          <div className="chat-model-row">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
          <div className="header-actions">
            {modelsLoading ? (
              <div className="skeleton-model" />
            ) : (
              cloudModels.length > 0 && (
                <select
                  className="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {cloudModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )
            )}
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </header>

        <div className={`chat-messages ${isTransitioning ? 'transitioning' : ''}`}>
          {messages.length === 0 && !loading && (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <FiMessageSquare size={48} />
              </div>
              <h3>How can I assist you today?</h3>
              <p>Get started by asking a technical question, pasting an error log, or explaining a system architecture problem you're facing.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`chat-msg-container ${m.role}`}>
              <div className="chat-avatar">
                {m.role === 'user' ? <FiUser /> : <FiCpu />}
              </div>
              <div className={`chat-msg ${m.role}`}>
                {m.role === 'ai' && i === streamingMessageIndex ? (
                  <TypewriterMarkdown text={m.text} bottomRef={bottomRef} />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={MD_COMPONENTS as any}
                  >
                    {m.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-typing">
              <div className="chat-typing-icon">
              </div>
              <span className="chat-typing-label">thinking...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-inner">
            <button className="ci-btn" title="Attach">
              <FiPlus />
            </button>
            <textarea
              rows={1}
              placeholder={activeSessionId ? 'How can I help you?' : 'Select or create a chat first'}
              value={input}
              disabled={!activeSessionId}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="ci-btn" title="Voice input">
              <FiMic />
            </button>
            <button
              className="ci-send"
              onClick={send}
              disabled={!input.trim() || !activeSessionId || loading}
              title="Send"
            >
              <FiSend />
            </button>
          </div>
          <p className="chat-input-hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

