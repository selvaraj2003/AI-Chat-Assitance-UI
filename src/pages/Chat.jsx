import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiLogOut, FiMic, FiSend, FiMenu, FiX, FiMessageSquare } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useModels } from "../hooks/useModels";
import "../styles/chat.css";

/* ── Markdown code renderer ──────────────────────────────── */
function CodeBlock({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={match[1]}
      PreTag="div"
      customStyle={{ borderRadius: "8px", fontSize: "0.85rem" }}
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>{children}</code>
  );
}

const MD_COMPONENTS = { code: CodeBlock };

/* ── Component ───────────────────────────────────────────── */
export default function Chat() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const bottomRef = useRef(null);

  const [chats,           setChats]           = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(sessionId || null);
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);

  const { models, localModels, cloudModels, provider, setProvider, selectedModel, setSelectedModel } =
    useModels();

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Load all sessions */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/ai/history");
        const map = {};
        res.data.forEach((c) => {
          if (!map[c.session_id])
            map[c.session_id] = {
              session_id: c.session_id,
              title: c.prompt.slice(0, 32) + (c.prompt.length > 32 ? "…" : ""),
            };
        });
        setChats(Object.values(map));
      } catch {
        toast.error("Failed to load sessions");
      }
    })();
  }, []);

  /* Load history when session changes */
  useEffect(() => {
    if (!activeSessionId) return;
    (async () => {
      try {
        const res = await api.get("/api/ai/history", {
          params: { session_id: activeSessionId, limit: 50 },
        });
        const msgs = [];
        res.data.reverse().forEach((c) => {
          msgs.push({ role: "user", text: c.prompt });
          msgs.push({ role: "ai",   text: c.response });
        });
        setMessages(msgs);
      } catch {
        toast.error("Failed to load chat history");
      }
    })();
  }, [activeSessionId]);

  /* Sync model list when provider changes */
  useEffect(() => {
    const list = provider === "local" ? localModels : cloudModels;
    if (list.length > 0 && !list.includes(selectedModel))
      setSelectedModel(list[0]);
  }, [provider]);

  /* Actions */
  const createChat = () => {
    const id = crypto.randomUUID();
    setChats((p) => [{ session_id: id, title: "New chat" }, ...p]);
    setMessages([]);
    setActiveSessionId(id);
    navigate(`/chat/${id}`);
    setSidebarOpen(false);
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/ai/history/${id}`);
      setChats((p) => p.filter((c) => c.session_id !== id));
      if (id === activeSessionId) {
        setActiveSessionId(null);
        setMessages([]);
        navigate("/chat");
      }
    } catch {
      toast.error("Failed to delete session");
    }
  };

  const selectSession = (id) => {
    setActiveSessionId(id);
    navigate(`/chat/${id}`);
    setSidebarOpen(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeSessionId || loading) return;
    setInput("");
    setLoading(true);
    setMessages((p) => [...p, { role: "user", text }]);
    try {
      const res = await api.post(`/api/ai/generate/${provider}`, {
        session_id: activeSessionId,
        prompt: text,
        model: selectedModel,
      });
      setMessages((p) => [...p, { role: "ai", text: res.data.response }]);

      // Update title of the first message
      setChats((p) =>
        p.map((c) =>
          c.session_id === activeSessionId && c.title === "New chat"
            ? { ...c, title: text.slice(0, 32) + (text.length > 32 ? "…" : "") }
            : c
        )
      );
    } catch {
      toast.error("Failed to generate response");
      setMessages((p) => [...p, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        send();
      }
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="chat-root">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-top">
          <div className="sidebar-logo">NEURAL<span>X</span></div>
          <button className="new-chat-btn" onClick={createChat}>
            <FiPlus /> New chat
          </button>
        </div>

        <div className="chat-list">
          {chats.length > 0 && (
            <div className="chat-list-label">Recent</div>
          )}
          {chats.map((c) => (
            <div
              key={c.session_id}
              className={`chat-item ${activeSessionId === c.session_id ? "active" : ""}`}
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
        </div>

        <div className="sidebar-foot">
          <button className="logout-btn" onClick={logout}>
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="chat-main">

        {/* Header */}
        <header className="chat-header">
          <div className="chat-model-row">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {models.length > 0 && (
              <select
                className="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}

            <div className="provider-toggle">
              {localModels.length > 0 && (
                <button
                  className={`provider-btn ${provider === "local" ? "active" : ""}`}
                  onClick={() => setProvider("local")}
                >
                  Local
                </button>
              )}
              {cloudModels.length > 0 && (
                <button
                  className={`provider-btn ${provider === "cloud" ? "active" : ""}`}
                  onClick={() => setProvider("cloud")}
                >
                  Cloud
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && !loading && (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <FiMessageSquare size={48} />
              </div>
              <h3>Start a conversation</h3>
              <p>Send a message to begin chatting with the AI</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={MD_COMPONENTS}
              >
                {m.text}
              </ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-wrap">
          <div className="chat-input-inner">
            <button className="ci-btn" title="Attach">
              <FiPlus />
            </button>
            <input
              placeholder={activeSessionId ? "Message AI…" : "Select or create a chat first"}
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
