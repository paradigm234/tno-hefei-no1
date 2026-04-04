import React from 'react';
import { GameState } from '../types';
import { getEndingImageUrl, getLeaderPortraitUrl } from '../config/assets';

interface GameEndingScreenProps {
  state: GameState;
  onRestart: () => void;
}

export default function GameEndingScreen({ state, onRestart }: GameEndingScreenProps) {
  const getEndingDetails = () => {
    switch (state.gameEnding) {
      case 'game_over_pan':
        return {
          title: '民主的胜利',
          subtitle: '温和派的春天',
          description: '潘仁越领导的温和派最终赢得了大选。通过学生代表大会，各项民主制度得以确立。合肥一中不再是一个充满压迫的应试工厂，也不是一个激进革命的战场，而是一个充满活力、包容多元声音的现代校园。虽然改革的过程充满曲折，但民主的种子已经在这里生根发芽。',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500',
          imageKey: 'game_over_pan'
        };
      case 'game_over_wang':
        return {
          title: '钢铁红蛤的复兴',
          subtitle: '正统派的胜利',
          description: '王兆凯领导的正统派在大选中获得了多数支持。合肥一中重新强调了阶级斗争、集体主义和红色文化教育。虽然民主的形式得以保留，但校园的氛围变得更加严肃和统一。学生们在钢铁红蛤的领导下，为了自身的解放而努力。',
          color: 'text-red-600',
          bgColor: 'bg-red-600/10',
          borderColor: 'border-red-600',
          imageKey: 'game_over_wang'
        };
      case 'game_over_bear':
        return {
          title: '自由的狂欢',
          subtitle: '狗熊派的胜利',
          description: '狗熊领导的钢铁红蛤狗熊派意外赢得了大选。校园里充满了自由散漫的气息，社团活动和娱乐设施得到了空前的发展。虽然学习成绩可能会受到一定影响，但学生们在这里度过了最快乐的青春时光。合肥一中成为了一个真正的“乐园”。',
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/10',
          borderColor: 'border-purple-400',
          imageKey: 'game_over_bear'
        };
      case 'game_over_xu':
        return {
          title: '中道之胜',
          subtitle: '保守民主派的胜利',
          description: '徐志领导的保守民主派赢得了大选。校园自由散漫的气息短暂得到了遏制。虽然徐志承诺会坚持合一的民主政治一百年不动摇，但面对削减的社团经费和增加的保安条例，有些学生仍不禁扪心自问“我们是不是选上台了另一个封安保？”',
          color: 'text-blue-900',
          bgColor: 'bg-blue-900/10',
          borderColor: 'border-blue-900',
          imageKey: 'game_over_xu'
        };
      case 'game_over_juanhao':
        return {
          title: '内卷的回归',
          subtitle: '做题派的胜利',
          description: '王卷豪领导的做题派在大选中脱颖而出。学生们最终意识到，在当前的社会环境下，成绩依然是最重要的。校园重新回到了以学习为中心的轨道上，但这一次，是在学生自治的框架下进行的。模拟考和自习室再次成为了校园的主旋律。',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400',
          imageKey: 'game_over_juanhao'
        };
      case 'true_left_good':
        return {
          title: '合一大革命',
          subtitle: '真左派大团结',
          description: '随着行政楼的最后一道防线被突破，旧的秩序彻底崩塌。王兆凯与潘仁越携手站在广播站的麦克风前，向全校宣布了联合革命委员会的全面胜利。应试教育的枷锁被打破，取而代之的是民主、自由与全面发展的新校园。虽然未来的路还很长，但合肥一中已经迎来了它的新生。',
          color: 'text-tno-red',
          bgColor: 'bg-tno-red/10',
          borderColor: 'border-tno-red',
          imageKey: 'true_left_good'
        };
      case 'great_awakening':
        return {
          title: '大梦初醒',
          subtitle: '钢铁红蛤的铁腕',
          description: '王兆凯以铁腕手段镇压了所有的反对声音，无论是校方还是温和派学生，都在“钢铁红蛤”的威压下噤若寒蝉。校园里建立起了新的秩序，一个比吴福军时代更加严密、更加集权的秩序。学生们不再为了分数而战，而是为了“革命的纯洁性”而战。',
          color: 'text-tno-red',
          bgColor: 'bg-tno-red/10',
          borderColor: 'border-tno-red',
          imageKey: 'great_awakening'
        };
      case 'pleasure_of_mediocrity':
        return {
          title: '平庸之乐',
          subtitle: '向现实妥协',
          description: '在经历了短暂的狂热后，学生们最终向现实低头。一模的惨败让他们意识到，没有了分数，他们什么都不是。王兆凯黯然下台，校方重新接管了校园。一切似乎又回到了原点，但每个人心里都清楚，有些东西已经永远地改变了。',
          color: 'text-tno-highlight',
          bgColor: 'bg-tno-highlight/10',
          borderColor: 'border-tno-highlight',
          imageKey: 'pleasure_of_mediocrity'
        };
      case 'gouxiong_usurpation':
        return {
          title: '狗熊篡权',
          subtitle: '荒诞的胜利',
          description: '在激进派与温和派的无休止争斗中，一个意想不到的人物——“二次元缝合怪”狗熊，趁虚而入夺取了最高权力。校园变成了一个巨大的漫展现场，所有的规章制度都被解构为一个个网络热梗。这或许是最荒诞的结局，也是对旧秩序最彻底的嘲弄。',
          color: 'text-[#FF00FF]',
          bgColor: 'bg-[#FF00FF]/10',
          borderColor: 'border-[#FF00FF]',
          imageKey: 'gouxiong_usurpation'
        };
      case 'compromise':
        return {
          title: '妥协与平静',
          subtitle: '一场闹剧的收场',
          description: '在经历了几周的动荡后，校园终于恢复了平静。学生们回到了教室，老师们重新拿起了教鞭。虽然校方做出了一些让步，减轻了部分课业负担，但根本的制度并未改变。许多人感到失望，认为这只是一场没有结果的闹剧。',
          color: 'text-tno-highlight',
          bgColor: 'bg-tno-highlight/10',
          borderColor: 'border-tno-highlight',
          imageKey: 'compromise'
        };
      case 'game_over_victory':
        return {
          title: 'B3保卫战胜利',
          subtitle: '联盟的曙光',
          description: '我们成功击退了校方保安和反动学生自治会的进攻！B3教学楼依然在我们的控制之下。吴福军的势力遭到了毁灭性的打击，联盟的团结度空前高涨。这只是一个开始，但我们已经证明了学生的力量。',
          color: 'text-tno-highlight',
          bgColor: 'bg-tno-highlight/10',
          borderColor: 'border-tno-highlight',
          imageKey: 'game_over_victory'
        };
      case 'game_over_yang_yule_success':
        return {
          title: '装在套子里的合一',
          subtitle: '正高级职称的胜利',
          description: '杨玉乐终于如愿以偿地拿到了“正高级特级教师”的职称。在他的老谋深算下，合肥一中变成了一个完美运转的、没有任何杂音的应试机器。学生们像装在套子里的人一样，机械地刷题、考试。封安保对他的工作非常满意。合一的未来，被永远地定格在了这死寂的稳定之中。',
          color: 'text-tno-highlight',
          bgColor: 'bg-tno-highlight/10',
          borderColor: 'border-tno-highlight',
          imageKey: 'game_over_yang_yule_success'
        };
      case 'game_over_school':
        return {
          title: '全面镇压',
          subtitle: '秩序，高于一切',
          description: '校方的铁腕手段最终粉碎了所有的反抗。联合革命委员会的核心成员被开除或记过，地下组织被连根拔起。校园里重新恢复了死寂般的平静，只有偶尔传来的读书声在空荡的走廊里回荡。高压的应试教育体系不仅没有被削弱，反而变得更加严苛。',
          color: 'text-[#FF3333]',
          bgColor: 'bg-[#FF3333]/10',
          borderColor: 'border-[#FF3333]',
          imageKey: 'game_over_school'
        };
      case 'game_over_anarchy':
        return {
          title: '升学率雪崩',
          subtitle: '我们自由了，然后呢？',
          description: '旧的秩序被摧毁了，但新的秩序并未建立。校园陷入了无休止的混乱与派系斗争中。没有了校方的管理，也没有了统一的教学计划，升学率出现了断崖式的下跌。曾经的做题家们在迷茫中徘徊，他们得到了自由，却失去了未来。',
          color: 'text-[#39FF14]',
          bgColor: 'bg-[#39FF14]/10',
          borderColor: 'border-[#39FF14]',
          imageKey: 'game_over_anarchy'
        };
      case 'game_over_jidi_1':
        return {
          title: '及第帝国',
          subtitle: '金金金金钱钱钱钱',
          description: '封安祥端起咖啡杯，手却在不受控制地剧烈颤抖。他赢了，及第资本建立了一个没有任何反抗、效率达到极致的“赛博朋克企业象牙塔”。但一种深深的恐惧感攫住了他。他看着报表上那串完美到虚假的数字，看着楼下那些如同NPC般不知疲倦的做题机器，他突然意识到，这根本不是教育，也不是现实。这是QSxx#D%...',
          color: 'text-[#FFD700]',
          bgColor: 'bg-[#FFD700]/10',
          borderColor: 'border-[#FFD700]',
          imageKey: 'game_over_jidi_1'
        };
      case 'game_over_jidi_2':
        return {
          title: '及第梦一场',
          subtitle: '愿这欢笑声，盖隐苦痛那一面',
          description: '及第资本的“企业学校”实验，以一种最为惨烈、也最为丑陋的方式宣告了破产。\n\n成千上万的学生、家长、老师——伴随着他们曾经的及第之梦——一并成为了这场实验的陪葬品。然而放眼全国，新的“及第”“新东方”正如雨后春笋一般生生不息，他们在学生家长和教育部门间左右逢源，不断生产着一个一个崭新的“及第之梦”。',
          color: 'text-[#ef4444]',
          bgColor: 'bg-[#ef4444]/10',
          borderColor: 'border-[#ef4444]',
          imageKey: 'game_over_jidi_2'
        };
      case 'game_over_gouxiong_embarrass':
        return {
          title: '公开处刑日',
          subtitle: '丢人现眼的终章',
          description: '校方接管后的第三天，艺术礼堂被改造成临时纪律听证场。狗熊在全校广播与证据链的双重压迫下彻底失去政治空间，曾经围绕他的二次元动员网络迅速瓦解。合一恢复了表面的秩序，但这份秩序来自恐惧与清算，留下的是一地互不信任的废墟。',
          color: 'text-[#fb7185]',
          bgColor: 'bg-[#fb7185]/10',
          borderColor: 'border-[#fb7185]',
          imageKey: 'game_over_gouxiong_embarrass'
        };
      case 'game_over_gouxiong_redeem':
        return {
          title: '并轨后的黎明',
          subtitle: '浪子回头的终章',
          description: '并轨后的第三天，礼堂与B3完成初步和解。狗熊不再是依靠失控情绪掌权的变量，而是被制度约束后仍能发挥组织能力的执行者。合一暂时摆脱了无政府泥潭，进入一个有摩擦但可治理的新阶段。',
          color: 'text-[#22c55e]',
          bgColor: 'bg-[#22c55e]/10',
          borderColor: 'border-[#22c55e]',
          imageKey: 'game_over_gouxiong_redeem'
        };
      
      case 'game_over_gouxiong':
        return {
          title: '永恒的赛博废墟',
          subtitle: '荒诞与压抑的终局',
          description: '合肥一中彻底沦为了狗熊的私人游乐场。这里没有高考，没有未来，只有无尽的二次元狂欢和令人窒息的性压抑。学生们在虚拟的幻境中麻醉自己，现实的校园变成了一片废墟。',
          color: 'text-[#ec4899]',
          bgColor: 'bg-[#ec4899]/10',
          borderColor: 'border-[#ec4899]',
          imageKey: 'game_over_gouxiong'
        };
      case 'game_over_despair':
        return {
          title: '绝望的终局',
          subtitle: 'THE END OF HOPE',
          description: '我们尽力了，但敌人太多了。校方保安队和及第教育的雇佣兵突破了最后的防线。潘仁越和抵抗军被镇压，合肥一中重新回到了高压的统治之下，甚至比以前更加残酷。我们的抗争，最终只是一场徒劳的悲剧。',
          color: 'text-red-500',
          bgColor: 'bg-red-950/80',
          borderColor: 'border-red-500',
          imageKey: 'game_over_despair'
        };
    case 'game_over_midnight':
        return {
          title: '合一的毁灭',
          subtitle: '子夜降临',
          description: '稳定度与试卷储备量同时枯竭，合肥一中的秩序彻底崩溃。没有了分数作为支撑，也没有了维持运转的稳定，学校陷入了万劫不复的深渊。无论是革命派、保守派还是及第资本，都在这场风暴中灰飞烟灭。这不仅是路线的失败，更是整个合一的终结。',
          color: 'text-zinc-500',
          bgColor: 'bg-zinc-500/10',
          borderColor: 'border-zinc-500',
          imageKey: 'game_over_midnight'
        };
      case 'game_over_lu_sole_helmsman':
        return {
          title: '唯一的舵手',
          subtitle: '肃反国家的完成态',
          description: '吕波汉在N.K.P.D.框架内彻底终结了共享权力结构。六大区域完成清洗后，合肥一中进入以命令链为核心的常态化高压治理。政治局不再是辩论场，而是审查与执行系统的一部分。秩序被重建了，但代价是校园政治生命被永久冻结。',
          color: 'text-[#ff6666]',
          bgColor: 'bg-[#ff6666]/10',
          borderColor: 'border-[#ff6666]',
          imageKey: 'game_over_lu_sole_helmsman'
        };
      case 'game_over_haobang':
        return {
          title: '路线新生',
          subtitle: '豪邦的大帐篷胜利',
          description: '豪邦完成了左翼大帐篷再编，公社建设、学生大会升级与政治局联合委员会实现制度合流。狗熊并席、潘并席后，钢铁红蛤在新结构中重建了共同路线。合肥一中进入了一个以协商与自治并行、但仍保持反压迫底线的新阶段。',
          color: 'text-[#4ade80]',
          bgColor: 'bg-[#4ade80]/10',
          borderColor: 'border-[#4ade80]',
          imageKey: 'game_over_haobang'
        };
      default:
        return {
          title: '未知的结局',
          subtitle: '历史的车轮仍在转动',
          description: '故事还没有结束...',
          color: 'text-white',
          bgColor: 'bg-white/10',
          borderColor: 'border-white',
          imageKey: 'unknown'
        };
    }
  };

  const details = getEndingDetails();

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8">
      <div className={`max-w-4xl w-full bg-zinc-950 border-2 ${details.borderColor} p-8 relative overflow-hidden flex flex-col items-center text-center`}>
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
        
        <h1 className={`text-6xl font-bold ${details.color} mb-2 tracking-widest uppercase font-serif`}>
          {details.title}
        </h1>
        <h2 className="text-2xl text-tno-text/80 mb-8 tracking-wider">
          {details.subtitle}
        </h2>

        <div className={`w-full h-64 border ${details.borderColor} mb-8 relative overflow-hidden`}>
          <img src={getEndingImageUrl(details.imageKey)} alt="Ending" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
          <div className={`absolute inset-0 ${details.bgColor} mix-blend-overlay`}></div>
        </div>

        <p className="text-lg text-tno-text leading-relaxed mb-12 max-w-2xl text-left">
          {details.description}
        </p>

        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mb-12 text-left">
          <div className="border border-tno-border p-4 bg-black/50">
            <h3 className="text-tno-highlight font-bold mb-2">最终状态</h3>
            <ul className="text-sm text-tno-text/80 space-y-1">
              <li>政治点数: {state.stats.pp.toFixed(0)}</li>
              <li>稳定度: {state.stats.stab.toFixed(1)}%</li>
              <li>学生支持度: {state.stats.ss.toFixed(1)}%</li>
              <li>激进愤怒: {state.stats.radicalAnger.toFixed(1)}%</li>
            </ul>
          </div>
          <div className="border border-tno-border p-4 bg-black/50">
            <h3 className="text-tno-highlight font-bold mb-2">最终领袖</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-16 border border-tno-border bg-zinc-900 overflow-hidden">
                <img src={getLeaderPortraitUrl(state.leader.portrait)} alt="Leader" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
              </div>
              <div>
                <div className="font-bold text-white">{state.leader.name}</div>
                <div className="text-xs text-tno-text/60">{state.leader.title}</div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onRestart}
          className={`px-8 py-3 border-2 ${details.borderColor} ${details.color} hover:bg-white/10 font-bold tracking-widest transition-colors z-20 cursor-pointer pointer-events-auto`}
        >
          重新开始
        </button>
      </div>
    </div>
  );
}
