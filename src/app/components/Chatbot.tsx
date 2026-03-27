import { useState, useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  streamChatResponse,
  loadChatHistory,
  saveFeedback,
  SUGGESTED_QUESTIONS,
  QUICK_REPLIES,
  ChatMessage
} from '../data/chatbot'
import { supabase } from '../data/supabase'
import {
  MessageCircle, X, Send, Bot, User,
  ThumbsUp, ThumbsDown, RotateCcw,
  Sparkles, ChevronDown, Minimize2
} from 'lucide-react'

// ── CHATBOT COMPONENT ─────────────────────────────────
export function Chatbot() {
  const [isOpen, setIsOpen]           = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages]       = useState<ChatMessage[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [userId, setUserId]           = useState('')
  const [sessionId]                   = useState(() => uuidv4())
  const [unreadCount, setUnreadCount] = useState(0)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [quickReplies, setQuickReplies]   = useState<string[]>([])

  const bottomRef     = useRef<HTMLDivElement>(null)
  const messagesRef   = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)

  // ── INIT ───────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const demoUser = sessionStorage.getItem('demo_user')
      if (demoUser) {
        setUserId('demo-user-123')
        setMessages([{
          id: uuidv4(),
          role: 'assistant',
          content: `Hi there! 👋 I am SocialPulse AI — your personal social media strategist.\n\nSince you are in Demo Mode, your chat won't be saved permanently, but I can still answer queries based on the hardcoded 2026 dataset!`,
          timestamp: new Date()
        }])
        return;
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load chat history
      const history = await loadChatHistory(user.id, sessionId, 20)

      // Set welcome message + history
      const welcome: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: history.length > 0
          ? `Welcome back! I remember our last conversation. How can I help you today?`
          : `Hi there! 👋 I am SocialPulse AI — your personal social media strategist.\n\nI have access to your real account data and the latest 2026 social media research. Ask me anything!`,
        timestamp: new Date()
      }

      setMessages(history.length > 0 ? history : [welcome])
    }
    init()
  }, [sessionId])

  // ── AUTO SCROLL ────────────────────────────────────
  useEffect(() => {
    if (!isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isMinimized])

  // ── SCROLL BUTTON VISIBILITY ───────────────────────
  function handleScroll() {
    const el = messagesRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 200)
  }

  // ── UNREAD COUNTER ─────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      const assistantMsgs = messages.filter(m => m.role === 'assistant')
      if (assistantMsgs.length > 1) setUnreadCount(1)
    } else {
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  // ── FOCUS INPUT WHEN OPENED ────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // ── SEND MESSAGE ───────────────────────────────────
  const handleSend = useCallback(async (question?: string) => {
    const q = (question || input).trim()
    if (!q || loading || !userId) return

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: q,
      timestamp: new Date()
    }

    const loadingId = uuidv4()
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      isStreaming: true
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setLoading(true)
    setQuickReplies([])

    await streamChatResponse(
      q,
      userId,
      sessionId,
      messages,
      // onChunk — update message word by word
      (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId
            ? { ...m, content: m.content + chunk, isLoading: false }
            : m
        ))
      },
      // onDone — finalize message
      (fullText, metadata: any) => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId
            ? {
                ...m,
                content: fullText,
                isLoading: false,
                isStreaming: false,
                metadata
              }
            : m
        ))
        setLoading(false)

        // Show quick replies based on intent
        const intent = metadata?.intentDetected || 'general'
        const replies = QUICK_REPLIES[intent] || QUICK_REPLIES.general
        setQuickReplies(replies)
      },
      // onError
      (error) => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId
            ? {
                ...m,
                content: 'Sorry, something went wrong. Please try again. ' + error.message,
                isLoading: false,
                isStreaming: false
              }
            : m
        ))
        setLoading(false)
      }
    )
  }, [input, loading, userId, sessionId, messages])

  // ── CLEAR CHAT ─────────────────────────────────────
  function handleClear() {
    setMessages([{
      id: uuidv4(),
      role: 'assistant',
      content: 'Chat cleared! Ask me anything about your social media.',
      timestamp: new Date()
    }])
    setQuickReplies([])
  }

  // ── FEEDBACK ───────────────────────────────────────
  async function handleFeedback(msgId: string, rating: 'up' | 'down') {
    await saveFeedback(userId, msgId, rating)
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, rating } : m
    ))
  }

  // ── FORMAT TIMESTAMP ───────────────────────────────
  function formatTime(date: Date) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ── TYPING DOTS ────────────────────────────────────
  const TypingDots = () => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#94A3B8',
          animation: `chatbotBounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  )

  // ── RENDER ─────────────────────────────────────────
  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes chatbotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatbotSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes chatbotFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chatbot-msg { animation: chatbotFadeIn 0.25s ease; }
        .chatbot-input:focus { outline: none; border-color: #1D4ED8 !important; }
        .chatbot-send:hover { background: #1e40af !important; }
        .chatbot-send:disabled { background: #E2E8F0 !important; cursor: not-allowed; }
        .chatbot-pill:hover { background: #EFF6FF !important; border-color: #1D4ED8 !important; color: #1D4ED8 !important; }
        .chatbot-feedback:hover { background: #F1F5F9 !important; }
        .chatbot-scroll-btn:hover { background: #1e40af !important; }
      `}</style>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => { setIsOpen(o => !o); setUnreadCount(0) }}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: '#1D4ED8', border: 'none',
          cursor: 'pointer', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(29,78,216,0.45)',
          animation: unreadCount > 0 ? 'chatbotPulse 2s infinite' : 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(29,78,216,0.55)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,78,216,0.45)'
        }}
        title="Open SocialPulse AI"
        aria-label="Open AI Chat"
      >
        {isOpen
          ? <X size={24} color="white" />
          : <MessageCircle size={24} color="white" />
        }

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#EF4444', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'white', fontWeight: 700
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* CHAT PANEL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 92, right: 24,
          width: 400,
          height: isMinimized ? 64 : 600,
          zIndex: 9998,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          background: 'white',
          border: '1px solid #E2E8F0',
          animation: 'chatbotSlideUp 0.25s ease',
          transition: 'height 0.3s ease'
        }}>

          {/* HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(59,130,246,0.2)',
                border: '1.5px solid rgba(59,130,246,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={18} color="#3B82F6" />
              </div>
              <div>
                <p style={{
                  color: 'white', fontWeight: 600,
                  fontSize: 14, margin: 0, lineHeight: 1.2
                }}>
                  SocialPulse AI
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#22C55E'
                  }} />
                  <p style={{
                    color: '#94A3B8', fontSize: 11,
                    margin: 0
                  }}>
                    Online — powered by real data
                  </p>
                </div>
              </div>
            </div>

            {/* Header buttons */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={handleClear}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: 0.7
                }}
                title="Clear chat"
              >
                <RotateCcw size={14} color="white" />
              </button>
              <button
                onClick={() => setIsMinimized(m => !m)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: 0.7
                }}
                title="Minimize"
              >
                <Minimize2 size={14} color="white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: 0.7
                }}
                title="Close"
              >
                <X size={14} color="white" />
              </button>
            </div>
          </div>

          {/* MESSAGES AREA */}
          {!isMinimized && (
            <>
              <div
                ref={messagesRef}
                onScroll={handleScroll}
                style={{
                  flex: 1, overflowY: 'auto',
                  padding: '16px 14px',
                  background: '#F8FAFC',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}
              >
                {/* SUGGESTED QUESTIONS — show before first user message */}
                {messages.filter(m => m.role === 'user').length === 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{
                      fontSize: 11, color: '#94A3B8',
                      textAlign: 'center', margin: '0 0 10px',
                      fontWeight: 500, letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      Suggested questions
                    </p>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: 6
                    }}>
                      {SUGGESTED_QUESTIONS.slice(0, 6).map((q, i) => (
                        <button
                          key={i}
                          className="chatbot-pill"
                          onClick={() => handleSend(q)}
                          style={{
                            fontSize: 12, padding: '5px 10px',
                            borderRadius: 20,
                            border: '1px solid #E2E8F0',
                            background: 'white',
                            color: '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            lineHeight: 1.4
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MESSAGES */}
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className="chatbot-msg"
                    style={{
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      gap: 8, alignItems: 'flex-end'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      flexShrink: 0,
                      background: msg.role === 'user' ? '#1D4ED8' : '#0F172A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {msg.role === 'user'
                        ? <User size={14} color="white" />
                        : <Bot size={14} color="#3B82F6" />
                      }
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: '78%' }}>
                      <div style={{
                        padding: '10px 13px',
                        borderRadius: msg.role === 'user'
                          ? '14px 4px 14px 14px'
                          : '4px 14px 14px 14px',
                        background: msg.role === 'user'
                          ? '#1D4ED8'
                          : 'white',
                        color: msg.role === 'user' ? 'white' : '#1E293B',
                        fontSize: 13, lineHeight: 1.65,
                        border: msg.role === 'assistant'
                          ? '1px solid #E2E8F0'
                          : 'none',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {msg.isLoading && !msg.content
                          ? <TypingDots />
                          : msg.content
                        }
                        {msg.isStreaming && msg.content && (
                          <span style={{
                            display: 'inline-block',
                            width: 2, height: 14,
                            background: '#1D4ED8',
                            marginLeft: 2,
                            animation: 'chatbotBounce 0.8s infinite'
                          }} />
                        )}
                      </div>

                      {/* Timestamp + feedback */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: msg.role === 'user'
                          ? 'flex-end' : 'flex-start',
                        gap: 6, marginTop: 3
                      }}>
                        <span style={{
                          fontSize: 10, color: '#94A3B8'
                        }}>
                          {formatTime(msg.timestamp)}
                        </span>

                        {/* Feedback buttons for assistant */}
                        {msg.role === 'assistant' &&
                         !msg.isLoading &&
                         idx > 0 && (
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              className="chatbot-feedback"
                              onClick={() => handleFeedback(msg.id, 'up')}
                              style={{
                                width: 20, height: 20, borderRadius: 4,
                                border: 'none', background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                opacity: msg.rating === 'up' ? 1 : 0.4
                              }}
                              title="Helpful"
                            >
                              <ThumbsUp size={11}
                                color={msg.rating === 'up' ? '#22C55E' : '#94A3B8'}
                                fill={msg.rating === 'up' ? '#22C55E' : 'none'}
                              />
                            </button>
                            <button
                              className="chatbot-feedback"
                              onClick={() => handleFeedback(msg.id, 'down')}
                              style={{
                                width: 20, height: 20, borderRadius: 4,
                                border: 'none', background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                opacity: msg.rating === 'down' ? 1 : 0.4
                              }}
                              title="Not helpful"
                            >
                              <ThumbsDown size={11}
                                color={msg.rating === 'down' ? '#EF4444' : '#94A3B8'}
                                fill={msg.rating === 'down' ? '#EF4444' : 'none'}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* QUICK REPLIES */}
                {quickReplies.length > 0 && !loading && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap',
                    gap: 6, paddingLeft: 36
                  }}>
                    {quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        className="chatbot-pill"
                        onClick={() => {
                          setQuickReplies([])
                          handleSend(reply)
                        }}
                        style={{
                          fontSize: 11, padding: '4px 10px',
                          borderRadius: 20,
                          border: '1px solid #E2E8F0',
                          background: 'white', color: '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* SCROLL TO BOTTOM BUTTON */}
              {showScrollBtn && (
                <button
                  className="chatbot-scroll-btn"
                  onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    position: 'absolute', bottom: 80, right: 16,
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#1D4ED8', border: 'none',
                    cursor: 'pointer', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'background 0.2s'
                  }}
                >
                  <ChevronDown size={16} color="white" />
                </button>
              )}

              {/* INPUT AREA */}
              <div style={{
                padding: '10px 12px',
                borderTop: '1px solid #E2E8F0',
                background: 'white', flexShrink: 0
              }}>
                {/* Powered by label */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 4, marginBottom: 8
                }}>
                  <Sparkles size={10} color="#94A3B8" />
                  <span style={{
                    fontSize: 10, color: '#94A3B8'
                  }}>
                    Powered by Claude AI + your real account data
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={inputRef}
                    className="chatbot-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && !loading) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Ask anything about your social media..."
                    disabled={loading}
                    maxLength={500}
                    style={{
                      flex: 1, padding: '9px 13px',
                      borderRadius: 10, fontSize: 13,
                      border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC',
                      color: '#1E293B',
                      transition: 'border-color 0.15s ease',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    className="chatbot-send"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: input.trim() && !loading
                        ? '#1D4ED8' : '#E2E8F0',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                      transition: 'background 0.15s ease'
                    }}
                    aria-label="Send message"
                  >
                    {loading
                      ? <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: '2px solid #94A3B8',
                          borderTopColor: 'transparent',
                          animation: 'chatbotBounce 0.6s linear infinite'
                        }} />
                      : <Send size={16}
                          color={input.trim() ? 'white' : '#94A3B8'}
                        />
                    }
                  </button>
                </div>

                {/* Character count */}
                {input.length > 400 && (
                  <p style={{
                    fontSize: 10, color: '#EF4444',
                    margin: '4px 0 0', textAlign: 'right'
                  }}>
                    {500 - input.length} characters left
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
