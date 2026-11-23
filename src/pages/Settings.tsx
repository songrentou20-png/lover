import { useRef, useState } from 'react'
import { ChevronRight, ChevronLeft, User, Bot, Palette, Upload, X } from 'lucide-react'
import type { Preferences } from '../hooks/usePreferences'
import { BG_PRESETS } from '../hooks/usePreferences'

interface Props {
  prefs: Preferences
  updatePrefs: (patch: Partial<Preferences>) => void
}

type SubPage = null | 'profile' | 'ai' | 'appearance'

// 读文件为 base64
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 头像组件（图片 or 文字）
function Avatar({
  imageUrl, text, size = 'w-16 h-16', textSize = 'text-xl',
  gradient = 'from-purple-400 to-blue-400',
}: {
  imageUrl: string; text: string; size?: string; textSize?: string; gradient?: string
}) {
  if (imageUrl) {
    return <img src={imageUrl} className={`${size} rounded-full object-cover`} />
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ${textSize}`}>
      {text || '？'}
    </div>
  )
}

// 头像上传区
function AvatarUploader({
  imageUrl, text, gradient, onImage, onClear,
}: {
  imageUrl: string; text: string; gradient: string
  onImage: (b64: string) => void; onClear: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await readFileAsBase64(file)
    onImage(b64)
    e.target.value = ''
  }
  return (
    <div className="flex flex-col items-center gap-3 py-5">
      <div className="relative">
        <Avatar imageUrl={imageUrl} text={text} gradient={gradient} size="w-20 h-20" textSize="text-2xl" />
        {imageUrl && (
          <button
            onClick={onClear}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <button
        onClick={() => ref.current?.click()}
        className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-white/70 hover:text-white transition-colors"
      >
        <Upload size={14} /> 上传图片
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// 分组容器
function Group({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-2xl overflow-hidden mb-5">{children}</div>
}

// 导航行（带图标）
function NavRow({ icon: Icon, label, sub, onPress, last }: {
  icon: typeof User; label: string; sub?: string; onPress: () => void; last?: boolean
}) {
  return (
    <button
      onClick={onPress}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors ${!last ? 'border-b border-white/[0.06]' : ''}`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-white/70" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm text-white">{label}</div>
        {sub && <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>}
      </div>
      <ChevronRight size={14} className="text-white/30" />
    </button>
  )
}

// 子页面顶部
function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <button onClick={onBack} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm">
        <ChevronLeft size={16} /> 返回
      </button>
      <span className="text-base font-semibold text-white ml-2">{title}</span>
    </div>
  )
}

// 文字输入行
function InputRow({ label, value, onChange, maxLength, placeholder, last }: {
  label: string; value: string; onChange: (v: string) => void
  maxLength?: number; placeholder?: string; last?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!last ? 'border-b border-white/[0.06]' : ''}`}>
      <span className="text-sm text-white/50 w-16 flex-shrink-0">{label}</span>
      <input
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/25"
      />
    </div>
  )
}

// ——— 主组件 ———
export default function Settings({ prefs, updatePrefs }: Props) {
  const [page, setPage] = useState<SubPage>(null)
  const wallpaperRef = useRef<HTMLInputElement>(null)

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await readFileAsBase64(file)
    updatePrefs({ wallpaper: b64 })
    e.target.value = ''
  }

  // ——— 主列表 ———
  if (page === null) {
    return (
      <div className="h-full overflow-y-auto px-4 py-5">
        <div className="text-base font-semibold text-white mb-5">设置</div>

        <Group>
          <NavRow icon={User} label="个人信息" sub={prefs.userName} onPress={() => setPage('profile')} />
          <NavRow icon={Bot} label="AI" sub={prefs.aiName} onPress={() => setPage('ai')} last />
        </Group>

        <Group>
          <NavRow icon={Palette} label="外观" sub="壁纸、毛玻璃" onPress={() => setPage('appearance')} last />
        </Group>

        <div className="text-center text-[11px] text-white/20 mt-4">更多设置即将上线</div>
      </div>
    )
  }

  // ——— 个人信息 ———
  if (page === 'profile') {
    return (
      <div className="h-full overflow-y-auto px-4 py-5">
        <SubHeader title="个人信息" onBack={() => setPage(null)} />
        <Group>
          <AvatarUploader
            imageUrl={prefs.userAvatar}
            text={prefs.userText}
            gradient="from-purple-400 to-blue-400"
            onImage={b64 => updatePrefs({ userAvatar: b64 })}
            onClear={() => updatePrefs({ userAvatar: '' })}
          />
        </Group>
        <Group>
          <InputRow label="头像字" value={prefs.userText} onChange={v => updatePrefs({ userText: v.slice(0, 2) })} maxLength={2} placeholder="1-2字" />
          <InputRow label="昵称" value={prefs.userName} onChange={v => updatePrefs({ userName: v })} maxLength={10} placeholder="你的名字" last />
        </Group>
      </div>
    )
  }

  // ——— AI ———
  if (page === 'ai') {
    return (
      <div className="h-full overflow-y-auto px-4 py-5">
        <SubHeader title="AI" onBack={() => setPage(null)} />
        <Group>
          <AvatarUploader
            imageUrl={prefs.aiAvatar}
            text={prefs.aiText}
            gradient="from-purple-500 to-blue-500"
            onImage={b64 => updatePrefs({ aiAvatar: b64 })}
            onClear={() => updatePrefs({ aiAvatar: '' })}
          />
        </Group>
        <Group>
          <InputRow label="头像字" value={prefs.aiText} onChange={v => updatePrefs({ aiText: v.slice(0, 2) })} maxLength={2} placeholder="1-2字" />
          <InputRow label="名称" value={prefs.aiName} onChange={v => updatePrefs({ aiName: v })} maxLength={12} placeholder="显示名称" last />
        </Group>
      </div>
    )
  }

  // ——— 外观 ———
  if (page === 'appearance') {
    const glassVal = prefs.glassOpacity
    const glassAlpha = (0.02 + (glassVal / 100) * 0.18).toFixed(2)
    return (
      <div className="h-full overflow-y-auto px-4 py-5">
        <SubHeader title="外观" onBack={() => setPage(null)} />

        {/* 壁纸 */}
        <div className="text-[11px] text-white/40 font-medium uppercase tracking-widest px-1 mb-2">壁纸</div>
        <Group>
          {/* 预设 */}
          <div className="px-4 pt-4 pb-3">
            <div className="text-sm text-white/50 mb-3">预设主题</div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(BG_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => updatePrefs({ bgPreset: key, wallpaper: '' })}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-full aspect-square rounded-xl border-2 transition-all duration-150 ${
                      prefs.bgPreset === key && !prefs.wallpaper
                        ? 'border-white/70 scale-105 shadow-lg shadow-white/10'
                        : 'border-transparent hover:border-white/30'
                    }`}
                    style={{ background: preset.bg }}
                  />
                  <span className="text-[10px] text-white/40">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.06] mx-4" />

          {/* 自定义壁纸 */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-sm text-white">自定义壁纸</div>
              {prefs.wallpaper && <div className="text-[11px] text-green-400 mt-0.5">已设置</div>}
            </div>
            <div className="flex items-center gap-2">
              {prefs.wallpaper && (
                <button onClick={() => updatePrefs({ wallpaper: '' })}
                  className="text-xs text-white/40 hover:text-red-400 transition-colors">
                  移除
                </button>
              )}
              <button
                onClick={() => wallpaperRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-sm text-white/70 hover:text-white transition-colors"
              >
                <Upload size={13} /> 上传
              </button>
            </div>
            <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
          </div>
        </Group>

        {/* 毛玻璃 */}
        <div className="text-[11px] text-white/40 font-medium uppercase tracking-widest px-1 mb-2">界面</div>
        <Group>
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm text-white">毛玻璃透明度</span>
              <span className="text-xs text-white/30 tabular-nums">{glassAlpha}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/25">透</span>
              <input
                type="range" min={0} max={100} value={glassVal}
                onChange={e => updatePrefs({ glassOpacity: Number(e.target.value) })}
                className="flex-1 accent-purple-400 h-1 cursor-pointer"
              />
              <span className="text-xs text-white/25">厚</span>
            </div>
          </div>
        </Group>
      </div>
    )
  }

  return null
}
