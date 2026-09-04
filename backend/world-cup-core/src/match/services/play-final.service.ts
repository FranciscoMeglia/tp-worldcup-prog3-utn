import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AbstractBaseService } from 'src/basic/abstract-base.service';
import { WorldCupFeatureApiService } from 'src/basic/world-cup-feature-api.service';
import { FormationsResponse, MatchResponse, SelectedFormationResponse, SelectedStrategyResponse, StrategiesResponse } from '../models/final-response.interface';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from 'src/basic/error/error.utils';
import { WorldCupCoreErrorCode } from 'src/basic/model/world-cup-core-error-code.enum';
import { CurrentStatusResponse } from './model/worldcup-status-response.interface';


const FINAL_MATCH_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.BAD_REQUEST]: {
    messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
    message: 'There is no active final',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
    message: 'Final match data is not available right now. Try again in a moment.',
  },
};

const SELECTED_STRATEGY_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.BAD_REQUEST]: {
    messageCode: WorldCupCoreErrorCode.SELECTED_STRATEGY_BAD_REQUEST,
    message: 'Strategy data is not available right now. Try again in a moment.',
  }
}

const SELECTED_FORMATION_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.BAD_REQUEST]: {
    messageCode: WorldCupCoreErrorCode.SELECTED_FORMATION_BAD_REQUEST,
    message: 'Formation data is not available right now. Try again in a moment.',
  }
}


const FINAL_MATCH_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.ACTIVE_FINAL_NOT_FOUND,
  message: 'Unable to load final match from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

const SELECTED_STRATEGY_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.BAD_REQUEST,
  message: 'Unable to load strategy from World Cup API.',
  statusCode: HttpStatus.BAD_REQUEST,
};

const SELECTED_FORMATION_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.BAD_REQUEST,
  message: 'Unable to load formation from World Cup API.',
  statusCode: HttpStatus.BAD_REQUEST,
};


@Injectable()
export class PlayFinalService extends AbstractBaseService{
  constructor(
      private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
      adminService: AdminService
  ){
    super(adminService);
  }

  public async getCurrentWorldcupStatus(): Promise<CurrentStatusResponse>{

    try{
      const ApiResponse = await this.worldCupFeatureApiService.getCurrentWorldCup();
      
      const status = {
        teamId : ApiResponse.finalHomeTeamId,
        opponentId: ApiResponse.finalAwayTeamId,
        teamName: ApiResponse.finalHomeTeamName,
        opponentName: ApiResponse.finalAwayTeamName,
        worldCupStatus: ApiResponse.status,
        hasActiveFinal: ApiResponse.hasActiveFinal,
        canStartFinal: ApiResponse.canStartFinal
      };
  
      return status
    } catch(error){
      ErrorUtils.mapWorldCupApiError(error, FINAL_MATCH_API_ERROR_STATUS_MAP, FINAL_MATCH_API_ERROR_FALLBACK);
    }
  }

  public async GetStrategies(lang?: string): Promise<StrategiesResponse[]>{
    try {
      const ApiResponse = await this.worldCupFeatureApiService.getStrategiesCatalog(lang);

      const strategies = [];
      ApiResponse.forEach((str)=>{
        const responseStrategy = {
            strategy: str.strategy,
            description: str.description
        };

        strategies.push(responseStrategy)
      });

      return strategies;

    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, SELECTED_STRATEGY_API_ERROR_STATUS_MAP, SELECTED_STRATEGY_API_ERROR_FALLBACK);
    }
  }

  public async GetFormations(lang?: string): Promise<FormationsResponse[]>{
    try {
      const ApiResponse = await this.worldCupFeatureApiService.getFormationsCatalog(lang);

      const Formations = [];
      ApiResponse.forEach((formation)=>{
        const resFormation = {
          formation: formation.formation,
          description: formation.description
        };
        Formations.push(resFormation);
      })

      return Formations;
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, SELECTED_FORMATION_API_ERROR_STATUS_MAP, SELECTED_FORMATION_API_ERROR_FALLBACK);
    }
  }

  public async StartMatch(teamId: string, lang?: string): Promise<MatchResponse>{
    try {
      const ApiResponse = await this.worldCupFeatureApiService.StartMatch(teamId, lang);
      return ApiResponse;
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, FINAL_MATCH_API_ERROR_STATUS_MAP, FINAL_MATCH_API_ERROR_FALLBACK);
    }
  }

  public async PlayTurn(selectedOption: number, lang?: string): Promise<MatchResponse>{
    try {
      const ApiResponse = await this.worldCupFeatureApiService.PlayTurn(selectedOption, lang);
      return ApiResponse;
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, FINAL_MATCH_API_ERROR_STATUS_MAP, FINAL_MATCH_API_ERROR_FALLBACK);
    }
  }

  public async SelectStrategy(teamId: string, strategy: string, lang?: string): Promise<SelectedStrategyResponse>{
    try {
      const ApiResponse = await this.worldCupFeatureApiService.selectStrategyInFinalMatch(teamId, strategy, lang);
      return ApiResponse;
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, SELECTED_STRATEGY_API_ERROR_STATUS_MAP, SELECTED_STRATEGY_API_ERROR_FALLBACK);
    }
  }
  
  public async SelectFormation(teamId: string, formation: string, lang?: string): Promise<SelectedFormationResponse>{
    try {
      const ApiResponse = await this.worldCupFeatureApiService.selectFormationInFinalMatch(teamId, formation, lang);
      return ApiResponse;
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, SELECTED_FORMATION_API_ERROR_STATUS_MAP, SELECTED_FORMATION_API_ERROR_FALLBACK);
    }
  }

}
