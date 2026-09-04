// modelos de datos relacionados con el servicio de historial de mundiales


export interface WorldCupHistoryApiResponse {   
   worldCupIds: string[];
}

export interface WorldCupMetadataApiResponse {
  worldCupId?: string;
  edition?: number;
  status?: string;
  hasActiveFinal?: boolean;
  canResimulate?: boolean;
  canStartFinal?: boolean;
  selectedTeamId?: string;
  selectedTeamName?: string;
  finalHomeTeamId?: string;
  finalHomeTeamName?: string;
  finalAwayTeamId?: string;
  finalAwayTeamName?: string;
  finalMatchId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorldCupStatsApiResponse {
  totalMatches?: number;
  totalGoals?: number;
  avgGoalsPerMatch?: number;

  champion?: {
    teamId?: string;
    teamName?: string;
  };

  runnerUp?: {
    teamId?: string;
    teamName?: string;
  };

  thirdPlace?: {
    teamId?: string;
    teamName?: string;
  };

  fourthPlace?: {
    teamId?: string;
    teamName?: string;
  };

  topScorers?: {
    playerName?: string;
    teamId?: string;
    teamName?: string;
    value?: number;
  }[];

  topAssists?: {
    playerName?: string;
    teamId?: string;
    teamName?: string;
    value?: number;
  }[];

  bestGoalkeepers?: {
    playerName?: string;
    teamId?: string;
    teamName?: string;
    value?: number;
  }[];

  cleanSheetLeaders?: {
    playerName?: string;
    teamId?: string;
    teamName?: string;
    value?: number;
  }[];

  topPlayerOfMatch?: {
    playerName?: string;
    teamId?: string;
    teamName?: string;
    value?: number;
  };

  cards?: {
    totalYellowCards?: number;
    totalRedCards?: number;
  };
}

export interface WorldCupAwardItem {
  code?: string;
  winnerName?: string;
  teamId?: string;
  teamName?: string;
  reason?: string;
  goals?: number;
  playerOfMatch?: number;
  fairPlayPoints?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface WorldCupAwardsApiResponse {
  awards: WorldCupAwardItem[];
}

export interface WorldCupMatchApiResponse {
  stage: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  homePenaltyGoals: number | null;
  awayPenaltyGoals: number | null;
  resolution: string;
  homeTeamTotalYellowCards: number;
  homeTeamTotalRedCards: number;
  awayTeamTotalYellowCards: number;
  awayTeamTotalRedCards: number;
}

export interface FairPlayTeamStats {
  teamId: string;
  teamName: string;
  yellowCards: number;
  redCards: number;
}