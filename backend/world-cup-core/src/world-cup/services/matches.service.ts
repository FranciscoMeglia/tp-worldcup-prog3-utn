import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AbstractBaseService } from 'src/basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from 'src/basic/error/error.utils';
import { WorldCupFeatureApiService } from 'src/basic/world-cup-feature-api.service';
import { CurrentWorldCupApiResponse } from './model/simulation-service.interface';
import { WorldCupCoreErrorCode } from 'src/basic/model/world-cup-core-error-code.enum';
import { mappedMatches, MatchesResponse } from './model/matches-service.interface';
import { TournamentSummary } from './model/matches-service.interface';
import { MatchesScreen } from './model/matches-service.model'
import { resolutionEnum } from './model/resolution.enum';
const SIMULATION_UNAVAILABLE_MESSAGE =
  'World Cup simulation is not available yet. Run simulation first.';
const SIMULATION_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_SIMULATION_FETCH_FAILED,
  message: 'Unable to load simulation data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};
 const MATCHES_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_MATCHES_FETCH_FAILED,
  message: 'Unable to load matches data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};
const SIMULATION_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_SIMULATION_UNAVAILABLE,
    message: SIMULATION_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_SIMULATION_UNAVAILABLE,
    message: SIMULATION_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
};
const WC_MATCHES_UNAVAILABLE_ERROR: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_MATCHES_UNAVAILABLE,
    message: 'Matches data is not available yet. Run simulation first.',
    statusCode: HttpStatus.CONFLICT,
  },
};
 
@Injectable()
export class MatchesService extends AbstractBaseService {

  constructor(adminService: AdminService, private readonly worldCupFeatureApiService: WorldCupFeatureApiService) {
    super(adminService);
}
async getCurrentWorldCup(): Promise<CurrentWorldCupApiResponse> {
 try{
  return await this.worldCupFeatureApiService.getCurrentWorldCup();
} catch (error) { 
   ErrorUtils.mapWorldCupApiError(
       error,
       SIMULATION_API_ERROR_STATUS_MAP,
       SIMULATION_API_ERROR_FALLBACK,
   );
}
}
public async getMatches(lang: string, stage?: string): Promise<MatchesScreen>{
  try {
   const raw = await this.worldCupFeatureApiService.getMatches(lang, stage);
   return this.buildMatchesModel(raw);
  } catch (error) {
    ErrorUtils.mapWorldCupApiError(
      error,
      WC_MATCHES_UNAVAILABLE_ERROR,
      MATCHES_API_ERROR_FALLBACK,
    );
  }
}

private buildMatchesModel(raw: MatchesResponse): MatchesScreen{
  const summary = this.getTournamentSummary(raw);
  const totalMatches = summary.totalMatches;
  const playedMatches = summary.playedMatches;
  const pendingMatches = summary.pendingMatches;
  const matches = this.mapMatches(raw);
  return{
    totalMatches,
    playedMatches,
    pendingMatches,
    matches
    }
}

private mapMatches(matches: any): mappedMatches{
  return matches.map(matches => {
    return {
      stageLabel: matches.stage,
      groupName: matches.groupName,
      matchCode: matches.matchCode,
      homeTeamId: matches.homeTeamId,
      homeTeamName: matches.homeTeamName,
      homeFlag: `${matches.hometeamId}`,
      awayTeamId: matches.awayTeamId,
      awayTeamName: matches.awayTeamName,
      awayFlag: `${matches.awayTeamId}`,
      scoreLabel: `${matches.homeGoals} - ${matches.awayGoals}`,
      penaltyLabel: this.buildPenaltyLabel(matches),
      resolution: matches.resolution,
      resolutionLabel: resolutionEnum[matches.resolution as keyof typeof resolutionEnum],
      isPending: matches.isPending,
      winnerTeamId: matches.winnerTeamId,
      winnerTeamName: matches.winnerTeamName,
      playerOfMatchName: matches.playerOfMatch ? matches.playerOfMatch.playerName : null,
      playerOfMatchTeamId: matches.playerOfMatch ? matches.playerOfMatch.teamId : null,
      goalsSummary: this.buildGoalsSummary(matches),
      cardsSummary: this.buildCardsSummary(matches)
    };
  });
}

private buildPenaltyLabel(matches: MatchesResponse): string{
  if (matches.homePenaltyGoals === null && matches.awayPenaltyGoals === null){
    return "";}
  else if (matches.homePenaltyGoals && matches.awayPenaltyGoals === null) {
    return `${matches.homePenaltyGoals} - 0`;}
  else if (matches.homePenaltyGoals === null && matches.awayPenaltyGoals) {
    return `0 - ${matches.awayPenaltyGoals}`;}
  else {return `${matches.homePenaltyGoals} - ${matches.awayPenaltyGoals}`;}
}
private formatEvents(events: any[] | null): string {
  if (!events || events.length === 0) {
    return '';
  }
  const formattedEvents = events.map(event => `${event.playerName} ${event.minute}'`);
  return formattedEvents.join(', ');
}
private buildGoalsSummary(match: MatchesResponse): string | null {
  const homeGoals = this.formatEvents(match.homeTeamGoalsDetails);
  const awayGoals = this.formatEvents(match.awayTeamGoalsDetails);

  if (!homeGoals && !awayGoals) {
    return null; 
  }
  if (homeGoals && awayGoals) return `${homeGoals} - ${awayGoals}`;
  if (homeGoals) return homeGoals;
  return awayGoals;
}

private buildCardsSummary(match: MatchesResponse): string | null {
  const homeCards = this.formatEvents(match.homeTeamCardsDetails);
  const awayCards = this.formatEvents(match.awayTeamCardsDetails);
  if (!homeCards && !awayCards) {
    return null; 
  }
  if (homeCards && awayCards) return `${homeCards} - ${awayCards}`;
  if (homeCards) return homeCards;
  return awayCards;
}

private getTournamentSummary(matches: any): TournamentSummary {
  const totalMatches = matches.length;
  const playedMatches = matches.filter(matches => !matches.isPending).length;
  const pendingMatches = matches.filter(matches => matches.isPending).length;
  return {
    totalMatches,
    playedMatches,
    pendingMatches,
  };
}
}
