// src/teams/services/rivals.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';
import { RivalsScreenModel, RivalTitleItemModel } from './model/rivals-service.model';
import { BaseRival, RivalTeamDetails, RivalCoach } from './model/rivals-service.interface';

const RIVALS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_HISTORICAL_RIVALS_UNAVAILABLE,
    message: 'Historical rivals for the selected team were not found.',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_HISTORICAL_RIVALS_UNAVAILABLE,
    message: 'Historical rivals are not available right now. Try again in a moment.',
  },
};

const RIVALS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_HISTORICAL_RIVALS_UNAVAILABLE,
  message: 'Unable to load historical rivals from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class RivalsService extends AbstractBaseService {
  /** Handles historical rivals business flow for My Team section. */
  constructor(private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,) 
  {
    super(adminService);
  }

  /** Returns unified historical rivals for the currently selected team. */
  public async getHistoricalRivals( lang?: string): Promise<RivalsScreenModel> {
    try {
      const teamId = this.getCurrentTeamId();
      const resolvedLang = this.resolveLang(lang);
      // 1. Obtener la lista base desde la API de la cátedra
      const baseRivals: BaseRival[] = await this.worldCupFeatureApiService.getTeamRivals(teamId, resolvedLang);
      // 2. 
      const rivals: RivalTitleItemModel[] = [];
      for (const baseRival of baseRivals) {
        
          const rivalId = baseRival.id || '';
          const detailsList = await this.worldCupFeatureApiService.getTeamDetailsById(rivalId, lang);
          const coachPayload = await this.worldCupFeatureApiService.getTeamCoachById(rivalId, lang);
          // enriquecer la lista de los rivales
          const details = detailsList && detailsList.length > 0 ? detailsList[0] : null;
          const enrichedRival = this.buildRivalSection(baseRival, details, coachPayload);
          rivals.push(enrichedRival);     
      }
      const sortedRivals = this.sortRivalsAlphabetically(rivals, resolvedLang);

      return new RivalsScreenModel({
        teamId,
        totalRivals: sortedRivals.length,
        rivals: sortedRivals, // Pasamos la lista ordenada
      });
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        RIVALS_API_ERROR_STATUS_MAP,
        RIVALS_API_ERROR_FALLBACK,
      );
    }
  }
  /** Builds a dedicated rival item section using explicit configuration mapping. */
  private buildRivalSection(
    baseRival: BaseRival, 
    details: RivalTeamDetails | null, 
    coach: RivalCoach | null //es necesario esto? <<<<-- si se peude enriquecer con PAYLOAD detailsList
  ): RivalTitleItemModel {
    const id = baseRival.id;
    const name = baseRival.name;
    const flag = details?.flag;
    const confederation = this.normalizeConfederation(details);
    const overallRating = details?.rating;
    const captain = details?.captain?.trim();
    const strategy = details?.strategy;
    const formation = details?.formation;
    const coachName = details?.coach;

    return new RivalTitleItemModel({
      id,
      name,
      flag,
      confederation,
      overallRating,
      captain,
      strategy,
      formation,
      coachName,
    });
  }
  
  private normalizeConfederation(details: RivalTeamDetails | null): string {
    const rawConfederation = details?.footballAssociation || details?.groupName || 'N/A';
    return rawConfederation
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toUpperCase();
  }
  private sortRivalsAlphabetically(
    rivals: RivalTitleItemModel[],
    lang: string
  ): RivalTitleItemModel[] {
    return rivals.sort((leftRival, rightRival) => {
      const nameLeft = leftRival.name || '';
      const nameRight = rightRival.name || '';
      
      return nameLeft.localeCompare(nameRight, lang, { sensitivity: 'base' });
    });
  }



}
