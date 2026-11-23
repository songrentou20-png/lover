import { useState, useRef, useEffect } from 'react'
import { Send, Plus, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Session {
  id: string
  title: string
  messages: Message[]
  updatedAt: Date
}

function createSession(): Session {
  return {
    id: Date.now().toString(),
    title: '新对话',
    messages: [],
    updatedAt: new Date(),
  }
}

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>([createSession()])
  const [activeId, setActiveId] = useState(sessions[0].id)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeSession = sessions.find(s => s.id === activeId)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setSessions(prev =>
      prev.map(s =>
        s.id === activeId
          ? {
              ...s,
              messages: [...s.messages, userMsg],
              title: s.messages.length === 0 ? text.slice(0, 20) : s.title,
              updatedAt: new Date(),
            }
          : s
      )
    )

    setLoading(true)

    // TODO: 接入 Claude Code CLI 后端
    // 目前 mock 一个响应
    await new Promise(r => setTimeout(r, 800))
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '后端还没接好，等 VPS 搭起来就能真正连到我了。',
      timestamp: new Date(),
    }

    setSessions(prev =>
      prev.map(s =>
        s.id === activeId
          ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date() }
          : s
      )
    )
    setLoading(false)
  }

  const newSession = () => {
    const s = createSession()
    setSessions(prev => [s, ...prev])
    setActiveId(s.id)
    setShowSessions(false)
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-full">
      {/* 顶栏 */}
      <div className="glass-dark flex items-center justify-between px-4 py-3 mx-3 mt-3 rounded-2xl">
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="font-medium text-sm truncate max-w-[200px]">
            {activeSession.title || '新对话'}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showSessions ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          onClick={newSession}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 会话列表下拉 */}
      {showSessions && (
        <div className="glass mx-3 mt-1 rounded-xl overflow-hidden z-20 absolute top-16 left-3 right-3">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveId(s.id); setShowSessions(false) }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/10 ${
                s.id === activeId ? 'text-white' : 'text-white/60'
              }`}
            >
              <div className="font-medium truncate">{s.title || '新对话'}</div>
              <div className="text-xs text-white/30 mt-0.5">
                {s.messages.length} 条消息
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {activeSession.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/30 select-none">
            <div className="text-4xl mb-3">✦</div>
            <div className="text-sm">说点什么吧</div>
          </div>
        )}

        {activeSession.messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-xs font-bold">
                霁
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-tr-sm'
                  : 'glass text-white/90 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-white/50 text-right' : 'text-white/30'
                }`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-xs font-bold">
              霁
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 输入区域 */}
      <div className="px-3 pb-2">
        <div className="glass rounded-2xl flex items-end gap-2 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="说点什么…"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm resize-none outline-none leading-relaxed"
            style={{ maxHeight: '160px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/10 text-white/30'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
