import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const AGRO_CONTACT = {
  name: 'Dr. Samuel Njuguna',
  title: 'Senior Agronomist – KALRO Certified',
  department: 'Crop Science & Soil Diagnostics Division',
  phone: '+254 722 080 800',
  email: 'dr.njuguna@greenacres.ke',
  whatsapp: '+254 722 080 800',
  avatar: 'SN',
  availability: 'Mon – Fri: 8:00 AM – 5:00 PM (EAT)',
  bio: 'Dr. Njuguna holds a PhD in Crop Science from Egerton University and has over 18 years of hands-on advisory experience across smallholder and commercial farming sectors in the Rift Valley, Western Kenya, and Central regions.'
};

const AUTO_REPLIES = [
  "Thank you for your message! I'll review your query and respond within a few hours.",
  "Great question! Could you share more details about the specific symptoms or conditions you're observing?",
  "That's a common concern in this region. I'll prepare a detailed advisory for you.",
  "I've noted your query. Please also check the Pest Alerts section for related advisories.",
  "Your consultation request has been noted. I recommend taking photos of the affected areas for a more precise diagnosis."
];

const AgronomistChatTab = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMode, setChatMode] = useState('AI');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/chat/');
      if (response.data && response.data.length > 0) {
        const formatted = response.data.map(msg => ({
          id: msg.id,
          sender: msg.sender_type === 'FARMER' ? 'farmer' : 'agro',
          text: msg.message_text,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formatted);
      } else {
        // Welcome message
        setMessages([{
          id: 1,
          sender: 'agro',
          text: `Hello ${user?.name || user?.username || 'Farmer'}! I'm Dr. Njuguna. You can choose to talk to my AI Assistant for instant answers, or request a Human Expert review. How can I help you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistically add user message
    const tempId = Date.now();
    setMessages(prev => [...prev, {
      id: tempId,
      sender: 'farmer',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    try {
      await api.post('/api/chat/', {
        message_text: textToSend,
        mode: chatMode
      });
      // Fetch fresh messages to get the AI reply or confirmed DB status
      setTimeout(() => fetchMessages(), 1000);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setTimeout(() => setIsSending(false), 1000);
    }
  };

  const clearChat = async () => {
    // Optional: could add an endpoint to delete history, for now just clear state
    setMessages([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Agronomist Contact Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'var(--font-header)' }}>{AGRO_CONTACT.avatar}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)', margin: 0 }}>{AGRO_CONTACT.name}</h3>
              <span style={{ background: 'var(--status-low)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>● Online</span>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem', marginTop: '2px' }}>{AGRO_CONTACT.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{AGRO_CONTACT.department}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dark)', marginTop: '8px', lineHeight: '1.5' }}>{AGRO_CONTACT.bio}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <a href={`tel:${AGRO_CONTACT.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--primary-color)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            {AGRO_CONTACT.phone}
          </a>
          <a href={`mailto:${AGRO_CONTACT.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            {AGRO_CONTACT.email}
          </a>
          <a href={`https://wa.me/${AGRO_CONTACT.whatsapp.replace(/\s+/g,'').replace('+','')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#25D366', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Chat
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
            🕐 {AGRO_CONTACT.availability}
          </div>
        </div>
      </div>

      {/* Private Chat Box */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{ padding: '14px 20px', background: 'var(--primary-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>SN</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{AGRO_CONTACT.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Private & Encrypted Chat • Only visible to you</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '20px' }}>
            <button 
              onClick={() => setChatMode('AI')} 
              style={{ background: chatMode === 'AI' ? '#fff' : 'transparent', color: chatMode === 'AI' ? 'var(--primary-color)' : '#fff', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              AI Assistant
            </button>
            <button 
              onClick={() => setChatMode('HUMAN')} 
              style={{ background: chatMode === 'HUMAN' ? '#fff' : 'transparent', color: chatMode === 'HUMAN' ? 'var(--primary-color)' : '#fff', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Human Expert
            </button>
          </div>
          <button onClick={clearChat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            Clear Chat
          </button>
        </div>

        {/* Messages Area */}
        <div style={{ padding: '16px', minHeight: '300px', maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-card)' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{ display: 'flex', flexDirection: msg.sender === 'farmer' ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}
            >
              {msg.sender === 'agro' && (
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>SN</div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: msg.sender === 'farmer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'farmer' ? 'var(--primary-color)' : 'var(--bg-input)',
                color: msg.sender === 'farmer' ? '#fff' : 'var(--text-dark)',
                fontSize: '0.88rem',
                lineHeight: '1.5',
                border: msg.sender === 'agro' ? '1px solid var(--border-color)' : 'none'
              }}>
                {msg.text}
                <div style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: '4px', textAlign: msg.sender === 'farmer' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {isSending && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>SN</div>
              <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Area */}
        <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', background: 'var(--bg-card)' }}>
          <input
            type="text"
            className="form-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question to Dr. Njuguna..."
            style={{ margin: 0, flex: 1, borderRadius: '20px', padding: '10px 16px' }}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            style={{ padding: '10px 20px', borderRadius: '20px', background: inputText.trim() ? 'var(--primary-color)' : 'var(--border-color)', color: '#fff', border: 'none', fontWeight: 700, cursor: inputText.trim() ? 'pointer' : 'default', fontSize: '0.85rem', transition: 'var(--transition-smooth)' }}
          >
            Send
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default AgronomistChatTab;
