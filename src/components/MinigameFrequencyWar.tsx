import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Radio, ShieldAlert, AlertTriangle } from 'lucide-react';

interface MinigameFrequencyWarProps {
  state: GameState;
  onComplete: (success: boolean) => void;
  spendPP: (amount: number) => boolean;
}

export default function MinigameFrequencyWar({ state, onComplete, spendPP }: MinigameFrequencyWarProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [frequencies, setFrequencies] = useState([50, 50, 50]); // 0-100, target is 70-90
  const [interference, setInterference] = useState([0, 0, 0]); // 0-100
  const [firewallActive, setFirewallActive] = useState(false);
  const [shake, setShake] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Game Loop
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    gameLoopRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameLoopRef.current!);
          return 0;
        }
        return prev - 1;
      });

      // Randomly spawn interference
      setInterference(prev => prev.map(val => {
        if (Math.random() < 0.3) {
          return Math.min(100, val + Math.random() * 20);
        }
        return Math.max(0, val - 5);
      }));

      // Apply interference to frequencies
      setFrequencies(prev => prev.map((val, i) => {
        const drop = interference[i] * 0.1;
        return Math.max(0, val - drop);
      }));

    }, 1000);

    return () => clearInterval(gameLoopRef.current!);
  }, [interference, timeLeft, gameStarted]);

  useEffect(() => {
    if (timeLeft === 0) {
      checkWinCondition();
    }
  }, [timeLeft]);

  const checkWinCondition = () => {
    // Check if all frequencies are in the green zone (70-90) on average
    const avg = frequencies.reduce((a, b) => a + b, 0) / 3;
    if (avg >= 70) {
      onComplete(true);
    } else {
      onComplete(false);
    }
  };

  const handleSliderChange = (index: number, value: number) => {
    setFrequencies(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const activateFirewall = () => {
    if (spendPP(20)) {
      setFirewallActive(true);
      setInterference([0, 0, 0]);
      setTimeout(() => setFirewallActive(false), 3000);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 ${shake ? 'shake' : ''}`}>
      <div className="bg-tno-panel border-2 border-tno-highlight max-w-3xl w-full p-6 shadow-2xl shadow-tno-highlight/20 relative overflow-hidden flex flex-col">
        
        {!gameStarted && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-3xl font-bold text-tno-highlight mb-4 tracking-widest">准备接管广播站</h2>
            <p className="text-tno-text/80 mb-8 max-w-md">
              吴福军的保安队正在尝试切断电源并发送干扰信号。你需要在30秒内，将所有三个频段维持在绿色接管区域 (70-90)。
            </p>
            <button 
              onClick={() => setGameStarted(true)}
              className="bg-tno-highlight text-black font-bold py-3 px-8 text-xl hover:bg-white transition-colors"
            >
              开始行动
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-tno-highlight pb-4">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-tno-highlight crt-flicker" />
            <div>
              <h2 className="text-2xl font-bold text-tno-highlight tracking-widest">电波战：夺取校园之声</h2>
              <div className="text-xs text-tno-text/60">行政楼顶层广播站 - 频率劫持中</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-tno-red crt-flicker">{timeLeft}s</div>
            <div className="text-[10px] text-tno-text/60">剩余时间</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 text-sm text-tno-text/80 bg-zinc-900/50 p-4 border border-tno-border">
          <p>任务：将所有频段维持在绿色接管区域 (70-90)。</p>
          <p className="text-tno-red mt-1">警告：吴福军保安队正在尝试切断电源！红色干扰信号会降低频率。</p>
          <p className="text-tno-highlight mt-1">花费 20 PP 激活防火墙，清除所有干扰信号。</p>
        </div>

        {/* Sliders */}
        <div className="space-y-8 flex-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="relative">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-tno-text/60">频段 {i + 1} (FM {88 + i * 5}.0)</span>
                <span className={frequencies[i] >= 70 && frequencies[i] <= 90 ? 'text-tno-green font-bold' : 'text-tno-red'}>
                  {Math.round(frequencies[i])}%
                </span>
              </div>
              
              {/* Slider Track */}
              <div className="h-8 bg-zinc-900 border border-tno-border relative">
                {/* Target Zone */}
                <div className="absolute top-0 bottom-0 left-[70%] right-[10%] bg-tno-green/20 border-x border-tno-green"></div>
                {/* Danger Zone */}
                <div className="absolute top-0 bottom-0 left-0 right-[80%] bg-tno-red/20 border-r border-tno-red"></div>

                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={frequencies[i]}
                  onChange={(e) => handleSliderChange(i, Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {/* Custom Thumb */}
                <div 
                  className="absolute top-0 bottom-0 w-4 bg-tno-highlight border-2 border-black pointer-events-none transition-all duration-75"
                  style={{ left: `calc(${frequencies[i]}% - 8px)` }}
                ></div>
              </div>

              {/* Interference Indicator */}
              {interference[i] > 0 && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-tno-red crt-flicker flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{Math.round(interference[i])}%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 pt-4 border-t border-tno-border flex justify-between items-center">
          <div className="text-sm">
            当前 PP: <span className={state.stats.pp < 20 ? 'text-tno-red' : 'text-tno-highlight'}>{Math.floor(state.stats.pp)}</span>
          </div>
          <button 
            onClick={activateFirewall}
            disabled={firewallActive}
            className={`flex items-center gap-2 px-6 py-3 font-bold tracking-wider border transition-colors ${
              firewallActive 
                ? 'bg-zinc-800 border-zinc-600 text-zinc-500 cursor-not-allowed' 
                : 'bg-tno-red/10 border-tno-red text-tno-red hover:bg-tno-red hover:text-black'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            {firewallActive ? '防火墙冷却中...' : '激活防火墙 (20 PP)'}
          </button>
        </div>

      </div>
    </div>
  );
}
