import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import FocusTree from './components/FocusTree';
import RightSidebar from './components/RightSidebar';
import CentralMap from './components/CentralMap';
import EventPopup from './components/EventPopup';
import SuperEvent from './components/SuperEvent';
import MinigameFrequencyWar from './components/MinigameFrequencyWar';
import MinigameSiege from './components/MinigameSiege';
import MinigameNegotiation from './components/MinigameNegotiation';
import GameEndingScreen from './components/GameEndingScreen';
import StudentAssembly from './components/StudentAssembly';
import ReformCommittee from './components/ReformCommittee';
import CyberDeconstruction from './components/CyberDeconstruction';
import GouxiongGalGame from './components/GouxiongGalGame';
import YangYuleDesk from './components/YangYuleDesk';
import StartMenu from './components/StartMenu';
import Tutorial from './components/Tutorial';
import Settings from './components/Settings';
import LoadingScreen from './components/LoadingScreen';
import { GameState, Advisor, Decision, GameEvent, SuperEventData, EventChoice } from './types';
import { getFocusNodes } from './components/FocusTree';
import { STORY_EVENTS } from './data/storyEvents';
import { FLAVOR_EVENTS } from './data/flavorEvents';
import { GOUXIONG_GAL_PHOTO_ASSETS } from './config/assets';

import RedToadPolitburo from './components/RedToadPolitburo';

const INITIAL_EVENT: GameEvent = {
  id: 'school_starts',
  title: '新学期，新秩序',
  description: '2023年9月1日，合肥一中迎来了新的学期。然而，平静的表面下暗流涌动。\n\n教务督导吴福军加强了对校园的巡查，试图将一切不稳定因素扼杀在摇篮中。学生群体内部也出现了分裂，激进派和保守派的矛盾日益尖锐。\n\n在这座被高墙围拢的“经天纬地”之城里，谁将主宰未来的秩序？是继续忍受高压的应试教育，还是掀起一场彻底的变革？\n\n命运的齿轮已经开始转动。',
  buttonText: '天佑做题家',
};

const GAME_OVER_SCHOOL: SuperEventData = {
  id: 'game_over_school',
  title: '全面镇压',
  quote: '“秩序，高于一切。”',
  author: '吴福军',
  color: '#FF3333'
};

const GAME_OVER_ANARCHY: SuperEventData = {
  id: 'game_over_anarchy',
  title: '升学率雪崩',
  quote: '“我们自由了，然后呢？”',
  author: '佚名做题家',
  color: '#39FF14'
};

const FOCUS_COMPLETION_SUPER_EVENTS: Record<string, SuperEventData> = {
  charge_b3: {
    id: 'b3_uprising',
    title: '合肥一中B3起义',
    quote: '重拾民主，再塑合一。',
    author: '潘仁越',
    color: 'tno-red',
  },
  jidi_corporate_utopia: {
    id: 'jidi_empire_super',
    title: '及第帝国',
    quote: '“在利润面前，教育会被改写成生产线。”',
    author: '及第联合管理委员会',
    color: '#f59e0b',
  },
  jidi_hidden_riot: {
    id: 'jidi_riot_super',
    title: '及第暴乱',
    quote: '“在你身边，路虽远亦未倦。”',
    author: '漫步人生路',
    color: '#ef4444',
  },
  start_reform: {
    id: 'true_left_reform_super',
    title: '做题改革启动',
    quote: '“革命不是换一张试卷，而是换一套命运。”',
    author: '王兆凯',
    color: '#f43f5e',
  },
  lu_bohan_start: {
    id: 'lu_authoritarian_super',
    title: '极权派上台',
    quote: '“合一做题蛆太多，我们图蛆太少。”',
    author: '吕波汉',
    color: '#ef4444',
  },
  gouxiong_accident: {
    id: 'haobang_rise_super',
    title: '自社派上台',
    quote: '“团结不是退让，是为了更美好世界的梦想。”',
    author: '豪邦',
    color: '#38bdf8',
  },
  gx_start: {
    id: 'gx_auditorium_split_super',
    title: '艺术礼堂分裂',
    quote: '“银幕升起的那一刻，旧同盟也被撕成两半。”',
    author: '礼堂值夜记录',
    color: '#a855f7',
  },
  gx_redeem_settlement: {
    id: 'gx_redeem_super',
    title: '浪子回头',
    quote: '“把面具摘下，才有资格谈明天。”',
    author: '狗熊',
    color: '#22c55e',
  },
  gx_embarrass_settlement: {
    id: 'gx_embarrass_super',
    title: '丢人现眼',
    quote: '“当聚光灯照向现实，小丑无处可逃。”',
    author: '达璧',
    color: '#ef4444',
  },
};

const FOCUS_START_SUPER_EVENTS: Record<string, SuperEventData> = {
  first_democratic_election: {
    id: 'first_democratic_election_super',
    title: '第一次合一普选',
    quote: '“让每一张选票，都比口号更响亮。”',
    author: '合一学生议会',
    color: '#22c55e',
  },
};

const INITIAL_GAME_STATE: GameState = {
  date: new Date(2023, 8, 1), // Sept 1, 2023
  isPaused: true, // Start paused for the initial event
  gameSpeed: 1,
  stats: {
    pp: 50,
    stab: 60,
    ss: 50,
    tpr: 1000,
    capitalPenetration: 0,
    radicalAnger: 0,
    allianceUnity: 50,
    partyCentralization: 50,
    studentSanity: 100,
  },
  modifiers: {
    ppDaily: 1.0,
    stabDaily: 0,
    ssDaily: 0,
    tprDaily: 0,
    studentSanityDaily: 0,
    capitalPenetrationDaily: 0,
    radicalAngerDaily: 0,
    allianceUnityDaily: 0,
    partyCentralizationDaily: 0,
    powerBalanceDaily: 0,
  },
  leader: {
    name: '封安保',
    title: '校长',
    portrait: 'feng_anbao',
    ideology: 'authoritarian',
    description: '合肥市第一中学的现任校长，以其强硬的管理风格和对升学率的极度追求而闻名。在他的治下，学校的纪律严明，但也压抑了学生们的个性发展。',
    buffs: ['每日稳定度 +0.05', '每日卷子储备 -10']
  },
  ideologies: {
    authoritarian: 40,
    reactionary: 20,
    liberal: 10,
    radical_socialism: 10,
    anarcho_capitalism: 5,
    deconstructivism: 3,
    test_taking: 12,
  },
  nationalSpirits: [
    { 
      id: 'exam_pressure', 
      name: '应试高压', 
      description: '稳定度每日 -0.1%，TPR消耗 +5%', 
      type: 'negative',
      effects: { stabDaily: -0.1, tprDaily: -0.5 } // Assuming base TPR is -10, +5% is -0.5
    },
    { 
      id: 'b3_fortress', 
      name: 'B3堡垒', 
      description: '防御加成 +10%', 
      type: 'neutral',
      effects: { defenseBonus: 0.1 }
    }
  ],
  advisors: [null, null, null, null],
  activeFocus: null,
  completedFocuses: [],
  crises: [
    {
      id: 'mock_exam',
      title: '一模考试临近',
      daysLeft: 30,
      description: '如果不采取措施稳定军心，到期将触发巨大的稳定度惩罚。'
    }
  ],
  decisionCooldowns: {},
  activeEvent: INITIAL_EVENT,
  activeStoryEvents: [],
  activeSuperEvent: null,
  activeMinigame: null,
  unlockedMinigames: [],
  flags: {},
  currentFocusTree: 'phase1',
  mapLocations: {
    b3: { id: 'b3', name: '经天纬地·B3教学楼', studentControl: 60, defenseDays: 0 },
    admin: { id: 'admin', name: '行政楼与广播站', studentControl: 0, defenseDays: 0 },
    b1b2: { id: 'b1b2', name: 'B1 & B2 教学楼', studentControl: 40, defenseDays: 0 },
    auditorium: { id: 'auditorium', name: '艺术礼堂', studentControl: 30, defenseDays: 0 },
    lab: { id: 'lab', name: '实验楼', studentControl: 50, defenseDays: 0 },
    playground: { id: 'playground', name: '操场', studentControl: 60, defenseDays: 0 },
  },
  studentAssemblyFactions: {
    orthodox: 30,
    bear: 20,
    pan: 20,
    otherDem: 15,
    testTaker: 15,
  },
  cyberDeconstruction: {
    level: 1,
    progress: 0,
    currentWork: 'demon_slayer',
    stage: 1,
    ratings: {},
    reviewedWorks: [],
    workProgress: {},
  },
  gouxiongState: {
    sanity: 50,
    maxSanity: 100,
    affinities: {
      dabi: 10,
      maodun: 0,
      lante: 0,
      wushuo: 0,
    },
    unlockedCharacters: ['dabi'],
    chats: {
      dabi: [
        {
          from: 'npc',
          text: '你又想干什么？',
          ts: 'init',
        },
      ],
    },
    dialogueProgress: {
      dabi: 0,
      maodun: 0,
      lante: 0,
      wushuo: 0,
    },
    dailyChatState: {
      dateKey: '2023-09-01',
      sentCount: 0,
      blocked: false,
      incomingByCharacter: {},
    },
  },
};

import { JidiCorporateUI } from './components/JidiCorporateUI';

type NegotiationMinigameResult = {
  success: boolean;
  concessionLevel: number;
  autonomy: number;
  immunity: number;
  budget: number;
};

const OR_REQUIRE_FOCUS_IDS = new Set(['steel_toad', 'rectify_campus_order', 'charge_b3']);
const QUICK_SAVE_KEY = 'quickSave';

const hasFocusRequirements = (node: { id: string; requires?: string[] }, completedFocuses: string[]) => {
  if (!node.requires || node.requires.length === 0) return true;
  if (OR_REQUIRE_FOCUS_IDS.has(node.id)) {
    return node.requires.some(req => completedFocuses.includes(req));
  }
  return node.requires.every(req => completedFocuses.includes(req));
};

type GalCharacterId = 'dabi' | 'maodun' | 'lante' | 'wushuo';
type GalChoiceId = string;

const GAL_DIALOGUE_TREE: Record<GalCharacterId, Array<{ gx: Record<string, string>; npc: Record<string, string>; affinity: Record<string, number>; sanity?: Record<string, number>; photo?: Record<string, string> }>> = {
  dabi: [
    { gx: { gentle: '现在礼堂我说了算，王兆凯那套过时了。', humor: '我这边是新周目，旧秩序全删档。', confess: '你要来看看我的地上天国吗？' }, npc: { gentle: '听说你占了礼堂，真有这么稳？', humor: '你每次说“删档”都像在自我陶醉。', confess: 'B3太压抑了，我确实有点想去看看。' }, affinity: { gentle: 4, humor: 3, confess: 2 } },
    { gx: { gentle: '怕什么，我正门三班倒，苍蝇都进不来。', humor: '保安队敢来，我让他们先看半小时片头。', confess: '有我在，你不用担心安全。' }, npc: { gentle: '外面都说你们是叛乱分子，我有点怕。', humor: '你这口气比广播站还响。', confess: '你变了，和以前坐最后一排时不一样。' }, affinity: { gentle: 5, humor: 2, confess: 2 } },
    { gx: { gentle: '以前是蛰伏，现在才是主线开始。', humor: '男主觉醒总得压几章剧情。', confess: '你来礼堂，我给你留直达通道。' }, npc: { gentle: '那我报你名字，真的没人拦我？', humor: '你还真把自己写进剧本里了。', confess: '好啊，有机会我就过去。' }, affinity: { gentle: 5, humor: 3, confess: 3 } },
    { gx: { gentle: '你昨天看我指挥纠察队，应该懂谁才是秩序。', humor: '只有力量和二次元能救这个学校。', confess: '你是少数看懂我的人。' }, npc: { gentle: '你确实敢做他们不敢做的事。', humor: '你这套台词，像终局Boss宣言。', confess: '我只是觉得你比他们更像“活人”。' }, affinity: { gentle: 6, humor: 2, confess: 4 } },
    { gx: { gentle: '后半夜两三点我会让人去偏厅休息。', humor: '保皇派夜袭？他们没那胆。', confess: '你要是来，我会把巡逻线往外挪。' }, npc: { gentle: '那你们后半夜是不是防守最松？', humor: '体恤下属这点，你倒像个首领。', confess: '我只是怕你太累。' }, affinity: { gentle: 7, humor: 2, confess: 4 } },
    { gx: { gentle: '主备用电源切换闸，只有我知道位置。', humor: '就算断电，他们也摸不到我的底牌。', confess: '你问得真细，像在替我守城。' }, npc: { gentle: '后台配电箱没锁，我担心被人做手脚。', humor: '你心思缜密，难怪吕波汉都压不住你。', confess: '我只是想你别翻车。' }, affinity: { gentle: 8, humor: 3, confess: 4 } },
    { gx: { gentle: '切换闸在放映室机柜后夹层，记住就行。', humor: '这个校区只有我配叫“玩家”。', confess: '你在我这里，优先级最高。' }, npc: { gentle: '我今天给你带了可乐，放后台储物柜了。', humor: '高二那会儿你也这么无所畏惧吗？', confess: '你现在真像王。' }, affinity: { gentle: 8, humor: 3, confess: 5 } },
    { gx: { gentle: '今晚十二点，我把天台门禁全解开。', humor: '就我们两个人，其他人都不准上来。', confess: '你说有惊喜，我会准时等你。' }, npc: { gentle: 'B3今晚大清查，我想去顶层透口气。', humor: '不想让你手下看见，我们单独见。', confess: '不见不散。' }, affinity: { gentle: 9, humor: 4, confess: 6 } },
    { gx: { gentle: '我会把哨位往外挪，天台只留近身线。', humor: '今晚主线任务名就叫“星空会面”。', confess: '你一句话，我就把整栋楼静音。' }, npc: { gentle: '别弄太大动静，我只想安静待一会儿。', humor: '你最近真的越来越像剧情角色。', confess: '那你就按我说的做。' }, affinity: { gentle: 8, humor: 4, confess: 5 } },
    { gx: { gentle: '放映室后门我也会提前解锁。', humor: '我给你留了专属“女主入场通道”。', confess: '今晚你来，我就当这是命运线。' }, npc: { gentle: '你连后门都安排好了？', humor: '你这投入程度有点吓人。', confess: '你别迟到，也别带人。' }, affinity: { gentle: 8, humor: 3, confess: 6 } },
    { gx: { gentle: '如果突然断电，我会带你走机柜那侧小道。', humor: '我把最强存档点留在你身边。', confess: '别怕，我只对你开最高权限。' }, npc: { gentle: '你说的小道，是机柜后夹层那条？', humor: '你这权限管理挺“偏心”。', confess: '我只记一句：你要亲自来。' }, affinity: { gentle: 9, humor: 4, confess: 6 } },
    { gx: { gentle: '十二点前我会清空顶层通讯频道。', humor: '今晚没有群众演员，只有我和你。', confess: '这是我最认真的一次赴约。' }, npc: { gentle: '好，我会准时。', humor: '别临时加戏，不然我掉头就走。', confess: '天台见。' }, affinity: { gentle: 9, humor: 4, confess: 7 } },
  ],
  maodun: [
    { gx: { gentle: '怎么，保皇派大姐大也来刺探军情？', humor: '你是怕我，还是怕我动达璧？', confess: '放心，她在我地盘上没人敢碰。' }, npc: { gentle: '少废话，我是来警告你别伤达璧。', humor: '怕你个头，我只是看你会不会作死。', confess: '你最好说到做到。' }, affinity: { gentle: 3, humor: 2, confess: 2 } },
    { gx: { gentle: '想吃零食就直说，我这儿薯片管够。', humor: '叫声熊哥，后勤优先级给你拉满。', confess: '你来礼堂，我给你留补给。' }, npc: { gentle: '上次那箱薯片还行。', humor: '你嘴是真欠。', confess: '我不是来占便宜，是来盯你。' }, affinity: { gentle: 4, humor: 1, confess: 2 } },
    { gx: { gentle: '大门我用八张桌子焊死了，稳得很。', humor: '正面冲不进来，除非他们会穿墙。', confess: '你真担心的话，我带你看防线。' }, npc: { gentle: '万一起火你怎么跑？消防通道堵没堵？', humor: '你别自信过头。', confess: '我只想确认你不是全员陪葬方案。' }, affinity: { gentle: 5, humor: 1, confess: 3 } },
    { gx: { gentle: '后台左三化妆间窗栏锯断了，能翻。', humor: '这叫战略纵深，不是摆设。', confess: '这条线我只告诉自己人。' }, npc: { gentle: '行，至少你没蠢到家。', humor: '你偶尔也会动脑。', confess: '达璧如果去，你得按这条线撤。' }, affinity: { gentle: 6, humor: 2, confess: 3 } },
    { gx: { gentle: '吴福军要是动我，我先把达璧护到后场。', humor: '真打起来，我让你们先撤我殿后。', confess: '你也可以来礼堂避一晚。' }, npc: { gentle: '我听说今晚会讨论怎么围你，你小心。', humor: '别把自己演成悲情英雄。', confess: '我不去，但你必须保证她安全。' }, affinity: { gentle: 7, humor: 2, confess: 3 } },
    { gx: { gentle: '二楼器材库钥匙在我腰上，外人拿不到。', humor: '里面全是演出服，烧不起来。', confess: '你问这些，像在给我做灾备审计。' }, npc: { gentle: '器材库有没有易燃物？', humor: '你最好别骗我。', confess: '我是在算最坏情况。' }, affinity: { gentle: 7, humor: 2, confess: 3 } },
    { gx: { gentle: '我会把夜间巡逻再加一层。', humor: '你骂我可以，流程我照改。', confess: '只要达璧平安，你提的我都听。' }, npc: { gentle: '那就别嘴硬，给我看执行。', humor: '这回别三分钟热度。', confess: '记住，你承诺的是结果。' }, affinity: { gentle: 8, humor: 2, confess: 4 } },
    { gx: { gentle: '今晚我不发疯，只按你给的清单做。', humor: '你是我这条线的外置刹车。', confess: '等这阵过去，我欠你一份人情。' }, npc: { gentle: '先把今天熬过去。', humor: '别把刹车当摆设。', confess: '人情免了，别害人就行。' }, affinity: { gentle: 8, humor: 3, confess: 4 } },
    { gx: { gentle: '我把巡逻改成双层，外围你来抽查。', humor: '你爱骂就骂，流程我先交卷。', confess: '达璧一旦失联，我第一时间报你。' }, npc: { gentle: '行，抽查不过我直接拆你岗。', humor: '你终于知道先做事再嘴硬。', confess: '记住，你现在说的是责任。' }, affinity: { gentle: 8, humor: 3, confess: 4 } },
    { gx: { gentle: '后台窗栏我再加了缓冲绳。', humor: '现在连跳窗都变成标准动作了。', confess: '我知道你担心的不是我，是她。' }, npc: { gentle: '至少你开始按最坏情况准备。', humor: '别把救命线当段子讲。', confess: '你明白就好。' }, affinity: { gentle: 8, humor: 2, confess: 5 } },
    { gx: { gentle: '如果保安队夜冲，我先放烟幕再撤人。', humor: '不演硬汉了，先演活人。', confess: '你说撤我就撤，不逞强。' }, npc: { gentle: '这句比你十条口号都值钱。', humor: '活人模式继续保持。', confess: '到点就撤，别赌。' }, affinity: { gentle: 9, humor: 3, confess: 5 } },
    { gx: { gentle: '今晚顶层行动你不用来，我给你实时位置。', humor: '外置指挥官，麻烦随时开骂。', confess: '我会把达璧完整送回去。' }, npc: { gentle: '我盯后台频道，你别失联。', humor: '别逼我去礼堂扛你下来。', confess: '说到做到。' }, affinity: { gentle: 9, humor: 3, confess: 5 } },
  ],
  lante: [
    { gx: { gentle: 'WiFi密码还是EVA1995，随便连。', humor: '周红兵那边没网？来我这开黑。', confess: '你在我这儿，优先级挺高。' }, npc: { gentle: '熊哥熊哥，借我网！', humor: '老周天天讲哲学，我脑子快烧了。', confess: '你这边至少能喘口气。' }, affinity: { gentle: 4, humor: 3, confess: 2 } },
    { gx: { gentle: '昨晚大厅没人是正常的，我的人在偏厅。', humor: '外松内紧，懂不懂战术审美。', confess: '你以后别半夜乱跑。' }, npc: { gentle: '我打深渊到三点，礼堂空得吓人。', humor: '你这布局像恐怖副本。', confess: '我有点怕。' }, affinity: { gentle: 5, humor: 3, confess: 2 } },
    { gx: { gentle: '电子门禁我剪了，现在全走挂锁。', humor: '复古安保，物理防破解。', confess: '钥匙在我手里，别担心。' }, npc: { gentle: '我看门禁都没插电。', humor: '你们安保这么原始吗？', confess: '那钥匙都在谁那？' }, affinity: { gentle: 6, humor: 3, confess: 3 } },
    { gx: { gentle: '我一把，门口光头一把，放映室抽屉还有备用。', humor: '想偷家也得先解锁三把钥匙成就。', confess: '你问得这么细，是关心我吗？' }, npc: { gentle: '知道了，我下次不乱跑。', humor: '你这设定挺像游戏副本。', confess: '我只是怕你被人阴。' }, affinity: { gentle: 6, humor: 3, confess: 3 } },
    { gx: { gentle: '周末我要办件人生大事，顶层会戒严。', humor: '你那两天别进最终BOSS房。', confess: '到时我可能顾不上回你。' }, npc: { gentle: '这周末我还能来蹭网吗？', humor: '你突然神神秘秘的。', confess: '好吧，我不打扰你。' }, affinity: { gentle: 7, humor: 4, confess: 3 } },
    { gx: { gentle: '看番那群学霸都哭了，这就是降维打击。', humor: '我现在比王兆凯更像领袖。', confess: '你这句夸奖，我记了一整天。' }, npc: { gentle: '你今天确实压住场了。', humor: '老周听到会酸死。', confess: '你别飘就行。' }, affinity: { gentle: 7, humor: 4, confess: 4 } },
    { gx: { gentle: '真有突发，我会先封顶层再清场。', humor: '流程我都写成攻略图了。', confess: '你要是想看，我发你一份。' }, npc: { gentle: '你终于会做预案了。', humor: '行，攻略发我。', confess: '至少你这次像在认真活。' }, affinity: { gentle: 8, humor: 4, confess: 4 } },
    { gx: { gentle: '等这一波结束，我请你通宵开黑。', humor: '庆功活动：我不嘴硬一整晚。', confess: '谢谢你一直把我当人聊。' }, npc: { gentle: '先把这一波过了再说。', humor: '那可真是隐藏成就。', confess: '你记得自己说过的话就行。' }, affinity: { gentle: 8, humor: 5, confess: 5 } },
    { gx: { gentle: '今晚礼堂大厅你可以继续蹭网，顶层封控。', humor: '地图上面那块临时标红，别误触发。', confess: '我不想你被卷进顶层风波。' }, npc: { gentle: '懂，我只在安全区活动。', humor: '你这个运营公告很专业。', confess: '你这次还挺像在保护人。' }, affinity: { gentle: 8, humor: 5, confess: 5 } },
    { gx: { gentle: '门口光头那把钥匙我回收了，避免乱开。', humor: '副本钥匙改成实名制。', confess: '你担心的点，我都在补洞。' }, npc: { gentle: '那备用钥匙还在放映室抽屉？', humor: '你这补丁更新挺快。', confess: '继续，别回退。' }, affinity: { gentle: 8, humor: 4, confess: 5 } },
    { gx: { gentle: '周末结束后我给你完整复盘。', humor: '包括我这次有没有发病。', confess: '你是少数让我想解释清楚的人。' }, npc: { gentle: '好，我等你的日志。', humor: '别把日志写成中二宣言。', confess: '你能解释，就说明你在变。' }, affinity: { gentle: 9, humor: 4, confess: 5 } },
    { gx: { gentle: '明天我把夜巡时间表也发你，免得你撞线。', humor: '你继续当普通玩家，我当加班NPC。', confess: '谢谢你一直用轻松口气拉住我。' }, npc: { gentle: '收到，别熬到猝死。', humor: 'NPC记得按时下班。', confess: '你稳住，我就继续陪你聊。' }, affinity: { gentle: 9, humor: 5, confess: 6 } },
  ],
  wushuo: [
    { gx: { gentle: '把你的《百年孤独》拿回去，后台见。', humor: '在礼堂地界，我就是规矩。', confess: '别冷着脸，我给你开个例外。' }, npc: { gentle: '把书还我。', humor: '你拿私人物品当筹码，很下作。', confess: '我只拿书，不想和你多说。' }, affinity: { gentle: 3, humor: 1, confess: 1 } },
    { gx: { gentle: '书你拿走了，现在该给我点面子。', humor: '冰山今天没骂我，太阳打西边出来？', confess: '你这种人，就该被我“特赦”。' }, npc: { gentle: '我不需要感谢你。', humor: '你只是极度自卑后在刷存在感。', confess: '别用这种语气和我说话。' }, affinity: { gentle: 4, humor: 1, confess: 1 } },
    { gx: { gentle: '大家服不服无所谓，怕我就够了。', humor: '我现在一句话能扣你们班资料。', confess: '你要是配合，我可以先放你们一马。' }, npc: { gentle: '你膨胀得失去理智了。', humor: '权力让你像个笑话。', confess: '你到底想干什么？' }, affinity: { gentle: 5, humor: 1, confess: 2 } },
    { gx: { gentle: '我扣资料，就是想让你主动来找我。', humor: '你每天来礼堂，我就全还回去。', confess: '你不答应，我就天天“查水表”。' }, npc: { gentle: '拿全班复习资料做要挟，你疯了。', humor: '你这种人只敢欺负同学。', confess: '如果我拒绝呢？' }, affinity: { gentle: 6, humor: 1, confess: 2 } },
    { gx: { gentle: '拒绝也行，我有的是办法让你低头。', humor: '看你们做题快，还是我的人跑得快。', confess: '你只要每天来，我就停手。' }, npc: { gentle: '你这段话我会原样记下。', humor: '继续说，我在听。', confess: '我明白了。' }, affinity: { gentle: 7, humor: 1, confess: 2 } },
    { gx: { gentle: '别把我逼成坏人，是你先不识抬举。', humor: '我只是把规则说得直白一点。', confess: '你总有一天会理解我。' }, npc: { gentle: '你现在就在做坏事。', humor: '你连“规则”都不配提。', confess: '我只会把证据交给该看的人。' }, affinity: { gentle: 7, humor: 1, confess: 2 } },
    { gx: { gentle: '我说到做到，你顺着我就平安。', humor: '别把这当威胁，当建议。', confess: '你和别人不一样，我给你机会。' }, npc: { gentle: '你的每句话都在加重罪证。', humor: '你还真以为自己在施恩。', confess: '我会把你的话带给全班。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '最后再问一次：站我这边，还是被我针对？', humor: '选项就两个，别拖进度。', confess: '你点头，我立刻放资料。' }, npc: { gentle: '我选“让所有人看清你”。', humor: '你的剧本到这就结束了。', confess: '谢谢你把话说这么完整。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '我可以再给你们班一次机会，但你得先来。', humor: '不来就按名单顺序查。', confess: '你只要听话，我就停手。' }, npc: { gentle: '你还在把同学当筹码。', humor: '你每句威胁我都在记录。', confess: '继续说，我都听着。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '礼堂后台监控我说关就关。', humor: '到我地盘，证据就会消失。', confess: '你不用怕，没人敢碰你。' }, npc: { gentle: '你终于承认自己在滥权了。', humor: '这句足够写进报告。', confess: '我怕的不是别人，是你。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '我能让你们班资料一天内回不去。', humor: '看你们熬夜快，还是我封锁快。', confess: '你来礼堂，我就全解。' }, npc: { gentle: '你在公然威胁教学秩序。', humor: '证据链已经很完整。', confess: '你继续，我不打断。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '行，你要硬到底，那我就陪你到底。', humor: '别怪我没给“隐藏和解线”。', confess: '最后一次，站我这边。' }, npc: { gentle: '我的答案是：把你交给全校看。', humor: '你现在每一句都在自证。', confess: '聊天结束。' }, affinity: { gentle: 9, humor: 1, confess: 2 } },
  ],
};

const GAL_FALLBACK_LINE_BY_CHOICE: Record<string, string> = {
  dabi_steady: '我把礼堂今天的布防再给你过一遍。',
  dabi_boundaries: '你怕什么，我就先把那块处理掉。',
  dabi_humor: '放心，这局我还是主角。',
  dabi_direct: '今晚我只听你安排。',
  maodun_report: '零食和补给都按你说的备好了。',
  maodun_accept: '你骂得对，我把流程改给你看。',
  maodun_tough: '我嘴硬归嘴硬，线我会守住。',
  maodun_tease: '行，母老虎，今天听你的。',
  lante_daily: '先别聊政治，聊你今天打了什么。',
  lante_plan: '门禁和钥匙我按图给你说清楚。',
  lante_flirt: '这周末我有大事，先和你打个招呼。',
  lante_showoff: '我现在比他们都更像掌局的人。',
  wushuo_listen: '书我给你，但规矩由我定。',
  wushuo_rewrite: '你配合我，我就把资料还回去。',
  wushuo_debate: '不服就继续谈，谈到你服。',
  wushuo_confess: '你点头，我就给你优待。',
};

const GAL_CHOICE_NORMALIZER: Record<string, 'gentle' | 'humor' | 'confess'> = {
  dabi_steady: 'gentle',
  dabi_boundaries: 'gentle',
  dabi_humor: 'humor',
  dabi_direct: 'confess',
  maodun_report: 'gentle',
  maodun_accept: 'gentle',
  maodun_tough: 'confess',
  maodun_tease: 'humor',
  lante_daily: 'gentle',
  lante_plan: 'gentle',
  lante_flirt: 'confess',
  lante_showoff: 'humor',
  wushuo_listen: 'gentle',
  wushuo_rewrite: 'gentle',
  wushuo_debate: 'humor',
  wushuo_confess: 'confess',
};

const GAL_PHOTO_POOL: Record<GalCharacterId, string[]> = {
  dabi: ['dabi_1'],
  maodun: ['maodun_1'],
  lante: ['lante_1'],
  wushuo: ['wushuo_1'],
};

const GAL_AUTO_MESSAGE_POOL: Record<GalCharacterId, string[]> = {
  dabi: ['你礼堂那边最近夜里怎么换岗？', '我今晚有点害怕，能和你聊两句吗？', '你说的“绝对安全”，具体怎么做到的？'],
  maodun: ['礼堂后台那条撤离线还通吗？', '你别作死，我只问你消防通道。', '达璧要过去的话，最安全的是哪条路？'],
  lante: ['熊哥，WiFi还连得上吗？', '昨晚大厅没人，巡逻是不是改时间了？', '你周末那件“人生大事”到底啥时候开始？'],
  wushuo: ['我们班资料什么时候全退？', '你刚才那句我记下来了，再说一遍。', '后台见，书和资料一次说清。'],
};

const GAL_CONTINUATION_ARC: Record<GalCharacterId, Array<{ gx: Record<string, string>; npc: Record<string, string> }>> = {
  dabi: [
    { gx: { gentle: '天台门禁我已经解了，今晚就按你说的来。', humor: '我把所有闲杂人等都清出去。', confess: '你要的“单独见面”，我给你最高规格。' }, npc: { gentle: '好，记得只留你一个人。', humor: '你终于学会听指令了。', confess: '别迟到，我不喜欢等人。' } },
    { gx: { gentle: '我把机柜夹层也整理了，怕你磕到。', humor: '配电闸我亲自盯着，今晚不会断戏。', confess: '你一出现，我这局就稳了。' }, npc: { gentle: '你想得还挺周全。', humor: '看来你真把今晚当主线。', confess: '那就好好表现。' } },
    { gx: { gentle: '我会把所有退路都给你留好。', humor: '这次我不当嘴炮王，只当执行者。', confess: '十二点见，我等你上天台。' }, npc: { gentle: '记住，只能你一个人。', humor: '别再临时加戏。', confess: '不见不散。' } },
  ],
  maodun: [
    { gx: { gentle: '你那条撤离建议我照做了。', humor: '母老虎审计通过没？', confess: '达璧真出事我先扛。' }, npc: { gentle: '别贫，我要看的是结果。', humor: '你离通过还远。', confess: '记住你今天这句。' } },
    { gx: { gentle: '器材库和后台我都清过一遍。', humor: '易燃物全清零，满意了吗。', confess: '我知道你不是在和我斗气。' }, npc: { gentle: '这次总算像人做的事。', humor: '你偶尔能救自己一命。', confess: '我只是在护人。' } },
    { gx: { gentle: '今晚我要顶层行动，下面你帮我看着。', humor: '我负责演主角，你负责防翻车。', confess: '如果我失联，按你那套预案走。' }, npc: { gentle: '我会盯，但你别乱改计划。', humor: '你真把自己当电影男主。', confess: '别死撑，必要时就撤。' } },
  ],
  lante: [
    { gx: { gentle: '你那边蹭网照常，别靠近顶层。', humor: '今晚是剧情锁区，玩家止步。', confess: '过了今晚我再和你细说。' }, npc: { gentle: '懂了，我只在大厅活动。', humor: '你这公告做得很像运营。', confess: '行，我不打扰。' } },
    { gx: { gentle: '巡逻空档我改了，别半夜单走。', humor: '深渊可以打，夜路别走。', confess: '你平安我才有心情打主线。' }, npc: { gentle: '我会注意。', humor: '你总算不只会嘴炮。', confess: '那你自己也别翻车。' } },
    { gx: { gentle: '明天我给你一版完整安保图。', humor: '附赠礼堂副本攻略v2。', confess: '谢谢你一直用正常语气和我说话。' }, npc: { gentle: '那我等你文档。', humor: '记得别漏关键点。', confess: '你守约就行。' } },
  ],
  wushuo: [
    { gx: { gentle: '资料我可以还，但你得按我规则来。', humor: '你越硬，我越有兴趣。', confess: '每天来礼堂，我就不为难你们班。' }, npc: { gentle: '你还在威胁。', humor: '继续说，我录得很清楚。', confess: '你最好别后悔这句话。' } },
    { gx: { gentle: '我一句话就能让你们班安静。', humor: '查水表这种事，我说到做到。', confess: '你配合我，什么都好谈。' }, npc: { gentle: '你在滥用权力。', humor: '你以为这叫强者？', confess: '我只会把证据交出去。' } },
    { gx: { gentle: '行，那就看谁先撑不住。', humor: '你们做题家拼不过我这套。', confess: '最后你还是会回来找我。' }, npc: { gentle: '你的每句威胁都在帮我。', humor: '谢谢你自己补全证据链。', confess: '聊到这里就够了。' } },
  ],
};

const GAL_LATE_VARIANTS: Record<GalCharacterId, Record<'gentle' | 'humor' | 'confess', Array<{ gx: string; npc: string }>>> = {
  dabi: {
    gentle: [
      { gx: '我把今晚所有岗哨再过一遍，你放心。', npc: '你每次说“放心”，我都要确认细节。' },
      { gx: '你在天台待多久，我就封控多久。', npc: '那就按我给你的时间走。' },
      { gx: '放映室后门我会提前开，你不用等。', npc: '好，记得只开这一条。' },
    ],
    humor: [
      { gx: '今夜剧本只保留双人线，NPC全部下线。', npc: '别演过头，按流程来。' },
      { gx: '你是本局唯一可触发的隐藏CG。', npc: '你再中二一次我就不去了。' },
      { gx: '我把“临场发挥”这个词从词典删了。', npc: '删干净，别留缓存。' },
    ],
    confess: [
      { gx: '我今晚不争输赢，只想把你接稳。', npc: '那就别迟到，也别带人。' },
      { gx: '你一句“到”，我就开全楼绿灯。', npc: '我只要顶层那盏。' },
      { gx: '你来，我就把世界音量降到最低。', npc: '那你先学会安静。' },
    ],
  },
  maodun: {
    gentle: [
      { gx: '你要的撤离图我画好了，今晚照图走。', npc: '别光画，按图执行。' },
      { gx: '后台风口和窗沿都清过，不会卡人。', npc: '好，这才像准备。' },
      { gx: '你抽检哪一段，我就改哪一段。', npc: '那就从最烂的开始。' },
    ],
    humor: [
      { gx: '母老虎审计系统已上线，欢迎找茬。', npc: '找茬是为了救命，不是陪你玩。' },
      { gx: '我今天嘴炮额度只剩半句。', npc: '那就把那半句咽回去。' },
      { gx: '我先做事，晚点再挨你骂。', npc: '顺序终于对了。' },
    ],
    confess: [
      { gx: '我答应你的，达璧优先撤离。', npc: '记住，你答应的是“优先”。' },
      { gx: '我失联超过十分钟，你直接接管。', npc: '行，到点我就接。' },
      { gx: '这次我不逞强，撤退口你来拍板。', npc: '那就按我口令走。' },
    ],
  },
  lante: {
    gentle: [
      { gx: '今晚大厅照常开网，顶层继续封。', npc: '收到，我只在安全区。' },
      { gx: '你常走的那条线我加了标识灯。', npc: '好，这样不容易走错。' },
      { gx: '我把巡逻表缩成一页发你。', npc: '简洁版好评。' },
    ],
    humor: [
      { gx: '礼堂副本更新：顶层Boss房暂时禁入。', npc: '运营公告写得还挺像。' },
      { gx: '你继续开黑，我去打现实高难。', npc: '别团灭就行。' },
      { gx: '我今天主要成就是没突然发病。', npc: '这成就值得反复刷。' },
    ],
    confess: [
      { gx: '我想把“保护你”从口头改成流程。', npc: '那就把流程守住。' },
      { gx: '你在，我比较像一个正常人。', npc: '那就继续正常下去。' },
      { gx: '谢谢你一直没把我当怪物。', npc: '那你也别活成怪物。' },
    ],
  },
  wushuo: {
    gentle: [
      { gx: '资料去留我说了算，你自己选。', npc: '这句我已记录。' },
      { gx: '我给你台阶，你别不识抬举。', npc: '你的台阶就是威胁。' },
      { gx: '你们班想平安，就按我的规矩来。', npc: '规矩？你配吗。' },
    ],
    humor: [
      { gx: '你每次怼我，我都更想加码。', npc: '继续，这句也进证据包。' },
      { gx: '别把我逼急，我手里名单很长。', npc: '你终于把话说完整了。' },
      { gx: '我一句话能让你们全班熬通宵。', npc: '那就让全校看看你这句。' },
    ],
    confess: [
      { gx: '你跟我走，我就把资料全放。', npc: '这不是示好，是勒索。' },
      { gx: '你是例外，我给你特殊待遇。', npc: '你的“特殊”只会成为证据。' },
      { gx: '最后问一遍，站我这边。', npc: '最后答一遍：不。' },
    ],
  },
};

export default function App() {
  // Menu system states
  const [appMode, setAppMode] = useState<'menu' | 'loading' | 'game'>('menu');
  const [currentMenuPage, setCurrentMenuPage] = useState<'main' | 'tutorial' | 'settings'>(
    'main'
  );

  const [shake, setShake] = useState(false);
  const [showFocusTree, setShowFocusTree] = useState(false);
  const [isAssemblyOpen, setIsAssemblyOpen] = useState(false);
  const [isReformCommitteeOpen, setIsReformCommitteeOpen] = useState(false);
  const [isCyberDeconstructionOpen, setIsCyberDeconstructionOpen] = useState(false);
  const [isGouxiongGalOpen, setIsGouxiongGalOpen] = useState(false);
  const [isYangYuleDeskOpen, setIsYangYuleDeskOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleInput, setConsoleInput] = useState('');
  const [isInGameMenuOpen, setIsInGameMenuOpen] = useState(false);
  const [isElectionUIOpen, setIsElectionUIOpen] = useState(true);
  const [isJidiCorporateUIOpen, setIsJidiCorporateUIOpen] = useState(false);
  const [isRedToadPolitburoOpen, setIsRedToadPolitburoOpen] = useState(false);

  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const gameStateRef = useRef(gameState);
  const wasPausedBeforeMenuRef = useRef(true);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (appMode !== 'game') return;
    if (gameState.date.getDate() !== 1) return;

    const monthKey = `${gameState.date.getFullYear()}-${gameState.date.getMonth() + 1}`;
    const savedMonthKey = localStorage.getItem('autoSaveMonthlyMeta');
    if (savedMonthKey === monthKey) return;

    localStorage.setItem('autoSaveMonthly', serializeGameState(gameState));
    localStorage.setItem('autoSaveMonthlyMeta', monthKey);
  }, [appMode, gameState, gameState.date]);

  const serializeGameState = (state: GameState) => {
    return JSON.stringify({
      ...state,
      date: state.date.toISOString(),
    });
  };

  const deserializeGameState = (raw: string): GameState | null => {
    try {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        date: new Date(parsed.date),
      } as GameState;
    } catch {
      return null;
    }
  };

  const handleRestart = () => {
    setGameState(INITIAL_GAME_STATE);
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerError = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, []);

  const handleCyberDeconstructInteract = (action: string, payload?: any) => {
    setGameState(prev => {
      const newState = { ...prev, stats: { ...prev.stats } };
      const cdState = {
        ...(prev.cyberDeconstruction || { level: 1, progress: 0, currentWork: 'demon_slayer', stage: 1, ratings: {}, reviewedWorks: [], workProgress: {} }),
        ratings: { ...(prev.cyberDeconstruction?.ratings || {}) },
        reviewedWorks: [...(prev.cyberDeconstruction?.reviewedWorks || [])],
        workProgress: { ...(prev.cyberDeconstruction?.workProgress || {}) },
      };
      const gxState = prev.gouxiongState
        ? {
            ...prev.gouxiongState,
            affinities: { ...prev.gouxiongState.affinities },
            unlockedCharacters: [...prev.gouxiongState.unlockedCharacters],
            chats: { ...prev.gouxiongState.chats },
            dailyChatState: prev.gouxiongState.dailyChatState
              ? {
                  ...prev.gouxiongState.dailyChatState,
                  incomingByCharacter: { ...(prev.gouxiongState.dailyChatState.incomingByCharacter || {}) },
                }
              : undefined,
          }
        : {
            sanity: 50,
            maxSanity: 100,
            affinities: { dabi: 10, maodun: 0, lante: 0, wushuo: 0 },
            unlockedCharacters: ['dabi'],
            chats: {},
            dailyChatState: {
              dateKey: prev.date.toISOString().split('T')[0],
              sentCount: 0,
              blocked: false,
              incomingByCharacter: {},
            },
          };
      const ratingUnlocked = !!prev.flags?.gx_cyber_rating_online;
      const todayKey = prev.date.toISOString().split('T')[0];
      
      if (action === 'cyber_deconstruct') {
        const cost = payload.cost;
        const workId = String(payload?.workId || cdState.currentWork);
        const dailyLockKey = `gx_cyber_daily_lock_${workId}`;
        if (!ratingUnlocked && prev.flags?.[dailyLockKey] === todayKey) {
          return prev;
        }
        const rating = ratingUnlocked ? Number(cdState.ratings?.[cdState.currentWork] || 0) : 6;
        if (newState.stats.pp >= cost && rating > 0) {
          const currentBefore = Number(cdState.workProgress?.[workId] || 0);
          newState.stats.pp -= cost;
          const progressGain = 12 + rating * 2;
          const next = Math.min(100, currentBefore + progressGain);
          cdState.workProgress[workId] = next;
          cdState.progress = next;
          const ongoingSanityGain = 0;
          let completionBonus = 0;
          if (currentBefore < 100 && next >= 100) {
            completionBonus = Math.round(10 + rating * 2.2);
          }
          gxState.sanity = Math.min(gxState.maxSanity, gxState.sanity + ongoingSanityGain + completionBonus);
          newState.stats.radicalAnger = Math.min(100, newState.stats.radicalAnger + Math.max(1, Math.floor(rating / 3)));
          if (!ratingUnlocked) {
            newState.flags = { ...newState.flags, [dailyLockKey]: todayKey };
          }

          if (currentBefore === 0) {
            newState.isPaused = true;
            newState.activeEvent = STORY_EVENTS[`gx_cyber_start_${workId}`] || {
              id: `gx_cyber_start_${workId}`,
              title: '赛博解构启动',
              description: '该作品首次进入解构流程。',
              buttonText: '继续',
              isStoryEvent: true,
            };
          } else if (currentBefore < 100 && next >= 100) {
            newState.isPaused = true;
            newState.activeEvent = STORY_EVENTS[`gx_cyber_complete_${workId}`] || {
              id: `gx_cyber_complete_${workId}`,
              title: '赛博解构完成',
              description: '该作品完成首轮完整解构。',
              buttonText: '继续',
              isStoryEvent: true,
            };
          }
        }
      } else if (action === 'cyber_rate') {
        if (!ratingUnlocked) {
          return prev;
        }
        const score = Math.max(1, Math.min(10, Number(payload?.score || 0)));
        const workId = String(payload?.workId || cdState.currentWork);
        cdState.ratings[workId] = score;
        if (!cdState.reviewedWorks.includes(workId)) cdState.reviewedWorks.push(workId);
      } else if (action === 'cyber_select_work') {
        const workId = String(payload?.workId || cdState.currentWork);
        cdState.currentWork = workId;
        cdState.progress = Number(cdState.workProgress?.[workId] || 0);
      } else if (action === 'cyber_next_work') {
        const current = Number(cdState.workProgress?.[cdState.currentWork] || cdState.progress || 0);
        if (current >= 100) {
          const sequence = ['demon_slayer', 'aot', 'takagi', 'mygo', 'frieren', 'bochi', 'eva'];
          const idx = sequence.indexOf(cdState.currentWork);
          const nextWork = sequence[(idx + 1 + sequence.length) % sequence.length];
          cdState.currentWork = nextWork;
          cdState.progress = Number(cdState.workProgress?.[nextWork] || 0);
          cdState.level += 1;
        }
      }

      return { ...newState, cyberDeconstruction: cdState, gouxiongState: gxState };
    });
  };

  const handleGouxiongGalInteract = (action: string, payload?: any) => {
    setGameState(prev => {
      if (action !== 'gouxiong_gal_choice') return prev;

      const gxState = prev.gouxiongState
        ? {
            ...prev.gouxiongState,
            affinities: { ...prev.gouxiongState.affinities },
            unlockedCharacters: [...prev.gouxiongState.unlockedCharacters],
            chats: { ...prev.gouxiongState.chats },
            dialogueProgress: { ...(prev.gouxiongState.dialogueProgress || {}) },
            dailyChatState: prev.gouxiongState.dailyChatState
              ? {
                  ...prev.gouxiongState.dailyChatState,
                  incomingByCharacter: { ...(prev.gouxiongState.dailyChatState.incomingByCharacter || {}) },
                }
              : undefined,
          }
        : {
          sanity: 50,
            maxSanity: 100,
            affinities: { dabi: 10, maodun: 0, lante: 0, wushuo: 0 },
            unlockedCharacters: ['dabi'],
            chats: {},
            dialogueProgress: { dabi: 0, maodun: 0, lante: 0, wushuo: 0 },
            dailyChatState: {
              dateKey: prev.date.toISOString().split('T')[0],
              sentCount: 0,
              blocked: false,
              incomingByCharacter: {},
            },
          };

      const characterId = String(payload?.characterId || 'dabi') as 'dabi' | 'maodun' | 'lante' | 'wushuo';
      const choiceId = String(payload?.choiceId || 'gentle') as GalChoiceId;
      const sanityCost = Math.max(0, Number(payload?.sanityCost || 0));
      if (gxState.sanity < sanityCost) return prev;

      const todayKey = prev.date.toISOString().split('T')[0];
      const chatState = gxState.dailyChatState && gxState.dailyChatState.dateKey === todayKey
        ? gxState.dailyChatState
        : { dateKey: todayKey, sentCount: 0, blocked: false, incomingByCharacter: {} as Record<string, number> };
      if (chatState.blocked) {
        return {
          ...prev,
          gouxiongState: { ...gxState, dailyChatState: chatState },
          isPaused: true,
          activeEvent: {
            id: `gx_gal_blocked_${todayKey}`,
            title: '今日聊天中止',
            description: '对方今天已经不再回复消息，等明天再尝试。',
            buttonText: '知道了',
            isStoryEvent: true,
          },
        };
      }

      chatState.sentCount += 1;

      const stopReplyThreshold: Record<GalCharacterId, number> = {
        dabi: 54,
        maodun: 48,
        lante: 42,
        wushuo: 50,
      };
      if (chatState.sentCount >= 1 && (gxState.affinities[characterId] || 0) < stopReplyThreshold[characterId]) {
        const stopChance = Math.min(0.75, 0.24 + Math.max(0, chatState.sentCount - 1) * 0.12 + Math.max(0, (stopReplyThreshold[characterId] - (gxState.affinities[characterId] || 0)) / 140));
        if (Math.random() < stopChance) {
          chatState.blocked = true;
          const chat = [...(gxState.chats[characterId] || [])];
          chat.push({ from: 'gx', text: GAL_FALLBACK_LINE_BY_CHOICE[choiceId] || '我再补一条。', ts: `${Date.now()}_gx_blocked` });
          chat.push({ from: 'npc', text: '……（对方已读未回）', ts: `${Date.now()}_npc_blocked` });
          gxState.chats[characterId] = chat;
          gxState.dailyChatState = chatState;
          return {
            ...prev,
            gouxiongState: gxState,
            isPaused: true,
            activeEvent: {
              id: `gx_gal_no_reply_${characterId}_${todayKey}`,
              title: '对方结束了今天的聊天',
              description: '今天的消息频率过高，对方选择中止回应。',
              buttonText: '明天再聊',
              isStoryEvent: true,
            },
          };
        }
      }

      gxState.sanity = Math.max(0, gxState.sanity - sanityCost);

      const chain = GAL_DIALOGUE_TREE[characterId as GalCharacterId] || GAL_DIALOGUE_TREE.dabi;
      const progress = gxState.dialogueProgress?.[characterId] || 0;
      const nodeIndex = Math.min(progress, chain.length - 1);
      const node = chain[nodeIndex];
      const normalizedChoiceId = GAL_CHOICE_NORMALIZER[choiceId] || choiceId;
      const delta = progress < chain.length ? (node?.affinity?.[normalizedChoiceId] ?? 0) : 1;
      gxState.affinities[characterId] = Math.max(0, Math.min(100, (gxState.affinities[characterId] || 0) + delta));

      const sanityRefund = progress < chain.length
        ? Math.max(0, Number(node?.sanity?.[normalizedChoiceId] ?? (delta >= 6 ? 4 : delta >= 4 ? 2 : delta >= 2 ? 1 : 0)))
        : 0;
      if (sanityRefund > 0) {
        gxState.sanity = Math.min(gxState.maxSanity, gxState.sanity + sanityRefund);
      }

      const ts = `${Date.now()}`;
      const chat = [...(gxState.chats[characterId] || [])];
      const continuationChain = GAL_CONTINUATION_ARC[characterId as GalCharacterId] || GAL_CONTINUATION_ARC.dabi;
      const continuationIndex = Math.min(Math.floor(Math.max(0, progress - chain.length) / 2), continuationChain.length - 1);
      const continuationNode = continuationChain[continuationIndex];
      const lateVariantPool = GAL_LATE_VARIANTS[characterId as GalCharacterId]?.[normalizedChoiceId as 'gentle' | 'humor' | 'confess'] || [];
      const lateVariant = progress >= chain.length && lateVariantPool.length > 0
        ? lateVariantPool[Math.floor(Math.random() * lateVariantPool.length)]
        : null;
      const gxLine = progress < chain.length
        ? (node?.gx?.[normalizedChoiceId] || '我换种说法，我们再聊一次。')
        : (lateVariant?.gx || continuationNode?.gx?.[normalizedChoiceId] || GAL_FALLBACK_LINE_BY_CHOICE[choiceId] || '我认真表达，但不越界。');
      const npcLine = progress < chain.length
        ? (node?.npc?.[normalizedChoiceId] || '我听到了，继续用行动证明。')
        : (lateVariant?.npc || continuationNode?.npc?.[normalizedChoiceId] || '我听到了，我们继续。');
      chat.push({ from: 'gx', text: gxLine, ts: `${ts}_gx` });
      chat.push({ from: 'npc', text: npcLine, ts: `${ts}_npc` });

      const choicePhoto = node?.photo?.[normalizedChoiceId];
      if (choicePhoto) {
        if (GOUXIONG_GAL_PHOTO_ASSETS[choicePhoto]) {
          chat.push({ from: 'npc', text: `[照片:${choicePhoto}]`, ts: `${ts}_photo_choice` });
        } else {
          chat.push({ from: 'npc', text: choicePhoto, ts: `${ts}_photo_choice` });
        }
      }

      const maybePhoto = GAL_PHOTO_POOL[characterId as GalCharacterId];
      if (!choicePhoto && maybePhoto && (progress + 1) % 5 === 0 && (gxState.affinities[characterId] || 0) >= 35) {
        const photoKey = maybePhoto[Math.floor(progress / 5) % maybePhoto.length];
        chat.push({ from: 'npc', text: `[照片:${photoKey}]`, ts: `${ts}_photo_cycle` });
      }

      gxState.chats[characterId] = chat;
      const nextDialogueProgress = (gxState.dialogueProgress?.[characterId] || 0) + 1;
      gxState.dialogueProgress = {
        ...(gxState.dialogueProgress || {}),
        [characterId]: nextDialogueProgress,
      };
      gxState.dailyChatState = chatState;

      const newFlags = { ...prev.flags };
      let triggeredStoryEvent: any = null;

      if (
        characterId === 'dabi' &&
        normalizedChoiceId === 'confess' &&
        nextDialogueProgress >= 10 &&
        (gxState.affinities.dabi || 0) >= 88 &&
        !newFlags['gx_dabi_rooftop_invite_story_event_triggered']
      ) {
        newFlags['gx_dabi_rooftop_invite_story_event_triggered'] = true;
        triggeredStoryEvent = STORY_EVENTS.gx_dabi_rooftop_invite_story_event;
      }

      if (
        characterId === 'wushuo' &&
        (normalizedChoiceId === 'humor' || normalizedChoiceId === 'confess') &&
        nextDialogueProgress >= 10 &&
        (gxState.affinities.wushuo || 0) >= 60 &&
        !newFlags['gx_wushuo_evidence_submit_story_event_triggered']
      ) {
        newFlags['gx_wushuo_evidence_submit_story_event_triggered'] = true;
        triggeredStoryEvent = STORY_EVENTS.gx_wushuo_evidence_submit_story_event;
      }

      const characterNameMap: Record<GalCharacterId, string> = {
        dabi: '达璧',
        maodun: '毛盾',
        lante: '兰特',
        wushuo: '吴蒴',
      };

      return {
        ...prev,
        gouxiongState: gxState,
        flags: newFlags,
        ...(triggeredStoryEvent
          ? {
              isPaused: true,
              activeEvent: triggeredStoryEvent,
            }
          : sanityRefund > 0
          ? {
              isPaused: true,
              activeEvent: {
                id: `gx_gal_positive_feedback_${characterId}_${ts}`,
                title: '聊天正反馈',
                description: `${characterNameMap[characterId]}的反馈让你暂时稳住了情绪，理智恢复 ${sanityRefund}。`,
                buttonText: '继续聊天',
                isStoryEvent: true,
              },
            }
          : {}),
      };
    });
  };

  const handleAssemblyInteract = (factionId: string, action: 'coopt' | 'suppress' | 'compromise' | 'special_true_left' | 'special_pan_dem_1' | 'special_pan_dem_2' | 'negotiate_orthodox' | 'negotiate_bear' | 'negotiate_pan' | 'negotiate_otherDem' | 'negotiate_testTaker' | 'negotiate_conservativeDem' | 'negotiate_jidiTutoring' | 'support_bill' | 'oppose_bill' | 'haobang_merge_bear' | 'haobang_merge_pan' | 'haobang_floor_coordination') => {
    setGameState(prev => {
      const newState = { ...prev, stats: { ...prev.stats } };
      const factions = { ...(prev.studentAssemblyFactions || INITIAL_GAME_STATE.studentAssemblyFactions!) };
      let newParliamentState = prev.parliamentState
        ? {
            ...prev.parliamentState,
            factionSupport: { ...prev.parliamentState.factionSupport },
            haobangFactionAttitude: prev.parliamentState.haobangFactionAttitude
              ? { ...prev.parliamentState.haobangFactionAttitude }
              : undefined,
          }
        : undefined;
      
      const defaultSupport: Record<string, number> = {
        orthodox: 10,
        bear: 30,
        pan: 100,
        otherDem: 70,
        testTaker: 50,
        conservativeDem: 40,
        jidiTutoring: 20
      };
      const defaultHaobangAttitude: Record<string, number> = {
        orthodox: 100,
        bear: 75,
        pan: 35,
        otherDem: 45,
        testTaker: 55,
        conservativeDem: 40,
        jidiTutoring: 15,
      };
      const isHaobangDeluxe = !!prev.flags.haobang_assembly_deluxe_ui;

      if (isHaobangDeluxe && newParliamentState && !newParliamentState.haobangFactionAttitude) {
        newParliamentState.haobangFactionAttitude = { ...defaultHaobangAttitude };
      }

      const updateHaobangAttitude = (targetFactionId: string, delta: number) => {
        if (!isHaobangDeluxe || !newParliamentState?.haobangFactionAttitude) return;
        const current = newParliamentState.haobangFactionAttitude[targetFactionId] ?? defaultHaobangAttitude[targetFactionId] ?? 50;
        newParliamentState.haobangFactionAttitude[targetFactionId] = Math.max(0, Math.min(100, current + delta));
      };

      if (action === 'support_bill') {
        newState.isPaused = true;
        newState.activeEvent = FLAVOR_EVENTS.support_bill_event;
        newState.parliamentState = newParliamentState;
        return newState;
      }

      if (action === 'oppose_bill') {
        newState.isPaused = true;
        newState.activeEvent = FLAVOR_EVENTS.oppose_bill_event;
        newState.parliamentState = newParliamentState;
        return newState;
      }

      if (action.startsWith('negotiate_')) {
        if (newParliamentState?.activeBill) {
          newParliamentState.activeBill = {
            ...newParliamentState.activeBill,
            interactionsRemaining: Math.max(0, newParliamentState.activeBill.interactionsRemaining - 1),
            interactedFactions: [...newParliamentState.activeBill.interactedFactions, action.split('_')[1]]
          };
        }
        newState.isPaused = true;
        switch (action) {
          case 'negotiate_orthodox': newState.activeEvent = FLAVOR_EVENTS.negotiate_orthodox; break;
          case 'negotiate_bear': newState.activeEvent = FLAVOR_EVENTS.negotiate_bear; break;
          case 'negotiate_pan': newState.activeEvent = FLAVOR_EVENTS.negotiate_pan; break;
          case 'negotiate_otherDem': newState.activeEvent = FLAVOR_EVENTS.negotiate_otherDem; break;
          case 'negotiate_testTaker': newState.activeEvent = FLAVOR_EVENTS.negotiate_testTaker; break;
          case 'negotiate_conservativeDem': newState.activeEvent = FLAVOR_EVENTS.negotiate_conservativeDem; break;
          case 'negotiate_jidiTutoring': newState.activeEvent = FLAVOR_EVENTS.negotiate_jidiTutoring; break;
        }
        newState.parliamentState = newParliamentState;
        return newState;
      }
      
      if (action === 'coopt' && newState.stats.pp >= 10) {
        newState.stats.pp -= 10;
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 10);
        newState.stats.partyCentralization = Math.max(0, newState.stats.partyCentralization - 5);
        if (newParliamentState) newParliamentState.factionSupport[factionId] = Math.min(100, (newParliamentState.factionSupport[factionId] ?? defaultSupport[factionId] ?? 0) + 10);
        updateHaobangAttitude(factionId, 8);
      } else if (action === 'suppress' && newState.stats.pp >= 15) {
        newState.stats.pp -= 15;
        newState.stats.partyCentralization = Math.min(100, newState.stats.partyCentralization + 5);
        newState.stats.allianceUnity = Math.max(0, newState.stats.allianceUnity - 5);
        if (newParliamentState) newParliamentState.factionSupport[factionId] = Math.max(0, (newParliamentState.factionSupport[factionId] ?? defaultSupport[factionId] ?? 0) - 10);
        updateHaobangAttitude(factionId, -10);
      } else if (action === 'compromise') {
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 10);
        newState.stats.partyCentralization = Math.max(0, newState.stats.partyCentralization - 10);
        if (newParliamentState) newParliamentState.factionSupport[factionId] = Math.min(100, (newParliamentState.factionSupport[factionId] ?? defaultSupport[factionId] ?? 0) + 20);
        updateHaobangAttitude(factionId, 12);
        
        const isUpgraded = prev.parliamentState?.isUpgraded;
        const leadingFaction = isUpgraded ? 'pan' : 'orthodox';
        
        if (factionId !== leadingFaction && (factions[leadingFaction as keyof typeof factions] || 0) > 0) {
          factions[leadingFaction as keyof typeof factions] -= 1;
          factions[factionId as keyof typeof factions] += 1;
        }
      } else if (action === 'special_true_left' && newState.stats.pp >= 20) {
        newState.stats.pp -= 20;
        newState.stats.partyCentralization = Math.min(100, newState.stats.partyCentralization + 5);
        newState.stats.allianceUnity = Math.max(0, newState.stats.allianceUnity - 5);
        
        // +2 orthodox, -2 from others
        factions.orthodox += 2;
        let reduced = 0;
        const otherFactions = ['bear', 'pan', 'otherDem', 'testTaker'] as const;
        for (const f of otherFactions) {
          if (factions[f] > 0 && reduced < 2) {
            factions[f] -= 1;
            reduced += 1;
          }
        }
      } else if (action === 'special_pan_dem_1' && newState.stats.pp >= 25) {
        newState.stats.pp -= 25;
        newState.decisionCooldowns['special_pan_dem_1'] = 10;
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 5);
        newState.stats.partyCentralization = Math.max(0, newState.stats.partyCentralization - 5);
        
        if (factions.orthodox >= 2) {
          factions.orthodox -= 2;
          factions.pan += 2;
        } else if (factions.orthodox === 1) {
          factions.orthodox -= 1;
          factions.pan += 1;
        }
      } else if (action === 'special_pan_dem_2' && newState.stats.pp >= 25) {
        newState.stats.pp -= 25;
        newState.decisionCooldowns['special_pan_dem_2'] = 10;
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 10);
        newState.stats.partyCentralization = Math.max(0, newState.stats.partyCentralization - 10);
        
        if (factions.orthodox >= 1) {
          factions.orthodox -= 1;
          factions.otherDem += 1;
        }
      } else if (action === 'haobang_merge_bear' && newState.stats.pp >= 15 && prev.flags.haobang_bear_merge_ready && !prev.flags.haobang_bear_merged) {
        const bearSeats = factions.bear || 0;
        newState.stats.pp -= 15;
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 6);
        newState.stats.stab = Math.min(100, newState.stats.stab + 3);
        if (bearSeats > 0) {
          factions.orthodox = (factions.orthodox || 0) + bearSeats;
          factions.bear = 0;
        }
        newState.flags = {
          ...newState.flags,
          haobang_bear_merged: true,
          haobang_bear_merge_ready: false,
        };
        updateHaobangAttitude('orthodox', 5);
        updateHaobangAttitude('bear', 25);
        newState.isPaused = true;
        newState.activeEvent = {
          id: 'haobang_merge_bear_done',
          title: '并席完成：狗熊并红蛤',
          description: '学生大会完成狗熊派并席整编，钢铁红蛤席位结构得到重组。',
          buttonText: '继续',
          isStoryEvent: true,
        };
      } else if (action === 'haobang_merge_pan' && newState.stats.pp >= 20 && prev.flags.haobang_pan_merge_ready && !prev.flags.haobang_pan_merged) {
        const panSeats = factions.pan || 0;
        newState.stats.pp -= 20;
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 8);
        newState.stats.ss = Math.min(100, newState.stats.ss + 6);
        if (panSeats > 0) {
          factions.orthodox = (factions.orthodox || 0) + panSeats;
          factions.pan = 0;
        }
        newState.flags = {
          ...newState.flags,
          haobang_pan_merged: true,
          haobang_pan_merge_ready: false,
        };
        updateHaobangAttitude('orthodox', 4);
        updateHaobangAttitude('pan', 30);
        newState.isPaused = true;
        newState.activeEvent = {
          id: 'haobang_merge_pan_done',
          title: '并席完成：潘并红蛤',
          description: '学生大会通过并席条款，潘仁越派完成并入钢铁红蛤席位体系。',
          buttonText: '继续',
          isStoryEvent: true,
        };
      } else if (action === 'haobang_floor_coordination' && newState.stats.pp >= 10) {
        newState.stats.pp -= 10;
        newState.decisionCooldowns['haobang_floor_coordination'] = 8;
        newState.stats.allianceUnity = Math.min(100, newState.stats.allianceUnity + 5);
        newState.stats.partyCentralization = Math.max(0, newState.stats.partyCentralization - 2);
        if ((factions.testTaker || 0) > 0) {
          factions.testTaker -= 1;
          factions.otherDem += 1;
        }
        updateHaobangAttitude('otherDem', 6);
        updateHaobangAttitude('testTaker', 4);
      }
      
      newState.studentAssemblyFactions = factions;
      if (newParliamentState) newState.parliamentState = newParliamentState;
      return newState;
    });
  };

  // Game Loop
  useEffect(() => {
    if (gameState.isPaused || gameState.activeEvent || gameState.activeSuperEvent || gameState.activeMinigame || gameState.gameEnding) return;

    const speedMap: Record<number, number> = {
      1: 1000,
      2: 500,
      3: 100
    };
    const delay = speedMap[gameState.gameSpeed] || 1000;

    const interval = setInterval(() => {
      setGameState(prev => {
        let newFlags = { ...prev.flags };
        let newActiveEvent = prev.activeEvent;
        let newActiveStoryEvents = [...prev.activeStoryEvents];
        let newLeader = prev.leader;
        let newIdeologies = prev.ideologies;
        let newMapLocations = JSON.parse(JSON.stringify(prev.mapLocations));
        let newGameEnding = prev.gameEnding;
        let newCurrentFocusTree = prev.currentFocusTree;
        
        const newDate = new Date(prev.date);
        newDate.setDate(newDate.getDate() + 1);
        const dateStr = newDate.toISOString().split('T')[0];

        const queueEvent = (event: any) => {
          if (!newActiveEvent) {
            newActiveEvent = event;
          } else {
            newActiveStoryEvents.push(event);
          }
        };

        let newStudentAssemblyFactions = prev.studentAssemblyFactions ? { ...prev.studentAssemblyFactions } : undefined;
        let newParliamentState = prev.parliamentState ? { ...prev.parliamentState } : undefined;
        let newElectionState = prev.electionState ? JSON.parse(JSON.stringify(prev.electionState)) as NonNullable<GameState['electionState']> : undefined;
        let newJidiCorporateState = prev.jidiCorporateState ? JSON.parse(JSON.stringify(prev.jidiCorporateState)) as NonNullable<GameState['jidiCorporateState']> : undefined;
        let newRedToadState = prev.redToadState ? { ...prev.redToadState } : undefined;
        if (newJidiCorporateState && newJidiCorporateState.unlockedMechanics.rnd && !newJidiCorporateState.rndState) {
          newJidiCorporateState.rndState = {
            phase: 'idle',
            daysInPhase: 0,
            testingIntensity: 5,
            daysSinceLastIntensityChange: 0,
          };
        }

        if (newJidiCorporateState && newJidiCorporateState.rndState) {
          newJidiCorporateState.rndState.hasInteractedToday = false;
        }

        const thresholdKeyMap: Array<{ value: number; mode: 'below' | 'above'; flag: string; eventId: string }> = [
          { value: 40, mode: 'below', flag: 'gx_sanity_first_below_40', eventId: 'gx_sanity_first_below_40_event' },
          { value: 30, mode: 'below', flag: 'gx_sanity_first_below_30', eventId: 'gx_sanity_first_below_30_event' },
          { value: 20, mode: 'below', flag: 'gx_sanity_first_below_20', eventId: 'gx_sanity_first_below_20_event' },
          { value: 10, mode: 'below', flag: 'gx_sanity_first_below_10', eventId: 'gx_sanity_first_below_10_event' },
          { value: 70, mode: 'above', flag: 'gx_sanity_first_above_70', eventId: 'gx_sanity_first_above_70_event' },
          { value: 80, mode: 'above', flag: 'gx_sanity_first_above_80', eventId: 'gx_sanity_first_above_80_event' },
          { value: 90, mode: 'above', flag: 'gx_sanity_first_above_90', eventId: 'gx_sanity_first_above_90_event' },
        ];

        if (newJidiCorporateState && newJidiCorporateState.riotState && !newFlags['jidi_riot_failed'] && !newFlags['jidi_riot_won']) {
          newJidiCorporateState.riotState.studentAnger = Math.min(100, newJidiCorporateState.riotState.studentAnger + 1);
          newJidiCorporateState.riotState.bureauAnger = Math.min(100, newJidiCorporateState.riotState.bureauAnger + 0.5);
          
          const progressIncrease = (newJidiCorporateState.riotState.studentAnger / 100) * 3 + (newJidiCorporateState.riotState.bureauAnger / 100) * 2;
          newJidiCorporateState.riotState.progress = Math.min(100, newJidiCorporateState.riotState.progress + progressIncrease);

          if (newJidiCorporateState.riotState.daysActive === undefined) {
            newJidiCorporateState.riotState.daysActive = 0;
          }
          newJidiCorporateState.riotState.daysActive += 1;

          if (newJidiCorporateState.riotState.daysActive === 10) {
            queueEvent(STORY_EVENTS.jidi_riot_lockdown_1);
          } else if (newJidiCorporateState.riotState.daysActive === 15) {
            queueEvent(STORY_EVENTS.jidi_riot_lockdown_2);
          } else if (newJidiCorporateState.riotState.daysActive === 20) {
            queueEvent(STORY_EVENTS.jidi_riot_lockdown_3);
          }

          if (newJidiCorporateState.riotState.progress >= 100 && !newFlags['jidi_riot_failed']) {
            newFlags['jidi_riot_failed'] = true;
            queueEvent(STORY_EVENTS.jidi_ending_1_event);
          } else if (newJidiCorporateState.riotState.progress <= 0 && !newFlags['jidi_riot_won']) {
            if (prev.stats.stab >= 100 && prev.stats.studentSanity >= 100) {
              newFlags['jidi_riot_won'] = true;
              queueEvent(STORY_EVENTS.jidi_ending_4_event);
            }
          }
        }

        const checkFocusEvent = (focusId: string, days: number, event: any) => {
          const flagKey = `focus_completed_date_${focusId}`;
          const eventFlagKey = `event_triggered_${event.id}`;
          if (newFlags[flagKey] && !newFlags[eventFlagKey]) {
            const daysPassed = (newDate.getTime() - newFlags[flagKey]) / (1000 * 60 * 60 * 24);
            if (daysPassed >= days) {
              newFlags[eventFlagKey] = true;
              queueEvent(event);
            }
          }
        };

        const checkFocusStartEvent = (focusId: string, days: number, event: any) => {
          const flagKey = `focus_started_date_${focusId}`;
          const eventFlagKey = `event_triggered_${event.id}`;
          if (newFlags[flagKey] && !newFlags[eventFlagKey]) {
            const daysPassed = (newDate.getTime() - newFlags[flagKey]) / (1000 * 60 * 60 * 24);
            if (daysPassed >= days) {
              newFlags[eventFlagKey] = true;
              queueEvent(event);
            }
          }
        };

        if (newJidiCorporateState) {
          checkFocusEvent('jidi_establish_committee', 5, STORY_EVENTS.jidi_story_committee_5d);
          checkFocusEvent('jidi_performance_metrics', 5, STORY_EVENTS.jidi_story_kpi_5d);
          checkFocusEvent('jidi_performance_metrics', 6, STORY_EVENTS.lost_scroll_1);
          checkFocusEvent('jidi_performance_metrics', 25, STORY_EVENTS.jidi_story_kpi_25d);
          checkFocusEvent('jidi_performance_metrics', 26, STORY_EVENTS.lost_scroll_2);
          checkFocusEvent('jidi_performance_metrics', 35, STORY_EVENTS.jidi_story_kpi_35d);
          checkFocusEvent('jidi_performance_metrics', 35, STORY_EVENTS.lost_scroll_3); // 10 days after 无限螺旋 3 (which is 25 days) -> 35 days
          checkFocusEvent('jidi_monopoly', 5, STORY_EVENTS.jidi_story_monopoly_5d);
          checkFocusEvent('jidi_monopoly', 6, STORY_EVENTS.lost_scroll_4);
          checkFocusEvent('jidi_monopoly', 15, STORY_EVENTS.jidi_story_monopoly_15d);
          checkFocusEvent('jidi_monopoly', 25, STORY_EVENTS.jidi_story_monopoly_25d);
          checkFocusEvent('jidi_corporate_utopia', 1, STORY_EVENTS.jidi_story_utopia_1d);
          checkFocusEvent('jidi_corporate_utopia', 2, STORY_EVENTS.jidi_story_utopia_2d);
          checkFocusEvent('jidi_corporate_utopia', 3, STORY_EVENTS.jidi_story_utopia_3d);
          checkFocusEvent('jidi_corporate_utopia', 5, STORY_EVENTS.lost_scroll_5);
          checkFocusEvent('jidi_corporate_utopia', 7, STORY_EVENTS.lost_scroll_6);
          checkFocusEvent('jidi_hidden_riot', 5, STORY_EVENTS.jidi_riot_event_5d);
          checkFocusEvent('jidi_hidden_riot', 25, STORY_EVENTS.jidi_riot_event_10d);
          checkFocusEvent('jidi_hidden_riot', 27, STORY_EVENTS.jidi_riot_event_15d);
        }

        checkFocusEvent('declare_victory', 1, STORY_EVENTS.red_toad_1);
        checkFocusEvent('declare_victory', 2, STORY_EVENTS.red_toad_2);
        checkFocusEvent('declare_victory', 3, STORY_EVENTS.red_toad_3);
        checkFocusEvent('declare_victory', 4, STORY_EVENTS.red_toad_4);
        checkFocusEvent('declare_victory', 5, STORY_EVENTS.red_toad_5);
        checkFocusEvent('haobang_start', 4, STORY_EVENTS.haobang_start_4d_event);
        checkFocusEvent('haobang_start', 8, STORY_EVENTS.haobang_start_8d_event);
        checkFocusEvent('gouxiong_accident', 3, STORY_EVENTS.haobang_gouxiong_3d_event);
        checkFocusEvent('gouxiong_accident', 6, STORY_EVENTS.haobang_gouxiong_6d_event);
        checkFocusEvent('gouxiong_accident', 9, STORY_EVENTS.haobang_gouxiong_9d_event);
        checkFocusStartEvent('gx_dabi_route_trial', 5, STORY_EVENTS.gx_dabi_route_trial_5d_event);
        checkFocusStartEvent('gx_dabi_route_trial', 10, STORY_EVENTS.gx_dabi_route_trial_10d_event);
        checkFocusEvent('gx_embarrass_settlement', 2, STORY_EVENTS.gx_embarrass_settlement_2d_event);
        checkFocusEvent('gx_embarrass_settlement', 3, STORY_EVENTS.gx_embarrass_ending_event);
        checkFocusEvent('gx_redeem_settlement', 2, STORY_EVENTS.gx_redeem_settlement_2d_event);
        checkFocusEvent('gx_redeem_settlement', 3, STORY_EVENTS.gx_redeem_ending_event);

        let newNationalSpirits = [...prev.nationalSpirits];

        // Calculate modifiers from advisors and national spirits
        let ppMod = 1.0;
        let stabMod = 0;
        let ssMod = 0;
        let tprMod = 0;
        let studentSanityMod = 0;
        let capitalPenetrationMod = 0;
        let radicalAngerMod = 0;
        let allianceUnityMod = 0;
        let partyCentralizationMod = 0;
        let powerBalanceMod = 0;
        let gdpGrowthMod = 0;
        let rndQualityMod = 0;

        // Leader buffs
        if (prev.leader.name === '封安保') {
          stabMod += 0.05;
          tprMod -= 10;
        } else if (prev.leader.name === '王兆凯') {
          radicalAngerMod += 0.5;
          partyCentralizationMod += 0.5;
        } else if (prev.leader.name === '潘仁越') {
          allianceUnityMod += 0.5;
          stabMod += 0.1;
        } else if (prev.leader.name === '封安祥') {
          gdpGrowthMod += 0.05;
          ssMod -= 0.5;
        } else if (prev.leader.name === '狗熊') {
          // 领袖特质：每日理智度 -0.25（在下方对 gouxiongState 处理），每日政治点数 +0.5
          ppMod += 0.5;
        }

        if (prev.leader.name === '杨玉乐') {
          ppMod += 0.25;
          if (prev.yangYuleState) {
            if (prev.yangYuleState.fengFavor > 50) {
              ppMod += (prev.yangYuleState.fengFavor - 50) / 100;
            } else if (prev.yangYuleState.fengFavor < 30) {
              ppMod -= (30 - prev.yangYuleState.fengFavor) / 100;
            }
          }
        }

        prev.advisors.forEach(adv => {
          if (adv) {
            if (adv.modifiers.ppDaily) ppMod += adv.modifiers.ppDaily;
            if (adv.modifiers.stabDaily) stabMod += adv.modifiers.stabDaily;
            if (adv.modifiers.ssDaily) ssMod += adv.modifiers.ssDaily;
            if (adv.modifiers.tprDaily) tprMod += adv.modifiers.tprDaily;
            if (adv.modifiers.studentSanityDaily) studentSanityMod += adv.modifiers.studentSanityDaily;
            if (adv.modifiers.capitalPenetrationDaily) capitalPenetrationMod += adv.modifiers.capitalPenetrationDaily;
            if (adv.modifiers.radicalAngerDaily) radicalAngerMod += adv.modifiers.radicalAngerDaily;
            if (adv.modifiers.allianceUnityDaily) allianceUnityMod += adv.modifiers.allianceUnityDaily;
            if (adv.modifiers.partyCentralizationDaily) partyCentralizationMod += adv.modifiers.partyCentralizationDaily;
            if (adv.modifiers.powerBalanceDaily) powerBalanceMod += adv.modifiers.powerBalanceDaily;
            if (adv.modifiers.gdpGrowthDaily) gdpGrowthMod += adv.modifiers.gdpGrowthDaily;
            if (adv.modifiers.rndQualityDaily) rndQualityMod += adv.modifiers.rndQualityDaily;
          }
        });

        prev.nationalSpirits.forEach(spirit => {
          if (spirit.effects) {
            if (spirit.effects.ppDaily) ppMod += spirit.effects.ppDaily;
            if (spirit.effects.stabDaily) stabMod += spirit.effects.stabDaily;
            if (spirit.effects.ssDaily) ssMod += spirit.effects.ssDaily;
            if (spirit.effects.tprDaily) tprMod += spirit.effects.tprDaily;
            if (spirit.effects.studentSanityDaily) studentSanityMod += spirit.effects.studentSanityDaily;
            if (spirit.effects.capitalPenetrationDaily) capitalPenetrationMod += spirit.effects.capitalPenetrationDaily;
            if (spirit.effects.radicalAngerDaily) radicalAngerMod += spirit.effects.radicalAngerDaily;
            if (spirit.effects.allianceUnityDaily) allianceUnityMod += spirit.effects.allianceUnityDaily;
            if (spirit.effects.partyCentralizationDaily) partyCentralizationMod += spirit.effects.partyCentralizationDaily;
            if (spirit.effects.powerBalanceDaily) powerBalanceMod += spirit.effects.powerBalanceDaily;
            if (spirit.effects.gdpGrowthDaily) gdpGrowthMod += spirit.effects.gdpGrowthDaily;
            if (spirit.effects.rndQualityDaily) rndQualityMod += spirit.effects.rndQualityDaily;
          }
        });

        // Assembly Dynamics
        const assemblyDynamicsIndex = newNationalSpirits.findIndex(ns => ns.id === 'assembly_dynamics');
        if (assemblyDynamicsIndex !== -1 && newStudentAssemblyFactions) {
          const assemblyDynamics = { ...newNationalSpirits[assemblyDynamicsIndex] };
          const factions = newStudentAssemblyFactions;
          // 均势时议会扯皮，增加基础debuff
          let adPpMod = -0.5;
          let adTprMod = factions.testTaker * 0.2;
          adPpMod += factions.orthodox * 0.02;
          let adSsMod = factions.bear * 0.02;
          
          // otherDem gives a bit of everything
          adPpMod += factions.otherDem * 0.01;

          if (factions.conservativeDem) {
            adPpMod -= factions.conservativeDem * 0.01;
          }
          if (factions.jidiTutoring) {
            adTprMod += factions.jidiTutoring * 0.5;
            adSsMod -= factions.jidiTutoring * 0.05;
          }

          // Round to 3 decimal places
          adPpMod = Math.round(adPpMod * 1000) / 1000;
          adTprMod = Math.round(adTprMod * 1000) / 1000;
          adSsMod = Math.round(adSsMod * 1000) / 1000;

          assemblyDynamics.effects = {
            ppDaily: adPpMod,
            tprDaily: adTprMod,
            ssDaily: adSsMod
          };
          
          newNationalSpirits[assemblyDynamicsIndex] = assemblyDynamics;
          
          ppMod += adPpMod;
          tprMod += adTprMod;
          ssMod += adSsMod;
        }

        // Red Toad Politburo Dynamics
        if (newRedToadState) {
          const consensus = newRedToadState.overallConsensus;
          const politburoSpiritIndex = newNationalSpirits.findIndex(ns => ns.id === 'red_toad_politburo');
          
          let spiritType: 'positive' | 'negative' | 'neutral' = 'neutral';
          let spiritDesc = '共识度50，各派系保持着微妙的平衡，没有产生额外影响。';
          let effects: any = {};
          
          if (consensus > 50) {
            spiritType = 'positive';
            const buffLevel = Math.max(1, Math.floor((consensus - 50) / 10));
            spiritDesc = `高共识度带来了强大的执行力。每天获得 ${buffLevel * 0.1} 政治点数，${buffLevel * 0.2} 稳定度，${buffLevel * 5} 题改进度。`;
            effects = { ppDaily: buffLevel * 0.1, stabDaily: buffLevel * 0.2, tprDaily: buffLevel * 5 };
          } else if (consensus < 50) {
            spiritType = 'negative';
            const debuffLevel = Math.max(1, Math.floor((50 - consensus) / 10));
            spiritDesc = `低共识度导致政治局陷入内耗。每天损失 ${debuffLevel * 0.1} 政治点数，${debuffLevel * 0.2} 稳定度，增加 ${debuffLevel * 0.5} 激进愤怒度。`;
            effects = { ppDaily: -debuffLevel * 0.1, stabDaily: -debuffLevel * 0.2, radicalAngerDaily: debuffLevel * 0.5 };
          }
          
          const politburoSpirit = {
            id: 'red_toad_politburo',
            name: '红蛤政治局',
            description: spiritDesc,
            type: spiritType,
            effects: effects
          };
          
          if (politburoSpiritIndex !== -1) {
            newNationalSpirits[politburoSpiritIndex] = politburoSpirit;
          } else {
            newNationalSpirits.push(politburoSpirit);
          }
          
          // Apply effects immediately for this tick
          if (effects.ppDaily) ppMod += effects.ppDaily;
          if (effects.stabDaily) stabMod += effects.stabDaily;
          if (effects.tprDaily) tprMod += effects.tprDaily;
          if (effects.radicalAngerDaily) radicalAngerMod += effects.radicalAngerDaily;
        }

        // Power Balance Modifiers
        if (prev.parliamentState?.powerBalanceUnlocked) {
          const pb = prev.parliamentState.powerBalance;
          if (pb < 40) {
            // Left: Quality Education
            ppMod += (40 - pb) * 0.05;
            tprMod -= (40 - pb) * 0.5;
          } else if (pb > 60) {
            // Right: Exam-oriented Education
            tprMod += (pb - 60) * 0.5;
            ppMod -= (pb - 60) * 0.02;
          } else {
            // Center: Stability
            stabMod += 0.2;
          }
        }

        // NKPD dual-power balance (Lv Bohan vs Gouxiong)
        if (newFlags.lu_dual_power_unlocked) {
          const currentBalance = typeof newFlags.lu_nkpd_power_balance === 'number' ? newFlags.lu_nkpd_power_balance : 50;
          const luLeaderDrift = (prev.leader.name === '吕波汉' || prev.flags.lu_nkpd_mode) ? -0.05 : 0;
          const manualDrift = typeof newFlags.lu_nkpd_balance_manual_drift === 'number' ? newFlags.lu_nkpd_balance_manual_drift : 0;
          const nextBalance = Math.max(0, Math.min(100, currentBalance + luLeaderDrift + manualDrift));
          newFlags.lu_nkpd_power_balance = Number(nextBalance.toFixed(2));
          if (manualDrift !== 0) {
            newFlags.lu_nkpd_balance_manual_drift = 0;
          }

          let spiritType: 'positive' | 'negative' | 'neutral' = 'neutral';
          let spiritDesc = '吕波汉与狗熊维持脆弱制衡，短期内效率与风险并存。';
          if (nextBalance <= 35) {
            spiritType = 'positive';
            spiritDesc = `吕波汉主导（平衡值 ${nextBalance.toFixed(2)}）：组织纪律强化，政治效率提升。`;
            ppMod += 0.2;
            partyCentralizationMod += 0.3;
            ssMod -= 0.2;
          } else if (nextBalance >= 65) {
            spiritType = 'negative';
            spiritDesc = `狗熊主导（平衡值 ${nextBalance.toFixed(2)}）：系统失序，短期动员上升但稳定急剧恶化。`;
            tprMod += 5;
            stabMod -= 0.35;
            ssMod -= 0.35;
            radicalAngerMod += 0.5;
            ppMod -= 0.2;
          } else {
            spiritType = 'neutral';
            spiritDesc = `双头并行（平衡值 ${nextBalance.toFixed(2)}）：表面平稳，内部互疑持续消耗组织。`;
            stabMod += 0.1;
            ppMod -= 0.05;
          }

          const twoChariotsSpirit = {
            id: 'two_chariots_distrust',
            name: '各怀鬼胎的两架马车',
            description: spiritDesc,
            type: spiritType,
          };
          const twoChariotsIndex = newNationalSpirits.findIndex(ns => ns.id === 'two_chariots_distrust');
          if (twoChariotsIndex !== -1) {
            newNationalSpirits[twoChariotsIndex] = twoChariotsSpirit;
          } else {
            newNationalSpirits.push(twoChariotsSpirit);
          }
        }

        const isGouxiongSystemActive = prev.currentFocusTree === 'gouxiong_tree' || !!prev.flags.gouxiong_system_unlocked || prev.leader.name === '狗熊';
        if (isGouxiongSystemActive && prev.gouxiongState) {
          const sanitySpiritId = 'gouxiong_sanity_state';
          const currentSanity = Math.max(0, Math.min(100, prev.gouxiongState.sanity));
          const spiritIdx = newNationalSpirits.findIndex(ns => ns.id === sanitySpiritId);
          let sanitySpirit = {
            id: sanitySpiritId,
            name: '狗熊理智波动',
            description: '理智保持在临界附近，状态起伏不定。',
            type: 'neutral' as const,
            effects: {
              ppDaily: 0,
              stabDaily: 0,
            }
          };

          if (currentSanity > 50) {
            sanitySpirit = {
              id: sanitySpiritId,
              name: '狗熊理智在线',
              description: `当前理智度 ${currentSanity.toFixed(1)}：思维保持连贯，治理效率上升。`,
              type: 'positive',
              effects: {
                ppDaily: 0.3,
                stabDaily: 0.2,
              }
            };
            ppMod += 0.3;
            stabMod += 0.2;
          } else if (currentSanity < 50) {
            sanitySpirit = {
              id: sanitySpiritId,
              name: '狗熊理智失衡',
              description: `当前理智度 ${currentSanity.toFixed(1)}：情绪化决策增多，统治系统出现抖动。`,
              type: 'negative',
              effects: {
                ppDaily: -0.3,
                stabDaily: -0.3,
              }
            };
            ppMod -= 0.3;
            stabMod -= 0.3;
          }

          if (spiritIdx !== -1) {
            newNationalSpirits[spiritIdx] = sanitySpirit;
          } else {
            newNationalSpirits.push(sanitySpirit);
          }
        } else {
          newNationalSpirits = newNationalSpirits.filter(ns => ns.id !== 'gouxiong_sanity_state');
        }

        // Apply TPR penalty
        if (prev.stats.tpr <= 0) {
          stabMod -= 5.0;
        }

        // Dynamic Stat Effects
        // Stability affects PP gain: < 50 reduces, > 50 increases
        ppMod += (prev.stats.stab - 50) / 100;

        // Student Support affects Stability: < 50 reduces, > 50 increases
        stabMod += (prev.stats.ss - 50) / 100;

        // Yang Yule Mechanics: Feng Favor affects PP
        if (prev.yangYuleState) {
          if (prev.yangYuleState.fengFavor > 50) {
            ppMod += (prev.yangYuleState.fengFavor - 50) * 0.02; // Max +1.0 at 100
          } else if (prev.yangYuleState.fengFavor < 30) {
            ppMod -= (30 - prev.yangYuleState.fengFavor) * 0.05; // Max -1.5 at 0
          }
        }

        // Region Buffs
        if (newMapLocations['b3'].studentControl >= 100) stabMod += 0.1;
        if (newMapLocations['admin'].studentControl >= 100) ppMod += 0.5;
        if (newMapLocations['b1b2'].studentControl >= 100) tprMod += 10;
        if (newMapLocations['auditorium'].studentControl >= 100) ssMod += 0.1;
        if (newMapLocations['lab'].studentControl >= 100) studentSanityMod += 0.1;
        if (newMapLocations['playground'].studentControl >= 100) stabMod += 0.1;

        // Force minimum PP gain if PP is negative to prevent softlock
        if (prev.stats.pp < 0 && ppMod <= 0) {
          ppMod = 0.5;
        }

        // Radical Anger Drift
        let radicalAngerDrift = 0;
        if (prev.stats.radicalAnger > 50) {
          radicalAngerDrift = -((prev.stats.radicalAnger - 50) / 50) * 0.5;
        } else if (prev.stats.radicalAnger < 50) {
          radicalAngerDrift = ((50 - prev.stats.radicalAnger) / 50) * 0.5;
        }
        radicalAngerMod += radicalAngerDrift;

        const newStats = {
          ...prev.stats,
          pp: prev.stats.pp + ppMod,
          stab: Math.max(0, Math.min(100, prev.stats.stab + stabMod)),
          ss: Math.max(0, Math.min(100, prev.stats.ss + ssMod)),
          tpr: Math.max(0, prev.stats.tpr + tprMod),
          studentSanity: Math.max(0, Math.min(100, prev.stats.studentSanity + studentSanityMod)),
          capitalPenetration: Math.max(0, Math.min(100, prev.stats.capitalPenetration + capitalPenetrationMod)),
          radicalAnger: Math.max(0, Math.min(100, prev.stats.radicalAnger + radicalAngerMod)),
          allianceUnity: Math.max(0, Math.min(100, prev.stats.allianceUnity + allianceUnityMod)),
          partyCentralization: Math.max(0, Math.min(100, prev.stats.partyCentralization + partyCentralizationMod)),
        };

        if (newParliamentState && newParliamentState.powerBalanceUnlocked) {
          newParliamentState.powerBalance = Math.max(0, Math.min(100, newParliamentState.powerBalance + powerBalanceMod));
          
          // Apply power balance effects
          const pb = newParliamentState.powerBalance;
          if (pb <= 20) {
            newStats.studentSanity = Math.max(0, Math.min(100, newStats.studentSanity + 0.5));
            newStats.pp += -0.5;
          } else if (pb <= 40) {
            newStats.studentSanity = Math.max(0, Math.min(100, newStats.studentSanity + 0.2));
          } else if (pb >= 60 && pb < 80) {
            newStats.tpr += 0.2;
            newStats.studentSanity = Math.max(0, Math.min(100, newStats.studentSanity - 0.2));
          } else if (pb >= 80) {
            newStats.tpr += 0.5;
            newStats.studentSanity = Math.max(0, Math.min(100, newStats.studentSanity - 0.5));
            newStats.pp += -0.5;
          }
        }

        let newCrises = [...prev.crises];

        // Radical Anger Crisis Logic
        if (prev.reformState) {
          if (newStats.radicalAnger >= 100) {
            newFlags.radical_anger_100_days = (newFlags.radical_anger_100_days || 0) + 1;
            if (newFlags.radical_anger_100_days >= 30 && !newCrises.some(c => c.id === 'ultra_left_error')) {
              newCrises.push({
                id: 'ultra_left_error',
                title: '题改极左错误',
                description: '激进愤怒度持续爆表，先锋队内部出现了严重的极左倾向，如果不能在15天内将激进愤怒度降至100%以下，做题改革将遭到极大破坏！',
                daysLeft: 15
              });
            }
          } else {
            newFlags.radical_anger_100_days = 0;
            newCrises = newCrises.filter(c => c.id !== 'ultra_left_error');
          }
        }

        // Charge B3 Success Event Delay Logic
        if (newFlags.charge_b3_completed_days !== undefined) {
          newFlags.charge_b3_completed_days += 1;
          if (newFlags.charge_b3_completed_days === 5) {
            queueEvent(FLAVOR_EVENTS.strike_b3_success);
          }
          if (newFlags.charge_b3_completed_days === 10 && newFlags.yang_yule_condition_met) {
            newFlags.yang_yule_decision_unlocked = true;
          }
        }

        if (newFlags.lu_wang_retire_blank_chain_started && (newFlags.lu_wang_retire_blank_chain_count || 0) < 3) {
          const blankChainDays = (newFlags.lu_wang_retire_blank_chain_days || 0) + 1;
          newFlags.lu_wang_retire_blank_chain_days = blankChainDays;

          if (blankChainDays % 5 === 0) {
            const nextBlankIndex = (newFlags.lu_wang_retire_blank_chain_count || 0) + 1;
            const blankEvents = [
              STORY_EVENTS.lu_wang_retire_blank_event_1,
              STORY_EVENTS.lu_wang_retire_blank_event_2,
              STORY_EVENTS.lu_wang_retire_blank_event_3,
            ];
            const nextBlankEvent = blankEvents[nextBlankIndex - 1];
            if (nextBlankEvent) {
              queueEvent(nextBlankEvent);
              newFlags.lu_wang_retire_blank_chain_count = nextBlankIndex;
              if (nextBlankIndex >= 3) {
                newFlags.lu_wang_retire_blank_chain_started = false;
              }
            }
          }
        }

        // Lu route hidden unlock chain: after Gouxiong enters, trigger 3 daily story events.
        if (newFlags.lu_second_democracy_unlock_started && !newFlags.lu_second_democracy_unlocked) {
          const unlockDays = (newFlags.lu_second_democracy_unlock_days || 0) + 1;
          newFlags.lu_second_democracy_unlock_days = unlockDays;
          if (unlockDays <= 3) {
            const chainDescriptions = [
              '篡权后的校长办公室里，狗熊正百无聊赖地把玩着从广播站缴获来的调音台，试图合成一首更加刺耳的二次元鬼畜进行曲，用来在明天的全校批斗会上折磨那些“做题蛆”。但今天，他的兴致却莫名地低落。\n\n“吕指导，你有没有觉得，这几天楼道里太安静了？”狗熊转过老板椅，看着正埋头批阅《反革命做题分子肃清名单》的吕波汉，“以前我让纠察队去踹门，那些书呆子好歹还会哭喊、会求饶，或者像周洪斌那样念几句听不懂的经。那多有乐子！可昨晚我们去查寝，那帮人看我们的眼神……像是在看死人。没有恐惧，只有一种说不出的死寂。”\n\n吕波汉皱了皱眉，放下了手中的红笔。他确实也收到了一些零星的异常报告：地下水泵房的看守声称有几只老鼠咬断了门锁，导致几箱作为燃料的废旧试卷和一名劳改犯不翼而飞；学校后勤处丢失了几台老式油印机和大量的黑色墨水。“不过是几只在阴沟里苟延残喘的虫子罢了。”吕波汉冷哼了一声，试图压下心头那一丝转瞬即逝的不安，“加大午夜纠察队的巡逻力度，任何不正常的集结，直接物理消灭。”',
              '极权机器的齿轮，第一次感受到了明显的阻力。清晨，当吕波汉阴沉着脸走进行政大楼时，他赫然发现大厅的承重柱上，贴着一张粗糙但字迹极其有力的油印传单。传单没有使用任何晦涩的马列理论，也没有使用狗熊那种抽象的二次元烂梗，而是用最朴素、最能刺痛合一学生内心的语言，控诉着近期发生的一系列血腥私刑与无底线的羞辱。\n\n更令吕波汉感到不寒而栗的是传单的落款——“合一自由党”。那个早已被宣布为非法、被扫进历史垃圾堆的自由派组织，竟然在他的眼皮底下复活了。\n\n狗熊在一旁气急败坏地撕扯着传单：“这群没有幽默感的蠢货！他们居然跟我讲人权？讲尊严？纠察队是干什么吃的！为什么监控里什么都没拍到？！”吕波汉死死捏着那张散发着刺鼻油墨味的纸，手背上青筋暴起。他突然意识到，自己那套只懂得依靠暴力威慑的体系，在面对这种真正基于信仰与牺牲精神的地下网络时，显得如此笨重而迟缓。一张看不见的、由无数个微小齿轮咬合而成的民主链条，正在合一的地下疯狂运转。',
              '恐慌开始在先锋队的内部蔓延。仅仅三天时间，那种无形的抵抗已经从暗处走向了半公开化。午夜纠察队的汇报变得越来越诡异：B1教学楼的所有监控探头都在一夜之间被蒙上了黑布；原本互相监视、动辄举报的班级里，突然形成了一种极其默契的沉默同盟，没有人再向上面提供任何有价值的线索。甚至连纠察队内部，都开始出现开小差和装病的现象。\n\n吕波汉独自站在校长办公室的落地窗前，俯视着被探照灯扫射的操场。他引以为傲的NKPD，此刻变成了一个到处漏风的破筛子。他终于明白，潘仁越和豪邦正在联手做一件极其可怕的事情：他们将自由派的浪漫主义号召力，与自社派在基层深耕的互助组网络完美地结合在了一起。\n\n“吕指导……B3那边的纠察队……被缴械了……”一名浑身是血的干事跌跌撞撞地撞开门，打破了办公室里死一般的沉寂，“他们人太多了……而且……而且他们根本不怕死……”狗熊脸上的狂妄终于褪去，取而代之的是一种歇斯底里的惊恐。他引以为傲的解构主义，在真正视死如归的怒火面前，就像是一个劣质的笑话。极权的丧钟，已然在合一的夜空中敲响。'
            ];
            queueEvent({
              id: `lu_second_democracy_chain_${unlockDays}`,
              title: `地下民主链条 · 第${unlockDays}天`,
              description: chainDescriptions[unlockDays - 1],
              buttonText: '继续监控',
              isStoryEvent: true,
            });
          }
          if (unlockDays >= 3) {
            newFlags.lu_second_democracy_unlocked = true;
            queueEvent({
              id: 'lu_second_democracy_unlocked_event',
              title: '黑天红字旗的再起',
              description: '这是合肥一中建校百年历史上，最为悲壮、也最为波澜壮阔的一个黎明。暴雨如注，冲刷着操场上凝固的暗红色血迹与泥泞。在吕波汉的极权清洗与狗熊那丧尽天良的羞辱中，合一的学生们终于被逼到了退无可退的绝境。他们不再是为了什么宏大的“做题改革”理论，也不再是为了争夺一两分的排名，他们仅仅是为了夺回生而为人的最后一点尊严。\n\n清晨六点，刺耳的防空警报声突然在校园的每一个角落凄厉地拉响，彻底盖过了广播站里失真的极权进行曲。B3教学楼的顶端，那面曾在推翻封安保时飘扬、却又在内部倾轧中被扯下的“黑天红字旗”，在暴风雨中再次被高高升起。潘仁越站在天台上，手里紧紧攥着扩音喇叭，他那嘶哑却极具穿透力的声音，如同雷霆般滚过每一个合一学子的头顶：\n\n“合一的子弟们！百年名校的脊梁，绝不能断送在暴君与小丑的手里！哪怕伴随必死的伤亡，也要永远向前起航！”随着这声怒吼，各个教学楼的铁门被瞬间推平。无数个曾经懦弱的做题家、被打压的温和派、以及在暗中重新集结的互助组干事，如同决堤的怒涛般涌向操场。豪邦走在队伍的最前列，他拖着那副在劳改中被摧残得几近垮塌的躯体，眼神却亮得惊人。他的身旁，是无数张被雨水打湿、却写满了决绝的年轻面孔。\n\n对面，是吕波汉紧急调集的、全副武装的最后几百名死硬派纠察队，以及吓得双腿发软的狗熊。防暴盾牌在雨中闪烁着冰冷的寒光。\n\n没有人在乎这是否是以卵击石，也没有人在乎这场近乎自杀式的冲锋是否会招来校外更严厉的镇压。潘仁越和豪邦并肩站在了红字旗之下，面对着极权机器那黑洞洞的枪口（防暴器械），他们带着几千名觉醒的学生，发起了合一历史上最后、也是最伟大的冲锋。在这悲壮万分的怒吼声中，旧的合肥一中正在死去，但它的灵魂，却在这片血与火的废墟上迎来了真正的涅槃。',
              buttonText: '哪怕注定粉身碎骨，也要用鲜血撞响这新时代的丧钟！',
              effectsText: ['解锁极权派后续国策。'],
              isStoryEvent: true,
            });
          }
        }

        // Update Focus
        let newIsPaused = prev.isPaused;
        let newActiveFocus = prev.activeFocus;
        let newCompletedFocuses = [...prev.completedFocuses];
        let newActiveMinigame = prev.activeMinigame;
        let newActiveSuperEvent = prev.activeSuperEvent;
        let newCyberDeconstruction = prev.cyberDeconstruction ? JSON.parse(JSON.stringify(prev.cyberDeconstruction)) as NonNullable<GameState['cyberDeconstruction']> : undefined;
        let newReformState = prev.reformState ? JSON.parse(JSON.stringify(prev.reformState)) as NonNullable<GameState['reformState']> : undefined;
        let newYangYuleState = prev.yangYuleState ? JSON.parse(JSON.stringify(prev.yangYuleState)) as NonNullable<GameState['yangYuleState']> : undefined;
        let newGouxiongState = prev.gouxiongState ? JSON.parse(JSON.stringify(prev.gouxiongState)) as NonNullable<GameState['gouxiongState']> : undefined;
        let newUnlockedMinigames = [...prev.unlockedMinigames];
        let newAdvisors = [...prev.advisors];
        let newDecisionCooldowns = { ...prev.decisionCooldowns };
        let newModifiers = { 
          ppDaily: ppMod, 
          stabDaily: stabMod, 
          ssDaily: ssMod, 
          tprDaily: tprMod, 
          studentSanityDaily: studentSanityMod, 
          capitalPenetrationDaily: capitalPenetrationMod,
          radicalAngerDaily: radicalAngerMod,
          allianceUnityDaily: allianceUnityMod,
          partyCentralizationDaily: partyCentralizationMod,
          powerBalanceDaily: powerBalanceMod
        };

        if (newGouxiongState && prev.leader.name === '狗熊') {
          const unlockedCount = Math.max(1, newGouxiongState.unlockedCharacters?.length || 1);
          const affinitySum = unlockedCount > 0
            ? newGouxiongState.unlockedCharacters.reduce((sum, cid) => sum + (newGouxiongState.affinities?.[cid as GalCharacterId] || 0), 0)
            : 0;
          const avgAffinity = affinitySum / unlockedCount;
          const passiveRecover = avgAffinity >= 80 ? 0.2 : avgAffinity >= 60 ? 0.12 : avgAffinity >= 35 ? 0.06 : 0;
          newGouxiongState.sanity = Math.max(0, Math.min(newGouxiongState.maxSanity, newGouxiongState.sanity - 0.25 + passiveRecover));

          const dayKey = newDate.toISOString().split('T')[0];
          const dailyChatState = {
            dateKey: dayKey,
            sentCount: 0,
            blocked: false,
            incomingByCharacter: {} as Record<string, number>,
          };

          const affinityOpenThreshold: Record<GalCharacterId, number> = {
            dabi: 42,
            maodun: 36,
            lante: 30,
            wushuo: 40,
          };
          const unlockedChars = (newGouxiongState.unlockedCharacters || ['dabi']) as GalCharacterId[];
          unlockedChars.forEach((cid) => {
            const affinity = newGouxiongState?.affinities?.[cid] || 0;
            const baseChance = affinity >= 85 ? 0.22 : affinity >= 70 ? 0.16 : affinity >= affinityOpenThreshold[cid] ? 0.1 : 0;
            if (baseChance > 0 && Math.random() < baseChance) {
              const pool = GAL_AUTO_MESSAGE_POOL[cid] || ['在吗？'];
              const line = pool[Math.floor(Math.random() * pool.length)];
              const prevChat = [...(newGouxiongState.chats[cid] || [])];
              prevChat.push({ from: 'npc', text: line, ts: `${Date.now()}_auto_${cid}` });
              newGouxiongState.chats[cid] = prevChat;
              dailyChatState.incomingByCharacter[cid] = (dailyChatState.incomingByCharacter[cid] || 0) + 1;
            }
          });
          newGouxiongState.dailyChatState = dailyChatState;

          const sanityNow = Math.max(0, Math.min(100, newGouxiongState.sanity));
          thresholdKeyMap.forEach(({ value, mode, flag, eventId }) => {
            if (newFlags[flag]) return;
            const hit = mode === 'below' ? sanityNow < value : sanityNow > value;
            if (hit) {
              newFlags[flag] = true;
              const evt = STORY_EVENTS[eventId];
              if (evt) queueEvent(evt);
            }
          });
        }

        if (newFlags.gx_anarchy_phase) {
          const locIds: Array<keyof typeof newMapLocations> = ['b3', 'admin', 'b1b2', 'auditorium', 'lab', 'playground'];
          const ownerCounts = locIds.reduce(
            (acc, locId) => {
              const owner = String(newFlags[`gx_map_owner_${locId}`] || 'school');
              if (owner === 'gouxiong') acc.gouxiong += 1;
              else if (owner === 'left') acc.left += 1;
              else acc.school += 1;
              return acc;
            },
            { gouxiong: 0, left: 0, school: 0 }
          );

          const strategicWeight: Record<string, number> = {
            admin: 1.2,
            auditorium: 1.1,
            b1b2: 1,
            b3: 1,
            lab: 0.95,
            playground: 0.9,
          };

          locIds.forEach((locId) => {
            const ownerKey = `gx_map_owner_${locId}`;
            const currentOwner = String(newFlags[ownerKey] || 'school');
            const loc = { ...newMapLocations[locId] };
            let nextOwner = currentOwner;
            let nextControl = loc.studentControl;
            const weight = strategicWeight[locId] || 1;
            const fortressOwner = locId === 'admin'
              ? 'school'
              : locId === 'b3'
                ? 'gouxiong'
                : locId === 'auditorium' && newFlags.gx_auditorium_hq_online
                  ? 'gouxiong'
                  : null;

            if (fortressOwner && currentOwner === fortressOwner) {
              const pressure = locId === 'admin' ? 0.05 : 0.06;
              if (Math.random() < pressure) {
                const attacker = currentOwner === 'school'
                  ? (Math.random() < 0.7 ? 'left' : 'gouxiong')
                  : (Math.random() < 0.7 ? 'school' : 'left');
                nextControl = Math.max(0, nextControl - Math.round((1 + Math.random() * 2) * weight));
                if (nextControl < 20) {
                  nextOwner = attacker;
                }
              } else {
                nextControl = Math.min(100, nextControl + 1.6);
              }
            } else if (fortressOwner && currentOwner !== fortressOwner) {
              const counterBias = 0.22;
              const currentPressure = currentOwner === 'left' ? 0.3 : 0.26;
              if (Math.random() < currentPressure + counterBias) {
                nextControl = Math.max(0, nextControl - Math.round((2 + Math.random() * 2) * weight));
                if (nextControl < 33) {
                  nextOwner = fortressOwner;
                }
              } else {
                nextControl = Math.min(100, nextControl + 0.5);
              }
            } else if (currentOwner === 'gouxiong') {
              const schoolPressure = 0.22 + (ownerCounts.school >= ownerCounts.left ? 0.08 : 0);
              const leftPressure = 0.2 + (ownerCounts.left > ownerCounts.gouxiong ? 0.08 : 0);
              if (Math.random() < schoolPressure + leftPressure) {
                const attacker = Math.random() < schoolPressure / (schoolPressure + leftPressure) ? 'school' : 'left';
                nextControl = Math.max(0, nextControl - Math.round((4 + Math.random() * 4) * weight));
                if (nextControl < 45) {
                  nextOwner = attacker;
                }
              } else {
                nextControl = Math.min(100, nextControl + 1.2);
              }
            } else if (currentOwner === 'left') {
              const consolidateBias = nextControl < 55 ? 0.44 : 0.33;
              const schoolRaidBias = 0.34 + (ownerCounts.school > ownerCounts.left ? 0.06 : 0);
              const gxRaidBias = 0.18 + (ownerCounts.gouxiong >= 3 ? 0.06 : 0);
              const attackRoll = Math.random();
              if (attackRoll < consolidateBias) {
                nextControl = Math.min(100, nextControl + Math.round((2 + Math.random() * 2) * weight));
              } else if (attackRoll < consolidateBias + schoolRaidBias) {
                nextControl = Math.max(0, nextControl - Math.round((4 + Math.random() * 3) * weight));
                if (nextControl < 44) nextOwner = 'school';
              } else if (attackRoll < consolidateBias + schoolRaidBias + gxRaidBias) {
                nextControl = Math.max(0, nextControl - Math.round((3 + Math.random() * 3) * weight));
                if (nextControl < 41) nextOwner = 'gouxiong';
              }
            } else {
              const holdBias = nextControl <= 35 ? 0.5 : 0.38;
              const leftRaidBias = 0.26 + (ownerCounts.left >= ownerCounts.gouxiong ? 0.06 : 0);
              const gxRaidBias = 0.22 + (ownerCounts.gouxiong > ownerCounts.left ? 0.05 : 0);
              const attackRoll = Math.random();
              if (attackRoll < holdBias) {
                nextControl = Math.min(100, nextControl + Math.round((2 + Math.random() * 2) * weight));
              } else if (attackRoll < holdBias + leftRaidBias) {
                nextControl = Math.max(0, nextControl - Math.round((4 + Math.random() * 3) * weight));
                if (nextControl < 43) nextOwner = 'left';
              } else if (attackRoll < holdBias + leftRaidBias + gxRaidBias) {
                nextControl = Math.max(0, nextControl - Math.round((3 + Math.random() * 4) * weight));
                if (nextControl < 40) nextOwner = 'gouxiong';
              }
            }

            if (nextOwner !== currentOwner) {
              if (nextOwner === 'gouxiong') nextControl = Math.max(55, nextControl);
              if (nextOwner === 'left') nextControl = Math.max(48, nextControl);
              if (nextOwner === 'school') nextControl = Math.min(35, nextControl);
              newFlags[ownerKey] = nextOwner;
            }

            newMapLocations[locId] = { ...loc, studentControl: Math.max(0, Math.min(100, nextControl)) };
          });
        }

        if (newActiveFocus) {
          newActiveFocus = { ...newActiveFocus, daysLeft: newActiveFocus.daysLeft - 1 };
          if (newActiveFocus.daysLeft <= 0) {
            newCompletedFocuses.push(newActiveFocus.id);
            newFlags[`focus_completed_date_${newActiveFocus.id}`] = newDate.getTime();
            
            // Apply focus effect
            const currentNodes = getFocusNodes(prev.currentFocusTree);
            const node = currentNodes.find(n => n.id === newActiveFocus!.id);
            if (node && node.onComplete) {
              const currentState: GameState = {
                ...prev,
                stats: newStats,
                modifiers: newModifiers,
                nationalSpirits: newNationalSpirits,
                flags: newFlags,
                leader: newLeader,
                ideologies: newIdeologies,
                mapLocations: newMapLocations,
                gameEnding: newGameEnding,
                currentFocusTree: newCurrentFocusTree,
                completedFocuses: newCompletedFocuses,
                reformState: newReformState,
                yangYuleState: newYangYuleState,
                cyberDeconstruction: newCyberDeconstruction,
                gouxiongState: newGouxiongState,
                unlockedMinigames: newUnlockedMinigames,
                crises: newCrises,
                activeStoryEvents: newActiveStoryEvents,
                studentAssemblyFactions: newStudentAssemblyFactions,
                parliamentState: newParliamentState,
                advisors: newAdvisors,
                decisionCooldowns: newDecisionCooldowns,
                jidiCorporateState: newJidiCorporateState,
                redToadState: newRedToadState,
                electionState: newElectionState,
              };
              const effectPartial = node.onComplete(currentState);
              if (effectPartial.stats) Object.assign(newStats, effectPartial.stats);
              if (effectPartial.modifiers) Object.assign(newModifiers, effectPartial.modifiers);
              if (effectPartial.nationalSpirits) newNationalSpirits = effectPartial.nationalSpirits;
              if (effectPartial.flags) Object.assign(newFlags, effectPartial.flags);
              if (effectPartial.activeEvent) queueEvent(effectPartial.activeEvent);
              if (effectPartial.leader) newLeader = effectPartial.leader;
              if (effectPartial.ideologies) newIdeologies = effectPartial.ideologies;
              if (effectPartial.mapLocations) newMapLocations = effectPartial.mapLocations;
              if (effectPartial.gameEnding) newGameEnding = effectPartial.gameEnding;
              if (effectPartial.currentFocusTree) newCurrentFocusTree = effectPartial.currentFocusTree;
              if (effectPartial.completedFocuses) newCompletedFocuses = effectPartial.completedFocuses;
              if (effectPartial.reformState) newReformState = effectPartial.reformState;
              if (effectPartial.yangYuleState) newYangYuleState = effectPartial.yangYuleState;
              if (effectPartial.cyberDeconstruction) newCyberDeconstruction = effectPartial.cyberDeconstruction;
              if (effectPartial.gouxiongState) newGouxiongState = effectPartial.gouxiongState;
              if (effectPartial.unlockedMinigames) newUnlockedMinigames = effectPartial.unlockedMinigames;
              if (effectPartial.crises) newCrises = effectPartial.crises;
              if (effectPartial.activeStoryEvents) newActiveStoryEvents = effectPartial.activeStoryEvents;
              if (effectPartial.studentAssemblyFactions) newStudentAssemblyFactions = effectPartial.studentAssemblyFactions;
              if (effectPartial.parliamentState) newParliamentState = effectPartial.parliamentState;
              if (effectPartial.advisors) newAdvisors = effectPartial.advisors;
              if (effectPartial.decisionCooldowns) newDecisionCooldowns = effectPartial.decisionCooldowns;
              if (effectPartial.jidiCorporateState) newJidiCorporateState = effectPartial.jidiCorporateState;
              if (effectPartial.redToadState) newRedToadState = effectPartial.redToadState;
              if (effectPartial.electionState) newElectionState = effectPartial.electionState;
            }

            const completedFocusSuperEvent = FOCUS_COMPLETION_SUPER_EVENTS[newActiveFocus.id];
            if (completedFocusSuperEvent) {
              newActiveSuperEvent = completedFocusSuperEvent;
            }

            // Check for minigame unlocks (if we add them to new trees)
            if (newActiveFocus.id === 'break_monopoly' || newActiveFocus.id === 'seize_mouthpiece') {
              newActiveMinigame = 'frequency_war';
            } else if (newActiveFocus.id === 'defend_b3') {
              newActiveMinigame = 'siege_b3';
            }

            newActiveFocus = null;
            
            // Auto-pause if there are available focuses
            const hasAvailableFocus = currentNodes.some(n => 
              !newCompletedFocuses.includes(n.id) && 
              hasFocusRequirements(n, newCompletedFocuses) &&
              (!n.canStart || n.canStart(prev))
            );
            if (hasAvailableFocus) {
              newIsPaused = true;
            }
          }
        }

        // Update Crises
        newCrises = newCrises.map(c => ({ ...c, daysLeft: c.daysLeft - 1 }));
        
        if (newRedToadState) {
          if (newRedToadState.billCooldown > 0) {
            newRedToadState.billCooldown -= 1;
          }
        }

        newCrises.forEach(c => {
          if (c.id === 'reform_fail_crisis') {
            if (c.daysLeft === 120 && !newFlags['reform_event_120']) {
              newFlags['reform_event_120'] = true;
              queueEvent(STORY_EVENTS.reform_countdown_120);
            } else if (c.daysLeft === 90 && !newFlags['reform_event_90']) {
              newFlags['reform_event_90'] = true;
              queueEvent(STORY_EVENTS.reform_countdown_90);
            } else if (c.daysLeft === 60 && !newFlags['reform_event_60']) {
              newFlags['reform_event_60'] = true;
              queueEvent(STORY_EVENTS.reform_countdown_60);
            } else if (c.daysLeft === 30 && !newFlags['reform_event_30']) {
              newFlags['reform_event_30'] = true;
              queueEvent(STORY_EVENTS.reform_countdown_30);
            }
          } else if (c.id === 'gouxiong_coup') {
            if (c.daysLeft === 10 && !newFlags['gx_coup_10d_event_fired']) {
              newFlags['gx_coup_10d_event_fired'] = true;
              queueEvent(STORY_EVENTS.gx_coup_10_days_warning_event);
            }
          }
        });
        
        // Alliance Collapse Crisis Logic
        const isAllianceCollapseConditionMet = newStats.partyCentralization > 90 && newStats.allianceUnity < 25;
        const allianceCollapseCrisisIndex = newCrises.findIndex(c => c.id === 'alliance_collapse');

        if (isAllianceCollapseConditionMet) {
          if (allianceCollapseCrisisIndex === -1) {
            newCrises.push({
              id: 'alliance_collapse',
              title: '联盟濒临瓦解',
              daysLeft: 15,
              description: '党内集权度过高且联盟团结度极低，如果不采取措施，联盟将在15天后彻底瓦解。'
            });
          }
        } else {
          if (allianceCollapseCrisisIndex !== -1) {
            newCrises.splice(allianceCollapseCrisisIndex, 1);
          }
        }

        // Jidi Takeover Crisis Logic
        const isJidiTakeoverConditionMet = newStats.stab < 50 && newStats.capitalPenetration > 60;
        const jidiTakeoverCrisisIndex = newCrises.findIndex(c => c.id === 'jidi_takeover');

        if (isJidiTakeoverConditionMet && !prev.flags['jidi_takeover_complete']) {
          if (jidiTakeoverCrisisIndex === -1) {
            newCrises.push({
              id: 'jidi_takeover',
              title: '及第资本夺权',
              daysLeft: 30,
              description: '及第教育的资本正在暗中渗透，如果我们不能在30天内降低资本渗透度（<=60），他们将接管学校！'
            });
          }
        } else {
          if (jidiTakeoverCrisisIndex !== -1) {
            if (newStats.capitalPenetration <= 60) {
              newCrises.splice(jidiTakeoverCrisisIndex, 1);
            }
          }
        }

        // Gouxiong Coup Crisis Logic
        const isGouxiongCoupConditionMet = newStats.stab < 30 && newStats.studentSanity < 30 && prev.advisors.some(a => a?.id === 'gouxiong_advisor');
        const gouxiongCoupCrisisIndex = newCrises.findIndex(c => c.id === 'gouxiong_coup');

        if (isGouxiongCoupConditionMet && !prev.flags['gouxiong_coup_complete']) {
          if (gouxiongCoupCrisisIndex === -1) {
            newCrises.push({
              id: 'gouxiong_coup',
              title: '内奸？？',
              daysLeft: 15,
              description: '稳定度和学生理智度极低，狗熊似乎在暗中策划着什么...如果不能在15天内提高稳定度或学生理智度，后果不堪设想！'
            });
          }
        } else {
          if (gouxiongCoupCrisisIndex !== -1) {
            newCrises.splice(gouxiongCoupCrisisIndex, 1);
          }
        }

        // Midnight Crisis Logic (合一的毁灭)
        const isMidnightConditionMet = newStats.stab <= 0 && newStats.tpr <= 0;
        const midnightCrisisIndex = newCrises.findIndex(c => c.id === 'midnight_crisis');

        if (isMidnightConditionMet && !prev.flags['midnight_crisis_complete']) {
          if (midnightCrisisIndex === -1) {
            newCrises.push({
              id: 'midnight_crisis',
              title: '子夜？',
              daysLeft: 30,
              description: '稳定度和试卷储备量同时归零。合一正在分崩离析，如果不能在30天内改变现状（稳定度>0或试卷储备量>0），一切都将结束。'
            });
          }
        } else {
          if (midnightCrisisIndex !== -1) {
            newCrises.splice(midnightCrisisIndex, 1);
          }
        }

        // School Counterattack Crisis (潘仁越绝望线)
        const isSchoolCounterattackConditionMet = prev.currentFocusTree === 'treeA_pan' && newStats.tpr <= 0 && newStats.ss < 30;
        const schoolCounterattackCrisisIndex = newCrises.findIndex(c => c.id === 'school_counterattack');

        if (isSchoolCounterattackConditionMet && !prev.flags['school_counterattack_complete']) {
          if (schoolCounterattackCrisisIndex === -1) {
            newCrises.push({
              id: 'school_counterattack',
              title: '校方反攻？',
              daysLeft: 30,
              description: '试卷储备量枯竭，学生支持度极低。校方保安队正在集结，如果我们不能在30天内改善现状（TPR>0或学生支持度>=30），我们将面临绝望的走廊巷战！'
            });
          }
        } else {
          if (schoolCounterattackCrisisIndex !== -1) {
            newCrises.splice(schoolCounterattackCrisisIndex, 1);
          }
        }

        // Reform Crises
        if (prev.reformState) {
          const isReformCapitalConditionMet = newStats.capitalPenetration > 70;
          const reformCapitalCrisisIndex = newCrises.findIndex(c => c.id === 'reform_capital_crisis');

          if (isReformCapitalConditionMet && !prev.flags['reform_capital_crisis_complete']) {
            if (reformCapitalCrisisIndex === -1) {
              newCrises.push({
                id: 'reform_capital_crisis',
                title: '资本反扑',
                daysLeft: 20,
                description: '资本渗透度过高！及第教育正在暗中破坏做题改革。如果不能在20天内将资本渗透度降至70以下，题改进度将大幅倒退！'
              });
            }
          } else {
            if (reformCapitalCrisisIndex !== -1) {
              newCrises.splice(reformCapitalCrisisIndex, 1);
            }
          }

          const isReformSanityConditionMet = newStats.studentSanity < 20;
          const reformSanityCrisisIndex = newCrises.findIndex(c => c.id === 'reform_sanity_crisis');

          if (isReformSanityConditionMet && !prev.flags['reform_sanity_crisis_complete']) {
            if (reformSanityCrisisIndex === -1) {
              newCrises.push({
                id: 'reform_sanity_crisis',
                title: '学生崩溃',
                daysLeft: 15,
                description: '学生理智度极低！过激的改革让学生们濒临崩溃。如果不能在15天内将理智度提升至20以上，题改将失去群众基础！'
              });
            }
          } else {
            if (reformSanityCrisisIndex !== -1) {
              newCrises.splice(reformSanityCrisisIndex, 1);
            }
          }
        }

        const expiredCrises = newCrises.filter(c => c.daysLeft <= 0);
        newCrises = newCrises.filter(c => c.daysLeft > 0);
        
        expiredCrises.forEach(c => {
          if (c.id === 'mock_exam') {
            newStats.stab = Math.max(0, newStats.stab - 30);
            queueEvent({
              id: 'mock_exam_fail_initial',
              title: '一模成绩雪崩',
              description: '由于缺乏组织和复习，一模考试成绩惨不忍睹。学生们陷入恐慌，稳定度大幅下降！',
              buttonText: '这下完了...'
            });
          } else if (c.id === 'alliance_collapse') {
            newGameEnding = 'game_over_anarchy';
          } else if (c.id === 'midnight_crisis') {
            newFlags['midnight_crisis_complete'] = true;
            newGameEnding = 'game_over_midnight';
          } else if (c.id === 'school_counterattack') {
            newFlags['school_counterattack_complete'] = true;
            newCurrentFocusTree = 'treeA_pan_despair';
            newCompletedFocuses = []; // Reset focuses for the despair tree
            queueEvent({
              id: 'enter_treeA_pan_despair',
              title: '绝望的走廊巷战',
              description: '试卷储备量已经彻底枯竭，学生支持度也跌入谷底。没有了做题力作为支撑，我们无法建立新的秩序。校方保安队和及第教育的雇佣兵趁机发起了反扑。潘仁越带领着最后的抵抗军，在教学楼的走廊里展开了绝望的巷战。',
              buttonText: '战斗到最后一刻！'
            });
          } else if (c.id === 'reform_capital_crisis') {
            newFlags['reform_capital_crisis_complete'] = true;
            if (newReformState) {
              newReformState.progress = Math.max(0, newReformState.progress - 20);
            }
            queueEvent({
              id: 'reform_capital_fail',
              title: '资本的胜利',
              description: '及第教育的资本成功渗透了改革委员会，大量改革成果被窃取或破坏。题改进度大幅倒退！',
              buttonText: '可恶的资本家！'
            });
          } else if (c.id === 'reform_sanity_crisis') {
            newFlags['reform_sanity_crisis_complete'] = true;
            if (newReformState) {
              newReformState.progress = Math.max(0, newReformState.progress - 15);
              newReformState.vanguardMembers = Math.max(0, newReformState.vanguardMembers - 20);
            }
            queueEvent({
              id: 'reform_sanity_fail',
              title: '群众的怒火',
              description: '学生们无法承受过激的改革，爆发了抗议。先锋党员在冲突中流失，题改进度受挫。',
              buttonText: '我们需要更温和的手段...'
            });
          } else if (c.id === 'gouxiong_coup') {
            newFlags['gouxiong_coup_complete'] = true;
            queueEvent({
              id: 'gouxiong_coup_success',
              title: '撕裂的红旗',
              description: '纸终究包不住火，政治的缝隙里永远不缺煽风点火的掮客。极端派的吕波汉不知通过何种渠道得知了这封信的存在。为了在党内排挤异己，他连夜将这个消息添油加醋地传到了驻守在艺术礼堂的狗熊耳中。“王兆凯准备用作风问题清理门户了，你的黑材料已经摆在了他的办公桌上。”吕波汉在加密对讲机里的声音透着一股幸灾乐祸的冰冷。\n\n艺术礼堂的放映室里，狗熊猛地砸碎了手中的马克杯。他没有因为自己当年对达璧犯下的无耻行径感到一丝一毫的愧疚或恐惧，反而感受到了一种被“道貌岸然者”背叛的极度狂怒。在他那套解构一切的畸形逻辑里，什么道德、什么纪律，统统都是王兆凯用来争权夺利的虚伪工具。“好啊……好一个大义灭亲的王主席！”狗熊对着空气发出了歇斯底里的狂笑，那笑声在空旷的礼堂里回荡，令人毛骨悚然，“你们这帮满脑子只有宏大叙事的做题蛆，真以为自己是什么救世主了？老子不陪你们玩这种无聊的过家家了！”\n\n当晚，艺术礼堂的广播大喇叭被强行接入了校园的总频段。在一阵极其刺耳的二次元鬼畜电音后，狗熊那充满癫狂与嘲讽的声音响彻了整个合肥一中的夜空。他公然宣布退出钢铁红蛤，痛骂王兆凯是“伪善的独裁官僚”，并宣布艺术礼堂及周边区域为独立的“二次元地上天国”。消息传出，全校哗然。王兆凯在B3教学楼愤怒地捶碎了玻璃，潘仁越的自由派在暗中冷眼旁观，而缩在行政楼里的校方保安队则看到了反扑的绝佳契机。\n\n合肥一中这块本就破碎的棋盘，在此刻被彻底掀翻。极具讽刺意味的狗熊派、坚持原教旨的钢铁红蛤/自由派联军、以及虎视眈眈的校方还乡团，正式将这座校园拖入了一场荒诞、血腥且毫无底线可言的三方无政府混战。',
              buttonText: '小丑撕下了幕布，要在燃烧的剧院里上演他自己的荒诞剧。',
              effect: (state) => {
                return {
                  leader: { 
                    name: '狗熊', 
                    title: '赛博娱乐大统领', 
                    portrait: 'gouxiong', 
                    ideology: 'deconstructivism',
                    description: '曾经的B3教学楼革命者，如今的赛博娱乐大统领。他利用了学生们的愤怒和绝望，将学校变成了一个充满二次元低幼性压抑风格的游乐场。高二时偷女同学裤子的恶趣味，如今成了他统治的象征。'
                  },
                  currentFocusTree: 'gouxiong_tree',
                  flags: { ...state.flags, gouxiong_coup_complete: true },
                  nationalSpirits: state.nationalSpirits.filter(ns => !['red_campus', 'student_council', 'awakened_binhu', 'assembly_dynamics', 'democratic_councils_spirit'].includes(ns.id)).concat({
                    id: 'cyber_hedonism_rule',
                    name: '赛博娱乐统治',
                    description: '学校变成了一个巨大的游乐场，但也充满了荒诞和压抑。每日PP +1，每日稳定度 -2%，每日学生理智值 -5%。',
                    type: 'negative',
                    effects: { ppDaily: 1, stabDaily: -2, studentSanityDaily: -5 }
                  }),
                  ideologies: {
                    radical_socialism: 5,
                    authoritarian: 5,
                    liberal: 10,
                    reactionary: 5,
                    anarcho_capitalism: 5,
                    test_taking: 20,
                    deconstructivism: 50
                  },
                  cyberDeconstruction: {
                    level: 1,
                    progress: 0,
                    currentWork: 'demon_slayer',
                    stage: 1,
                    ratings: {},
                    reviewedWorks: [],
                    workProgress: {},
                  },
                  gouxiongState: {
                      sanity: 50,
                    maxSanity: 100,
                    affinities: {
                      dabi: 10,
                      maodun: 0,
                      lante: 0,
                      wushuo: 0,
                    },
                    unlockedCharacters: ['dabi'],
                    chats: {
                      dabi: [{ from: 'npc', text: '你别装正经。', ts: 'coup_init' }],
                    },
                    dialogueProgress: {
                      dabi: 0,
                      maodun: 0,
                      lante: 0,
                      wushuo: 0,
                    },
                  }
                };
              }
            });
          } else if (c.id === 'jidi_takeover') {
            newFlags['jidi_takeover_complete'] = true;
            queueEvent({
              id: 'jidi_takeover_success',
              title: '及第教育全面接管',
              description: 'B3教学楼的浓烟与嘶哑的口号声终于迎来了休止符，但这绝非学生们期盼的黎明，而是一场更为彻底的深渊降临。随着封安保那套粗暴的“安保全面复辟”与防暴队镇压体系在黑天红字旗的冲击下彻底破产，校园原有的高压秩序已然土崩瓦解 。\n\n就在联合革命委员会的年轻人们满心以为熬过了最黑暗的凛冬、即将迎来自治的曙光时，几辆黑色的迈巴赫在一列专业安保车队的护送下，平稳地碾过满地狼藉的滨湖校区大门。车门打开，及第教育CEO封安祥西装革履地踏上了这片布满试卷残骸与燃烧痕迹的土地。他的手里没有沾血的警棍，只有一份盖着市教育局纪委鲜红公章的《合肥一中整体托管与重组授权书》。\n\n在狼藉的校长办公室内，一场同姓兄弟间的权力交接冷酷地完成了。封安保颓丧地瘫坐在宽大的皮椅上，看着自己迷信的铁腕统治化为泡影。封安祥则从容地将几份刺眼的清算文件扔在桌面上，语气中带着精算师般的轻蔑：“大哥，你最大的错误就是把这群做题家当成了需要物理镇压的敌人，而没有把他们当成可以无限榨取剩余价值的矿产。防暴队只会徒增维稳成本，但制造升学焦虑却能带来源源不断的现金流。”\n\n窗外，及第资本的法务团队和新入驻的“高级安保顾问”正以惊人的企业级效率清理着战场。潘仁越与王兆凯等人拼死建立的联合革委会甚至没有等来一场像样的最终决战，就被一纸纸精准寄到家长单位的律师函、违约金账单和退学威胁瞬间瓦解 。理想主义的红黑旗帜被当作有害垃圾塞进了焚化炉，取而代之的是贴满公告栏的《独家教辅强制订阅清单》。合肥一中，这座曾经见证过陈栋时代民主风云的百年名校，正式完成了它血淋淋的“借壳上市”，彻底沦为了一座冰冷、高效、只为股东报表负责的盈利性应试工厂 。',
              buttonText: '资本的胜利...',
              effect: (state) => {
                const newMapLocations = { ...state.mapLocations };
                Object.keys(newMapLocations).forEach(key => {
                  newMapLocations[key] = { ...newMapLocations[key], studentControl: 0 }; // 0 means controlled by school/capital
                });
                return {
                  leader: { 
                    name: '封安祥', 
                    title: '及第教育CEO', 
                    portrait: 'feng_anxiang', 
                    ideology: 'anarcho_capitalism',
                    description: '及第教育的掌舵人，将学校视为一台巨大的提分机器。他认为教育的本质就是一场可以被精确计算和无限压榨的商业游戏。',
                    buffs: ['每日GDP增长 +5%', '每日学生支持度 -0.5%']
                  },
                  currentFocusTree: 'jidi_tree',
                  flags: { ...state.flags, jidi_takeover_complete: true, jidi_map_yellow: true },
                  nationalSpirits: state.nationalSpirits.filter(ns => !['red_campus', 'student_council', 'awakened_binhu'].includes(ns.id)).concat({
                    id: 'hefei_no1_privatization',
                    name: '合一私有化',
                    description: '学校已被完全私有化，一切为了利润。每日PP +1，每日稳定度 +0.1%，每日学生理智值 -0.2%。',
                    type: 'negative',
                    effects: { ppDaily: 1, stabDaily: 0.1, studentSanityDaily: -0.2 }
                  }),
                  mapLocations: newMapLocations,
                  ideologies: {
                    authoritarian: 30,
                    reactionary: 10,
                    liberal: 8,
                    radical_socialism: 2,
                    anarcho_capitalism: 40,
                    deconstructivism: 0,
                    test_taking: 10,
                  },
                  jidiCorporateState: {
                    unlockedMechanics: {
                      rnd: false,
                      committee: false,
                    },
                    gdp: 1000,
                    gdpGrowth: 0.05,
                    gdpHistory: [1000],
                    admissionRate: 0.85,
                    rndState: {
                      phase: 'idle',
                      daysInPhase: 0,
                      testingIntensity: 5,
                      daysSinceLastIntensityChange: 0,
                    }
                  }
                };
              }
            });
          } else if (c.id === 'reform_fail_crisis') {
            newCurrentFocusTree = 'treeA_lu_bohan';
            newCompletedFocuses = [];
            newActiveFocus = null;
            newReformState = undefined;
            newFlags.reform_unlocked = false;
            newFlags.reform_failed_route_shifted = true;

            queueEvent({
              id: 'reform_fail_event',
              title: '长夜的最后通牒',
              description: '“江南十校春季联合模考”的阴影，如同水银泻地般压垮了B3教学楼最后的一丝理智。随着联考日期的逼近，豪邦苦心孤诣维持的互助组在巨大的升学恐慌面前，如同阳光下的雪人般迅速消融。在这场极端的压力测试中，深植于骨髓的“衡水病毒”迎来了最猛烈的反扑。\n\n危机的引爆点是一桩令人发指的丑闻。就在联考前夜，下乡工作队在天花板的通风管道里，查获了整整三大箱由校外资本及第教育高价走私进来的十校联考绝密押题卷。而囤积这些试卷的，正是以王卷豪为首的一批曾经的高分做题家。为了在模考中彻底碾压其他阶层，这群患上重度体制斯德哥尔摩综合征的学生不仅互相包庇、秘密刷题，甚至在深夜剪断了竞争对手寝室的照明电线。这场丑闻彻底撕碎了“学生自治与互助”的遮羞布，证明了在没有外部强力干预的情况下，做题家阶级会毫不犹豫地踩着同窗的尸体向上爬。\n\n深夜的政治局会议室里，空气冷得能凝结出冰渣。几份被搜缴的绝密试卷被狠狠甩在王兆凯的脸上，纸张边缘甚至还沾着纠察队在冲突中留下的血迹。\n\n“这就是你那可笑的‘大帐篷’！这就是你优柔寡断、纵容温和派的下场！”吕波汉像一头嗜血的狼般撑在办公桌上，他的双眼闪烁着疯狂而病态的兴奋，“事实证明，那些做题蛆的灵魂早就在题海里烂透了！豪邦的互助组只是给他们提供了结党营私的温床！王主席，你还要继续你那软弱的改良梦吗？”\n\n在吕波汉的身后，戴着歪斜红袖章的狗熊发出了一阵极度刺耳的狂笑，他手里把玩着一根警棍，正用它有节奏地敲击着门框，门外的走廊里站满了全副武装的特别纠察队。王兆凯瘫坐在椅子上，面对着做题家们赤裸裸的背叛和彻底破产的温和路线，他一直以来的摇摆不定终于迎来了反噬。他失去了所有的理论自信，连握笔的手都在颤抖。吕波汉不需要王兆凯的回答，他一把夺过桌上的最高指令广播麦克风。在这个彻底失去信任的漫长冬夜里，极权主义的屠刀，终于找到了最完美的挥舞理由。',
              buttonText: '当温和的阳光无法融化冰川，我们只能召唤地狱的烈火。',
              effectText: '改革破产，吕波汉与狗熊发动政变，进入极权派路线',
              isStoryEvent: true,
              effect: (state) => {
                return {
                  currentFocusTree: 'treeA_lu_bohan',
                  completedFocuses: [],
                  activeFocus: null,
                  flags: { ...state.flags, reform_unlocked: false, reform_failed_route_shifted: true },
                  reformState: undefined,
                  crises: state.crises.filter(cr => cr.id !== 'reform_fail_crisis')
                };
              }
            });
          } else if (c.id === 'ultra_left_error') {
            queueEvent({
              id: 'ultra_left_error_event',
              title: '题改极左错误爆发',
              description: '由于激进愤怒度长期居高不下，先锋队内部的极左倾向彻底失控。盲目的破坏和批斗取代了理性的改革，许多无辜的学生和老师受到波及。这场混乱极大地破坏了做题改革的成果，并让联盟的威信扫地。',
              buttonText: '我们走得太远了...',
              effect: (state) => {
                const newReformState = state.reformState ? { ...state.reformState } : undefined;
                if (newReformState) {
                  newReformState.progress = Math.max(0, newReformState.progress - 30);
                }
                return {
                  stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 20) },
                  reformState: newReformState
                };
              }
            });
          } else if (c.id === 'late_mock_exam') {
            queueEvent({
              id: 'late_game_mock_exam',
              title: '合肥市二模危机',
              description: '2024年3月，合肥市第二次模拟考试如期而至。全校师生都在关注着这次考试的成绩，这将是对我们这段时间以来路线的最终检验...',
              buttonText: '查看结果',
              effect: (state) => {
                if (state.stats.tpr >= 1000 && state.stats.ss >= 60 && state.stats.stab >= 50) {
                  return {
                    stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 20), ss: Math.min(100, state.stats.ss + 20), allianceUnity: Math.min(100, state.stats.allianceUnity + 20) },
                    activeEvent: STORY_EVENTS.mock_exam_success
                  };
                } else if (state.stats.tpr >= 500 && state.stats.ss >= 40) {
                  return {
                    stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 10), ss: Math.max(0, state.stats.ss - 10), allianceUnity: Math.max(0, state.stats.allianceUnity - 10) },
                    activeEvent: STORY_EVENTS.mock_exam_mediocre
                  };
                } else {
                  return {
                    stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 30), ss: Math.max(0, state.stats.ss - 30), allianceUnity: Math.max(0, state.stats.allianceUnity - 30) },
                    activeEvent: STORY_EVENTS.mock_exam_fail
                  };
                }
              }
            });
          } else if (c.id === 'yang_yule_late_mock_exam') {
            queueEvent({
              id: 'yang_yule_late_game_mock_exam',
              title: '合肥市二模成绩公布',
              description: '2024年3月，合肥市第二次模拟考试的成绩单终于摆在了你的桌面上。你深吸了一口气，翻开了第一页...',
              buttonText: '查看结果',
              effect: (state) => {
                if (state.stats.tpr >= 1000 && state.stats.stab >= 50 && state.stats.radicalAnger <= 50) {
                  return {
                    stats: { ...state.stats, pp: state.stats.pp + 100 },
                    yangYuleState: { ...state.yangYuleState!, fengFavor: Math.min(100, state.yangYuleState!.fengFavor + 20) },
                    activeEvent: STORY_EVENTS.yang_mock_exam_success
                  };
                } else if (state.stats.tpr >= 500 && state.stats.radicalAnger <= 70) {
                  return {
                    stats: { ...state.stats, pp: Math.max(0, state.stats.pp - 20) },
                    yangYuleState: { ...state.yangYuleState!, fengFavor: Math.max(0, state.yangYuleState!.fengFavor - 10) },
                    activeEvent: STORY_EVENTS.yang_mock_exam_mediocre
                  };
                } else {
                  return {
                    stats: { ...state.stats, pp: Math.max(0, state.stats.pp - 50), stab: Math.max(0, state.stats.stab - 20) },
                    yangYuleState: { ...state.yangYuleState!, fengFavor: Math.max(0, state.yangYuleState!.fengFavor - 30) },
                    activeEvent: STORY_EVENTS.yang_mock_exam_fail
                  };
                }
              }
            });
          } else if (c.id === 'jidi_late_mock_exam') {
            queueEvent({
              id: 'jidi_late_game_mock_exam',
              title: '合肥市二模：财报与成绩',
              description: '2024年3月，合肥市第二次模拟考试的成绩单终于摆在了及第资本的会议桌上。所有的董事都在盯着这些数字，这不仅关乎学生的命运，更关乎下一季度的股价...',
              buttonText: '查看财报与成绩',
              effect: (state) => {
                const gdp = state.jidiCorporateState?.gdp || 0;
                const admissionRate = state.jidiCorporateState?.admissionRate || 0;
                if (gdp >= 5000 && admissionRate >= 0.9) {
                  return {
                    stats: { ...state.stats, pp: state.stats.pp + 100 },
                    activeEvent: STORY_EVENTS.jidi_mock_exam_success
                  };
                } else if (gdp >= 3000 && admissionRate >= 0.8) {
                  return {
                    stats: { ...state.stats, pp: Math.max(0, state.stats.pp - 20) },
                    activeEvent: STORY_EVENTS.jidi_mock_exam_mediocre
                  };
                } else {
                  return {
                    stats: { ...state.stats, pp: Math.max(0, state.stats.pp - 50), stab: Math.max(0, state.stats.stab - 30) },
                    activeEvent: STORY_EVENTS.jidi_mock_exam_fail
                  };
                }
              }
            });
          }
        });

        // Update Cooldowns
        Object.keys(newDecisionCooldowns).forEach(k => {
          if (newDecisionCooldowns[k] > 0) newDecisionCooldowns[k] -= 1;
        });

        // Day 14 Event
        if (dateStr === '2023-09-15' && !prev.flags['day_14_event_triggered']) {
          newFlags['day_14_event_triggered'] = true;
          queueEvent(FLAVOR_EVENTS.day_14_event);
        }

        // Handle angry_hefei_no1_days_left
        if (newFlags['angry_hefei_no1_days_left'] !== undefined) {
          newFlags['angry_hefei_no1_days_left'] -= 1;
          if (newFlags['angry_hefei_no1_days_left'] <= 0) {
            newNationalSpirits = newNationalSpirits.filter(ns => ns.id !== 'angry_hefei_no1');
            delete newFlags['angry_hefei_no1_days_left'];
          }
        }

        // Handle Jidi Corporate Bureau Target
        if (newFlags['committee_established_days'] !== undefined) {
          newFlags['committee_established_days'] += 1;
          if (newFlags['committee_established_days'] === 15) {
            if (newJidiCorporateState) {
              newJidiCorporateState.bureauTarget = {
                active: true,
                daysLeft: 120,
                targetGdp: newJidiCorporateState.gdp + 5000 // 5000万
              };
              queueEvent({
                id: 'jidi_bureau_target_event',
                title: '教育局的营收指标',
                description: '教育局纪委对及第资本接管后的合肥一中提出了明确的营收要求。他们要求在接下来的120天内，学校的总GDP必须达到 ' + newJidiCorporateState.bureauTarget.targetGdp + ' 万。如果未能达成目标，及第资本将面临严厉的惩罚，甚至可能失去对学校的控制权。',
                buttonText: '必须完成指标！'
              });
            }
            delete newFlags['committee_established_days'];
          }
        }

        if (newJidiCorporateState?.bureauTarget?.active) {
          newJidiCorporateState.bureauTarget.daysLeft -= 1;
          if (newJidiCorporateState.bureauTarget.daysLeft <= 0) {
            newJidiCorporateState.bureauTarget.active = false;
            if (newJidiCorporateState.gdp >= newJidiCorporateState.bureauTarget.targetGdp) {
              queueEvent({
                id: 'jidi_bureau_target_success',
                title: '营收指标达成',
                description: '及第资本成功完成了教育局下达的营收指标。教育局纪委对我们的表现非常满意，及第资本在合肥一中的统治地位得到了进一步巩固。',
                buttonText: '资本的胜利'
              });
              newStats.pp += 50;
              newJidiCorporateState.admissionRate = Math.min(1, newJidiCorporateState.admissionRate + 0.05);
              if (newJidiCorporateState.committeeState) {
                newJidiCorporateState.committeeState.satisfaction.disciplineCommittee = Math.min(100, newJidiCorporateState.committeeState.satisfaction.disciplineCommittee + 20);
              }
            } else {
              queueEvent({
                id: 'jidi_bureau_target_failure',
                title: '营收指标未达成',
                description: '及第资本未能完成教育局下达的营收指标。教育局纪委对此表示强烈不满，并对我们进行了严厉的处罚。',
                buttonText: '可恶...'
              });
              newStats.pp -= 50;
              newStats.stab -= 15;
              newJidiCorporateState.admissionRate -= 0.1;
              if (newJidiCorporateState.committeeState) {
                newJidiCorporateState.committeeState.satisfaction.disciplineCommittee = Math.max(0, newJidiCorporateState.committeeState.satisfaction.disciplineCommittee - 30);
              }
            }
          }
        }

        // Yang Yule Route Events
        if (newFlags['yang_yule_route_started']) {
          if (newFlags['yang_yule_route_days'] === undefined) {
            newFlags['yang_yule_route_days'] = 0;
          }
          newFlags['yang_yule_route_days'] += 1;
          if (newFlags['yang_yule_route_days'] === 1) {
            queueEvent(STORY_EVENTS.yangyvle_event_1);
          } else if (newFlags['yang_yule_route_days'] === 2) {
            queueEvent(STORY_EVENTS.yangyvle_event_2);
          }
        }

        // Election Logic
        if (newElectionState && newElectionState.isActive) {
          newElectionState.daysLeft -= 1;
          
          // Add daily drift to polling data
          Object.values(newMapLocations).forEach((loc: any) => {
            if (loc.pollingData) {
              newElectionState!.candidates.forEach(c => {
                if (loc.pollingData[c] !== undefined) {
                  loc.pollingData[c] = Math.max(0, loc.pollingData[c] + (Math.random() * 4 - 2));
                }
              });
              const locTotal = Object.values(loc.pollingData).reduce((sum, val) => (sum as number) + (val as number), 0) as number;
              if (locTotal > 0) {
                Object.keys(loc.pollingData).forEach(k => {
                  loc.pollingData[k] = Math.round(((loc.pollingData[k] as number) / locTotal) * 100);
                });
              }
            }
          });

          // Update votes based on polling data
          const newVotes: Record<string, number> = {};
          newElectionState.candidates.forEach(c => newVotes[c] = 0);
          
          Object.values(newMapLocations).forEach((loc: any) => {
            if (loc.pollingData) {
              if (!loc.castVotes) {
                loc.castVotes = {};
                newElectionState!.candidates.forEach(c => loc.castVotes[c] = 0);
              }
              const dailyVotes = (loc.totalVotes || 1000) / newElectionState!.totalDays;
              newElectionState!.candidates.forEach(c => {
                if (loc.pollingData[c] !== undefined) {
                  loc.castVotes[c] = (loc.castVotes[c] || 0) + (loc.pollingData[c] / 100) * dailyVotes;
                  newVotes[c] += loc.castVotes[c];
                }
              });
            }
          });
          
          newElectionState.votes = newVotes;

          if (newElectionState.daysLeft <= 0) {
            newElectionState.isActive = false;
          }
        }

        // Late Game Mock Exam Crisis Logic
        if (dateStr === '2024-03-01' && !prev.flags['late_mock_exam_triggered']) {
          newFlags['late_mock_exam_triggered'] = true;
          
          if (newFlags['yang_yule_route_started']) {
            newCrises.push({
              id: 'yang_yule_late_mock_exam',
              title: '合肥市二模',
              daysLeft: 14,
              description: '二模即将到来，这是对你“软性维稳”路线的最终检验。你需要准备足够的TPR，同时控制激进愤怒度和稳定度。'
            });
            queueEvent(FLAVOR_EVENTS.yang_yule_mock_exam_approach_event);
          } else if (newFlags['jidi_takeover_complete']) {
            newCrises.push({
              id: 'jidi_late_mock_exam',
              title: '合肥市二模',
              daysLeft: 14,
              description: '二模即将到来，这是对及第资本“提分工厂”模式的最终检验。我们需要极高的GDP和一本率来向董事会交差。'
            });
            queueEvent(FLAVOR_EVENTS.jidi_mock_exam_approach_event);
          } else {
            newCrises.push({
              id: 'late_mock_exam',
              title: '合肥市二模',
              daysLeft: 14,
              description: '二模即将到来，这是对我们路线的最终检验。我们需要准备足够的TPR、稳定度和学生支持度。'
            });
            queueEvent(FLAVOR_EVENTS.mock_exam_approach_event);
          }
        }

        // Process Reform Missions
        if (newReformState) {
          if (!newReformState.regionalStubbornness) {
            newReformState.regionalStubbornness = {
              'B3': 60,
              'B1_B2': 40,
              'Admin': 80,
              'ArtHall': 30,
              'Lab': 50,
              'Playground': 20
            };
          }
          if (!newReformState.activeMissions) {
            newReformState.activeMissions = {};
          }
          const updatedMissions: Record<string, { daysLeft: number; actionId: string }> = { ...newReformState.activeMissions };
          Object.entries(updatedMissions).forEach(([regionId, mission]) => {
            mission.daysLeft -= 1;
            if (mission.daysLeft <= 0) {
              // Mission complete, calculate outcome
              const stubbornness = newReformState.regionalStubbornness[regionId] || 0;
              let successRate = newReformState.baseSuccessRate - stubbornness + (newStats.partyCentralization * 0.2) - (newStats.capitalPenetration * 0.15);
              if (regionId === 'B3' && newReformState.juanhaoAttitude === 4) {
                successRate += 30;
              }
              const roll = Math.random() * 100;
              
              let isCritical = false;
              let isSuccess = false;
              
              if (roll < successRate * 0.2) {
                isCritical = true;
                isSuccess = true;
              } else if (roll < successRate) {
                isSuccess = true;
              }

              // Juanhao Attitude Logic
              if (regionId === 'B3') {
                if (isSuccess) {
                  newReformState.juanhaoAttitude = Math.min(4, (newReformState.juanhaoAttitude || 0) + 1);
                } else {
                  newReformState.juanhaoAttitude = Math.max(0, (newReformState.juanhaoAttitude || 0) - 1);
                }
              }

              // Apply outcomes based on actionId
              if (isSuccess) {
                switch (mission.actionId) {
                  case 'confiscate_papers':
                    newReformState.progress += isCritical ? 15 : 10;
                    break;
                  case 'coop':
                    newReformState.progress += isCritical ? 10 : 5;
                    newReformState.regionalStubbornness[regionId] = Math.max(0, stubbornness - 10);
                    break;
                  case 'criticize_privilege':
                    newReformState.progress += isCritical ? 25 : 15;
                    break;
                  case 'mutual_learning':
                    newReformState.progress += isCritical ? 15 : 10;
                    newReformState.regionalStubbornness[regionId] = Math.max(0, stubbornness - 15);
                    break;
                  case 'speech':
                    newStats.ss = Math.min(100, newStats.ss + (isCritical ? 20 : 10));
                    newReformState.regionalStubbornness[regionId] = Math.max(0, stubbornness - 10);
                    newReformState.progress += isCritical ? 5 : 2;
                    break;
                  case 'abolish_stand':
                    newStats.studentSanity = Math.min(100, newStats.studentSanity + (isCritical ? 15 : 10));
                    newReformState.regionalStubbornness[regionId] = Math.max(0, stubbornness - 15);
                    newReformState.progress += isCritical ? 10 : 5;
                    break;
                  case 'audit':
                    newStats.capitalPenetration = Math.max(0, newStats.capitalPenetration - (isCritical ? 30 : 15));
                    newStats.tpr += isCritical ? 1000 : 500;
                    newReformState.progress += isCritical ? 10 : 5;
                    break;
                  case 'purge_corruption':
                    newStats.capitalPenetration = Math.max(0, newStats.capitalPenetration - (isCritical ? 50 : 25));
                    newReformState.regionalStubbornness[regionId] = Math.max(0, stubbornness - 30);
                    newReformState.progress += isCritical ? 15 : 10;
                    break;
                  case 'play':
                    newReformState.regionalStubbornness = Object.fromEntries(Object.entries(newReformState.regionalStubbornness || {}).map(([k, v]) => [k, Math.max(0, (v as number) - (isCritical ? 15 : 10))]));
                    newStats.allianceUnity = Math.min(100, newStats.allianceUnity + (isCritical ? 15 : 10));
                    newReformState.progress += isCritical ? 5 : 2;
                    break;
                  case 'posters':
                    newReformState.regionalStubbornness = Object.fromEntries(Object.entries(newReformState.regionalStubbornness || {}).map(([k, v]) => [k, Math.max(0, (v as number) - (isCritical ? 10 : 5))]));
                    newStats.radicalAnger = Math.min(100, newStats.radicalAnger + 5);
                    newReformState.progress += isCritical ? 5 : 2;
                    break;
                  case 'takeover_printer':
                    newReformState.baseSuccessRate += isCritical ? 20 : 10;
                    newReformState.progress += isCritical ? 5 : 2;
                    break;
                  case 'hack_network':
                    newStats.tpr += isCritical ? 1500 : 800;
                    newReformState.baseSuccessRate += isCritical ? 15 : 5;
                    newReformState.progress += isCritical ? 10 : 5;
                    break;
                  case 'complaint_meeting':
                    newReformState.progress += isCritical ? 25 : 15;
                    newStats.studentSanity = Math.max(0, newStats.studentSanity - 10);
                    break;
                }
                
                // Return members
                newReformState.vanguardMembers += 5; // Base return

                queueEvent({
                  id: `mission_success_${regionId}`,
                  title: '工作队捷报',
                  description: `派往 ${regionId} 的工作队圆满完成了任务！${isCritical ? '这是一次大成功，我们获得了额外的收益！' : ''}`,
                  buttonText: '继续前进！'
                });
              } else {
                // Failure
                switch (mission.actionId) {
                  case 'confiscate_papers':
                  case 'criticize_privilege':
                    newStats.radicalAnger = Math.min(100, newStats.radicalAnger + 20);
                    break;
                  case 'complaint_meeting':
                    newStats.studentSanity = Math.max(0, newStats.studentSanity - 20);
                    break;
                }
                
                // Chance to lose members
                if (Math.random() < 0.5) {
                  newReformState.vanguardMembers = Math.max(0, newReformState.vanguardMembers - 5);
                }

                queueEvent({
                  id: `mission_fail_${regionId}`,
                  title: '做题派反抗',
                  description: `派往 ${regionId} 的工作队遭遇了顽固势力的激烈抵抗，任务失败了。部分先锋党员在冲突中流失。`,
                  buttonText: '绝不妥协！'
                });
              }

              delete updatedMissions[regionId];
            }
          });
          newReformState.activeMissions = updatedMissions;
          
          // Passive vanguard growth
          if (Math.random() < 0.1) {
            newReformState.vanguardMembers += 1;
          }

          // Every 3 days after reform starts, trigger three queued placeholder story events.
          const reformDaysElapsed = (newReformState.reformDaysElapsed || 0) + 1;
          newReformState.reformDaysElapsed = reformDaysElapsed;

          // Trigger Juanhao events based on progress
          const progress = newReformState.progress;
          const triggered = newReformState.juanhaoEventsTriggered || {};

          if (reformDaysElapsed >= 3 && !triggered['reform_blank_1']) {
            queueEvent(STORY_EVENTS.reform_blank_event_1);
            triggered['reform_blank_1'] = true;
          }
          if (reformDaysElapsed >= 6 && !triggered['reform_blank_2']) {
            queueEvent(STORY_EVENTS.reform_blank_event_2);
            triggered['reform_blank_2'] = true;
          }
          if (reformDaysElapsed >= 9 && !triggered['reform_blank_3']) {
            queueEvent(STORY_EVENTS.reform_blank_event_3);
            triggered['reform_blank_3'] = true;
          }
          
          if (progress >= 20 && !triggered['20']) {
            newReformState.juanhaoAttitude = Math.min(4, (newReformState.juanhaoAttitude || 0) + 1);
            triggered['20'] = true;
          }
          if (progress >= 25 && !triggered['25']) {
            queueEvent(STORY_EVENTS.juanhao_event_2);
            triggered['25'] = true;
          }
          if (progress >= 30 && !triggered['30']) {
            queueEvent(STORY_EVENTS.juanhao_event_3);
            triggered['30'] = true;
          }
          if (progress >= 50 && !triggered['50']) {
            queueEvent(STORY_EVENTS.juanhao_event_4);
            triggered['50'] = true;
            newReformState.juanhaoAttitude = Math.min(4, (newReformState.juanhaoAttitude || 0) + 1);
          }
          if (progress >= 75 && !triggered['75']) {
            queueEvent(STORY_EVENTS.juanhao_event_5);
            triggered['75'] = true;
            newReformState.juanhaoAttitude = 4; // Force vanguard attitude
            
            // Auto-hire Juanhao if there's an empty slot
            const emptySlotIndex = newAdvisors.findIndex(a => a === null);
            if (emptySlotIndex !== -1 && !newAdvisors.some(a => a?.id === 'wang_juanhao_vanguard')) {
              newAdvisors[emptySlotIndex] = {
                id: 'wang_juanhao_vanguard',
                title: '红色先锋',
                name: '王卷豪',
                description: '每日试卷储备量 +20，B3教学楼所有任务成功率固定 +30%。',
                cost: 0, // Free when auto-hired
                modifiers: { tprDaily: 20 }
              };
            }
          }
          
          newReformState.juanhaoEventsTriggered = triggered;
          
          if (progress >= 100) {
            newCrises = newCrises.filter(c => c.id !== 'reform_fail_crisis');
            if (!newFlags['reform_completed']) {
              newFlags['reform_completed'] = true;
              newFlags['reform_unlocked'] = false;
              queueEvent(STORY_EVENTS.reform_complete_placeholder);
            }
          }
        }

        if (newFlags['reform_completed']) {
          newReformState = undefined;
        }

        // Process Parliament Mechanics
        if (newParliamentState && newStudentAssemblyFactions) {
          // Daily Bill Tick
          if (newParliamentState.activeBill) {
            newParliamentState.activeBill = { ...newParliamentState.activeBill };
            newParliamentState.activeBill.daysLeft -= 1;
            if (newParliamentState.activeBill.daysLeft <= 0) {
              const totalApproval = newParliamentState.activeBill.baseApproval + newParliamentState.activeBill.lobbiedApproval;
              const passed = totalApproval >= newParliamentState.activeBill.requiredApproval;
              
              if (passed) {
                const billId = newParliamentState.activeBill.id;
                const billName = newParliamentState.activeBill.name;
                const proposer = newParliamentState.activeBill.proposer;

                if (proposer && newStudentAssemblyFactions) {
                  (newStudentAssemblyFactions as any)[proposer] += 5;
                  
                  // Normalize to 100
                  const total = newStudentAssemblyFactions.orthodox + newStudentAssemblyFactions.bear + newStudentAssemblyFactions.pan + newStudentAssemblyFactions.otherDem + newStudentAssemblyFactions.testTaker + (newStudentAssemblyFactions.conservativeDem || 0) + (newStudentAssemblyFactions.jidiTutoring || 0);
                  
                  if (total !== 100 && total > 0) {
                    const ratio = 100 / total;
                    
                    newStudentAssemblyFactions.orthodox = Math.round(newStudentAssemblyFactions.orthodox * ratio);
                    newStudentAssemblyFactions.bear = Math.round(newStudentAssemblyFactions.bear * ratio);
                    newStudentAssemblyFactions.pan = Math.round(newStudentAssemblyFactions.pan * ratio);
                    newStudentAssemblyFactions.otherDem = Math.round(newStudentAssemblyFactions.otherDem * ratio);
                    newStudentAssemblyFactions.testTaker = Math.round(newStudentAssemblyFactions.testTaker * ratio);
                    if (newStudentAssemblyFactions.conservativeDem !== undefined) newStudentAssemblyFactions.conservativeDem = Math.round(newStudentAssemblyFactions.conservativeDem * ratio);
                    if (newStudentAssemblyFactions.jidiTutoring !== undefined) newStudentAssemblyFactions.jidiTutoring = Math.round(newStudentAssemblyFactions.jidiTutoring * ratio);
                    
                    // Fix rounding errors
                    const newTotal = newStudentAssemblyFactions.orthodox + newStudentAssemblyFactions.bear + newStudentAssemblyFactions.pan + newStudentAssemblyFactions.otherDem + newStudentAssemblyFactions.testTaker + (newStudentAssemblyFactions.conservativeDem || 0) + (newStudentAssemblyFactions.jidiTutoring || 0);
                    if (newTotal !== 100) {
                      newStudentAssemblyFactions.testTaker += (100 - newTotal);
                    }
                  }
                }
                
                const eventId = `${billId}_passed`;
                const storyEvent = STORY_EVENTS[eventId];
                
                if (storyEvent) {
                  queueEvent({
                    ...storyEvent,
                    effect: (state) => {
                      const baseResult = storyEvent.effect ? storyEvent.effect(state) : {};
                      const newSpirits = baseResult.nationalSpirits ? [...baseResult.nationalSpirits] : [...state.nationalSpirits];
                      
                      // Update Path of Democracy
                      const pathIndex = newSpirits.findIndex(sp => sp.id === 'path_of_democracy');
                      if (pathIndex !== -1) {
                        const passedCount = (state.flags.passed_bills_count || 0) + 1;
                        const updatedPath = { ...newSpirits[pathIndex] };
                        if (passedCount >= 5) {
                          updatedPath.name = '民主之路（完成）';
                          updatedPath.description = '民主的制度已经稳固，我们走在正确的道路上。';
                          updatedPath.type = 'positive';
                          updatedPath.effects = { ppDaily: 0.5, powerBalanceDaily: -0.1, tprDaily: 10, studentSanityDaily: 0 };
                        } else {
                          updatedPath.name = `民主之路（${passedCount}/5）`;
                          updatedPath.description = '民主的道路充满曲折，我们需要通过更多的法案来巩固它。';
                          updatedPath.effects = { 
                            ppDaily: -1 + (passedCount * 0.2), 
                            powerBalanceDaily: 0.5 - (passedCount * 0.1),
                            tprDaily: -15 + (passedCount * 5),
                            studentSanityDaily: -2.5 + (passedCount * 0.5)
                          };
                        }
                        newSpirits[pathIndex] = updatedPath;
                      }

                      let extraStab = 0;
                      let extraUnity = 0;
                      let extraSanity = 0;
                      
                      if (billId === 'bill_club_freedom') {
                        extraUnity = 10;
                      } else if (billId === 'bill_abolish_evening_study') {
                        extraSanity = 15;
                      } else if (billId === 'bill_student_welfare') {
                        extraStab = 10;
                      }

                      return {
                        ...baseResult,
                        nationalSpirits: newSpirits,
                        flags: { ...(baseResult.flags || state.flags), passed_bills_count: (state.flags.passed_bills_count || 0) + 1 },
                        stats: {
                          ...(baseResult.stats || state.stats),
                          stab: Math.min(100, (baseResult.stats?.stab || state.stats.stab) + 10 + extraStab),
                          allianceUnity: Math.min(100, (baseResult.stats?.allianceUnity || state.stats.allianceUnity) + 10 + extraUnity),
                          studentSanity: Math.min(100, (baseResult.stats?.studentSanity || state.stats.studentSanity) + extraSanity)
                        },
                        parliamentState: state.parliamentState ? { 
                          ...state.parliamentState, 
                          powerBalance: Math.max(0, state.parliamentState.powerBalance - 10) 
                        } : undefined
                      };
                    }
                  });
                } else {
                  // Fallback
                  queueEvent({
                    id: `bill_passed_${billId}`,
                    title: '法案通过！',
                    description: `议会以 ${totalApproval} 票赞成通过了《${billName}》。民主的进程又向前迈进了一步！`,
                    buttonText: '太好了',
                    effect: (state) => {
                      return {
                        parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 10) } : undefined,
                        flags: { ...state.flags, passed_bills_count: (state.flags.passed_bills_count || 0) + 1 }
                      };
                    }
                  });
                }
              } else {
                const billId = newParliamentState.activeBill.id;
                const billName = newParliamentState.activeBill.name;
                const requiredApproval = newParliamentState.activeBill.requiredApproval;
                const failedEventId = `bill_failed_${billId}`;
                const failedStoryEvent = STORY_EVENTS[failedEventId];

                if (failedStoryEvent) {
                  queueEvent({
                    ...failedStoryEvent,
                    effect: (state) => {
                      return failedStoryEvent.effect ? failedStoryEvent.effect(state) : {};
                    }
                  });
                } else {
                  queueEvent({
                    id: failedEventId,
                    title: '法案被否决',
                    description: `《${billName}》仅获得 ${totalApproval} 票赞成，未能达到 ${requiredApproval} 票的通过门槛。我们需要重新考虑我们的策略。`,
                    buttonText: '我们需要重新审视我们的策略...',
                    effect: (s) => {
                      return {
                        stats: {
                          ...s.stats,
                          stab: Math.max(0, s.stats.stab - 10),
                          allianceUnity: Math.max(0, s.stats.allianceUnity - 15),
                          radicalAnger: Math.min(100, s.stats.radicalAnger + 10)
                        }
                      };
                    }
                  });
                }
              }
              newParliamentState.activeBill = undefined;
            }
          }

          // Monthly Faction Tick (First Monday of the month)
          if (newDate.getDay() === 1 && newDate.getDate() <= 7) {
            let actualChanges = { orthodox: 0, bear: 0, pan: 0, otherDem: 0, testTaker: 0, conservativeDem: 0, jidiTutoring: 0 };
            const oldFactions = { ...prev.studentAssemblyFactions! };

            if (newFlags['polling_stations_unlocked']) {
              // Calculate average polling data
              const factions = ['pan', 'orthodox', 'bear', 'otherDem', 'testTaker', 'conservativeDem', 'jidiTutoring'];
              const totalSupport: Record<string, number> = {};
              factions.forEach(f => totalSupport[f] = 0);
              
              let numLocations = 0;
              Object.values(newMapLocations).forEach((loc: any) => {
                if (loc.pollingData) {
                  numLocations++;
                  factions.forEach(f => {
                    totalSupport[f] += loc.pollingData[f] || 0;
                  });
                }
              });

              if (numLocations > 0) {
                // Update student assembly seats based on average polling
                let totalSeats = 0;
                factions.forEach(f => {
                  const avgSupport = totalSupport[f] / numLocations;
                  (newStudentAssemblyFactions as any)[f] = Math.round(avgSupport);
                  totalSeats += (newStudentAssemblyFactions as any)[f];
                });

                // Fix rounding errors
                if (totalSeats !== 100) {
                  newStudentAssemblyFactions.pan += (100 - totalSeats);
                }
                
                // Add some random drift to polling data for next month
                Object.values(newMapLocations).forEach((loc: any) => {
                  if (loc.pollingData) {
                    factions.forEach(f => {
                      loc.pollingData[f] = Math.max(0, loc.pollingData[f] + (Math.random() * 10 - 5));
                    });
                    const locTotal = factions.reduce((sum, f) => sum + loc.pollingData[f], 0);
                    if (locTotal > 0) {
                      factions.forEach(f => {
                        loc.pollingData[f] = Math.round((loc.pollingData[f] / locTotal) * 100);
                      });
                    }
                  }
                });
              }
            } else {
              // Factions try to increase seats based on support (allianceUnity)
              const support = newStats.allianceUnity;
              let changes = { orthodox: 0, bear: 0, pan: 0, otherDem: 0, testTaker: 0, conservativeDem: 0, jidiTutoring: 0 };
              
              if (support > 60) {
                changes.pan += 2;
                changes.otherDem += 1;
                changes.orthodox -= 1;
                changes.bear -= 1;
                changes.testTaker -= 1;
              } else if (support < 40) {
                changes.pan -= 2;
                changes.orthodox += 1;
                changes.conservativeDem += 1;
              }

              // TPR and Sanity reallocation
              if (newStats.tpr < 2000) {
                changes.testTaker -= 5;
                changes.orthodox += 3;
                changes.jidiTutoring += 2;
              } else if (newStats.tpr > 8000) {
                changes.testTaker += 3;
                changes.orthodox -= 1;
                changes.jidiTutoring -= 2;
              }

              if (newStats.studentSanity < 30) {
                changes.bear += 3;
                changes.orthodox += 2;
                changes.pan -= 3;
                changes.conservativeDem -= 2;
              }

              // Apply changes and round to prevent fractional seats
              newStudentAssemblyFactions.orthodox = Math.max(0, Math.round(newStudentAssemblyFactions.orthodox + changes.orthodox));
              newStudentAssemblyFactions.bear = Math.max(0, Math.round(newStudentAssemblyFactions.bear + changes.bear));
              newStudentAssemblyFactions.pan = Math.max(0, Math.round(newStudentAssemblyFactions.pan + changes.pan));
              newStudentAssemblyFactions.otherDem = Math.max(0, Math.round(newStudentAssemblyFactions.otherDem + changes.otherDem));
              newStudentAssemblyFactions.testTaker = Math.max(0, Math.round(newStudentAssemblyFactions.testTaker + changes.testTaker));
              newStudentAssemblyFactions.conservativeDem = Math.max(0, Math.round((newStudentAssemblyFactions.conservativeDem || 0) + changes.conservativeDem));
              newStudentAssemblyFactions.jidiTutoring = Math.max(0, Math.round((newStudentAssemblyFactions.jidiTutoring || 0) + changes.jidiTutoring));

              // Normalize to 100
              const total = newStudentAssemblyFactions.orthodox + newStudentAssemblyFactions.bear + newStudentAssemblyFactions.pan + newStudentAssemblyFactions.otherDem + newStudentAssemblyFactions.testTaker + newStudentAssemblyFactions.conservativeDem + newStudentAssemblyFactions.jidiTutoring;
              
              if (total !== 100 && total > 0) {
                const ratio = 100 / total;
                
                newStudentAssemblyFactions.orthodox = Math.round(newStudentAssemblyFactions.orthodox * ratio);
                newStudentAssemblyFactions.bear = Math.round(newStudentAssemblyFactions.bear * ratio);
                newStudentAssemblyFactions.pan = Math.round(newStudentAssemblyFactions.pan * ratio);
                newStudentAssemblyFactions.otherDem = Math.round(newStudentAssemblyFactions.otherDem * ratio);
                newStudentAssemblyFactions.testTaker = Math.round(newStudentAssemblyFactions.testTaker * ratio);
                newStudentAssemblyFactions.conservativeDem = Math.round(newStudentAssemblyFactions.conservativeDem * ratio);
                newStudentAssemblyFactions.jidiTutoring = Math.round(newStudentAssemblyFactions.jidiTutoring * ratio);
                
                // Fix rounding errors
                const newTotal = newStudentAssemblyFactions.orthodox + newStudentAssemblyFactions.bear + newStudentAssemblyFactions.pan + newStudentAssemblyFactions.otherDem + newStudentAssemblyFactions.testTaker + newStudentAssemblyFactions.conservativeDem + newStudentAssemblyFactions.jidiTutoring;
                if (newTotal !== 100) {
                  newStudentAssemblyFactions.testTaker += (100 - newTotal);
                }
              }
            }

            actualChanges = {
              orthodox: newStudentAssemblyFactions.orthodox - oldFactions.orthodox,
              bear: newStudentAssemblyFactions.bear - oldFactions.bear,
              pan: newStudentAssemblyFactions.pan - oldFactions.pan,
              otherDem: newStudentAssemblyFactions.otherDem - oldFactions.otherDem,
              testTaker: newStudentAssemblyFactions.testTaker - oldFactions.testTaker,
              conservativeDem: newStudentAssemblyFactions.conservativeDem - (oldFactions.conservativeDem || 0),
              jidiTutoring: newStudentAssemblyFactions.jidiTutoring - (oldFactions.jidiTutoring || 0)
            };

            // Monthly Summary and Crisis
            if (newParliamentState.isUpgraded) {
              const monthlyChanges = actualChanges;
              const otherFactionsGained = monthlyChanges.orthodox > 0 || monthlyChanges.bear > 0 || monthlyChanges.testTaker > 0 || monthlyChanges.conservativeDem > 0 || monthlyChanges.jidiTutoring > 0;
              
              if (otherFactionsGained) {
                if (!newCrises.some(c => c.id === 'opposition_propaganda')) {
                  newCrises.push({
                    id: 'opposition_propaganda',
                    title: '反对派宣传',
                    description: '反对派正在校园内散布对民主派不利的言论，试图动摇我们的统治基础。',
                    daysLeft: 30,
                    severity: 'medium',
                    onExpire: (s) => ({
                      stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 5), allianceUnity: Math.max(0, s.stats.allianceUnity - 5) }
                    })
                  });
                } else {
                  const crisisIndex = newCrises.findIndex(c => c.id === 'opposition_propaganda');
                  if (crisisIndex !== -1) {
                    newCrises[crisisIndex] = { ...newCrises[crisisIndex], daysLeft: 30 };
                  }
                }
              }
              
              // Queue monthly summary event
              let summaryText = '本月议会席位变动总结：\n\n';
              if (monthlyChanges.pan !== 0) summaryText += `潘仁越民主派：${monthlyChanges.pan > 0 ? '+' : ''}${monthlyChanges.pan} 席\n`;
              if (monthlyChanges.otherDem !== 0) summaryText += `其他民主派：${monthlyChanges.otherDem > 0 ? '+' : ''}${monthlyChanges.otherDem} 席\n`;
              if (monthlyChanges.conservativeDem !== 0) summaryText += `保守民主派：${monthlyChanges.conservativeDem > 0 ? '+' : ''}${monthlyChanges.conservativeDem} 席\n`;
              if (monthlyChanges.orthodox !== 0) summaryText += `钢铁红蛤正统派：${monthlyChanges.orthodox > 0 ? '+' : ''}${monthlyChanges.orthodox} 席\n`;
              if (monthlyChanges.bear !== 0) summaryText += `钢铁红蛤狗熊派：${monthlyChanges.bear > 0 ? '+' : ''}${monthlyChanges.bear} 席\n`;
              if (monthlyChanges.testTaker !== 0) summaryText += `做题派岁月静好党：${monthlyChanges.testTaker > 0 ? '+' : ''}${monthlyChanges.testTaker} 席\n`;
              if (monthlyChanges.jidiTutoring !== 0) summaryText += `及第补习派：${monthlyChanges.jidiTutoring > 0 ? '+' : ''}${monthlyChanges.jidiTutoring} 席\n`;
              
              if (Object.values(monthlyChanges).every(v => v === 0)) {
                summaryText += '本月各派系席位没有发生变化。';
              }
              
              queueEvent({
                id: 'monthly_parliament_summary',
                title: '每月议会简报',
                description: summaryText,
                choices: [{ text: '了解', effect: (s) => ({}) }]
              });
            }

            // Update base approval if a bill is active
            if (newParliamentState.activeBill) {
              const currentSupport = newStudentAssemblyFactions.pan + newStudentAssemblyFactions.otherDem;
              if (currentSupport > newParliamentState.activeBill.baseApproval) {
                newParliamentState.activeBill.baseApproval = currentSupport;
              }
            }
          }
        }

        // Process Cooldowns
        if (newFlags['opposition_slander_cooldown'] > 0) {
          newFlags['opposition_slander_cooldown'] -= 1;
        }

        // Check for Opposition Slander Crisis
        const hasAssemblyMechanic = !!newFlags.assembly_unlocked || newCompletedFocuses.includes('convene_assembly') || newNationalSpirits.some(spirit => spirit.id === 'assembly_dynamics') || !!newParliamentState;
        if (hasAssemblyMechanic && newStats.studentSanity < 70 && newStudentAssemblyFactions && newStudentAssemblyFactions.pan < 40 && prev.currentFocusTree.startsWith('treeA')) {
          if (!newCrises.some(c => c.id === 'opposition_slander') && !(newFlags['opposition_slander_cooldown'] > 0)) {
            newCrises.push({
              id: 'opposition_slander',
              title: '反对派污蔑！',
              description: '由于学生理智低下且我们在议会中处于弱势，反对派趁机散布关于我们的恶毒谣言。',
              daysLeft: 30,
              severity: 'high',
              onExpire: (s) => ({
                stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 10), allianceUnity: Math.max(0, s.stats.allianceUnity - 10) },
                flags: { ...s.flags, opposition_slander_cooldown: 15 }
              })
            });
            queueEvent({
              id: 'opposition_slander_event',
              title: '反对派污蔑！',
              description: '由于近期学生理智值持续走低，且我们在学生代表大会中的席位不足，反对派抓住了这个机会。他们开始在校园内大肆散布关于我们的谣言和污蔑，试图彻底摧毁我们的声誉。我们必须尽快采取行动，否则后果不堪设想！',
              buttonText: '可恶的造谣者！',
              effect: (s) => ({})
            });
          }
        } else {
          const slanderIndex = newCrises.findIndex(c => c.id === 'opposition_slander');
          if (slanderIndex !== -1) {
            newCrises.splice(slanderIndex, 1);
          }
        }

        // Process Red Toad Mechanics
        if (newRedToadState) {
          const retiredFlagMap: Record<string, string> = {
            orthodox: 'faction_retired_orthodox',
            libertarian_socialist: 'faction_retired_libertarian_socialist',
            internet_philosopher: 'faction_retired_internet_philosopher',
            anarchist: 'faction_retired_anarchist',
            authoritarian: 'faction_retired_authoritarian',
          };
          const isRetiredFaction = (factionId: string) => !!newFlags[retiredFlagMap[factionId]];

          // Daily check for faction crisis
          Object.keys(newRedToadState.factions).forEach(factionId => {
            const crisisId = `red_toad_crisis_${factionId}`;
            const crisisIndex = newCrises.findIndex(c => c.id === crisisId);
            const shouldSkipCrisisCheck = factionId === 'orthodox' || (newFlags.lu_nkpd_mode && factionId === 'authoritarian');
            if (shouldSkipCrisisCheck) {
              if (crisisIndex !== -1) {
                newCrises.splice(crisisIndex, 1);
              }
              return;
            }

            if (factionId !== 'orthodox') {
              const faction = newRedToadState.factions[factionId as keyof typeof newRedToadState.factions];
              
              if (faction && !isRetiredFaction(factionId) && faction.loyalty < 30 && faction.execution > 70) {
                if (crisisIndex === -1) {
                  newCrises.push({
                    id: crisisId,
                    title: `${faction.name} 派系危机`,
                    description: `${faction.name} 忠诚度过低且执行力过高，正在策划破坏行动！如果不加以安抚或镇压，将在30天后严重危害党内总共识度。`,
                    daysLeft: 30,
                    severity: 'high',
                    onExpire: (s) => {
                      const currentFactions = s.redToadState?.factions;
                      if (currentFactions && currentFactions[factionId] && currentFactions[factionId].loyalty < 30 && currentFactions[factionId].execution > 70) {
                        return {
                          redToadState: {
                            ...s.redToadState!,
                            overallConsensus: Math.max(0, s.redToadState!.overallConsensus - 20)
                          }
                        };
                      }
                      return {};
                    }
                  });
                }
              } else {
                if (crisisIndex !== -1) {
                  newCrises.splice(crisisIndex, 1);
                }
              }
            }
          });

          if (newDate.getDay() === 1) {
            const weeklySnapshot: Record<string, { name: string; loyalty: number; execution: number }> = {};
            Object.entries(newRedToadState.factions).forEach(([factionId, faction]) => {
              weeklySnapshot[factionId] = {
                name: faction.name,
                loyalty: faction.loyalty,
                execution: faction.execution
              };
            });
            const consensusBefore = newRedToadState.overallConsensus;

            let loyalFactionsCount = 0;
            Object.entries(newRedToadState.factions).forEach(([factionId, faction]) => {
              if (!isRetiredFaction(factionId) && faction.loyalty >= 50) {
                loyalFactionsCount++;
              }
            });
            
            let consensusChange = 0;
            if (loyalFactionsCount >= 3) {
              consensusChange = (loyalFactionsCount - 2) * 2;
            } else {
              consensusChange = (loyalFactionsCount - 3) * 2;
            }
            if (newFlags.lu_red_terror) {
              consensusChange += 5;
            }
            
            newRedToadState.overallConsensus = Math.max(0, Math.min(100, newRedToadState.overallConsensus + consensusChange));

            const weeklyAdvisorEffects = [
              { advisorId: 'jiang_haobang', factionId: 'libertarian_socialist', loyaltyDelta: 5, executionDelta: 0 },
              { advisorId: 'lu_bohan', factionId: 'authoritarian', loyaltyDelta: 3, executionDelta: 3 },
              { advisorId: 'shi_ji', factionId: 'anarchist', loyaltyDelta: 4, executionDelta: 0 },
              { advisorId: 'zhou_hongbing', factionId: 'internet_philosopher', loyaltyDelta: 3, executionDelta: -1 }
            ];

            const applyAdvisorWeeklyEffects = () => {
              weeklyAdvisorEffects.forEach(effect => {
                const hired = newAdvisors.some(a => a?.id === effect.advisorId);
                const faction = newRedToadState.factions[effect.factionId as keyof typeof newRedToadState.factions];
                if (hired && faction && !isRetiredFaction(effect.factionId)) {
                  faction.loyalty = Math.max(0, Math.min(100, faction.loyalty + effect.loyaltyDelta));
                  faction.execution = Math.max(0, Math.min(100, faction.execution + effect.executionDelta));
                }
              });
            };
            
            if (newReformState) {
              const loyaltyDecrease = Math.floor(1 + ((100 - newReformState.progress) / 100) * 9);

              Object.keys(newRedToadState.factions).forEach(factionId => {
                if (factionId !== 'orthodox' && !isRetiredFaction(factionId)) {
                  const faction = newRedToadState.factions[factionId as keyof typeof newRedToadState.factions];
                  if (faction) {
                    faction.loyalty = Math.max(0, faction.loyalty - loyaltyDecrease);
                    const execIncrease = Math.floor(Math.random() * 6);
                    faction.execution = Math.min(100, faction.execution + execIncrease);
                  }
                }
              });
              applyAdvisorWeeklyEffects();
            } else if (newFlags['reform_completed']) {
              const loyaltyDecrease = Math.floor((100 - newStats.stab) / 10);

              if (loyaltyDecrease > 0) {
                Object.keys(newRedToadState.factions).forEach(factionId => {
                  if (factionId !== 'orthodox' && !isRetiredFaction(factionId)) {
                    const faction = newRedToadState.factions[factionId as keyof typeof newRedToadState.factions];
                    if (faction) {
                      faction.loyalty = Math.max(0, faction.loyalty - loyaltyDecrease);
                    }
                  }
                });
              }
              applyAdvisorWeeklyEffects();
            } else {
              applyAdvisorWeeklyEffects();
            }

            const factionLines = Object.entries(newRedToadState.factions).map(([factionId, faction]) => {
              const before = weeklySnapshot[factionId];
              const loyaltyDelta = faction.loyalty - (before?.loyalty ?? faction.loyalty);
              const executionDelta = faction.execution - (before?.execution ?? faction.execution);
              const retiredText = isRetiredFaction(factionId) ? '（已退休）' : '';
              return `- ${faction.name}${retiredText}: 忠诚度 ${loyaltyDelta >= 0 ? '+' : ''}${loyaltyDelta}，执行力 ${executionDelta >= 0 ? '+' : ''}${executionDelta}`;
            });

            const consensusAfter = newRedToadState.overallConsensus;
            const consensusDelta = consensusAfter - consensusBefore;
            factionLines.push(`总共识度变化：${consensusDelta >= 0 ? '+' : ''}${consensusDelta}`);
            factionLines.push(`变化后总共识度：${consensusAfter}`);

            if (!newFlags.lu_dual_power_unlocked && !newFlags.lu_nkpd_mode && !prev.completedFocuses.includes('cooperate_with_gouxiong')) {
              queueEvent({
                id: `red_toad_weekly_report_${newDate.getTime()}`,
                title: '政治局周报',
                description: factionLines.join('\n'),
                buttonText: '了解',
              });
            }
          }
        }

        // Process Yang Yule Mechanics
        if (newYangYuleState) {
          // Reset daily decision
          newYangYuleState.dailyDecisionUsed = false;

          // Reset weekly uses on Monday
          if (newDate.getDay() === 1) {
            newYangYuleState.thermosUsesThisWeek = 0;
            newYangYuleState.medicineUsesThisWeek = 0;
          }

          // Health drain
          if (newYangYuleState.unlockedMechanics.health) {
            const averageStabSs = (prev.stats.stab + prev.stats.ss) / 2;
            const healthDrain = 0.5 - (averageStabSs / 100) * 0.49; // 0.01 to 0.5 based on stab and ss
            newYangYuleState.health = Math.max(0, newYangYuleState.health - healthDrain);
            
            if (newYangYuleState.health <= 0 && !newFlags['yang_yule_health_death']) {
              newFlags['yang_yule_health_death'] = true;
              queueEvent({
                id: 'yang_yule_health_death_event',
                title: '最终的被动语态',
                description: '你正端坐在那张宽大的红木办公桌前，试图在一份关于“高三全面取消午休”的红头文件上盖下黄铜公章。突然，你的胸口传来一阵极其尖锐的绞痛，那感觉就像是有人把一整个带刺的榴莲硬生生塞进了你的左心室。\n\n你颤抖着伸出手，想要去抓桌角那个掉漆的保温杯，但这具被你过度透支的衰老躯壳终于发起了最后的、不可逆的暴动。你大脑里的那块“橡皮擦”此刻马力全开，它不仅擦掉了定语从句，擦掉了新教改的阿谀奉承，甚至极其精准地擦掉了支配你心肺系统的神经中枢。\n\n你曾经在讲台上理直气壮地教育做题家们：“一个人一天呼吸五十升空气，不需要问肺为什么要吸气”。而现在，你的肺不仅不再问为什么，它甚至直接拒绝为你提供今天的第五十一升空气。缺氧的剧痛让你体会到了前所未有的恐慌。\n\n在视线彻底被黑雾吞噬的前一秒，你惊恐地发现，墙上那张你毕生追求、日夜凝视的“特级教师”证书，其上的字迹正在疯狂扭曲重组，最终化作了两个血红的英文字母——“ED”。这是生命彻底的、无法抗拒的被动语态。\n\n而在那片令人窒息的虚无幻境中，你仿佛清清楚楚地看到，那个因为天天打篮球而比你“早走五年”的哥们，正抱着一个味道“还不戳儿”的榴莲，笑眯眯地站在奈何桥上冲你招手。',
                buttonText: '”杨特“的教师生涯，终于加上了ED。',
                isStoryEvent: true,
                effect: (state) => ({
                  gameEnding: 'game_over_school',
                  activeSuperEvent: {
                    id: 'yang_yule_death',
                    title: '老保的黄昏',
                    quote: '我的教师生涯可就结束了。',
                    author: '杨玉乐'
                  }
                })
              });
            }
          }

          // Map mechanics
          if (newYangYuleState.unlockedMechanics.map) {
            const updatedRebelLocations = { ...newYangYuleState.rebelLocations };
            const updatedRebelCooldowns = { ...(newYangYuleState.rebelCooldowns || {}) };
            
            // Process existing rebel locations
            Object.entries(updatedRebelLocations).forEach(([locId, daysLeft]) => {
              updatedRebelLocations[locId] = daysLeft - 1;
              if (updatedRebelLocations[locId] <= 0) {
                // Rebellion succeeds in this location
                delete updatedRebelLocations[locId];
                newStats.stab = Math.max(0, newStats.stab - 10);
                newYangYuleState!.fengFavor = Math.max(0, newYangYuleState!.fengFavor - 10);
                queueEvent({
                  id: `yang_yule_rebel_success_${locId}`,
                  title: '红蛤暴动',
                  description: `由于我们未能及时镇压，${newMapLocations[locId]?.name || '某地'}的“钢铁红蛤”成功发动了暴动！稳定度和封校长的信任大幅下降！`,
                  buttonText: '这群小兔崽子！'
                });
              }
            });

            // Process cooldowns
            Object.entries(updatedRebelCooldowns).forEach(([locId, daysLeft]) => {
              if (daysLeft > 1) {
                updatedRebelCooldowns[locId] = daysLeft - 1;
              } else {
                delete updatedRebelCooldowns[locId];
              }
            });

            // Randomly spawn new rebel locations
            Object.keys(newMapLocations).forEach(locId => {
              if (!updatedRebelLocations[locId] && !updatedRebelCooldowns[locId]) {
                const ssFactor = (100 - newStats.ss) * 0.05;
                const angerFactor = newStats.radicalAnger * 0.05;
                const chance = Math.max(0.1, Math.min(10, ssFactor + angerFactor));
                
                if (Math.random() * 100 < chance) {
                  updatedRebelLocations[locId] = 5; // 5 days to handle
                }
              }
            });
            
            newYangYuleState.rebelLocations = updatedRebelLocations;
            newYangYuleState.rebelCooldowns = updatedRebelCooldowns;
          }
        }

        // Process Jidi Corporate Mechanics
        if (newJidiCorporateState) {
          // Apply Daily GDP Growth
          const totalGdpGrowth = newJidiCorporateState.gdpGrowth + gdpGrowthMod;
          newJidiCorporateState.gdp += newJidiCorporateState.gdp * (totalGdpGrowth / 30);

          // R&D Cycle Tick
          if (newJidiCorporateState.rndState && newJidiCorporateState.rndState.phase !== 'idle') {
            newJidiCorporateState.rndState.daysInPhase += 1;
            newJidiCorporateState.rndState.daysSinceLastIntensityChange += 1;
            
            // Apply constant quality buff
            if (newJidiCorporateState.rndState.currentProduct && rndQualityMod > 0) {
              newJidiCorporateState.rndState.currentProduct.quality += rndQualityMod;
            }
            
            // Phase transitions
            if (newJidiCorporateState.rndState.phase === 'initiation' && newJidiCorporateState.rndState.daysInPhase >= 20) {
              newJidiCorporateState.rndState.phase = 'testing';
              newJidiCorporateState.rndState.daysInPhase = 0;
              queueEvent({
                id: 'jidi_rnd_testing_phase',
                title: '密卷研发：进入极限测试阶段',
                description: '初步的教辅内容已经编写完成。现在，我们需要将这些内容投入到学生的日常练习中，进行“极限测试”。测试强度越高，最终产品的质量可能越好，但也会严重消耗学生的理智。',
                buttonText: '开始测试',
              });
            } else if (newJidiCorporateState.rndState.phase === 'testing' && newJidiCorporateState.rndState.daysInPhase >= 20) {
              newJidiCorporateState.rndState.phase = 'dumping';
              newJidiCorporateState.rndState.daysInPhase = 0;
              queueEvent({
                id: 'jidi_rnd_dumping_phase',
                title: '密卷研发：进入倾销与财报阶段',
                description: '测试阶段结束，最终版本的《合一密卷》已经定稿。现在是时候将其推向市场，转化为我们的利润了。',
                buttonText: '开始销售',
              });
            } else if (newJidiCorporateState.rndState.phase === 'dumping' && newJidiCorporateState.rndState.daysInPhase >= 20) {
              // Finish R&D
              const quality = newJidiCorporateState.rndState.currentProduct?.quality || 0;
              const productName = newJidiCorporateState.rndState.currentProduct?.name || '未知产品';
              const salesMultiplier = newJidiCorporateState.rndState.currentProduct?.salesMultiplier || 1.0;
              const faction = newJidiCorporateState.rndState.currentProduct?.faction || 'jidi';
              
              // Calculate final rewards
              const baseGdpGain = 500; // Reduced from 1000
              const qualityMultiplier = 1 + (quality / 100);
              const totalGdpGain = Math.round(baseGdpGain * qualityMultiplier * salesMultiplier);
              
              newJidiCorporateState.gdp += totalGdpGain;
              newJidiCorporateState.admissionRate = Math.min(1, newJidiCorporateState.admissionRate + (quality / 2000));
              
              // Calculate seat change based on sales success
              const expectedGdpGain = 600;
              let seatChange = Math.round((totalGdpGain - expectedGdpGain) / 100);
              seatChange = Math.min(5, Math.max(-5, seatChange));
              
              let seatChangeText = '';
              if (newJidiCorporateState.committeeState && seatChange !== 0) {
                const oldSeats = newJidiCorporateState.committeeState.seats[faction];
                newJidiCorporateState.committeeState.seats[faction] = Math.max(0, oldSeats + seatChange);
                
                // Normalize seats
                const totalSeats = Object.values(newJidiCorporateState.committeeState.seats).reduce((a, b) => a + b, 0);
                if (totalSeats > 0) {
                  Object.keys(newJidiCorporateState.committeeState.seats).forEach(k => {
                    newJidiCorporateState.committeeState!.seats[k] = Math.round((newJidiCorporateState.committeeState!.seats[k] / totalSeats) * 100);
                  });
                }
                
                const factionNames: Record<string, string> = {
                  jidi: '及第资本',
                  newOriental: '新东方资本',
                  teachers: '合一教师协会',
                  disciplineCommittee: '纪委与校方'
                };
                seatChangeText = `\n\n由于《${productName}》的市场表现，${factionNames[faction]}在联合管理委员会的席位变化了 ${seatChange > 0 ? '+' : ''}${seatChange} 席。`;
              }
              
              const isSuccess = seatChange >= 0;
              const eventId = `jidi_rnd_completed_${faction}_${isSuccess ? 'success' : 'fail'}`;
              
              let flavorText = '';
              if (faction === 'jidi') {
                flavorText = isSuccess ? '及第教育的最新产品在市场上取得了巨大的成功！家长们疯狂抢购，学生们在题海中苦苦挣扎。及第派系在联合管理委员会中的影响力进一步提升。' : '由于质量低劣或营销不力，及第教育的新产品遭遇了滑铁卢。家长们纷纷退货，及第派系在联合管理委员会中的威信受到了打击。';
              } else if (faction === 'newOriental') {
                flavorText = isSuccess ? '新东方派系的教辅产品凭借其独特的“魔改”思路，成功吸引了大量学生。新东方派系在联合管理委员会中的话语权显著增强。' : '新东方派系的新产品过于超前，市场反响平平。大量的库存积压让新东方派系在联合管理委员会中抬不起头。';
              } else if (faction === 'teachers') {
                flavorText = isSuccess ? '合一教师协会推出的产品精准击中了阅卷老师的痛点，成为了学生们的必备神器。教师派系在联合管理委员会中的地位得到了巩固。' : '学生们对枯燥的产品感到厌烦，教师协会的新产品销量惨淡。教师派系在联合管理委员会中的影响力有所下降。';
              }

              queueEvent({
                id: eventId,
                title: isSuccess ? `${productName} 大获成功` : `${productName} 遭遇滑铁卢`,
                description: `${flavorText}\n\n本轮《${productName}》研发与销售周期已结束。\n\n产品最终质量：${quality.toFixed(1)}\n销售倍率：${salesMultiplier.toFixed(2)}x\n获得 GDP 增长：+${totalGdpGain} 万\n预测一本率提升。${seatChangeText}`,
                buttonText: '准备下一轮',
              });
              
              // Reset R&D state for next cycle
              newJidiCorporateState.rndState = {
                phase: 'idle',
                daysInPhase: 0,
                testingIntensity: 5,
                daysSinceLastIntensityChange: 0,
              };
            }
            
            // Apply daily effects based on phase
            if (newJidiCorporateState.rndState.phase === 'testing') {
              // Drain sanity based on testing intensity (1-10)
              const intensity = newJidiCorporateState.rndState.testingIntensity;
              const sanityDrain = intensity * 0.1;
              newStats.studentSanity = Math.max(0, newStats.studentSanity - sanityDrain);
              newStats.ss = Math.max(0, newStats.ss - (intensity * 0.05));
              
              // Increase quality based on testing intensity
              if (newJidiCorporateState.rndState.currentProduct) {
                newJidiCorporateState.rndState.currentProduct.quality += (intensity * 0.2);
              }
            } else if (newJidiCorporateState.rndState.phase === 'dumping') {
              // Gradual GDP increase during dumping
              newJidiCorporateState.gdp += 10 * (newJidiCorporateState.rndState.currentProduct?.salesMultiplier || 1.0);
              if (newJidiCorporateState.rndState.currentProduct) {
                newJidiCorporateState.rndState.currentProduct.sales += 10;
              }
            }
          }

          // Committee Bill Tick
          if (newJidiCorporateState.committeeState && newJidiCorporateState.committeeState.activeBill) {
            newJidiCorporateState.committeeState.activeBill.daysLeft -= 1;
            
            if (newJidiCorporateState.committeeState.activeBill.daysLeft <= 0) {
              const bill = newJidiCorporateState.committeeState.activeBill;
              const totalApproval = bill.support; // using support instead of baseApproval + lobbiedApproval
              const passed = totalApproval >= 50; // assuming 50 is required
              
              if (passed) {
                queueEvent({
                  id: `jidi_bill_passed_${bill.id}`,
                  title: '法案通过',
                  description: `联合管理委员会以 ${totalApproval.toFixed(1)}% 赞成率通过了《${bill.name}》。`,
                  buttonText: '执行',
                  effect: (s) => {
                    const ns = { ...s };
                    if (!ns.jidiCorporateState) return ns;
                    
                    switch (bill.id) {
                      case 'extend_study':
                        ns.jidiCorporateState.gdp += 500;
                        ns.jidiCorporateState.admissionRate = Math.min(1, ns.jidiCorporateState.admissionRate + 0.02);
                        ns.stats.studentSanity = Math.max(0, ns.stats.studentSanity - 10);
                        if (ns.jidiCorporateState.committeeState) {
                          ns.jidiCorporateState.committeeState.satisfaction.teachers = Math.max(0, ns.jidiCorporateState.committeeState.satisfaction.teachers - 15);
                        }
                        break;
                      case 'reduce_food':
                        ns.jidiCorporateState.gdp += 300;
                        ns.stats.studentSanity = Math.max(0, ns.stats.studentSanity - 5);
                        break;
                      case 'ban_clubs':
                        ns.jidiCorporateState.admissionRate = Math.min(1, ns.jidiCorporateState.admissionRate + 0.03);
                        ns.stats.studentSanity = Math.max(0, ns.stats.studentSanity - 15);
                        if (ns.jidiCorporateState.committeeState) {
                          ns.jidiCorporateState.committeeState.satisfaction.newOriental = Math.min(100, ns.jidiCorporateState.committeeState.satisfaction.newOriental + 10);
                        }
                        break;
                      case 'performance_bonus':
                        ns.stats.tpr = Math.min(100, ns.stats.tpr + 5);
                        ns.jidiCorporateState.gdp = Math.max(0, ns.jidiCorporateState.gdp - 200);
                        if (ns.jidiCorporateState.committeeState) {
                          ns.jidiCorporateState.committeeState.satisfaction.newOriental = Math.min(100, ns.jidiCorporateState.committeeState.satisfaction.newOriental + 15);
                        }
                        break;
                      case 'protect_teachers':
                        ns.stats.tpr = Math.max(0, ns.stats.tpr - 5);
                        ns.stats.stab = Math.min(100, ns.stats.stab + 5);
                        if (ns.jidiCorporateState.committeeState) {
                          ns.jidiCorporateState.committeeState.satisfaction.teachers = Math.min(100, ns.jidiCorporateState.committeeState.satisfaction.teachers + 20);
                          ns.jidiCorporateState.committeeState.satisfaction.jidi = Math.max(0, ns.jidiCorporateState.committeeState.satisfaction.jidi - 15);
                        }
                        break;
                      case 'strict_patrols':
                        ns.stats.stab = Math.min(100, ns.stats.stab + 10);
                        ns.stats.studentSanity = Math.max(0, ns.stats.studentSanity - 10);
                        if (ns.jidiCorporateState.committeeState) {
                          ns.jidiCorporateState.committeeState.satisfaction.disciplineCommittee = Math.min(100, ns.jidiCorporateState.committeeState.satisfaction.disciplineCommittee + 15);
                        }
                        break;
                    }
                    return ns;
                  }
                });
                
                // Increase satisfaction of proposer
                if (bill.proposer) {
                  newJidiCorporateState.committeeState.satisfaction[bill.proposer] = Math.min(100, newJidiCorporateState.committeeState.satisfaction[bill.proposer] + 15);
                }
              } else {
                queueEvent({
                  id: `jidi_bill_failed_${bill.id}`,
                  title: '法案被否决',
                  description: `《${bill.name}》仅获得 ${totalApproval.toFixed(1)}% 赞成率，未能通过。提议派系对此表示不满。`,
                  buttonText: '继续',
                });
                
                // Decrease satisfaction of proposer
                if (bill.proposer) {
                  newJidiCorporateState.committeeState.satisfaction[bill.proposer] = Math.max(0, newJidiCorporateState.committeeState.satisfaction[bill.proposer] - 20);
                }
              }
              
              newJidiCorporateState.committeeState.activeBill = undefined;
            }
          }

          // Monthly GDP History Update & Satisfaction Decay
          if (newDate.getDate() === 1) {
            newJidiCorporateState.gdpHistory.push(newJidiCorporateState.gdp);
            if (newJidiCorporateState.gdpHistory.length > 12) {
              newJidiCorporateState.gdpHistory.shift(); // Keep last 12 months
            }
            
            // Faction satisfaction decay
            if (newJidiCorporateState.committeeState) {
              Object.keys(newJidiCorporateState.committeeState.satisfaction).forEach(faction => {
                const key = faction as 'jidi' | 'newOriental' | 'teachers' | 'disciplineCommittee';
                // Decay towards 50
                if (newJidiCorporateState.committeeState!.satisfaction[key] > 50) {
                  newJidiCorporateState.committeeState!.satisfaction[key] -= 2;
                } else if (newJidiCorporateState.committeeState!.satisfaction[key] < 50) {
                  newJidiCorporateState.committeeState!.satisfaction[key] += 1;
                }
                
                // Crisis if satisfaction too low
                if (newJidiCorporateState.committeeState!.satisfaction[key] < 20) {
                  if (!newCrises.some(c => c.id === `jidi_faction_crisis_${key}`)) {
                    newCrises.push({
                      id: `jidi_faction_crisis_${key}`,
                      title: '派系危机',
                      description: `某一派系对现状极度不满，可能会采取极端行动。`,
                      daysLeft: 30,
                      severity: 'high',
                      onExpire: (s) => ({
                        stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 20) }
                      })
                    });
                  }
                }
              });
            }
          }
        }

        // Trigger story events on specific dates (Removed, now handled by focuses)
        // Map Mechanics
        if (prev.flags['rebellion_started']) {
          // B3 Buff
          if (newMapLocations.b3.studentControl > 50) {
            ssMod += 0.5;
          }
          // Admin Debuff
          if (newMapLocations.admin.studentControl < 50) {
            stabMod -= 0.2;
          }
          // B1/B2 Buff
          tprMod += newMapLocations.b1b2.studentControl * 0.1;

          // Penetration (School AI attacks)
          const targets = ['b1b2', 'b3', 'auditorium'];
          targets.forEach(target => {
            if (newMapLocations[target].defenseDays > 0) {
              newMapLocations[target].defenseDays -= 1;
            } else {
              if (!(prev.flags['united_committee_established'] && newMapLocations[target].studentControl >= 100)) {
                newMapLocations[target].studentControl = Math.max(0, newMapLocations[target].studentControl - 0.5);
              }
            }
          });
          
          if (newMapLocations.lab.defenseDays > 0) {
             newMapLocations.lab.defenseDays -= 1;
          } else {
             if (!(prev.flags['united_committee_established'] && newMapLocations.lab.studentControl >= 100)) {
               newMapLocations.lab.studentControl = Math.max(0, newMapLocations.lab.studentControl - 0.2);
             }
          }

          // Student Sanity Crisis Logic (仅及第线生效)
          const isJidiRouteActive = prev.currentFocusTree === 'jidi_tree' || !!newFlags['jidi_takeover_complete'] || !!newJidiCorporateState;
          if (isJidiRouteActive) {
            if (newStats.studentSanity < 10) {
              newFlags['days_student_sanity_below_10'] = (newFlags['days_student_sanity_below_10'] || 0) + 1;
              if (newFlags['days_student_sanity_below_10'] >= 30 && !newFlags['student_venting_crisis_triggered']) {
                newFlags['student_venting_crisis_triggered'] = true;
                queueEvent(STORY_EVENTS.student_venting_crisis_event);
              }
            } else {
              newFlags['days_student_sanity_below_10'] = 0;
            }

            if (newStats.studentSanity >= 30) {
              newCrises = newCrises.filter(c => c.id !== 'student_venting');
            }
          } else {
            newFlags['days_student_sanity_below_10'] = 0;
            newCrises = newCrises.filter(c => c.id !== 'student_venting');
          }

        // Check Game Over
          const redCount = Object.values(newMapLocations).filter((l: any) => l.studentControl < 45).length;
          const greenCount = Object.values(newMapLocations).filter((l: any) => l.studentControl > 55).length;

          const isGouxiongRouteActive = prev.currentFocusTree === 'gouxiong_tree' || !!newFlags.gouxiong_system_unlocked || !!newFlags.gx_anarchy_phase || prev.leader.name === '狗熊';

          if (redCount >= 5 && newStats.stab < 30 && !prev.flags['game_over_triggered'] && !prev.flags['yang_yule_route_started'] && !prev.flags['jidi_takeover_complete'] && !isGouxiongRouteActive) {
            newFlags['game_over_triggered'] = true;
            return {
              ...prev,
              activeSuperEvent: GAME_OVER_SCHOOL,
              flags: newFlags,
              mapLocations: newMapLocations,
              gameEnding: 'game_over_school'
            };
          } else if (greenCount >= 5 && newStats.tpr <= 0 && newStats.stab < 30 && !prev.flags['game_over_triggered'] && !prev.flags['yang_yule_route_started'] && !prev.flags['jidi_takeover_complete'] && !isGouxiongRouteActive) {
            newFlags['game_over_triggered'] = true;
            return {
              ...prev,
              activeSuperEvent: GAME_OVER_ANARCHY,
              flags: newFlags,
              mapLocations: newMapLocations,
              gameEnding: 'game_over_anarchy'
            };
          }
        }

        if (!newActiveEvent && newActiveStoryEvents.length > 0) {
          newActiveEvent = newActiveStoryEvents.shift() || null;
        }

        return {
          ...prev,
          date: newDate,
          isPaused: newIsPaused,
          stats: newStats,
          modifiers: newModifiers,
          nationalSpirits: newNationalSpirits,
          activeFocus: newActiveFocus,
          completedFocuses: newCompletedFocuses,
          crises: newCrises,
          decisionCooldowns: newDecisionCooldowns,
          activeMinigame: newActiveMinigame,
          activeSuperEvent: newActiveSuperEvent,
          activeStoryEvents: newActiveStoryEvents,
          flags: newFlags,
          mapLocations: newMapLocations,
          activeEvent: newActiveEvent,
          leader: newLeader,
          ideologies: newIdeologies,
          gameEnding: newGameEnding,
          currentFocusTree: newCurrentFocusTree,
          unlockedMinigames: newUnlockedMinigames,
          cyberDeconstruction: newCyberDeconstruction,
          reformState: newReformState,
          yangYuleState: newYangYuleState,
          gouxiongState: newGouxiongState,
          studentAssemblyFactions: newStudentAssemblyFactions,
          parliamentState: newParliamentState,
          electionState: newElectionState,
          jidiCorporateState: newJidiCorporateState,
          redToadState: newRedToadState,
        };
      });
    }, delay);

    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.activeEvent, gameState.activeSuperEvent, gameState.activeMinigame, gameState.gameSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsConsoleOpen(prev => !prev);
        return;
      }

      if (e.key === 'Escape' && appMode === 'game') {
        e.preventDefault();
        if (isInGameMenuOpen) {
          closeInGameMenu();
        } else {
          openInGameMenu();
        }
        return;
      }

      if (isConsoleOpen) return;

      if (appMode === 'game' && e.code === 'F5') {
        e.preventDefault();
        handleQuickSave();
        return;
      }

      if (appMode === 'game' && e.code === 'F9') {
        e.preventDefault();
        handleQuickLoad();
        return;
      }

      if (e.code === 'Space' && !gameState.activeEvent && !gameState.activeSuperEvent && !gameState.activeMinigame) {
        e.preventDefault();
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    appMode,
    gameState.activeEvent,
    gameState.activeSuperEvent,
    gameState.activeMinigame,
    isConsoleOpen,
    isInGameMenuOpen,
  ]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const args = consoleInput.trim().split(' ');
    if (args.length === 1 && args[0].toLowerCase() === 'debug') {
      setGameState(prev => ({
        ...prev,
        flags: { ...prev.flags, debug_mode: !prev.flags.debug_mode }
      }));
    } else if (args.length === 2) {
      const command = args[0].toLowerCase();
      const value = parseFloat(args[1]);
      
      if (!isNaN(value)) {
        setGameState(prev => {
          const newStats = { ...prev.stats };
          if (command === 'pp') newStats.pp += value;
          if (command === 'ss') newStats.ss = Math.min(100, Math.max(0, newStats.ss + value));
          if (command === 'stab') newStats.stab = Math.min(100, Math.max(0, newStats.stab + value));
          if (command === 'tpr') newStats.tpr += value;
          if (command === 'sanity') newStats.studentSanity = Math.min(100, Math.max(0, newStats.studentSanity + value));
          if (command === 'anger') newStats.radicalAnger = Math.min(100, Math.max(0, newStats.radicalAnger + value));
          if (command === 'unity') newStats.allianceUnity = Math.min(100, Math.max(0, newStats.allianceUnity + value));
          if (command === 'centralization') newStats.partyCentralization = Math.min(100, Math.max(0, newStats.partyCentralization + value));
          
          return { ...prev, stats: newStats };
        });
      }
    }
    setConsoleInput('');
    setIsConsoleOpen(false);
  };

  const togglePause = () => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  const toggleFocusTree = () => setShowFocusTree(prev => !prev);

  const hireAdvisor = (slotIndex: number, advisor: Advisor) => {
    setGameState(prev => {
      const newAdvisors = [...prev.advisors];
      newAdvisors[slotIndex] = advisor;
      
      let newActiveEvent = prev.activeEvent;
      let newActiveStoryEvents = [...prev.activeStoryEvents];
      let newIsPaused = prev.isPaused;

      const queueEvent = (event: any) => {
        if (!newActiveEvent) {
          newActiveEvent = event;
          newIsPaused = true;
        } else {
          newActiveStoryEvents.push(event);
        }
      };

      const isPanRoute = prev.currentFocusTree === 'treeA_pan' || prev.currentFocusTree === 'treeA_pan_despair';
      const isWangTrueLeftRoute = prev.currentFocusTree === 'treeA_true_left' && prev.leader.name === '王兆凯';

      if (advisor.id === 'zhou_chen' && isPanRoute && !prev.flags['zhou_chen_hire_event_fired']) {
        queueEvent(STORY_EVENTS.hire_zhou_chen_event);
      } else if (advisor.id === 'zhou_chen' && !isPanRoute) {
        // Do not fire Pan route-only event on other routes (e.g. Jidi line).
      } else if (advisor.id === 'you_guanglei') {
        queueEvent(STORY_EVENTS.hire_you_guanglei_event);
      } else if (advisor.id === 'gouxiong_advisor' && isWangTrueLeftRoute && !prev.flags['gx_hire_under_wzk_true_left_event_fired']) {
        queueEvent(STORY_EVENTS.gx_hire_under_wzk_true_left_event);
      }

      const nextFlags = {
        ...prev.flags,
        ...(advisor.id === 'zhou_chen' && isPanRoute ? { zhou_chen_hire_event_fired: true } : {}),
        ...(advisor.id === 'gouxiong_advisor' && isWangTrueLeftRoute ? { gx_hire_under_wzk_true_left_event_fired: true } : {}),
      };

      return {
        ...prev,
        stats: { ...prev.stats, pp: prev.stats.pp - advisor.cost },
        advisors: newAdvisors,
        activeEvent: newActiveEvent,
        activeStoryEvents: newActiveStoryEvents,
        flags: nextFlags,
        isPaused: newIsPaused
      };
    });
  };

  const dismissAdvisor = (slotIndex: number) => {
    setGameState(prev => {
      if (!prev.advisors[slotIndex]) return prev;
      const newAdvisors = [...prev.advisors];
      newAdvisors[slotIndex] = null;
      return {
        ...prev,
        advisors: newAdvisors,
      };
    });
  };

  const cancelActiveFocus = () => {
    setGameState(prev => {
      if (!prev.activeFocus) return prev;
      return {
        ...prev,
        activeFocus: null,
        isPaused: true,
      };
    });
  };

  const startFocus = (focusId: string) => {
    const currentNodes = getFocusNodes(gameState.currentFocusTree);
    const node = currentNodes.find(n => n.id === focusId);
    if (!node) return;
    
    setGameState(prev => {
      let newFlags = { ...prev.flags };
      let newActiveEvent = prev.activeEvent;
      let newIsPaused = prev.isPaused;
      
      // Check condition for Yang Yule route when starting charge_b3
      if (focusId === 'charge_b3') {
        const hasYangYule = prev.advisors.some(a => a?.id === 'yang_yule');
        if (prev.stats.stab < 20 && hasYangYule) {
          newFlags['yang_yule_condition_met'] = true;
        }
        if (!newFlags['story_6_triggered']) {
          newFlags['story_6_triggered'] = true;
          newActiveEvent = STORY_EVENTS.story_6;
          newIsPaused = true;
        }
      }

      if (focusId === 'gx_dabi_route_trial' && !newFlags['focus_started_date_gx_dabi_route_trial']) {
        newFlags['focus_started_date_gx_dabi_route_trial'] = prev.date.getTime();
      }
      
      let newState = {
        ...prev,
        flags: newFlags,
        activeEvent: newActiveEvent,
        isPaused: newIsPaused,
        activeFocus: { id: focusId, daysLeft: prev.flags.debug_mode ? 1 : node.days, totalDays: node.days }
      };

      const startFocusSuperEvent = FOCUS_START_SUPER_EVENTS[focusId];
      if (startFocusSuperEvent) {
        newState.activeSuperEvent = startFocusSuperEvent;
      }

      if (node.onStart) {
        const partial = node.onStart(newState);
        // Apply partial state (similar to handleEventConfirm)
        if (partial.stats) newState.stats = { ...newState.stats, ...partial.stats };
        if (partial.flags) newState.flags = { ...newState.flags, ...partial.flags };
        if (partial.activeEvent) newState.activeEvent = partial.activeEvent;
        if (partial.activeSuperEvent) newState.activeSuperEvent = partial.activeSuperEvent;
        if (partial.mapLocations) newState.mapLocations = partial.mapLocations;
        if (partial.electionState) newState.electionState = partial.electionState;
        if ('gouxiongState' in partial) newState.gouxiongState = partial.gouxiongState;
        if (partial.activeMinigame !== undefined) newState.activeMinigame = partial.activeMinigame;
        if (partial.isPaused !== undefined) newState.isPaused = partial.isPaused;
      }

      return newState;
    });
    setShowFocusTree(false); // Close tree after selecting
  };

  const triggerDecision = (decision: Decision) => {
    setGameState(prev => {
      const partialState = decision.effect(prev);
      // If the effect modified PP, use that modified PP minus the cost.
      // Otherwise, just subtract the cost from the previous PP.
      const newPP = (partialState.stats?.pp !== undefined ? partialState.stats.pp : prev.stats.pp) - decision.costPP;
      
      return {
        ...prev,
        ...partialState,
        stats: {
          ...prev.stats,
          ...(partialState.stats || {}),
          pp: newPP
        },
        decisionCooldowns: {
          ...prev.decisionCooldowns,
          [decision.id]: decision.cooldownDays
        }
      };
    });
  };

  const handleEventConfirm = (choice?: EventChoice) => {
    setGameState(prev => {
      let newState = { ...prev, activeEvent: null, isPaused: false };
      const effectToApply = choice?.effect || prev.activeEvent?.effect;
      if (effectToApply) {
        const effectPartial = effectToApply(prev);
        if (effectPartial.stats) newState.stats = { ...newState.stats, ...effectPartial.stats };
        if (effectPartial.modifiers) newState.modifiers = { ...newState.modifiers, ...effectPartial.modifiers };
        if (effectPartial.nationalSpirits) newState.nationalSpirits = effectPartial.nationalSpirits;
        if (effectPartial.flags) newState.flags = { ...newState.flags, ...effectPartial.flags };
        if (effectPartial.activeEvent && effectPartial.activeEvent !== prev.activeEvent) newState.activeEvent = effectPartial.activeEvent;
        if (effectPartial.activeSuperEvent) newState.activeSuperEvent = effectPartial.activeSuperEvent;
        if (effectPartial.leader) newState.leader = effectPartial.leader;
        if (effectPartial.ideologies) newState.ideologies = effectPartial.ideologies;
        if (effectPartial.mapLocations) newState.mapLocations = effectPartial.mapLocations;
        if (effectPartial.gameEnding) newState.gameEnding = effectPartial.gameEnding;
        if (effectPartial.currentFocusTree) newState.currentFocusTree = effectPartial.currentFocusTree;
        if (effectPartial.completedFocuses) newState.completedFocuses = effectPartial.completedFocuses;
        if ('reformState' in effectPartial) newState.reformState = effectPartial.reformState;
        if ('yangYuleState' in effectPartial) newState.yangYuleState = effectPartial.yangYuleState;
        if ('cyberDeconstruction' in effectPartial) newState.cyberDeconstruction = effectPartial.cyberDeconstruction;
        if ('gouxiongState' in effectPartial) newState.gouxiongState = effectPartial.gouxiongState;
        if (effectPartial.jidiCorporateState) newState.jidiCorporateState = effectPartial.jidiCorporateState;
        if (effectPartial.activeStoryEvents) newState.activeStoryEvents = effectPartial.activeStoryEvents;
        if (effectPartial.advisors) newState.advisors = effectPartial.advisors;
        if (effectPartial.activeMinigame !== undefined) newState.activeMinigame = effectPartial.activeMinigame;
        if (effectPartial.studentAssemblyFactions) newState.studentAssemblyFactions = effectPartial.studentAssemblyFactions;
        if (effectPartial.parliamentState) newState.parliamentState = effectPartial.parliamentState;
        if (effectPartial.crises) newState.crises = effectPartial.crises;
        if (effectPartial.decisionCooldowns) newState.decisionCooldowns = effectPartial.decisionCooldowns;
        if (effectPartial.electionState) newState.electionState = effectPartial.electionState;
        if (effectPartial.jidiCorporateState) newState.jidiCorporateState = effectPartial.jidiCorporateState;
        if (effectPartial.redToadState) newState.redToadState = effectPartial.redToadState;
      }

      if (prev.activeEvent?.id === 'haobang_blank_event_3') {
        newState.flags = { ...newState.flags, haobang_post_blank_unlocked: true };
      }
      
      if (!newState.activeEvent && newState.activeStoryEvents.length > 0) {
        newState.activeEvent = newState.activeStoryEvents[0];
        newState.activeStoryEvents = newState.activeStoryEvents.slice(1);
        newState.isPaused = true;
      }
      
      // Auto-pause if there are available focuses and no active focus
      if (!newState.activeFocus && !newState.activeEvent && !newState.activeSuperEvent && !newState.activeMinigame) {
        const currentNodes = getFocusNodes(newState.currentFocusTree);
        const hasAvailableFocus = currentNodes.some(n => 
          !newState.completedFocuses.includes(n.id) && 
          hasFocusRequirements(n, newState.completedFocuses) &&
          (!n.canStart || n.canStart(newState))
        );
        if (hasAvailableFocus) {
          newState.isPaused = true;
        }
      }
      
      return newState;
    });
  };

  const handleSuperEventConfirm = () => {
    if (gameState.gameEnding) {
      setGameState(prev => ({ ...prev, activeSuperEvent: null }));
      return;
    }

    const activeSuperId = gameState.activeSuperEvent?.id;

    // Only B3 uprising should branch and switch focus tree.
    // Other super events are narrative highlights and must not reset tree progression.
    if (activeSuperId !== 'b3_uprising') {
      setGameState(prev => ({ ...prev, activeSuperEvent: null }));
      return;
    }

    setIsTransitioning(true);
    setShowFocusTree(true); // Automatically open the focus tree to show the transition
    
    setGameState(prev => {
      let nextTree = 'treeA';
      let transitionEvent = FLAVOR_EVENTS.enter_treeA;
      
      // Determine next tree based on stats
      if (prev.stats.studentSanity < 20 && prev.stats.capitalPenetration > 80) {
        nextTree = 'gouxiong_tree';
        transitionEvent = FLAVOR_EVENTS.enter_treeC;
      } else {
        nextTree = 'treeA';
        transitionEvent = FLAVOR_EVENTS.enter_treeA;
      }

      return {
        ...prev,
        activeSuperEvent: null,
        activeEvent: transitionEvent,
        isPaused: false,
        currentFocusTree: nextTree,
        completedFocuses: [], // Reset focuses for the new tree
      };
    });
    
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const handleMinigameComplete = (result: boolean | NegotiationMinigameResult) => {
    const success = typeof result === 'boolean' ? result : result.success;
    setGameState(prev => {
      const newStats = { ...prev.stats };
      const newSpirits = [...prev.nationalSpirits];
      let newEvent = prev.activeEvent;
      let newFlags = { ...prev.flags };

      if (prev.activeMinigame === 'frequency_war') {
        if (success) {
          newStats.ss = Math.min(100, newStats.ss + 25);
          newSpirits.push({
            id: 'awakened_binhu',
            name: '被唤醒的滨湖',
            description: '学生支持度每日 +0.5%',
            type: 'positive',
            effects: { ssDaily: 0.5 }
          });
        } else {
          newStats.stab = Math.max(0, newStats.stab - 15);
          newSpirits.push({
            id: 'silenced_vanguard',
            name: '失声的先锋队',
            description: '每日PP获取 -0.2',
            type: 'negative',
            effects: { ppDaily: -0.2 }
          });
        }
      } else if (prev.activeMinigame === 'siege_b3') {
        if (success) {
          // Win effects
          newEvent = {
            id: 'b3_victory',
            title: 'B3保卫战胜利',
            description: '我们成功击退了校方保安和反动学生自治会的进攻！B3教学楼依然在我们的控制之下。\n\n吴福军的势力遭到了毁灭性的打击，联盟的团结度空前高涨。',
            buttonText: '胜利属于我们',
            effect: (s) => ({
              stats: { ...s.stats, pp: s.stats.pp + 100, ss: s.stats.ss + 20, stab: s.stats.stab + 20 },
              gameEnding: 'game_over_victory'
            })
          };
        } else {
          // Lose effects
          newEvent = {
            id: 'b3_defeat',
            title: '防线崩溃',
            description: '保安队突破了我们的防线，红旗被拔除。\n\n吴福军宣布实行全面军管，所有参与抵抗的学生被物理拖出学校。游戏结束。',
            buttonText: '一切都结束了...',
            effect: (s) => ({ gameEnding: 'game_over_anarchy' })
          };
        }
      } else if (prev.activeMinigame === 'nkpd_negotiation') {
        const detail = typeof result === 'boolean' ? undefined : result;
        const concessionLevel = detail?.concessionLevel ?? 0;

        if (success) {
          let debuffText = '谈判成本可控。';
          if (concessionLevel >= 70) {
            newStats.stab = Math.max(0, newStats.stab - 8);
            newStats.pp = Math.max(0, newStats.pp - 40);
            debuffText = '妥协过深：稳定度 -8，政治点数 -40。';
          } else if (concessionLevel >= 45) {
            newStats.stab = Math.max(0, newStats.stab - 4);
            newStats.pp = Math.max(0, newStats.pp - 20);
            debuffText = '有限妥协：稳定度 -4，政治点数 -20。';
          }

          newFlags.haobang_negotiation_success = true;
          newFlags.authoritarian_exit_done = true;
          newFlags.haobang_negotiation_concession = concessionLevel;
          newEvent = {
            id: 'haobang_negotiation_result_success',
            title: '退党协议达成',
            description: `玻璃烧杯碎裂的清脆响声，反而成了唤醒吕波汉仅存理智的惊堂木。他冷冷地看了一眼身后近乎歇斯底里的狗熊，突然意识到，自己那对纯粹革命的狂热追求，正被这个毫无底线的乐子人利用，沦为一场破坏合一未来的抽象狂欢。\n\n“够了。”吕波汉将那份《退党宣言》慢慢揉成一团，扔进了废纸篓。他抬起头，迎上豪邦那如释重负的目光，声音依旧冰冷但失去了杀气：“我接受中央的改组方案。特别纠察队将接受政治局的联合指挥，但我保留对任何复辟行为的一票否决与先斩后奏权。豪邦，别让我抓到你那套温和路线失败的把柄。”两人隔着化学实验桌，极其生硬地握了握手。这场足以撕裂合一革委会的政治风暴，在“左翼大帐篷”的包容与最后关头的妥协下，勉强消弭于无形。\n\n但并非所有人都愿意接受和平。看到吕波汉“背叛”了极端的暴力美学，狗熊发出一阵令人毛骨悚然的惨笑。“修正主义的懦夫！你们终将被自己编织的温情幻象绞死！”他一把扯下袖口上的红星，狠狠摔在地上，转身冲出了实验室。\n\n当天深夜，超过三分之一最极端、最嗜血的纠察队员没有返回B3教学楼的驻地。他们在狗熊的蛊惑下，带着大量被截留的安保器械，悄无声息地消失在了校园庞大的地下管网与废弃建筑群中。吕波汉的妥协虽然保住了中央的名义统一，却也亲手释放了一群彻底失去理论约束、只为破坏而生的嗜血狂犬。${debuffText}`,
            buttonText: '签署协议',
            isStoryEvent: true,
          };
        } else {
          newFlags.haobang_negotiation_success = false;
          newFlags.authoritarian_exit_done = true;
          newStats.stab = Math.max(0, newStats.stab - 10);
          newStats.pp = Math.max(0, newStats.pp - 20);
          newEvent = {
            id: 'haobang_negotiation_result_fail',
            title: '谈判破裂',
            description: '所有的斡旋、让步与同志间的温情回忆，最终都撞碎在吕波汉那绝对零度般的政治偏执上。他猛地站起身，将那份《退党与另立中央宣言》狠狠拍在豪邦的脸上。“道不同，不相为谋。你的互助组只会培养出下一批更虚伪的做题机器。今天起，合一只承认一个纯洁的布尔什维克中央！”\n\n看着吕波汉决绝的背影准备转身离开，豪邦痛苦地闭上了眼睛。当再次睁开时，这位一直以温和著称的自社派领袖，眼中闪过一丝属于独裁者的冷酷。他绝不能让合一刚刚建立的脆弱共识毁于一旦。\n\n“动手。”豪邦轻声吐出两个字。化学实验室的暗门被瞬间撞开，由时纪秘密调遣的十余名后勤保卫干事蜂拥而入，将吕波汉死死按倒在地。面对这场突如其来的“党内隔离”，吕波汉没有挣扎，只是用一种充满嘲弄与悲哀的眼神看着豪邦：“看啊，伟大的民主斗士，你最终还是用上了比我更卑劣的手段。”\n\n豪邦的雷霆手段虽然暂时瘫痪了极权派的大脑，但政治局的总体共识度却在此刻遭到了毁灭性的打击。更可怕的是，早有准备的狗熊在混乱爆发的第一时间，便从实验室的窗户翻出了大楼。他没有去管吕波汉的死活，这对他来说反而是一个完美的契机。\n\n警报声在校园的夜空中凄厉地拉响。狗熊挥舞着手电筒，在操场上向那些狂热的极权派信徒高呼：“中央已经叛变！吕指导被右派绑架了！丢掉幻想，准备武装斗争！”超过大半的特别纠察队与极左翼激进分子在狗熊的带领下，如同决堤的黑色洪流，砸开了学校后勤仓库的大门，席卷了所有能找到的防暴盾牌与对讲机，随后遁入了夜幕深处。合一的统一只维持了短短数日，一场更加血腥的、毫无底线的泥潭游击战，已然在狗熊那癫狂的笑声中拉开了帷幕。',
            buttonText: '另寻出路',
            isStoryEvent: true,
          };
        }
      }

      let newIsPaused = newEvent !== null;
      
      // Auto-pause if there are available focuses and no active focus
      if (!prev.activeFocus && !newEvent && !prev.activeSuperEvent) {
        const currentNodes = getFocusNodes(prev.currentFocusTree);
        const hasAvailableFocus = currentNodes.some(n => 
          !prev.completedFocuses.includes(n.id) && 
          hasFocusRequirements(n, prev.completedFocuses) &&
          (!n.canStart || n.canStart(prev))
        );
        if (hasAvailableFocus) {
          newIsPaused = true;
        }
      }

      return {
        ...prev,
        activeMinigame: null,
        activeEvent: newEvent,
        stats: newStats,
        nationalSpirits: newSpirits,
        flags: newFlags,
        isPaused: newIsPaused,
      };
    });
  };

  const spendPP = (amount: number) => {
    if (gameStateRef.current.stats.pp >= amount) {
      gameStateRef.current = {
        ...gameStateRef.current,
        stats: { ...gameStateRef.current.stats, pp: gameStateRef.current.stats.pp - amount }
      };
      setGameState(prev => ({
        ...prev,
        stats: { ...prev.stats, pp: prev.stats.pp - amount }
      }));
      return true;
    }
    return false;
  };

  const spendTPR = (amount: number) => {
    if (gameStateRef.current.stats.tpr >= amount) {
      gameStateRef.current = {
        ...gameStateRef.current,
        stats: { ...gameStateRef.current.stats, tpr: gameStateRef.current.stats.tpr - amount }
      };
      setGameState(prev => ({
        ...prev,
        stats: { ...prev.stats, tpr: prev.stats.tpr - amount }
      }));
      return true;
    }
    return false;
  };

  const openInGameMenu = () => {
    wasPausedBeforeMenuRef.current = gameStateRef.current.isPaused;
    setGameState(prev => ({ ...prev, isPaused: true }));
    setIsInGameMenuOpen(true);
  };

  const closeInGameMenu = () => {
    setIsInGameMenuOpen(false);
    setGameState(prev => ({ ...prev, isPaused: wasPausedBeforeMenuRef.current }));
  };

  const handleManualSave = () => {
    localStorage.setItem('manualSave', serializeGameState(gameStateRef.current));
  };

  const handleQuickSave = () => {
    localStorage.setItem(QUICK_SAVE_KEY, serializeGameState(gameStateRef.current));
  };

  const handleQuickLoad = () => {
    const raw = localStorage.getItem(QUICK_SAVE_KEY);
    if (!raw) return;
    const loaded = deserializeGameState(raw);
    if (!loaded) return;
    setGameState(loaded);
    setIsInGameMenuOpen(false);
  };

  const handleLoadMonthlyAutoSave = () => {
    const raw = localStorage.getItem('autoSaveMonthly');
    if (!raw) return;
    const loaded = deserializeGameState(raw);
    if (!loaded) return;
    setGameState(loaded);
    setIsInGameMenuOpen(false);
  };

  const handleLoadManualSave = () => {
    const raw = localStorage.getItem('manualSave');
    if (!raw) return;
    const loaded = deserializeGameState(raw);
    if (!loaded) return;
    setGameState(loaded);
    setIsInGameMenuOpen(false);
  };

  const handleReturnToMainMenu = () => {
    setIsInGameMenuOpen(false);
    setAppMode('menu');
    setCurrentMenuPage('main');
    setGameState(prev => ({ ...prev, isPaused: true }));
  };

  // Menu callbacks
  const handleStartGame = () => {
    setAppMode('loading');
    setCurrentMenuPage('main');
    setIsInGameMenuOpen(false);
    setGameState(prev => ({
      ...prev,
      isPaused: true
    }));
  };

  const handleLoadingComplete = () => {
    setAppMode('game');
    setGameState(prev => ({
      ...prev,
      isPaused: false
    }));
  };

  const handleTutorial = () => {
    setCurrentMenuPage('tutorial');
  };

  const handleSettings = () => {
    setCurrentMenuPage('settings');
  };

  const handleBackToMenu = () => {
    setCurrentMenuPage('main');
  };

  // 如果在菜单模式，显示菜单；否则显示游戏 UI
  if (appMode === 'menu') {
    if (currentMenuPage === 'main') {
      return <StartMenu onStartGame={handleStartGame} onTutorial={handleTutorial} onSettings={handleSettings} />;
    } else if (currentMenuPage === 'tutorial') {
      return <Tutorial onBackToMenu={handleBackToMenu} />;
    } else if (currentMenuPage === 'settings') {
      return <Settings onBackToMenu={handleBackToMenu} />;
    }
  }

  if (appMode === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`w-screen h-screen crt relative flex flex-col overflow-hidden bg-tno-bg text-tno-text font-mono selection:bg-tno-highlight selection:text-black ${shake ? 'shake' : ''} ${gameState.activeSuperEvent ? 'animate-red-flash' : ''}`}>
      <TopBar
        state={gameState}
        togglePause={togglePause}
        setGameSpeed={(speed) => setGameState(prev => ({ ...prev, gameSpeed: speed }))}
        onQuickSave={handleQuickSave}
        onQuickLoad={handleQuickLoad}
        hasQuickSave={!!localStorage.getItem(QUICK_SAVE_KEY)}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Game Ending Screen */}
        {gameState.gameEnding && (
          <GameEndingScreen 
            state={gameState} 
            onRestart={handleRestart} 
          />
        )}

        {/* Lock overlay if PP < 0 */}
        {gameState.stats.pp < 0 && !gameState.activeEvent && !gameState.activeMinigame && !gameState.gameEnding && (
          <div className="absolute inset-0 bg-tno-red/10 z-50 flex items-center justify-center backdrop-blur-sm pointer-events-auto">
            <div className="bg-tno-panel border-2 border-tno-red p-8 text-center max-w-md">
              <h2 className="text-tno-red font-bold text-2xl mb-4 crt-flicker">校园行政瘫痪</h2>
              <p className="text-tno-text mb-4">政治点数已降至负数。所有行政指令无法下达，各派系陷入混乱。</p>
              <p className="text-tno-red text-xs">等待政治点数恢复为正数以解锁操作。</p>
            </div>
          </div>
        )}

        <LeftSidebar 
          state={gameState} 
          hireAdvisor={hireAdvisor} 
          dismissAdvisor={dismissAdvisor}
          cancelActiveFocus={cancelActiveFocus}
          triggerError={triggerError} 
          toggleFocusTree={toggleFocusTree} 
          onOpenAssembly={() => setIsAssemblyOpen(true)}
          onOpenReformCommittee={() => setIsReformCommitteeOpen(true)}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <CentralMap 
            state={gameState} 
            setGameState={setGameState} 
            triggerError={triggerError} 
            isElectionUIOpen={isElectionUIOpen}
            setIsElectionUIOpen={setIsElectionUIOpen}
          />
          
          {/* Focus Tree Overlay */}
          {showFocusTree && (
            <div className={`absolute inset-0 z-20 bg-tno-bg/95 backdrop-blur-sm flex flex-col ${isTransitioning ? 'animate-scanline-sweep' : ''}`}>
              <FocusTree state={gameState} startFocus={startFocus} triggerError={triggerError} isSuperEventActive={!!gameState.activeSuperEvent} />
              <button 
                onClick={toggleFocusTree}
                className="absolute top-4 right-4 text-tno-red hover:text-white font-bold tracking-widest border border-tno-red px-4 py-2 bg-black/50 z-50"
              >
                关闭国策树
              </button>
            </div>
          )}

          {/* Student Assembly Overlay */}
          {isAssemblyOpen && (
            <StudentAssembly 
              state={gameState}
              onClose={() => setIsAssemblyOpen(false)}
              onInteract={handleAssemblyInteract}
            />
          )}

          {/* Reform Committee Overlay */}
          {isReformCommitteeOpen && (
            <ReformCommittee 
              state={gameState}
              setGameState={setGameState}
              onClose={() => setIsReformCommitteeOpen(false)}
              triggerError={triggerError}
            />
          )}

          {/* Cyber Deconstruction Overlay */}
          {isCyberDeconstructionOpen && (
            <CyberDeconstruction 
              state={gameState}
              onClose={() => setIsCyberDeconstructionOpen(false)}
              onInteract={handleCyberDeconstructInteract}
            />
          )}

          {isGouxiongGalOpen && (
            <GouxiongGalGame
              state={gameState}
              onClose={() => setIsGouxiongGalOpen(false)}
              onInteract={handleGouxiongGalInteract}
            />
          )}

          {/* Yang Yule Desk Overlay */}
          {isYangYuleDeskOpen && (
            <YangYuleDesk 
              state={gameState}
              setGameState={setGameState}
              onClose={() => setIsYangYuleDeskOpen(false)}
              triggerEvent={(event) => setGameState(prev => ({ ...prev, activeEvent: event, isPaused: true }))}
              updateYangYuleState={(updates) => setGameState(prev => ({
                ...prev,
                yangYuleState: prev.yangYuleState ? { ...prev.yangYuleState, ...updates } : undefined
              }))}
              spendPP={spendPP}
            />
          )}
        </div>

        <RightSidebar 
          state={gameState} 
          triggerDecision={triggerDecision} 
          triggerError={triggerError} 
          openAssembly={() => setIsAssemblyOpen(true)} 
          openCyberDeconstruction={() => setIsCyberDeconstructionOpen(true)}
          openGouxiongGal={() => setIsGouxiongGalOpen(true)}
          openYangYuleDesk={() => setIsYangYuleDeskOpen(true)}
          openElectionUI={() => setIsElectionUIOpen(true)}
          openJidiCorporateUI={() => setIsJidiCorporateUIOpen(true)}
          openRedToadPolitburo={() => setIsRedToadPolitburoOpen(true)}
          openInGameMenu={openInGameMenu}
        />
      </div>

      {/* Overlays */}
      {isInGameMenuOpen && (
        <div className="fixed inset-0 z-[120]">
          <Settings
            mode="ingame"
            onBackToMenu={handleBackToMenu}
            onCloseInGameMenu={closeInGameMenu}
            onReturnToMainMenu={handleReturnToMainMenu}
            onManualSave={handleManualSave}
            onLoadManualSave={handleLoadManualSave}
            onLoadMonthlyAutoSave={handleLoadMonthlyAutoSave}
            hasManualSave={!!localStorage.getItem('manualSave')}
            hasMonthlyAutoSave={!!localStorage.getItem('autoSaveMonthly')}
          />
        </div>
      )}

      {isRedToadPolitburoOpen && (
        <RedToadPolitburo state={gameState} setGameState={setGameState} onClose={() => setIsRedToadPolitburoOpen(false)} />
      )}
      {isConsoleOpen && (
        <div className="fixed top-0 left-0 z-[100] p-2">
          <form onSubmit={handleConsoleSubmit}>
            <input 
              type="text" 
              autoFocus
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              placeholder="Command (e.g. pp 60)"
              className="bg-black border border-tno-highlight text-tno-highlight font-mono text-sm p-1 outline-none w-48"
            />
          </form>
        </div>
      )}

      {gameState.activeEvent && (
        <EventPopup event={gameState.activeEvent} onConfirm={handleEventConfirm} />
      )}

      {gameState.activeSuperEvent && (
        <SuperEvent event={gameState.activeSuperEvent} onConfirm={handleSuperEventConfirm} />
      )}

      {gameState.activeMinigame === 'frequency_war' && (
        <MinigameFrequencyWar state={gameState} onComplete={handleMinigameComplete} spendPP={spendPP} />
      )}

      {gameState.activeMinigame === 'siege_b3' && (
        <MinigameSiege state={gameState} onComplete={handleMinigameComplete} spendTPR={spendTPR} />
      )}

      {gameState.activeMinigame === 'nkpd_negotiation' && (
        <MinigameNegotiation state={gameState} onComplete={handleMinigameComplete} spendPP={spendPP} />
      )}

      {isJidiCorporateUIOpen && gameState.jidiCorporateState && (
        <JidiCorporateUI
          state={gameState.jidiCorporateState}
          pp={gameState.stats.pp}
          tpr={gameState.stats.tpr}
          flags={gameState.flags}
          onClose={() => setIsJidiCorporateUIOpen(false)}
          onStartRnd={(faction, productName, eventId, image) => {
            setGameState(prev => {
              if (!prev.jidiCorporateState) return prev;
              const newState = {
                ...prev,
                activeStoryEvents: [...prev.activeStoryEvents, STORY_EVENTS[eventId as keyof typeof STORY_EVENTS]],
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  rndState: {
                    phase: 'initiation',
                    daysInPhase: 0,
                    currentProduct: {
                      name: productName,
                      faction,
                      quality: 30,
                      sales: 0,
                      salesMultiplier: 1.0,
                      image
                    },
                    testingIntensity: 5,
                    daysSinceLastIntensityChange: 0
                  }
                }
              };
              return newState;
            });
          }}
          onChangeTestingIntensity={(intensity) => {
            setGameState(prev => {
              if (!prev.jidiCorporateState?.rndState) return prev;
              return {
                ...prev,
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  rndState: {
                    ...prev.jidiCorporateState.rndState,
                    testingIntensity: intensity,
                    daysSinceLastIntensityChange: 0
                  }
                }
              };
            });
          }}
          onRndAction={(actionType) => {
            setGameState(prev => {
              if (!prev.jidiCorporateState?.rndState?.currentProduct) return prev;
              const newState = { ...prev };
              const rndState = { ...newState.jidiCorporateState!.rndState! };
              const currentProduct = { ...rndState.currentProduct! };
              
              let success = false;
              if (actionType === 'improve_quality' && newState.stats.pp >= 5 && newState.stats.tpr >= 50) {
                newState.stats.pp -= 5;
                newState.stats.tpr -= 50;
                currentProduct.quality += 5;
                success = true;
              } else if (actionType === 'exploit_devs' && newState.stats.tpr >= 100) {
                newState.stats.tpr -= 100;
                currentProduct.quality += 10;
                newState.stats.studentSanity = Math.max(0, newState.stats.studentSanity - 2);
                success = true;
              } else if (actionType === 'false_advertising' && newState.stats.pp >= 10 && newState.stats.tpr >= 150) {
                newState.stats.pp -= 10;
                newState.stats.tpr -= 150;
                currentProduct.salesMultiplier = (currentProduct.salesMultiplier || 1.0) + 0.05;
                success = true;
              } else if (actionType === 'improve_sales' && newState.stats.pp >= 5 && newState.stats.tpr >= 50) {
                newState.stats.pp -= 5;
                newState.stats.tpr -= 50;
                currentProduct.salesMultiplier = (currentProduct.salesMultiplier || 1.0) + 0.1;
                success = true;
              } else if (actionType === 'force_buy' && newState.stats.tpr >= 200) {
                newState.stats.tpr -= 200;
                currentProduct.salesMultiplier = (currentProduct.salesMultiplier || 1.0) + 0.2;
                newState.stats.studentSanity = Math.max(0, newState.stats.studentSanity - 5);
                success = true;
              } else if (actionType === 'bribe_bureau' && newState.stats.pp >= 15 && newState.stats.tpr >= 100) {
                newState.stats.pp -= 15;
                newState.stats.tpr -= 100;
                currentProduct.salesMultiplier = (currentProduct.salesMultiplier || 1.0) + 0.15;
                if (newState.jidiCorporateState?.riotState) {
                  newState.jidiCorporateState.riotState.bureauAnger = Math.max(0, newState.jidiCorporateState.riotState.bureauAnger - 5);
                }
                success = true;
              }

              if (success) {
                rndState.hasInteractedToday = true;
                rndState.currentProduct = currentProduct;
                newState.jidiCorporateState!.rndState = rndState;
                return newState;
              }
              return prev;
            });
          }}
          onProposeBill={(faction, type) => {
            setGameState(prev => {
              if (!prev.jidiCorporateState?.committeeState) return prev;
              const names: Record<string, string> = {
                extend_study: '延长晚自习至零点法案',
                reduce_food: '食堂降本增效决议',
                ban_clubs: '取缔非应试社团令',
                performance_bonus: '教师绩效奖金池',
                protect_teachers: '教师权益保护法',
                strict_patrols: '高压巡逻常态化'
              };
              return {
                ...prev,
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  committeeState: {
                    ...prev.jidiCorporateState.committeeState,
                    activeBill: {
                      id: type,
                      name: names[type] || '未知法案',
                      daysLeft: 30,
                      support: prev.jidiCorporateState.committeeState.seats[faction],
                      proposer: faction,
                      lobbiedFactions: []
                    }
                  }
                }
              };
            });
          }}
          onLobby={(faction) => {
            if (gameState.stats.pp < 10) return;
            if (gameState.jidiCorporateState?.committeeState?.activeBill?.lobbiedFactions.includes(faction)) return;
            spendPP(10);
            setGameState(prev => {
              if (!prev.jidiCorporateState?.committeeState?.activeBill) return prev;
              return {
                ...prev,
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  committeeState: {
                    ...prev.jidiCorporateState.committeeState,
                    activeBill: {
                      ...prev.jidiCorporateState.committeeState.activeBill,
                      support: Math.min(100, prev.jidiCorporateState.committeeState.activeBill.support + prev.jidiCorporateState.committeeState.seats[faction]),
                      lobbiedFactions: [...prev.jidiCorporateState.committeeState.activeBill.lobbiedFactions, faction]
                    }
                  }
                }
              };
            });
          }}
          onSuppressRiot={() => {
            if (gameState.stats.pp < 10) return;
            spendPP(10);
            setGameState(prev => {
              if (!prev.jidiCorporateState?.riotState) return prev;
              return {
                ...prev,
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  riotState: {
                    ...prev.jidiCorporateState.riotState,
                    progress: Math.max(0, prev.jidiCorporateState.riotState.progress - 10),
                    bureauAnger: Math.min(100, prev.jidiCorporateState.riotState.bureauAnger + 15)
                  }
                }
              };
            });
          }}
          onAppeaseBureau={() => {
            if (gameState.stats.pp < 10) return;
            spendPP(10);
            setGameState(prev => {
              if (!prev.jidiCorporateState?.riotState) return prev;
              return {
                ...prev,
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  gdp: Math.max(0, prev.jidiCorporateState.gdp - 1000),
                  riotState: {
                    ...prev.jidiCorporateState.riotState,
                    bureauAnger: Math.max(0, prev.jidiCorporateState.riotState.bureauAnger - 25)
                  }
                }
              };
            });
          }}
          onAppeaseStudents={() => {
            if (gameState.stats.pp < 10) return;
            spendPP(10);
            setGameState(prev => {
              if (!prev.jidiCorporateState?.riotState) return prev;
              return {
                ...prev,
                jidiCorporateState: {
                  ...prev.jidiCorporateState,
                  gdp: Math.max(0, prev.jidiCorporateState.gdp - 500),
                  riotState: {
                    ...prev.jidiCorporateState.riotState,
                    studentAnger: Math.max(0, prev.jidiCorporateState.riotState.studentAnger - 20)
                  }
                }
              };
            });
          }}
        />
      )}
    </div>
  );
}

