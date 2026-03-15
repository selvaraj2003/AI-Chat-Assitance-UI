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

function getErrorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.detail || err?.message || fallback;
}

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

  const { cloudModels, selectedModel, setSelectedModel } = useModels();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load sessions"));
      }
    })();
  }, []);

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
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load chat history"));
      }
    })();
  }, [activeSessionId]);

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
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete session"));
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
      const res = await api.post("/api/ai/generate/cloud", {
        session_id: activeSessionId,
        prompt: text,
        model: selectedModel,
      });
      setMessages((p) => [...p, { role: "ai", text: res.data.response }]);

      setChats((p) =>
        p.map((c) =>
          c.session_id === activeSessionId && c.title === "New chat"
            ? { ...c, title: text.slice(0, 32) + (text.length > 32 ? "…" : "") }
            : c
        )
      );
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to generate response");
      toast.error(msg);
      setMessages((p) => [...p, { role: "ai", text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) send();
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="chat-root">

      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-top">
          <div className="sidebar-logo">Flux<span>Ops</span></div>
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

            {cloudModels.length > 0 && (
              <select
                className="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {cloudModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>
        </header>

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
              <div className="chat-typing-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a5 5 0 0 1 5 5c0 1-.3 2-.8 2.8A5 5 0 0 1 17 14a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 .8-2.7A5 5 0 0 1 7 7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2l.7.8-.7.6A3 3 0 0 0 9 14a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-.8-2.1l-.7-.7.7-.7A3 3 0 0 0 15 7a3 3 0 0 0-3-3z"/>
                </svg>
              </div>
              <div className="chat-typing-bars">
                <span /><span /><span /><span /><span />
                <span /><span /><span /><span />
              </div>
              <span className="chat-typing-label">thinking…</span>
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
