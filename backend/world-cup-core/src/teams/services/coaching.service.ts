import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import {
  ApiErrorMappingRule,
  ApiErrorStatusMap,
  ErrorUtils,
} from '../../basic/error/error.utils';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';
import { TeamStatsApiResponse } from '../../world-cup/services/model/simulation-service.interface';
import {
  CoachingCompatibilityInfo,
  CoachingOverviewScreen,
  CoachingRatingDeltaItem,
  CoachingRatingItem,
  CoachProfileRawItem,
  CoachRawApiItem,
  CoachingScreenCoach,
  FormationRawItem,
  StrategyRawItem,
} from './model/coaching-service.interface';

const INCOMPATIBILITY_PENALTY = 5;

const COACHING_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_COACHING_UNAVAILABLE,
    message: 'Coaching data for the selected team was not found.',
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_COACHING_UNAVAILABLE,
    message: 'Coaching data is not available right now.',
    statusCode: HttpStatus.CONFLICT,
  },
};

const COACHING_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_COACHING_UNAVAILABLE,
  message: 'Unable to load coaching data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

const TACTICS_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_TACTICS_UPDATE_FAILED,
  message: 'Failed to update team tactics.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class CoachingService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getCoachingOverview(lang?: string): Promise<CoachingOverviewScreen> {
    try {
      const teamId = this.getCurrentTeamId();
      const resolvedLang = this.resolveLang(lang);

      const [coachRaw, stats, profiles, strategies, formations] = await Promise.all([
        this.worldCupFeatureApiService.getTeamCoach(teamId, resolvedLang),
        this.worldCupFeatureApiService.getTeamStats(teamId, resolvedLang),
        this.worldCupFeatureApiService.getCoachProfiles(resolvedLang),
        this.worldCupFeatureApiService.getStrategiesCatalog(resolvedLang),
        this.worldCupFeatureApiService.getFormationsCatalog(resolvedLang),
      ]);

      const coach: CoachRawApiItem = Array.isArray(coachRaw) ? coachRaw[0] : coachRaw;

      return this.buildOverview(teamId, coach, stats, profiles, strategies, formations);
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, COACHING_ERROR_STATUS_MAP, COACHING_ERROR_FALLBACK);
    }
  }

  public async selectStrategy(strategy: string): Promise<void> {
    try {
      const teamId = this.getCurrentTeamId();
      await this.worldCupFeatureApiService.selectStrategy(teamId, strategy);
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, {} as ApiErrorStatusMap, TACTICS_ERROR_FALLBACK);
    }
  }

  public async selectFormation(formation: string): Promise<void> {
    try {
      const teamId = this.getCurrentTeamId();
      await this.worldCupFeatureApiService.selectFormation(teamId, formation);
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, {} as ApiErrorStatusMap, TACTICS_ERROR_FALLBACK);
    }
  }

  public async resetTactics(): Promise<void> {
    try {
      const teamId = this.getCurrentTeamId();
      await this.worldCupFeatureApiService.resetTeamTactics(teamId);
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(error, {} as ApiErrorStatusMap, TACTICS_ERROR_FALLBACK);
    }
  }

  private buildOverview(
    teamId: string,
    coach: CoachRawApiItem,
    stats: TeamStatsApiResponse,
    profiles: CoachProfileRawItem[],
    strategies: StrategyRawItem[],
    formations: FormationRawItem[],
  ): CoachingOverviewScreen {
    const currentStrategy = stats?.current_strategy ?? '';
    const currentFormation = stats?.current_formation ?? '';

    const profilesArr: CoachProfileRawItem[] = Array.isArray(profiles) ? profiles : [];
    const strategiesArr: StrategyRawItem[] = Array.isArray(strategies) ? strategies : [];
    const formationsArr: FormationRawItem[] = Array.isArray(formations) ? formations : [];

    const enrichedCoach = this.enrichCoach(coach, profilesArr);

    const strategyObj = strategiesArr.find((s) => s.strategy === currentStrategy);
    const formationObj = formationsArr.find((f) => f.formation === currentFormation);

    const compatibleFormations = strategyObj?.compatibleFormations ?? [];
    const compatibleStrategies = formationObj?.compatibleStrategies ?? [];
    const isCompatible = currentFormation
      ? compatibleFormations.includes(currentFormation)
      : true;

    const compatibility = this.buildCompatibility(
      currentStrategy,
      currentFormation,
      compatibleFormations,
      compatibleStrategies,
      strategiesArr,
      formationsArr,
      isCompatible,
    );

    const penalty = isCompatible ? 0 : INCOMPATIBILITY_PENALTY;
    const impact = strategyObj?.strategyLineImpact;
    const deltaAttack = impact?.attack ?? 0;
    const deltaDefense = impact?.defense ?? 0;
    const deltaMidfield = impact?.midfield ?? 0;
    const deltaOverall = Math.round((deltaAttack + deltaDefense + deltaMidfield) / 3);

    const baseAttack = stats?.attack ?? 0;
    const baseDefense = stats?.defense ?? 0;
    const baseMidfield = stats?.midfield ?? 0;
    const baseOverall = stats?.overall ?? 0;

    const baseRatings: CoachingRatingItem[] = [
      { metric: 'attack', value: baseAttack },
      { metric: 'defense', value: baseDefense },
      { metric: 'midfield', value: baseMidfield },
      { metric: 'overall', value: baseOverall },
    ];

    const effectiveRatings: CoachingRatingItem[] = [
      { metric: 'attack', value: Math.max(0, baseAttack + deltaAttack - penalty) },
      { metric: 'defense', value: Math.max(0, baseDefense + deltaDefense - penalty) },
      { metric: 'midfield', value: Math.max(0, baseMidfield + deltaMidfield - penalty) },
      { metric: 'overall', value: Math.max(0, baseOverall + deltaOverall - penalty) },
    ];

    const ratingDeltas: CoachingRatingDeltaItem[] = [
      { metric: 'attack', strategyDelta: deltaAttack, compatibilityPenalty: -penalty, totalDelta: deltaAttack - penalty },
      { metric: 'defense', strategyDelta: deltaDefense, compatibilityPenalty: -penalty, totalDelta: deltaDefense - penalty },
      { metric: 'midfield', strategyDelta: deltaMidfield, compatibilityPenalty: -penalty, totalDelta: deltaMidfield - penalty },
      { metric: 'overall', strategyDelta: deltaOverall, compatibilityPenalty: -penalty, totalDelta: deltaOverall - penalty },
    ];

    return {
      teamId,
      coach: enrichedCoach,
      strategy: currentStrategy ? { teamId, strategy: currentStrategy } : null,
      formation: currentFormation ? { teamId, formation: currentFormation } : null,
      stats: stats
        ? {
            attack: baseAttack,
            defense: baseDefense,
            midfield: baseMidfield,
            overall: baseOverall,
            current_strategy: currentStrategy,
            current_formation: currentFormation,
          }
        : null,
      baseRatings,
      effectiveRatings,
      ratingDeltas,
      strategyPenalty: penalty,
      strategies: strategiesArr,
      formations: formationsArr,
      compatibility,
    };
  }

  private enrichCoach(
    coach: CoachRawApiItem,
    profiles: CoachProfileRawItem[],
  ): CoachingScreenCoach | null {
    if (!coach) return null;
    const profile = profiles.find((p) => p.profileCode === coach.profile);
    return {
      ...coach,
      profileLabel: profile?.label,
      profileDescription: profile?.description,
    };
  }

  private buildCompatibility(
    selectedStrategy: string,
    selectedFormation: string,
    compatibleFormations: string[],
    compatibleStrategies: string[],
    strategies: StrategyRawItem[],
    formations: FormationRawItem[],
    isCompatible: boolean,
  ): CoachingCompatibilityInfo {
    const byStrategy: Record<string, string[]> = {};
    for (const s of strategies) {
      byStrategy[s.strategy] = s.compatibleFormations ?? [];
    }

    const byFormation: Record<string, string[]> = {};
    for (const f of formations) {
      byFormation[f.formation] = f.compatibleStrategies ?? [];
    }

    return {
      selectedStrategy,
      selectedFormation,
      compatibleFormations,
      compatibleStrategies,
      byStrategy,
      byFormation,
      isSelectedPairCompatible: isCompatible,
    };
  }
}