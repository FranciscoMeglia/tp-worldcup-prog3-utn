export interface JourneyMatchRawApiItem {
  stage: string;
  matchCode: string;
  opponentTeamId: string;
  opponentTeamName: string;
  goalsFor: number | null;
  goalsAgainst: number | null;
  result: string;
  resolution: string;
  isPending: boolean;
}

export interface JourneyRawApiResponse {
  worldCupId: string;
  teamId: string;
  teamName: string;
  lang: string;
  worldCupStatus: string;
  stageReached: string;
  isChampion: boolean;
  isFinalPending: boolean;
  eliminatedByTeamId: string | null;
  eliminatedByTeamName: string | null;
  summary: string;
  matches: JourneyMatchRawApiItem[];
}

export interface JourneyTimelineItem {
  stage: string;
  stageLabel: string;
  matchCode: string;
  opponentTeamId: string;
  opponentTeamName: string;
  opponentFlag: string;
  goalsFor: number | null;
  goalsAgainst: number | null;
  scoreLabel: string;
  result: string;
  resultLabel: string;
  resultStyle: string;
  resolution: string;
  resolutionLabel: string;
  isPending: boolean;
}

export interface JourneyScreen {
  worldCupId: string;
  teamId: string;
  teamName: string;
  lang: string;
  worldCupStatus: string;
  stageReached: string;
  stageReachedLabel: string;
  isChampion: boolean;
  isFinalPending: boolean;
  eliminatedByTeamId: string | null;
  eliminatedByTeamName: string | null;
  summary: string;
  matchesPlayed: number;
  matches: JourneyTimelineItem[];
}
