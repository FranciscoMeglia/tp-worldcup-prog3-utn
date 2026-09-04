import { resolutionEnum } from './resolution.enum';
export interface MatchesResponse {
    stage: string;
    groupName: string;
    matchCode: string;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
    homeGoals: number;
    awayGoals: number;
    homePenaltyGoals: number;
    awayPenaltyGoals: number;
    winnerTeamId: string;
    winnerTeamName: string;
    resolution: resolutionEnum;
    isPending: boolean;
    playerOfMatch: playerOfMatch;
    homeTeamTotalYellowCards: number;
    homeTeamTotalRedCards: number;
    awayTeamTotalYellowCards: number;
    awayTeamTotalRedCards: number;
    homeTeamGoalsDetails: goalDetails[];
    awayTeamGoalsDetails: goalDetails[];
    homeTeamCardsDetails: cardDetails[];
    awayTeamCardsDetails: cardDetails[];
    homeTeamInjuriesDetails: injuryDetails[];
    awayTeamInjuriesDetails: injuryDetails[];
    homeTeamSubstitutionsDetails: substitutionDetails[];
    awayTeamSubstitutionsDetails: substitutionDetails[];
}
export interface mappedMatches{
  stageLabel: string;
  groupName: string | null;
  matchCode: string;
  homeTeamId: string;
  homeTeamName: string;
  homeFlag: string,
  awayTeamId: string;
  awayTeamName: string;
  awayFlag: string,
  scoreLabel: string;
  penaltyLabel: string | null;
  resolution: string;
  resolutionLabel: string;
  isPending: boolean;
  winnerTeamId: string | null;
  winnerTeamName: string | null;
  playerOfMatchName: string;
  playerOfMatchTeamId : string;
  goalsSummary: string | null;
  cardsSummary: string | null;
}
export interface TournamentSummary {
    totalMatches: number;
    playedMatches: number;
    pendingMatches: number;
}
export interface StageCounts {
    all: number;
    groupStage: number;
    roundOf32: number;
    roundOf16: number;
    quarterFinals: number;
    semiFinals: number;
    thirdPlace: number;
    final: number;
}

export interface playerOfMatch {
    playerName: string;
    teamId: string;
    teamName: string;
}

export interface goalDetails {
    playerName: string;
    minute: number;
}

export interface cardDetails {
    playerName: string;
    minute: number;
    cardType: 'YELLOW' | 'RED';
}

export interface injuryDetails {
    playerName: string;
    minute: number;
}

export interface substitutionDetails {
    playerInName: string;
    playerOutName: string;
    minute: number;
}