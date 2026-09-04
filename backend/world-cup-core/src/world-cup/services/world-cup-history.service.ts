import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';
import {
  WorldCupAwardsApiResponse,
  WorldCupHistoryApiResponse,
  WorldCupMatchApiResponse,
  WorldCupMetadataApiResponse,
  WorldCupStatsApiResponse,
  FairPlayTeamStats,
} from './model/world-cup-history-service.interface';
import {
  HistoricalFairPlayHighlightItem,
  HistoricalPlayerHighlightItem,
  HistoricalPodiumTeamItem,
  HistoricalWorldCupItem,
  WorldCupHistoryScreenModel,
} from './model/world-cup-history-service.model';

const WORLD_CUP_HISTORY_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_WORLD_CUP_HISTORY_UNAVAILABLE,
    message: 'World cup history was not found.',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_WORLD_CUP_HISTORY_UNAVAILABLE,
    message: 'World cup history is not available right now. Try again in a moment.',
  },
};

const WORLD_CUP_HISTORY_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_WORLD_CUP_HISTORY_UNAVAILABLE,
  message: 'Unable to load world cup history from World Cup API.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class WorldCupHistoryService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }


  // metodo principal de la funcionalidad. Construye el historial consolidado de mundiales finalizados para el frontend.
  public async getWorldCupHistory(): Promise<WorldCupHistoryScreenModel> {
    try {
      const lang = this.resolveLang();
      const history: WorldCupHistoryApiResponse =
        await this.worldCupFeatureApiService.getWorldCupHistory();

      const worldCups: HistoricalWorldCupItem[] = [];

      for (const worldCupId of history.worldCupIds) {
        const metadata: WorldCupMetadataApiResponse =
          await this.worldCupFeatureApiService.getWorldCupMetadata(worldCupId);

        if (metadata.status === 'ENDED') {
          const stats: WorldCupStatsApiResponse =
            await this.worldCupFeatureApiService.getWorldCupStats(worldCupId);

          const awards: WorldCupAwardsApiResponse =
            await this.worldCupFeatureApiService.getWorldCupAwards(worldCupId, lang);

          const matches: WorldCupMatchApiResponse[] =
            await this.worldCupFeatureApiService.getWorldCupMatches(worldCupId);

          const finalMatches: WorldCupMatchApiResponse[] =
            await this.worldCupFeatureApiService.getWorldCupMatches(worldCupId, 'FINAL');

          const finalMatch: WorldCupMatchApiResponse = finalMatches[0];

          const worldCup = this.buildHistoricalWorldCupItem(
            metadata,
            stats,
            awards,
            matches,
            finalMatch,
          );

          worldCups.push(worldCup);
        }
      }

      return new WorldCupHistoryScreenModel({
        teamId: this.getCurrentTeamId(),
        lang,
        totalWorldCups: worldCups.length,
        worldCups,
      });
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        WORLD_CUP_HISTORY_API_ERROR_STATUS_MAP,
        WORLD_CUP_HISTORY_API_ERROR_FALLBACK,
      );
    }
  }


  // metodo auxiliar para obtener la metadata cruda de un mundial dado su id.
  public async getWorldCupMetadata(worldCupId: string): Promise<WorldCupMetadataApiResponse> {
    return this.worldCupFeatureApiService.getWorldCupMetadata(worldCupId);
  }

  // metodo auxiliar para obtener las estadisticas crudas de un mundial dado su id.
  public async getWorldCupStats(worldCupId: string): Promise<WorldCupStatsApiResponse> {
    return this.worldCupFeatureApiService.getWorldCupStats(worldCupId);
  }

  // metodo auxiliar para obtener los premios crudos de un mundial dado su id.
  public async getWorldCupAwards(
    worldCupId: string,
    lang?: string,
  ): Promise<WorldCupAwardsApiResponse> {
    return this.worldCupFeatureApiService.getWorldCupAwards(worldCupId, lang);
  }

  // metodo auxiliar para obtener los partidos de un mundial dado su id y stage (opcional).
  public async getWorldCupMatches(
    worldCupId: string,
    stage?: string,
  ): Promise<WorldCupMatchApiResponse[]> {
    return this.worldCupFeatureApiService.getWorldCupMatches(worldCupId, stage);
  }

  // construye un item de historial combinando metadata, estadisticas y premios de un mundial.
  private buildHistoricalWorldCupItem(
    metadata: WorldCupMetadataApiResponse,
    stats: WorldCupStatsApiResponse,
    awards: WorldCupAwardsApiResponse,
    matches: WorldCupMatchApiResponse[],
    finalMatch: WorldCupMatchApiResponse,
  ): HistoricalWorldCupItem {
    const totalRankedTeams = this.getTotalRankedTeams(matches);

    return new HistoricalWorldCupItem({
      worldCupId: metadata.worldCupId,
      worldCupIdShort: this.buildWorldCupIdShort(
        metadata.edition,
        metadata.worldCupId,
      ),
      finalPlayedAt: metadata.updatedAt ?? null,
      finalPlayedAtLabel: this.buildDateLabel(metadata.updatedAt ?? null),
      edition: metadata.edition,
      editionLabel: `Mundial ${metadata.edition}`,
      status: metadata.status,
      statusLabel: this.getStatusLabel(metadata.status),

      champion: this.buildPodiumTeam(stats.champion),
      runnerUp: this.buildPodiumTeam(stats.runnerUp),
      thirdPlace: this.buildPodiumTeam(stats.thirdPlace),
      fourthPlace: this.buildPodiumTeam(stats.fourthPlace),

      totalMatches: stats.totalMatches,
      totalGoals: stats.totalGoals,
      avgGoalsPerMatch: stats.avgGoalsPerMatch,
      yellowCards: stats.cards.totalYellowCards,
      redCards: stats.cards.totalRedCards,

      finalScoreLabel: this.buildFinalScoreLabel(finalMatch),
      finalResolutionLabel: this.buildFinalResolutionLabel(finalMatch.resolution),

      topScorer: this.buildPlayerHighlight(stats.topScorers[0]),
      topAssist: this.buildPlayerHighlight(stats.topAssists[0]),

      fairPlay: this.buildFairPlayHighlight(awards, totalRankedTeams),
      worstFairPlay: this.getWorstFairPlay(matches),
    });
  }

  // genera un ID corto para cada mundial.
  // como puede haber varias simulaciones con la misma edicion, construye un id con la edicion y con parte del ID largo
  private buildWorldCupIdShort(
    edition: number,
    worldCupId: string,
  ): string {
    return `WC-${edition}-${worldCupId.slice(-8)}`;
  }

  // construye la informacion de un equipo del podio.
  private buildPodiumTeam(team: {
    teamId?: string;
    teamName?: string;
  }): HistoricalPodiumTeamItem {
    return new HistoricalPodiumTeamItem({
      teamId: team.teamId,
      teamName: team.teamName,
      flag: ' ', // esto lo resuelvo en el fontend a partir del teamId, no viene en la API.
      hasData: true,
    });
  }

  // construye la informacion destacada de un jugador.
  private buildPlayerHighlight(player: {
    playerName?: string;
    teamId?: string;
    teamName?: string;
    value?: number;
  }): HistoricalPlayerHighlightItem {
    return new HistoricalPlayerHighlightItem({
      playerName: player.playerName,
      teamId: player.teamId,
      teamName: player.teamName,
      teamFlag: ' ', // esto lo resuelvo en el fontend a partir del teamId, no viene en la API.
      value: player.value,
      hasData: true,
    });
  }

  // construye la informacion del premio fair play.
  private buildFairPlayHighlight(
    awards: WorldCupAwardsApiResponse,
    totalRankedTeams: number,
  ): HistoricalFairPlayHighlightItem {
    const fairPlayAward = awards.awards.find((award) => award.code === 'FAIR_PLAY');

    return new HistoricalFairPlayHighlightItem({
      teamId: fairPlayAward.teamId,
      teamName: fairPlayAward.teamName,
      teamFlag: ' ', // esto lo resuelvo en el fontend a partir del teamId, no viene en la API.
      fairPlayPoints: fairPlayAward.fairPlayPoints,
      yellowCards: fairPlayAward.yellowCards,
      redCards: fairPlayAward.redCards,
      fairPlayRank: 1,
      totalRankedTeams,
      hasData: true,
    });
  }

  private getStatusLabel(status: string): string {
    switch ((status ?? '').trim().toUpperCase()) {
      case 'READY_FOR_FINAL':
        return 'Lista para la final';

      case 'FINAL_ACTIVE':
        return 'Final en juego';

      case 'ENDED':
        return 'Finalizado';

      default:
        return status;
    }
  }

  private buildFinalScoreLabel(finalMatch: WorldCupMatchApiResponse): string {
    return `${finalMatch.homeTeamName} ${finalMatch.homeGoals} - ${finalMatch.awayGoals} ${finalMatch.awayTeamName}`;
  }

  private buildFinalResolutionLabel(resolution: string): string {
    switch ((resolution ?? '').trim().toUpperCase()) {
      case 'REGULAR_TIME':
        return 'Tiempo reglamentario';

      case 'EXTRA_TIME':
        return 'Tiempo suplementario';

      case 'PENALTIES':
        return 'Penales';

      default:
        return resolution;
    }
  }

  // construyo un DateLabel porque la fecha en formato ISO no es amigable para mostrar en el frontend.
  private buildDateLabel(dateString: string | null): string | null {
    if (!dateString) {
      return null;
    }

    const date = new Date(dateString);

    return date.toLocaleDateString('es-AR');
  }

  // metodo auxiliar para obtener el equipo con peor Fair Play de un mundial 
  // (este dato no viene primariamente en la API, sino que lo estoy calculando a partir del endpoint world-cup/{worldCupId}/matches).

  private getWorstFairPlay(
    matches: WorldCupMatchApiResponse[],
  ): HistoricalFairPlayHighlightItem {
    const teamsStats: FairPlayTeamStats[] = [];

    for (const match of matches) {
      this.addFairPlayTeamStats(
        teamsStats,
        match.homeTeamId,
        match.homeTeamName,
        match.homeTeamTotalYellowCards,
        match.homeTeamTotalRedCards,
      );

      this.addFairPlayTeamStats(
        teamsStats,
        match.awayTeamId,
        match.awayTeamName,
        match.awayTeamTotalYellowCards,
        match.awayTeamTotalRedCards,
      );
    }

    let worstTeam = teamsStats[0];

    for (const team of teamsStats) {
      const teamFairPlayPoints = this.calculateFairPlayPoints(
        team.yellowCards,
        team.redCards,
      );

      const worstTeamFairPlayPoints = this.calculateFairPlayPoints(
        worstTeam.yellowCards,
        worstTeam.redCards,
      );

      if (teamFairPlayPoints > worstTeamFairPlayPoints) {
        worstTeam = team;
      }
    }

    return new HistoricalFairPlayHighlightItem({
      teamId: worstTeam.teamId,
      teamName: worstTeam.teamName,
      teamFlag: ' ', // esto lo resuelvo en el fontend a partir del teamId, no viene en la API.
      fairPlayPoints: this.calculateFairPlayPoints(
        worstTeam.yellowCards,
        worstTeam.redCards,
      ),
      yellowCards: worstTeam.yellowCards,
      redCards: worstTeam.redCards,
      fairPlayRank: teamsStats.length,
      totalRankedTeams: teamsStats.length,
      hasData: true,
    });
  }
  // metodos auxiliares para calcular el equipo con peor Fair Play.

  private getTotalRankedTeams(matches: WorldCupMatchApiResponse[]): number {
    const teamIds: string[] = [];

    for (const match of matches) {
      if (!teamIds.includes(match.homeTeamId)) {
        teamIds.push(match.homeTeamId);
      }

      if (!teamIds.includes(match.awayTeamId)) {
        teamIds.push(match.awayTeamId);
      }
    }

    return teamIds.length;
  }

  private addFairPlayTeamStats(
    teamsStats: FairPlayTeamStats[],
    teamId: string,
    teamName: string,
    yellowCards: number,
    redCards: number,
  ): void {
    const teamStats = teamsStats.find((team) => team.teamId === teamId);

    if (teamStats) {
      teamStats.yellowCards += yellowCards;
      teamStats.redCards += redCards;
      return;
    }

    teamsStats.push({
      teamId,
      teamName,
      yellowCards,
      redCards,
    });
  }
  private calculateFairPlayPoints(
    yellowCards: number,
    redCards: number,
  ): number {
    return yellowCards + redCards * 3;
  }

}