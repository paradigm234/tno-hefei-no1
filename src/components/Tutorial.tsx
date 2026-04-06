import React, { useState } from 'react';
import { ASSET_URLS } from '../config/assets';
import { BookOpen, Settings, Map, Zap } from 'lucide-react';

interface TutorialProps {
  onBackToMenu: () => void;
}

export default function Tutorial({ onBackToMenu }: TutorialProps) {
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', label: '基础玩法与数值', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'systems', label: '国策、顾问与决议', icon: <Settings className="w-4 h-4" /> },
    { id: 'routes', label: '剧情路线与目标', icon: <Map className="w-4 h-4" /> },
    { id: 'mechanics', label: '特殊机制指南', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#070a12] text-tno-text crt flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={ASSET_URLS.ui_main_background}
          alt="Tutorial Background"
          className="h-full w-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_15%,rgba(255,76,131,0.12),rgba(6,10,18,0.96)_58%)]" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 border border-cyan-300/45 bg-black/55 p-5 backdrop-blur-sm shrink-0">
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-cyan-200/85">
            Operational Briefing
          </p>
          <h1
            className="text-3xl font-black tracking-[0.1em] text-white md:text-4xl"
            style={{ textShadow: '0 0 18px rgba(82,172,255,0.3), 0 0 30px rgba(255,78,126,0.2)' }}
          >
            合一风云：新手生存指南
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/82">
            欢迎来到合肥一中。在这里，你将扮演不同的学生领袖，在重重危机中推行你的理念。本手册将为你详细解析游戏的基础机制、路线分支与特殊玩法。
          </p>
        </div>

        <div className="flex flex-1 min-h-0 gap-6 flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 border text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 bg-cyan-900/40 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-black/40 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="font-bold tracking-wider text-sm">{tab.label}</span>
              </button>
            ))}
            
            <div className="mt-auto pt-4">
              <button
                onClick={onBackToMenu}
                className="w-full border border-pink-500/50 bg-black/60 px-4 py-3 text-sm font-bold tracking-widest text-pink-200 transition-all hover:bg-pink-900/40 hover:text-white"
              >
                返回主菜单
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 border border-cyan-300/30 bg-black/60 backdrop-blur-md overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {activeTab === 'basics' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">游戏目标</h2>
                  <p className="text-white/85 leading-relaxed">
                    在合肥一中这片充满矛盾的校园里，你将扮演不同的领导人（如潘仁越、王兆凯、狗熊等），通过推行政策、应对危机，最终达成你的政治或生存目标。游戏以时间推进，你需要时刻关注右上角的各项数值。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">核心数值解析</h2>
                  <div className="grid gap-4">
                    <div className="bg-white/5 p-4 border-l-2 border-yellow-400">
                      <h3 className="font-bold text-yellow-400 mb-1">PP (政治点数)</h3>
                      <p className="text-sm text-white/80">最重要的资源。用于点国策、雇佣顾问、执行决议。如果PP为负，你将寸步难行。每日会自动增长，但也会受到负面状态扣除。</p>
                    </div>
                    <div className="bg-white/5 p-4 border-l-2 border-blue-400">
                      <h3 className="font-bold text-blue-400 mb-1">TPR (做题力)</h3>
                      <p className="text-sm text-white/80">学校的根本产出。某些路线（如及第）极度依赖TPR，而某些路线（如真左）则试图摧毁它。过低的TPR会引来校方的严厉镇压。</p>
                    </div>
                    <div className="bg-white/5 p-4 border-l-2 border-green-400">
                      <h3 className="font-bold text-green-400 mb-1">稳定度 (Stability)</h3>
                      <p className="text-sm text-white/80">代表校园的秩序。稳定度过低会导致各种负面事件、暴乱，甚至直接Game Over。请务必将其保持在安全线（通常是50%）以上。</p>
                    </div>
                    <div className="bg-white/5 p-4 border-l-2 border-purple-400">
                      <h3 className="font-bold text-purple-400 mb-1">其他关键数值</h3>
                      <ul className="list-disc pl-5 text-sm text-white/80 space-y-1 mt-2">
                        <li><strong className="text-white">学生支持度</strong>：代表普通学生对你的认可。支持度高可以解锁特定选项，降低暴乱风险。</li>
                        <li><strong className="text-white">学生理智值</strong>：代表学生们的精神状态。理智值过低会导致极端事件频发。</li>
                        <li><strong className="text-white">激进愤怒度</strong>：特定路线（如真左派）的专属数值。过高会导致极左暴动，过低则改革停滞。</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'systems' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">国策树 (Focus Tree)</h2>
                  <p className="text-white/85 leading-relaxed mb-4">
                    国策是游戏推进的主轴。点击左侧边栏的“国策树”图标打开。每个国策需要消耗一定天数，完成后会提供强大的增益、触发关键剧情或解锁新机制。
                  </p>
                  <div className="bg-cyan-900/20 p-4 border border-cyan-500/30 text-sm text-cyan-100">
                    <strong>新手提示：</strong> 请务必保持国策始终在研究中。优先选择能缓解当前危机或解锁关键剧情的国策，而不是盲目追求数值加成。
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">顾问系统 (Advisors)</h2>
                  <p className="text-white/85 leading-relaxed mb-4">
                    在左侧边栏可以花费PP雇佣顾问。顾问不仅提供每日的数值加成（如每日PP+0.1，稳定度+0.2）。
                  </p>
                  <div className="bg-pink-900/20 p-4 border border-pink-500/30 text-sm text-pink-100">
                    <strong>隐藏机制：</strong> 某些特定顾问（如周晨、尤光雷、狗熊）在特定领导人执政时被雇佣，会触发专属的隐藏剧情，甚至解锁隐藏的国策分支！
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">决议与危机 (Decisions & Crises)</h2>
                  <p className="text-white/85 leading-relaxed">
                    在右侧边栏可以查看当前的决议和危机。
                  </p>
                  <ul className="list-disc pl-5 text-sm text-white/80 space-y-2 mt-3">
                    <li><strong>决议</strong>：消耗PP来换取短期收益或应对危机的手段。例如“镇压抗议”可以消耗PP换取稳定度。合理使用决议是度过资源真空期的关键。</li>
                    <li><strong>危机倒计时</strong>：屏幕右侧会显示当前的危机。如果倒计时结束前未能满足条件（通常是通过点特定国策或决议来解决），将会触发严重的惩罚甚至导致游戏失败。看到危机天数进入15天内，必须优先处理！</li>
                  </ul>
                </section>
              </div>
            )}

            {activeTab === 'routes' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">剧情路线概览</h2>
                  <p className="text-white/85 leading-relaxed mb-6">
                    游戏包含多条截然不同的剧情路线，通常在游戏初期的关键事件（如“B3起义”或“礼堂冲突”）中产生分歧。不同的路线有着完全不同的玩法和最终目标。
                  </p>

                  <div className="space-y-6">
                    <div className="border border-blue-500/30 bg-blue-900/10 p-5">
                      <h3 className="text-xl font-bold text-blue-400 mb-2">潘仁越路线（自由派/民主派）</h3>
                      <p className="text-sm text-white/80 mb-2"><strong>目标：</strong> 建立学生代表大会，实现校园民主化，调和各方矛盾。</p>
                      <p className="text-sm text-white/80"><strong>特点：</strong> 核心玩法是“学生代表大会”。你需要平衡各方势力（保皇派、激进派等），在议会中争取多数席位以通过法案。这是一条考验平衡木技巧的路线。</p>
                    </div>

                    <div className="border border-red-500/30 bg-red-900/10 p-5">
                      <h3 className="text-xl font-bold text-red-400 mb-2">王兆凯路线（真左派/先锋队）</h3>
                      <p className="text-sm text-white/80 mb-2"><strong>目标：</strong> 彻底推翻现有的做题体制，建立学生公社。</p>
                      <p className="text-sm text-white/80"><strong>特点：</strong> 核心玩法是“题改委”。你需要控制“激进愤怒度”，既要利用学生的怒火推进改革，又要防止怒火失控演变成极左暴动。武德充沛，对抗激烈。</p>
                    </div>

                    <div className="border border-gray-500/30 bg-gray-900/30 p-5">
                      <h3 className="text-xl font-bold text-gray-400 mb-2">杨玉乐路线（反动派派/保皇派）</h3>
                      <p className="text-sm text-white/80 mb-2"><strong>目标：</strong> 帮助特级教师杨玉乐评上正高级教师。</p>
                      <p className="text-sm text-white/80"><strong>特点：</strong> “软性维稳”的同时，镇压钢铁红蛤学生运动，保持老特级身体健康的同时努力评上正高级教师，为自己的脸面和教师生涯而战。</p>
                    </div>

                    <div className="border border-pink-500/30 bg-pink-900/10 p-5">
                      <h3 className="text-xl font-bold text-pink-400 mb-2">狗熊路线（抽象派/乐子人）</h3>
                      <p className="text-sm text-white/80 mb-2"><strong>目标：</strong> 将校园变成二次元的“地上天国”，进行赛博解构。</p>
                      <p className="text-sm text-white/80"><strong>特点：</strong> 极其特殊的玩法。你需要管理狗熊的“理智值”，通过“赛博解构”看番，并在“Galgame”系统中攻略女角色。理智值归零将触发精神病结局。</p>
                    </div>

                    <div className="border border-yellow-500/30 bg-yellow-900/10 p-5">
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">及第路线（资本派）</h3>
                      <p className="text-sm text-white/80 mb-2"><strong>目标：</strong> 将学校彻底商业化，垄断教育资源，实现“及第之梦”。</p>
                      <p className="text-sm text-white/80"><strong>特点：</strong> 经营及第企业，研发教辅资料，抢占市场份额。玩法偏向模拟经营。最后见证私有化合一的终局。</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'mechanics' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-cyan-300/20 pb-2">特殊机制指南</h2>
                  <p className="text-white/85 leading-relaxed mb-6">
                    随着剧情推进，你将解锁各种特殊界面。它们通常位于屏幕左侧或右侧的快捷按钮中。
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-black/40 border border-white/10 p-4">
                      <h3 className="font-bold text-blue-300 mb-2">学生代表大会</h3>
                      <p className="text-xs text-white/60 mb-2">进入条件：潘仁越路线</p>
                      <p className="text-sm text-white/80">
                        提出法案并进行表决。你需要通过决议或事件来拉拢不同派系（如温和派、激进派），确保你的法案能获得半数以上的赞成票。法案通过可获得强大的全局增益。
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-4">
                      <h3 className="font-bold text-red-300 mb-2">做题体制改革委员会</h3>
                      <p className="text-xs text-white/60 mb-2">进入条件：王兆凯路线</p>
                      <p className="text-sm text-white/80">
                        平衡“改革进度”与“激进愤怒度”。推行激进改革会增加愤怒度，愤怒度满100会触发极左危机倒计时。你需要适时进行“路线纠偏”来降温。
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-4">
                      <h3 className="font-bold text-pink-300 mb-2">赛博解构与Galgame</h3>
                      <p className="text-xs text-white/60 mb-2">进入条件：狗熊路线</p>
                      <p className="text-sm text-white/80">
                        消耗PP进行“赛博解构”（看番）来恢复狗熊的理智值；在Galgame界面与角色聊天，提升好感度。注意：好感度过低时强行聊天会被拉黑！
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-4">
                      <h3 className="font-bold text-yellow-300 mb-2">及第企业管理</h3>
                      <p className="text-xs text-white/60 mb-2">进入条件：及第路线</p>
                      <p className="text-sm text-white/80">
                        管理资金、市场份额和公关值。投资研发新教辅，打击竞争对手。市场份额归零会导致企业破产。
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-4 md:col-span-2">
                      <h3 className="font-bold text-cyan-300 mb-2">突发小游戏（频率战/阵地战/谈判）</h3>
                      <p className="text-xs text-white/60 mb-2">触发条件：特定剧情节点自动弹出</p>
                      <p className="text-sm text-white/80">
                        <strong>频率战：</strong> 抢夺广播频道，点击正确的频段来压制对手。<br/>
                        <strong>阵地战：</strong> 分配兵力攻守教学楼，注意兵种克制和士气。<br/>
                        <strong>谈判：</strong> 根据对方的性格和当前局势，选择合适的对话策略，施压或妥协。
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
