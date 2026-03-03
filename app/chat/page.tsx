'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  citations?: { title: string; source: string; url: string }[];
  isEmergency?: boolean;
  contacts?: { name: string; number: string }[];
}

const QUICK = [
  'สุนัขกินองุ่นได้ไหม?',
  'แมวควรฉีดวัคซีนอะไรบ้าง?',
  'ลูกแมวอายุ 2 เดือนกินอะไรได้บ้าง?',
  'วิธีป้องกันเห็บหมัด',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    content: 'สวัสดีครับ 👋 ผมคือ Pet AI Assistant\nถามเรื่องสุขภาพและการดูแลสัตว์เลี้ยงได้เลย ตอบพร้อมอ้างอิงแหล่งข้อมูลที่เชื่อถือได้ครับ',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(p => [...p, {
        role: 'ai',
        content: data.message,
        citations: data.citations,
        isEmergency: data.type === 'emergency',
        contacts: data.contacts,
      }]);
    } catch {
      setMessages(p => [...p, { role: 'ai', content: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: '#f9fafb', height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{maxWidth: '720px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px'}}>

        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0 16px'}}>
          <div style={{width: '36px', height: '36px', background: '#0d9488', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'}}>🐾</div>
          <div>
            <p style={{fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0, letterSpacing: '-0.02em'}}>Pet AI Assistant</p>
            <p style={{fontSize: '11px', color: '#10b981', margin: 0, fontWeight: '500'}}>● ออนไลน์ — ตอบพร้อม citation จากแหล่งน่าเชื่อถือ</p>
          </div>
        </div>

        {/* Quick Questions */}
        <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px'}}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => send(q)}
              style={{padding: '5px 12px', borderRadius: '999px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'}}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d9488'; (e.currentTarget as HTMLButtonElement).style.color = '#0d9488'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; }}
            >{q}</button>
          ))}
        </div>

        {/* Messages */}
        <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px'}}>
          {messages.map((m, i) => (
            <div key={i} style={{display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-start'}}>
              {m.role === 'ai' && (
                <div style={{width: '26px', height: '26px', borderRadius: '7px', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0, marginTop: '2px'}}>AI</div>
              )}
              <div style={{maxWidth: '76%'}}>
                {m.isEmergency ? (
                  <div style={{background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '14px', padding: '14px'}}>
                    <p style={{fontWeight: '700', color: '#991b1b', margin: '0 0 6px', fontSize: '14px'}}>🚨 ตรวจพบเหตุฉุกเฉิน</p>
                    <p style={{fontSize: '13px', color: '#7f1d1d', margin: '0 0 12px', lineHeight: '1.6'}}>{m.content}</p>
                    {m.contacts?.map((c, j) => (
                      <a key={j} href={`tel:${c.number}`} style={{display: 'flex', justifyContent: 'space-between', background: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', marginBottom: '6px'}}>
                        <span>{c.name}</span><span>{c.number}</span>
                      </a>
                    ))}
                    <a href="/emergency" style={{display: 'block', textAlign: 'center', background: '#991b1b', color: 'white', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '500'}}>ดูข้อมูลฉุกเฉิน →</a>
                  </div>
                ) : m.role === 'user' ? (
                  <div style={{background: '#0d9488', color: 'white', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: '14px', lineHeight: '1.6'}}>{m.content}</div>
                ) : (
                  <div style={{background: 'white', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: '4px 16px 16px 16px', fontSize: '14px', lineHeight: '1.7', color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
                    <p style={{margin: 0, whiteSpace: 'pre-wrap'}}>{m.content}</p>
                    {m.citations && m.citations.length > 0 && (
                      <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6'}}>
                        <p style={{fontSize: '11px', color: '#9ca3af', margin: '0 0 6px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase'}}>แหล่งอ้างอิง</p>
                        {m.citations.map((c, j) => (
                          <a key={j} href={c.url} target="_blank" rel="noopener noreferrer" style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#0d9488', textDecoration: 'none', marginBottom: '3px'}}>
                            <span style={{color: '#d1d5db'}}>[{j+1}]</span>
                            <span style={{textDecoration: 'underline', textUnderlineOffset: '2px'}}>{c.title} — {c.source}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
              <div style={{width: '26px', height: '26px', borderRadius: '7px', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0}}>AI</div>
              <div style={{background: 'white', border: '1px solid #e5e7eb', padding: '14px', borderRadius: '4px 16px 16px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
                <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: `${i * 0.16}s`}} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '10px 10px 10px 16px', marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: '8px', alignItems: 'flex-end'}}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="ถามเรื่องสุขภาพสัตว์เลี้ยง... (Enter เพื่อส่ง)"
            rows={1}
            style={{flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#111827', resize: 'none', fontFamily: 'inherit', lineHeight: '1.6', background: 'transparent', maxHeight: '120px'}}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{width: '34px', height: '34px', borderRadius: '8px', background: loading || !input.trim() ? '#e5e7eb' : '#0d9488', color: loading || !input.trim() ? '#9ca3af' : 'white', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, transition: 'all 0.15s'}}>
            ↑
          </button>
        </div>

        <p style={{textAlign: 'center', fontSize: '11px', color: '#9ca3af', paddingBottom: '16px'}}>
          ⚠️ ข้อมูลนี้ไม่ใช่การวินิจฉัยโรค หากสัตว์เลี้ยงมีอาการผิดปกติควรปรึกษาสัตวแพทย์
        </p>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );
}