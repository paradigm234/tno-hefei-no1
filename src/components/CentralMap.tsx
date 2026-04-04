import React, { useState } from 'react';
import { GameState } from '../types';
import { X, Flame } from 'lucide-react';

interface CentralMapProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerError: () => void;
  isElectionUIOpen?: boolean;
  setIsElectionUIOpen?: (isOpen: boolean) => void;
}

const FireEffect = ({ intensity }: { intensity: number }) => {
  if (intensity <= 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15 flex items-end justify-center opacity-80 mix-blend-screen">
      <div className="relative w-full h-full flex items-end justify-center">
        {Array.from({ length: Math.min(10, Math.ceil(intensity / 10)) }).map((_, i) => (
          <Flame 
            key={i} 
            className="text-orange-500 animate-pulse absolute bottom-0" 
            style={{ 
              width: `${20 + Math.random() * 30}px`, 
              height: `${20 + Math.random() * 30}px`,
              left: `${10 + Math.random() * 80}%`,
              animationDuration: `${0.5 + Math.random() * 1}s`,
              animationDelay: `${Math.random() * 0.5}s`,
              filter: 'drop-shadow(0 0 10px rgba(255, 165, 0, 0.8))'
            }} 
          />
        ))}
      </div>
    </div>
  );
};

const ActionButton = ({ name, cost, effect, onClick, canAfford, isCooldown }: { name: string, cost: string, effect: string, onClick: () => void, canAfford: boolean, isCooldown?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={!canAfford || isCooldown}
    className={`w-full text-left p-2 border ${canAfford && !isCooldown ? 'border-tno-highlight hover:bg-tno-highlight hover:text-black' : 'border-gray-600 text-gray-500 cursor-not-allowed'} transition-colors relative overflow-hidden`}
  >
    <div className="font-bold">{name} {isCooldown && <span className="text-tno-red text-xs ml-2">(今日已执行)</span>}</div>
    <div className="text-xs mt-1 flex justify-between">
      <span>花费: {cost}</span>
    </div>
    <div className="text-[10px] mt-1 opacity-80">{effect}</div>
  </button>
);

export default function CentralMap({ state, setGameState, triggerError, isElectionUIOpen, setIsElectionUIOpen }: CentralMapProps) {
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);

  const isElectionMode = state.electionState?.isActive;
  const isReformMode = state.flags['map_phase_ended'];
  const isMapStruggleEnded = state.flags['map_struggle_ended'];
  const isPollingMode = state.flags['polling_stations_unlocked'];
  const isLuPurgeMode = state.flags['lu_purge_map_phase'];
  const isHaobangCommuneMode = state.flags['haobang_commune_map_phase'];
  const isGxAnarchyMode = !!state.flags['gx_anarchy_phase'];
  const currentDateStr = state.date.toISOString().split('T')[0];
  const isActionOnCooldown = (actionId: string) => state.flags[`map_action_${actionId}_last_date`] === currentDateStr;

  const getBorderColor = (control: number, locId: string) => {
    if (isGxAnarchyMode) {
      const owner = String(state.flags[`gx_map_owner_${locId}`] || 'school');
      if (owner === 'gouxiong') return '#ec4899';
      if (owner === 'left') return '#ef4444';
      return '#9ca3af';
    }
    if (isLuPurgeMode) {
      const zoneLevel = Number(state.flags[`lu_purge_zone_level_${locId}`] || 0);
      if (zoneLevel >= 3) return '#39FF14';
      if (zoneLevel >= 2) return '#f97316';
      if (zoneLevel >= 1) return '#ff3333';
      return '#555555';
    }
    if (isHaobangCommuneMode) {
      const zoneLevel = Number(state.flags[`haobang_commune_zone_level_${locId}`] || 0);
      if (zoneLevel >= 3) return '#39FF14';
      if (zoneLevel >= 2) return '#22c55e';
      if (zoneLevel >= 1) return '#84cc16';
      return '#555555';
    }
    if (isElectionMode) {
      const loc = state.mapLocations[locId];
      if (!loc.pollingData) return '#555555';
      const maxFaction = Object.entries(loc.pollingData).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      if (maxFaction === 'pan') return '#3B82F6'; // blue-500
      if (maxFaction === 'orthodox') return '#DC2626'; // red-600
      if (maxFaction === 'bear') return '#C084FC'; // purple-400
      if (maxFaction === 'testTaker') return '#9CA3AF'; // gray-400
      if (maxFaction === 'conservativeDem') return '#1E3A8A'; // blue-900
      if (maxFaction === 'otherDem') return '#06B6D4'; // cyan-500
      if (maxFaction === 'jidiTutoring') return '#CA8A04'; // yellow-600
      return '#555555';
    }
    if (state.flags['yang_yule_route_started']) {
      if (state.yangYuleState?.unlockedMechanics.map && state.yangYuleState.rebelLocations[locId]) {
        return '#FF3333'; // Red for rebellion
      }
      return '#555555'; // Gray
    }
    if (isMapStruggleEnded) return '#87CEEB'; // Light blue for reclaimed democracy
    if (isReformMode) {
      const stubbornness = state.reformState?.regionalStubbornness?.[locId === 'b1b2' ? 'B1_B2' : locId === 'admin' ? 'Admin' : locId === 'auditorium' ? 'ArtHall' : locId === 'lab' ? 'Lab' : locId === 'playground' ? 'Playground' : 'B3'] || 0;
      if (stubbornness > 70) return '#FF3333'; // High stubbornness
      if (stubbornness < 30) return '#39FF14'; // Low stubbornness
      return '#EAB308'; // Medium
    }
    if (state.flags['jidi_map_yellow']) return '#EAB308'; // Yellow
    if (state.flags['jidi_takeover_complete']) return '#FF3333'; // Red
    if (control > 55) return '#39FF14'; // Green
    if (control < 45) return '#FF3333'; // Red
    return '#555555'; // Gray
  };

  const getTextColor = (control: number, locId: string) => {
    if (isGxAnarchyMode) {
      const owner = String(state.flags[`gx_map_owner_${locId}`] || 'school');
      if (owner === 'gouxiong') return 'text-[#ec4899]';
      if (owner === 'left') return 'text-[#ef4444]';
      return 'text-[#9ca3af]';
    }
    if (isLuPurgeMode) {
      const zoneLevel = Number(state.flags[`lu_purge_zone_level_${locId}`] || 0);
      if (zoneLevel >= 3) return 'text-[#39FF14]';
      if (zoneLevel >= 2) return 'text-[#f97316]';
      if (zoneLevel >= 1) return 'text-[#ff3333]';
      return 'text-[#555555]';
    }
    if (isHaobangCommuneMode) {
      const zoneLevel = Number(state.flags[`haobang_commune_zone_level_${locId}`] || 0);
      if (zoneLevel >= 3) return 'text-[#39FF14]';
      if (zoneLevel >= 2) return 'text-[#22c55e]';
      if (zoneLevel >= 1) return 'text-[#84cc16]';
      return 'text-[#555555]';
    }
    if (isElectionMode) {
      const loc = state.mapLocations[locId];
      if (!loc.pollingData) return 'text-[#555555]';
      const maxFaction = Object.entries(loc.pollingData).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      if (maxFaction === 'pan') return 'text-blue-500';
      if (maxFaction === 'orthodox') return 'text-red-600';
      if (maxFaction === 'bear') return 'text-purple-400';
      if (maxFaction === 'testTaker') return 'text-gray-400';
      if (maxFaction === 'conservativeDem') return 'text-blue-900';
      if (maxFaction === 'otherDem') return 'text-cyan-500';
      if (maxFaction === 'jidiTutoring') return 'text-yellow-600';
      return 'text-[#555555]';
    }
    if (state.flags['yang_yule_route_started']) {
      if (state.yangYuleState?.unlockedMechanics.map && state.yangYuleState.rebelLocations[locId]) {
        return 'text-[#FF3333]'; // Red for rebellion
      }
      return 'text-[#555555]'; // Gray
    }
    if (isMapStruggleEnded) return 'text-[#87CEEB]'; // Light blue
    if (isReformMode) {
      const stubbornness = state.reformState?.regionalStubbornness?.[locId === 'b1b2' ? 'B1_B2' : locId === 'admin' ? 'Admin' : locId === 'auditorium' ? 'ArtHall' : locId === 'lab' ? 'Lab' : locId === 'playground' ? 'Playground' : 'B3'] || 0;
      if (stubbornness > 70) return 'text-[#FF3333]';
      if (stubbornness < 30) return 'text-[#39FF14]';
      return 'text-[#EAB308]';
    }
    if (state.flags['jidi_map_yellow']) return 'text-[#EAB308]';
    if (state.flags['jidi_takeover_complete']) return 'text-[#FF3333]';
    if (control > 55) return 'text-[#39FF14]';
    if (control < 45) return 'text-[#FF3333]';
    return 'text-[#555555]';
  };

  const handleAction = (locId: string, actionId: string) => {
    if (state.flags['yang_yule_route_started']) {
      if (actionId === 'suppress_rebellion' && state.yangYuleState?.rebelLocations[locId]) {
        if (state.stats.pp >= 10) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.stats.pp -= 10;
            if (newState.yangYuleState) {
              const newRebelLocations = { ...newState.yangYuleState.rebelLocations };
              delete newRebelLocations[locId];
              const newRebelCooldowns = { ...(newState.yangYuleState.rebelCooldowns || {}) };
              newRebelCooldowns[locId] = 5;
              newState.yangYuleState.rebelLocations = newRebelLocations;
              newState.yangYuleState.rebelCooldowns = newRebelCooldowns;
            }
            return newState;
          });
        } else {
          triggerError();
        }
      } else {
        triggerError();
      }
      return;
    }

    if (isPollingMode) {
      if (actionId === 'view_poll') {
        if (state.stats.pp >= 10) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.stats = { ...newState.stats, pp: newState.stats.pp - 10 };
            newState.flags = { ...newState.flags, [`poll_viewed_${locId}`]: true };
            return newState;
          });
        } else triggerError();
      } else if (actionId === 'campaign') {
        if (state.stats.pp >= 25) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.stats = { ...newState.stats, pp: newState.stats.pp - 25 };
            newState.mapLocations = { ...newState.mapLocations };
            newState.mapLocations[locId] = { ...newState.mapLocations[locId] };
            const loc = newState.mapLocations[locId];
            const candidate = newState.electionState?.playerCandidate || 'pan';
            if (loc.pollingData) {
              loc.pollingData = { ...loc.pollingData };
              loc.pollingData[candidate] = Math.min(100, (loc.pollingData[candidate] || 0) + 30);
              // Normalize
              const total = Object.values(loc.pollingData).reduce((sum, val) => (sum as number) + (val as number), 0) as number;
              Object.keys(loc.pollingData).forEach(k => {
                loc.pollingData![k] = Math.round(((loc.pollingData![k] as number) / total) * 100);
              });
            }
            return newState;
          });
        } else triggerError();
      }
      return;
    }

    if (isMapStruggleEnded && !state.flags['jidi_new_era_active'] && !isLuPurgeMode && !isHaobangCommuneMode && !isGxAnarchyMode) {
      triggerError();
      return;
    }

    if (!state.flags['rebellion_started'] && !state.flags['jidi_new_era_active'] && !isLuPurgeMode && !isHaobangCommuneMode && !isGxAnarchyMode) {
      triggerError();
      return;
    }

    const currentDateStr = state.date.toISOString().split('T')[0];
    if (state.flags[`map_action_${actionId}_last_date`] === currentDateStr) {
      triggerError();
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      const locs = { ...newState.mapLocations };
      const loc = { ...locs[locId] };
      const stats = { ...newState.stats };
      const flags = { ...newState.flags };
      const jidiCorporateState = newState.jidiCorporateState ? { ...newState.jidiCorporateState } : undefined;

      let success = true;

      switch (actionId) {
        case 'gx_anarchy_b3':
          if (flags.gx_anarchy_action_b3 && stats.pp >= 16) {
            stats.pp -= 16;
            loc.studentControl = Math.min(100, loc.studentControl + 13);
            stats.radicalAnger = Math.min(100, stats.radicalAnger + 2);
            if (loc.studentControl >= 55) flags.gx_map_owner_b3 = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_stream':
          if (flags.gx_anarchy_action_auditorium && stats.pp >= 12) {
            stats.pp -= 12;
            loc.studentControl = Math.min(100, loc.studentControl + 14);
            stats.ss = Math.min(100, stats.ss + 2);
            if (loc.studentControl >= 55) flags.gx_map_owner_auditorium = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_whiteboard':
          if (flags.gx_anarchy_action_b1b2 && stats.pp >= 10 && stats.tpr >= 20) {
            stats.pp -= 10;
            stats.tpr -= 20;
            stats.studentSanity = Math.min(100, stats.studentSanity + 2);
            loc.studentControl = Math.min(100, loc.studentControl + 12);
            if (loc.studentControl >= 55) flags.gx_map_owner_b1b2 = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_festival':
          if (flags.gx_anarchy_action_playground && stats.pp >= 14) {
            stats.pp -= 14;
            stats.allianceUnity = Math.min(100, stats.allianceUnity + 2);
            loc.studentControl = Math.min(100, loc.studentControl + 11);
            if (loc.studentControl >= 55) flags.gx_map_owner_playground = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_barrage':
          if (flags.gx_anarchy_action_lab && stats.tpr >= 30) {
            stats.tpr -= 30;
            stats.pp += 8;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            if (loc.studentControl >= 55) flags.gx_map_owner_lab = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_admin_slot':
          if (flags.gx_anarchy_action_admin && stats.pp >= 20) {
            stats.pp -= 20;
            stats.stab = Math.min(100, stats.stab + 1);
            loc.studentControl = Math.min(100, loc.studentControl + 13);
            if (loc.studentControl >= 55) flags.gx_map_owner_admin = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_admin_cutwire':
          if (flags.gx_anarchy_action_admin_cutwire && stats.pp >= 18) {
            stats.pp -= 18;
            stats.stab = Math.max(0, stats.stab - 2);
            loc.studentControl = Math.min(100, loc.studentControl + 16);
            if (loc.studentControl >= 55) flags.gx_map_owner_admin = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_lab_backdoor':
          if (flags.gx_anarchy_action_lab_backdoor && stats.tpr >= 35) {
            stats.tpr -= 35;
            stats.pp += 10;
            loc.studentControl = Math.min(100, loc.studentControl + 14);
            if (loc.studentControl >= 55) flags.gx_map_owner_lab = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_playground_swarm':
          if (flags.gx_anarchy_action_playground_swarm && stats.pp >= 16) {
            stats.pp -= 16;
            stats.allianceUnity = Math.min(100, stats.allianceUnity + 3);
            loc.studentControl = Math.min(100, loc.studentControl + 13);
            if (loc.studentControl >= 55) flags.gx_map_owner_playground = 'gouxiong';
          } else success = false;
          break;
        case 'gx_anarchy_b1b2_strike':
          if (flags.gx_anarchy_action_b1b2_strike && stats.pp >= 12) {
            stats.pp -= 12;
            stats.ss = Math.max(0, stats.ss - 1);
            loc.studentControl = Math.min(100, loc.studentControl + 15);
            if (loc.studentControl >= 55) flags.gx_map_owner_b1b2 = 'gouxiong';
          } else success = false;
          break;
        case 'auditorium_gx_garrison':
          if (!flags.gx_uprising_auditorium_garrison_used && stats.studentSanity >= 30) {
            stats.studentSanity = Math.max(0, stats.studentSanity - 30);
            loc.studentControl = Math.min(100, loc.studentControl + 50);
            flags.gx_uprising_auditorium_garrison_used = true;
          } else success = false;
          break;
        case 'jidi_sell_scrolls':
          if (stats.pp >= 10 && jidiCorporateState) {
            stats.pp -= 10;
            jidiCorporateState.gdp += 5;
            stats.studentSanity = Math.max(0, stats.studentSanity - 2);
          } else success = false;
          break;
        case 'jidi_new_oriental_lecture':
          if (stats.pp >= 20 && jidiCorporateState?.committeeState) {
            stats.pp -= 20;
            stats.tpr += 10;
            jidiCorporateState.committeeState.satisfaction.newOriental = Math.min(100, jidiCorporateState.committeeState.satisfaction.newOriental + 5);
          } else success = false;
          break;
        case 'jidi_closed_training':
          if (stats.tpr >= 50 && jidiCorporateState) {
            stats.tpr -= 50;
            jidiCorporateState.gdp += 15;
            stats.studentSanity = Math.max(0, stats.studentSanity - 5);
          } else success = false;
          break;
        case 'jidi_mandatory_subscription':
          if (stats.pp >= 30 && jidiCorporateState?.committeeState) {
            stats.pp -= 30;
            jidiCorporateState.gdp += 20;
            jidiCorporateState.committeeState.satisfaction.teachers = Math.max(0, jidiCorporateState.committeeState.satisfaction.teachers - 10);
          } else success = false;
          break;
        case 'jidi_ai_proctoring':
          if (jidiCorporateState && jidiCorporateState.gdp >= 10 && jidiCorporateState.committeeState) {
            jidiCorporateState.gdp -= 10;
            stats.stab = Math.min(100, stats.stab + 5);
            jidiCorporateState.committeeState.satisfaction.disciplineCommittee = Math.min(100, jidiCorporateState.committeeState.satisfaction.disciplineCommittee + 5);
          } else success = false;
          break;
        case 'jidi_commercial_fair':
          if (stats.stab >= 5 && jidiCorporateState) {
            stats.stab -= 5;
            jidiCorporateState.gdp += 25;
          } else success = false;
          break;
        case 'b3_underground':
          if (stats.tpr >= 20) {
            stats.tpr -= 20;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.ss = Math.min(100, stats.ss + 2);
          } else success = false;
          break;
        case 'b3_defend':
          if (stats.pp >= 50) {
            stats.pp -= 50;
            loc.defenseDays = 14;
          } else success = false;
          break;
        case 'b1b2_speech':
          if (stats.pp >= 20) {
            stats.pp -= 20;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.ss = Math.min(100, stats.ss + 5);
          } else success = false;
          break;
        case 'admin_infiltrate':
          if (stats.pp >= 30) {
            stats.pp -= 30;
            loc.studentControl = Math.min(100, loc.studentControl + 5);
            stats.capitalPenetration = Math.min(100, stats.capitalPenetration + 10);
          } else success = false;
          break;
        case 'auditorium_coopt':
          if (stats.pp >= 20) {
            stats.pp -= 20;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.allianceUnity = Math.min(100, stats.allianceUnity + 5);
          } else success = false;
          break;
        case 'lab_occupy':
          if (stats.pp >= 20) {
            stats.pp -= 20;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.tpr += 50;
          } else success = false;
          break;
        case 'playground_sports':
          if (stats.pp >= 10) {
            stats.pp -= 10;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.studentSanity = Math.min(100, stats.studentSanity + 5);
          } else success = false;
          break;
        case 'admin_hack':
          if (stats.pp >= 80) {
            stats.pp -= 80;
            const roll = Math.random() * 100;
            if (roll < stats.ss) {
              stats.ss = Math.min(100, stats.ss + 20);
            } else {
              stats.stab = Math.max(0, stats.stab - 15);
            }
          } else success = false;
          break;
        case 'admin_grades':
          if (stats.pp >= 100 && stats.tpr >= 500) {
            stats.pp -= 100;
            stats.tpr -= 500;
            const crisisIndex = newState.crises.findIndex(c => c.id === 'mock_exam');
            if (crisisIndex !== -1) {
              newState.crises[crisisIndex].daysLeft += 10;
            }
          } else success = false;
          break;
        case 'b1b2_dump':
          if (stats.stab >= 5) {
            stats.tpr += 300;
            stats.stab -= 5;
          } else success = false;
          break;
        case 'b1b2_awaken':
          if (stats.pp >= 30) {
            stats.pp -= 30;
            const conversion = loc.studentControl * 0.2;
            loc.studentControl = Math.max(0, loc.studentControl - 10);
            stats.ss = Math.min(100, stats.ss + conversion);
          } else success = false;
          break;
        case 'auditorium_protest':
          if (stats.pp >= 40) {
            stats.pp -= 40;
            if (loc.studentControl > 80) {
              locs['admin'].studentControl = Math.min(100, locs['admin'].studentControl + 15);
            }
          } else success = false;
          break;
        case 'auditorium_compromise':
          if (stats.ss >= 10) {
            stats.ss -= 10;
            stats.stab = Math.min(100, stats.stab + 15);
            stats.tpr += 200;
            loc.studentControl = Math.max(0, loc.studentControl - 20);
          } else success = false;
          break;
        case 'lab_print':
          if (stats.tpr >= 50) {
            stats.tpr -= 50;
            stats.pp += 20;
          } else success = false;
          break;
        case 'lab_guard':
          if (stats.pp >= 50) {
            stats.pp -= 50;
            loc.defenseDays = 30;
          } else success = false;
          break;
        case 'playground_strike':
          if (stats.pp >= 30 && stats.stab >= 10) {
            stats.pp -= 30;
            stats.stab -= 10;
            Object.keys(locs).forEach(k => {
              locs[k].studentControl = Math.min(100, locs[k].studentControl + 5);
            });
          } else success = false;
          break;
        case 'auditorium_salon':
          if (stats.pp >= 40) {
            stats.pp -= 40;
            loc.studentControl = Math.min(100, loc.studentControl + 15);
            stats.allianceUnity = Math.min(100, stats.allianceUnity + 5);
          } else success = false;
          break;
        case 'playground_criticism':
          if (stats.pp >= 40) {
            stats.pp -= 40;
            loc.studentControl = Math.min(100, loc.studentControl + 15);
            stats.partyCentralization = Math.min(100, stats.partyCentralization + 5);
          } else success = false;
          break;
        case 'lu_purge_b3':
          if (flags.lu_purge_action_b3 && stats.pp >= 25) {
            stats.pp -= 25;
            stats.partyCentralization = Math.min(100, stats.partyCentralization + 2);
            stats.ss = Math.max(0, stats.ss - 3);
            flags.lu_purge_zone_level_b3 = Math.min(3, Number(flags.lu_purge_zone_level_b3 || 0) + 1);
            flags.lu_purge_map_actions = (flags.lu_purge_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'lu_purge_admin':
          if (flags.lu_purge_action_admin && stats.pp >= 30) {
            stats.pp -= 30;
            stats.stab = Math.min(100, stats.stab + 2);
            stats.allianceUnity = Math.max(0, stats.allianceUnity - 2);
            flags.lu_purge_zone_level_admin = Math.min(3, Number(flags.lu_purge_zone_level_admin || 0) + 1);
            flags.lu_purge_map_actions = (flags.lu_purge_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'lu_purge_b1b2':
          if (flags.lu_purge_action_b1b2 && stats.pp >= 15) {
            stats.pp -= 15;
            stats.studentSanity = Math.max(0, stats.studentSanity - 4);
            stats.tpr += 40;
            flags.lu_purge_zone_level_b1b2 = Math.min(3, Number(flags.lu_purge_zone_level_b1b2 || 0) + 1);
            flags.lu_purge_map_actions = (flags.lu_purge_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'lu_purge_lab':
          if (flags.lu_purge_action_lab && stats.tpr >= 60) {
            stats.tpr -= 60;
            stats.pp += 15;
            flags.lu_purge_zone_level_lab = Math.min(3, Number(flags.lu_purge_zone_level_lab || 0) + 1);
            flags.lu_purge_map_actions = (flags.lu_purge_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'lu_purge_playground':
          if (flags.lu_purge_action_playground && stats.pp >= 20) {
            stats.pp -= 20;
            stats.stab = Math.min(100, stats.stab + 3);
            stats.studentSanity = Math.max(0, stats.studentSanity - 3);
            flags.lu_purge_zone_level_playground = Math.min(3, Number(flags.lu_purge_zone_level_playground || 0) + 1);
            flags.lu_purge_map_actions = (flags.lu_purge_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'lu_purge_auditorium':
          if (flags.lu_purge_action_auditorium && stats.pp >= 18) {
            stats.pp -= 18;
            stats.partyCentralization = Math.min(100, stats.partyCentralization + 1.5);
            stats.ss = Math.max(0, stats.ss - 4);
            flags.lu_purge_zone_level_auditorium = Math.min(3, Number(flags.lu_purge_zone_level_auditorium || 0) + 1);
            flags.lu_purge_map_actions = (flags.lu_purge_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'commune_build_b3':
          if (flags.haobang_commune_action_b3 && stats.pp >= 15) {
            stats.pp -= 15;
            loc.studentControl = Math.min(100, loc.studentControl + 12);
            stats.studentSanity = Math.min(100, stats.studentSanity + 2);
            flags.haobang_commune_zone_level_b3 = Math.min(3, Number(flags.haobang_commune_zone_level_b3 || 0) + 1);
            flags.haobang_commune_map_actions = (flags.haobang_commune_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'commune_build_b1b2':
          if (flags.haobang_commune_action_b1b2 && stats.pp >= 10) {
            stats.pp -= 10;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.tpr += 30;
            flags.haobang_commune_zone_level_b1b2 = Math.min(3, Number(flags.haobang_commune_zone_level_b1b2 || 0) + 1);
            flags.haobang_commune_map_actions = (flags.haobang_commune_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'commune_build_lab':
          if (flags.haobang_commune_action_lab && stats.tpr >= 40) {
            stats.tpr -= 40;
            loc.studentControl = Math.min(100, loc.studentControl + 8);
            stats.pp += 10;
            flags.haobang_commune_zone_level_lab = Math.min(3, Number(flags.haobang_commune_zone_level_lab || 0) + 1);
            flags.haobang_commune_map_actions = (flags.haobang_commune_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'commune_build_admin':
          if (flags.haobang_commune_action_admin && stats.pp >= 20) {
            stats.pp -= 20;
            loc.studentControl = Math.min(100, loc.studentControl + 9);
            stats.stab = Math.min(100, stats.stab + 2);
            flags.haobang_commune_zone_level_admin = Math.min(3, Number(flags.haobang_commune_zone_level_admin || 0) + 1);
            flags.haobang_commune_map_actions = (flags.haobang_commune_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'commune_build_playground':
          if (flags.haobang_commune_action_playground && stats.pp >= 12) {
            stats.pp -= 12;
            loc.studentControl = Math.min(100, loc.studentControl + 8);
            stats.allianceUnity = Math.min(100, stats.allianceUnity + 4);
            flags.haobang_commune_zone_level_playground = Math.min(3, Number(flags.haobang_commune_zone_level_playground || 0) + 1);
            flags.haobang_commune_map_actions = (flags.haobang_commune_map_actions || 0) + 1;
          } else success = false;
          break;
        case 'commune_build_auditorium':
          if (flags.haobang_commune_action_auditorium && stats.pp >= 15) {
            stats.pp -= 15;
            loc.studentControl = Math.min(100, loc.studentControl + 10);
            stats.ss = Math.min(100, stats.ss + 4);
            flags.haobang_commune_zone_level_auditorium = Math.min(3, Number(flags.haobang_commune_zone_level_auditorium || 0) + 1);
            flags.haobang_commune_map_actions = (flags.haobang_commune_map_actions || 0) + 1;
          } else success = false;
          break;
      }

      if (!success) {
        triggerError();
        return prev;
      }

      flags[`map_action_${actionId}_last_date`] = currentDateStr;
      locs[locId] = loc;
      newState.mapLocations = locs;
      newState.stats = stats;
      newState.flags = flags;
      if (jidiCorporateState) newState.jidiCorporateState = jidiCorporateState;
      return newState;
    });
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[#0A0A0A] border-2 border-tno-panel m-4 flex items-center justify-center">
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <h2 className="text-3xl font-bold text-tno-highlight crt-flicker tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {isElectionMode ? '合肥一中首届普选' : isGxAnarchyMode ? '无 政 府 战 区 地 图' : state.flags['lu_purge_map_phase'] ? 'N K P D 校 园 清 洗 图' : isHaobangCommuneMode ? '学 生 公 社 建 设 图' : state.flags['yang_yule_route_started'] ? '合肥一中校园地图' : isReformMode ? '全面做题改革委员会' : isPollingMode ? '合一普选站网络' : '合肥一中校园地图'}
        </h2>
        <div className="text-sm text-tno-text/80 mt-1">
          {isElectionMode ? (
            <span className="text-blue-400 animate-pulse">大选进行中 - 剩余 {state.electionState?.daysLeft} 天</span>
          ) : isGxAnarchyMode ? (
            <span className="text-pink-400 animate-pulse">当前阶段：无政府内战</span>
          ) : state.flags['lu_purge_map_phase'] ? (
            <span className="text-red-400 animate-pulse">当前阶段：大清洗分区推进</span>
          ) : isHaobangCommuneMode ? (
            <span className="text-[#84cc16] animate-pulse">当前阶段：学生公社地区建设</span>
          ) : state.flags['yang_yule_route_started'] ? (
            state.yangYuleState?.unlockedMechanics.map ? (
              <span className="text-tno-red animate-pulse">警告：王兆凯与“钢铁红蛤”正在地下活动</span>
            ) : (
              '当前局势：表面平静'
            )
          ) : isReformMode ? (
            '当前阶段：推进改革任务'
          ) : isPollingMode ? (
            '当前阶段：民主选举与民意调查'
          ) : isMapStruggleEnded ? (
            '当前阶段：和平重建'
          ) : state.flags['jidi_takeover_complete'] ? (
            '当前阶段：及第教育全面接管'
          ) : state.flags['rebellion_started'] ? (
            '当前阶段：武装起义'
          ) : (
            '当前阶段：地下串联'
          )}
        </div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none animate-scanline-sweep opacity-30 bg-gradient-to-b from-transparent via-[#39FF14] to-transparent h-10 w-full"></div>

      {/* Map Container to keep aspect ratio */}
      <div className="relative w-full max-w-4xl aspect-[16/9]">
        {/* Election Tally Overlay */}
        {isElectionMode && state.electionState && isElectionUIOpen && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 border-2 border-blue-500 p-4 text-center min-w-[350px] backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.5)] rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">全国大选实时计票</h3>
              {setIsElectionUIOpen && (
                <button onClick={() => setIsElectionUIOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {Object.entries(state.electionState.votes)
                .sort((a, b) => b[1] - a[1])
                .map(([faction, votes], index) => {
                  const factionNames: Record<string, string> = {
                    pan: '温和民主派 (潘仁越)',
                    orthodox: '钢铁红蛤正统派 (王兆凯)',
                    conservativeDem: '保守民主派 (徐志)',
                    bear: '狗熊派 (狗熊)',
                    testTaker: '做题派 (王卷豪)'
                  };
                  const factionColors: Record<string, string> = {
                    pan: 'text-blue-500',
                    orthodox: 'text-red-600',
                    conservativeDem: 'text-blue-900',
                    bear: 'text-purple-400',
                    testTaker: 'text-gray-400'
                  };
                  return (
                    <div key={faction} className="flex justify-between items-center text-sm">
                      <span className={`${factionColors[faction]} ${index === 0 ? 'font-bold text-base drop-shadow-[0_0_5px_currentColor]' : ''}`}>
                        {index === 0 && '👑 '}
                        {factionNames[faction]}
                      </span>
                      <span className="font-mono text-white text-lg">{Math.round(votes)} <span className="text-xs text-gray-400">票</span></span>
                    </div>
                  );
                })}
            </div>
            {/* Total progress bar */}
            <div className="mt-6 w-full h-4 bg-white/20 flex overflow-hidden rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] relative">
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              {Object.entries(state.electionState.votes).map(([faction, votes]) => {
                const bgColors: Record<string, string> = {
                  pan: 'bg-blue-500',
                  orthodox: 'bg-red-600',
                  conservativeDem: 'bg-blue-900',
                  bear: 'bg-purple-400',
                  testTaker: 'bg-gray-400'
                };
                const totalPossibleVotes = Object.values(state.mapLocations).reduce((sum, loc) => sum + (loc.totalVotes || 1000), 0);
                const width = `${(votes / totalPossibleVotes) * 100}%`;
                return <div key={faction} className={`h-full ${bgColors[faction]} transition-all duration-1000 ease-out`} style={{ width }} />;
              })}
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right font-mono">
              已投: {Math.round(Object.values(state.electionState.votes).reduce((a, b) => a + b, 0))} / {Object.values(state.mapLocations).reduce((sum, loc) => sum + (loc.totalVotes || 1000), 0)}
            </div>
          </div>
        )}

        {/* Buildings */}
        {Object.values(state.mapLocations).map(loc => {
          let style: React.CSSProperties = {};
          switch(loc.id) {
            case 'admin': style = { top: '10%', left: '40%', width: '20%', height: '15%' }; break;
            case 'b1b2': style = { top: '30%', left: '10%', width: '25%', height: '30%' }; break;
            case 'b3': style = { top: '30%', left: '65%', width: '25%', height: '25%' }; break;
            case 'auditorium': style = { top: '70%', left: '40%', width: '20%', height: '20%' }; break;
            case 'lab': style = { top: '65%', left: '15%', width: '15%', height: '15%' }; break;
            case 'playground': style = { top: '10%', left: '10%', width: '25%', height: '15%' }; break;
          }

          const borderColor = getBorderColor(loc.studentControl, loc.id);
          const isSelected = selectedLoc === loc.id;
          
          const reformLocId = loc.id === 'b1b2' ? 'B1_B2' : loc.id === 'admin' ? 'Admin' : loc.id === 'auditorium' ? 'ArtHall' : loc.id === 'lab' ? 'Lab' : loc.id === 'playground' ? 'Playground' : 'B3';
          const stubbornness = state.reformState?.regionalStubbornness?.[reformLocId] || 0;
          const activeMission = state.reformState?.activeMissions?.[reformLocId];

          let fireIntensity = 0;
          if (state.flags['jidi_riot_active'] && state.jidiCorporateState?.riotState) {
            const progress = state.jidiCorporateState.riotState.progress;
            if (loc.id === 'playground' && progress > 10) fireIntensity = progress;
            if (loc.id === 'b1b2' && progress > 30) fireIntensity = progress;
            if (loc.id === 'b3' && progress > 50) fireIntensity = progress;
            if (loc.id === 'auditorium' && progress > 70) fireIntensity = progress;
            if (loc.id === 'lab' && progress > 80) fireIntensity = progress;
            if (loc.id === 'admin' && progress > 90) fireIntensity = progress;
          }

          return (
            <div 
              key={loc.id}
              className={`absolute border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md
                ${isSelected ? 'z-20 scale-105' : 'z-10 hover:z-20 hover:scale-105'}
              `}
              style={{
                ...style,
                borderColor,
                boxShadow: isSelected || state.flags['rebellion_started'] ? `0 0 15px ${borderColor} inset, 0 0 15px ${borderColor}` : 'none',
              }}
              onClick={() => setSelectedLoc(loc.id)}
            >
              <FireEffect intensity={fireIntensity} />
              <div className="text-xs font-bold text-center px-1 bg-black/80 w-full border-b border-current z-10" style={{ borderColor }}>
                {loc.name}
              </div>
              <div className={`text-xl font-bold mt-1 crt-flicker z-10 drop-shadow-[0_0_5px_currentColor] ${getTextColor(loc.studentControl, loc.id)}`}>
                {isElectionMode && loc.pollingData ? (
                  `${Math.max(...Object.values(loc.pollingData))}%`
                ) : isLuPurgeMode ? `清洗度: ${Math.round((Number(state.flags[`lu_purge_zone_level_${loc.id}`] || 0) / 3) * 100)}%` : isHaobangCommuneMode ? `建设度: ${Math.round((Number(state.flags[`haobang_commune_zone_level_${loc.id}`] || 0) / 3) * 100)}%` : isReformMode ? `顽固度: ${Math.round(stubbornness)}%` : `${Math.round(loc.studentControl)}%`}
              </div>
              {!isReformMode && loc.defenseDays > 0 && (
                <div className="absolute -top-2 -right-2 bg-tno-highlight text-black text-[10px] px-1 font-bold z-10">
                  DEF: {loc.defenseDays}d
                </div>
              )}
              {isReformMode && activeMission && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1 font-bold animate-pulse z-10">
                  任务中: {activeMission.daysLeft}d
                </div>
              )}
              {isElectionMode && (
                <div className="absolute bottom-0 left-0 w-full h-3 bg-white/20 flex overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.2)_inset]">
                  {loc.castVotes && Object.entries(loc.castVotes).map(([faction, votes]) => {
                    const bgColors: Record<string, string> = {
                      pan: 'bg-blue-500',
                      orthodox: 'bg-red-600',
                      conservativeDem: 'bg-blue-900',
                      bear: 'bg-purple-400',
                      testTaker: 'bg-gray-400'
                    };
                    const width = `${((votes as number) / (loc.totalVotes || 1000)) * 100}%`;
                    return <div key={faction} className={`h-full ${bgColors[faction]} transition-all duration-1000 ease-out`} style={{ width }} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interaction Panel */}
      {selectedLoc && (
        <div className="absolute right-4 top-4 bottom-4 w-80 bg-black/90 border-2 border-tno-panel p-4 flex flex-col z-30 crt">
          <div className="flex justify-between items-center mb-4 border-b border-tno-panel pb-2">
            <h3 className="text-tno-highlight font-bold text-lg">{state.mapLocations[selectedLoc].name}</h3>
            <button onClick={() => setSelectedLoc(null)} className="text-tno-red hover:text-white">✕</button>
          </div>
          
          {state.flags['lu_purge_map_phase'] ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>肃反进度:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {Math.round((Number(state.flags[`lu_purge_zone_level_${selectedLoc}`] || 0) / 3) * 100)}%
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                累计地区行动：{state.flags.lu_purge_map_actions || 0} 次。完成更多地区行动可解锁后续收束国策。
              </div>
            </div>
          ) : isHaobangCommuneMode ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>公社建设进度:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {Math.round((Number(state.flags[`haobang_commune_zone_level_${selectedLoc}`] || 0) / 3) * 100)}%
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                累计建设行动：{state.flags.haobang_commune_map_actions || 0} 次。后续国策将逐步开放全部地区建设权限。
              </div>
            </div>
          ) : isGxAnarchyMode ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>区域控制方:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {(() => {
                    const owner = String(state.flags[`gx_map_owner_${selectedLoc}`] || 'school');
                    if (owner === 'gouxiong') return '狗熊派';
                    if (owner === 'left') return '钢铁红蛤/自由派';
                    return '校方';
                  })()}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>狗熊渗透度:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {Math.round(state.mapLocations[selectedLoc].studentControl)}%
                </span>
              </div>
              <p className="text-gray-400 mt-2 text-xs">
                三方势力会每日自动争夺地盘。你可通过放番剧、解放希沃白板使用期限与广播渗透逆转战局。
              </p>
            </div>
          ) : state.flags['yang_yule_route_started'] ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>区域状态:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {state.yangYuleState?.unlockedMechanics.map && state.yangYuleState.rebelLocations[selectedLoc] ? '红蛤暴动中' : '平静'}
                </span>
              </div>
              <p className="text-gray-400 mt-2 text-xs">
                {state.yangYuleState?.unlockedMechanics.map && state.yangYuleState.rebelLocations[selectedLoc] ? `暴动倒计时: ${state.yangYuleState.rebelLocations[selectedLoc]} 天` : '目前该区域没有发现地下抵抗组织的活动迹象。'}
              </p>
            </div>
          ) : isReformMode ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>做题派顽固度:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {Math.round(state.reformState?.regionalStubbornness?.[selectedLoc === 'b1b2' ? 'B1_B2' : selectedLoc === 'admin' ? 'Admin' : selectedLoc === 'auditorium' ? 'ArtHall' : selectedLoc === 'lab' ? 'Lab' : selectedLoc === 'playground' ? 'Playground' : 'B3'] || 0)}%
                </span>
              </div>
              <p className="text-gray-400 mt-2 text-xs">
                {selectedLoc === 'b3' && '高三核心区。顽固度极高，但攻克后收益巨大。'}
                {selectedLoc === 'admin' && '旧官僚与资本残余。顽固度最高，是改革的最大阻力。'}
                {selectedLoc === 'b1b2' && '高一高二区。思想较为活跃，适合进行新思想宣讲。'}
                {selectedLoc === 'auditorium' && '宣传阵地。降低顽固度可提升全校改革氛围。'}
                {selectedLoc === 'lab' && '技术与信息中心。接管这里可以提升全校任务成功率。'}
                {selectedLoc === 'playground' && '集会区。适合进行大规模的群众运动。'}
              </p>
            </div>
          ) : isPollingMode ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>区域状态:</span>
                <span className="text-[#87CEEB]">
                  普选站已建立
                </span>
              </div>
              <p className="text-gray-400 mt-2 text-xs">
                {selectedLoc === 'b3' && '高三区。做题派和狗熊派的铁票仓。'}
                {selectedLoc === 'admin' && '校方中枢。保守民主派和正统派支持率极高。'}
                {selectedLoc === 'b1b2' && '高一高二区。潘仁越民主派较为活跃。'}
                {selectedLoc === 'auditorium' && '宣传阵地。非建制民主派的票仓。'}
                {selectedLoc === 'lab' && '技术与信息中心。及第补习派和做题派势力较大。'}
                {selectedLoc === 'playground' && '集会区。狗熊派和潘仁越民主派的基本盘。'}
              </p>
              {state.flags[`poll_viewed_${selectedLoc}`] && state.mapLocations[selectedLoc].pollingData && (
                <div className="mt-4">
                  <h4 className="text-tno-highlight font-bold text-xs mb-2">最新民调结果:</h4>
                  <div className="text-xs text-gray-300 mb-2">
                    总选票数: {state.mapLocations[selectedLoc].totalVotes || '未知'}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-20 h-20 rounded-full border border-gray-600 shrink-0"
                      style={{ 
                        background: `conic-gradient(${
                          (() => {
                            const factionColors: Record<string, string> = {
                              pan: '#3b82f6',
                              orthodox: '#ef4444',
                              bear: '#d946ef',
                              otherDem: '#06b6d4',
                              testTaker: '#9ca3af',
                              conservativeDem: '#4f46e5',
                              jidiTutoring: '#ca8a04'
                            };
                            let currentAngle = 0;
                            return Object.entries(state.mapLocations[selectedLoc].pollingData!).map(([faction, support]) => {
                              const start = currentAngle;
                              currentAngle += support;
                              return `${factionColors[faction] || '#888'} ${start}% ${currentAngle}%`;
                            }).join(', ');
                          })()
                        })` 
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      {Object.entries(state.mapLocations[selectedLoc].pollingData!).map(([faction, support]) => {
                        const factionNames: Record<string, string> = {
                          pan: '潘仁越民主派',
                          orthodox: '正统派',
                          bear: '狗熊派',
                          otherDem: '非建制民主派',
                          testTaker: '做题派',
                          conservativeDem: '保守民主派',
                          jidiTutoring: '及第补习派'
                        };
                        const factionColors: Record<string, string> = {
                          pan: '#3b82f6',
                          orthodox: '#ef4444',
                          bear: '#d946ef',
                          otherDem: '#06b6d4',
                          testTaker: '#9ca3af',
                          conservativeDem: '#4f46e5',
                          jidiTutoring: '#ca8a04'
                        };
                        return (
                          <div key={faction} className="flex justify-between text-[10px] items-center">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: factionColors[faction] || '#888' }} />
                              <span>{factionNames[faction] || faction}</span>
                            </div>
                            <span>{support}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : isMapStruggleEnded ? (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>区域状态:</span>
                <span className="text-[#87CEEB]">
                  完全控制
                </span>
              </div>
              <p className="text-gray-400 mt-2 text-xs">
                校园已完全控制，等待进一步的民主改革。
              </p>
            </div>
          ) : (
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>控制权:</span>
                <span className={getTextColor(state.mapLocations[selectedLoc].studentControl, selectedLoc)}>
                  {Math.round(state.mapLocations[selectedLoc].studentControl)}% (学生)
                </span>
              </div>
              {/* Description based on location */}
              <p className="text-gray-400 mt-2 text-xs">
                {selectedLoc === 'b3' && '革命策源地。控制度>50%时，每日SS+0.5%。控制度100%时，每日稳定度+0.1。'}
                {selectedLoc === 'admin' && '全景监控塔。被校方控制时，每日稳定度-0.2%。控制度100%时，每日PP+0.5。'}
                {selectedLoc === 'b1b2' && '做题家大本营。控制度越高，每日TPR产出越高。控制度100%时，每日TPR+10。'}
                {selectedLoc === 'auditorium' && '意识形态斗争场。控制度100%时，每日SS+0.1。'}
                {selectedLoc === 'lab' && '地下黑市与印刷厂。控制度100%时，每日学生理智值+0.1。'}
                {selectedLoc === 'playground' && '群体狂热区。控制度100%时，每日稳定度+0.1。'}
              </p>
              {state.mapLocations[selectedLoc].studentControl >= 100 && (
                <div className="mt-2 text-tno-highlight font-bold text-xs border border-tno-highlight bg-tno-highlight/10 p-1 text-center">
                  [地区完全控制 Buff 激活]
                </div>
              )}
              {state.flags['united_committee_established'] && (
                <p className="text-[#39FF14] mt-1 text-[10px] crt-flicker">
                  [联合革命委员会已成立] 区域控制度达到100%时，校方渗透将永久停止。
                </p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3">
            {isGxAnarchyMode ? (
              <>
                {selectedLoc === 'b3' && (
                  <ActionButton
                    name="B3游击放映"
                    cost="16 PP"
                    effect="狗熊渗透度 +13，激进愤怒度 +2"
                    onClick={() => handleAction('b3', 'gx_anarchy_b3')}
                    canAfford={!!state.flags.gx_anarchy_action_b3 && state.stats.pp >= 16}
                    isCooldown={isActionOnCooldown('gx_anarchy_b3')}
                  />
                )}
                {selectedLoc === 'auditorium' && (
                  <ActionButton
                    name="放映番剧动员"
                    cost="12 PP"
                    effect="狗熊渗透度 +14，学生支持度 +2"
                    onClick={() => handleAction('auditorium', 'gx_anarchy_stream')}
                    canAfford={!!state.flags.gx_anarchy_action_auditorium && state.stats.pp >= 12}
                    isCooldown={isActionOnCooldown('gx_anarchy_stream')}
                  />
                )}
                {selectedLoc === 'b1b2' && (
                  <ActionButton
                    name="解放希沃白板使用期限"
                    cost="10 PP + 20 TPR"
                    effect="狗熊渗透度 +12，学生理智值 +2"
                    onClick={() => handleAction('b1b2', 'gx_anarchy_whiteboard')}
                    canAfford={!!state.flags.gx_anarchy_action_b1b2 && state.stats.pp >= 10 && state.stats.tpr >= 20}
                    isCooldown={isActionOnCooldown('gx_anarchy_whiteboard')}
                  />
                )}
                {selectedLoc === 'b1b2' && state.flags.gx_anarchy_action_b1b2_strike && (
                  <ActionButton
                    name="B1/B2突袭占线"
                    cost="12 PP"
                    effect="狗熊渗透度 +15，学生支持度 -1"
                    onClick={() => handleAction('b1b2', 'gx_anarchy_b1b2_strike')}
                    canAfford={state.stats.pp >= 12}
                    isCooldown={isActionOnCooldown('gx_anarchy_b1b2_strike')}
                  />
                )}
                {selectedLoc === 'playground' && (
                  <ActionButton
                    name="组织露天漫展"
                    cost="14 PP"
                    effect="狗熊渗透度 +11，联盟团结度 +2"
                    onClick={() => handleAction('playground', 'gx_anarchy_festival')}
                    canAfford={!!state.flags.gx_anarchy_action_playground && state.stats.pp >= 14}
                    isCooldown={isActionOnCooldown('gx_anarchy_festival')}
                  />
                )}
                {selectedLoc === 'playground' && state.flags.gx_anarchy_action_playground_swarm && (
                  <ActionButton
                    name="操场蜂群快闪"
                    cost="16 PP"
                    effect="狗熊渗透度 +13，联盟团结度 +3"
                    onClick={() => handleAction('playground', 'gx_anarchy_playground_swarm')}
                    canAfford={state.stats.pp >= 16}
                    isCooldown={isActionOnCooldown('gx_anarchy_playground_swarm')}
                  />
                )}
                {selectedLoc === 'lab' && (
                  <ActionButton
                    name="注入弹幕脚本"
                    cost="30 TPR"
                    effect="狗熊渗透度 +10，政治点数 +8"
                    onClick={() => handleAction('lab', 'gx_anarchy_barrage')}
                    canAfford={!!state.flags.gx_anarchy_action_lab && state.stats.tpr >= 30}
                    isCooldown={isActionOnCooldown('gx_anarchy_barrage')}
                  />
                )}
                {selectedLoc === 'lab' && state.flags.gx_anarchy_action_lab_backdoor && (
                  <ActionButton
                    name="实验楼后门注入"
                    cost="35 TPR"
                    effect="狗熊渗透度 +14，政治点数 +10"
                    onClick={() => handleAction('lab', 'gx_anarchy_lab_backdoor')}
                    canAfford={state.stats.tpr >= 35}
                    isCooldown={isActionOnCooldown('gx_anarchy_lab_backdoor')}
                  />
                )}
                {selectedLoc === 'admin' && (
                  <ActionButton
                    name="抢占广播时隙"
                    cost="20 PP"
                    effect="狗熊渗透度 +13，稳定度 +1"
                    onClick={() => handleAction('admin', 'gx_anarchy_admin_slot')}
                    canAfford={!!state.flags.gx_anarchy_action_admin && state.stats.pp >= 20}
                    isCooldown={isActionOnCooldown('gx_anarchy_admin_slot')}
                  />
                )}
                {selectedLoc === 'admin' && state.flags.gx_anarchy_action_admin_cutwire && (
                  <ActionButton
                    name="行政楼断电战术"
                    cost="18 PP"
                    effect="狗熊渗透度 +16，稳定度 -2"
                    onClick={() => handleAction('admin', 'gx_anarchy_admin_cutwire')}
                    canAfford={state.stats.pp >= 18}
                    isCooldown={isActionOnCooldown('gx_anarchy_admin_cutwire')}
                  />
                )}
                {((selectedLoc === 'auditorium' && !state.flags.gx_anarchy_action_auditorium) ||
                  (selectedLoc === 'b3' && !state.flags.gx_anarchy_action_b3) ||
                  (selectedLoc === 'b1b2' && !state.flags.gx_anarchy_action_b1b2) ||
                  (selectedLoc === 'playground' && !state.flags.gx_anarchy_action_playground) ||
                  (selectedLoc === 'lab' && !state.flags.gx_anarchy_action_lab) ||
                  (selectedLoc === 'admin' && !state.flags.gx_anarchy_action_admin)) && (
                  <div className="text-tno-red text-center mt-10 animate-pulse">
                    [行动锁定] 需要先完成对应的无政府阶段国策。
                  </div>
                )}
              </>
            ) : state.flags['lu_purge_map_phase'] ? (
              <>
                {selectedLoc === 'b3' && (
                  <ActionButton
                    name="B3定点清洗"
                    cost="25 PP"
                    effect="提升B3清洗度，党内集权度 +2，学生支持度 -3"
                    onClick={() => handleAction('b3', 'lu_purge_b3')}
                    canAfford={!!state.flags.lu_purge_action_b3 && state.stats.pp >= 25}
                    isCooldown={isActionOnCooldown('lu_purge_b3')}
                  />
                )}
                {selectedLoc === 'admin' && (
                  <ActionButton
                    name="行政楼审查"
                    cost="30 PP"
                    effect="提升行政楼清洗度，稳定度 +2，联盟团结度 -2"
                    onClick={() => handleAction('admin', 'lu_purge_admin')}
                    canAfford={!!state.flags.lu_purge_action_admin && state.stats.pp >= 30}
                    isCooldown={isActionOnCooldown('lu_purge_admin')}
                  />
                )}
                {selectedLoc === 'b1b2' && (
                  <ActionButton
                    name="走廊筛查"
                    cost="15 PP"
                    effect="提升B1/B2清洗度，学生理智值 -4，做题产出 +40"
                    onClick={() => handleAction('b1b2', 'lu_purge_b1b2')}
                    canAfford={!!state.flags.lu_purge_action_b1b2 && state.stats.pp >= 15}
                    isCooldown={isActionOnCooldown('lu_purge_b1b2')}
                  />
                )}
                {selectedLoc === 'lab' && (
                  <ActionButton
                    name="实验楼取证"
                    cost="60 TPR"
                    effect="提升实验楼清洗度，政治点数 +15"
                    onClick={() => handleAction('lab', 'lu_purge_lab')}
                    canAfford={!!state.flags.lu_purge_action_lab && state.stats.tpr >= 60}
                    isCooldown={isActionOnCooldown('lu_purge_lab')}
                  />
                )}
                {selectedLoc === 'playground' && (
                  <ActionButton
                    name="操场示众"
                    cost="20 PP"
                    effect="提升操场清洗度，稳定度 +3，学生理智值 -3"
                    onClick={() => handleAction('playground', 'lu_purge_playground')}
                    canAfford={!!state.flags.lu_purge_action_playground && state.stats.pp >= 20}
                    isCooldown={isActionOnCooldown('lu_purge_playground')}
                  />
                )}
                {selectedLoc === 'auditorium' && (
                  <ActionButton
                    name="礼堂公审"
                    cost="18 PP"
                    effect="提升礼堂清洗度，党内集权度 +1.5，学生支持度 -4"
                    onClick={() => handleAction('auditorium', 'lu_purge_auditorium')}
                    canAfford={!!state.flags.lu_purge_action_auditorium && state.stats.pp >= 18}
                    isCooldown={isActionOnCooldown('lu_purge_auditorium')}
                  />
                )}
                {(!state.flags[`lu_purge_action_${selectedLoc}`] && selectedLoc !== 'b1b2') || (selectedLoc === 'b1b2' && !state.flags.lu_purge_action_b1b2) ? (
                  <div className="text-tno-red text-center mt-10 animate-pulse">
                    [行动锁定] 需要先完成对应的大清洗分支国策。
                  </div>
                ) : null}
              </>
            ) : isHaobangCommuneMode ? (
              <>
                {selectedLoc === 'b3' && (
                  <ActionButton
                    name="建设B3学习公社"
                    cost="15 PP"
                    effect="提升B3建设度，学生控制度 +12，学生理智值 +2"
                    onClick={() => handleAction('b3', 'commune_build_b3')}
                    canAfford={!!state.flags.haobang_commune_action_b3 && state.stats.pp >= 15}
                    isCooldown={isActionOnCooldown('commune_build_b3')}
                  />
                )}
                {selectedLoc === 'b1b2' && (
                  <ActionButton
                    name="建设B1/B2互助公社"
                    cost="10 PP"
                    effect="提升B1/B2建设度，学生控制度 +10，做题产出 +30"
                    onClick={() => handleAction('b1b2', 'commune_build_b1b2')}
                    canAfford={!!state.flags.haobang_commune_action_b1b2 && state.stats.pp >= 10}
                    isCooldown={isActionOnCooldown('commune_build_b1b2')}
                  />
                )}
                {selectedLoc === 'lab' && (
                  <ActionButton
                    name="建设实验楼技术公社"
                    cost="40 TPR"
                    effect="提升实验楼建设度，学生控制度 +8，政治点数 +10"
                    onClick={() => handleAction('lab', 'commune_build_lab')}
                    canAfford={!!state.flags.haobang_commune_action_lab && state.stats.tpr >= 40}
                    isCooldown={isActionOnCooldown('commune_build_lab')}
                  />
                )}
                {selectedLoc === 'admin' && (
                  <ActionButton
                    name="建设行政楼治理公社"
                    cost="20 PP"
                    effect="提升行政楼建设度，学生控制度 +9，稳定度 +2"
                    onClick={() => handleAction('admin', 'commune_build_admin')}
                    canAfford={!!state.flags.haobang_commune_action_admin && state.stats.pp >= 20}
                    isCooldown={isActionOnCooldown('commune_build_admin')}
                  />
                )}
                {selectedLoc === 'playground' && (
                  <ActionButton
                    name="建设操场自治公社"
                    cost="12 PP"
                    effect="提升操场建设度，学生控制度 +8，联盟团结度 +4"
                    onClick={() => handleAction('playground', 'commune_build_playground')}
                    canAfford={!!state.flags.haobang_commune_action_playground && state.stats.pp >= 12}
                    isCooldown={isActionOnCooldown('commune_build_playground')}
                  />
                )}
                {selectedLoc === 'auditorium' && (
                  <ActionButton
                    name="建设礼堂协商公社"
                    cost="15 PP"
                    effect="提升礼堂建设度，学生控制度 +10，学生支持度 +4"
                    onClick={() => handleAction('auditorium', 'commune_build_auditorium')}
                    canAfford={!!state.flags.haobang_commune_action_auditorium && state.stats.pp >= 15}
                    isCooldown={isActionOnCooldown('commune_build_auditorium')}
                  />
                )}
                {((selectedLoc === 'b3' && !state.flags.haobang_commune_action_b3) ||
                  (selectedLoc === 'b1b2' && !state.flags.haobang_commune_action_b1b2) ||
                  (selectedLoc === 'lab' && !state.flags.haobang_commune_action_lab) ||
                  (selectedLoc === 'admin' && !state.flags.haobang_commune_action_admin) ||
                  (selectedLoc === 'playground' && !state.flags.haobang_commune_action_playground) ||
                  (selectedLoc === 'auditorium' && !state.flags.haobang_commune_action_auditorium)) && (
                  <div className="text-tno-red text-center mt-10 animate-pulse">
                    [建设锁定] 需要先完成对应的后续公社国策。
                  </div>
                )}
              </>
            ) : state.flags['yang_yule_route_started'] ? (
              state.yangYuleState?.unlockedMechanics.map ? (
                state.yangYuleState.rebelLocations[selectedLoc] ? (
                  <ActionButton 
                    name="镇压红蛤" cost="10 PP" effect="平息该区域的暴动" 
                    onClick={() => handleAction(selectedLoc, 'suppress_rebellion')} 
                    canAfford={state.stats.pp >= 10} 
                    isCooldown={false}
                  />
                ) : (
                  <div className="text-[#555555] text-center mt-10">
                    [该区域目前无需镇压]
                  </div>
                )
              ) : (
                <div className="text-tno-red text-center mt-10 animate-pulse">
                  [系统锁定] 需要完成特定国策以解锁区域交互。
                </div>
              )
            ) : isReformMode ? (
              <div className="text-tno-highlight text-center mt-10">
                请在“全面做题改革委员会”界面分配任务。
              </div>
            ) : isPollingMode ? (
              <>
                <ActionButton 
                  name="查看民调" cost="10 PP" effect="查看该区域的党派支持度分布" 
                  onClick={() => handleAction(selectedLoc, 'view_poll')} 
                  canAfford={state.stats.pp >= 10} 
                  isCooldown={false}
                />
                <ActionButton 
                  name="区域拉票" cost="25 PP" effect={`大幅增加${state.electionState?.playerCandidate === 'orthodox' ? '王兆凯' : state.electionState?.playerCandidate === 'conservativeDem' ? '徐志' : state.electionState?.playerCandidate === 'bear' ? '狗熊' : state.electionState?.playerCandidate === 'testTaker' ? '王卷豪' : '潘仁越'}在该区域的支持度`} 
                  onClick={() => handleAction(selectedLoc, 'campaign')} 
                  canAfford={state.stats.pp >= 25} 
                  isCooldown={false}
                />
              </>
            ) : state.flags['jidi_new_era_active'] ? (
              <>
                {selectedLoc === 'b1b2' && state.flags['jidi_interaction_b1b2'] && (
                  <ActionButton 
                    name="推销《合一密卷》" cost="10 PP" effect="GDP +5万, 学生理智值 -2" 
                    onClick={() => handleAction('b1b2', 'jidi_sell_scrolls')} 
                    canAfford={state.stats.pp >= 10} 
                    isCooldown={isActionOnCooldown('jidi_sell_scrolls')}
                  />
                )}
                {selectedLoc === 'auditorium' && state.flags['jidi_interaction_auditorium'] && (
                  <ActionButton 
                    name="新东方名师讲座" cost="20 PP" effect="做题家产出 (TPR) +10, 新东方资本满意度 +5" 
                    onClick={() => handleAction('auditorium', 'jidi_new_oriental_lecture')} 
                    canAfford={state.stats.pp >= 20} 
                    isCooldown={isActionOnCooldown('jidi_new_oriental_lecture')}
                  />
                )}
                {selectedLoc === 'b3' && state.flags['jidi_interaction_b3'] && (
                  <ActionButton 
                    name="高三封闭集训" cost="50 TPR" effect="GDP +15万, 学生理智值 -5" 
                    onClick={() => handleAction('b3', 'jidi_closed_training')} 
                    canAfford={state.stats.tpr >= 50} 
                    isCooldown={isActionOnCooldown('jidi_closed_training')}
                  />
                )}
                {selectedLoc === 'admin' && state.flags['jidi_interaction_admin'] && (
                  <ActionButton 
                    name="强制教辅订阅" cost="30 PP" effect="GDP +20万, 合一教师协会满意度 -10" 
                    onClick={() => handleAction('admin', 'jidi_mandatory_subscription')} 
                    canAfford={state.stats.pp >= 30} 
                    isCooldown={isActionOnCooldown('jidi_mandatory_subscription')}
                  />
                )}
                {selectedLoc === 'lab' && state.flags['jidi_interaction_lab'] && (
                  <ActionButton 
                    name="部署AI监考" cost="10 GDP" effect="稳定度 +5, 教育局纪委满意度 +5" 
                    onClick={() => handleAction('lab', 'jidi_ai_proctoring')} 
                    canAfford={(state.jidiCorporateState?.gdp || 0) >= 10} 
                    isCooldown={isActionOnCooldown('jidi_ai_proctoring')}
                  />
                )}
                {selectedLoc === 'playground' && state.flags['jidi_interaction_playground'] && (
                  <ActionButton 
                    name="举办商业展销" cost="5 稳定度" effect="GDP +25万" 
                    onClick={() => handleAction('playground', 'jidi_commercial_fair')} 
                    canAfford={state.stats.stab >= 5} 
                    isCooldown={isActionOnCooldown('jidi_commercial_fair')}
                  />
                )}
                {!state.flags[`jidi_interaction_${selectedLoc}`] && (
                  <div className="text-tno-red text-center mt-10 animate-pulse">
                    [系统锁定] 需要完成特定国策以解锁该区域的商业交互。
                  </div>
                )}
              </>
            ) : isMapStruggleEnded ? (
              <div className="text-[#87CEEB] text-center mt-10">
                [和平重建中] 校园已完全控制，等待进一步的民主改革。
              </div>
            ) : !state.flags['rebellion_started'] ? (
              <div className="text-tno-red text-center mt-10 animate-pulse">
                [系统锁定] 需要完成特定国策以解锁区域交互。
              </div>
            ) : (
              <>
                {selectedLoc === 'b3' && (
                  <>
                    <ActionButton 
                      name="地下串联" cost="20 TPR" effect="B3控制度+10%, SS+2%" 
                      onClick={() => handleAction('b3', 'b3_underground')} 
                      canAfford={state.stats.tpr >= 20} 
                      isCooldown={isActionOnCooldown('b3_underground')}
                    />
                    <ActionButton 
                      name="死守楼道" cost="50 PP" effect="14天内免疫校方渗透" 
                      onClick={() => handleAction('b3', 'b3_defend')} 
                      canAfford={state.stats.pp >= 50} 
                      isCooldown={isActionOnCooldown('b3_defend')}
                    />
                  </>
                )}
                {selectedLoc === 'admin' && (
                  <>
                    <ActionButton 
                      name="渗透行政楼" cost="30 PP" effect="控制度+5%, 资本渗透+10%" 
                      onClick={() => handleAction('admin', 'admin_infiltrate')} 
                      canAfford={state.stats.pp >= 30} 
                      isCooldown={isActionOnCooldown('admin_infiltrate')}
                    />
                    <ActionButton 
                      name="黑入广播网" cost="80 PP" effect="高风险判定(基于SS)。成功SS暴涨，失败稳定度暴跌" 
                      onClick={() => handleAction('admin', 'admin_hack')} 
                      canAfford={state.stats.pp >= 80} 
                      isCooldown={isActionOnCooldown('admin_hack')}
                    />
                    <ActionButton 
                      name="潜入教务处改分" cost="100 PP, 500 TPR" effect="延迟一模危机10天" 
                      onClick={() => handleAction('admin', 'admin_grades')} 
                      canAfford={state.stats.pp >= 100 && state.stats.tpr >= 500} 
                      isCooldown={isActionOnCooldown('admin_grades')}
                    />
                  </>
                )}
                {selectedLoc === 'b1b2' && (
                  <>
                    <ActionButton 
                      name="发表演讲" cost="20 PP" effect="控制度+10%, SS+5%" 
                      onClick={() => handleAction('b1b2', 'b1b2_speech')} 
                      canAfford={state.stats.pp >= 20} 
                      isCooldown={isActionOnCooldown('b1b2_speech')}
                    />
                    <ActionButton 
                      name="倾销教辅资料" cost="无" effect="获得300 TPR, 稳定度-5%" 
                      onClick={() => handleAction('b1b2', 'b1b2_dump')} 
                      canAfford={state.stats.stab >= 5} 
                      isCooldown={isActionOnCooldown('b1b2_dump')}
                    />
                    <ActionButton 
                      name="唤醒做题家" cost="30 PP" effect="将控制度转化为SS" 
                      onClick={() => handleAction('b1b2', 'b1b2_awaken')} 
                      canAfford={state.stats.pp >= 30} 
                      isCooldown={isActionOnCooldown('b1b2_awaken')}
                    />
                  </>
                )}
                {selectedLoc === 'auditorium' && (
                  <>
                    <ActionButton 
                      name="拉拢社团" cost="20 PP" effect="控制度+10%, 联盟团结度+5%" 
                      onClick={() => handleAction('auditorium', 'auditorium_coopt')} 
                      canAfford={state.stats.pp >= 20} 
                      isCooldown={isActionOnCooldown('auditorium_coopt')}
                    />
                    <ActionButton 
                      name="召开抗议集会" cost="40 PP" effect="若控制度>80%, 削弱行政楼校方控制" 
                      onClick={() => handleAction('auditorium', 'auditorium_protest')} 
                      canAfford={state.stats.pp >= 40} 
                      isCooldown={isActionOnCooldown('auditorium_protest')}
                    />
                    <ActionButton 
                      name="妥协誓师大会" cost="10 SS" effect="稳定度大幅上升, 获得TPR, 失去控制度" 
                      onClick={() => handleAction('auditorium', 'auditorium_compromise')} 
                      canAfford={state.stats.ss >= 10} 
                      isCooldown={isActionOnCooldown('auditorium_compromise')}
                    />
                    {(state.completedFocuses.includes('expand_assembly') || state.completedFocuses.includes('democratic_reforms')) && (
                      <ActionButton 
                        name="举办民主沙龙" cost="40 PP" effect="控制度+15%, 联盟团结度+5%" 
                        onClick={() => handleAction('auditorium', 'auditorium_salon')} 
                        canAfford={state.stats.pp >= 40} 
                        isCooldown={isActionOnCooldown('auditorium_salon')}
                      />
                    )}
                    {state.flags['rebellion_started'] && state.advisors.some(a => a?.id === 'gouxiong_advisor') && !state.flags.gx_uprising_auditorium_garrison_used && (
                      <ActionButton
                        name="派狗熊进驻艺术礼堂"
                        cost="30 学生理智值"
                        effect="学生理智值 -30，艺术礼堂控制度 +50（一次性）"
                        onClick={() => handleAction('auditorium', 'auditorium_gx_garrison')}
                        canAfford={state.stats.studentSanity >= 30}
                        isCooldown={false}
                      />
                    )}
                  </>
                )}
                {selectedLoc === 'lab' && (
                  <>
                    <ActionButton 
                      name="占领实验室" cost="20 PP" effect="控制度+10%, 获得50 TPR" 
                      onClick={() => handleAction('lab', 'lab_occupy')} 
                      canAfford={state.stats.pp >= 20} 
                      isCooldown={isActionOnCooldown('lab_occupy')}
                    />
                    <ActionButton 
                      name="印制红蛤传单" cost="50 TPR" effect="获得20 PP" 
                      onClick={() => handleAction('lab', 'lab_print')} 
                      canAfford={state.stats.tpr >= 50} 
                      isCooldown={isActionOnCooldown('lab_print')}
                    />
                    <ActionButton 
                      name="组建纠察队" cost="50 PP" effect="获得30天物理防卫Buff" 
                      onClick={() => handleAction('lab', 'lab_guard')} 
                      canAfford={state.stats.pp >= 50} 
                      isCooldown={isActionOnCooldown('lab_guard')}
                    />
                  </>
                )}
                {selectedLoc === 'playground' && (
                  <>
                    <ActionButton 
                      name="组织体育比赛" cost="10 PP" effect="控制度+10%, 学生理智值+5%" 
                      onClick={() => handleAction('playground', 'playground_sports')} 
                      canAfford={state.stats.pp >= 10} 
                      isCooldown={isActionOnCooldown('playground_sports')}
                    />
                    <ActionButton 
                      name="夜间罢操" cost="30 PP" effect="全图学生控制度+5%, 稳定度-10%" 
                      onClick={() => handleAction('playground', 'playground_strike')} 
                      canAfford={state.stats.pp >= 30 && state.stats.stab >= 10} 
                      isCooldown={isActionOnCooldown('playground_strike')}
                    />
                    {(state.completedFocuses.includes('orthodox_dominance') || state.completedFocuses.includes('final_revolution')) && (
                      <ActionButton 
                        name="举行批判大会" cost="40 PP" effect="控制度+15%, 党内集权度+5%" 
                        onClick={() => handleAction('playground', 'playground_criticism')} 
                        canAfford={state.stats.pp >= 40} 
                        isCooldown={isActionOnCooldown('playground_criticism')}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
