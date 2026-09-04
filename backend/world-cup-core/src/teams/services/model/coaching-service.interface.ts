export interface CoachRawApiItem {
  coachId: string;
  teamId: string;
  teamName: string;
  name: string;
  age: number;
  nationality: string;
  profile: string;
  riskAppetite: number;
  gameManagement: number;
  adaptability: number;
  pressingBias: number;
  possessionBias: number;
  defenseBias: number;
  maxStrategyChanges: number;
}

export interface CoachProfileRawItem {
  profileCode: string;
  label: string;
  description: string;
}

export interface StrategyLineImpact {
  attack: number;
  defense: number;
  midfield: number;
}

export interface StrategyRawItem {
  strategy: string;
  description: string;
  compatibleFormations: string[];
  strategyLineImpact?: StrategyLineImpact;
}

export interface FormationRawItem {
  formation: string;
  description: string;
  compatibleStrategies: string[];
}

export interface CoachingScreenCoach extends CoachRawApiItem {
  profileLabel?: string;
  profileDescription?: string;
}

export interface CoachingRatingItem {
  metric: string;
  value: number;
}

export interface CoachingRatingDeltaItem {
  metric: string;
  strategyDelta: number;
  compatibilityPenalty: number;
  totalDelta: number;
}

export interface CoachingCompatibilityInfo {
  selectedStrategy: string;
  selectedFormation: string;
  compatibleFormations: string[];
  compatibleStrategies: string[];
  byStrategy: Record<string, string[]>;
  byFormation: Record<string, string[]>;
  isSelectedPairCompatible: boolean;
}

export interface CoachingOverviewScreen {
  teamId: string;
  coach: CoachingScreenCoach | null;
  strategy: { teamId: string; strategy: string } | null;
  formation: { teamId: string; formation: string } | null;
  stats: {
    attack: number;
    defense: number;
    midfield: number;
    overall: number;
    current_strategy: string;
    current_formation: string;
  } | null;
  baseRatings: CoachingRatingItem[];
  effectiveRatings: CoachingRatingItem[];
  ratingDeltas: CoachingRatingDeltaItem[];
  strategyPenalty: number;
  strategies: StrategyRawItem[];
  formations: FormationRawItem[];
  compatibility: CoachingCompatibilityInfo;
}