import {HttpStatus, Injectable} from '@nestjs/common';
import { AdminService } from "../../admin/admin.service";
import { AbstractBaseService } from "../../basic/abstract-base.service";
import { WorldCupFeatureApiService} from "../../basic/world-cup-feature-api.service";
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from "../../basic/error/error.utils";
import { WorldCupCoreErrorCode } from "../../basic/model/world-cup-core-error-code.enum";
import {
    GroupApiItem,
    GroupTeamApiItem,
    GroupTeamRow,
    GroupTableApiItem,
    GroupsApiResponse,
    QualificationBadge,
} from './model/groups-service.interface';

const GROUPS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
    [HttpStatus.NOT_FOUND]: {
        messageCode: WorldCupCoreErrorCode.WC_GROUPS_UNAVAILABLE,
        message: 'Groups data for the current world cup not found.',
    },
    [HttpStatus.CONFLICT]: {
        messageCode: WorldCupCoreErrorCode.WC_GROUPS_UNAVAILABLE,
        message: 'Group data is not available right now. Try again in a moment.',
    },
};

const GROUPS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
        messageCode: WorldCupCoreErrorCode.WC_GROUPS_UNAVAILABLE,
        message: 'Groups data for the current world cup not found.',
        statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class GroupsService extends AbstractBaseService {

    constructor(
        private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
        adminService: AdminService

    ) {
        super(adminService);
    }

    public async getGroups(lang?: string): Promise<GroupsApiResponse> {

        try {
            const teamId = this.getCurrentTeamId();
            const [currentWorldCup, groupsRaw] = await Promise.all([
                this.worldCupFeatureApiService.getCurrentWorldCup(lang),
                this.worldCupFeatureApiService.getCurrentWorldCupGroups(lang),
            ]);

            const groups = groupsRaw.map((rawGroup) => this.mapGroup(rawGroup, teamId));
            const selectedGroup = groups.find((g) => g.teams.some((t) => t.isSelectedTeam))?.group ?? null;

            return {
                teamId,
                worldCupId: currentWorldCup.worldCupId ?? null,
                worldCupStatus: currentWorldCup.status ?? null,
                selectedGroup,
                groups,
            };

        } catch (error) {
            ErrorUtils.mapWorldCupApiError(error, GROUPS_API_ERROR_STATUS_MAP, GROUPS_API_ERROR_FALLBACK);
        }
    }

    private mapTeam(rawTeam: GroupTeamApiItem, selectedTeamId: string): GroupTeamRow {
        const goalDifferenceLabel = rawTeam.goalDifference > 0
            ? `+${rawTeam.goalDifference}`
            : `${rawTeam.goalDifference}`;

        const isSelectedTeam = rawTeam.teamId === selectedTeamId;

        let qualificationBadge: QualificationBadge;

        if (rawTeam.isBestThird) {
            qualificationBadge = 'BEST_THIRD';
        } else if (rawTeam.isQualified) {
            qualificationBadge = 'QUALIFIED';
        } else {
            qualificationBadge = 'NONE';
        }

        return {
            ...rawTeam,
            goalDifferenceLabel,
            isSelectedTeam,
            qualificationBadge,
        };
    }

    private mapGroup(rawGroup: GroupApiItem, selectedTeamId: string): GroupTableApiItem {
        const totalPlayed = rawGroup.teams.reduce((sum, t) => sum + t.played, 0);
        const matchesPlayed = totalPlayed / 2;
        const hasBestThird = rawGroup.teams.some((t) => t.isBestThird);
        const teams = rawGroup.teams.map((t) => this.mapTeam(t, selectedTeamId));

        return {
            group: rawGroup.group,
            matchesPlayed,
            hasBestThird,
            teams,
        };
    }
}
