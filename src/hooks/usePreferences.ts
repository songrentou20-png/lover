import { useState, useEffect } from 'react'

export interface Preferences {
  userText: string
  userName: string
  userAvatar: string   // base64 图片，空字符串用文字
  aiText: string
  aiName: string
  aiAvatar: string     // base64 图片，空字符串用文字
  bgPreset: string
  wallpaper: string    // base64 图片，空字符串用 bgPreset
  glassOpacity: number
}

export const DEFAULT_PREFS: Preferences = {
  userText: '思',
  userName: '思涵',
  userAvatar: '',
  aiText: '霁',
  aiName: 'Claude',
  aiAvatar: '',
  bgPreset: 'default',
  wallpaper: '',
  glassOpacity: 28,
}

export const BG_PRESETS: Record<string, { label: string; bg: string; glow: string }> = {
  default: {
    label: '深夜紫',
    bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    glow: 'radial-gradient(ellipse at 20% 50%, rgba(120,80,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(80,120,255,0.1) 0%, transparent 60%)',
  },
  midnight: {
    label: '深渊黑',
    bg: 'linear-gradient(135deg, #060608 0%, #0d0d1f 50%, #060810 100%)',
    glow: 'radial-gradient(ellipse at 30% 70%, rgba(0,60,180,0.1) 0%, transparent 60%)',
  },
  aurora: {
    label: '极光绿',
    bg: 'linear-gradient(135deg, #071a0e 0%, #0d2b1f 50%, #07101a 100%)',
    glow: 'radial-gradient(ellipse at 20% 50%, rgba(0,220,100,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(60,0,220,0.08) 0%, transparent 50%)',
  },
  rose: {
    label: '玫瑰红',
    bg: 'linear-gradient(135deg, #1a060d 0%, #2e1020 50%, #140614 100%)',
    glow: 'radial-gradient(ellipse at 20% 50%, rgba(255,70,110,0.12) 0%, transparent 60%)',
  },
  ocean: {
    label: '深海蓝',
    bg: 'linear-gradient(135deg, #030d1a 0%, #001830 50%, #03091a 100%)',
    glow: 'radial-gradient(ellipse at 50% 20%, rgba(0,120,255,0.15) 0%, transparent 60%)',
  },
}

const KEY = 'lover_prefs_v1'

function load(): Preferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

function save(p: Preferences) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(load)

  useEffect(() => { save(prefs) }, [prefs])

  const update = (patch: Partial<Preferences>) =>
    setPrefs(prev => ({ ...prev, ...patch }))

  return { prefs, update }
}
