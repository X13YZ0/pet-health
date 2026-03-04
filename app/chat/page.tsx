'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';

/**
 * Citation reference in message
 *
 * @interface Citation
 * @property {string} title - Source title
 * @property {string} source - Source name/domain
 * @property {string} url - Source URL
 */
interface Citation {
  title: string;
  source: string;
  url: string;
}

/**
 * Emergency contact information
 *
 * @interface EmergencyContact
 * @property {string} name - Contact name
 * @property {string} number - Phone number
 */
interface EmergencyContact {
  name: string;
  number: string;
}

/**
 * Chat message type definition
 *
 * @interface Message
 * @property {'user' | 'ai'} role - Message sender
 * @property {string} content - Message content
 * @property {Citation[]} [citations] - Optional citations for AI responses
 * @property {boolean} [isEmergency] - Flag for emergency responses
 * @property {EmergencyContact[]} [contacts] - Optional emergency contacts
 */
interface Message {
  role: 'user' | 'ai';
  content: string;
  citations?: Citation[];
  isEmergency?: boolean;
  contacts?: EmergencyContact[];
}

/**
 * API response type from /api/chat
 *
 * @interface ChatResponse
 * @property {string} message - Response message
 * @property {'answer' | 'emergency'} type - Response type
 * @property {Citation[]} [citations] - Optional citations
 * @property {EmergencyContact[]} [contacts] - Optional emergency contacts
 */
interface ChatResponse {
  message: string;
  type: 'answer' | 'emergency';
  citations?: Citation[];
  contacts?: EmergencyContact[];
}

/**
 * Quick question suggestions
 */
const QUICK_QUESTIONS = [
  'สุนัขกินองุ่นได้ไหม?',
  'แมวควรฉีดวัคซีนอะไรบ้าง?',
  'ลูกแมวอายุ 2 เดือนกินอะไรได้บ้าง?',
  'วิธีป้องกันเห็บหมัด',
];

/**
 * Initial welcome message
 */
const WELCOME_MESSAGE: Message = {
  role: 'ai',
  content: `สวัสดีครับ 👋 ผมคือ Pet AI Assistant

ถามเรื่องสุขภาพและการดูแลสัตว์��ลี้ยงได้เลย ตอบพร้อมอ้างอิงแหล่งข้อมูลที่เชื่อถือได้ครับ

💡 เคล็ดลับ:
• ถามเรื่องโรค อาการ การดูแล วัคซีน อาหาร
• เพื่อความแม่นยำสูงสุด อธิบายอาการให้ละเอียด
• ถ้าฉุกเฉิน ผมจะแนะนำให้ไปหาสัตวแพทย์ทันที`,
};

/**
 * Style constants for chat page
 */
const CHAT_STYLES = {
  pageContainer: {
    background: '#f9fafb',
    minHeight: 'calc(100vh - 52px)',
height: 'calc(100vh - 52px)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,

  chatContainer: {
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 24px',
  } as CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 0 16px',
  } as CSSProperties,

  headerAvatar: {
    width: '36px',
    height: '36px',
    background: '#0d9488',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  } as CSSProperties,

  headerTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.02em',
  } as CSSProperties,

  headerStatus: {
    fontSize: '11px',
    color: '#10b981',
    margin: 0,
    fontWeight: '500',
  } as CSSProperties,

  quickQuestionsContainer: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  } as CSSProperties,

  quickButton: {
    padding: '5px 12px',
    borderRadius: '999px',
    borderWidth: '1px',
borderStyle: 'solid',
borderColor: '#e5e7eb',

    background: 'white',
    color: '#6b7280',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  quickButtonHover: {
    borderColor: '#0d9488',
    color: '#0d9488',
  } as CSSProperties,

  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBottom: '16px',
  } as CSSProperties,

  messageRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  } as CSSProperties,

  messageRowUser: {
    justifyContent: 'flex-end',
  } as CSSProperties,

  aiAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '7px',
    background: '#0d9488',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '2px',
  } as CSSProperties,

  messageContent: {
    maxWidth: '76%',
  } as CSSProperties,

  userMessage: {
    background: '#0d9488',
    color: 'white',
    padding: '10px 14px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: '14px',
    lineHeight: '1.6',
  } as CSSProperties,

  aiMessage: {
    background: 'white',
    border: '1px solid #e5e7eb',
    padding: '12px 14px',
    borderRadius: '4px 16px 16px 16px',
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#374151',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  } as CSSProperties,

  messageText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
  } as CSSProperties,

  citationSection: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #f3f4f6',
  } as CSSProperties,

  citationLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: '0 0 6px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  } as CSSProperties,

  citationLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#0d9488',
    textDecoration: 'none',
    marginBottom: '3px',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  citationIndex: {
    color: '#d1d5db',
  } as CSSProperties,

  emergencyMessage: {
    background: '#fef2f2',
    border: '1.5px solid #fca5a5',
    borderRadius: '14px',
    padding: '14px',
  } as CSSProperties,

  emergencyTitle: {
    fontWeight: '700',
    color: '#991b1b',
    margin: '0 0 6px',
    fontSize: '14px',
  } as CSSProperties,

  emergencyContent: {
    fontSize: '13px',
    color: '#7f1d1d',
    margin: '0 0 12px',
    lineHeight: '1.6',
  } as CSSProperties,

  emergencyContactLink: {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#ef4444',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '6px',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  emergencyInfoLink: {
    display: 'block',
    textAlign: 'center',
    background: '#991b1b',
    color: 'white',
    padding: '8px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  loadingContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  } as CSSProperties,

  loadingDots: {
    background: 'white',
    border: '1px solid #e5e7eb',
    padding: '14px',
    borderRadius: '4px 16px 16px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  } as CSSProperties,

  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#9ca3af',
  } as CSSProperties,

  inputContainer: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '10px 10px 10px 16px',
    marginBottom: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  } as CSSProperties,

  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#111827',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.6',
    background: 'transparent',
    maxHeight: '120px',
  } as CSSProperties,

  sendButton: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  } as CSSProperties,

  sendButtonActive: {
    background: '#0d9488',
    color: 'white',
  } as CSSProperties,

  sendButtonDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  } as CSSProperties,

  disclaimer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#9ca3af',
    paddingBottom: '16px',
  } as CSSProperties,
};

/**
 * Chat Page Component
 *
 * AI-powered chat interface for pet health questions.
 * Features:
 * - Real-time messaging
 * - Emergency detection
 * - Citation/source references
 * - Quick question suggestions
 * - Auto-scroll to latest message
 *
 * @component
 * @returns {React.ReactNode} Chat interface UI
 *
 * @example
 * ```tsx
 * <ChatPage />
 * ```
 */
export default function ChatPage(): React.ReactNode {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredQuickQuestion, setHoveredQuickQuestion] = useState<number | null>(null);
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /**
   * Send message to API and handle response
   *
   * @param {string} [text] - Optional preset text (e.g., quick question)
   */
  const send = async (text?: string): Promise<void> => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: data.message,
          citations: data.citations,
          isEmergency: data.type === 'emergency',
          contacts: data.contacts,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `❌ ข้อผิดพลาด: ${errorMessage}\n\nกรุณาลองใหม่ในอีกสักครู่`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Enter key press to send message
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={CHAT_STYLES.pageContainer}>
      <div style={CHAT_STYLES.chatContainer}>
        {/* Header */}
        <div style={CHAT_STYLES.header}>
          <div style={CHAT_STYLES.headerAvatar}>🐾</div>
          <div>
            <p style={CHAT_STYLES.headerTitle}>Pet AI Assistant</p>
            <p style={CHAT_STYLES.headerStatus}>● ออนไลน์ — ตอบพร้อม citation จากแหล่งน่าเชื่อถือ</p>
          </div>
        </div>

        {/* Quick Questions */}
        <div style={CHAT_STYLES.quickQuestionsContainer}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              onMouseEnter={() => setHoveredQuickQuestion(i)}
              onMouseLeave={() => setHoveredQuickQuestion(null)}
              style={{
                ...CHAT_STYLES.quickButton,
                ...(hoveredQuickQuestion === i && CHAT_STYLES.quickButtonHover),
              }}
              aria-label={`Ask: ${q}`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div style={CHAT_STYLES.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...CHAT_STYLES.messageRow,
                ...(message.role === 'user' && CHAT_STYLES.messageRowUser),
              }}
            >
              {message.role === 'ai' && <div style={CHAT_STYLES.aiAvatar}>AI</div>}

              <div style={CHAT_STYLES.messageContent}>
                {message.isEmergency ? (
                  <div style={CHAT_STYLES.emergencyMessage}>
                    <p style={CHAT_STYLES.emergencyTitle}>🚨 ตรวจพบเหตุฉุกเฉิน</p>
                    <p style={CHAT_STYLES.emergencyContent}>{message.content}</p>

                    {/* Emergency Contacts */}
                    {message.contacts?.map((contact, contactIdx) => (
                      <a
                        key={contactIdx}
                        href={`tel:${contact.number}`}
                        style={CHAT_STYLES.emergencyContactLink}
                        aria-label={`Call ${contact.name} at ${contact.number}`}
                      >
                        <span>{contact.name}</span>
                        <span>{contact.number}</span>
                      </a>
                    ))}

                    {/* Emergency Info Link */}
                    <a
                      href="/emergency"
                      style={CHAT_STYLES.emergencyInfoLink}
                      aria-label="View emergency information"
                    >
                      ดูข้อมูลฉุกเฉิน →
                    </a>
                  </div>
                ) : message.role === 'user' ? (
                  <div style={CHAT_STYLES.userMessage}>{message.content}</div>
                ) : (
                  <div style={CHAT_STYLES.aiMessage}>
                    <p style={CHAT_STYLES.messageText}>{message.content}</p>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div style={CHAT_STYLES.citationSection}>
                        <p style={CHAT_STYLES.citationLabel}>แหล่งอ้างอิง</p>
                        {message.citations.map((citation, citIdx) => (
                          <a
                            key={citIdx}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHoveredCitation(citIdx)}
                            onMouseLeave={() => setHoveredCitation(null)}
                            style={{
                              ...CHAT_STYLES.citationLink,
                              ...(hoveredCitation === citIdx && {
                                opacity: 0.8,
                                transform: 'translateX(2px)',
                              } as CSSProperties),
                            }}
                            aria-label={`Source: ${citation.title} from ${citation.source}`}
                          >
                            <span style={CHAT_STYLES.citationIndex}>[{citIdx + 1}]</span>
                            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                              {citation.title} — {citation.source}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div style={CHAT_STYLES.loadingContainer}>
              <div style={CHAT_STYLES.aiAvatar}>AI</div>
              <div style={CHAT_STYLES.loadingDots}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      ...CHAT_STYLES.loadingDot,
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: `${i * 0.16}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div style={CHAT_STYLES.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ถามเรื่องสุขภาพสัตว์เลี้ยง... (Enter เพื่อส่ง, Shift+Enter สำหรับขึ้นบรรทัด)"
            rows={1}
            disabled={loading}
            style={CHAT_STYLES.textarea}
            aria-label="Chat message input"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              ...CHAT_STYLES.sendButton,
              ...(loading || !input.trim()
                ? CHAT_STYLES.sendButtonDisabled
                : CHAT_STYLES.sendButtonActive),
            }}
            aria-label="Send message"
            title={loading ? 'Waiting for response...' : 'Send message'}
          >
            ↑
          </button>
        </div>

        {/* Disclaimer */}
        <p style={CHAT_STYLES.disclaimer}>
          ⚠️ ข้อมูลนี้ไม่ใช่การวินิจฉัยโรค หากสัตว์เลี้ยงมีอาการผิดปกติควรปรึกษาสัตวแพทย์เสมอ
        </p>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}