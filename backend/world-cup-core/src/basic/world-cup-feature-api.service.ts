import { Injectable } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { AbstractBaseService } from './abstract-base.service';
import { LanguageEnum } from './model/language.enum';
import { WorldCupApiService } from './world-cup-api.service';
import type { GameDictionaryApiResponse, SquadPlayerApiItem } from '../teams/services/model/squad-service.interface';
import type { TeamHistoryApiResponse } from '../teams/services/model/team-history-service.interface';
import type { GroupApiItem } from '../world-cup/services/model/groups-service.interface';
import type {
  CurrentWorldCupApiResponse,
  TeamCatalogApiItem,
  TeamStatsApiResponse,
} from '../world-cup/services/model/simulation-service.interface';
import type { 
  BaseRival, 
  RivalCoach, 
  RivalTeamDetails,
} from '../teams/services/model/rivals-service.interface';
import type { JourneyRawApiResponse } from '../world-cup/services/model/journey-service.interface';
import { LiveEventResponse } from 'src/match/services/model/live-events.interface';
import type { 
  WorldCupAwardItem, 
  WorldCupAwardsApiResponse, 
  WorldCupHistoryApiResponse, 
  WorldCupMatchApiResponse, 
  WorldCupMetadataApiResponse, 
  WorldCupStatsApiResponse, 
} from '../world-cup/services/model/world-cup-history-service.interface';
import { MatchSquadApiResponse } from 'src/match/models/team-state.interface';
import { MatchApiResponse, SelectedFormationApiResponse, SelectedStrategyApiResponse } from 'src/match/models/final-api-response.interface';
import { AwardsApiItem,  CurrentStatsApiResponse } from 'src/world-cup/services/model/stats-awards-service.interface';
import type {
  CoachProfileRawItem,
  CoachRawApiItem,
  FormationRawItem,
  StrategyRawItem,
} from '../teams/services/model/coaching-service.interface';
import { SelectedFormationResponse, SelectedStrategyResponse } from 'src/match/models/final-response.interface';
import { MatchesResponse } from '../world-cup/services/model/matches-service.interface';

@Injectable()
export class WorldCupFeatureApiService extends AbstractBaseService {
  constructor(
    worldCupApiService: WorldCupApiService,
    adminService: AdminService,
  ) {
    super(adminService, worldCupApiService);
  }

  public getCurrentTeamId(): string {
    return super.getCurrentTeamId();
  }

  public getCurrentLang(): LanguageEnum {
    return super.getCurrentLang();
  }

  public async getTeamPlayers(teamId: string, lang?: string): Promise<SquadPlayerApiItem[]> {
    return this.getEndpointData<SquadPlayerApiItem[]>(`/teams/${teamId}/players`, {
      lang: this.resolveLang(lang),
    });
  }

  public async getGameDictionary(lang?: string): Promise<GameDictionaryApiResponse> {
    return this.getEndpointData<GameDictionaryApiResponse>('/reference/game-dictionary', {
      lang: this.resolveLang(lang),
    });
  }

  public async getTeamHistory(teamId: string, lang?: string): Promise<TeamHistoryApiResponse> {
    return this.getEndpointData<TeamHistoryApiResponse>(`/teams/${teamId}/history`, {
      lang: this.resolveLang(lang),
    });
  }

  public async listTeams(teamId?: string, name?: string): Promise<TeamCatalogApiItem[]> {
    return this.getEndpointData<TeamCatalogApiItem[]>('/teams', {
      teamId: teamId?.trim().toLowerCase(),
      name: name?.trim(),
    });
  }

  public async getTeamStats(teamId: string, lang?: string): Promise<TeamStatsApiResponse> {
    return this.getEndpointData<TeamStatsApiResponse>(`/teams/${teamId}/stats`, {
      lang: this.resolveLang(lang),
    });
  }

  public async getCurrentWorldCup(lang?: string): Promise<CurrentWorldCupApiResponse> {
    return this.getEndpointData<CurrentWorldCupApiResponse>('/world-cup/current', {
      lang: this.resolveLang(lang),
    });
  }

  public async getCurrentWorldCupGroups(lang?: string): Promise<GroupApiItem[]> {
    return this.getEndpointData<GroupApiItem[]>('/world-cup/current/groups', {
      lang: this.resolveLang(lang),
    });
  }

  public async simulateWorldCup(teamId: string, lang?: string): Promise<CurrentWorldCupApiResponse> {
    return this.postEndpointData<CurrentWorldCupApiResponse>('/world-cup/simulate', {
      teamId,
      lang: this.resolveLang(lang),
    });
  }
  // 1. GET /teams/:teamId/rivals
  public async getTeamRivals(teamId: string, lang?: string): Promise<BaseRival[]> {
    return this.getEndpointData<BaseRival[]>(`/teams/${teamId}/rivals`, {
      lang: this.resolveLang(lang),
    });
  }

  // 2. GET /teams?teamId={rivalId}
  public async getTeamDetailsById(rivalId: string, lang?: string): Promise<RivalTeamDetails[]> {
    return this.getEndpointData<RivalTeamDetails[]>('/teams', {
      teamId: rivalId?.trim().toLowerCase(),
      lang: this.resolveLang(lang),
    });
  }

  // 3. GET /teams/coaches?teamId={rivalId}
  public async getTeamCoachById(rivalId: string, lang?: string): Promise<RivalCoach> {
    return this.getEndpointData<RivalCoach>('/teams/coaches', {
      teamId: rivalId?.trim().toLowerCase(),
    });
  }
  
  public async getTeamJourney(teamId: string, lang?: string): Promise<JourneyRawApiResponse> {
    return this.getEndpointData<JourneyRawApiResponse>(
      `/world-cup/current/teams/${teamId}/journey`,
      { lang: this.resolveLang(lang) },
    );
  }

  public async getLiveEvents(lang?: string): Promise<LiveEventResponse>{
    return this.getEndpointData<LiveEventResponse>('/match/current/stats',{
      lang: this.resolveLang(lang)
    })
  }


  public async StartMatch(teamId: string, lang?:string): Promise<MatchApiResponse>{
    return this.postEndpointData<any>('/match/start-final',{
      teamId,
      lang: this.resolveLang(lang)
    });
  }

    //Play Turn
  public async PlayTurn(selectedOption: number, lang?: string): Promise<MatchApiResponse>{
    return this.postEndpointData<any>('/match/play',{
      selectedOption,
      lang: this.resolveLang(lang)
    });
  }
  // agrego metodos para endpoints relacionados con la funcionalidad historial de mundiales.
  
  public async getWorldCupHistory(): Promise<WorldCupHistoryApiResponse> {
    const worldCupIds = await this.getEndpointData<string[]>(
      '/world-cup/history',);

    return {
      worldCupIds,
    };
  }

  public async getWorldCupMetadata(worldCupId: string): Promise<WorldCupMetadataApiResponse> {
    return this.getEndpointData<WorldCupMetadataApiResponse>(`/world-cup/${worldCupId}`);
  }                 
  
  public async getWorldCupStats(worldCupId: string): Promise<WorldCupStatsApiResponse> {
    return this.getEndpointData<WorldCupStatsApiResponse>(`/world-cup/${worldCupId}/stats`);
  } 

  public async getWorldCupAwards(
    worldCupId: string,lang?: string,
  ): Promise<WorldCupAwardsApiResponse> {

    const awards = await this.getEndpointData<WorldCupAwardItem[]>(
      `/world-cup/${worldCupId}/awards`,
      {
        lang: this.resolveLang(lang),
      },
    );

    return {
      awards,
   };
  }

  public async getCurrentMatchSquad(): Promise<MatchSquadApiResponse>{
    return this.getEndpointData<MatchSquadApiResponse>('/match/current/squad'); 
  }
  
  public async getCurrentStats(lang?: string): Promise<CurrentStatsApiResponse> {
    return this.getEndpointData<CurrentStatsApiResponse>('/world-cup/current/stats', {
      lang: this.resolveLang(lang),
    });
  }

  public async getCurrentAwards(lang?: string): Promise<AwardsApiItem[]> {
    return this.getEndpointData<AwardsApiItem[]>('/world-cup/current/awards', {
      lang: this.resolveLang(lang),
  });
}
                                                 
public async getMatches(lang?: string, stage?: string): Promise<MatchesResponse> {
    return this.getEndpointData<MatchesResponse>('/world-cup/current/matches', {
      lang: this.resolveLang(lang),
      stage: stage?.trim().toUpperCase(),
    });
  }

  public async getTeamCoach(teamId: string, lang?: string): Promise<CoachRawApiItem> {
    return this.getEndpointData<CoachRawApiItem>('/teams/coaches', {
      teamId,
      lang: this.resolveLang(lang),
    });
  }

  public async getCoachProfiles(lang?: string): Promise<CoachProfileRawItem[]> {
    return this.getEndpointData<CoachProfileRawItem[]>('/reference/coach-profiles', {
      lang: this.resolveLang(lang),
    });
  }

  public async getStrategiesCatalog(lang?: string): Promise<StrategyRawItem[]> {
    return this.getEndpointData<StrategyRawItem[]>('/match/strategies', {
      lang: this.resolveLang(lang),
    });
  }

  public async getFormationsCatalog(lang?: string): Promise<FormationRawItem[]> {
    return this.getEndpointData<FormationRawItem[]>('/match/formations', {
      lang: this.resolveLang(lang),
    });
  }

  public async selectStrategy(teamId: string, strategy: string): Promise<void> {
    await this.postEndpointData<unknown>('/match/select-strategy', { teamId, strategy });
  }

  public async selectFormation(teamId: string, formation: string): Promise<void> {
    await this.postEndpointData<unknown>('/match/select-formation', { teamId, formation });
  }
  
  public async resetTeamTactics(teamId: string): Promise<void> {
    await this.postEndpointData<unknown>('/match/reset-team-tactics', { teamId });
  }

  public async getWorldCupMatches(
  worldCupId: string,
  stage?: string,
): Promise<WorldCupMatchApiResponse[]> {
  return this.getEndpointData<WorldCupMatchApiResponse[]>(
    `/world-cup/${worldCupId}/matches`,
    { stage },
  );
}

  
  public async selectStrategyInFinalMatch(teamId: string, strategy: string, lang?: string): Promise<SelectedStrategyApiResponse> {
    return this.postEndpointData<SelectedStrategyResponse>('/match/select-strategy', { teamId, strategy, lang});
  }

  public async selectFormationInFinalMatch(teamId: string, formation: string, lang?: string): Promise<SelectedFormationApiResponse> {
    return this.postEndpointData<SelectedFormationResponse>('/match/select-formation', {teamId, formation, lang})
  }
}