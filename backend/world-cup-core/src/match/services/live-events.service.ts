import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AbstractBaseService } from 'src/basic/abstract-base.service';
import { WorldCupFeatureApiService } from 'src/basic/world-cup-feature-api.service';
import { EventModel, LiveEventModel } from './model/live-events.model';
import { LiveEventResponse , Event} from './model/live-events.interface';
import { LiveEventsPlayerOfMatch } from './model/match-response.interface';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from 'src/basic/error/error.utils';
import { WorldCupCoreErrorCode } from 'src/basic/model/world-cup-core-error-code.enum';
import {MatchesResponse} from "../../world-cup/services/model/matches-service.interface";

const FINAL_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
    message: 'Final match was not found.',
  }
};

const FINAL_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_SIMULATION_UNAVAILABLE,
  message: 'Unable to load World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};


@Injectable()
export class LiveEventsService extends AbstractBaseService{

  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService
  ){
    super(adminService);
  }

  public async getLiveEvents(lang: string): Promise<LiveEventModel>{
    try{
      const liveEventResponse = await this.worldCupFeatureApiService.getLiveEvents(lang);
      const liveEvents = this.mapEventResponse(liveEventResponse);
      if(liveEvents.isFinished){
        liveEvents.playerOfMatch = await this.getMatchAwards();
      }
      return liveEvents;
    }catch(error){
      ErrorUtils.mapWorldCupApiError(
      error,
      FINAL_ERROR_STATUS_MAP,
      FINAL_API_ERROR_FALLBACK
      );
    }
  }

  private mapEventResponse(res: LiveEventResponse): LiveEventModel{

    const lang = this.getCurrentLang();
    const teamId = this.getCurrentTeamId();
    const isActive = res.isActive;
    const player: LiveEventsPlayerOfMatch = null;
    const matchId = res.matchId;
    const isFinished = res.isFinished;
    const minute = res.minute;
    const turn = res.turn;
    const score = res.score;
    const team = res.team;
    const opponent = res.opponent;
    const summary = res.summary;
    summary.totalGoals = summary.opponentGoals + summary.teamGoals;

    let events : EventModel[] = res.events.map(event =>({
      statId: event.statId,
      minute: event.minute,
      minuteLabel: '',
      turn: event.turn,
      type: event.eventType,
      style: this.mapStyle(event),
      icon: '',
      text: event.message,
      teamId: event.teamId,
      teamName: event.teamName,
      playerName: event.playerName
    })).sort((a, b) => b.statId - a.statId );

    const zone = this.mapZone(res.events[events.length-1].zone);
    

    const data = new LiveEventModel({
      lang,
      teamId,
      matchId,
      isActive,
      isFinished,
      minute,
      turn,
      zone,
      score,
      team,
      opponent,
      summary,
      player,
      events
    })
    return data;
    
  } 
  public async getMatchAwards(lang?: string){
    try{
      const matchAwardsResponse = await this.worldCupFeatureApiService.getMatches(lang, 'FINAL');
      const matchAwards: LiveEventsPlayerOfMatch = this.mapAwardsResponse(matchAwardsResponse);
      return matchAwards;
    }catch(error){
      ErrorUtils.mapWorldCupApiError(
        error,
        FINAL_ERROR_STATUS_MAP,
        FINAL_API_ERROR_FALLBACK
      );
    }
  }

  private mapZone(zone: string): string{
    if(zone === 'ATTACK_THIRD'){
      return 'Zona de Ataque';
    }else if(zone === 'DEFENSE_THIRD'){
      return 'Zona defensiva';
    }else if(zone === 'BOX'){
      return 'Area';
    }
    return 'Mediocampo';
  }

  private mapAwardsResponse(res: MatchesResponse): LiveEventsPlayerOfMatch{
    const playerMatch: LiveEventsPlayerOfMatch = {
      teamId: res[0].playerOfMatch.teamId,
      teamName: res[0].playerOfMatch.teamName,
      playerName: res[0].playerOfMatch.playerName,
      teamFlag: '',
      position: '',
    };

    return playerMatch;
  }
// export type LiveEventStyle = 'goal' | 'yellow' | 'red' | 'sub' | 'info';
  private mapStyle(event: Event){

    if(event.eventType === 'RED_CARD'){
      return 'red'
    }else
    if(event.eventType === 'YELLOW_CARD'){
      return 'yellow'
    }else
    if(event.isGoal){
      return 'goal';
    }else
    if(event.zone === null && event.action === null){
      return 'sub';
    }
    if((event.eventType.includes('ATTACK') || event.eventType.includes('FOR'))&&event.teamId === this.getCurrentTeamId() ){
      return 'attack';
    }
    if(event.eventType.includes('DEFENSE')){
      return 'defense';
    }
    if(event.eventType.includes('POSSESSION')){
      return 'possesion';
    }
    if(event.eventType.includes('AGAINST')){
      return 'possesion';
    }
    return event.eventType;
  }
}
