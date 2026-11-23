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
      <div className="glass rounded-2xl overflow-hidden">{children}</div>
    </div>
  )
}

function AvatarEditor({
  label,
  text,
  onTextChange,
}: {
  label: string
  text: string
  onTextChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
        {text || '？'}
      </div>
      <div className="flex-1">
        <div className="text-sm text-white/80 mb-1.5">{label}</div>
        <input
          value={text}
          maxLength={2}
          onChange={e => onTextChange(e.target.value.slice(0, 2))}
          placeholder="1-2个字"
          className="w-full bg-white/10 rounded-xl px-3 py-1.5 text-sm text-white outline-none border border-transparent focus:border-white/20 placeholder-white/25 transition-colors"
        />
      </div>
    </div>
  )
}

export default function Settings({ prefs, updatePrefs }: Props) {
  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      <div className="text-base font-semibold text-white mb-5">设置</div>

      {/* 个人信息 */}
      <Section title="个人信息">
        <AvatarEditor
          label="我的头像文字"
          text={prefs.userText}
          onTextChange={v => updatePrefs({ userText: v })}
        />
        <div className="border-t border-white/8" />
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="text-sm text-white/50 w-16 flex-shrink-0">昵称</div>
          <input
            value={prefs.userName}
            maxLength={10}
            onChange={e => updatePrefs({ userName: e.target.value })}
            placeholder="你的名字"
            className="flex-1 bg-white/10 rounded-xl px-3 py-1.5 text-sm text-white outline-none border border-transparent focus:border-white/20 placeholder-white/25 transition-colors"
          />
        </div>
      </Section>

      {/* AI信息 */}
      <Section title="AI">
        <AvatarEditor
          label="AI 头像文字"
          text={prefs.aiText}
          onTextChange={v => updatePrefs({ aiText: v })}
        />
      </Section>

      {/* 聊天背景 */}
      <Section title="聊天背景">
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(BG_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => updatePrefs({ bgPreset: key })}
                className="relative flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full aspect-square rounded-xl border-2 transition-all ${
                    prefs.bgPreset === key
                      ? 'border-white/70 scale-105 shadow-lg shadow-white/10'
                      : 'border-transparent hover:border-white/30'
                  }`}
                  style={{ background: preset.bg }}
                />
                <span className="text-[10px] text-white/50">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <div className="text-center text-[11px] text-white/20 mt-6 pb-2">
        更多设置即将上线
      </div>
    </div>
  )
}
