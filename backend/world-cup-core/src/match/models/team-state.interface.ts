export interface MatchTeamSquad{
    id: string;
    name: string;
    formation: string;
    strategy: string;
    coachName: string;
    coachProfile: string;
    tactical: Tactical;
    maxSubstitutions: number;
    substitutionsUsed: number;
    remainingSubstitutions: number;
    onFieldCount: number; 
    starters: MatchSquadPlayer[];
    onField: MatchSquadPlayer[];
    bench: MatchSquadPlayer[];

}


export interface MatchTeamSquadApiResponse{
    id: string;
    name: string;
    formation: string;
    strategy: string;
    coachName: string;
    coachProfile: string;
    tacticalBreakdown: TacticalBreakdown;
    maxSubstitutions: number;
    substitutionsUsed: number;
    remainingSubstitutions: number;
    onFieldCount: number; 
    starters: MatchSquadPlayer[];
    onField: MatchSquadPlayer[];
    bench: MatchSquadPlayer[];
}



export interface Tactical{
  attack: number;
  defense:number;
  midfield: number;
}

export interface TacticalBreakdown{
    baseTeamLine: Tactical;
    lineBoost: Tactical;
    compatibilityPenaltyPoints: Tactical;
    effectiveTeamLine: Tactical;
}

export interface MatchSquadResponse{
    teamId: string;
    lang: 'es' | 'en';
    matchId: string;
    isActive: boolean;
    isFinished: boolean;
    minute: number;
    turn: number;
    score: string;
    team: MatchTeamSquad;
    opponent: MatchTeamSquad;
    
}


export interface MatchSquadApiResponse{
    teamId: string;
    lang: 'es' | 'en';
    matchId: string;
    isActive: boolean;
    isFinished: boolean;
    minute: number;
    turn: number;
    score: string;
    team: MatchTeamSquadApiResponse;
    opponent: MatchTeamSquadApiResponse;
}


export interface MatchSquadPlayer {
  playerId: string;
  name: string;
  position: string;
  shirtNumber: number;
  age: number;
  skill: number;
  attack: number;
  defense: number;
  energy: number;
  isCaptain: boolean;
  isStarter: boolean;
  isOnField: boolean;
  yellowCards: number;
  redCard: boolean;
  isInjured: boolean;
  strategyImpact: MatchPlayerStrategyImpact;
  energyModifier: number;
  effectiveStats: MatchPlayerEffectiveStats;
}

export interface MatchPlayerStrategyImpact {
  attackDelta: number;
  defenseDelta: number;
  skillDelta: number;
}


export interface MatchPlayerEffectiveStats {
  skill: number;
  attack: number;
  defense: number;
}
