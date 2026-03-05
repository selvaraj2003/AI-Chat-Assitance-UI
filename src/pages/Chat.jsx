import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiLogOut, FiMic, FiSend } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import api from "../api/axios";
import "../styles/chat.css";
import "katex/dist/katex.min.css"; // Required for LaTeX styling
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Chat() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const bottomRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(sessionId || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("local");
  const [localModels, setLocalModels] = useState([]);
  const [cloudModels, setCloudModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  const models = provider === "local" ? localModels : cloudModels;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadModels = async (prov) => {
    try {
      const res = await api.get(`/api/ai/models/${prov}`);
      const fetchedModels = res.data.models || [];
      if (prov === "local") setLocalModels(fetchedModels);
      else setCloudModels(fetchedModels);
      if (prov === provider && fetchedModels.length > 0) {
        setSelectedModel(res.data.default || fetchedModels[0]);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to load ${prov} models`);
    }
  };

  useEffect(() => {
    loadModels("local");
    loadModels("cloud");
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await api.get("/api/ai/history");
        const map = {};
        res.data.forEach((c) => {
          if (!map[c.session_id]) {
            map[c.session_id] = {
              session_id: c.session_id,
              title: c.prompt.slice(0, 30) + "...",
            };
          }
        });
        setChats(Object.values(map));
      } catch (e) {
        console.error(e);
        toast.error("Failed to load chat sessions");
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    const loadHistory = async () => {
      try {
        const res = await api.get("/api/ai/history", {
          params: { session_id: activeSessionId, limit: 50 },
        });
        const ordered = res.data.reverse();
        const msgs = [];
        ordered.forEach((c) => {
          msgs.push({ role: "user", text: c.prompt });
          msgs.push({ role: "ai", text: c.response });
        });
        setMessages(msgs);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load chat history");
      }
    };
    loadHistory();
  }, [activeSessionId]);

  const createChat = () => {
    const newSessionId = crypto.randomUUID();
    setChats((prev) => [{ session_id: newSessionId, title: "New Chat" }, ...prev]);
    setMessages([]);
    setActiveSessionId(newSessionId);
    navigate(`/chat/${newSessionId}`);
  };

  const deleteChat = async (id) => {
    try {
      await api.delete(`/api/ai/history/${id}`);
      setChats((prev) => prev.filter((c) => c.session_id !== id));
      if (id === activeSessionId) {
        setActiveSessionId(null);
        setMessages([]);
        navigate("/chat");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete chat session");
    }
  };

  const send = async () => {
    if (!input.trim() || !activeSessionId) return;
    const userText = input;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    try {
      const res = await api.post(`/api/ai/generate/${provider}`, {
        session_id: activeSessionId,
        prompt: userText,
        model: selectedModel,
      });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.response }]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate AI response");
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong" }]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <button className="new-chat" onClick={createChat}>
          <FiPlus /> New Chat
        </button>
        <div className="chat-list">
          {chats.map((c) => (
            <div
              key={c.session_id}
              className={`chat-item ${activeSessionId === c.session_id ? "active" : ""}`}
              onClick={() => {
                setActiveSessionId(c.session_id);
                navigate(`/chat/${c.session_id}`);
              }}
            >
              <span>{c.title}</span>
              <button
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(c.session_id);
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div className="model-box">
            {models.length > 0 && (
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
            <div className="provider">
              {localModels.length > 0 && (
                <button className={provider === "local" ? "active" : ""} onClick={() => setProvider("local")}>
                  Local
                </button>
              )}
              {cloudModels.length > 0 && (
                <button className={provider === "cloud" ? "active" : ""} onClick={() => setProvider("cloud")}>
                  Cloud
                </button>
              )}
            </div>
          </div>
          <button className="logout" onClick={logout}>
            <FiLogOut /> Logout
          </button>
        </header>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {m.text}
              </ReactMarkdown>
            </div>
          ))}
          {loading && <div className="msg ai">Typing…</div>}
          <div ref={bottomRef} />
        </div>

        <div className="input-bar">
          <button className="icon">
            <FiPlus />
          </button>
          <input
            placeholder="Message AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="icon">
            <FiMic />
          </button>
          <button className="send" onClick={send}>
            <FiSend />
          </button>
        </div>
      </main>
    </div>
  );
}