import { useState, useRef, useEffect } from "react";
import { chat } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import Loader from "@/components/Loader";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data } = await chat.list();
      setMessages(data.results || data || []);
      setError(null);
    } catch {
      setError("Failed to load messages");
      addToast("Failed to load chat messages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await chat.send(input, "AI");
      setInput("");
      await fetchMessages();
    } catch {
      addToast("Failed to send message. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader text="Loading chat..." />;

  return (
    <div className="page chat-page">
      <div className="page-header">
        <h1>Agronomist Chat</h1>
        <p className="page-subtitle">Get AI-powered agricultural advice</p>
      </div>

      {error && (
        <div className="error-state" role="alert">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchMessages}>Retry</button>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages" role="log" aria-label="Chat messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>No messages yet. Ask a question about farming!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-msg chat-msg-${msg.sender_type?.toLowerCase()}`}
            >
              <div className="chat-msg-avatar" aria-hidden="true">
                {msg.sender_type === "AI"
                  ? "🤖"
                  : msg.sender_type === "AGRO"
                    ? "👨‍🌾"
                    : "🧑‍🌾"}
              </div>
              <div className="chat-msg-body">
                <span className="chat-msg-sender">
                  {msg.sender_type === "AI"
                    ? "AI Assistant"
                    : msg.sender_type === "AGRO"
                      ? "Agronomist"
                      : "You"}
                </span>
                <p>{msg.message_text}</p>
                {msg.timestamp && (
                  <span className="chat-msg-time">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crops, pests, weather..."
            aria-label="Type your message"
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
