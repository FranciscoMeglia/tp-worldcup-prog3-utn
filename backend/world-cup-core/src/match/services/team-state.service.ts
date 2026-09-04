import { HttpStatus, Injectable } from '@nestjs/common';
import { MatchSquadApiResponse, MatchSquadResponse } from '../models/team-state.interface';
import { AbstractBaseService } from 'src/basic/abstract-base.service';
import { AdminService } from 'src/admin/admin.service';
import { WorldCupFeatureApiService } from 'src/basic/world-cup-feature-api.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from 'src/basic/error/error.utils';
import { WorldCupCoreErrorCode } from 'src/basic/model/world-cup-core-error-code.enum';

const SQUAD_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
    message: 'There is no active final',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
    message: 'Squad data is not available right now. Try again in a moment.',
  },
};


const SQUAD_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
  message: 'Unable to load squad data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class TeamStateService extends AbstractBaseService {
  // TODO: Se debe implementar el controlador y el servicio correspondiente.
  constructor(
    adminService: AdminService, 
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
  ){
    super(adminService);
  }

  async getCurrentMatchSquad(): Promise<MatchSquadResponse>{
    try {
      const activeMatchApiRes = await this.worldCupFeatureApiService.getCurrentMatchSquad()

      const activeMatch = this.mapMatchSquadApiResponse(activeMatchApiRes);

      return activeMatch

    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, SQUAD_API_ERROR_STATUS_MAP, SQUAD_API_ERROR_FALLBACK);
    }
  }

  private mapMatchSquadApiResponse(obj: MatchSquadApiResponse): MatchSquadResponse{
    
    const team = {
      id: obj.team.id,
      name: obj.team.name,
      formation: obj.team.formation,
      strategy: obj.team.strategy,
      coachName: obj.team.coachName,
      coachProfile: obj.team.coachProfile,
      tactical: obj.team.tacticalBreakdown.effectiveTeamLine,
      maxSubstitutions: obj.team.maxSubstitutions,
      substitutionsUsed: obj.team.substitutionsUsed,
      remainingSubstitutions: obj.team.remainingSubstitutions,
      onFieldCount: obj.team.onFieldCount,
      starters: obj.team.starters,
      onField: obj.team.onField,
      bench: obj.team.bench
    }
    
    const opponent = {
      id: obj.opponent.id,
      name: obj.opponent.name,
      formation: obj.opponent.formation,
      strategy: obj.opponent.strategy,
      coachName: obj.opponent.coachName,
      coachProfile: obj.opponent.coachProfile,
      tactical: obj.opponent.tacticalBreakdown.effectiveTeamLine,
      maxSubstitutions: obj.opponent.maxSubstitutions,
      substitutionsUsed: obj.opponent.substitutionsUsed,
      remainingSubstitutions: obj.opponent.remainingSubstitutions,
      onFieldCount: obj.opponent.onFieldCount,
      starters: obj.opponent.starters,
      onField: obj.opponent.onField,
      bench: obj.opponent.bench
    }


    const activeMatch = {
      teamId: obj.teamId,
      lang: obj.lang,
      matchId: obj.matchId,
      isActive: obj.isActive,
      isFinished: obj.isFinished,
      minute: obj.minute,
      turn: obj.turn,
      score: obj.score,
      team: team,
      opponent: opponent,
    }

    return activeMatch
  }

}
