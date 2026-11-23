import type { Preferences } from '../hooks/usePreferences'
import { BG_PRESETS } from '../hooks/usePreferences'

interface Props {
  prefs: Preferences
  updatePrefs: (patch: Partial<Preferences>) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] text-white/40 font-medium uppercase tracking-widest px-1 mb-2">
        {title}
      </div>
      <div className="glass rounded-2xl overflow-visible">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.06] last:border-0">
      <div className="text-sm text-white/50 w-20 flex-shrink-0">{label}</div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, maxLength = 10, placeholder }: {
  value: string
  onChange: (v: string) => void
  maxLength?: number
  placeholder?: string
}) {
  return (
    <input
      value={value}
      maxLength={maxLength}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/10 rounded-xl px-3 py-1.5 text-sm text-white outline-none border border-transparent focus:border-white/20 placeholder-white/25 transition-colors"
    />
  )
}

export default function Settings({ prefs, updatePrefs }: Props) {
  const glassVal = prefs.glassOpacity
  const glassAlpha = (0.02 + (glassVal / 100) * 0.18).toFixed(2)

  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      <div className="text-base font-semibold text-white mb-5">设置</div>

      {/* 个人信息 */}
      <Section title="个人信息">
        <div className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.06]">
          <div className="text-sm text-white/50 w-20 flex-shrink-0">我的头像</div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
              {prefs.userText || '？'}
            </div>
            <input
              value={prefs.userText}
              maxLength={2}
              onChange={e => updatePrefs({ userText: e.target.value.slice(0, 2) })}
              placeholder="1-2字"
              className="flex-1 bg-white/10 rounded-xl px-3 py-1.5 text-sm text-white outline-none border border-transparent focus:border-white/20 placeholder-white/25 transition-colors"
            />
          </div>
        </div>
        <Row label="我的昵称">
          <TextInput value={prefs.userName} onChange={v => updatePrefs({ userName: v })} placeholder="你的名字" />
        </Row>
      </Section>

      {/* AI 信息 */}
      <Section title="AI">
        <div className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.06]">
          <div className="text-sm text-white/50 w-20 flex-shrink-0">AI 头像</div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
              {prefs.aiText || '？'}
            </div>
            <input
              value={prefs.aiText}
              maxLength={2}
              onChange={e => updatePrefs({ aiText: e.target.value.slice(0, 2) })}
              placeholder="1-2字"
              className="flex-1 bg-white/10 rounded-xl px-3 py-1.5 text-sm text-white outline-none border border-transparent focus:border-white/20 placeholder-white/25 transition-colors"
            />
          </div>
        </div>
        <Row label="AI 名称">
          <TextInput
            value={prefs.aiName}
            onChange={v => updatePrefs({ aiName: v })}
            placeholder="显示名称"
          />
        </Row>
      </Section>

      {/* 外观 */}
      <Section title="外观">
        {/* 毛玻璃透明度 */}
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/50">毛玻璃透明度</span>
            <span className="text-xs text-white/30 tabular-nums">{glassAlpha}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/25">透</span>
            <input
              type="range"
              min={0}
              max={100}
              value={glassVal}
              onChange={e => updatePrefs({ glassOpacity: Number(e.target.value) })}
              className="flex-1 accent-purple-400 h-1 cursor-pointer"
            />
            <span className="text-xs text-white/25">厚</span>
          </div>
        </div>

        {/* 背景主题 */}
        <div className="px-4 py-4">
          <div className="text-sm text-white/50 mb-3">聊天背景</div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(BG_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => updatePrefs({ bgPreset: key })}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full aspect-square rounded-xl border-2 transition-all duration-150 ${
                    prefs.bgPreset === key
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
      </Section>

      <div className="text-center text-[11px] text-white/20 mt-2 pb-2">
        更多设置即将上线
      </div>
    </div>
  )
}
