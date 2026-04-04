export interface Advisor {
  id: string;
  title: string;
  name: string;
  description: string;
  portrait?: string;
  cost: number;
  modifiers: {
    ppDaily?: number;
    stabDaily?: number;
    ssDaily?: number;
    tprDaily?: number;
    studentSanityDaily?: number;
    capitalPenetrationDaily?: number;
    radicalAngerDaily?: number;
    allianceUnityDaily?: number;
    partyCentralizationDaily?: number;
    powerBalanceDaily?: number;
    gdpGrowthDaily?: number;
    rndQualityDaily?: number;
  };
}

export interface FocusNode {
  id: string;
  title: string;
  description: string;
  days: number;
  x: number;
  y: number;
  requires?: string[];
  mutuallyExclusive?: string[];
  canStart?: (state: GameState) => boolean;
  isHidden?: (state: GameState) => boolean;
  onStart?: (state: GameState) => Partial<GameState>;
  onComplete?: (state: GameState) => Partial<GameState>;
  effectsText?: string[];
  requiresText?: string[];
}

export interface Crisis {
  id: string;
  title: string;
  daysLeft: number;
  description: string;
  onExpire?: (state: GameState) => Partial<GameState>;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  costPP: number;
  cooldownDays: number;
  canAfford?: (state: GameState) => boolean;
  isVisible?: (state: GameState) => boolean;
  effect: (state: GameState) => Partial<GameState>;
}

export interface Leader {
  name: string;
  title: string;
  portrait: string;
  ideology: string;
  description?: string;
  buffs?: string[];
}

export interface NationalSpirit {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  icon?: string;
  effects?: {
    ppDaily?: number;
    stabDaily?: number;
    ssDaily?: number;
    tprDaily?: number;
    studentSanityDaily?: number;
    capitalPenetrationDaily?: number;
    radicalAngerDaily?: number;
    allianceUnityDaily?: number;
    partyCentralizationDaily?: number;
    powerBalanceDaily?: number;
    defenseBonus?: number;
    attackBonus?: number;
    gdpGrowthDaily?: number;
    rndQualityDaily?: number;
  };
}

export interface EventChoice {
  id?: string;
  text: string;
  previewText?: string;
  disabled?: (state: GameState) => boolean;
  effect?: (state: GameState) => Partial<GameState>;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  buttonText?: string;
  effectsText?: string[];
  isStoryEvent?: boolean;
  effect?: (state: GameState) => Partial<GameState>;
  choices?: EventChoice[];
}

export interface MapLocation {
  id: string;
  name: string;
  studentControl: number;
  defenseDays: number;
  pollingData?: Record<string, number>;
  totalVotes?: number;
  castVotes?: Record<string, number>;
}

export interface JidiCorporateState {
  unlockedMechanics: {
    rnd: boolean;
    committee: boolean;
  };
  gdp: number; // in millions
  gdpGrowth: number;
  gdpHistory: number[];
  admissionRate: number;
  bureauTarget?: {
    active: boolean;
    daysLeft: number;
    targetGdp: number;
  };
  riotState?: {
    progress: number;
    bureauAnger: number;
    studentAnger: number;
    daysActive?: number;
  };
  lockedUI?: {
    gdp?: boolean;
    rnd?: boolean;
    committee?: boolean;
  };
  rndState?: {
    phase: 'idle' | 'initiation' | 'testing' | 'dumping';
    daysInPhase: number;
    currentProduct?: {
      name: string;
      faction: 'jidi' | 'newOriental' | 'teachers';
      quality: number;
      sales: number;
      salesMultiplier: number;
      image?: string;
    };
    testingIntensity: number;
    daysSinceLastIntensityChange: number;
    hasInteractedToday?: boolean;
  };
  committeeState?: {
    seats: {
      jidi: number;
      newOriental: number;
      teachers: number;
      disciplineCommittee: number;
    };
    satisfaction: {
      jidi: number;
      newOriental: number;
      teachers: number;
      disciplineCommittee: number;
    };
    bureauInfluence: number;
    activeBill?: {
      id: string;
      name: string;
      daysLeft: number;
      support: number;
      proposer: 'jidi' | 'newOriental' | 'teachers' | 'disciplineCommittee';
      lobbiedFactions: string[];
    };
  };
}

export interface RedToadFaction {
  id: string;
  name: string;
  leader: string;
  influence: number;
  loyalty: number;
  execution: number;
  color: string;
  view: string;
  portrait?: string;
}

export interface RedToadBill {
  id: string;
  title: string;
  description: string;
  warning?: string;
  initiator?: string; // Faction ID of the initiator
  supportThreshold: number; // Influence needed to pass
  requiresFlag?: string; // Only available if this flag is true
  onPass: (state: GameState) => Partial<GameState>;
  onFail: (state: GameState) => Partial<GameState>;
}

export interface RedToadState {
  overallConsensus: number;
  factions: Record<string, RedToadFaction>;
  activeBillId: string | null;
  billCooldown: number;
  historicalBills: string[];
  availableBills: string[];
}

export interface GameState {
  date: Date;
  isPaused: boolean;
  gameSpeed: number;
  stats: {
    pp: number;
    stab: number;
    ss: number;
    tpr: number;
    capitalPenetration: number;
    radicalAnger: number;
    allianceUnity: number;
    partyCentralization: number;
    studentSanity: number;
  };
  modifiers: {
    ppDaily: number;
    stabDaily: number;
    ssDaily: number;
    tprDaily: number;
    studentSanityDaily: number;
    capitalPenetrationDaily: number;
    radicalAngerDaily: number;
    allianceUnityDaily: number;
    partyCentralizationDaily: number;
    powerBalanceDaily: number;
  };
  leader: Leader;
  ideologies: Record<string, number>;
  nationalSpirits: NationalSpirit[];
  advisors: (Advisor | null)[];
  activeFocus: { id: string; daysLeft: number; totalDays: number } | null;
  completedFocuses: string[];
  crises: Crisis[];
  decisionCooldowns: Record<string, number>;
  activeEvent: GameEvent | null;
  activeStoryEvents: GameEvent[];
  activeSuperEvent: SuperEventData | null;
  activeMinigame: string | null;
  unlockedMinigames: string[];
  flags: Record<string, any>;
  currentFocusTree: string;
  mapLocations: Record<string, MapLocation>;
  reformState?: {
    progress: number;
    vanguardMembers: number;
    reformDaysElapsed?: number;
    regionalStubbornness: Record<string, number>;
    activeMissions: Record<string, { daysLeft: number; actionId: string }>;
    baseSuccessRate: number;
    juanhaoAttitude?: number;
    juanhaoEventsTriggered?: Record<string, boolean>;
    unlockedB3Actions?: boolean;
    unlockedRecruitDecisions?: boolean;
    unlockedSanityDecisions?: boolean;
    unlockedAngerDecisions?: boolean;
  };
  gameEnding?: string;
  studentAssemblyFactions?: {
    orthodox: number;
    bear: number;
    pan: number;
    otherDem: number;
    testTaker: number;
    conservativeDem?: number;
    jidiTutoring?: number;
  };
  parliamentState?: {
    isUpgraded: boolean;
    powerBalanceUnlocked: boolean;
    powerBalance: number; // 0-100, 50 is center
    factionSupport: Record<string, number>; // 0-100 support for Pan Renyue
    haobangFactionAttitude?: Record<string, number>; // 0-100 attitude toward Steel Toad (Haobang route)
    activeBill: {
      id: string;
      name: string;
      daysLeft: number;
      baseApproval: number;
      lobbiedApproval: number;
      requiredApproval: number;
      interactionsRemaining: number;
      interactedFactions: string[];
      proposer?: string;
    } | null;
  };
  electionState?: {
    isActive: boolean;
    daysLeft: number;
    totalDays: number;
    candidates: string[];
    playerCandidate: string | null;
    votes: Record<string, number>;
  };
  cyberDeconstruction?: {
    level: number;
    progress: number;
    currentWork: string;
    stage: number;
    ratings?: Record<string, number>;
    reviewedWorks?: string[];
    workProgress?: Record<string, number>;
  };
  gouxiongState?: {
    sanity: number;
    maxSanity: number;
    affinities: {
      dabi: number;
      maodun: number;
      lante: number;
      wushuo: number;
    };
    unlockedCharacters: string[];
    chats: Record<string, Array<{ from: 'gx' | 'npc'; text: string; ts: string }>>;
    dialogueProgress?: Record<string, number>;
    dailyChatState?: {
      dateKey: string;
      sentCount: number;
      blocked: boolean;
      incomingByCharacter?: Record<string, number>;
    };
  };
  yangYuleState?: {
    fengFavor: number;
    teacherSupport: number;
    health: number;
    thermosUsesThisWeek: number;
    medicineUsesThisWeek: number;
    dailyDecisionUsed: boolean;
    rebelLocations: Record<string, number>;
    rebelCooldowns?: Record<string, number>;
    unlockedMechanics: {
      desk: boolean;
      map: boolean;
      health: boolean;
    };
  };
  jidiCorporateState?: JidiCorporateState;
  redToadState?: RedToadState;
}

export interface SuperEventData {
  id: string;
  title: string;
  quote: string;
  author: string;
  color?: string;
}
