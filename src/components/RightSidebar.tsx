import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Target, Book } from 'lucide-react';
import { GameState, Decision } from '../types';

interface RightSidebarProps {
  state: GameState;
  triggerDecision: (decision: Decision) => void;
  triggerError: () => void;
  openAssembly?: () => void;
  openCyberDeconstruction?: () => void;
  openGouxiongGal?: () => void;
  openYangYuleDesk?: () => void;
  openElectionUI?: () => void;
  openJidiCorporateUI?: () => void;
  openRedToadPolitburo?: () => void;
  openInGameMenu?: () => void;
}

const DEBUG_LEADERS: Record<string, GameState['leader']> = {
  feng_anbao: {
    name: '封安保',
    title: '校长',
    portrait: 'feng_anbao',
    ideology: 'authoritarian',
  },
  wang_zhaokai: {
    name: '王兆凯',
    title: '钢铁红蛤领袖',
    portrait: 'wang_zhaokai',
    ideology: 'radical_socialism',
  },
  pan_renyue: {
    name: '潘仁越',
    title: '学生议会议长',
    portrait: 'pan_renyue',
    ideology: 'liberal',
  },
  lu_bohan: {
    name: '吕波汉',
    title: 'N.K.P.D.总负责人',
    portrait: 'lu_bohan',
    ideology: 'authoritarian',
  },
  hao_bang: {
    name: '豪邦',
    title: '联合革委会临时舵手',
    portrait: 'hao_bang',
    ideology: 'radical_socialism',
  },
  yang_yule: {
    name: '杨玉乐',
    title: '名师工作室代理校长',
    portrait: 'yang_yule',
    ideology: 'reactionary',
  },
  feng_anxiang: {
    name: '封安祥',
    title: '及第教育CEO',
    portrait: 'feng_anxiang',
    ideology: 'anarcho_capitalism',
  },
  gouxiong: {
    name: '狗熊',
    title: '二次元缝合怪',
    portrait: 'gouxiong',
    ideology: 'deconstructivism',
  }
};

const withDebugMapFlags = (state: GameState, overrides: Record<string, any> = {}) => ({
  ...state.flags,
  map_phase_ended: false,
  polling_stations_unlocked: false,
  map_struggle_ended: false,
  jidi_takeover_complete: false,
  rebellion_started: false,
  yang_yule_route_started: false,
  lu_purge_map_phase: false,
  haobang_commune_map_phase: false,
  jidi_new_era_active: false,
  ...overrides,
});

export const DECISIONS: Decision[] = [
  {
    id: 'host_culture_festival',
    title: '举办校园文化节',
    description: '消耗 50 TPR 和 50 SS。学生理智度 +10，权力平衡偏向素质教育 5%。',
    costPP: 0,
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('empower_student_unions'),
    canAfford: (state) => state.stats.tpr >= 50 && state.stats.ss >= 50,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 50), ss: Math.max(0, state.stats.ss - 50), studentSanity: Math.min(100, state.stats.studentSanity + 10) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 5) } : undefined
    })
  },
  {
    id: 'independent_media_forum',
    title: '开展独立媒体论坛',
    description: '消耗 30 TPR 和 20 PP。学生理智度 +5，权力平衡偏向素质教育 3%。',
    costPP: 20,
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('student_media_support'),
    canAfford: (state) => state.stats.tpr >= 30,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 30), studentSanity: Math.min(100, state.stats.studentSanity + 5) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 3) } : undefined
    })
  },
  {
    id: 'student_academic_salon',
    title: '学生自发学术沙龙',
    description: '消耗 40 TPR 和 30 SS。学生理智度 +8，权力平衡偏向素质教育 4%。',
    costPP: 0,
    cooldownDays: 25,
    isVisible: (state) => state.completedFocuses.includes('academic_competition_sponsorship'),
    canAfford: (state) => state.stats.tpr >= 40 && state.stats.ss >= 30,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 40), ss: Math.max(0, state.stats.ss - 30), studentSanity: Math.min(100, state.stats.studentSanity + 8) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 4) } : undefined
    })
  },
  {
    id: 'all_school_club_exhibition',
    title: '全校社团联合展演',
    description: '消耗 60 TPR 和 60 SS。学生理智度 +15，权力平衡偏向素质教育 8%。',
    costPP: 0,
    cooldownDays: 45,
    isVisible: (state) => state.completedFocuses.includes('extracurricular_activities_fund'),
    canAfford: (state) => state.stats.tpr >= 60 && state.stats.ss >= 60,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 60), ss: Math.max(0, state.stats.ss - 60), studentSanity: Math.min(100, state.stats.studentSanity + 15) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 8) } : undefined
    })
  },
  {
    id: 'jidi_sell_tpr_for_pp',
    title: '出售多余教辅',
    description: '将库存的教辅资料出售给下级市场。消耗 1000 TPR，获得 50 PP。',
    costPP: 0,
    cooldownDays: 14,
    isVisible: (state) => state.completedFocuses.includes('jidi_establish_committee'),
    canAfford: (state) => state.stats.tpr >= 1000,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 1000), pp: state.stats.pp + 50 }
    })
  },
  {
    id: 'jidi_sell_tpr_for_gdp',
    title: '教辅捆绑销售',
    description: '强制要求学生购买教辅套餐。消耗 2000 TPR，及第资本GDP增加 100万，学生理智度 -5。',
    costPP: 10,
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('jidi_performance_metrics'),
    canAfford: (state) => state.stats.tpr >= 2000 && state.stats.pp >= 10,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 2000), studentSanity: Math.max(0, state.stats.studentSanity - 5) },
      jidiCorporateState: state.jidiCorporateState ? { ...state.jidiCorporateState, gdp: state.jidiCorporateState.gdp + 100 } : undefined
    })
  },
  {
    id: 'jidi_sell_tpr_for_stab',
    title: '用题海麻痹学生',
    description: '通过海量的作业让学生无暇思考反抗。消耗 1500 TPR，稳定度 +10%，学生理智度 -10。',
    costPP: 20,
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('jidi_monopoly'),
    canAfford: (state) => state.stats.tpr >= 1500 && state.stats.pp >= 20,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 1500), stab: Math.min(100, state.stats.stab + 10), studentSanity: Math.max(0, state.stats.studentSanity - 10) }
    })
  },
  {
    id: 'jidi_sell_tpr_for_bureau_anger',
    title: '向教育局上贡教辅成果',
    description: '将最新的教辅研发成果作为政绩上报。消耗 3000 TPR，教育局愤怒 -20%。',
    costPP: 50,
    cooldownDays: 60,
    isVisible: (state) => state.completedFocuses.includes('jidi_corporate_utopia'),
    canAfford: (state) => state.stats.tpr >= 3000 && state.stats.pp >= 50,
    effect: (state) => {
      let newState = { ...state };
      newState.stats = { ...newState.stats, tpr: Math.max(0, newState.stats.tpr - 3000) };
      if (newState.jidiCorporateState && newState.jidiCorporateState.riotState) {
        newState.jidiCorporateState = {
          ...newState.jidiCorporateState,
          riotState: {
            ...newState.jidiCorporateState.riotState,
            bureauAnger: Math.max(0, newState.jidiCorporateState.riotState.bureauAnger - 20)
          }
        };
      }
      return newState;
    }
  },
  {
    id: 'raid_dorm',
    title: '突击查寝',
    description: '稳定度 +5%，学生支持度 -3%。',
    costPP: 25,
    cooldownDays: 7,
    effect: (state) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 5), ss: Math.max(0, state.stats.ss - 3) }
    })
  },
  {
    id: 'print_flyers',
    title: '地下印刷红蛤传单',
    description: '学生支持度 +5%，稳定度 -2%。',
    costPP: 30,
    cooldownDays: 14,
    effect: (state) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 5), stab: Math.max(0, state.stats.stab - 2) }
    })
  },
  {
    id: 'anti_capital_campaign',
    title: '抵制商业化',
    description: '资本渗透度 -10%，稳定度 -5%。',
    costPP: 40,
    cooldownDays: 14,
    effect: (state) => ({
      stats: { ...state.stats, capitalPenetration: Math.max(0, state.stats.capitalPenetration - 10), stab: Math.max(0, state.stats.stab - 5) }
    })
  },
  {
    id: 'buy_papers',
    title: '向及第教育妥协购买密卷',
    description: '卷子储备 +500，资本渗透度 +20%。',
    costPP: 50,
    cooldownDays: 30,
    effect: (state) => ({
      stats: { ...state.stats, tpr: state.stats.tpr + 500, capitalPenetration: state.stats.capitalPenetration + 20 }
    })
  },
  {
    id: 'incite_anger',
    title: '煽动学生情绪',
    description: '激进派愤怒 +30%，稳定度 -10%。',
    costPP: 20,
    cooldownDays: 10,
    effect: (state) => ({
      stats: { ...state.stats, radicalAnger: state.stats.radicalAnger + 30, stab: Math.max(0, state.stats.stab - 10) }
    })
  },
  {
    id: 'reform_recruit',
    title: '招募先锋党员',
    description: '先锋党员 +10，学生支持度 -2%。',
    costPP: 25,
    cooldownDays: 14,
    isVisible: (state) => !!state.reformState?.unlockedRecruitDecisions,
    effect: (state) => ({
      stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 2) },
      reformState: state.reformState ? { ...state.reformState, vanguardMembers: state.reformState.vanguardMembers + 10 } : undefined
    })
  },
  {
    id: 'reform_sanity',
    title: '心理疏导讲座',
    description: '学生理智度 +10%，稳定度 +2%。',
    costPP: 30,
    cooldownDays: 21,
    isVisible: (state) => !!state.reformState?.unlockedSanityDecisions,
    effect: (state) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 10), stab: Math.min(100, state.stats.stab + 2) }
    })
  },
  {
    id: 'reform_anger',
    title: '安抚激进情绪',
    description: '激进愤怒度 -15%，联盟团结度 +5%。',
    costPP: 35,
    cooldownDays: 21,
    isVisible: (state) => !!state.reformState?.unlockedAngerDecisions,
    effect: (state) => ({
      stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15), allianceUnity: Math.min(100, state.stats.allianceUnity + 5) }
    })
  },
  {
    id: 'lower_sanity',
    title: '推行二次元解构',
    description: '学生理智值 -20%，学生支持度 +10%。',
    costPP: 30,
    cooldownDays: 15,
    effect: (state) => ({
      stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 20), ss: Math.min(100, state.stats.ss + 10) }
    })
  },
  {
    id: 'exchange_tpr_for_pp',
    title: '倒卖试卷储备',
    description: '消耗 1000 TPR，获得 50 PP。',
    costPP: 0,
    cooldownDays: 14,
    isVisible: (state) => !!state.flags.unlockedResourceExchange,
    canAfford: (state) => state.stats.tpr >= 1000,
    effect: (state) => ({
      stats: { ...state.stats, tpr: state.stats.tpr - 1000, pp: state.stats.pp + 50 }
    })
  },
  {
    id: 'exchange_ss_for_pp',
    title: '动员学生支持',
    description: '消耗 20% 学生支持度，获得 50 PP。',
    costPP: 0,
    cooldownDays: 14,
    isVisible: (state) => !!state.flags.unlockedResourceExchange,
    canAfford: (state) => state.stats.ss >= 20,
    effect: (state) => ({
      stats: { ...state.stats, ss: state.stats.ss - 20, pp: state.stats.pp + 50 }
    })
  },
  {
    id: 'mock_exam_sprint',
    title: '组织一模冲刺',
    description: '消耗 500 卷子储备，化解一模危机。',
    costPP: 20,
    cooldownDays: 0,
    isVisible: (state) => !state.flags.mock_exam_sprint_used,
    canAfford: (state) => state.stats.tpr >= 500 && state.crises.some(c => c.id === 'mock_exam'),
    effect: (state) => {
      return {
        stats: { ...state.stats, tpr: state.stats.tpr - 500 },
        crises: state.crises.filter(c => c.id !== 'mock_exam'),
        flags: { ...state.flags, mock_exam_sprint_used: true }
      };
    }
  },
  {
    id: 'big_character_poster',
    title: '大字报运动',
    description: '真左派决议：学生支持度 +10%，激进愤怒 +10%，稳定度 -5%。',
    costPP: 50,
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('true_left_consolidation'),
    canAfford: (state) => state.completedFocuses.includes('true_left_consolidation'),
    effect: (state) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10), radicalAnger: Math.min(100, state.stats.radicalAnger + 10), stab: Math.max(0, state.stats.stab - 5) }
    })
  },
  {
    id: 'confiscate_assets',
    title: '没收反动资产',
    description: '真左派决议：获得 300 TPR，联盟团结度 -5%。',
    costPP: 30,
    cooldownDays: 15,
    isVisible: (state) => state.completedFocuses.includes('true_left_consolidation'),
    canAfford: (state) => state.completedFocuses.includes('true_left_consolidation'),
    effect: (state) => ({
      stats: { ...state.stats, tpr: state.stats.tpr + 300, allianceUnity: Math.max(0, state.stats.allianceUnity - 5) }
    })
  },
  {
    id: 'campus_elections',
    title: '校园民主选举',
    description: '民主派决议：联盟团结度 +15%，稳定度 +10%。',
    costPP: 60,
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('pan_takeover'),
    canAfford: (state) => state.completedFocuses.includes('pan_takeover'),
    effect: (state) => ({
      stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 15), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  {
    id: 'academic_freedom',
    title: '学术自由讲座',
    description: '民主派决议：学生理智值 +15%，消耗 100 TPR。',
    costPP: 40,
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('pan_takeover'),
    canAfford: (state) => state.completedFocuses.includes('pan_takeover') && state.stats.tpr >= 100,
    effect: (state) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 15), tpr: state.stats.tpr - 100 }
    })
  },
  {
    id: 'purge_revisionists',
    title: '清洗修正主义者',
    description: '真左派决议：党内集权度 +10%，联盟团结度 -10%，稳定度 +10%。',
    costPP: 60,
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('orthodox_dominance'),
    canAfford: (state) => state.completedFocuses.includes('orthodox_dominance'),
    effect: (state) => ({
      stats: { ...state.stats, partyCentralization: Math.min(100, state.stats.partyCentralization + 10), allianceUnity: Math.max(0, state.stats.allianceUnity - 10), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  {
    id: 'student_referendum',
    title: '发起全校公投',
    description: '民主派决议：联盟团结度 +20%，党内集权度 -15%。',
    costPP: 80,
    cooldownDays: 45,
    isVisible: (state) => state.completedFocuses.includes('democratic_reforms'),
    canAfford: (state) => state.completedFocuses.includes('democratic_reforms'),
    effect: (state) => ({
      stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 20), partyCentralization: Math.max(0, state.stats.partyCentralization - 15) }
    })
  },
  {
    id: 'delay_reform_crisis',
    title: '推迟题改危机',
    description: '通过高昂的政治代价，将“做题改革付之东流”危机推迟10天。最多推迟10次。',
    costPP: 100,
    cooldownDays: 0,
    isVisible: (state) => state.crises.some(c => c.id === 'reform_fail_crisis'),
    canAfford: (state) => state.stats.pp >= 100 && (state.flags['reform_delay_count'] || 0) < 10,
    effect: (state) => {
      const newCrises = state.crises.map(c => {
        if (c.id === 'reform_fail_crisis') {
          return { ...c, daysLeft: c.daysLeft + 10 };
        }
        return c;
      });
      return {
        crises: newCrises,
        flags: { ...state.flags, reform_delay_count: (state.flags['reform_delay_count'] || 0) + 1 }
      };
    }
  },
  {
    id: 'yang_yule_ascension',
    title: '“杨特”出山',
    description: '耗费 20 学生支持度。杨玉乐接管大权，进入杨玉乐专属国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.yang_yule_decision_unlocked && !state.flags.yang_yule_route_started,
    canAfford: (state) => state.stats.ss >= 20,
    effect: (state) => ({
      stats: { ...state.stats, ss: state.stats.ss - 20 },
      currentFocusTree: 'treeB',
      completedFocuses: [],
      ideologies: {
        authoritarian: 10,
        reactionary: 40,
        liberal: 5,
        radical_socialism: 5,
        anarcho_capitalism: 5,
        deconstructivism: 5,
        test_taking: 30,
      },
      activeMinigame: null,
      advisors: state.advisors.map(a => a?.id === 'yang_yule' ? null : a),
      crises: state.crises.filter(c => c.id !== 'school_counterattack' && c.id !== 'alliance_collapse'),
      nationalSpirits: state.nationalSpirits.filter(ns => !['red_campus', 'student_council', 'awakened_binhu', 'assembly_dynamics', 'democratic_councils_spirit'].includes(ns.id)).concat({
        id: 'yang_yule_regime',
        name: '代理副校长',
        description: '杨玉乐凭借其老谋深算暂代副校长一职。每日稳定度 +0.2%，每日政治点数 +0.1',
        type: 'positive',
        effects: { stabDaily: 0.2, ppDaily: 0.1 }
      }),
      yangYuleState: {
        fengFavor: 50,
        teacherSupport: 50,
        health: 100,
        thermosUsesThisWeek: 0,
        medicineUsesThisWeek: 0,
        dailyDecisionUsed: false,
        rebelLocations: {},
        unlockedMechanics: {
          desk: false,
          map: false,
          health: false,
        }
      },
      leader: {
        name: '杨玉乐',
        title: '名师工作室代理校长',
        portrait: 'yang_yule',
        ideology: 'reactionary',
        description: '老谋深算的保守派代表，擅长分化瓦解学生运动。',
        buffs: ['老谋深算 (每日PP +0.25)']
      },
      flags: { ...state.flags, yang_yule_route_started: true },
      activeEvent: {
        id: 'enter_yang_yule_route',
        title: '“杨特”出山',
        description: 'B3教学楼的楼梯间里充斥着汗臭、防暴盾牌的碰撞声和声嘶力竭的叫骂。合一内战爆发已经过去了四个小时。\n\n高三年级部主任吴福军的衬衫已经完全被冷汗湿透。他引以为傲的保安队和学生督察，在王兆凯布置的课桌街垒和灭火器烟雾阵面前碰得头破血流。王兆凯的“钢铁红蛤”用严密的纪律接管了潘仁越的浪漫主义起义，现在的B3楼顶是一座真正的堡垒。\n\n“给我砸！用液压剪把门剪开！全给他们记大过！开除！”吴福军在楼道里无能狂怒，他的嗓子已经喊哑了。\n\n但他心里清楚，自己已经完了。教育局的电话已经打到了封安保的办公室，如果事情闹大，如果哪怕有一个学生在冲突中受伤，或者从楼上跳下去，他吴福军就是第一个被封安保扔出去平息众怒的替罪羊。暴力威慑一旦失效，暴君就变成了小丑。\n\n就在吴福军气急败坏，准备下令强行破拆的时候，一只苍老却稳定的手按住了他的肩膀。\n\n“吴主任，歇歇吧。强攻要是见了血，封校长和教育局那边，你我可都担待不起啊。”\n\n吴福军猛地回头，看到了端着保温杯的杨玉乐。这位平时在教务会上连个响屁都不敢放的老特级教师，此刻虽然满脸愁容，但眼镜片后的目光却冷得像冰。杨玉乐知道，吴福军的暴力已经把局势熬到了最脆弱的临界点——学生们的肾上腺素正在消退，取而代之的是对未来的本能恐惧。\n\n现在，是他出场摘桃子的时候了。',
        buttonText: '唱白脸的屠夫退场了。'
      }
    })
  },
  // --- DEBUG DECISIONS ---
  {
    id: 'debug_switch_phase1',
    title: '[DEBUG] 切换至初始国策树',
    description: '测试模式：切换至初始阶段国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'phase1',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anbao,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA',
    title: '[DEBUG] 切换至泛左翼国策树',
    description: '测试模式：切换至泛左翼联盟阶段国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.wang_zhaokai,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_pan',
    title: '[DEBUG] 切换至民主派国策树',
    description: '测试模式：切换至民主派国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_pan',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.pan_renyue,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_pan_despair',
    title: '[DEBUG] 切换至民主派绝望国策树',
    description: '测试模式：切换至民主派绝望国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_pan_despair',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.pan_renyue,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_true_left',
    title: '[DEBUG] 切换至真左派国策树',
    description: '测试模式：切换至真左派国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_true_left',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.wang_zhaokai,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_lu_bohan',
    title: '[DEBUG] 切换至吕波汉国策树',
    description: '测试模式：切换至吕波汉国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_lu_bohan',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.lu_bohan,
      flags: withDebugMapFlags(state, {
        red_toad_politburo_unlocked: true,
        lu_nkpd_mode: true,
      })
    })
  },
  {
    id: 'debug_switch_treeA_haobang',
    title: '[DEBUG] 切换至豪邦国策树',
    description: '测试模式：切换至豪邦国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_haobang',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.hao_bang,
      flags: withDebugMapFlags(state, {
        red_toad_politburo_unlocked: true,
        lu_nkpd_mode: false,
      })
    })
  },
  {
    id: 'debug_switch_treeB',
    title: '[DEBUG] 切换至杨玉乐国策树',
    description: '测试模式：切换至杨玉乐国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeB',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.yang_yule,
      flags: withDebugMapFlags(state, {
        yang_yule_route_started: true,
      })
    })
  },
  {
    id: 'debug_switch_jidi_tree',
    title: '[DEBUG] 切换至及第教育国策树',
    description: '测试模式：切换至及第教育国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'jidi_tree',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anxiang,
      flags: withDebugMapFlags(state, {
        jidi_takeover_complete: true,
        jidi_new_era_active: true,
      }),
      jidiCorporateState: state.jidiCorporateState || {
        unlockedMechanics: { rnd: true, committee: true },
        gdp: 1200,
        gdpGrowth: 2.5,
        gdpHistory: [1000, 1100, 1200],
        admissionRate: 92,
        rndState: {
          phase: 'idle',
          daysInPhase: 0,
          testingIntensity: 5,
          daysSinceLastIntensityChange: 0,
        },
        committeeState: {
          seats: { jidi: 45, newOriental: 25, teachers: 20, disciplineCommittee: 10 },
          satisfaction: { jidi: 70, newOriental: 60, teachers: 50, disciplineCommittee: 65 },
          bureauInfluence: 50,
        }
      }
    })
  },
  {
    id: 'debug_switch_gouxiong_tree',
    title: '[DEBUG] 切换至狗熊国策树',
    description: '测试模式：切换至狗熊国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'gouxiong_tree',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.gouxiong,
      flags: withDebugMapFlags(state, {
        rebellion_started: true,
        gouxiong_coup_complete: true,
      })
    })
  },
  {
    id: 'debug_set_leader_wang',
    title: '[DEBUG] 领导人：王兆凯',
    description: '测试模式：仅切换当前领导人为王兆凯。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.wang_zhaokai })
  },
  {
    id: 'debug_set_leader_pan',
    title: '[DEBUG] 领导人：潘仁越',
    description: '测试模式：仅切换当前领导人为潘仁越。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.pan_renyue })
  },
  {
    id: 'debug_set_leader_lu',
    title: '[DEBUG] 领导人：吕波汉',
    description: '测试模式：仅切换当前领导人为吕波汉。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.lu_bohan })
  },
  {
    id: 'debug_set_leader_haobang',
    title: '[DEBUG] 领导人：豪邦',
    description: '测试模式：仅切换当前领导人为豪邦。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.hao_bang })
  },
  {
    id: 'debug_set_leader_yang',
    title: '[DEBUG] 领导人：杨玉乐',
    description: '测试模式：仅切换当前领导人为杨玉乐。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.yang_yule })
  },
  {
    id: 'debug_set_leader_fengxiang',
    title: '[DEBUG] 领导人：封安祥',
    description: '测试模式：仅切换当前领导人为封安祥。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.feng_anxiang })
  },
  {
    id: 'debug_set_leader_gouxiong',
    title: '[DEBUG] 领导人：狗熊',
    description: '测试模式：仅切换当前领导人为狗熊。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.gouxiong })
  },
  {
    id: 'debug_unlock_minigame_frequency_war',
    title: '[DEBUG] 触发频率战小游戏',
    description: '测试模式：直接触发频率战小游戏。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({ activeMinigame: 'frequency_war' })
  },
  {
    id: 'debug_unlock_minigame_siege_b3',
    title: '[DEBUG] 触发B3保卫战小游戏',
    description: '测试模式：直接触发B3保卫战小游戏。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({ activeMinigame: 'siege_b3' })
  },
  {
    id: 'debug_add_resources',
    title: '[DEBUG] 获取大量资源',
    description: '测试模式：获得 1000 PP, 10000 TPR, 100 SS, 100 稳定度等。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      stats: {
        ...state.stats,
        pp: state.stats.pp + 1000,
        tpr: state.stats.tpr + 10000,
        ss: 100,
        stab: 100,
        studentSanity: 100,
        radicalAnger: 0,
        allianceUnity: 100,
        partyCentralization: 100
      }
    })
  },
  {
    id: 'debug_unlock_assembly',
    title: '[DEBUG] 解锁学生大会',
    description: '测试模式：解锁学生大会机制。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      completedFocuses: state.completedFocuses.includes('convene_assembly')
        ? state.completedFocuses
        : [...state.completedFocuses, 'convene_assembly'],
      flags: { ...state.flags, assembly_unlocked: true },
      parliamentState: state.parliamentState || {
        isUpgraded: false,
        powerBalanceUnlocked: true,
        powerBalance: 50,
        factionSupport: {
          orthodox: 50,
          bear: 50,
          pan: 50,
          otherDem: 50,
          testTaker: 50,
          conservativeDem: 50,
          jidiTutoring: 50,
        },
        activeBill: null,
      }
    })
  },
  {
    id: 'debug_unlock_red_toad_politburo',
    title: '[DEBUG] 解锁红蛤政治局',
    description: '测试模式：启用红蛤政治局并初始化派系数据。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: { ...state.flags, red_toad_politburo_unlocked: true },
      redToadState: state.redToadState || {
        overallConsensus: 55,
        factions: {
          orthodox: { id: 'orthodox', name: '正统派', leader: '王兆凯', influence: 420, loyalty: 75, execution: 60, color: '#f0d44a', view: '[领袖视图]', portrait: 'faction_orthodox' },
          libertarian_socialist: { id: 'libertarian_socialist', name: '自社派', leader: '豪邦', influence: 280, loyalty: 70, execution: 45, color: '#4a90f0', view: '[基层信号]', portrait: 'faction_libertarian_socialist' },
          anarchist: { id: 'anarchist', name: '安那其派', leader: '时纪', influence: 180, loyalty: 55, execution: 35, color: '#4af0d4', view: '[信号丢失]', portrait: 'faction_anarchist' },
          internet_philosopher: { id: 'internet_philosopher', name: '网哲派', leader: '周红兵', influence: 120, loyalty: 45, execution: 20, color: '#d44af0', view: '[迷雾覆盖]', portrait: 'faction_internet_philosopher' },
          authoritarian: { id: 'authoritarian', name: '极权派', leader: '吕波汉', influence: 300, loyalty: 30, execution: 85, color: '#ff4444', view: '[保密视图]', portrait: 'faction_authoritarian' },
        },
        activeBillId: null,
        billCooldown: 0,
        historicalBills: [],
        availableBills: []
      }
    })
  },
  {
    id: 'debug_unlock_haobang_mechanics',
    title: '[DEBUG] 解锁豪邦后期机制',
    description: '测试模式：解锁新学生代表大会扩展机制与豪邦路线态度字段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: {
        ...state.flags,
        assembly_unlocked: true,
        red_toad_politburo_unlocked: true,
        haobang_assembly_deluxe_ui: true,
      },
      currentFocusTree: 'treeA_haobang',
      leader: DEBUG_LEADERS.hao_bang,
      parliamentState: {
        ...(state.parliamentState || {
          isUpgraded: true,
          powerBalanceUnlocked: true,
          powerBalance: 50,
          factionSupport: {},
          activeBill: null,
        }),
        isUpgraded: true,
        haobangFactionAttitude: {
          orthodox: 45,
          bear: 35,
          pan: 62,
          otherDem: 58,
          testTaker: 50,
          conservativeDem: 52,
          jidiTutoring: 34,
        }
      }
    })
  },
  {
    id: 'debug_unlock_yang_yule_desk',
    title: '[DEBUG] 解锁杨玉乐办公桌',
    description: '测试模式：解锁杨玉乐办公桌机制。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      yangYuleState: {
        ...(state.yangYuleState || {
          fengFavor: 50,
          teacherSupport: 50,
          health: 100,
          thermosUsesThisWeek: 0,
          medicineUsesThisWeek: 0,
          dailyDecisionUsed: false,
          rebelLocations: {}
        }),
        unlockedMechanics: {
          desk: true,
          map: true,
          health: true
        }
      }
    })
  },
  {
    id: 'debug_unlock_cyber_deconstruction',
    title: '[DEBUG] 解锁赛博解构',
    description: '测试模式：解锁赛博解构机制。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const newAdvisors = [...state.advisors];
      if (!newAdvisors.some(a => a?.id === 'gouxiong_advisor')) {
        newAdvisors[0] = {
          id: 'gouxiong_advisor',
          name: '狗熊',
          title: '二次元解构大师',
          cost: 0,
          description: '解锁赛博解构机制',
          portrait: 'gouxiong',
          modifiers: {}
        };
      }
      return { advisors: newAdvisors };
    }
  },
  {
    id: 'debug_unlock_reform_decisions',
    title: '[DEBUG] 解锁改革委员会',
    description: '测试模式：解锁所有改革委员会相关决议和面板。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const currentReformState = state.reformState || ({} as any);
      return {
        flags: { ...state.flags, reform_unlocked: true },
        reformState: {
          progress: currentReformState.progress || 0,
          vanguardMembers: currentReformState.vanguardMembers || 50,
          regionalStubbornness: currentReformState.regionalStubbornness || {
            'B3': 60,
            'B1_B2': 40,
            'Admin': 80,
            'ArtHall': 30,
            'Lab': 50,
            'Playground': 20
          },
          activeMissions: currentReformState.activeMissions || {},
          baseSuccessRate: currentReformState.baseSuccessRate || 50,
          reformDaysElapsed: currentReformState.reformDaysElapsed || 0,
          juanhaoAttitude: currentReformState.juanhaoAttitude || 0,
          juanhaoEventsTriggered: currentReformState.juanhaoEventsTriggered || {},
          unlockedRecruitDecisions: true,
          unlockedSanityDecisions: true,
          unlockedAngerDecisions: true
        }
      };
    }
  },
  {
    id: 'debug_unlock_resource_exchange',
    title: '[DEBUG] 解锁资源兑换',
    description: '测试模式：解锁倒卖试卷储备和动员学生支持决议。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: { ...state.flags, unlockedResourceExchange: true }
    })
  },
  {
    id: 'debug_max_map_control',
    title: '[DEBUG] 拉满地图控制度',
    description: '测试模式：将所有区域的学生控制度设为100。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const newMapLocations = { ...state.mapLocations };
      Object.keys(newMapLocations).forEach(key => {
        newMapLocations[key].studentControl = 100;
      });
      return { mapLocations: newMapLocations };
    }
  },
  {
    id: 'debug_max_assembly_support',
    title: '[DEBUG] 拉满议会支持度',
    description: '测试模式：将所有派系的支持度设为100。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const newParliamentState = state.parliamentState ? { ...state.parliamentState } : {
        isUpgraded: true,
        powerBalanceUnlocked: true,
        powerBalance: 50,
        factionSupport: {},
        activeBill: undefined
      };
      newParliamentState.factionSupport = {
        orthodox: 100,
        bear: 100,
        pan: 100,
        otherDem: 100,
        testTaker: 100,
        conservativeDem: 100,
        jidiTutoring: 100
      };
      newParliamentState.haobangFactionAttitude = {
        orthodox: 100,
        bear: 100,
        pan: 100,
        otherDem: 100,
        testTaker: 100,
        conservativeDem: 100,
        jidiTutoring: 100,
      };
      return { parliamentState: newParliamentState as any };
    }
  },
  {
    id: 'debug_switch_map_phase_reform',
    title: '[DEBUG] 切换地图阶段：全面做题改革',
    description: '测试模式：切换至全面做题改革阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, { map_phase_ended: true })
    })
  },
  {
    id: 'debug_switch_map_phase_polling',
    title: '[DEBUG] 切换地图阶段：普选站网络',
    description: '测试模式：切换至普选站网络阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, { polling_stations_unlocked: true })
    })
  },
  {
    id: 'debug_switch_map_phase_peace',
    title: '[DEBUG] 切换地图阶段：和平重建',
    description: '测试模式：切换至和平重建阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, { map_struggle_ended: true })
    })
  },
  {
    id: 'debug_switch_map_phase_jidi',
    title: '[DEBUG] 切换地图阶段：及第教育接管',
    description: '测试模式：切换至及第教育接管阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, {
        jidi_takeover_complete: true,
        jidi_new_era_active: true,
      })
    })
  },
  {
    id: 'debug_switch_map_phase_rebellion',
    title: '[DEBUG] 切换地图阶段：武装起义',
    description: '测试模式：切换至武装起义阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, { rebellion_started: true })
    })
  },
  {
    id: 'debug_switch_map_phase_lu_purge',
    title: '[DEBUG] 切换地图阶段：N.K.P.D.清洗图',
    description: '测试模式：切换至吕波汉路线清洗地图。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, {
        lu_purge_map_phase: true,
        red_toad_politburo_unlocked: true,
        lu_purge_map_actions: state.flags.lu_purge_map_actions || 0,
      }),
      currentFocusTree: 'treeA_lu_bohan',
      leader: DEBUG_LEADERS.lu_bohan,
    })
  },
  {
    id: 'debug_switch_map_phase_haobang_commune',
    title: '[DEBUG] 切换地图阶段：学生公社建设图',
    description: '测试模式：切换至豪邦路线公社建设地图。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, {
        haobang_commune_map_phase: true,
        red_toad_politburo_unlocked: true,
        haobang_commune_map_actions: state.flags.haobang_commune_map_actions || 0,
      }),
      currentFocusTree: 'treeA_haobang',
      leader: DEBUG_LEADERS.hao_bang,
    })
  },
  {
    id: 'debug_switch_map_phase_yang',
    title: '[DEBUG] 切换地图阶段：杨玉乐路线',
    description: '测试模式：切换至杨玉乐路线阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: withDebugMapFlags(state, { yang_yule_route_started: true })
    })
  }
];

export default function RightSidebar({ state, triggerDecision, triggerError, openAssembly, openCyberDeconstruction, openGouxiongGal, openYangYuleDesk, openElectionUI, openJidiCorporateUI, openRedToadPolitburo, openInGameMenu }: RightSidebarProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleDecision = (decision: Decision) => {
    if (state.stats.pp < decision.costPP || (state.decisionCooldowns[decision.id] || 0) > 0 || (decision.canAfford && !decision.canAfford(state))) {
      triggerError();
      return;
    }
    triggerDecision(decision);
  };

  const hasAssemblyMechanic = state.flags.assembly_unlocked
    || state.completedFocuses.includes('convene_assembly')
    || state.nationalSpirits.some(spirit => spirit.id === 'assembly_dynamics')
    || !!state.parliamentState;
  const hasAssembly = hasAssemblyMechanic && (!state.flags['lu_nkpd_mode'] || state.currentFocusTree === 'treeA_haobang');
  const hasGouxiong = state.flags['gouxiong_coup_complete'];
  const hasYangYuleDesk = state.yangYuleState?.unlockedMechanics?.desk;
  const hasJidiCorporate = !!state.jidiCorporateState;

  return (
    <div className="w-64 md:w-80 flex-shrink-0 tno-panel border-l border-tno-border h-full flex flex-col p-4 relative z-10">
      
      {/* Secondary Stats */}
      <div className="mb-4">
        <h2 className="text-tno-text/60 font-bold text-xs mb-2 border-b border-tno-border pb-1 tracking-widest uppercase">
          局势动态
        </h2>
        {state.flags['red_toad_politburo_unlocked'] && (
          <button 
            onClick={openRedToadPolitburo}
            className="w-full mb-2 bg-[#ff4444]/10 border border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-black font-bold py-1 px-2 transition-colors text-xs tracking-widest"
          >
            红蛤政治局
          </button>
        )}
        {hasJidiCorporate && (
          <button 
            onClick={openJidiCorporateUI}
            className="w-full mb-2 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold py-1 px-2 transition-colors text-xs tracking-widest"
          >
            及第企业管理系统
          </button>
        )}
        {hasAssembly && (
          <button 
            onClick={openAssembly}
            className="w-full mb-2 bg-tno-highlight/10 border border-tno-highlight text-tno-highlight hover:bg-tno-highlight hover:text-black font-bold py-1 px-2 transition-colors text-xs tracking-widest"
          >
            召开学生代表大会
          </button>
        )}
        {state.electionState?.isActive && (
          <button 
            onClick={openElectionUI}
            className="w-full mb-2 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-1 px-2 transition-colors text-xs tracking-widest"
          >
            查看大选情况
          </button>
        )}
        {hasGouxiong && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={openCyberDeconstruction}
              className="bg-[#ec4899]/10 border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899] hover:text-black font-bold py-1 px-2 transition-colors text-xs tracking-widest"
            >
              赛博解构
            </button>
            <button 
              onClick={openGouxiongGal}
              className="bg-blue-500/10 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold py-1 px-2 transition-colors text-xs tracking-widest"
            >
              Gal聊天
            </button>
          </div>
        )}
        {hasYangYuleDesk && (
          <button 
            onClick={openYangYuleDesk}
            className="w-full mb-2 bg-[#d97706]/10 border border-[#d97706] text-[#d97706] hover:bg-[#d97706] hover:text-black font-bold py-1 px-2 transition-colors text-xs tracking-widest"
          >
            杨特的办公桌
          </button>
        )}
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex justify-between items-center bg-zinc-900/50 p-1 border border-tno-border group relative cursor-help">
            <span className="text-tno-text/80">资本渗透</span>
            <span className={state.stats.capitalPenetration > 50 ? 'text-tno-red font-bold' : 'text-tno-highlight font-bold'}>{Math.floor(state.stats.capitalPenetration)}%</span>
            <div className="absolute top-full left-0 mt-1 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-[10px] shadow-lg text-left">
              <div className="text-tno-highlight font-bold mb-1 border-b border-tno-border pb-1">资本渗透度</div>
              <div className="text-tno-text/80 mb-1 whitespace-normal">及第教育等外部资本对学校的控制程度。</div>
              <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.capitalPenetrationDaily >= 0 ? 'text-tno-red' : 'text-tno-green'}>{state.modifiers.capitalPenetrationDaily > 0 ? '+' : ''}{state.modifiers.capitalPenetrationDaily?.toFixed(1) || '0.0'}%</span></div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-zinc-900/50 p-1 border border-tno-border group relative cursor-help">
            <span className="text-tno-text/80">激进愤怒</span>
            <span className={state.stats.radicalAnger > 80 ? 'text-tno-red font-bold crt-flicker' : 'text-tno-highlight font-bold'}>{Math.floor(state.stats.radicalAnger)}%</span>
            <div className="absolute top-full right-0 mt-1 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-[10px] shadow-lg text-left">
              <div className="text-tno-highlight font-bold mb-1 border-b border-tno-border pb-1">激进愤怒度</div>
              <div className="text-tno-text/80 mb-1 whitespace-normal">激进派学生对现状的不满程度。过高可能引发不可控的暴动。</div>
              <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.radicalAngerDaily >= 0 ? 'text-tno-red' : 'text-tno-green'}>{state.modifiers.radicalAngerDaily > 0 ? '+' : ''}{state.modifiers.radicalAngerDaily?.toFixed(1) || '0.0'}%</span></div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-zinc-900/50 p-1 border border-tno-border group relative cursor-help">
            <span className="text-tno-text/80">联盟团结</span>
            <span className={state.stats.allianceUnity < 40 ? 'text-tno-red font-bold' : state.stats.allianceUnity > 70 ? 'text-tno-green font-bold' : 'text-tno-highlight font-bold'}>{Math.floor(state.stats.allianceUnity)}%</span>
            <div className="absolute top-full left-0 mt-1 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-[10px] shadow-lg text-left">
              <div className="text-tno-highlight font-bold mb-1 border-b border-tno-border pb-1">联盟团结度</div>
              <div className="text-tno-text/80 mb-1 whitespace-normal">代表“钢铁红蛤”与潘仁越的“自由民主派”及全校普通学生的共识程度。大于70才能进入真左派大团结或潘仁越民主线。</div>
              <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.allianceUnityDaily >= 0 ? 'text-tno-green' : 'text-tno-red'}>{state.modifiers.allianceUnityDaily > 0 ? '+' : ''}{state.modifiers.allianceUnityDaily?.toFixed(1) || '0.0'}%</span></div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-zinc-900/50 p-1 border border-tno-border group relative cursor-help">
            <span className="text-tno-text/80">党内集权</span>
            <span className={state.stats.partyCentralization < 40 ? 'text-tno-highlight font-bold' : state.stats.partyCentralization > 60 ? 'text-tno-red font-bold' : 'text-tno-text font-bold'}>{Math.floor(state.stats.partyCentralization)}%</span>
            <div className="absolute top-full right-0 mt-1 bg-tno-bg border border-tno-border p-2 hidden group-hover:block z-50 w-48 text-[10px] shadow-lg text-left">
              <div className="text-tno-highlight font-bold mb-1 border-b border-tno-border pb-1">党内集权度</div>
              <div className="text-tno-text/80 mb-1 whitespace-normal">代表王兆凯在“钢铁红蛤”内部的独裁程度以及对待校方的强硬度。极高进入大梦初醒线，极低进入平庸之乐线。</div>
              <div className="flex justify-between"><span>每日变化:</span><span className={state.modifiers.partyCentralizationDaily >= 0 ? 'text-tno-highlight' : 'text-tno-text/80'}>{state.modifiers.partyCentralizationDaily > 0 ? '+' : ''}{state.modifiers.partyCentralizationDaily?.toFixed(1) || '0.0'}%</span></div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-zinc-900/50 p-1 border border-tno-border group relative cursor-help col-span-2">
            <span className="text-tno-text/80">学生理智值</span>
            <span className={state.stats.studentSanity < 30 ? 'text-tno-red font-bold' : 'text-tno-green font-bold'}>{Math.floor(state.stats.studentSanity)}%</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50">
              <div className="font-bold text-tno-highlight mb-1 border-b border-tno-border pb-1">学生理智值</div>
              <div className="text-tno-text/80 mb-1">反映了学生群体对现实的认知程度。理智值过低可能导致不可预料的荒诞事件发生。</div>
              <div className="flex justify-between text-[10px]"><span>每日变化:</span><span className={state.modifiers.studentSanityDaily < 0 ? 'text-tno-red' : 'text-tno-green'}>{state.modifiers.studentSanityDaily > 0 ? '+' : ''}{state.modifiers.studentSanityDaily?.toFixed(1) || '0.0'}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Crises */}
       <div className="mb-4 flex flex-col max-h-64 min-h-0">
        <h2 className="text-tno-red font-bold text-lg mb-4 border-b border-tno-border pb-2 tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          当前危机
        </h2>
        
        <div className="space-y-3 overflow-y-auto pr-1">
          {state.crises.map(crisis => (
            <div key={crisis.id} className="border border-tno-red bg-tno-red/5 p-3 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-tno-red text-sm">{crisis.title}</h4>
                <span className="text-xs text-tno-red font-bold crt-flicker">{crisis.daysLeft} 天</span>
              </div>
              <div className="w-full h-1 bg-zinc-900 border border-tno-border mb-2">
                <div className="h-full bg-tno-red" style={{ width: `${(crisis.daysLeft / 30) * 100}%` }}></div>
              </div>
              <p className="text-[10px] text-tno-text/80 leading-tight">
                {crisis.description}
              </p>
            </div>
          ))}
          {state.crises.length === 0 && (
            <div className="text-xs text-tno-text/50 text-center py-4">暂无迫在眉睫的危机</div>
          )}
        </div>
      </div>

      {/* Decisions */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <h2 className="text-tno-highlight font-bold text-lg mb-4 border-b border-tno-border pb-2 tracking-widest flex items-center gap-2">
          <Target className="w-5 h-5" />
          可用决议
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {DECISIONS.filter(d => d.isVisible ? d.isVisible(state) : true).map(decision => {
            const cooldown = state.decisionCooldowns[decision.id] || 0;
            const canAffordPP = state.stats.pp >= decision.costPP;
            const canAffordCustom = decision.canAfford ? decision.canAfford(state) : true;
            const isAvailable = cooldown <= 0 && canAffordPP && canAffordCustom;

            return (
              <button 
                key={decision.id}
                onClick={() => handleDecision(decision)}
                className={`w-full text-left border p-3 transition-colors relative overflow-hidden ${
                  isAvailable 
                    ? 'border-tno-border hover:border-tno-highlight hover:bg-zinc-900' 
                    : 'border-tno-border/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold text-sm ${isAvailable ? 'text-tno-text' : 'text-tno-text/50'}`}>
                    {decision.title}
                  </h4>
                  <span className={`text-xs ${canAffordPP ? 'text-tno-highlight' : 'text-tno-red'}`}>
                    {decision.costPP} PP
                  </span>
                </div>
                <p className="text-[10px] text-tno-text/60 mb-2">{decision.description}</p>
                {cooldown > 0 && (
                  <div className="text-[10px] text-tno-red font-bold">冷却中: {cooldown} 天</div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <button 
            onClick={openInGameMenu}
            className="border border-pink-300 bg-pink-500/10 text-pink-100 hover:bg-pink-400 hover:text-black p-1.5 flex items-center justify-center gap-1.5 transition-colors font-bold text-xs"
          >
            菜单
          </button>
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="border border-tno-highlight bg-tno-highlight/10 text-tno-highlight hover:bg-tno-highlight hover:text-black p-1.5 flex items-center justify-center gap-1.5 transition-colors font-bold text-xs"
          >
            <Book className="w-3 h-3" />
            路线指南
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {isGuideOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-tno-bg border-2 border-tno-highlight w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl shadow-tno-highlight/20">
            <div className="p-4 border-b border-tno-highlight bg-tno-highlight/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-tno-highlight tracking-widest flex items-center gap-2">
                <Book className="w-6 h-6" />
                合肥一中风云：路线指南
              </h2>
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="text-tno-highlight hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-tno-text/90">
              <section>
                <h3 className="text-zinc-500 font-bold text-lg mb-2 border-b border-zinc-500/30 pb-1">合一的毁灭 (隐藏坏结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在游戏任意阶段，稳定度 &lt;= 0 且 试卷储备量(TPR) &lt;= 0，触发“子夜？”危机，30天内未解决。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 将稳定度和做题力同时耗尽，等待30天倒计时结束，见证合一的彻底毁灭。</p>
              </section>

              <section>
                <h3 className="text-tno-red font-bold text-lg mb-2 border-b border-tno-red/30 pb-1">全面镇压 (失败结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在二阶段（地图斗争阶段），有5个或以上地点的学生控制度低于45%，且稳定度低于30%。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 避免在地图上失去过多地点的控制权，同时保持稳定度在30%以上。如果稳定度过低且失去太多地盘，吴福军将直接介入并全面镇压。</p>
              </section>

              <section>
                <h3 className="text-tno-green font-bold text-lg mb-2 border-b border-tno-green/30 pb-1">升学率雪崩 (失败结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在二阶段（地图斗争阶段），有5个或以上地点的学生控制度高于55%，但卷子储备量(TPR)降至0或以下，且稳定度低于30%。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 虽然夺取了地盘，但如果完全放弃做题（TPR归零）且校园陷入混乱（稳定度&lt;30%），将导致升学率雪崩，游戏失败。注意维持一定的TPR产出和稳定度。</p>
              </section>

              <section>
                <h3 className="text-tno-red font-bold text-lg mb-2 border-b border-tno-red/30 pb-1">大梦初醒 (镇压结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，联盟团结度 &lt; 40 且 党内集权度 &gt; 80。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 扮演强硬派，不断打压其他派系，拒绝民主改革，提升党内集权度。同时忽视联盟团结，导致学生内部矛盾激化。最终校方将介入并彻底镇压。</p>
              </section>
              
              <section>
                <h3 className="text-tno-highlight font-bold text-lg mb-2 border-b border-tno-highlight/30 pb-1">平庸之乐 (妥协结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，未能达成其他结局条件（默认结局）。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 保持各方势力的平衡，既不走向极端集权，也不进行彻底的民主改革。最终维持现状，成为一个平庸的妥协者。</p>
              </section>

              <section>
                <h3 className="text-tno-green font-bold text-lg mb-2 border-b border-tno-green/30 pb-1">真左派大团结 (理想结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，联盟团结度 &gt; 70，党内集权度 &gt; 60，且正统派席位最高。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 保持“钢铁红蛤”的领导地位，同时积极召开学生代表大会，拉拢其他派系以提升联盟团结度。解锁“真左派”专属国策树后，完成“真左派大团结”国策。</p>
              </section>

              <section>
                <h3 className="text-tno-text font-bold text-lg mb-2 border-b border-tno-text/30 pb-1">无政府状态 (失败结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 触发“联盟濒临瓦解”危机（党内集权 &gt; 90 且 联盟团结 &lt; 25），并在15天内未能解决。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 极度集权且极度孤立，导致联盟彻底崩溃，游戏提前结束。</p>
              </section>
              
              <section>
                <h3 className="text-blue-400 font-bold text-lg mb-2 border-b border-blue-400/30 pb-1">潘仁越民主线 (自由结局 / 绝望结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，联盟团结度 &gt; 70，党内集权度 &lt; 30，且潘仁越派席位 &gt; 30。进入此路线后，若试卷储备量(TPR) &lt;= 0 且 学生支持度 &lt; 30，将触发“校方反攻？”危机，30天未解决则进入绝望分支。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 积极召开学生代表大会，不断向潘仁越等温和派妥协，降低党内集权度并提升联盟团结度。解锁“潘仁越”专属国策树后，完成“民主的胜利”国策。如果在该路线中完全放弃做题且失去学生支持，将触发“校方反攻？”危机，倒计时结束后进入潘仁越绝望分支，最终达成“绝望的终局”坏结局。</p>
              </section>
              
              <section>
                <h3 className="text-[#ec4899] font-bold text-lg mb-2 border-b border-[#ec4899]/30 pb-1">狗熊窃国线 (赛博结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 雇佣顾问“狗熊”，且稳定度 &lt; 30，学生理智值 &lt; 30，触发“内奸？？”危机并在15天内未能解决。或者在攻下B3教学楼后，如果学生理智值 &lt; 20 且 资本渗透度 &gt; 80。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 完成“革命招兵买马”国策后雇佣狗熊。通过“赛博解构”小游戏不断降低学生理智值和稳定度。当两者都低于30时，将触发危机。在15天内保持低理智和低稳定度，狗熊将发动政变，建立赛博娱乐国度。如果在前期疯狂降低学生理智并提高资本渗透，攻下B3后将触发“二次元的狂欢”事件，也会进入狗熊窃国线。解锁“赛博娱乐大统领”专属国策树，完成最终国策。</p>
              </section>
              
              <section>
                <h3 className="text-yellow-400 font-bold text-lg mb-2 border-b border-yellow-400/30 pb-1">及第企业线 (资本结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 触发“及第资本夺权”危机（稳定度 &lt; 50 且 资本渗透度 &gt; 60），并在30天内未能解决。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 频繁使用“向及第教育妥协购买密卷”等增加资本渗透度的决议，同时保持较低的稳定度。危机爆发后，不要尝试降低资本渗透度或提升稳定度，等待30天后及第教育全面接管校园。解锁“及第帝国”专属国策树，完成最终国策。</p>
              </section>

              <section>
                <h3 className="text-blue-800 font-bold text-lg mb-2 border-b border-blue-800/30 pb-1">杨玉乐线 (名师工作室)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 雇佣杨玉乐为内阁，在开始“冲上B3教学楼！”国策时稳定度 &lt; 20。攻下B3后10天解锁决议。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 在前期雇佣杨玉乐为内阁，并在开始国策“冲上B3教学楼！”时保持稳定度低于20。攻下B3后10天将解锁“‘杨特’出山”决议，点击后进入杨玉乐线（TREE_B）。</p>
              </section>
              <section>
                <h3 className="text-tno-red font-bold text-lg mb-2 border-b border-tno-red/30 pb-1">大梦初醒 (镇压结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，联盟团结度 &lt; 40 且 党内集权度 &gt; 80。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 扮演强硬派，不断打压其他派系，拒绝民主改革，提升党内集权度。同时忽视联盟团结，导致学生内部矛盾激化。最终校方将介入并彻底镇压。</p>
              </section>
              
              <section>
                <h3 className="text-tno-highlight font-bold text-lg mb-2 border-b border-tno-highlight/30 pb-1">平庸之乐 (妥协结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，未能达成其他结局条件（默认结局）。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 保持各方势力的平衡，既不走向极端集权，也不进行彻底的民主改革。最终维持现状，成为一个平庸的妥协者。</p>
              </section>

              <section>
                <h3 className="text-tno-green font-bold text-lg mb-2 border-b border-tno-green/30 pb-1">真左派大团结 (理想结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，联盟团结度 &gt; 70，党内集权度 &gt; 60，且正统派席位最高。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 保持“钢铁红蛤”的领导地位，同时积极召开学生代表大会，拉拢其他派系以提升联盟团结度。解锁“真左派”专属国策树后，完成“真左派大团结”国策。</p>
              </section>

              <section>
                <h3 className="text-tno-text font-bold text-lg mb-2 border-b border-tno-text/30 pb-1">无政府状态 (失败结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 触发“联盟濒临瓦解”危机（党内集权 &gt; 90 且 联盟团结 &lt; 25），并在15天内未能解决。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 极度集权且极度孤立，导致联盟彻底崩溃，游戏提前结束。</p>
              </section>
              
              <section>
                <h3 className="text-blue-400 font-bold text-lg mb-2 border-b border-blue-400/30 pb-1">潘仁越民主线 (自由结局 / 绝望结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 在“命运的十字路口”事件触发时，联盟团结度 &gt; 70，党内集权度 &lt; 30，且潘仁越派席位 &gt; 30。进入此路线后，若试卷储备量(TPR) &lt;= 0 且 学生支持度 &lt; 30，将触发“校方反攻？”危机，30天未解决则进入绝望分支。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 积极召开学生代表大会，不断向潘仁越等温和派妥协，降低党内集权度并提升联盟团结度。解锁“潘仁越”专属国策树后，完成“民主的胜利”国策。如果在该路线中完全放弃做题且失去学生支持，将触发“校方反攻？”危机，倒计时结束后进入潘仁越绝望分支，最终达成“绝望的终局”坏结局。</p>
              </section>
              
              <section>
                <h3 className="text-[#ec4899] font-bold text-lg mb-2 border-b border-[#ec4899]/30 pb-1">狗熊窃国线 (赛博结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 雇佣顾问“狗熊”，且稳定度 &lt; 30，学生理智值 &lt; 30，触发“内奸？？”危机并在15天内未能解决。或者在攻下B3教学楼后，如果学生理智值 &lt; 20 且 资本渗透度 &gt; 80。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 完成“革命招兵买马”国策后雇佣狗熊。通过“赛博解构”小游戏不断降低学生理智值和稳定度。当两者都低于30时，将触发危机。在15天内保持低理智和低稳定度，狗熊将发动政变，建立赛博娱乐国度。如果在前期疯狂降低学生理智并提高资本渗透，攻下B3后将触发“二次元的狂欢”事件，也会进入狗熊窃国线。解锁“赛博娱乐大统领”专属国策树，完成最终国策。</p>
              </section>
              
              <section>
                <h3 className="text-yellow-400 font-bold text-lg mb-2 border-b border-yellow-400/30 pb-1">及第企业线 (资本结局)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 触发“及第资本夺权”危机（稳定度 &lt; 50 且 资本渗透度 &gt; 60），并在30天内未能解决。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 频繁使用“向及第教育妥协购买密卷”等增加资本渗透度的决议，同时保持较低的稳定度。危机爆发后，不要尝试降低资本渗透度或提升稳定度，等待30天后及第教育全面接管校园。解锁“及第帝国”专属国策树，完成最终国策。</p>
              </section>

              <section>
                <h3 className="text-blue-800 font-bold text-lg mb-2 border-b border-blue-800/30 pb-1">杨玉乐线 (名师工作室)</h3>
                <p className="mb-2"><strong>达成条件：</strong> 雇佣杨玉乐为内阁，在开始“冲上B3教学楼！”国策时稳定度 &lt; 20。攻下B3后10天解锁决议。</p>
                <p className="text-tno-text/70"><strong>路线指南：</strong> 在前期雇佣杨玉乐为内阁，并在开始国策“冲上B3教学楼！”时保持稳定度低于20。攻下B3后10天将解锁“‘杨特’出山”决议，点击后进入杨玉乐线（TREE_B）。</p>
              </section>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
