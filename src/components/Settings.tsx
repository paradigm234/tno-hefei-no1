import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onBackToMenu: () => void;
  mode?: 'main' | 'ingame';
  onCloseInGameMenu?: () => void;
  onReturnToMainMenu?: () => void;
  onManualSave?: () => void;
  onLoadManualSave?: () => void;
  onLoadMonthlyAutoSave?: () => void;
  hasManualSave?: boolean;
  hasMonthlyAutoSave?: boolean;
}

interface Settings {
  masterVolume: number;
  gameSpeed: number;
}

type ConfirmAction = 'reset' | 'clear' | null;

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 100,
  gameSpeed: 1,
};

export default function Settings({
  onBackToMenu,
  mode = 'main',
  onCloseInGameMenu,
  onReturnToMainMenu,
  onManualSave,
  onLoadManualSave,
  onLoadMonthlyAutoSave,
  hasManualSave = false,
  hasMonthlyAutoSave = false,
}: SettingsProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [statusText, setStatusText] = useState<string>('');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
  };

  const handleVolumeChange = (value: number) => {
    const newSettings = { ...settings, masterVolume: value };
    saveSettings(newSettings);
    setStatusText('音量设置已更新。');
  };

  const handleGameSpeedChange = (value: number) => {
    const newSettings = { ...settings, gameSpeed: value };
    saveSettings(newSettings);
    setStatusText('游戏速度设置已更新。');
  };

  const handleResetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS);
    setConfirmAction(null);
    setStatusText('设置已恢复默认值。');
  };

  const handleResetGameData = () => {
    localStorage.removeItem('gameState');
    localStorage.removeItem('manualSave');
    localStorage.removeItem('autoSaveMonthly');
    localStorage.removeItem('autoSaveMonthlyMeta');
    localStorage.removeItem('gameSettings');
    setConfirmAction(null);
    setStatusText('存档与本地设置已清除。');
  };

  useEffect(() => {
    if (!statusText) return;
    const timer = setTimeout(() => setStatusText(''), 2200);
    return () => clearTimeout(timer);
  }, [statusText]);

  return (
    <div className="relative h-screen w-screen overflow-auto bg-[#070a12] text-tno-text crt">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(68,167,255,0.22),rgba(8,12,18,0.95)_58%)]" />

      {statusText && (
        <div className="fixed right-4 top-4 z-40 border border-cyan-300/70 bg-black/75 px-4 py-2 text-sm tracking-[0.06em] text-cyan-100">
          {statusText}
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 border border-cyan-300/45 bg-black/55 p-5 backdrop-blur-sm md:mb-8 md:p-7">
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-cyan-200/85 md:text-sm">System Control</p>
          <h1
            className="text-3xl font-black tracking-[0.1em] text-white md:text-5xl"
            style={{ textShadow: '0 0 18px rgba(82,172,255,0.3), 0 0 30px rgba(255,78,126,0.2)' }}
          >
            {mode === 'ingame' ? '游戏菜单' : '设置中心'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/82 md:text-base">
            {mode === 'ingame'
              ? '你可以在此进行手动存档、读取月度自动存档、调整系统参数，或返回主界面。'
              : '调整体验参数与存档策略。每个选项都会即时写入本地配置，建议在开局前完成设定。'}
          </p>
        </div>

        {mode === 'ingame' && (
          <section className="mb-5 border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <h2 className="mb-3 text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">存档操作</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                onClick={() => {
                  onManualSave?.();
                  setStatusText('手动存档已完成。');
                }}
                className="border border-cyan-300/70 bg-cyan-500/10 px-4 py-3 text-sm font-bold tracking-[0.08em] text-cyan-100 transition-all duration-300 hover:bg-cyan-500/22"
              >
                手动存档
              </button>
              <button
                onClick={() => {
                  onLoadManualSave?.();
                }}
                disabled={!hasManualSave}
                className={`px-4 py-3 text-sm font-bold tracking-[0.08em] transition-all duration-300 ${
                  hasManualSave
                    ? 'border border-violet-300/70 bg-violet-500/10 text-violet-100 hover:bg-violet-500/22'
                    : 'cursor-not-allowed border border-zinc-600 bg-zinc-700/20 text-zinc-400'
                }`}
              >
                读取手动存档
              </button>
              <button
                onClick={() => {
                  onLoadMonthlyAutoSave?.();
                }}
                disabled={!hasMonthlyAutoSave}
                className={`px-4 py-3 text-sm font-bold tracking-[0.08em] transition-all duration-300 ${
                  hasMonthlyAutoSave
                    ? 'border border-emerald-300/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/22'
                    : 'cursor-not-allowed border border-zinc-600 bg-zinc-700/20 text-zinc-400'
                }`}
              >
                读取月度自动存档
              </button>
            </div>
            <p className="mt-3 text-sm text-white/70">
              自动存档策略已调整为：每个月自动存档一次，并覆盖上一份月度自动存档。
            </p>
            <p className="mt-1 text-xs text-white/55">
              即时存档快捷键：F5 存档，F9 读档。
            </p>
          </section>
        )}

        <div className="space-y-5">
          <section className="border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">主音量</h2>
              <span className="text-base font-semibold text-white md:text-lg">{settings.masterVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#58d9ff' }}
            />
            <p className="mt-2 text-sm text-white/70">控制背景音乐与事件音效总音量。</p>
          </section>

          <section className="border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <h2 className="text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">自动存档策略</h2>
            <p className="mt-1 text-sm text-white/75">已取消每日自动存档，改为每月自动存档一次（覆盖旧自动存档）。</p>
            <p className="mt-1 text-xs text-white/55">该策略为全局固定策略，无需手动开关。</p>
          </section>

          <section className="border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">游戏速度</h2>
              <select
                value={settings.gameSpeed}
                onChange={(e) => handleGameSpeedChange(Number(e.target.value))}
                className="border border-cyan-200 bg-black/80 px-3 py-2 text-sm text-cyan-100 outline-none md:text-base"
              >
                <option value={0.5}>0.5x | 慢速</option>
                <option value={1}>1.0x | 标准</option>
                <option value={1.5}>1.5x | 快速</option>
                <option value={2}>2.0x | 极速</option>
              </select>
            </div>
            <p className="text-sm text-white/70">影响时间推进节奏，不改变事件触发逻辑。</p>
          </section>

          <section className="border border-pink-300/45 bg-black/62 p-5 md:p-6">
            <h2 className="mb-3 text-lg font-bold tracking-[0.08em] text-pink-200 md:text-xl">数据管理</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setConfirmAction('reset')}
                className="border border-pink-300/60 bg-pink-500/10 px-4 py-3 text-sm font-bold tracking-[0.08em] text-pink-100 transition-all duration-300 hover:bg-pink-500/22"
              >
                重置设置为默认
              </button>
              <button
                onClick={() => setConfirmAction('clear')}
                className="border border-red-300/65 bg-red-500/10 px-4 py-3 text-sm font-bold tracking-[0.08em] text-red-100 transition-all duration-300 hover:bg-red-500/22"
              >
                清除全部存档
              </button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-8">
          {mode === 'ingame' && (
            <button
              onClick={onCloseInGameMenu}
              className="border border-cyan-200 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-500/15 hover:text-white md:text-base"
            >
              返回游戏
            </button>
          )}
          {mode === 'ingame' ? (
            <button
              onClick={onReturnToMainMenu}
              className="border border-pink-300 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-pink-100 transition-all duration-300 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white md:text-base"
            >
              返回主界面
            </button>
          ) : (
            <button
              onClick={onBackToMenu}
              className="border border-cyan-200 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 transition-all duration-300 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white md:text-base"
            >
              返回主菜单
            </button>
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md border border-pink-300/65 bg-[#090d16] p-5 md:p-6">
            <h3 className="mb-3 text-xl font-bold tracking-[0.08em] text-pink-200 md:text-2xl">执行确认</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/82 md:text-base">
              {confirmAction === 'reset'
                ? '将把所有设置恢复为默认值。该操作可再次修改。'
                : '将清除本地全部存档与设置，且无法恢复。'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-100 transition-all duration-300 hover:bg-cyan-500/15"
              >
                取消
              </button>
              <button
                onClick={confirmAction === 'reset' ? handleResetToDefaults : handleResetGameData}
                className="border border-pink-300 bg-pink-500/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-pink-500/35"
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
