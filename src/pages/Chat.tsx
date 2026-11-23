import { useState, useRef, useEffect } from 'react'
import {
  Send, Plus, ChevronDown, Paperclip, Image, Mic,
  Star, Settings, Palette, MoreHorizontal, X, Search,
  MessageCircle,
} from 'lucide-react'

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
  pinned: boolean
  updatedAt: Date
}

function createSession(title = '新对话'): Session {
  return { id: Date.now().toString(), title, messages: [], pinned: false, updatedAt: new Date() }
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', title: '我的小助手', messages: [], pinned: true, updatedAt: new Date() },
  { id: '2', title: '学习计划', messages: [], pinned: true, updatedAt: new Date() },
  { id: '3', title: '日记灵感', messages: [], pinned: false, updatedAt: new Date() },
  { id: '4', title: '旅行计划', messages: [], pinned: false, updatedAt: new Date() },
  { id: '5', title: '论文相关', messages: [], pinned: false, updatedAt: new Date() },
]

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS)
  const [activeId, setActiveId] = useState(MOCK_SESSIONS[0].id)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [search, setSearch] = useState('')

  const activeSession = sessions.find(s => s.id === activeId)!
  const pinned = sessions.filter(s => s.pinned)
  const recent = sessions.filter(s => !s.pinned).filter(s =>
    !search || s.title.includes(search)
  )

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

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setSessions(prev => prev.map(s =>
      s.id === activeId
        ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? text.slice(0, 18) : s.title, updatedAt: new Date() }
        : s
    ))
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '后端接入中，VPS 搭好就能找到我了。', timestamp: new Date() }
    setSessions(prev => prev.map(s =>
      s.id === activeId ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date() } : s
    ))
    setLoading(false)
  }

  const newSession = () => {
    const s = createSession()
    setSessions(prev => [...prev, s])
    setActiveId(s.id)
    setSidebarOpen(false)
  }

  const switchSession = (id: string) => {
    setActiveId(id)
    setSidebarOpen(false)
  }

  const formatTime = (d: Date) => d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* 侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 左侧会话列表抽屉 */}
      <aside
        className={`absolute left-0 top-0 h-full z-30 w-72 glass flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 用户信息 */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            思
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">思涵</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white/70">
            <X size={18} />
          </button>
        </div>

        {/* 搜索 */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <Search size={14} className="text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索聊天..."
              className="bg-transparent text-white/80 text-sm outline-none flex-1 placeholder-white/30"
            />
          </div>
        </div>

        {/* 新建 */}
        <button
          onClick={newSession}
          className="mx-3 mb-3 flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2 text-white/70 hover:text-white text-sm transition-colors"
        >
          <Plus size={14} />
          新建窗口
        </button>

        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {/* 置顶 */}
          {pinned.length > 0 && (
            <div>
              <div className="text-[11px] text-white/40 font-medium px-1 mb-2">置顶</div>
              {pinned.map(s => (
                <button key={s.id} onClick={() => switchSession(s.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    s.id === activeId ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}>
                  <Star size={14} className="text-yellow-400 flex-shrink-0" />
                  <span className="text-sm truncate">{s.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* 最近 */}
          <div>
            <div className="text-[11px] text-white/40 font-medium px-1 mb-2">最近聊天</div>
            {recent.map(s => (
              <button key={s.id} onClick={() => switchSession(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  s.id === activeId ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}>
                <MessageCircle size={14} className="flex-shrink-0 opacity-50" />
                <span className="text-sm truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="border-t border-white/10 px-3 py-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors text-sm">
            <Settings size={15} />设置
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors text-sm">
            <Palette size={15} />外观与主题
          </button>
        </div>
      </aside>

      {/* 主聊天区域 */}
      <div className="flex flex-col flex-1 h-full">

        {/* 顶栏 */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs">
              ✦
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white">Claude</span>
                <ChevronDown size={12} className="text-white/50" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Sonnet 4.6 · Online
              </div>
            </div>
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          {activeSession.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/25 select-none gap-2">
              <div className="text-3xl">✦</div>
              <div className="text-sm">在。今天想聊点什么？</div>
            </div>
          )}

          {activeSession.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-[10px] font-bold">
                  ✦
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-tr-sm'
                  : 'glass text-white/90 rounded-tl-sm'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-white/30'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-[10px]">✦</div>
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
          <div className="glass rounded-2xl px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize() }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="发送消息给 Claude..."
              rows={1}
              className="w-full bg-transparent text-white text-sm resize-none outline-none leading-relaxed"
              style={{ maxHeight: '160px' }}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
                  <Paperclip size={16} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
                  <Image size={16} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
                  <Mic size={16} />
                </button>
              </div>
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
