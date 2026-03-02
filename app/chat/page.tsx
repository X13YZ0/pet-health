'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'ai';
  content: string;
  citations?: { title: string; source: string; url: string }[];
  isEmergency?: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'สวัสดีครับ! ฉันคือ Pet AI Assistant 🐾 ถามเรื่องสุขภาพและการดูแลสัตว์เลี้ยงได้เลยครับ',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    '🚫 สุนัขกินอะไรไม่ได้บ้าง?',
    '💉 ตารางวัคซีนสัตว์เลี้ยง',
    '😿 แมวเครียดมีอาการอย่างไร?',
    '🦴 อาหารสัตว์เลี้ยงสูงวัย',
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.message,
        citations: data.citations,
        isEmergency: data.type === 'emergency',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      }]);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">AI</div>
          <div>
            <h1 className="font-bold text-gray-900">Pet AI Assistant</h1>
            <p className="text-xs text-green-500 font-medium">● ออนไลน์ — ตอบพร้อม citation จากแหล่งน่าเชื่อถือ</p>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="flex gap-2 flex-wrap mb-4">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q.replace(/^.{2}/, '').trim())}
              className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-full hover:border-teal-400 hover:text-teal-600 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'message-user px-4 py-3' : ''}`}>
                  {msg.isEmergency ? (
                    // Emergency Response
                    <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🚨</span>
                        <span className="font-bold text-red-700">ตรวจพบเหตุฉุกเฉิน!</span>
                      </div>
                      <p className="text-red-800 text-sm mb-3">{msg.content}</p>
                      {msg.citations && (
                        <div className="space-y-2">
                          {msg.citations.map((c, j) => (
                            <a key={j} href={`tel:${c.source}`}
                              className="flex items-center justify-between bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                            >
                              <span>{c.title}</span>
                              <span className="font-mono font-bold">{c.source}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      <a href="/emergency"
                        className="block text-center bg-red-700 text-white px-3 py-2 rounded-lg text-sm mt-2 hover:bg-red-800 transition"
                      >
                        ดูข้อมูลฉุกเฉินเพิ่มเติม →
                      </a>
                    </div>
                  ) : msg.role === 'ai' ? (
                    // AI Response
                    <div className="message-ai px-4 py-3">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-400 mb-2">📚 แหล่งอ้างอิง:</p>
                          <div className="space-y-1">
                            {msg.citations.map((c, j) => (
                              <a key={j} href={c.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <span>[{j + 1}]</span>
                                <span>{c.title} — {c.source}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // User Message
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">AI</div>
                <div className="message-ai px-4 py-3">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="ถามเรื่องสุขภาพสัตว์เลี้ยง... (กด Enter เพื่อส่ง)"
            className="flex-1 text-sm focus:outline-none bg-transparent chat-input border border-gray-200 rounded-lg px-3 py-2"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
          >
            ส่ง
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-3">
          ⚠️ ข้อมูลนี้ไม่ใช่การวินิจฉัยโรค หากสัตว์เลี้ยงมีอาการผิดปกติควรปรึกษาสัตวแพทย์
        </p>

      </main>
    </div>
  );
}