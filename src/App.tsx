import { useState, useEffect } from 'react'
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
  const { prefs, update } = usePreferences()
  const bg = BG_PRESETS[prefs.bgPreset] ?? BG_PRESETS.default

  useEffect(() => {
    const alpha = (0.02 + (prefs.glassOpacity / 100) * 0.18).toFixed(3)
    const border = (parseFloat(alpha) * 1.6).toFixed(3)
    document.documentElement.style.setProperty('--glass-alpha', alpha)
    document.documentElement.style.setProperty('--glass-border', border)
  }, [prefs.glassOpacity])

  return (
    <div
      className="relative h-full w-full flex flex-col overflow-hidden"
      style={{ background: bg.bg }}
    >
      {/* 背景光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: bg.glow }}
      />

      {/* 页面内容 */}
      <div className="relative flex-1 overflow-hidden">
        {activeTab === 'chat' && <Chat prefs={prefs} updatePrefs={update} />}
        {activeTab === 'memory' && <Memory />}
        {activeTab === 'mcp' && <MCP />}
        {activeTab === 'apps' && <Apps />}
        {activeTab === 'settings' && <SettingsPage prefs={prefs} updatePrefs={update} />}
      </div>

      {/* 底部导航 */}
      <div className="relative z-10 px-4 pb-4 pt-2">
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
                } ${id === 'chat' ? 'relative' : ''}`}
              >
                {id === 'chat' ? (
                  <div
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30'
                        : 'bg-white/10'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                ) : (
                  <Icon size={20} />
                )}
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
