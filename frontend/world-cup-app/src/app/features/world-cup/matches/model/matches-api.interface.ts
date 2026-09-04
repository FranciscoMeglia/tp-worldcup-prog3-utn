
export enum MatchStageCode {
  GROUP_STAGE = 'GROUP_STAGE',
  ROUND_OF_32 = 'ROUND_OF_32',
  ROUND_OF_16 = 'ROUND_OF_16',
  QUARTER_FINALS = 'QUARTER_FINALS',
  SEMI_FINALS = 'SEMI_FINALS',
  THIRD_PLACE = 'THIRD_PLACE',
  FINAL = 'FINAL',
}
export interface MatchStageFilterItem {
  stage: MatchStageCode;
 
}

export interface MatchCardApiItem {
  stage: Exclude<MatchStageCode, 'ALL'>;
  stageLabel: string;
  groupName: string | null;
  matchCode: string;
  homeTeamId: string;
  homeTeamName: string;
  homeFlag: string;
  awayTeamId: string;
  awayTeamName: string;
  awayFlag: string;
  scoreLabel: string;
  penaltyLabel: string | null;
  resolution: string;
  resolutionLabel: string;
  isPending: boolean;
  winnerTeamId: string | null;
  winnerTeamName: string | null;
  winnerFlag: string | null;
  playerOfMatchName: string;
  playerOfMatchTeamId: string;
  goalsSummary: string | null;
  cardsSummary: string | null;
}


export interface MatchesApiResponse {
  teamId: string;
  lang: 'es' | 'en';
  worldCupId?: string;
  selectedStage: MatchStageCode;
  availableStages: MatchStageFilterItem[];
  totalMatches: number;
  playedMatches: number;
  pendingMatches: number;
  matches: MatchCardApiItem[];
}
