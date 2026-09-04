import { HttpStatus, Injectable } from "@nestjs/common";
import { AdminService } from "../../admin/admin.service";
import { AbstractBaseService } from "../../basic/abstract-base.service";
import {
  ApiErrorMappingRule,
  ApiErrorStatusMap,
  ErrorUtils,
} from "../../basic/error/error.utils";
import { LanguageEnum } from "../../basic/model/language.enum";
import { WorldCupCoreErrorCode } from "../../basic/model/world-cup-core-error-code.enum";
import { WorldCupFeatureApiService } from "../../basic/world-cup-feature-api.service";
import {
  JourneyMatchRawApiItem,
  JourneyRawApiResponse,
  JourneyScreen,
  JourneyTimelineItem,
} from "./model/journey-service.interface";

const JOURNEY_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_JOURNEY_UNAVAILABLE,
    message: "Journey data for the selected team was not found.",
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_JOURNEY_UNAVAILABLE,
    message:
      "Journey data is not available right now. Simulate a world cup first.",
    statusCode: HttpStatus.CONFLICT,
  },
};

const JOURNEY_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_JOURNEY_UNAVAILABLE,
  message: "Unable to load journey data from World Cup API.",
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class JourneyService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getJourney(lang?: string): Promise<JourneyScreen> {
    try {
      const teamId = this.getCurrentTeamId();
      const resolvedLang = this.resolveLang(lang);
      const raw = await this.worldCupFeatureApiService.getTeamJourney(
        teamId,
        resolvedLang,
      );
      return this.buildJourneyModel(raw, resolvedLang);
    } catch (error) {
      ErrorUtils.mapWorldCupApiError(
        error,
        JOURNEY_API_ERROR_STATUS_MAP,
        JOURNEY_API_ERROR_FALLBACK,
      );
    }
  }

  private buildJourneyModel(
    raw: JourneyRawApiResponse,
    lang: LanguageEnum,
  ): JourneyScreen {
    const matches = this.mapMatches(raw?.matches ?? [], lang);
    const matchesPlayed = matches.filter((match) => !match.isPending).length;

    return {
      worldCupId: raw.worldCupId,
      teamId: raw.teamId,
      teamName: raw.teamName,
      lang,
      worldCupStatus: raw.worldCupStatus,
      stageReached: raw.stageReached,
      stageReachedLabel: this.getStageLabel(raw.stageReached, lang),
      isChampion: Boolean(raw.isChampion),
      isFinalPending: Boolean(raw.isFinalPending),
      eliminatedByTeamId: raw.eliminatedByTeamId ?? null,
      eliminatedByTeamName: raw.eliminatedByTeamName ?? null,
      summary: raw.summary ?? "",
      matchesPlayed,
      matches,
    };
  }

  private mapMatches(
    rawMatches: JourneyMatchRawApiItem[],
    lang: LanguageEnum,
  ): JourneyTimelineItem[] {
    return rawMatches.map((rawMatch) => this.mapMatch(rawMatch, lang));
  }

  private mapMatch(
    rawMatch: JourneyMatchRawApiItem,
    lang: LanguageEnum,
  ): JourneyTimelineItem {
    const isPending = Boolean(rawMatch.isPending);
    const result = (rawMatch.result ?? "").trim().toUpperCase();

    return {
      stage: rawMatch.stage,
      stageLabel: this.getStageLabel(rawMatch.stage, lang),
      matchCode: rawMatch.matchCode,
      opponentTeamId: rawMatch.opponentTeamId,
      opponentTeamName: rawMatch.opponentTeamName,
      opponentFlag: "",
      goalsFor: rawMatch.goalsFor ?? null,
      goalsAgainst: rawMatch.goalsAgainst ?? null,
      scoreLabel: this.buildScoreLabel(
        rawMatch.goalsFor,
        rawMatch.goalsAgainst,
        isPending,
        lang,
      ),
      result,
      resultLabel: this.getResultLabel(result, isPending, lang),
      resultStyle: this.getResultStyle(result, isPending),
      resolution: rawMatch.resolution,
      resolutionLabel: this.getResolutionLabel(
        rawMatch.resolution,
        isPending,
        lang,
      ),
      isPending,
    };
  }

  private getStageLabel(stage: string, lang: LanguageEnum): string {
    const labels: Record<string, { es: string; en: string }> = {
      GROUP_STAGE: { es: "Fase de Grupos", en: "Group Stage" },
      ROUND_OF_32: { es: "Ronda de 32", en: "Round of 32" },
      ROUND_OF_16: { es: "Octavos de Final", en: "Round of 16" },
      QUARTER_FINALS: { es: "Cuartos de Final", en: "Quarter-Finals" },
      SEMI_FINALS: { es: "Semifinal", en: "Semi-Finals" },
      THIRD_PLACE: { es: "Tercer Puesto", en: "Third Place" },
      FINAL: { es: "Final", en: "Final" },
      CHAMPION: { es: "Campeón", en: "Champion" },
    };

    const pair = labels[(stage ?? "").trim().toUpperCase()];
    if (!pair) {
      return stage;
    }

    return lang === LanguageEnum.EN ? pair.en : pair.es;
  }

  private getResultLabel(
    result: string,
    isPending: boolean,
    lang: LanguageEnum,
  ): string {
    if (isPending) {
      return lang === LanguageEnum.EN ? "Pending" : "Pendiente";
    }

    const labels: Record<string, { es: string; en: string }> = {
      WIN: { es: "Victoria", en: "Win" },
      LOSS: { es: "Derrota", en: "Loss" },
      DRAW: { es: "Empate", en: "Draw" },
    };

    const pair = labels[result];
    if (!pair) {
      return result;
    }

    return lang === LanguageEnum.EN ? pair.en : pair.es;
  }

  private getResultStyle(result: string, isPending: boolean): string {
    if (isPending || result === "PENDING") {
      return "PENDING";
    }

    return ["WIN", "LOSS", "DRAW"].includes(result) ? result : "PENDING";
  }

  private getResolutionLabel(
    resolution: string,
    isPending: boolean,
    lang: LanguageEnum,
  ): string {
    if (isPending) {
      return lang === LanguageEnum.EN ? "Pending" : "Pendiente";
    }

    const labels: Record<string, { es: string; en: string }> = {
      REGULAR_TIME: { es: "Tiempo Regular", en: "Regular Time" },
      EXTRA_TIME: { es: "Tiempo Extra", en: "Extra Time" },
      PENALTIES: { es: "Penales", en: "Penalties" },
      PENDING: { es: "Pendiente", en: "Pending" },
    };

    const pair = labels[(resolution ?? "").trim().toUpperCase()];
    if (!pair) {
      return resolution;
    }

    return lang === LanguageEnum.EN ? pair.en : pair.es;
  }

  private buildScoreLabel(
    goalsFor: number | null,
    goalsAgainst: number | null,
    isPending: boolean,
    lang: LanguageEnum,
  ): string {
    if (isPending) {
      return lang === LanguageEnum.EN ? "Pending" : "Pendiente";
    }

    if (goalsFor === null || goalsAgainst === null) {
      return "-";
    }

    return `${goalsFor} - ${goalsAgainst}`;
  }
}
