import React, { useState } from 'react';
import { UserPlus, Flag, BookOpen } from 'lucide-react';
import { GameState, Advisor } from '../types';
import { getAdvisorPortraitUrl, getLeaderPortraitUrl } from '../config/assets';

interface LeftSidebarProps {
  state: GameState;
  hireAdvisor: (slotIndex: number, advisor: Advisor) => void;
  dismissAdvisor: (slotIndex: number) => void;
  cancelActiveFocus: () => void;
  triggerError: () => void;
  toggleFocusTree: () => void;
  onOpenAssembly?: () => void;
  onOpenReformCommittee?: () => void;
}

const AVAILABLE_ADVISORS: Advisor[] = [
  {
    id: 'zhou_chen',
    title: '陈栋时代遗老',
    name: '周晨',
    description: '每日权力平衡 -0.05，每日学生理智度 +2，每日研发质量 +0.5。',
    cost: 25,
    modifiers: { powerBalanceDaily: -0.05, studentSanityDaily: 2, rndQualityDaily: 0.5 }
  },
  {
    id: 'li_jingkai',
    title: '及第资本合伙人',
    name: '李竞凯',
    description: '每日GDP增长 +3%，每日政治点数 +0.2。',
    cost: 150,
    modifiers: { gdpGrowthDaily: 0.03, ppDaily: 0.2 }
  },
  {
    id: 'you_guanglei',
    title: '陈栋的副手',
    name: '尤光雷',
    description: '每日政治点数 +0.5，每日学生理智度 +0.25。',
    cost: 25,
    modifiers: { ppDaily: 0.5, studentSanityDaily: 0.25 }
  },
  {
    id: 'wu_fujun',
    title: '教务督导',
    name: '吴福军',
    description: '每日稳定度 +0.2%，学生支持度 -0.2%。',
    cost: 150,
    modifiers: { stabDaily: 0.2, ssDaily: -0.2 }
  },
  {
    id: 'yang_yule',
    title: '特级教师',
    name: '杨玉乐',
    description: '政治点数获取 +5%，卷子储备每日 +2。',
    cost: 150,
    modifiers: { ppDaily: 0.05, tprDaily: 2 }
  },
  {
    id: 'jiang_haobang',
    title: '意识形态教员',
    name: '豪邦',
    description: '每日联盟团结度 +0.05%，每周先锋党员 +1，自社派每周忠诚度 +5。',
    cost: 100,
    modifiers: { allianceUnityDaily: 0.05 }
  },
  {
    id: 'wang_juanhao_vanguard',
    title: '红色先锋',
    name: '王卷豪',
    description: '每日试卷储备量 +5，B3教学楼所有任务成功率固定 +30%。',
    cost: 100,
    modifiers: { tprDaily: 5 }
  },
  {
    id: 'wang_zhaokai_advisor',
    title: '联合革命委员会主席',
    name: '王兆凯',
    description: '每日激进愤怒度 +0.1，每日党内集权度 +0.2，每日学生支持度 +0.2%。',
    cost: 150,
    modifiers: { radicalAngerDaily: 0.1, partyCentralizationDaily: 0.2, ssDaily: 0.2 }
  },
  {
    id: 'gouxiong_advisor',
    title: '二次元解构大师',
    name: '狗熊',
    description: '解锁狗熊线，每日稳定度 -0.2%，每日学生理智值 -0.5%。',
    cost: 150,
    modifiers: { stabDaily: -0.2, studentSanityDaily: -0.5 }
  },
  {
    id: 'jing_zhen',
    title: '胆小的自由派老师',
    name: '靖珍',
    description: '学生支持度 +0.3%，每日稳定度 -0.1%。',
    cost: 120,
    modifiers: { ssDaily: 0.3, stabDaily: -0.1 }
  },
  {
    id: 'zhang_chun',
    title: '年级部老好人',
    name: '张春',
    description: '每日稳定度 +0.05%，政治点数获取 +2%。',
    cost: 100,
    modifiers: { stabDaily: 0.05, ppDaily: 0.02 }
  },
  {
    id: 'feng_anbao_advisor',
    title: '及第教育顾问',
    name: '封安保',
    description: '每日稳定度 +0.1%，每日资本渗透度 +0.5%。',
    cost: 150,
    modifiers: { stabDaily: 0.1, capitalPenetrationDaily: 0.5 }
  },
  {
    id: 'jidi_ceo',
    title: '小企业投资人',
    name: '方田',
    description: '每日GDP增长 +2%，每日学生理智度 -1。',
    cost: 150,
    modifiers: { gdpGrowthDaily: 0.02, studentSanityDaily: -1 }
  },
  {
    id: 'hitachi_expert',
    title: '日立管理学专家',
    name: '刘守强',
    description: '每日做题家产出 +50，每日稳定度 +0.1%。',
    cost: 150,
    modifiers: { tprDaily: 50, stabDaily: 0.1 }
  },
  {
    id: 'data_analyst',
    title: '首席数据分析师',
    name: '盛为民',
    description: '每日研发质量 +1，每日政治点数 +0.5。',
    cost: 150,
    modifiers: { rndQualityDaily: 1, ppDaily: 0.5 }
  },
  {
    id: 'lu_bohan',
    title: '极权反做题派',
    name: '吕波汉',
    description: '每日稳定度 -0.1，每日做题家产出 -10，每日政治点数 +0.5，极权派每周忠诚度 +3、每周执行力 +3。',
    cost: 150,
    modifiers: { stabDaily: -0.1, tprDaily: -10, ppDaily: 0.5 }
  },
  {
    id: 'shi_ji',
    title: '去中心化安人',
    name: '时纪',
    description: '每日稳定度 -0.3，每日政治点数 +0.3，每日联盟团结度 +0.3，安那其派每周忠诚度 +4。',
    cost: 150,
    modifiers: { stabDaily: -0.3, ppDaily: 0.3, allianceUnityDaily: 0.3 }
  },
  {
    id: 'zhou_hongbing',
    title: '真左哲人王',
    name: '周红兵',
    description: '每日政治点数 -0.2，每日学生理智度 -0.2，每日做题家产出 +15，网哲派每周忠诚度 +3、每周执行力 -1。',
    cost: 150,
    modifiers: { ppDaily: -0.2, studentSanityDaily: -0.2, tprDaily: 15 }
  }
];

const getFactionName = (key: string) => {
  switch(key) {
    case 'radical_socialism': return '真左派';
    case 'authoritarian': return '校方建制派';
    case 'liberal': return '自由派';
    case 'reactionary': return '反动派';
    case 'anarcho_capitalism': return '及第资本';
    case 'deconstructivism': return '二次元解构派';
    case 'test_taking': return '做题派';
    default: return '未知';
  }
};

const getFactionDescription = (key: string) => {
  switch(key) {
    case 'radical_socialism': return '主张彻底推翻现有的应试教育体制，建立学生自治的苏维埃。';
    case 'authoritarian': return '主张维持高压秩序，通过严格的纪律和管理来保证升学率。';
    case 'liberal': return '主张温和改革，在保证成绩的前提下争取更多的学生权利。';
    case 'reactionary': return '极端保守派，认为现有的压迫还不够，主张恢复更古老的体罚和连坐制度。';
    case 'anarcho_capitalism': return '主张一切教育资源市场化，金钱决定一切。';
    case 'deconstructivism': return '主张解构一切宏大叙事，沉浸在亚文化与虚无之中。';
    case 'test_taking': return '主张分数至上，一切为了高考，排斥任何干扰学习的活动。';
    default: return '';
  }
};

export default function LeftSidebar({ state, hireAdvisor, dismissAdvisor, cancelActiveFocus, triggerError, toggleFocusTree, onOpenAssembly, onOpenReformCommittee }: LeftSidebarProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const hasAssemblyMechanic = state.flags.assembly_unlocked
    || state.completedFocuses.includes('convene_assembly')
    || state.nationalSpirits.some(spirit => spirit.id === 'assembly_dynamics')
    || !!state.parliamentState;
  const canOpenAssembly = hasAssemblyMechanic && (!state.flags['lu_nkpd_mode'] || state.currentFocusTree === 'treeA_haobang');

  const getAdvisorCost = (advisor: Advisor) => {
    if (state.flags.yang_yule_cheap_advisors && state.leader.name === '杨玉乐') {
      return Math.floor(advisor.cost / 2);
    }
    return advisor.cost;
  };

  const handleHire = (advisor: Advisor) => {
    if (selectedSlot === null) return;
    const cost = getAdvisorCost(advisor);
    if (state.stats.pp < cost) {
      triggerError();
      return;
    }
    hireAdvisor(selectedSlot, { ...advisor, cost });
    setSelectedSlot(null);
  };

  // Calculate pie chart segments
  const totalIdeology = Object.values(state.ideologies).reduce((a, b) => a + b, 0);
  let currentAngle = 0;
  const pieSegments = Object.entries(state.ideologies).map(([key, value]) => {
    const percentage = (value / totalIdeology) * 100;
    const startAngle = currentAngle;
    currentAngle += percentage;
    let color = '';
    switch(key) {
      case 'radical_socialism': color = '#ef4444'; break; // red-500
      case 'authoritarian': color = '#3f3f46'; break; // zinc-700
      case 'liberal': color = '#3b82f6'; break; // blue-500
      case 'reactionary': color = '#581c87'; break; // purple-900 (深紫色)
      case 'anarcho_capitalism': color = '#eab308'; break; // yellow-500
      case 'deconstructivism': color = '#c084fc'; break; // purple-400 (浅紫色)
      case 'test_taking': color = '#9ca3af'; break; // gray-400
      default: color = '#a1a1aa';
    }
    return { key, percentage, startAngle, color, name: getFactionName(key), description: getFactionDescription(key) };
  });

  const conicGradient = pieSegments.map(s => `${s.color} ${s.startAngle}% ${s.startAngle + s.percentage}%`).join(', ');

  return (
    <div className="w-80 flex-shrink-0 tno-panel border-r border-tno-border h-full flex flex-col relative z-10 overflow-y-auto">
      
      {/* Header */}
      <div className="p-3 border-b border-tno-border bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-tno-highlight" />
          <span className="font-bold text-lg tracking-wider">合肥一中</span>
        </div>
        <div className="flex flex-col gap-1">
          {canOpenAssembly && (
            <button 
              onClick={onOpenAssembly}
              className="text-xs border border-tno-highlight text-tno-highlight hover:bg-tno-highlight hover:text-black px-2 py-1 transition-colors"
              title="召开学生代表大会"
            >
              学生大会
            </button>
          )}
          {state.flags['reform_unlocked'] && (
            <button 
              onClick={onOpenReformCommittee}
              className="text-xs border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black px-2 py-1 transition-colors crt-flicker"
              title="全面做题改革委员会"
            >
              做题改革
            </button>
          )}
        </div>
      </div>

      {/* Leader & Ideology Section */}
      <div className="p-4 border-b border-tno-border flex gap-4">
        {/* Portrait */}
        <div className="relative group cursor-help">
          <div className="w-28 h-36 border-2 border-tno-border relative overflow-hidden bg-zinc-900 flex-shrink-0">
             <div className="absolute inset-0 bg-cover bg-center opacity-88" style={{ backgroundImage: `url('${getLeaderPortraitUrl(state.leader.portrait)}')` }}></div>
             <div className="absolute inset-0 bg-black/8"></div>
          </div>
          <div className="mt-1 border border-tno-border bg-black/70 py-1 text-center text-[11px] font-bold text-tno-highlight">
            {state.leader.name}
          </div>
           
           {/* Leader Tooltip */}
           <div className="absolute top-full left-0 mt-2 w-56 bg-tno-bg border border-tno-border p-3 hidden group-hover:block z-[100] shadow-lg">
             <div className="font-bold text-tno-highlight text-sm mb-1 border-b border-tno-border pb-1">{state.leader.name}</div>
             {state.leader.name === '空缺' ? (
               <div className="text-red-600 text-2xl font-black mb-2 leading-relaxed whitespace-normal text-center py-4 tracking-widest" style={{ textShadow: '0 0 10px rgba(220, 38, 38, 0.8)' }}>
                 {state.leader.description}
               </div>
             ) : (
               <div className="text-xs text-tno-text/80 mb-2 leading-relaxed whitespace-normal">{state.leader.description || '暂无描述'}</div>
             )}
             {state.leader.buffs && state.leader.buffs.length > 0 && (
               <div className="text-[10px] space-y-1 border-t border-tno-border/50 pt-2">
                 <div className="text-tno-highlight font-bold mb-1">领袖特质:</div>
                 {state.leader.buffs.map((buff, i) => (
                   <div key={i} className="text-tno-green flex items-start gap-1 whitespace-normal">
                     <span className="text-tno-highlight mt-0.5">•</span> {buff}
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs text-tno-text/60 mb-1">{state.leader.title}</div>
            <div className="text-sm font-bold text-tno-highlight mb-2">{getFactionName(state.leader.ideology)}</div>
          </div>
          
          {/* Pie Chart */}
          <div className="flex items-start gap-3">
            <div 
              className="w-20 h-20 rounded-full border-2 border-tno-border relative group shadow-[0_0_12px_rgba(0,0,0,0.45)]"
              style={{ background: `conic-gradient(${conicGradient})` }}
            >
              {/* Tooltip for pie chart */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-tno-panel border border-tno-border p-3 hidden group-hover:block z-50">
                <div className="text-sm font-bold text-tno-text mb-2 border-b border-tno-border pb-1">意识形态分布</div>
                {pieSegments.map(s => (
                  <div key={s.key} className="mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs" style={{ color: s.color }}>
                      <div className="w-2.5 h-2.5" style={{ backgroundColor: s.color }}></div>
                      {s.name} ({s.percentage.toFixed(0)}%)
                    </div>
                    <div className="text-[11px] text-tno-text/70 leading-tight pl-4">{s.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col text-[10px] space-y-0.5">
              <div className="text-[10px] text-tno-text/60 mb-0.5">占比速览</div>
              {pieSegments.map(s => (
                <div key={s.key} className="flex items-center gap-1">
                  <div className="w-2 h-2" style={{ backgroundColor: s.color }}></div>
                  <span className="truncate max-w-[82px]">{s.name} {s.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* National Spirits */}
      <div className="p-3 border-b border-tno-border">
        <div className="text-xs text-tno-text/60 mb-2 uppercase tracking-widest">国家精神</div>
        <div className="flex flex-wrap gap-2">
          {state.nationalSpirits.map((spirit, index) => (
            <div 
              key={spirit.id} 
              className={`w-10 h-10 border flex items-center justify-center group relative cursor-help
                ${spirit.type === 'negative' ? 'border-tno-red bg-tno-red/10 text-tno-red' : 
                  spirit.type === 'positive' ? 'border-tno-green bg-tno-green/10 text-tno-green' : 
                  'border-tno-highlight bg-tno-highlight/10 text-tno-highlight'}`}
            >
              <span className="text-xs font-bold">{spirit.name.substring(0,2)}</span>
              
              {/* Tooltip */}
              <div className={`absolute top-full ${index % 6 < 3 ? 'left-0' : 'right-0'} mt-2 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50`}>
                <div className={`font-bold text-sm mb-1 ${spirit.type === 'positive' ? 'text-tno-green' : spirit.type === 'negative' ? 'text-tno-red' : 'text-tno-highlight'}`}>{spirit.name}</div>
                <div className="text-xs text-tno-text/80 space-y-0.5">
                  {spirit.effects && Object.entries(spirit.effects).map(([effectKey, val]) => {
                    const isPositive = val > 0;
                    let colorClass = isPositive ? 'text-tno-green' : 'text-tno-red';
                    if (effectKey === 'powerBalanceDaily') {
                      colorClass = isPositive ? 'text-tno-red' : 'text-tno-green';
                    }
                    const sign = isPositive ? '+' : '';
                    let label = effectKey;
                    let suffix = '';
                    switch(effectKey) {
                      case 'stabDaily': label = '每日稳定度'; suffix = '%'; break;
                      case 'ppDaily': label = '每日PP'; break;
                      case 'ssDaily': label = '每日学生支持度'; suffix = '%'; break;
                      case 'tprDaily': label = '每日TPR'; break;
                      case 'studentSanityDaily': label = '每日学生理智值'; suffix = '%'; break;
                      case 'capitalPenetrationDaily': label = '每日资本渗透度'; suffix = '%'; break;
                      case 'defenseBonus': label = '防御加成'; suffix = '%'; break;
                      case 'powerBalanceDaily': label = '每日权力平衡'; break;
                    }
                    const displayVal = effectKey === 'defenseBonus' ? val * 100 : val;
                    let formattedVal = Number(displayVal).toFixed(3);
                    if (formattedVal.includes('.')) {
                      formattedVal = formattedVal.replace(/\.?0+$/, '');
                    }
                    if (formattedVal === '') formattedVal = '0';
                    return (
                      <div key={effectKey} className="pl-4 flex items-center">
                        <span>{label}：</span>
                        <span className={colorClass}>{sign}{formattedVal}{suffix}</span>
                      </div>
                    );
                  })}
                  {!spirit.effects && <div className="pl-4">{spirit.description}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Focus */}
      <div className="p-3 border-b border-tno-border">
        <div className="text-xs text-tno-text/60 mb-2 uppercase tracking-widest">当前国策</div>
        <div className="space-y-2">
          <button 
            onClick={toggleFocusTree}
            className="w-full border border-tno-border bg-zinc-900/50 hover:bg-zinc-800 p-3 flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-black border border-tno-border flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-tno-highlight" />
            </div>
            <div className="flex-1 overflow-hidden">
              {state.activeFocus ? (
                <>
                  <div className="text-sm font-bold text-tno-highlight truncate">{state.activeFocus.id}</div>
                  <div className="w-full bg-black h-1.5 mt-2 border border-tno-border">
                    <div 
                      className="bg-tno-highlight h-full transition-all duration-1000"
                      style={{ width: `${((state.activeFocus.totalDays - state.activeFocus.daysLeft) / state.activeFocus.totalDays) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-right mt-1">{state.activeFocus.daysLeft} 天</div>
                </>
              ) : (
                <div className="text-sm text-tno-text/60 italic">未选择国策</div>
              )}
            </div>
          </button>
          {state.activeFocus && (
            <button
              onClick={cancelActiveFocus}
              className="w-full border border-tno-red bg-tno-red/10 hover:bg-tno-red/20 text-tno-red px-3 py-1.5 text-xs font-bold tracking-wider transition-colors"
            >
              取消当前国策
            </button>
          )}
        </div>
      </div>

      {/* Cabinet */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-xs text-tno-text/60 mb-2 uppercase tracking-widest">内阁与顾问</div>
        <div className="space-y-2 flex-1">
          {[0, 1, 2, 3].map((slotIndex) => {
            const advisor = state.advisors[slotIndex];
            return (
              <div key={slotIndex} className="border border-tno-border bg-tno-bg p-2 relative group">
                {advisor ? (
                  <div className="flex gap-3">
                    <div className="w-12 h-16 bg-zinc-900 border border-tno-border flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-luminosity" style={{ backgroundImage: `url('${getAdvisorPortraitUrl(advisor.portrait, advisor.id)}')` }}></div>
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                      <div>
                        <div className="text-[9px] text-tno-text/60 mb-0.5">{advisor.title}</div>
                        <div className="text-xs font-bold text-tno-highlight">{advisor.name}</div>
                      </div>
                      <div className="text-[9px] text-tno-green leading-tight">{advisor.description}</div>
                    </div>
                    <button
                      onClick={() => dismissAdvisor(slotIndex)}
                      className="absolute right-2 top-2 border border-tno-red/70 bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-tno-red hover:bg-tno-red/20"
                    >
                      撤销
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedSlot(slotIndex)}
                    className="w-full h-16 flex flex-col items-center justify-center text-tno-text/40 hover:text-tno-highlight hover:border-tno-highlight border border-dashed border-tno-border transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">任命顾问 (150 PP)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hire Modal Overlay */}
      {selectedSlot !== null && (
        <div className="absolute inset-0 bg-black/95 z-20 p-4 flex flex-col border-l border-tno-border">
          <div className="flex justify-between items-center border-b border-tno-border pb-2 mb-4">
            <h3 className="text-tno-highlight font-bold">选择顾问</h3>
            <button onClick={() => setSelectedSlot(null)} className="text-tno-red hover:text-white text-sm">关闭</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {AVAILABLE_ADVISORS.filter(a => {
              if (a.id === 'zhou_chen' && !state.flags['chen_dong_veterans_unlocked'] && !state.flags['zhou_chen_unlocked']) return false;
              if (a.id === 'you_guanglei' && !state.flags['chen_dong_veterans_unlocked']) return false;
              if (a.id === 'li_jingkai' && !state.flags['li_jingkai_unlocked']) return false;
              if (a.id === 'feng_anbao_advisor' && !state.flags['feng_anbao_unlocked']) return false;
              if ((a.id === 'wang_zhaokai_advisor' || a.id === 'gouxiong_advisor') && !state.flags['b3_advisors_unlocked']) return false;
              if (a.id === 'jiang_haobang' && !state.flags['jiang_haobang_unlocked']) return false;
              if (a.id === 'wang_juanhao_vanguard' && state.reformState?.juanhaoAttitude !== 4) return false;
              if (a.id === 'jidi_ceo' && !state.flags['jidi_ceo_unlocked']) return false;
              if (a.id === 'hitachi_expert' && !state.flags['hitachi_expert_unlocked']) return false;
              if (a.id === 'data_analyst' && !state.flags['data_analyst_unlocked']) return false;
              if ((a.id === 'lu_bohan' || a.id === 'shi_ji' || a.id === 'zhou_hongbing') && !state.flags['true_left_advisors_unlocked']) return false;
              return !state.advisors.find(h => h?.id === a.id);
            }).map(advisor => (
              <button
                key={advisor.id}
                onClick={() => handleHire(advisor)}
                className="w-full text-left border border-tno-border p-3 hover:border-tno-highlight hover:bg-zinc-900 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-tno-text text-sm">{advisor.name}</span>
                  <span className={`text-xs ${state.stats.pp >= getAdvisorCost(advisor) ? 'text-tno-highlight' : 'text-tno-red'}`}>
                    {getAdvisorCost(advisor)} PP
                  </span>
                </div>
                <div className="text-[10px] text-tno-text/60 mb-2">{advisor.title}</div>
                <div className="text-[10px] text-tno-green">{advisor.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
