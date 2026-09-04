import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AbstractBaseService } from 'src/basic/abstract-base.service';
import { WorldCupFeatureApiService } from 'src/basic/world-cup-feature-api.service';
import { AwardsApiItem, CurrentStatsApiResponse, PlayerApiItem, StatsAwardItem, StatsLeaderboardItem, StatsPodiumItem, WorldCupStatsAwardsApiResponse } from './model/stats-awards-service.interface';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from 'src/basic/error/error.utils';
import { WorldCupCoreErrorCode } from 'src/basic/model/world-cup-core-error-code.enum';

const STATS_UNAVAILABLE_MESSAGE =  
  'World Cup statistics are not available until the tournament ends.';

const STATS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_STATS_FETCH_FAILED,
  message: 'Unable to load statistics data from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

const STATS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_STATS_UNAVAILABLE,
    message: STATS_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT
  }
}


@Injectable()
export class StatsAwardsService extends AbstractBaseService {

  constructor (
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService) {
      super(adminService);
    }
    
  public async getStatsAwards(lang?: string): Promise<WorldCupStatsAwardsApiResponse> {

    try {
      const current = await this.worldCupFeatureApiService.getCurrentWorldCup(lang);

      if(current.status !== "ENDED") {
        throw new HttpException (
          {
            messageCode: WorldCupCoreErrorCode.WC_STATS_UNAVAILABLE,
            message: STATS_UNAVAILABLE_MESSAGE,
          },
          HttpStatus.CONFLICT
        );
      }

    const stats = await this.worldCupFeatureApiService.getCurrentStats(lang);

    const awards = await this.worldCupFeatureApiService.getCurrentAwards(lang);


    return {
      teamId: this.getCurrentTeamId(),
      lang: lang === "en" ? "en" : "es",
      worldCupId: current.worldCupId,
      totalMatches: stats.totalMatches,
      totalGoals: stats.totalGoals,
      avgGoalsPerMatch: stats.avgGoalsPerMatch,
      totalYellowCards: stats.cards.totalYellowCards,
      totalRedCards: stats.cards.totalRedCards,
      podium: this.buildPodium(stats),
      topScorers: this.buildLeaderboard(stats.topScorers),
      topAssists: this.buildLeaderboard(stats.topAssists),
      awards: this.buildAwards(awards),
    };

    } catch(error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        STATS_API_ERROR_STATUS_MAP,
        STATS_API_ERROR_FALLBACK,
      );
    }
  }

  private buildPodium(stats: CurrentStatsApiResponse): StatsPodiumItem[] {
    return [
      {
        place: 'CHAMPION',
        placeLabel: 'Champion',
        medal: '🥇',
        teamId: stats.champion.teamId,
        teamName: stats.champion.teamName,
        flag:  'mock-flag'
      },
      {
        place: 'RUNNER_UP',
        placeLabel: 'Runner-up',
        medal: '🥈',
        teamId: stats.runnerUp.teamId,
        teamName: stats.runnerUp.teamName,
        flag:  'mock-flag'
      },
      {
        place: 'THIRD_PLACE',
        placeLabel: 'Third Place',
        medal: '🥉',
        teamId: stats.thirdPlace.teamId,
        teamName: stats.thirdPlace.teamName,
        flag:  'mock-flag'
      }
    ]
  }

  private buildLeaderboard(players: PlayerApiItem[]): StatsLeaderboardItem[] {
    return players.map((player, index) => ({
      rank: index + 1,
      playerName: player.playerName,
      teamId: player.teamId,
      teamName: player.teamName,
      teamFlag: 'mock-team-flag',
      value: player.value,
    }));
  }

  private buildAwards(awards: AwardsApiItem[]): StatsAwardItem[] {
    return awards.map(award => ({
      code: award.code,
      title: this.getAwardsTitle(award.code),
      icon: "mock-icon",
      winnerName: award.winnerName,
      teamId: award.teamId,
      teamName: award.teamName,
      teamFlag: "mock-team-flag",
      reason: award.reason
    }));
  }

  private getAwardsTitle(code: string): string {
    switch(code) {
      case 'GOLDEN_BALL':
      return 'Golden Ball';

      case 'GOLDEN_BOOT':
        return 'Golden Boot';

      case 'SILVER_BOOT':
        return 'Silver Boot';

      case 'BRONZE_BOOT':
        return 'Bronze Boot';

      case 'GOLDEN_GLOVE':
        return 'Golden Glove';

      case 'FAIR_PLAY':
        return 'Fair Play';

      default:
        return code;
    }
  }
}
