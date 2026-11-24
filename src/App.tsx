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
  const [sab, setSab] = useState(34)
  const fullHeightRef = useRef(0)
  const { prefs, update } = usePreferences()

  useEffect(() => {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden'
    document.body.appendChild(el)
    const cs = getComputedStyle(el)
    const sabVal = parseInt(cs.paddingBottom) || 0
    document.body.removeChild(el)
    setSab(sabVal > 0 ? sabVal : 34)
  }, [])

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


  useEffect(() => {
    const alpha = (0.02 + (prefs.glassOpacity / 100) * 0.18).toFixed(3)
    const border = (parseFloat(alpha) * 1.6).toFixed(3)
    document.documentElement.style.setProperty('--glass-alpha', alpha)
    document.documentElement.style.setProperty('--glass-border', border)
  }, [prefs.glassOpacity])

  // html element 的背景覆盖整个视口含 status bar，body/fixed div 覆盖不到那里
  useEffect(() => {
    const el = document.documentElement
    if (prefs.wallpaper) {
      el.style.backgroundImage = `url(${prefs.wallpaper})`
      el.style.backgroundSize = 'cover'
      el.style.backgroundPosition = 'center'
      el.style.backgroundColor = ''
    } else {
      el.style.backgroundImage = ''
      el.style.background = bg.glow ? `${bg.glow}, ${bg.bg}` : bg.bg
    }
  }, [prefs.wallpaper, bg.bg, bg.glow])

  const bgStyle = prefs.wallpaper
    ? { backgroundImage: `url(${prefs.wallpaper})`, backgroundSize: 'cover' as const, backgroundPosition: 'center' }
    : { background: bg.glow ? `${bg.glow}, ${bg.bg}` : bg.bg }

  return (
    <>
      {/* 内容区：body transparent，html 的壁纸背景透出来覆盖整个屏幕含 status bar */}
      <div
        className="fixed left-0 right-0 overflow-hidden"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          bottom: kbHeight > 50 ? kbHeight : navH,
        }}
      >
        {activeTab === 'chat' && <Chat prefs={prefs} kbHeight={kbHeight} />}
        {activeTab === 'memory' && <Memory />}
        {activeTab === 'mcp' && <MCP />}
        {activeTab === 'apps' && <Apps />}
        {activeTab === 'settings' && <SettingsPage prefs={prefs} updatePrefs={update} />}
      </div>

      {/* 底部导航：负 bottom 让背景延伸到 home indicator 以下；padding 补偿保持按钮位置 */}
      <div ref={navRef} className={`fixed left-0 right-0 z-10 px-4 pt-2 ${kbHeight > 50 ? 'hidden' : ''}`}
        style={{
          bottom: `-${sab}px`,
          paddingBottom: `${sab + Math.max(sab, 16)}px`,
          background: 'transparent',
        }}>
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
                    : 'text-white/70 hover:text-white'
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
