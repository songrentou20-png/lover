import { useState, useEffect, useRef } from 'react'

import { MessageCircle, Brain, Puzzle, LayoutGrid, Settings } from 'lucide-react'
import Chat from './pages/Chat'
import Memory from './pages/Memory'
import MCP from './pages/MCP'
import Apps from './pages/Apps'
import SettingsPage from './pages/Settings'
import { usePreferences, BG_PRESETS } from './hooks/usePreferences'

type Tab = 'memory' | 'mcp' | 'chat' | 'apps' | 'settings'

const tabs: { id: Tab; icon: typeof MessageCircle; label: string }[] = [
  { id: 'memory', icon: Brain, label: 'Memory' },
  { id: 'mcp', icon: Puzzle, label: 'MCP' },
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'apps', icon: LayoutGrid, label: 'Apps' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const navRef = useRef<HTMLDivElement>(null)
  const [kbHeight, setKbHeight] = useState(0)
  const [navH, setNavH] = useState(88)
  const fullHeightRef = useRef(0)
  const { prefs, update } = usePreferences()

  useEffect(() => {
    const vv = window.visualViewport
    fullHeightRef.current = vv ? vv.height : window.innerHeight

    // 只用来检测键盘高度（决定是否隐藏导航栏），不再操作任何 CSS 变量
    const onResize = () => {
      const h = vv ? vv.height : window.innerHeight
      const diff = fullHeightRef.current - h
      setKbHeight(diff > 150 ? diff : 0)
    }

    // 失焦时补一次检测，确保键盘完全收起后 kbHeight 归零
    const onBlur = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        setTimeout(onResize, 400)
      }
    }

    if (vv) vv.addEventListener('resize', onResize)
    document.addEventListener('blur', onBlur, true)

    return () => {
      if (vv) vv.removeEventListener('resize', onResize)
      document.removeEventListener('blur', onBlur, true)
    }
  }, [])

  // 键盘收回时测量导航栏实际高度
  useEffect(() => {
    if (navRef.current && kbHeight === 0) {
      const h = navRef.current.getBoundingClientRect().height
      if (h > 0) setNavH(h)
    }
  }, [kbHeight])

  const bg = BG_PRESETS[prefs.bgPreset] ?? BG_PRESETS.default
  const bgStyle = prefs.wallpaper
    ? { backgroundImage: `url(${prefs.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bg.bg }

  useEffect(() => {
    const alpha = (0.02 + (prefs.glassOpacity / 100) * 0.18).toFixed(3)
    const border = (parseFloat(alpha) * 1.6).toFixed(3)
    document.documentElement.style.setProperty('--glass-alpha', alpha)
    document.documentElement.style.setProperty('--glass-border', border)
  }, [prefs.glassOpacity])

  return (
    <>
      {/* 背景层：position fixed，永远钉死不动，可以被键盘遮住 */}
      <div className="fixed inset-0 -z-10" style={bgStyle} />
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: bg.glow }} />

      {/* 内容区：fixed 直接参照 visual viewport，彻底绕开 dvh 高度不确定性 */}
      <div
        className="fixed left-0 right-0 overflow-hidden"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          bottom: kbHeight > 50 ? 0 : navH,
        }}
      >
        {activeTab === 'chat' && <Chat prefs={prefs} kbHeight={kbHeight} />}
        {activeTab === 'memory' && <Memory />}
        {activeTab === 'mcp' && <MCP />}
        {activeTab === 'apps' && <Apps />}
        {activeTab === 'settings' && <SettingsPage prefs={prefs} updatePrefs={update} />}
      </div>

      {/* 底部导航：fixed bottom-0 直接贴 visual viewport 底部（含 home indicator） */}
      <div ref={navRef} className={`fixed bottom-0 left-0 right-0 z-10 px-4 pt-2 nav-safe ${kbHeight > 50 ? 'hidden' : ''}`}
        style={{ background: 'rgba(10, 8, 30, 0.75)' }}>
        <nav className="glass rounded-2xl px-2 py-2 flex items-center justify-around max-w-md mx-auto">
          {tabs.map(({ id, icon: Icon, label }) => {
            const active = id === activeTab
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
