import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

const API_BASE = "/api";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]); // Requirement 2C
  const scrollRef = useRef(null);

  // 1. Initial Load: Get or Create Session
  useEffect(() => {
    let savedId = localStorage.getItem("chat_session_id");
    if (!savedId) {
      savedId = uuidv4();
      localStorage.setItem("chat_session_id", savedId);
    }
    setSessionId(savedId);
    loadSessionData(savedId);
    fetchAllSessions();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Fetch all previous sessions for the sidebar
  const fetchAllSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions`);
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions", err);
    }
  };

  // 3. Load messages for a specific session
  const loadSessionData = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/conversations/${id}`);
      setMessages(res.data);
      setSessionId(id);
      localStorage.setItem("chat_session_id", id);
    } catch (err) {
      console.error("Error loading chat", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, { sessionId, message: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      fetchAllSessions(); // Refresh sidebar to show updated time
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to server." }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem("chat_session_id", newId);
    setSessionId(newId);
    setMessages([]);
    fetchAllSessions();
  };

  return (
    <div className="app-wrapper">
      {/* SIDEBAR: Requirement 2C */}
      <div className="sidebar">
        <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
        <div className="session-list">
          <h3>History</h3>
          {sessions.map(s => (
            <div 
              key={s.id} 
              className={`session-item ${s.id === sessionId ? 'active' : ''}`}
              onClick={() => loadSessionData(s.id)}
            >
              Session: {s.id.substring(0, 8)}...
              <small>{new Date(s.updated_at).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="chat-container">
        <header>
          <h2>Support Bot</h2>
          <small>ID: {sessionId.substring(0, 8)}</small>
        </header>

        <div className="message-list">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {loading && <div className="message assistant"><div className="bubble italic">Searching docs...</div></div>}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={sendMessage} className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;