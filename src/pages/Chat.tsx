import { useState, useRef, useEffect } from 'react'
import {
  Send, Plus, ChevronDown, ChevronUp, Paperclip, Image, Mic,
  Star, MoreHorizontal, X, Search, MessageCircle,
  Pencil, Trash2, Phone, PhoneOff, MicOff,
  Copy, RotateCcw,
} from 'lucide-react'
import type { Preferences } from '../hooks/usePreferences'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thinking?: string
}

function ThinkingPanel({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass rounded-2xl rounded-bl-sm mb-2 overflow-hidden w-fit min-w-[120px]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
      >
        <span className="text-xs text-white/60 font-medium">思考过程</span>
        {open ? <ChevronUp size={13} className="text-white/40" /> : <ChevronDown size={13} className="text-white/40" />}
      </button>
      {open && (
        <div className="px-3 pb-3 text-[11px] text-white/45 leading-relaxed whitespace-pre-wrap border-t border-white/[0.06] pt-2">
          {content}
        </div>
      )}
    </div>
  )
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

const ACTIVE_KEY = 'lover_active_v1'

function parseSessions(data: Session[]): Session[] {
  return data.map(s => ({
    ...s,
    updatedAt: new Date(s.updatedAt),
    messages: s.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
  }))
}

// ——— 头像组件 ———
function Avatar({ imageUrl, text, size, textSize, gradient }: {
  imageUrl: string; text: string; size: string; textSize: string; gradient: string
}) {
  if (imageUrl) return <img src={imageUrl} className={`${size} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center text-white font-bold ${textSize}`}>
      {text || '？'}
    </div>
  )
}

// ——— 通话弹窗 ———
function CallOverlay({ aiText, aiName, onClose }: { aiText: string; aiName: string; onClose: () => void }) {
  const [muted, setMuted] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between py-16"
      style={{ background: 'rgba(10,8,30,0.92)', backdropFilter: 'blur(30px)' }}>
      {/* AI 信息 */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-purple-500/30">
          {aiText}
        </div>
        <div className="text-xl font-semibold text-white">{aiName}</div>
        <div className="text-sm text-green-400 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          通话中 {fmt(seconds)}
        </div>
        <div className="text-xs text-white/30 mt-1">语音通话功能接入中</div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setMuted(v => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            muted ? 'bg-white/20 text-white/50' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {muted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow-lg shadow-red-500/40 transition-colors"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  )
}

// ——— 会话条目 ———
function SessionRow({
  s, active, onSwitch, onRename, onTogglePin, onDelete,
}: {
  s: Session
  active: boolean
  onSwitch: () => void
  onRename: (name: string) => void
  onTogglePin: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(s.title)

  const submitRename = () => {
    if (nameVal.trim()) onRename(nameVal.trim())
    setEditing(false)
  }

  return (
    <div className="relative">
      {editing ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/15">
          <input
            autoFocus
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename()
              if (e.key === 'Escape') setEditing(false)
            }}
            onBlur={submitRename}
            className="flex-1 bg-transparent text-sm text-white outline-none min-w-0"
          />
        </div>
      ) : (
        <div
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
            active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          <button className="flex-1 flex items-center gap-2 text-left min-w-0" onClick={onSwitch}>
            {s.pinned
              ? <Star size={14} className="text-yellow-400 flex-shrink-0" />
              : <MessageCircle size={14} className="flex-shrink-0 opacity-50" />
            }
            <span className="text-sm truncate">{s.title}</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/20 text-white/50 hover:text-white flex-shrink-0 transition-opacity"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      )}

      {menuOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-0.5 glass rounded-xl py-1 shadow-xl"
          style={{ minWidth: 120 }}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            onClick={() => { setNameVal(s.title); setEditing(true); setMenuOpen(false) }}
            className="w-full px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 text-left flex items-center gap-2"
          >
            <Pencil size={12} /> 重命名
          </button>
          <button
            onClick={() => { onTogglePin(); setMenuOpen(false) }}
            className="w-full px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 text-left flex items-center gap-2"
          >
            <Star size={12} /> {s.pinned ? '取消置顶' : '置顶'}
          </button>
          <div className="my-1 border-t border-white/10" />
          <button
            onClick={() => { onDelete(); setMenuOpen(false) }}
            className="w-full px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-white/10 text-left flex items-center gap-2"
          >
            <Trash2 size={12} /> 删除
          </button>
        </div>
      )}
    </div>
  )
}

// ——— 主组件 ———
export default function Chat({
  prefs,
  navHeight = 88,
}: {
  prefs: Preferences
  navHeight?: number
}) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [calling, setCalling] = useState(false)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [kbHeight, setKbHeight] = useState(0)
  const [vvHeight, setVvHeight] = useState(() => window.innerHeight)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeSession = sessions.find(s => s.id === activeId) ?? sessions[0]
  const pinned = sessions.filter(s => s.pinned)
  const recent = sessions.filter(s => !s.pinned && (!search || s.title.includes(search)))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      setVvHeight(vv.height)
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbHeight(kb)
      if (kb > 10) bottomRef.current?.scrollIntoView()
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])


  // 启动时从服务器加载会话
  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: Session[]) => {
        if (!Array.isArray(data) || data.length === 0) {
          const s = createSession(); setSessions([s]); setActiveId(s.id); return
        }
        const parsed = parseSessions(data)
        setSessions(parsed)
        const savedId = (() => { try { return localStorage.getItem(ACTIVE_KEY) || '' } catch { return '' } })()
        setActiveId(parsed.find(s => s.id === savedId) ? savedId : parsed[parsed.length - 1].id)
      })
      .catch(() => { const s = createSession(); setSessions([s]); setActiveId(s.id) })
  }, [])

  // 自动保存到服务器（debounce 800ms）
  useEffect(() => {
    if (sessions.length === 0) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessions),
      }).catch(() => {})
    }, 800)
  }, [sessions])

  // activeId 存本地（记住各设备上次选的对话）
  useEffect(() => {
    if (!activeId) return
    try { localStorage.setItem(ACTIVE_KEY, activeId) } catch {}
  }, [activeId])

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const sendMessage = async (priorMsgs: Message[]) => {
    setLoading(true)
    let segments: string[] = ['网络错误，请稍后再试']
    let thinking: string | undefined
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: priorMsgs }),
      })
      const data = await res.json()
      thinking = data.thinking || undefined
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        segments = data.messages
      } else {
        segments = [data.content || data.error || '没有收到回复']
      }
    } catch {
      segments = ['网络错误，请稍后再试']
    }
    const now = Date.now()
    const aiMsgs: Message[] = segments.map((content, i) => ({
      id: (now + i + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      thinking: i === 0 ? thinking : undefined,
    }))
    setSessions(prev => prev.map(s =>
      s.id === activeId ? { ...s, messages: [...s.messages, ...aiMsgs], updatedAt: new Date() } : s
    ))
    setLoading(false)
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
    await sendMessage([...(activeSession?.messages ?? []), userMsg])
  }

  const copyMsg = (content: string) => { navigator.clipboard.writeText(content).catch(() => {}) }

  const retryMsg = async (msgId: string) => {
    if (loading) return
    const msgs = activeSession.messages
    const idx = msgs.findIndex(m => m.id === msgId)
    if (idx < 0) return
    const trimmed = msgs.slice(0, idx)
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: trimmed } : s))
    await sendMessage(trimmed)
  }

  const confirmEdit = async () => {
    if (!editingMsgId || loading) return
    const text = editContent.trim()
    if (!text) { setEditingMsgId(null); return }
    const msgs = activeSession.messages
    const idx = msgs.findIndex(m => m.id === editingMsgId)
    if (idx < 0) { setEditingMsgId(null); return }
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    const newMsgs = [...msgs.slice(0, idx), userMsg]
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: newMsgs } : s))
    setEditingMsgId(null)
    await sendMessage(newMsgs)
  }

  const newSession = () => {
    const s = createSession()
    setSessions(prev => [...prev, s])
    setActiveId(s.id)
    setSidebarOpen(false)
  }

  const switchSession = (id: string) => { setActiveId(id); setSidebarOpen(false) }
  const renameSession = (id: string, name: string) => setSessions(prev => prev.map(s => s.id === id ? { ...s, title: name } : s))
  const togglePin = (id: string) => setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s))
  const deleteSession = (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id)
      if (next.length === 0) {
        const fresh = createSession(); setActiveId(fresh.id); return [fresh]
      }
      if (id === activeId) setActiveId(next[next.length - 1].id)
      return next
    })
  }

  const formatTime = (d: Date) => d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* 通话弹窗 */}
      {calling && (
        <CallOverlay
          aiText={prefs.aiText}
          aiName={prefs.aiName}
          onClose={() => setCalling(false)}
        />
      )}

      {/* 侧边栏遮罩 */}
      {sidebarOpen && (
        <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 左侧会话列表抽屉 */}
      <aside
        className={`absolute left-0 top-0 h-full z-30 w-72 glass flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <Avatar imageUrl={prefs.aiAvatar} text={prefs.aiText} size="w-9 h-9" textSize="text-sm" gradient="from-purple-500 to-blue-500" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{prefs.aiName}</div>
            <div className="flex items-center gap-1 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Online
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white/70">
            <X size={18} />
          </button>
        </div>

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

        <button
          onClick={newSession}
          className="mx-3 mb-3 flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2 text-white/70 hover:text-white text-sm transition-colors"
        >
          <Plus size={14} /> 新建窗口
        </button>

        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {pinned.length > 0 && (
            <div>
              <div className="text-[11px] text-white/40 font-medium px-1 mb-2">置顶</div>
              {pinned.map(s => (
                <SessionRow key={s.id} s={s} active={s.id === activeId}
                  onSwitch={() => switchSession(s.id)}
                  onRename={name => renameSession(s.id, name)}
                  onTogglePin={() => togglePin(s.id)}
                  onDelete={() => deleteSession(s.id)}
                />
              ))}
            </div>
          )}
          <div>
            <div className="text-[11px] text-white/40 font-medium px-1 mb-2">最近聊天</div>
            {recent.map(s => (
              <SessionRow key={s.id} s={s} active={s.id === activeId}
                onSwitch={() => switchSession(s.id)}
                onRename={name => renameSession(s.id, name)}
                onTogglePin={() => togglePin(s.id)}
                onDelete={() => deleteSession(s.id)}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* 主聊天区域：高度跟视觉视口走，键盘弹起时自动缩短 */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ height: `${vvHeight}px` }}>

        {/* 顶栏 */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Avatar imageUrl={prefs.aiAvatar} text={prefs.aiText} size="w-7 h-7" textSize="text-xs" gradient="from-purple-500 to-blue-500" />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white">{prefs.aiName}</span>
                <ChevronDown size={12} className="text-white/50" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Sonnet 4.6 · Online
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCalling(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-green-400 transition-all"
              title="语音通话"
            >
              <Phone size={18} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4" style={{ paddingBottom: `${Math.max(kbHeight, navHeight) + 80}px` }}>
          {activeSession?.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/25 select-none gap-2">
              <div className="text-3xl">{prefs.aiText}</div>
              <div className="text-sm">在。今天想聊点什么？</div>
            </div>
          )}

          {activeSession?.messages.map((msg, idx) => {
            const nextMsg = activeSession.messages[idx + 1]
            const isLastInGroup = !nextMsg || nextMsg.role !== msg.role
            return (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'assistant' && msg.thinking && (
                <div className="ml-9">
                  <ThinkingPanel content={msg.thinking} />
                </div>
              )}
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                {msg.role === 'assistant' && (
                  <div className="mr-2 mt-0.5 flex-shrink-0">
                    <Avatar imageUrl={prefs.aiAvatar} text={prefs.aiText} size="w-7 h-7" textSize="text-[10px]" gradient="from-purple-500 to-blue-500" />
                  </div>
                )}
                <div className="flex flex-col max-w-[75%]">
                  {editingMsgId === msg.id ? (
                    <div className="glass rounded-2xl px-3 py-2 rounded-tr-sm">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full bg-transparent text-sm text-white outline-none resize-none min-h-[60px]"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end mt-1.5">
                        <button onClick={() => setEditingMsgId(null)} className="text-[11px] text-white/40 hover:text-white/70">取消</button>
                        <button onClick={confirmEdit} className="text-[11px] text-white/80 hover:text-white">发送</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'glass text-white rounded-tr-sm' : 'glass text-white/90 rounded-tl-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  )}
                  {isLastInGroup && (
                    <div className={`flex items-center gap-1 mt-1.5 px-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-white/25 mr-1">{formatTime(msg.timestamp)}</span>
                      <button onClick={() => copyMsg(msg.content)} className="p-1 rounded-md hover:bg-white/10 text-white/25 hover:text-white/60 transition-colors">
                        <Copy size={11} />
                      </button>
                      {msg.role === 'user' && (
                        <button onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content) }} className="p-1 rounded-md hover:bg-white/10 text-white/25 hover:text-white/60 transition-colors">
                          <Pencil size={11} />
                        </button>
                      )}
                      {msg.role === 'assistant' && (
                        <button onClick={() => retryMsg(msg.id)} className="p-1 rounded-md hover:bg-white/10 text-white/25 hover:text-white/60 transition-colors">
                          <RotateCcw size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="mr-2 mt-0.5"><Avatar imageUrl={prefs.aiAvatar} text={prefs.aiText} size="w-7 h-7" textSize="text-[10px]" gradient="from-purple-500 to-blue-500" /></div>
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
        <div className="px-3 pb-2" style={{ position: 'fixed', left: 0, right: 0, bottom: Math.max(kbHeight, navHeight), zIndex: 50 }}>
          <div className="glass rounded-2xl px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize() }}
              placeholder="发送消息..."
              rows={1}
              className="w-full bg-transparent text-white text-sm resize-none outline-none leading-relaxed"
              style={{ maxHeight: '160px', fontSize: '16px' }}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="上传文件">
                  <Paperclip size={16} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="上传图片">
                  <Image size={16} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="语音输入">
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
