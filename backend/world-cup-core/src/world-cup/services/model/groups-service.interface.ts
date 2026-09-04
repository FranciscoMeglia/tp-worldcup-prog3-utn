export interface GroupTeamApiItem {
    teamId: string;
    teamName: string;
    confederation: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    position: number;
    isQualified: boolean;
    isBestThird: boolean;
}

export interface GroupApiItem {
    group: string;
    teams: GroupTeamApiItem[];
}

export type QualificationBadge = 'QUALIFIED' | 'BEST_THIRD' | 'NONE';

export interface GroupTeamRow extends GroupTeamApiItem {
    goalDifferenceLabel: string;
    isSelectedTeam: boolean;
    qualificationBadge: QualificationBadge;
}

export interface GroupTableApiItem {
    group: string;
    matchesPlayed: number;
    hasBestThird: boolean;
    teams: GroupTeamRow[];
}

export interface GroupsApiResponse {
    teamId: string;
    worldCupId: string | null;
    worldCupStatus: string | null;
    selectedGroup: string | null;
    groups: GroupTableApiItem[];
}


