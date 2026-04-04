import React from 'react';
import { Scale, Activity, Users, FileText, Pause, Play } from 'lucide-react';
import { GameState } from '../types';

interface TopBarProps {
  state: GameState;
  togglePause: () => void;
  setGameSpeed: (speed: number) => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  hasQuickSave: boolean;
}

export default function TopBar({ state, togglePause, setGameSpeed, onQuickSave, onQuickLoad, hasQuickSave }: TopBarProps) {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
  };

  return (
    <div className="h-12 border-b border-tno-border bg-tno-panel flex items-center justify-between px-4 shrink-0 relative z-50">
      <div className="flex items-center gap-6">
        {/* PP */}
        <div className="flex items-center gap-2 group relative cursor-help">
          <Scale className="w-4 h-4 text-tno-highlight" />
          <span className={`font-bold ${state.stats.pp < 0 ? 'text-tno-red crt-flicker' : 'text-tno-text'}`}>
            {Math.floor(state.stats.pp)}
          </span>
          <div className="absolute top-full left-0 mt-2 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-xs">
            <div className="text-tno-highlight mb-1 border-b border-tno-border pb-1">政治点数 (PP)</div>
            <div className="flex justify-between"><span>基础产出:</span><span className="text-tno-green">+1.0/天</span></div>
            <div className="flex justify-between"><span>修正产出:</span><span className={state.modifiers.ppDaily >= 0 ? 'text-tno-green' : 'text-tno-red'}>{state.modifiers.ppDaily > 0 ? '+' : ''}{state.modifiers.ppDaily.toFixed(1)}/天</span></div>
          </div>
        </div>

        {/* STAB */}
        <div className="flex items-center gap-2 group relative cursor-help">
          <Activity className="w-4 h-4 text-tno-text" />
          <span className={`font-bold ${state.stats.stab < 30 ? 'text-tno-red crt-flicker' : 'text-tno-text'}`}>
            {Math.floor(state.stats.stab)}%
          </span>
          <div className="absolute top-full left-0 mt-2 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-xs">
            <div className="text-tno-text mb-1 border-b border-tno-border pb-1">稳定度 (STAB)</div>
            <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.stabDaily >= 0 ? 'text-tno-green' : 'text-tno-red'}>{state.modifiers.stabDaily > 0 ? '+' : ''}{state.modifiers.stabDaily.toFixed(1)}%</span></div>
          </div>
        </div>

        {/* SS */}
        <div className="flex items-center gap-2 group relative cursor-help">
          <Users className="w-4 h-4 text-tno-text" />
          <span className="font-bold text-tno-text">
            {Math.floor(state.stats.ss)}%
          </span>
          <div className="absolute top-full left-0 mt-2 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-xs">
            <div className="text-tno-text mb-1 border-b border-tno-border pb-1">学生支持度 (SS)</div>
            <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.ssDaily >= 0 ? 'text-tno-green' : 'text-tno-red'}>{state.modifiers.ssDaily > 0 ? '+' : ''}{state.modifiers.ssDaily.toFixed(1)}%</span></div>
          </div>
        </div>

        {/* TPR */}
        <div className="flex items-center gap-2 group relative cursor-help">
          <FileText className="w-4 h-4 text-tno-text" />
          <span className={`font-bold ${state.stats.tpr <= 0 ? 'text-tno-red crt-flicker' : 'text-tno-text'}`}>
            {Math.floor(state.stats.tpr)}
          </span>
          <div className="absolute top-full left-0 mt-2 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-xs">
            <div className="text-tno-text mb-1 border-b border-tno-border pb-1">卷子储备量 (TPR)</div>
            <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.tprDaily >= 0 ? 'text-tno-green' : 'text-tno-red'}>{state.modifiers.tprDaily > 0 ? '+' : ''}{state.modifiers.tprDaily.toFixed(1)}</span></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-tno-highlight font-bold tracking-widest">
          {formatDate(state.date)}
        </div>
        <div className="flex items-center gap-1 border border-tno-border p-1 bg-zinc-900/50">
          <button
            onClick={onQuickSave}
            className="px-2 py-0.5 text-xs font-bold text-cyan-200 hover:text-white hover:bg-cyan-500/20 transition-colors"
            title="即时存档 (F5)"
          >
            即存
          </button>
          <button
            onClick={onQuickLoad}
            disabled={!hasQuickSave}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${hasQuickSave ? 'text-emerald-200 hover:text-white hover:bg-emerald-500/20' : 'text-zinc-500 cursor-not-allowed'}`}
            title="读取即时存档 (F9)"
          >
            读档
          </button>
        </div>
        <div className="flex items-center gap-1 border border-tno-border p-1 bg-zinc-900/50">
          <button 
            onClick={() => setGameSpeed(1)}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${state.gameSpeed === 1 ? 'bg-tno-highlight text-black' : 'text-tno-text hover:text-tno-highlight'}`}
          >
            &gt;
          </button>
          <button 
            onClick={() => setGameSpeed(2)}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${state.gameSpeed === 2 ? 'bg-tno-highlight text-black' : 'text-tno-text hover:text-tno-highlight'}`}
          >
            &gt;&gt;
          </button>
          <button 
            onClick={() => setGameSpeed(3)}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${state.gameSpeed === 3 ? 'bg-tno-highlight text-black' : 'text-tno-text hover:text-tno-highlight'}`}
          >
            &gt;&gt;&gt;
          </button>
        </div>
        <button 
          onClick={togglePause}
          className="p-1 border border-tno-border hover:border-tno-highlight hover:text-tno-highlight transition-colors"
        >
          {state.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
